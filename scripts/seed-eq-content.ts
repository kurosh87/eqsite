/**
 * EQ Platform Database Seed Script
 * Run with: npx tsx scripts/seed-eq-content.ts
 */

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { v4 as uuid } from "uuid";

// Get database URL from environment
const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL environment variable is required");
  process.exit(1);
}

const sql = neon(DATABASE_URL);
const db = drizzle(sql);

// ============================================================================
// EQ DOMAINS (Goleman's 5 domains)
// ============================================================================
const EQ_DOMAINS = [
  {
    id: uuid(),
    slug: "self-awareness",
    name: "Self-Awareness",
    description: "The ability to recognize and understand your own emotions, strengths, weaknesses, values, and motivations, and their impact on others.",
    icon: "Brain",
    color: "#3b82f6",
    order: 1,
  },
  {
    id: uuid(),
    slug: "self-regulation",
    name: "Self-Regulation",
    description: "The ability to manage your emotions, impulses, and resources effectively. This includes adaptability and maintaining standards of honesty and integrity.",
    icon: "Shield",
    color: "#10b981",
    order: 2,
  },
  {
    id: uuid(),
    slug: "motivation",
    name: "Motivation",
    description: "A passion to work for reasons beyond money or status, with energy and persistence to pursue goals with optimism even in the face of failure.",
    icon: "Flame",
    color: "#f59e0b",
    order: 3,
  },
  {
    id: uuid(),
    slug: "empathy",
    name: "Empathy",
    description: "The ability to understand the emotional makeup of other people and treat them according to their emotional reactions.",
    icon: "Heart",
    color: "#ec4899",
    order: 4,
  },
  {
    id: uuid(),
    slug: "social-skills",
    name: "Social Skills",
    description: "Proficiency in managing relationships and building networks, finding common ground, and building rapport.",
    icon: "Users",
    color: "#8b5cf6",
    order: 5,
  },
];

// ============================================================================
// SKILLS (Sub-competencies for each domain)
// ============================================================================
const EQ_SKILLS = [
  // Self-Awareness Skills
  {
    domainSlug: "self-awareness",
    slug: "emotional-awareness",
    name: "Emotional Awareness",
    description: "Recognizing your emotions and their effects",
    tips: [
      "Keep an emotion journal",
      "Name your emotions specifically",
      "Notice physical sensations tied to emotions",
    ],
    order: 1,
  },
  {
    domainSlug: "self-awareness",
    slug: "accurate-self-assessment",
    name: "Accurate Self-Assessment",
    description: "Knowing your strengths and limitations",
    tips: [
      "Seek honest feedback from others",
      "Reflect on past successes and failures",
      "Identify patterns in your behavior",
    ],
    order: 2,
  },
  {
    domainSlug: "self-awareness",
    slug: "self-confidence",
    name: "Self-Confidence",
    description: "A strong sense of self-worth and capabilities",
    tips: [
      "Celebrate small wins",
      "Challenge negative self-talk",
      "Take on challenges that stretch you",
    ],
    order: 3,
  },

  // Self-Regulation Skills
  {
    domainSlug: "self-regulation",
    slug: "self-control",
    name: "Self-Control",
    description: "Managing disruptive emotions and impulses",
    tips: [
      "Practice the STOP technique",
      "Count to 10 before reacting",
      "Use deep breathing exercises",
    ],
    order: 1,
  },
  {
    domainSlug: "self-regulation",
    slug: "trustworthiness",
    name: "Trustworthiness",
    description: "Maintaining standards of honesty and integrity",
    tips: [
      "Keep your commitments",
      "Be transparent about your mistakes",
      "Act consistently with your values",
    ],
    order: 2,
  },
  {
    domainSlug: "self-regulation",
    slug: "adaptability",
    name: "Adaptability",
    description: "Flexibility in handling change",
    tips: [
      "Embrace uncertainty as opportunity",
      "Practice scenario planning",
      "Stay curious and open-minded",
    ],
    order: 3,
  },

  // Motivation Skills
  {
    domainSlug: "motivation",
    slug: "achievement-drive",
    name: "Achievement Drive",
    description: "Striving to improve or meet a standard of excellence",
    tips: [
      "Set SMART goals",
      "Track your progress visibly",
      "Find meaning in your work",
    ],
    order: 1,
  },
  {
    domainSlug: "motivation",
    slug: "commitment",
    name: "Commitment",
    description: "Aligning with goals of the group or organization",
    tips: [
      "Connect personal goals to larger purpose",
      "Find ways to contribute meaningfully",
      "Stay engaged during challenges",
    ],
    order: 2,
  },
  {
    domainSlug: "motivation",
    slug: "optimism",
    name: "Optimism",
    description: "Persistence in pursuing goals despite obstacles",
    tips: [
      "Reframe setbacks as learning opportunities",
      "Focus on what you can control",
      "Surround yourself with positive people",
    ],
    order: 3,
  },

  // Empathy Skills
  {
    domainSlug: "empathy",
    slug: "understanding-others",
    name: "Understanding Others",
    description: "Sensing others' feelings and perspectives",
    tips: [
      "Practice active listening",
      "Ask open-ended questions",
      "Observe body language and tone",
    ],
    order: 1,
  },
  {
    domainSlug: "empathy",
    slug: "developing-others",
    name: "Developing Others",
    description: "Sensing others' development needs and bolstering their abilities",
    tips: [
      "Provide specific, constructive feedback",
      "Recognize and celebrate others' growth",
      "Create opportunities for learning",
    ],
    order: 2,
  },
  {
    domainSlug: "empathy",
    slug: "service-orientation",
    name: "Service Orientation",
    description: "Anticipating, recognizing, and meeting needs",
    tips: [
      "Ask what others need before assuming",
      "Go the extra mile proactively",
      "Follow up to ensure satisfaction",
    ],
    order: 3,
  },

  // Social Skills
  {
    domainSlug: "social-skills",
    slug: "influence",
    name: "Influence",
    description: "Wielding effective tactics for persuasion",
    tips: [
      "Understand others' motivations first",
      "Use storytelling to make points",
      "Build credibility through consistency",
    ],
    order: 1,
  },
  {
    domainSlug: "social-skills",
    slug: "communication",
    name: "Communication",
    description: "Listening openly and sending convincing messages",
    tips: [
      "Tailor your message to your audience",
      "Practice clear, concise expression",
      "Check for understanding",
    ],
    order: 2,
  },
  {
    domainSlug: "social-skills",
    slug: "conflict-management",
    name: "Conflict Management",
    description: "Negotiating and resolving disagreements",
    tips: [
      "Focus on interests, not positions",
      "Stay calm and objective",
      "Look for win-win solutions",
    ],
    order: 3,
  },
  {
    domainSlug: "social-skills",
    slug: "collaboration",
    name: "Collaboration",
    description: "Working with others toward shared goals",
    tips: [
      "Establish clear shared objectives",
      "Leverage diverse strengths",
      "Celebrate team successes",
    ],
    order: 4,
  },
];

// ============================================================================
// ASSESSMENT TYPES
// ============================================================================
const ASSESSMENT_TYPES = [
  {
    id: uuid(),
    slug: "quick",
    name: "Quick EQ Check",
    description: "A brief assessment covering all 5 EQ domains",
    questionCount: 15,
    estimatedMinutes: 5,
    isPremium: false,
    isActive: true,
    order: 1,
  },
  {
    id: uuid(),
    slug: "comprehensive",
    name: "Comprehensive EQ Assessment",
    description: "In-depth assessment with detailed domain analysis",
    questionCount: 45,
    estimatedMinutes: 15,
    isPremium: false,
    isActive: true,
    order: 2,
  },
  {
    id: uuid(),
    slug: "leadership",
    name: "Leadership EQ",
    description: "Focused on emotional intelligence for leaders",
    questionCount: 30,
    estimatedMinutes: 12,
    isPremium: true,
    isActive: true,
    order: 3,
  },
];

// ============================================================================
// QUESTIONS (Sample questions per domain)
// ============================================================================
const QUESTIONS = [
  // Self-Awareness Questions
  { domain: "self-awareness", text: "I can accurately name what I'm feeling in the moment.", reversed: false },
  { domain: "self-awareness", text: "I understand how my emotions affect my performance.", reversed: false },
  { domain: "self-awareness", text: "I often act without understanding why I feel a certain way.", reversed: true },
  { domain: "self-awareness", text: "I know my strengths and weaknesses well.", reversed: false },
  { domain: "self-awareness", text: "I seek feedback to understand how others perceive me.", reversed: false },
  { domain: "self-awareness", text: "I feel confident in my abilities even in challenging situations.", reversed: false },
  { domain: "self-awareness", text: "I have difficulty recognizing when I'm becoming stressed.", reversed: true },
  { domain: "self-awareness", text: "I understand how my mood affects those around me.", reversed: false },
  { domain: "self-awareness", text: "I regularly reflect on my emotional reactions.", reversed: false },

  // Self-Regulation Questions
  { domain: "self-regulation", text: "I stay calm under pressure.", reversed: false },
  { domain: "self-regulation", text: "I think before I act, especially when upset.", reversed: false },
  { domain: "self-regulation", text: "I often say things I later regret.", reversed: true },
  { domain: "self-regulation", text: "I can manage my anxiety in stressful situations.", reversed: false },
  { domain: "self-regulation", text: "I adapt quickly when circumstances change unexpectedly.", reversed: false },
  { domain: "self-regulation", text: "I hold myself to high ethical standards.", reversed: false },
  { domain: "self-regulation", text: "I find it hard to control my temper.", reversed: true },
  { domain: "self-regulation", text: "I can redirect my negative emotions into something productive.", reversed: false },
  { domain: "self-regulation", text: "I take responsibility for my mistakes.", reversed: false },

  // Motivation Questions
  { domain: "motivation", text: "I set challenging goals for myself.", reversed: false },
  { domain: "motivation", text: "I remain optimistic even when facing setbacks.", reversed: false },
  { domain: "motivation", text: "I easily give up when things get difficult.", reversed: true },
  { domain: "motivation", text: "I find meaning and purpose in my work.", reversed: false },
  { domain: "motivation", text: "I'm driven by a desire to achieve, not just external rewards.", reversed: false },
  { domain: "motivation", text: "I take initiative without being asked.", reversed: false },
  { domain: "motivation", text: "I lack motivation when tasks seem difficult.", reversed: true },
  { domain: "motivation", text: "I persist in pursuing my goals despite obstacles.", reversed: false },
  { domain: "motivation", text: "I continuously seek ways to improve my performance.", reversed: false },

  // Empathy Questions
  { domain: "empathy", text: "I can sense what others are feeling without them telling me.", reversed: false },
  { domain: "empathy", text: "I listen attentively when others share their problems.", reversed: false },
  { domain: "empathy", text: "I find it hard to understand others' perspectives.", reversed: true },
  { domain: "empathy", text: "I'm good at reading body language and nonverbal cues.", reversed: false },
  { domain: "empathy", text: "I consider others' feelings before making decisions.", reversed: false },
  { domain: "empathy", text: "I help others develop their strengths.", reversed: false },
  { domain: "empathy", text: "I often dismiss others' emotional concerns.", reversed: true },
  { domain: "empathy", text: "I anticipate others' needs before they ask.", reversed: false },
  { domain: "empathy", text: "I treat people according to their emotional state.", reversed: false },

  // Social Skills Questions
  { domain: "social-skills", text: "I can persuade others to see my point of view.", reversed: false },
  { domain: "social-skills", text: "I communicate clearly and effectively.", reversed: false },
  { domain: "social-skills", text: "I struggle to resolve conflicts constructively.", reversed: true },
  { domain: "social-skills", text: "I build rapport easily with new people.", reversed: false },
  { domain: "social-skills", text: "I work well in team environments.", reversed: false },
  { domain: "social-skills", text: "I inspire and guide others toward goals.", reversed: false },
  { domain: "social-skills", text: "I find networking and building relationships difficult.", reversed: true },
  { domain: "social-skills", text: "I handle difficult conversations with tact.", reversed: false },
  { domain: "social-skills", text: "I help create a positive team atmosphere.", reversed: false },
];

// ============================================================================
// BADGES
// ============================================================================
const BADGES = [
  {
    slug: "first-assessment",
    name: "First Steps",
    description: "Complete your first EQ assessment",
    icon: "🎯",
    category: "achievement",
    requirement: { type: "assessments_completed", value: 1 },
    xpReward: 25,
    order: 1,
  },
  {
    slug: "five-assessments",
    name: "EQ Explorer",
    description: "Complete 5 assessments",
    icon: "🔍",
    category: "achievement",
    requirement: { type: "assessments_completed", value: 5 },
    xpReward: 100,
    order: 2,
  },
  {
    slug: "streak-7",
    name: "Week Warrior",
    description: "Maintain a 7-day streak",
    icon: "🔥",
    category: "streak",
    requirement: { type: "streak_days", value: 7 },
    xpReward: 75,
    order: 3,
  },
  {
    slug: "streak-30",
    name: "Monthly Master",
    description: "Maintain a 30-day streak",
    icon: "⚡",
    category: "streak",
    requirement: { type: "streak_days", value: 30 },
    xpReward: 250,
    order: 4,
  },
  {
    slug: "games-10",
    name: "Game On",
    description: "Play 10 EQ games",
    icon: "🎮",
    category: "achievement",
    requirement: { type: "games_played", value: 10 },
    xpReward: 50,
    order: 5,
  },
  {
    slug: "level-5",
    name: "Rising Star",
    description: "Reach level 5",
    icon: "⭐",
    category: "achievement",
    requirement: { type: "level_reached", value: 5 },
    xpReward: 100,
    order: 6,
  },
  {
    slug: "level-10",
    name: "EQ Champion",
    description: "Reach level 10",
    icon: "🏆",
    category: "achievement",
    requirement: { type: "level_reached", value: 10 },
    xpReward: 250,
    order: 7,
  },
];

// ============================================================================
// GAMES
// ============================================================================
const GAMES = [
  {
    slug: "emotion-recognition",
    name: "Emotion Detective",
    description: "Test your ability to recognize emotions from facial expressions",
    instructions: "Look at each face and identify the emotion being displayed. You have 10 seconds per image.",
    gameType: "emotion-recognition",
    difficulty: "medium",
    estimatedMinutes: 5,
    xpReward: 20,
    isActive: true,
  },
  {
    slug: "scenario-challenge",
    name: "Scenario Challenge",
    description: "Navigate emotionally complex situations with the best response",
    instructions: "Read each scenario and choose the response that demonstrates the highest emotional intelligence.",
    gameType: "scenario-choice",
    difficulty: "medium",
    estimatedMinutes: 8,
    xpReward: 25,
    isActive: true,
  },
  {
    slug: "empathy-builder",
    name: "Empathy Builder",
    description: "Practice seeing situations from different perspectives",
    instructions: "Read each situation and identify how different people might feel about it.",
    gameType: "scenario-choice",
    difficulty: "easy",
    estimatedMinutes: 5,
    xpReward: 15,
    isActive: true,
  },
];

// ============================================================================
// SEED FUNCTION
// ============================================================================
async function seed() {
  console.log("🌱 Starting EQ Platform database seed...\n");

  try {
    // 1. Seed Domains
    console.log("📚 Seeding EQ domains...");
    for (const domain of EQ_DOMAINS) {
      await sql`
        INSERT INTO eq_domains (id, slug, name, description, icon, color, "order")
        VALUES (${domain.id}, ${domain.slug}, ${domain.name}, ${domain.description}, ${domain.icon}, ${domain.color}, ${domain.order})
        ON CONFLICT (slug) DO UPDATE SET
          name = EXCLUDED.name,
          description = EXCLUDED.description,
          icon = EXCLUDED.icon,
          color = EXCLUDED.color,
          "order" = EXCLUDED."order"
      `;
    }
    console.log(`   ✅ ${EQ_DOMAINS.length} domains seeded\n`);

    // 2. Seed Skills
    console.log("🎯 Seeding EQ skills...");
    for (const skill of EQ_SKILLS) {
      const domain = EQ_DOMAINS.find(d => d.slug === skill.domainSlug);
      if (!domain) continue;

      await sql`
        INSERT INTO eq_skills (id, domain_id, slug, name, description, tips, "order")
        VALUES (${uuid()}, ${domain.id}, ${skill.slug}, ${skill.name}, ${skill.description}, ${JSON.stringify(skill.tips)}, ${skill.order})
        ON CONFLICT (slug) DO UPDATE SET
          name = EXCLUDED.name,
          description = EXCLUDED.description,
          tips = EXCLUDED.tips,
          "order" = EXCLUDED."order"
      `;
    }
    console.log(`   ✅ ${EQ_SKILLS.length} skills seeded\n`);

    // 3. Seed Assessment Types
    console.log("📝 Seeding assessment types...");
    for (const aType of ASSESSMENT_TYPES) {
      await sql`
        INSERT INTO assessment_types (id, slug, name, description, question_count, estimated_minutes, is_premium, is_active, "order")
        VALUES (${aType.id}, ${aType.slug}, ${aType.name}, ${aType.description}, ${aType.questionCount}, ${aType.estimatedMinutes}, ${aType.isPremium}, ${aType.isActive}, ${aType.order})
        ON CONFLICT (slug) DO UPDATE SET
          name = EXCLUDED.name,
          description = EXCLUDED.description,
          question_count = EXCLUDED.question_count,
          estimated_minutes = EXCLUDED.estimated_minutes,
          is_premium = EXCLUDED.is_premium,
          is_active = EXCLUDED.is_active,
          "order" = EXCLUDED."order"
      `;
    }
    console.log(`   ✅ ${ASSESSMENT_TYPES.length} assessment types seeded\n`);

    // 4. Seed Questions
    console.log("❓ Seeding questions...");
    let questionCount = 0;
    for (const q of QUESTIONS) {
      const domain = EQ_DOMAINS.find(d => d.slug === q.domain);
      if (!domain) continue;

      await sql`
        INSERT INTO questions (id, domain_id, question_text, question_type, is_reversed, weight, is_active, "order")
        VALUES (${uuid()}, ${domain.id}, ${q.text}, 'likert', ${q.reversed}, 1.0, true, ${questionCount})
        ON CONFLICT DO NOTHING
      `;
      questionCount++;
    }
    console.log(`   ✅ ${questionCount} questions seeded\n`);

    // 5. Seed Badges
    console.log("🏅 Seeding badges...");
    for (const badge of BADGES) {
      await sql`
        INSERT INTO badges (id, slug, name, description, icon, category, requirement, xp_reward, "order")
        VALUES (${uuid()}, ${badge.slug}, ${badge.name}, ${badge.description}, ${badge.icon}, ${badge.category}, ${JSON.stringify(badge.requirement)}, ${badge.xpReward}, ${badge.order})
        ON CONFLICT (slug) DO UPDATE SET
          name = EXCLUDED.name,
          description = EXCLUDED.description,
          icon = EXCLUDED.icon,
          category = EXCLUDED.category,
          requirement = EXCLUDED.requirement,
          xp_reward = EXCLUDED.xp_reward,
          "order" = EXCLUDED."order"
      `;
    }
    console.log(`   ✅ ${BADGES.length} badges seeded\n`);

    // 6. Seed Games
    console.log("🎮 Seeding games...");
    for (const game of GAMES) {
      await sql`
        INSERT INTO games (id, slug, name, description, instructions, game_type, difficulty, estimated_minutes, xp_reward, is_active)
        VALUES (${uuid()}, ${game.slug}, ${game.name}, ${game.description}, ${game.instructions}, ${game.gameType}, ${game.difficulty}, ${game.estimatedMinutes}, ${game.xpReward}, ${game.isActive})
        ON CONFLICT (slug) DO UPDATE SET
          name = EXCLUDED.name,
          description = EXCLUDED.description,
          instructions = EXCLUDED.instructions,
          game_type = EXCLUDED.game_type,
          difficulty = EXCLUDED.difficulty,
          estimated_minutes = EXCLUDED.estimated_minutes,
          xp_reward = EXCLUDED.xp_reward,
          is_active = EXCLUDED.is_active
      `;
    }
    console.log(`   ✅ ${GAMES.length} games seeded\n`);

    console.log("🎉 Database seed completed successfully!");
    console.log("\nSummary:");
    console.log(`   - ${EQ_DOMAINS.length} EQ domains`);
    console.log(`   - ${EQ_SKILLS.length} skills`);
    console.log(`   - ${ASSESSMENT_TYPES.length} assessment types`);
    console.log(`   - ${QUESTIONS.length} questions`);
    console.log(`   - ${BADGES.length} badges`);
    console.log(`   - ${GAMES.length} games`);

  } catch (error) {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  }
}

// Run the seed
seed();
