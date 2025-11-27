import { bigint, boolean, pgTable, text, timestamp, uuid, jsonb, integer, index, real } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ============================================================================
// AUTHENTICATION TABLES (Better Auth - unchanged)
// ============================================================================

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified").default(false),
  image: text("image"),
  isAdmin: boolean("isAdmin").default(false),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expiresAt").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("createdAt").defaultNow(),
    updatedAt: timestamp("updatedAt")
      .defaultNow()
      .$onUpdate(() => new Date()),
    ipAddress: text("ipAddress"),
    userAgent: text("userAgent"),
    userId: text("userId")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_userId_idx").on(table.userId)],
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("accountId").notNull(),
    providerId: text("providerId").notNull(),
    userId: text("userId")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("accessToken"),
    refreshToken: text("refreshToken"),
    idToken: text("idToken"),
    accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
    refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("createdAt").defaultNow(),
    updatedAt: timestamp("updatedAt")
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [index("account_userId_idx").on(table.userId)],
);

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expiresAt").notNull(),
    createdAt: timestamp("createdAt").defaultNow(),
    updatedAt: timestamp("updatedAt")
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);

export const passwordResets = pgTable("password_resets", {
  id: text("id").primaryKey(),
  userId: text("userId").notNull(),
  token: text("token").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  used: boolean("used").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
});

// ============================================================================
// EQ DOMAIN TABLES
// ============================================================================

// The 5 core EQ domains (based on Goleman's model)
export const eqDomains = pgTable("eq_domains", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(), // 'self-awareness', 'self-regulation', 'motivation', 'empathy', 'social-skills'
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon"), // Icon name for UI
  color: text("color"), // Theme color for UI
  order: integer("order").default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// Sub-skills within each domain
export const eqSkills = pgTable(
  "eq_skills",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    domainId: uuid("domain_id")
      .notNull()
      .references(() => eqDomains.id, { onDelete: "cascade" }),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    description: text("description"),
    tips: jsonb("tips").$type<string[]>(), // Improvement tips
    exercises: jsonb("exercises").$type<Array<{
      title: string;
      description: string;
      duration: string;
    }>>(),
    order: integer("order").default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("eq_skills_domain_idx").on(table.domainId)],
);

// ============================================================================
// ASSESSMENT & QUESTION TABLES
// ============================================================================

// Assessment types (quick, comprehensive, domain-specific)
export const assessmentTypes = pgTable("assessment_types", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(), // 'quick', 'comprehensive', 'leadership', 'relationship', 'workplace'
  name: text("name").notNull(),
  description: text("description"),
  questionCount: integer("question_count").notNull(),
  estimatedMinutes: integer("estimated_minutes").notNull(),
  isPremium: boolean("is_premium").default(false).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  order: integer("order").default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// Question bank
export const questions = pgTable(
  "questions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    assessmentTypeId: uuid("assessment_type_id")
      .references(() => assessmentTypes.id, { onDelete: "set null" }),
    domainId: uuid("domain_id")
      .notNull()
      .references(() => eqDomains.id, { onDelete: "cascade" }),
    skillId: uuid("skill_id")
      .references(() => eqSkills.id, { onDelete: "set null" }),
    questionText: text("question_text").notNull(),
    questionType: text("question_type").notNull().default("likert"), // 'likert', 'scenario', 'multiple-choice'
    // For scenario-based questions
    scenario: text("scenario"),
    // Answer options (for multiple choice or custom likert scales)
    options: jsonb("options").$type<Array<{
      value: number;
      label: string;
      description?: string;
    }>>(),
    // Scoring: higher value = higher EQ (can be reversed)
    isReversed: boolean("is_reversed").default(false).notNull(),
    weight: real("weight").default(1.0).notNull(),
    // Metadata
    difficulty: text("difficulty").default("medium"), // 'easy', 'medium', 'hard'
    tags: jsonb("tags").$type<string[]>(),
    isActive: boolean("is_active").default(true).notNull(),
    order: integer("order").default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("questions_domain_idx").on(table.domainId),
    index("questions_assessment_type_idx").on(table.assessmentTypeId),
  ],
);

// ============================================================================
// USER ASSESSMENT TABLES
// ============================================================================

// User assessment sessions
export const assessments = pgTable(
  "assessments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").notNull(),
    assessmentTypeId: uuid("assessment_type_id")
      .notNull()
      .references(() => assessmentTypes.id, { onDelete: "cascade" }),
    status: text("status").notNull().default("in_progress"), // 'in_progress', 'completed', 'abandoned'
    startedAt: timestamp("started_at", { withTimezone: true }).defaultNow().notNull(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    // Overall scores
    overallScore: real("overall_score"), // 0-100
    domainScores: jsonb("domain_scores").$type<Record<string, number>>(), // { 'self-awareness': 75, ... }
    skillScores: jsonb("skill_scores").$type<Record<string, number>>(), // Detailed skill breakdown
    // Percentile compared to other users
    percentile: integer("percentile"),
    // Time taken in seconds
    timeTaken: integer("time_taken"),
  },
  (table) => [
    index("assessments_user_idx").on(table.userId),
    index("assessments_status_idx").on(table.status),
  ],
);

// Individual question responses
export const assessmentResponses = pgTable(
  "assessment_responses",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    assessmentId: uuid("assessment_id")
      .notNull()
      .references(() => assessments.id, { onDelete: "cascade" }),
    questionId: uuid("question_id")
      .notNull()
      .references(() => questions.id, { onDelete: "cascade" }),
    response: integer("response").notNull(), // The selected value (1-5 for likert, option index for MC)
    responseTime: integer("response_time"), // Time in milliseconds to answer
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("assessment_responses_assessment_idx").on(table.assessmentId),
  ],
);

// ============================================================================
// PREMIUM REPORTS
// ============================================================================

export const reports = pgTable(
  "reports",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").notNull(),
    assessmentId: uuid("assessment_id")
      .notNull()
      .references(() => assessments.id, { onDelete: "cascade" }),
    status: text("status").notNull().default("preview"), // 'preview', 'paid', 'complete'
    paymentId: text("payment_id"),
    amountPaid: bigint("amount_paid", { mode: "number" }), // in cents
    // Report content sections
    sections: jsonb("sections").$type<{
      summary: string;
      strengths: string[];
      areasForGrowth: string[];
      domainAnalysis: Record<string, {
        score: number;
        interpretation: string;
        tips: string[];
      }>;
      actionPlan: Array<{
        priority: number;
        skill: string;
        action: string;
        timeframe: string;
      }>;
      comparisons?: {
        ageGroup: number;
        profession: number;
        global: number;
      };
    }>(),
    generatedAt: timestamp("generated_at", { withTimezone: true }).defaultNow().notNull(),
    accessedCount: bigint("accessed_count", { mode: "number" }).default(0),
    lastAccessed: timestamp("last_accessed", { withTimezone: true }),
  },
  (table) => [index("reports_user_idx").on(table.userId)],
);

// ============================================================================
// GAMIFICATION TABLES
// ============================================================================

// User profiles with gamification stats
export const userProfiles = pgTable("user_profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull().unique(),
  // Current level and XP
  level: integer("level").default(1).notNull(),
  xp: integer("xp").default(0).notNull(),
  xpToNextLevel: integer("xp_to_next_level").default(100).notNull(),
  // Streaks
  currentStreak: integer("current_streak").default(0).notNull(),
  longestStreak: integer("longest_streak").default(0).notNull(),
  lastActivityDate: timestamp("last_activity_date", { withTimezone: true }),
  // Stats
  totalAssessments: integer("total_assessments").default(0).notNull(),
  totalGamesPlayed: integer("total_games_played").default(0).notNull(),
  totalExercisesCompleted: integer("total_exercises_completed").default(0).notNull(),
  // Preferences
  dailyReminderEnabled: boolean("daily_reminder_enabled").default(false).notNull(),
  reminderTime: text("reminder_time"), // HH:mm format
  focusAreas: jsonb("focus_areas").$type<string[]>(), // Domain slugs user wants to focus on
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date()),
});

// Badge definitions
export const badges = pgTable("badges", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(), // Icon name or URL
  category: text("category").notNull(), // 'achievement', 'streak', 'skill', 'social'
  requirement: jsonb("requirement").$type<{
    type: 'assessments_completed' | 'streak_days' | 'domain_score' | 'games_played' | 'exercises_completed' | 'level_reached';
    value: number;
    domain?: string; // For domain-specific badges
  }>(),
  xpReward: integer("xp_reward").default(10).notNull(),
  isSecret: boolean("is_secret").default(false).notNull(),
  order: integer("order").default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// User earned badges
export const userBadges = pgTable(
  "user_badges",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").notNull(),
    badgeId: uuid("badge_id")
      .notNull()
      .references(() => badges.id, { onDelete: "cascade" }),
    earnedAt: timestamp("earned_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("user_badges_user_idx").on(table.userId),
  ],
);

// ============================================================================
// DAILY ACTIVITIES & GAMES
// ============================================================================

// Daily challenges
export const dailyChallenges = pgTable("daily_challenges", {
  id: uuid("id").primaryKey().defaultRandom(),
  date: timestamp("date", { withTimezone: true }).notNull().unique(),
  challengeType: text("challenge_type").notNull(), // 'emotion-recognition', 'scenario', 'reflection', 'mindfulness'
  title: text("title").notNull(),
  description: text("description").notNull(),
  content: jsonb("content").$type<{
    // For emotion recognition
    imageUrl?: string;
    correctAnswer?: string;
    options?: string[];
    // For scenarios
    scenario?: string;
    responses?: Array<{
      text: string;
      score: number;
      feedback: string;
    }>;
    // For reflection prompts
    prompt?: string;
    // For mindfulness
    exercise?: {
      title: string;
      duration: number;
      steps: string[];
    };
  }>(),
  xpReward: integer("xp_reward").default(25).notNull(),
  domainId: uuid("domain_id")
    .references(() => eqDomains.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// User daily challenge completions
export const dailyChallengeCompletions = pgTable(
  "daily_challenge_completions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").notNull(),
    challengeId: uuid("challenge_id")
      .notNull()
      .references(() => dailyChallenges.id, { onDelete: "cascade" }),
    response: jsonb("response").$type<any>(), // User's response data
    score: integer("score"), // If applicable
    completedAt: timestamp("completed_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("daily_completions_user_idx").on(table.userId),
    index("daily_completions_challenge_idx").on(table.challengeId),
  ],
);

// Mini-games
export const games = pgTable("games", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  instructions: text("instructions"),
  gameType: text("game_type").notNull(), // 'emotion-recognition', 'scenario-choice', 'memory', 'reflection'
  domainId: uuid("domain_id")
    .references(() => eqDomains.id, { onDelete: "set null" }),
  isPremium: boolean("is_premium").default(false).notNull(),
  difficulty: text("difficulty").default("medium"), // 'easy', 'medium', 'hard'
  estimatedMinutes: integer("estimated_minutes").default(5),
  xpReward: integer("xp_reward").default(15).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// Game content/rounds
export const gameContent = pgTable(
  "game_content",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    gameId: uuid("game_id")
      .notNull()
      .references(() => games.id, { onDelete: "cascade" }),
    content: jsonb("content").$type<{
      // For emotion recognition
      imageUrl?: string;
      audioUrl?: string;
      correctEmotion?: string;
      emotions?: string[];
      // For scenario choice
      scenario?: string;
      choices?: Array<{
        text: string;
        score: number;
        feedback: string;
      }>;
      // For memory games
      pairs?: Array<{
        emotion: string;
        description: string;
      }>;
    }>(),
    difficulty: text("difficulty").default("medium"),
    order: integer("order").default(0),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("game_content_game_idx").on(table.gameId)],
);

// User game sessions
export const gameSessions = pgTable(
  "game_sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").notNull(),
    gameId: uuid("game_id")
      .notNull()
      .references(() => games.id, { onDelete: "cascade" }),
    score: integer("score").default(0).notNull(),
    maxScore: integer("max_score").default(0).notNull(),
    accuracy: real("accuracy"), // Percentage correct
    timeTaken: integer("time_taken"), // Seconds
    roundsCompleted: integer("rounds_completed").default(0).notNull(),
    xpEarned: integer("xp_earned").default(0).notNull(),
    completedAt: timestamp("completed_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("game_sessions_user_idx").on(table.userId),
    index("game_sessions_game_idx").on(table.gameId),
  ],
);

// ============================================================================
// LEARNING CONTENT
// ============================================================================

// Articles and learning resources
export const learningContent = pgTable(
  "learning_content",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    summary: text("summary"),
    content: text("content").notNull(), // Markdown
    contentType: text("content_type").notNull(), // 'article', 'exercise', 'video', 'audio'
    domainId: uuid("domain_id")
      .references(() => eqDomains.id, { onDelete: "set null" }),
    skillId: uuid("skill_id")
      .references(() => eqSkills.id, { onDelete: "set null" }),
    mediaUrl: text("media_url"), // For video/audio content
    thumbnailUrl: text("thumbnail_url"),
    duration: integer("duration"), // In minutes
    isPremium: boolean("is_premium").default(false).notNull(),
    difficulty: text("difficulty").default("beginner"), // 'beginner', 'intermediate', 'advanced'
    tags: jsonb("tags").$type<string[]>(),
    xpReward: integer("xp_reward").default(10).notNull(),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => [
    index("learning_content_domain_idx").on(table.domainId),
    index("learning_content_type_idx").on(table.contentType),
  ],
);

// User learning progress
export const userLearningProgress = pgTable(
  "user_learning_progress",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").notNull(),
    contentId: uuid("content_id")
      .notNull()
      .references(() => learningContent.id, { onDelete: "cascade" }),
    status: text("status").notNull().default("not_started"), // 'not_started', 'in_progress', 'completed'
    progress: integer("progress").default(0), // Percentage (0-100)
    completedAt: timestamp("completed_at", { withTimezone: true }),
    notes: text("notes"), // User notes
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => [
    index("user_learning_user_idx").on(table.userId),
    index("user_learning_content_idx").on(table.contentId),
  ],
);

// ============================================================================
// EMOTION TRACKING (Daily Check-ins)
// ============================================================================

export const emotionCheckIns = pgTable(
  "emotion_check_ins",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").notNull(),
    emotion: text("emotion").notNull(), // Primary emotion
    intensity: integer("intensity").notNull(), // 1-5
    secondaryEmotions: jsonb("secondary_emotions").$type<string[]>(),
    triggers: jsonb("triggers").$type<string[]>(), // What caused this emotion
    notes: text("notes"),
    context: text("context"), // 'morning', 'afternoon', 'evening', 'work', 'home'
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("emotion_check_ins_user_idx").on(table.userId),
    index("emotion_check_ins_date_idx").on(table.createdAt),
  ],
);

// ============================================================================
// JOURNAL ENTRIES
// ============================================================================

export const journalEntries = pgTable(
  "journal_entries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").notNull(),
    title: text("title"),
    content: text("content").notNull(),
    mood: text("mood"), // Optional mood tag
    moodScore: integer("mood_score"), // 1-10 scale
    emotions: jsonb("emotions").$type<string[]>(), // Related emotions
    tags: jsonb("tags").$type<string[]>(), // User-defined tags
    // Prompt that inspired this entry (if any)
    promptId: uuid("prompt_id"),
    promptText: text("prompt_text"),
    // Privacy
    isPrivate: boolean("is_private").default(true).notNull(),
    // Metadata
    wordCount: integer("word_count").default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("journal_entries_user_idx").on(table.userId),
    index("journal_entries_date_idx").on(table.createdAt),
  ],
);

// Journal prompts library
export const journalPrompts = pgTable("journal_prompts", {
  id: uuid("id").primaryKey().defaultRandom(),
  category: text("category").notNull(), // 'reflection', 'gratitude', 'emotion', 'growth', 'relationship'
  promptText: text("prompt_text").notNull(),
  domainId: uuid("domain_id")
    .references(() => eqDomains.id, { onDelete: "set null" }),
  difficulty: text("difficulty").default("beginner"), // 'beginner', 'intermediate', 'advanced'
  isActive: boolean("is_active").default(true).notNull(),
  order: integer("order").default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ============================================================================
// PAYMENTS & SUBSCRIPTIONS (mostly unchanged)
// ============================================================================

export const payments = pgTable(
  "payments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").notNull(),
    reportId: uuid("report_id")
      .references(() => reports.id, { onDelete: "set null" }),
    stripePaymentIntentId: text("stripe_payment_intent_id"),
    amount: bigint("amount", { mode: "number" }).notNull(),
    currency: text("currency").notNull().default("usd"),
    status: text("status").notNull().default("pending"),
    productType: text("product_type").default("report"), // 'report', 'subscription', 'one-time'
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    metadata: jsonb("metadata").$type<Record<string, any>>(),
  },
  (table) => [index("payments_user_idx").on(table.userId)],
);

export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull().unique(),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  plan: text("plan").notNull().default("free"), // 'free', 'trial', 'pro_monthly', 'pro_yearly'
  status: text("status").notNull().default("none"),
  currentPeriodStart: timestamp("current_period_start", { withTimezone: true }),
  currentPeriodEnd: timestamp("current_period_end", { withTimezone: true }),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false).notNull(),
  features: jsonb("features").$type<{
    unlimitedAssessments: boolean;
    premiumReports: boolean;
    premiumGames: boolean;
    learningContent: boolean;
    coaching: boolean;
  }>(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const webhookEvents = pgTable("webhook_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  eventId: text("event_id").notNull().unique(),
  eventType: text("event_type").notNull(),
  processed: boolean("processed").default(false).notNull(),
  processedAt: timestamp("processed_at", { withTimezone: true }),
  receivedAt: timestamp("received_at", { withTimezone: true }).defaultNow().notNull(),
  payload: jsonb("payload").$type<Record<string, any>>(),
  errorMessage: text("error_message"),
  retryCount: bigint("retry_count", { mode: "number" }).default(0).notNull(),
});

// ============================================================================
// RELATIONS
// ============================================================================

export const userRelations = relations(user, ({ many, one }) => ({
  sessions: many(session),
  accounts: many(account),
  profile: one(userProfiles, {
    fields: [user.id],
    references: [userProfiles.userId],
  }),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

export const eqDomainRelations = relations(eqDomains, ({ many }) => ({
  skills: many(eqSkills),
  questions: many(questions),
}));

export const eqSkillRelations = relations(eqSkills, ({ one, many }) => ({
  domain: one(eqDomains, {
    fields: [eqSkills.domainId],
    references: [eqDomains.id],
  }),
  questions: many(questions),
}));

export const questionRelations = relations(questions, ({ one }) => ({
  domain: one(eqDomains, {
    fields: [questions.domainId],
    references: [eqDomains.id],
  }),
  skill: one(eqSkills, {
    fields: [questions.skillId],
    references: [eqSkills.id],
  }),
  assessmentType: one(assessmentTypes, {
    fields: [questions.assessmentTypeId],
    references: [assessmentTypes.id],
  }),
}));

export const assessmentRelations = relations(assessments, ({ one, many }) => ({
  assessmentType: one(assessmentTypes, {
    fields: [assessments.assessmentTypeId],
    references: [assessmentTypes.id],
  }),
  responses: many(assessmentResponses),
  report: one(reports),
}));

export const assessmentResponseRelations = relations(assessmentResponses, ({ one }) => ({
  assessment: one(assessments, {
    fields: [assessmentResponses.assessmentId],
    references: [assessments.id],
  }),
  question: one(questions, {
    fields: [assessmentResponses.questionId],
    references: [questions.id],
  }),
}));

export const gameRelations = relations(games, ({ one, many }) => ({
  domain: one(eqDomains, {
    fields: [games.domainId],
    references: [eqDomains.id],
  }),
  content: many(gameContent),
  sessions: many(gameSessions),
}));

export const gameContentRelations = relations(gameContent, ({ one }) => ({
  game: one(games, {
    fields: [gameContent.gameId],
    references: [games.id],
  }),
}));

export const badgeRelations = relations(badges, ({ many }) => ({
  userBadges: many(userBadges),
}));

export const userBadgeRelations = relations(userBadges, ({ one }) => ({
  badge: one(badges, {
    fields: [userBadges.badgeId],
    references: [badges.id],
  }),
}));

export const learningContentRelations = relations(learningContent, ({ one, many }) => ({
  domain: one(eqDomains, {
    fields: [learningContent.domainId],
    references: [eqDomains.id],
  }),
  skill: one(eqSkills, {
    fields: [learningContent.skillId],
    references: [eqSkills.id],
  }),
  progress: many(userLearningProgress),
}));
