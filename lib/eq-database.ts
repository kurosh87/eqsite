import { db } from "./db";
import { eq, desc, and, sql, gte, lte } from "drizzle-orm";
import {
  eqDomains,
  eqSkills,
  assessmentTypes,
  questions,
  assessments,
  assessmentResponses,
  reports,
  userProfiles,
  badges,
  userBadges,
  games,
  gameContent,
  gameSessions,
  dailyChallenges,
  dailyChallengeCompletions,
  emotionCheckIns,
  learningContent,
  userLearningProgress,
} from "@/app/schema/schema";

// ============================================================================
// EQ DOMAINS & SKILLS
// ============================================================================

export async function getEqDomains() {
  return db.select().from(eqDomains).orderBy(eqDomains.order);
}

export async function getEqDomainBySlug(slug: string) {
  const results = await db
    .select()
    .from(eqDomains)
    .where(eq(eqDomains.slug, slug))
    .limit(1);
  return results[0] || null;
}

export async function getSkillsForDomain(domainId: string) {
  return db
    .select()
    .from(eqSkills)
    .where(eq(eqSkills.domainId, domainId))
    .orderBy(eqSkills.order);
}

export async function getAllSkills() {
  return db
    .select({
      skill: eqSkills,
      domain: eqDomains,
    })
    .from(eqSkills)
    .innerJoin(eqDomains, eq(eqSkills.domainId, eqDomains.id))
    .orderBy(eqDomains.order, eqSkills.order);
}

// ============================================================================
// ASSESSMENT TYPES & QUESTIONS
// ============================================================================

export async function getAssessmentTypes(includeInactive = false) {
  const query = db.select().from(assessmentTypes);
  if (!includeInactive) {
    return query.where(eq(assessmentTypes.isActive, true)).orderBy(assessmentTypes.order);
  }
  return query.orderBy(assessmentTypes.order);
}

export async function getAssessmentTypeBySlug(slug: string) {
  const results = await db
    .select()
    .from(assessmentTypes)
    .where(eq(assessmentTypes.slug, slug))
    .limit(1);
  return results[0] || null;
}

export async function getQuestionsForAssessment(assessmentTypeSlug: string) {
  const assessmentType = await getAssessmentTypeBySlug(assessmentTypeSlug);
  if (!assessmentType) return [];

  // Get questions for this assessment type, or general questions if none specific
  const specificQuestions = await db
    .select({
      question: questions,
      domain: eqDomains,
      skill: eqSkills,
    })
    .from(questions)
    .innerJoin(eqDomains, eq(questions.domainId, eqDomains.id))
    .leftJoin(eqSkills, eq(questions.skillId, eqSkills.id))
    .where(
      and(
        eq(questions.assessmentTypeId, assessmentType.id),
        eq(questions.isActive, true)
      )
    )
    .orderBy(questions.order);

  if (specificQuestions.length > 0) {
    return specificQuestions;
  }

  // Fall back to all active questions, limited by assessment type's question count
  return db
    .select({
      question: questions,
      domain: eqDomains,
      skill: eqSkills,
    })
    .from(questions)
    .innerJoin(eqDomains, eq(questions.domainId, eqDomains.id))
    .leftJoin(eqSkills, eq(questions.skillId, eqSkills.id))
    .where(eq(questions.isActive, true))
    .orderBy(questions.order)
    .limit(assessmentType.questionCount);
}

export async function getQuestionById(questionId: string) {
  const results = await db
    .select({
      question: questions,
      domain: eqDomains,
      skill: eqSkills,
    })
    .from(questions)
    .innerJoin(eqDomains, eq(questions.domainId, eqDomains.id))
    .leftJoin(eqSkills, eq(questions.skillId, eqSkills.id))
    .where(eq(questions.id, questionId))
    .limit(1);
  return results[0] || null;
}

// ============================================================================
// USER ASSESSMENTS
// ============================================================================

export async function createAssessment(
  userId: string,
  assessmentTypeId: string
) {
  const results = await db
    .insert(assessments)
    .values({
      userId,
      assessmentTypeId,
      status: "in_progress",
    })
    .returning();
  return results[0];
}

export async function getAssessmentById(assessmentId: string) {
  const results = await db
    .select({
      assessment: assessments,
      assessmentType: assessmentTypes,
    })
    .from(assessments)
    .innerJoin(assessmentTypes, eq(assessments.assessmentTypeId, assessmentTypes.id))
    .where(eq(assessments.id, assessmentId))
    .limit(1);
  return results[0] || null;
}

export async function getUserAssessments(userId: string, limit = 10) {
  return db
    .select({
      assessment: assessments,
      assessmentType: assessmentTypes,
    })
    .from(assessments)
    .innerJoin(assessmentTypes, eq(assessments.assessmentTypeId, assessmentTypes.id))
    .where(eq(assessments.userId, userId))
    .orderBy(desc(assessments.startedAt))
    .limit(limit);
}

export async function saveAssessmentResponse(
  assessmentId: string,
  questionId: string,
  response: number,
  responseTime?: number
) {
  const results = await db
    .insert(assessmentResponses)
    .values({
      assessmentId,
      questionId,
      response,
      responseTime,
    })
    .returning();
  return results[0];
}

export async function getAssessmentResponses(assessmentId: string) {
  return db
    .select({
      response: assessmentResponses,
      question: questions,
      domain: eqDomains,
    })
    .from(assessmentResponses)
    .innerJoin(questions, eq(assessmentResponses.questionId, questions.id))
    .innerJoin(eqDomains, eq(questions.domainId, eqDomains.id))
    .where(eq(assessmentResponses.assessmentId, assessmentId));
}

export async function completeAssessment(
  assessmentId: string,
  scores: {
    overallScore: number;
    domainScores: Record<string, number>;
    skillScores?: Record<string, number>;
    percentile?: number;
    timeTaken?: number;
  }
) {
  const results = await db
    .update(assessments)
    .set({
      status: "completed",
      completedAt: new Date(),
      overallScore: scores.overallScore,
      domainScores: scores.domainScores,
      skillScores: scores.skillScores,
      percentile: scores.percentile,
      timeTaken: scores.timeTaken,
    })
    .where(eq(assessments.id, assessmentId))
    .returning();
  return results[0];
}

// ============================================================================
// SCORING LOGIC
// ============================================================================

export function calculateScores(
  responses: Array<{
    response: typeof assessmentResponses.$inferSelect;
    question: typeof questions.$inferSelect;
    domain: typeof eqDomains.$inferSelect;
  }>
) {
  const domainScores: Record<string, { total: number; count: number; maxPossible: number }> = {};
  const skillScores: Record<string, { total: number; count: number; maxPossible: number }> = {};

  for (const { response, question, domain } of responses) {
    // Initialize domain if not exists
    if (!domainScores[domain.slug]) {
      domainScores[domain.slug] = { total: 0, count: 0, maxPossible: 0 };
    }

    // Calculate score (reverse if needed)
    let score = response.response;
    if (question.isReversed) {
      score = 6 - score; // For 1-5 scale, reverse: 1->5, 2->4, 3->3, 4->2, 5->1
    }

    // Apply weight
    const weightedScore = score * (question.weight || 1);
    const maxScore = 5 * (question.weight || 1);

    domainScores[domain.slug].total += weightedScore;
    domainScores[domain.slug].count += 1;
    domainScores[domain.slug].maxPossible += maxScore;

    // Track skill scores if skill exists
    if (question.skillId) {
      if (!skillScores[question.skillId]) {
        skillScores[question.skillId] = { total: 0, count: 0, maxPossible: 0 };
      }
      skillScores[question.skillId].total += weightedScore;
      skillScores[question.skillId].count += 1;
      skillScores[question.skillId].maxPossible += maxScore;
    }
  }

  // Convert to percentages (0-100)
  const domainPercentages: Record<string, number> = {};
  let totalScore = 0;
  let totalMaxPossible = 0;

  for (const [domain, data] of Object.entries(domainScores)) {
    domainPercentages[domain] = Math.round((data.total / data.maxPossible) * 100);
    totalScore += data.total;
    totalMaxPossible += data.maxPossible;
  }

  const skillPercentages: Record<string, number> = {};
  for (const [skillId, data] of Object.entries(skillScores)) {
    skillPercentages[skillId] = Math.round((data.total / data.maxPossible) * 100);
  }

  const overallScore = Math.round((totalScore / totalMaxPossible) * 100);

  return {
    overallScore,
    domainScores: domainPercentages,
    skillScores: skillPercentages,
  };
}

export async function calculatePercentile(overallScore: number): Promise<number> {
  // Get count of completed assessments with lower scores
  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(assessments)
    .where(
      and(
        eq(assessments.status, "completed"),
        sql`${assessments.overallScore} < ${overallScore}`
      )
    );

  const lowerCount = result[0]?.count || 0;

  // Get total completed assessments
  const totalResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(assessments)
    .where(eq(assessments.status, "completed"));

  const totalCount = totalResult[0]?.count || 1;

  return Math.round((lowerCount / totalCount) * 100);
}

// ============================================================================
// USER PROFILES & GAMIFICATION
// ============================================================================

export async function getOrCreateUserProfile(userId: string) {
  const existing = await db
    .select()
    .from(userProfiles)
    .where(eq(userProfiles.userId, userId))
    .limit(1);

  if (existing[0]) {
    return existing[0];
  }

  const results = await db
    .insert(userProfiles)
    .values({ userId })
    .returning();
  return results[0];
}

export async function updateUserProfile(
  userId: string,
  updates: Partial<typeof userProfiles.$inferInsert>
) {
  const results = await db
    .update(userProfiles)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(userProfiles.userId, userId))
    .returning();
  return results[0];
}

export async function addXp(userId: string, xpAmount: number) {
  const profile = await getOrCreateUserProfile(userId);

  let newXp = profile.xp + xpAmount;
  let newLevel = profile.level;
  let xpToNext = profile.xpToNextLevel;

  // Level up logic
  while (newXp >= xpToNext) {
    newXp -= xpToNext;
    newLevel += 1;
    xpToNext = Math.floor(xpToNext * 1.5); // Each level requires 50% more XP
  }

  return updateUserProfile(userId, {
    xp: newXp,
    level: newLevel,
    xpToNextLevel: xpToNext,
  });
}

export async function updateStreak(userId: string) {
  const profile = await getOrCreateUserProfile(userId);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const lastActivity = profile.lastActivityDate;
  let newStreak = profile.currentStreak;

  if (lastActivity) {
    const lastDate = new Date(lastActivity);
    lastDate.setHours(0, 0, 0, 0);

    const diffDays = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      // Same day, no change
      return profile;
    } else if (diffDays === 1) {
      // Consecutive day, increment streak
      newStreak += 1;
    } else {
      // Streak broken
      newStreak = 1;
    }
  } else {
    newStreak = 1;
  }

  const longestStreak = Math.max(newStreak, profile.longestStreak);

  return updateUserProfile(userId, {
    currentStreak: newStreak,
    longestStreak,
    lastActivityDate: new Date(),
  });
}

// ============================================================================
// BADGES
// ============================================================================

export async function getAllBadges() {
  return db.select().from(badges).orderBy(badges.order);
}

export async function getUserBadges(userId: string) {
  return db
    .select({
      userBadge: userBadges,
      badge: badges,
    })
    .from(userBadges)
    .innerJoin(badges, eq(userBadges.badgeId, badges.id))
    .where(eq(userBadges.userId, userId))
    .orderBy(desc(userBadges.earnedAt));
}

export async function awardBadge(userId: string, badgeId: string) {
  // Check if already has badge
  const existing = await db
    .select()
    .from(userBadges)
    .where(and(eq(userBadges.userId, userId), eq(userBadges.badgeId, badgeId)))
    .limit(1);

  if (existing[0]) {
    return null; // Already has badge
  }

  const results = await db
    .insert(userBadges)
    .values({ userId, badgeId })
    .returning();
  return results[0];
}

export async function checkAndAwardBadges(userId: string) {
  const profile = await getOrCreateUserProfile(userId);
  const allBadges = await getAllBadges();
  const userBadgesList = await getUserBadges(userId);
  const earnedBadgeIds = new Set(userBadgesList.map(ub => ub.badge.id));

  const newBadges: typeof badges.$inferSelect[] = [];

  for (const badge of allBadges) {
    if (earnedBadgeIds.has(badge.id)) continue;

    const requirement = badge.requirement as {
      type: string;
      value: number;
      domain?: string;
    } | null;

    if (!requirement) continue;

    let earned = false;

    switch (requirement.type) {
      case "assessments_completed":
        earned = profile.totalAssessments >= requirement.value;
        break;
      case "streak_days":
        earned = profile.currentStreak >= requirement.value;
        break;
      case "games_played":
        earned = profile.totalGamesPlayed >= requirement.value;
        break;
      case "level_reached":
        earned = profile.level >= requirement.value;
        break;
      // Domain scores would need to be checked against latest assessment
    }

    if (earned) {
      await awardBadge(userId, badge.id);
      newBadges.push(badge);
      // Award XP for badge
      await addXp(userId, badge.xpReward);
    }
  }

  return newBadges;
}

// ============================================================================
// GAMES
// ============================================================================

export async function getGames(includeInactive = false) {
  const query = db.select().from(games);
  if (!includeInactive) {
    return query.where(eq(games.isActive, true));
  }
  return query;
}

export async function getGameBySlug(slug: string) {
  const results = await db
    .select()
    .from(games)
    .where(eq(games.slug, slug))
    .limit(1);
  return results[0] || null;
}

export async function getGameContent(gameId: string) {
  return db
    .select()
    .from(gameContent)
    .where(and(eq(gameContent.gameId, gameId), eq(gameContent.isActive, true)))
    .orderBy(gameContent.order);
}

export async function saveGameSession(
  userId: string,
  gameId: string,
  data: {
    score: number;
    maxScore: number;
    accuracy?: number;
    timeTaken?: number;
    roundsCompleted: number;
    xpEarned: number;
  }
) {
  const results = await db
    .insert(gameSessions)
    .values({
      userId,
      gameId,
      ...data,
    })
    .returning();

  // Update profile stats
  const profile = await getOrCreateUserProfile(userId);
  await updateUserProfile(userId, {
    totalGamesPlayed: profile.totalGamesPlayed + 1,
  });

  // Add XP
  await addXp(userId, data.xpEarned);

  // Update streak
  await updateStreak(userId);

  // Check for new badges
  await checkAndAwardBadges(userId);

  return results[0];
}

export async function getUserGameHistory(userId: string, gameId?: string, limit = 10) {
  const conditions = [eq(gameSessions.userId, userId)];
  if (gameId) {
    conditions.push(eq(gameSessions.gameId, gameId));
  }

  return db
    .select({
      session: gameSessions,
      game: games,
    })
    .from(gameSessions)
    .innerJoin(games, eq(gameSessions.gameId, games.id))
    .where(and(...conditions))
    .orderBy(desc(gameSessions.completedAt))
    .limit(limit);
}

// ============================================================================
// DAILY CHALLENGES
// ============================================================================

export async function getTodaysChallenge() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const results = await db
    .select()
    .from(dailyChallenges)
    .where(
      and(
        gte(dailyChallenges.date, today),
        lte(dailyChallenges.date, tomorrow)
      )
    )
    .limit(1);

  return results[0] || null;
}

export async function hasCompletedTodaysChallenge(userId: string) {
  const challenge = await getTodaysChallenge();
  if (!challenge) return false;

  const results = await db
    .select()
    .from(dailyChallengeCompletions)
    .where(
      and(
        eq(dailyChallengeCompletions.userId, userId),
        eq(dailyChallengeCompletions.challengeId, challenge.id)
      )
    )
    .limit(1);

  return !!results[0];
}

export async function completeDailyChallenge(
  userId: string,
  challengeId: string,
  response: unknown,
  score?: number
) {
  const results = await db
    .insert(dailyChallengeCompletions)
    .values({
      userId,
      challengeId,
      response,
      score,
    })
    .returning();

  // Get challenge XP reward
  const challenge = await db
    .select()
    .from(dailyChallenges)
    .where(eq(dailyChallenges.id, challengeId))
    .limit(1);

  if (challenge[0]) {
    await addXp(userId, challenge[0].xpReward);
  }

  // Update streak
  await updateStreak(userId);

  // Check for badges
  await checkAndAwardBadges(userId);

  return results[0];
}

// ============================================================================
// EMOTION CHECK-INS
// ============================================================================

export async function createEmotionCheckIn(
  userId: string,
  data: {
    emotion: string;
    intensity: number;
    secondaryEmotions?: string[];
    triggers?: string[];
    notes?: string;
    context?: string;
  }
) {
  const results = await db
    .insert(emotionCheckIns)
    .values({
      userId,
      ...data,
    })
    .returning();

  // Update streak
  await updateStreak(userId);

  // Award small XP for check-in
  await addXp(userId, 5);

  return results[0];
}

export async function getUserCheckIns(userId: string, limit = 30) {
  return db
    .select()
    .from(emotionCheckIns)
    .where(eq(emotionCheckIns.userId, userId))
    .orderBy(desc(emotionCheckIns.createdAt))
    .limit(limit);
}

// ============================================================================
// LEARNING CONTENT
// ============================================================================

export async function getLearningContent(filters?: {
  contentType?: string;
  domainId?: string;
  isPremium?: boolean;
}) {
  const conditions = [eq(learningContent.isActive, true)];

  if (filters?.contentType) {
    conditions.push(eq(learningContent.contentType, filters.contentType));
  }
  if (filters?.domainId) {
    conditions.push(eq(learningContent.domainId, filters.domainId));
  }
  if (filters?.isPremium !== undefined) {
    conditions.push(eq(learningContent.isPremium, filters.isPremium));
  }

  return db
    .select()
    .from(learningContent)
    .where(and(...conditions))
    .orderBy(learningContent.publishedAt);
}

export async function getLearningContentBySlug(slug: string) {
  const results = await db
    .select()
    .from(learningContent)
    .where(eq(learningContent.slug, slug))
    .limit(1);
  return results[0] || null;
}

export async function getUserLearningProgress(userId: string) {
  return db
    .select({
      progress: userLearningProgress,
      content: learningContent,
    })
    .from(userLearningProgress)
    .innerJoin(learningContent, eq(userLearningProgress.contentId, learningContent.id))
    .where(eq(userLearningProgress.userId, userId));
}

export async function updateLearningProgress(
  userId: string,
  contentId: string,
  status: string,
  progress: number
) {
  const existing = await db
    .select()
    .from(userLearningProgress)
    .where(
      and(
        eq(userLearningProgress.userId, userId),
        eq(userLearningProgress.contentId, contentId)
      )
    )
    .limit(1);

  if (existing[0]) {
    return db
      .update(userLearningProgress)
      .set({
        status,
        progress,
        completedAt: status === "completed" ? new Date() : null,
        updatedAt: new Date(),
      })
      .where(eq(userLearningProgress.id, existing[0].id))
      .returning();
  }

  return db
    .insert(userLearningProgress)
    .values({
      userId,
      contentId,
      status,
      progress,
      completedAt: status === "completed" ? new Date() : null,
    })
    .returning();
}

// ============================================================================
// STATISTICS & REPORTS
// ============================================================================

export async function getUserStats(userId: string) {
  const profile = await getOrCreateUserProfile(userId);

  // Get assessment stats
  const assessmentStats = await db
    .select({
      count: sql<number>`count(*)`,
      avgScore: sql<number>`avg(${assessments.overallScore})`,
    })
    .from(assessments)
    .where(
      and(
        eq(assessments.userId, userId),
        eq(assessments.status, "completed")
      )
    );

  // Get badge count
  const badgeCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(userBadges)
    .where(eq(userBadges.userId, userId));

  return {
    profile,
    assessments: {
      total: assessmentStats[0]?.count || 0,
      averageScore: Math.round(assessmentStats[0]?.avgScore || 0),
    },
    badges: badgeCount[0]?.count || 0,
  };
}
