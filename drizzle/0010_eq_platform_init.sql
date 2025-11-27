-- EQ Platform Initial Schema Migration
-- This creates all tables for the EQ testing and improvement platform

-- ============================================================================
-- DROP OLD PHENOTYPE TABLES (if they exist)
-- ============================================================================
DROP TABLE IF EXISTS phenotype_content CASCADE;
DROP TABLE IF EXISTS report_sections CASCADE;
DROP TABLE IF EXISTS user_downloads CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS reports CASCADE;
DROP TABLE IF EXISTS analysis_history CASCADE;
DROP TABLE IF EXISTS user_uploads CASCADE;
DROP TABLE IF EXISTS phenotype_hierarchy CASCADE;
DROP TABLE IF EXISTS geographic_tags CASCADE;
DROP TABLE IF EXISTS similar_phenotypes CASCADE;
DROP TABLE IF EXISTS phenotypes CASCADE;
DROP TABLE IF EXISTS haplogroups CASCADE;
DROP TABLE IF EXISTS todos CASCADE;

-- ============================================================================
-- EQ DOMAIN TABLES
-- ============================================================================

-- The 5 core EQ domains (based on Goleman's model)
CREATE TABLE IF NOT EXISTS eq_domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT,
  color TEXT,
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Sub-skills within each domain
CREATE TABLE IF NOT EXISTS eq_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain_id UUID NOT NULL REFERENCES eq_domains(id) ON DELETE CASCADE,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  tips JSONB,
  exercises JSONB,
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
CREATE INDEX IF NOT EXISTS eq_skills_domain_idx ON eq_skills(domain_id);

-- ============================================================================
-- ASSESSMENT & QUESTION TABLES
-- ============================================================================

-- Assessment types
CREATE TABLE IF NOT EXISTS assessment_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  question_count INTEGER NOT NULL,
  estimated_minutes INTEGER NOT NULL,
  is_premium BOOLEAN DEFAULT FALSE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Question bank
CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_type_id UUID REFERENCES assessment_types(id) ON DELETE SET NULL,
  domain_id UUID NOT NULL REFERENCES eq_domains(id) ON DELETE CASCADE,
  skill_id UUID REFERENCES eq_skills(id) ON DELETE SET NULL,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL DEFAULT 'likert',
  scenario TEXT,
  options JSONB,
  is_reversed BOOLEAN DEFAULT FALSE NOT NULL,
  weight REAL DEFAULT 1.0 NOT NULL,
  difficulty TEXT DEFAULT 'medium',
  tags JSONB,
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
CREATE INDEX IF NOT EXISTS questions_domain_idx ON questions(domain_id);
CREATE INDEX IF NOT EXISTS questions_assessment_type_idx ON questions(assessment_type_id);

-- ============================================================================
-- USER ASSESSMENT TABLES
-- ============================================================================

-- User assessment sessions
CREATE TABLE IF NOT EXISTS assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  assessment_type_id UUID NOT NULL REFERENCES assessment_types(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'in_progress',
  started_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  completed_at TIMESTAMPTZ,
  overall_score REAL,
  domain_scores JSONB,
  skill_scores JSONB,
  percentile INTEGER,
  time_taken INTEGER
);
CREATE INDEX IF NOT EXISTS assessments_user_idx ON assessments(user_id);
CREATE INDEX IF NOT EXISTS assessments_status_idx ON assessments(status);

-- Individual question responses
CREATE TABLE IF NOT EXISTS assessment_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  response INTEGER NOT NULL,
  response_time INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
CREATE INDEX IF NOT EXISTS assessment_responses_assessment_idx ON assessment_responses(assessment_id);

-- ============================================================================
-- PREMIUM REPORTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'preview',
  payment_id TEXT,
  amount_paid BIGINT,
  sections JSONB,
  generated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  accessed_count BIGINT DEFAULT 0,
  last_accessed TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS reports_user_idx ON reports(user_id);

-- ============================================================================
-- GAMIFICATION TABLES
-- ============================================================================

-- User profiles with gamification stats
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL UNIQUE,
  level INTEGER DEFAULT 1 NOT NULL,
  xp INTEGER DEFAULT 0 NOT NULL,
  xp_to_next_level INTEGER DEFAULT 100 NOT NULL,
  current_streak INTEGER DEFAULT 0 NOT NULL,
  longest_streak INTEGER DEFAULT 0 NOT NULL,
  last_activity_date TIMESTAMPTZ,
  total_assessments INTEGER DEFAULT 0 NOT NULL,
  total_games_played INTEGER DEFAULT 0 NOT NULL,
  total_exercises_completed INTEGER DEFAULT 0 NOT NULL,
  daily_reminder_enabled BOOLEAN DEFAULT FALSE NOT NULL,
  reminder_time TEXT,
  focus_areas JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Badge definitions
CREATE TABLE IF NOT EXISTS badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  category TEXT NOT NULL,
  requirement JSONB,
  xp_reward INTEGER DEFAULT 10 NOT NULL,
  is_secret BOOLEAN DEFAULT FALSE NOT NULL,
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- User earned badges
CREATE TABLE IF NOT EXISTS user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
CREATE INDEX IF NOT EXISTS user_badges_user_idx ON user_badges(user_id);

-- ============================================================================
-- DAILY ACTIVITIES & GAMES
-- ============================================================================

-- Daily challenges
CREATE TABLE IF NOT EXISTS daily_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date TIMESTAMPTZ NOT NULL UNIQUE,
  challenge_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  content JSONB,
  xp_reward INTEGER DEFAULT 25 NOT NULL,
  domain_id UUID REFERENCES eq_domains(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- User daily challenge completions
CREATE TABLE IF NOT EXISTS daily_challenge_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  challenge_id UUID NOT NULL REFERENCES daily_challenges(id) ON DELETE CASCADE,
  response JSONB,
  score INTEGER,
  completed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
CREATE INDEX IF NOT EXISTS daily_completions_user_idx ON daily_challenge_completions(user_id);
CREATE INDEX IF NOT EXISTS daily_completions_challenge_idx ON daily_challenge_completions(challenge_id);

-- Mini-games
CREATE TABLE IF NOT EXISTS games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  instructions TEXT,
  game_type TEXT NOT NULL,
  domain_id UUID REFERENCES eq_domains(id) ON DELETE SET NULL,
  is_premium BOOLEAN DEFAULT FALSE NOT NULL,
  difficulty TEXT DEFAULT 'medium',
  estimated_minutes INTEGER DEFAULT 5,
  xp_reward INTEGER DEFAULT 15 NOT NULL,
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Game content/rounds
CREATE TABLE IF NOT EXISTS game_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  content JSONB,
  difficulty TEXT DEFAULT 'medium',
  "order" INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
CREATE INDEX IF NOT EXISTS game_content_game_idx ON game_content(game_id);

-- User game sessions
CREATE TABLE IF NOT EXISTS game_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  score INTEGER DEFAULT 0 NOT NULL,
  max_score INTEGER DEFAULT 0 NOT NULL,
  accuracy REAL,
  time_taken INTEGER,
  rounds_completed INTEGER DEFAULT 0 NOT NULL,
  xp_earned INTEGER DEFAULT 0 NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
CREATE INDEX IF NOT EXISTS game_sessions_user_idx ON game_sessions(user_id);
CREATE INDEX IF NOT EXISTS game_sessions_game_idx ON game_sessions(game_id);

-- ============================================================================
-- LEARNING CONTENT
-- ============================================================================

CREATE TABLE IF NOT EXISTS learning_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  summary TEXT,
  content TEXT NOT NULL,
  content_type TEXT NOT NULL,
  domain_id UUID REFERENCES eq_domains(id) ON DELETE SET NULL,
  skill_id UUID REFERENCES eq_skills(id) ON DELETE SET NULL,
  media_url TEXT,
  thumbnail_url TEXT,
  duration INTEGER,
  is_premium BOOLEAN DEFAULT FALSE NOT NULL,
  difficulty TEXT DEFAULT 'beginner',
  tags JSONB,
  xp_reward INTEGER DEFAULT 10 NOT NULL,
  published_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS learning_content_domain_idx ON learning_content(domain_id);
CREATE INDEX IF NOT EXISTS learning_content_type_idx ON learning_content(content_type);

-- User learning progress
CREATE TABLE IF NOT EXISTS user_learning_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  content_id UUID NOT NULL REFERENCES learning_content(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'not_started',
  progress INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS user_learning_user_idx ON user_learning_progress(user_id);
CREATE INDEX IF NOT EXISTS user_learning_content_idx ON user_learning_progress(content_id);

-- ============================================================================
-- EMOTION TRACKING
-- ============================================================================

CREATE TABLE IF NOT EXISTS emotion_check_ins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  emotion TEXT NOT NULL,
  intensity INTEGER NOT NULL,
  secondary_emotions JSONB,
  triggers JSONB,
  notes TEXT,
  context TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
CREATE INDEX IF NOT EXISTS emotion_check_ins_user_idx ON emotion_check_ins(user_id);
CREATE INDEX IF NOT EXISTS emotion_check_ins_date_idx ON emotion_check_ins(created_at);

-- ============================================================================
-- PAYMENTS & SUBSCRIPTIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  report_id UUID REFERENCES reports(id) ON DELETE SET NULL,
  stripe_payment_intent_id TEXT,
  amount BIGINT NOT NULL,
  currency TEXT NOT NULL DEFAULT 'usd',
  status TEXT NOT NULL DEFAULT 'pending',
  product_type TEXT DEFAULT 'report',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  metadata JSONB
);
CREATE INDEX IF NOT EXISTS payments_user_idx ON payments(user_id);

-- Drop and recreate subscriptions with new fields
DROP TABLE IF EXISTS subscriptions CASCADE;
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL UNIQUE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  plan TEXT NOT NULL DEFAULT 'free',
  status TEXT NOT NULL DEFAULT 'none',
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE NOT NULL,
  features JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- SEED DATA: EQ DOMAINS
-- ============================================================================

INSERT INTO eq_domains (slug, name, description, icon, color, "order") VALUES
('self-awareness', 'Self-Awareness', 'The ability to recognize and understand your own emotions, strengths, weaknesses, values, and drivers, and their impact on others.', 'eye', '#8B5CF6', 1),
('self-regulation', 'Self-Regulation', 'The ability to control or redirect disruptive impulses and moods, and the propensity to suspend judgment and think before acting.', 'shield', '#3B82F6', 2),
('motivation', 'Motivation', 'A passion for work that goes beyond money and status, and a propensity to pursue goals with energy and persistence.', 'flame', '#F59E0B', 3),
('empathy', 'Empathy', 'The ability to understand the emotional makeup of other people and skill in treating people according to their emotional reactions.', 'heart', '#EC4899', 4),
('social-skills', 'Social Skills', 'Proficiency in managing relationships and building networks, and an ability to find common ground and build rapport.', 'users', '#10B981', 5)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- SEED DATA: EQ SKILLS (Sub-skills for each domain)
-- ============================================================================

-- Self-Awareness Skills
INSERT INTO eq_skills (domain_id, slug, name, description, tips, "order")
SELECT id, 'emotional-awareness', 'Emotional Awareness', 'Recognizing your emotions and their effects on your thoughts and behavior.',
  '["Practice naming your emotions throughout the day", "Keep an emotion journal", "Notice physical sensations associated with emotions"]'::jsonb, 1
FROM eq_domains WHERE slug = 'self-awareness';

INSERT INTO eq_skills (domain_id, slug, name, description, tips, "order")
SELECT id, 'accurate-self-assessment', 'Accurate Self-Assessment', 'Knowing your strengths and limitations with a grounded sense of confidence.',
  '["Seek honest feedback from trusted others", "Reflect on past successes and failures", "Take personality assessments"]'::jsonb, 2
FROM eq_domains WHERE slug = 'self-awareness';

INSERT INTO eq_skills (domain_id, slug, name, description, tips, "order")
SELECT id, 'self-confidence', 'Self-Confidence', 'A strong sense of self-worth and capabilities.',
  '["Celebrate small wins", "Practice positive self-talk", "Set and achieve realistic goals"]'::jsonb, 3
FROM eq_domains WHERE slug = 'self-awareness';

-- Self-Regulation Skills
INSERT INTO eq_skills (domain_id, slug, name, description, tips, "order")
SELECT id, 'self-control', 'Self-Control', 'Managing disruptive emotions and impulses effectively.',
  '["Practice the pause: count to 10 before reacting", "Use deep breathing techniques", "Identify your triggers"]'::jsonb, 1
FROM eq_domains WHERE slug = 'self-regulation';

INSERT INTO eq_skills (domain_id, slug, name, description, tips, "order")
SELECT id, 'trustworthiness', 'Trustworthiness', 'Maintaining standards of honesty and integrity.',
  '["Keep your commitments", "Be transparent about mistakes", "Act consistently with your values"]'::jsonb, 2
FROM eq_domains WHERE slug = 'self-regulation';

INSERT INTO eq_skills (domain_id, slug, name, description, tips, "order")
SELECT id, 'adaptability', 'Adaptability', 'Flexibility in handling change and challenges.',
  '["Embrace uncertainty as opportunity", "Practice trying new approaches", "Focus on what you can control"]'::jsonb, 3
FROM eq_domains WHERE slug = 'self-regulation';

-- Motivation Skills
INSERT INTO eq_skills (domain_id, slug, name, description, tips, "order")
SELECT id, 'achievement-drive', 'Achievement Drive', 'Striving to improve or meet a standard of excellence.',
  '["Set challenging but attainable goals", "Track your progress regularly", "Learn from setbacks"]'::jsonb, 1
FROM eq_domains WHERE slug = 'motivation';

INSERT INTO eq_skills (domain_id, slug, name, description, tips, "order")
SELECT id, 'commitment', 'Commitment', 'Aligning with the goals of a group or organization.',
  '["Connect daily tasks to larger purpose", "Find meaning in your work", "Support team objectives"]'::jsonb, 2
FROM eq_domains WHERE slug = 'motivation';

INSERT INTO eq_skills (domain_id, slug, name, description, tips, "order")
SELECT id, 'optimism', 'Optimism', 'Persistence in pursuing goals despite obstacles and setbacks.',
  '["Reframe challenges as opportunities", "Focus on solutions, not problems", "Surround yourself with positive people"]'::jsonb, 3
FROM eq_domains WHERE slug = 'motivation';

-- Empathy Skills
INSERT INTO eq_skills (domain_id, slug, name, description, tips, "order")
SELECT id, 'understanding-others', 'Understanding Others', 'Sensing others'' feelings and perspectives, and taking an active interest in their concerns.',
  '["Practice active listening", "Ask open-ended questions", "Observe body language and tone"]'::jsonb, 1
FROM eq_domains WHERE slug = 'empathy';

INSERT INTO eq_skills (domain_id, slug, name, description, tips, "order")
SELECT id, 'service-orientation', 'Service Orientation', 'Anticipating, recognizing, and meeting others'' needs.',
  '["Put yourself in others'' shoes", "Look for ways to help without being asked", "Follow up on others'' concerns"]'::jsonb, 2
FROM eq_domains WHERE slug = 'empathy';

INSERT INTO eq_skills (domain_id, slug, name, description, tips, "order")
SELECT id, 'leveraging-diversity', 'Leveraging Diversity', 'Cultivating opportunities through diverse people.',
  '["Seek out different perspectives", "Challenge your assumptions", "Value unique contributions"]'::jsonb, 3
FROM eq_domains WHERE slug = 'empathy';

-- Social Skills
INSERT INTO eq_skills (domain_id, slug, name, description, tips, "order")
SELECT id, 'influence', 'Influence', 'Wielding effective tactics for persuasion.',
  '["Build rapport before persuading", "Understand others'' motivations", "Use stories and examples"]'::jsonb, 1
FROM eq_domains WHERE slug = 'social-skills';

INSERT INTO eq_skills (domain_id, slug, name, description, tips, "order")
SELECT id, 'communication', 'Communication', 'Listening openly and sending convincing messages.',
  '["Practice active listening", "Be clear and concise", "Adapt your style to your audience"]'::jsonb, 2
FROM eq_domains WHERE slug = 'social-skills';

INSERT INTO eq_skills (domain_id, slug, name, description, tips, "order")
SELECT id, 'conflict-management', 'Conflict Management', 'Negotiating and resolving disagreements.',
  '["Focus on interests, not positions", "Seek win-win solutions", "Stay calm under pressure"]'::jsonb, 3
FROM eq_domains WHERE slug = 'social-skills';

INSERT INTO eq_skills (domain_id, slug, name, description, tips, "order")
SELECT id, 'collaboration', 'Collaboration', 'Working with others toward shared goals.',
  '["Share credit generously", "Contribute your strengths", "Support team members"]'::jsonb, 4
FROM eq_domains WHERE slug = 'social-skills';

-- ============================================================================
-- SEED DATA: ASSESSMENT TYPES
-- ============================================================================

INSERT INTO assessment_types (slug, name, description, question_count, estimated_minutes, is_premium, "order") VALUES
('quick', 'Quick EQ Check', 'A brief assessment to get a snapshot of your emotional intelligence. Perfect for a quick check-in.', 10, 3, false, 1),
('comprehensive', 'Comprehensive EQ Assessment', 'Our full assessment covering all five EQ domains in depth. Get detailed insights and personalized recommendations.', 50, 15, false, 2),
('leadership', 'Leadership EQ', 'Focused on emotional intelligence skills essential for effective leadership and management.', 30, 10, true, 3),
('relationship', 'Relationship EQ', 'Assess your emotional intelligence in personal relationships and social connections.', 25, 8, true, 4),
('workplace', 'Workplace EQ', 'Evaluate your emotional intelligence in professional settings and team environments.', 30, 10, true, 5)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- SEED DATA: BADGES
-- ============================================================================

INSERT INTO badges (slug, name, description, icon, category, requirement, xp_reward, "order") VALUES
-- Achievement badges
('first-assessment', 'First Steps', 'Complete your first EQ assessment', 'award', 'achievement', '{"type": "assessments_completed", "value": 1}'::jsonb, 50, 1),
('assessment-veteran', 'Assessment Veteran', 'Complete 10 assessments', 'trophy', 'achievement', '{"type": "assessments_completed", "value": 10}'::jsonb, 100, 2),
('assessment-master', 'Assessment Master', 'Complete 50 assessments', 'crown', 'achievement', '{"type": "assessments_completed", "value": 50}'::jsonb, 500, 3),

-- Streak badges
('streak-7', 'Week Warrior', 'Maintain a 7-day activity streak', 'flame', 'streak', '{"type": "streak_days", "value": 7}'::jsonb, 75, 4),
('streak-30', 'Monthly Champion', 'Maintain a 30-day activity streak', 'fire', 'streak', '{"type": "streak_days", "value": 30}'::jsonb, 200, 5),
('streak-100', 'Centurion', 'Maintain a 100-day activity streak', 'star', 'streak', '{"type": "streak_days", "value": 100}'::jsonb, 1000, 6),

-- Domain mastery badges
('self-aware-star', 'Self-Aware Star', 'Score 80+ in Self-Awareness', 'eye', 'skill', '{"type": "domain_score", "value": 80, "domain": "self-awareness"}'::jsonb, 150, 7),
('regulation-rock', 'Regulation Rock', 'Score 80+ in Self-Regulation', 'shield', 'skill', '{"type": "domain_score", "value": 80, "domain": "self-regulation"}'::jsonb, 150, 8),
('motivation-maven', 'Motivation Maven', 'Score 80+ in Motivation', 'flame', 'skill', '{"type": "domain_score", "value": 80, "domain": "motivation"}'::jsonb, 150, 9),
('empathy-expert', 'Empathy Expert', 'Score 80+ in Empathy', 'heart', 'skill', '{"type": "domain_score", "value": 80, "domain": "empathy"}'::jsonb, 150, 10),
('social-butterfly', 'Social Butterfly', 'Score 80+ in Social Skills', 'users', 'skill', '{"type": "domain_score", "value": 80, "domain": "social-skills"}'::jsonb, 150, 11),
('eq-master', 'EQ Master', 'Score 80+ in all five domains', 'gem', 'skill', '{"type": "domain_score", "value": 80}'::jsonb, 500, 12),

-- Game badges
('game-starter', 'Game On', 'Play your first EQ game', 'gamepad', 'achievement', '{"type": "games_played", "value": 1}'::jsonb, 25, 13),
('game-enthusiast', 'Game Enthusiast', 'Play 25 EQ games', 'joystick', 'achievement', '{"type": "games_played", "value": 25}'::jsonb, 100, 14),

-- Level badges
('level-5', 'Rising Star', 'Reach level 5', 'trending-up', 'achievement', '{"type": "level_reached", "value": 5}'::jsonb, 100, 15),
('level-10', 'EQ Explorer', 'Reach level 10', 'compass', 'achievement', '{"type": "level_reached", "value": 10}'::jsonb, 250, 16),
('level-25', 'EQ Expert', 'Reach level 25', 'brain', 'achievement', '{"type": "level_reached", "value": 25}'::jsonb, 500, 17)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- SEED DATA: GAMES
-- ============================================================================

INSERT INTO games (slug, name, description, instructions, game_type, domain_id, difficulty, estimated_minutes, xp_reward) VALUES
('emotion-faces', 'Emotion Faces', 'Test your ability to recognize emotions from facial expressions.', 'Look at each face and select the emotion you think it shows. Try to be as quick and accurate as possible!', 'emotion-recognition', (SELECT id FROM eq_domains WHERE slug = 'empathy'), 'easy', 3, 15),
('scenario-choice', 'What Would You Do?', 'Navigate through realistic scenarios and choose the most emotionally intelligent response.', 'Read each scenario carefully and select the response that demonstrates the highest emotional intelligence.', 'scenario-choice', (SELECT id FROM eq_domains WHERE slug = 'social-skills'), 'medium', 5, 20),
('emotion-memory', 'Emotion Match', 'A memory game that helps you learn to connect emotions with their descriptions.', 'Match emotion cards with their descriptions. Find all pairs to complete the game!', 'memory', (SELECT id FROM eq_domains WHERE slug = 'self-awareness'), 'easy', 4, 15),
('mindful-moment', 'Mindful Moment', 'A guided reflection exercise to practice self-awareness and emotional regulation.', 'Follow the guided prompts and take a moment to reflect on your current emotional state.', 'reflection', (SELECT id FROM eq_domains WHERE slug = 'self-regulation'), 'easy', 5, 25)
ON CONFLICT (slug) DO NOTHING;
