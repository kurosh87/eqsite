// EQ Platform Translation type definitions

export interface Translations {
  common: {
    loading: string;
    error: string;
    retry: string;
    cancel: string;
    save: string;
    delete: string;
    edit: string;
    close: string;
    back: string;
    next: string;
    submit: string;
    search: string;
    filter: string;
    sort: string;
    all: string;
    none: string;
    yes: string;
    no: string;
    or: string;
    and: string;
    continue: string;
    skip: string;
    finish: string;
    start: string;
    complete: string;
    incomplete: string;
    viewResults: string;
    tryAgain: string;
    learnMore: string;
    getStarted: string;
    upgrade: string;
    premium: string;
    free: string;
  };

  nav: {
    home: string;
    assessment: string;
    dashboard: string;
    games: string;
    learn: string;
    profile: string;
    settings: string;
    admin: string;
    signIn: string;
    signUp: string;
    signOut: string;
    language: string;
  };

  home: {
    hero: {
      badge: string;
      title: string;
      titleHighlight: string;
      subtitle: string;
      cta: string;
      ctaSignIn: string;
      freeTest: string;
    };
    stats: {
      users: string;
      usersDesc: string;
      assessments: string;
      assessmentsDesc: string;
      improvement: string;
      improvementDesc: string;
    };
    howItWorks: {
      badge: string;
      title: string;
      subtitle: string;
      step1Title: string;
      step1Desc: string;
      step2Title: string;
      step2Desc: string;
      step3Title: string;
      step3Desc: string;
    };
    features: {
      badge: string;
      title: string;
      subtitle: string;
      scientificTitle: string;
      scientificDesc: string;
      personalizedTitle: string;
      personalizedDesc: string;
      progressTitle: string;
      progressDesc: string;
      gamesTitle: string;
      gamesDesc: string;
    };
    domains: {
      badge: string;
      title: string;
      subtitle: string;
      selfAwareness: string;
      selfAwarenessDesc: string;
      selfRegulation: string;
      selfRegulationDesc: string;
      motivation: string;
      motivationDesc: string;
      empathy: string;
      empathyDesc: string;
      socialSkills: string;
      socialSkillsDesc: string;
    };
    pricing: {
      badge: string;
      title: string;
      subtitle: string;
      freeTitle: string;
      freePrice: string;
      proTitle: string;
      proPrice: string;
      proYearlyPrice: string;
      recommended: string;
      freeFeatures: string[];
      proFeatures: string[];
      startFree: string;
      goPro: string;
    };
    cta: {
      title: string;
      subtitle: string;
      button: string;
    };
    testimonial: {
      quote: string;
      author: string;
      role: string;
    };
  };

  assessment: {
    title: string;
    subtitle: string;
    selectType: string;
    quickTest: {
      name: string;
      description: string;
      duration: string;
      questions: string;
    };
    comprehensive: {
      name: string;
      description: string;
      duration: string;
      questions: string;
    };
    inProgress: {
      question: string;
      of: string;
      progress: string;
      timeRemaining: string;
    };
    likert: {
      stronglyDisagree: string;
      disagree: string;
      neutral: string;
      agree: string;
      stronglyAgree: string;
    };
    scenario: {
      title: string;
      chooseResponse: string;
    };
    complete: {
      title: string;
      subtitle: string;
      viewResults: string;
      takeAnother: string;
    };
  };

  results: {
    title: string;
    overallScore: string;
    percentile: string;
    percentileDesc: string;
    domainScores: string;
    strengths: string;
    areasForGrowth: string;
    recommendations: string;
    shareResults: string;
    downloadReport: string;
    premiumReport: string;
    premiumReportDesc: string;
    unlockReport: string;
    comparison: {
      title: string;
      vsAverage: string;
      vsLastTime: string;
      improvement: string;
    };
  };

  domains: {
    selfAwareness: {
      name: string;
      description: string;
      skills: {
        emotionalAwareness: string;
        accurateSelfAssessment: string;
        selfConfidence: string;
      };
    };
    selfRegulation: {
      name: string;
      description: string;
      skills: {
        selfControl: string;
        trustworthiness: string;
        adaptability: string;
      };
    };
    motivation: {
      name: string;
      description: string;
      skills: {
        achievementDrive: string;
        commitment: string;
        optimism: string;
      };
    };
    empathy: {
      name: string;
      description: string;
      skills: {
        understandingOthers: string;
        serviceOrientation: string;
        leveragingDiversity: string;
      };
    };
    socialSkills: {
      name: string;
      description: string;
      skills: {
        influence: string;
        communication: string;
        conflictManagement: string;
        collaboration: string;
      };
    };
  };

  dashboard: {
    welcome: string;
    subtitle: string;
    stats: {
      currentLevel: string;
      xpProgress: string;
      currentStreak: string;
      streakDays: string;
      totalAssessments: string;
      avgScore: string;
    };
    quickActions: {
      title: string;
      takeAssessment: string;
      playGame: string;
      dailyChallenge: string;
      checkIn: string;
    };
    progress: {
      title: string;
      subtitle: string;
      noData: string;
      noDataDesc: string;
    };
    recentActivity: {
      title: string;
      empty: string;
      emptyDesc: string;
    };
    achievements: {
      title: string;
      viewAll: string;
      locked: string;
      earned: string;
    };
    explore: {
      title: string;
      subtitle: string;
    };
  };

  games: {
    title: string;
    subtitle: string;
    play: string;
    highScore: string;
    lastPlayed: string;
    emotionFaces: {
      name: string;
      description: string;
      instructions: string;
    };
    scenarioChoice: {
      name: string;
      description: string;
      instructions: string;
    };
    emotionMemory: {
      name: string;
      description: string;
      instructions: string;
    };
    mindfulMoment: {
      name: string;
      description: string;
      instructions: string;
    };
    results: {
      title: string;
      score: string;
      accuracy: string;
      xpEarned: string;
      playAgain: string;
      backToGames: string;
    };
  };

  learn: {
    title: string;
    subtitle: string;
    categories: {
      all: string;
      articles: string;
      exercises: string;
      videos: string;
    };
    progress: {
      notStarted: string;
      inProgress: string;
      completed: string;
    };
    difficulty: {
      beginner: string;
      intermediate: string;
      advanced: string;
    };
    duration: string;
    xpReward: string;
    startLearning: string;
    continueLearning: string;
    markComplete: string;
  };

  checkIn: {
    title: string;
    subtitle: string;
    howFeeling: string;
    intensity: string;
    intensityLow: string;
    intensityHigh: string;
    triggers: string;
    triggersPlaceholder: string;
    notes: string;
    notesPlaceholder: string;
    emotions: {
      happy: string;
      sad: string;
      angry: string;
      anxious: string;
      calm: string;
      excited: string;
      frustrated: string;
      grateful: string;
      lonely: string;
      hopeful: string;
      overwhelmed: string;
      content: string;
    };
    submit: string;
    history: string;
    streak: string;
  };

  gamification: {
    level: string;
    xp: string;
    xpToNext: string;
    streak: string;
    streakDays: string;
    badges: string;
    achievements: string;
    leaderboard: string;
    rank: string;
    dailyChallenge: string;
    challengeComplete: string;
    newBadge: string;
    levelUp: string;
  };

  profile: {
    title: string;
    account: string;
    email: string;
    displayName: string;
    preferences: string;
    notifications: string;
    dailyReminder: string;
    reminderTime: string;
    focusAreas: string;
    sessions: string;
    stats: string;
    dangerZone: string;
    deleteAccount: string;
    deleteWarning: string;
  };

  subscription: {
    currentPlan: string;
    free: string;
    pro: string;
    proMonthly: string;
    proYearly: string;
    upgrade: string;
    manage: string;
    features: {
      unlimitedAssessments: string;
      premiumReports: string;
      allGames: string;
      learningContent: string;
      prioritySupport: string;
    };
    trial: string;
    trialDays: string;
    cancel: string;
    renews: string;
  };

  auth: {
    signIn: {
      title: string;
      subtitle: string;
      email: string;
      password: string;
      forgotPassword: string;
      noAccount: string;
      signUp: string;
    };
    signUp: {
      title: string;
      subtitle: string;
      name: string;
      email: string;
      password: string;
      confirmPassword: string;
      hasAccount: string;
      signIn: string;
    };
    forgotPassword: {
      title: string;
      subtitle: string;
      email: string;
      send: string;
      backToSignIn: string;
    };
    resetPassword: {
      title: string;
      subtitle: string;
      password: string;
      confirm: string;
      reset: string;
    };
  };

  legal: {
    privacy: string;
    terms: string;
  };

  footer: {
    description: string;
    product: string;
    account: string;
    legal: string;
    copyright: string;
  };

  errors: {
    generic: string;
    notFound: string;
    notFoundDesc: string;
    unauthorized: string;
    rateLimit: string;
    serverError: string;
    assessmentFailed: string;
    noQuestions: string;
    scoringFailed: string;
  };

  a11y: {
    skipToContent: string;
    mainNavigation: string;
    userMenu: string;
    languageSelector: string;
    toggleTheme: string;
    colorScheme: string;
    closeMenu: string;
    openMenu: string;
    selectEmotion: string;
    selectAnswer: string;
  };
}
