import bcrypt from 'bcryptjs';
import { prisma } from '../database/prisma';

async function main() {
  console.log('🌱 Starting Ascent database seed...');

  // 1. Clean existing records
  await prisma.actionLog.deleteMany();
  await prisma.action.deleteMany();
  await prisma.milestone.deleteMany();
  await prisma.routine.deleteMany();
  await prisma.goal.deleteMany();
  await prisma.reflection.deleteMany();
  await prisma.consistencyLog.deleteMany();
  await prisma.userProfile.deleteMany();
  await prisma.notificationPreference.deleteMany();
  await prisma.user.deleteMany();

  // 2. Create primary user
  const passwordHash = await bcrypt.hash('password123', 10);
  const user = await prisma.user.create({
    data: {
      email: 'alex@ascent.app',
      passwordHash,
      fullName: 'Alex Rivera',
      profile: {
        create: {
          primaryObjective: 'Cultivate intentional habits, learn Spanish, and master physical resilience.',
          preferredProgressStyle: 'BALANCED',
          timezone: 'America/New_York',
        },
      },
      notificationPreferences: {
        create: {
          morningFocusReminder: true,
          morningReminderTime: '07:30',
          eveningCheckInReminder: true,
          eveningReminderTime: '20:30',
          weeklyReflectionReminder: true,
          weeklyReflectionDay: 7,
          weeklyReflectionTime: '18:00',
        },
      },
    },
  });

  console.log(`👤 Created user: ${user.fullName} (${user.email})`);

  const now = new Date();
  const ninetyDaysLater = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
  const sixMonthsLater = new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000);

  // 3. Create Goal 1: Fluent in Spanish
  const goal1 = await prisma.goal.create({
    data: {
      userId: user.id,
      title: 'Fluent in Spanish',
      description: 'Achieve conversational fluency and read literary Spanish effortlessly.',
      whyItMatters: 'Connect authentically with locals during my travels and broaden cognitive horizons.',
      category: 'LEARNING',
      priority: 'HIGH',
      status: 'ACTIVE',
      statusState: 'ON_TRACK',
      progressPercentage: 65.0,
      targetFrequencyPerWeek: 3,
      startDate: new Date(now.getTime() - 21 * 24 * 60 * 60 * 1000), // 3 weeks ago
      targetDate: ninetyDaysLater,
      routines: {
        create: {
          routineType: 'DAYS_OF_WEEK',
          daysOfWeek: JSON.stringify([1, 3, 5]), // Mon, Wed, Fri
          preferredTime: '20:00',
          targetDurationMinutes: 30,
          weeklyFrequencyTarget: 3,
        },
      },
    },
  });

  const m1_1 = await prisma.milestone.create({
    data: {
      goalId: goal1.id,
      title: 'Build Core Vocabulary & Grammar',
      description: 'Master 1,000 top words and irregular verb conjugations',
      sortOrder: 1,
      progressPercentage: 90.0,
      status: 'IN_PROGRESS',
      targetDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
    },
  });

  const m1_2 = await prisma.milestone.create({
    data: {
      goalId: goal1.id,
      title: 'Conversational Confidence',
      description: 'Complete 15 hours of native speaking sessions',
      sortOrder: 2,
      progressPercentage: 35.0,
      status: 'PENDING',
      targetDate: ninetyDaysLater,
    },
  });

  const a1_1 = await prisma.action.create({
    data: {
      goalId: goal1.id,
      milestoneId: m1_1.id,
      title: 'Morning Language Practice - 20 mins',
      description: 'Complete daily lesson on spaced repetition app',
      preferredTime: '08:00',
      estimatedDurationMinutes: 20,
      priority: 'HIGH',
      difficulty: 'EASY',
      status: 'COMPLETED',
      isRecurring: true,
    },
  });

  const a1_2 = await prisma.action.create({
    data: {
      goalId: goal1.id,
      milestoneId: m1_1.id,
      title: '20 New Vocabulary Words & Flashcards',
      description: 'Review deck and add 20 fresh verbs',
      preferredTime: '20:00',
      estimatedDurationMinutes: 25,
      priority: 'MEDIUM',
      difficulty: 'MEDIUM',
      status: 'COMPLETED',
      isRecurring: true,
    },
  });

  const a1_3 = await prisma.action.create({
    data: {
      goalId: goal1.id,
      milestoneId: m1_2.id,
      title: 'Listen to Radio Ambulante Podcast',
      description: 'Active listening session taking notes on idioms',
      preferredTime: '20:30',
      estimatedDurationMinutes: 30,
      priority: 'MEDIUM',
      difficulty: 'HARD',
      status: 'UPCOMING',
      isRecurring: false,
    },
  });

  // 4. Create Goal 2: Strength & Functional Fitness
  const goal2 = await prisma.goal.create({
    data: {
      userId: user.id,
      title: 'Strength & Functional Fitness',
      description: 'Build sustainable power, core stability, and athletic stamina.',
      whyItMatters: 'Cultivate vitality, high energy levels for my daily work, and longevity.',
      category: 'HEALTH',
      priority: 'HIGH',
      status: 'ACTIVE',
      statusState: 'ON_TRACK',
      progressPercentage: 72.0,
      targetFrequencyPerWeek: 4,
      startDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      targetDate: sixMonthsLater,
      routines: {
        create: {
          routineType: 'DAYS_OF_WEEK',
          daysOfWeek: JSON.stringify([1, 3, 5, 7]), // Mon, Wed, Fri, Sun
          preferredTime: '07:30',
          targetDurationMinutes: 45,
          weeklyFrequencyTarget: 4,
        },
      },
    },
  });

  const m2_1 = await prisma.milestone.create({
    data: {
      goalId: goal2.id,
      title: 'Establish 4x Weekly Consistency',
      description: 'Complete 16 consecutive workouts with proper recovery',
      sortOrder: 1,
      progressPercentage: 75.0,
      status: 'IN_PROGRESS',
    },
  });

  const a2_1 = await prisma.action.create({
    data: {
      goalId: goal2.id,
      milestoneId: m2_1.id,
      title: 'Strength Training - Upper Body & Core',
      description: 'Push/pull supersets with 3-minute warm-up',
      preferredTime: '07:30',
      estimatedDurationMinutes: 45,
      priority: 'HIGH',
      difficulty: 'MEDIUM',
      status: 'UPCOMING',
      isRecurring: true,
    },
  });

  const a2_2 = await prisma.action.create({
    data: {
      goalId: goal2.id,
      milestoneId: m2_1.id,
      title: 'Post-Workout Mobility & Joint Stretching',
      description: 'Focus on hips, ankles, and thoracic spine',
      preferredTime: '08:15',
      estimatedDurationMinutes: 15,
      priority: 'MEDIUM',
      difficulty: 'EASY',
      status: 'COMPLETED',
      isRecurring: true,
    },
  });

  // 5. Create Goal 3: Complete Python & Distributed Systems Mastery
  const goal3 = await prisma.goal.create({
    data: {
      userId: user.id,
      title: 'Complete Python & Distributed Systems',
      description: 'Master async concurrency, event-driven pipelines, and high-scale architectures.',
      whyItMatters: 'Lead complex backend engineering initiatives with deep architectural confidence.',
      category: 'CAREER',
      priority: 'MEDIUM',
      status: 'ACTIVE',
      statusState: 'AHEAD',
      progressPercentage: 80.0,
      targetFrequencyPerWeek: 3,
      startDate: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
      targetDate: ninetyDaysLater,
      routines: {
        create: {
          routineType: 'DAYS_OF_WEEK',
          daysOfWeek: JSON.stringify([2, 4, 6]),
          preferredTime: '19:00',
          targetDurationMinutes: 60,
          weeklyFrequencyTarget: 3,
        },
      },
    },
  });

  const m3_1 = await prisma.milestone.create({
    data: {
      goalId: goal3.id,
      title: 'Event-Driven System Patterns',
      description: 'Implement distributed consensus and resilient message queues',
      sortOrder: 1,
      progressPercentage: 85.0,
      status: 'IN_PROGRESS',
    },
  });

  const a3_1 = await prisma.action.create({
    data: {
      goalId: goal3.id,
      milestoneId: m3_1.id,
      title: 'Implement Raft Consensus Protocol Demo',
      description: 'Write peer heartbeats and leader election in Python',
      preferredTime: '19:00',
      estimatedDurationMinutes: 60,
      priority: 'HIGH',
      difficulty: 'HARD',
      status: 'COMPLETED',
      isRecurring: false,
    },
  });

  // 6. Create Action Logs for consistency graph
  const pastDays = [0, 1, 2, 3, 4, 5, 6];
  for (const d of pastDays) {
    const logDate = new Date(now.getTime() - d * 24 * 60 * 60 * 1000);
    await prisma.actionLog.create({
      data: {
        actionId: a1_1.id,
        userId: user.id,
        completedAt: logDate,
        durationSpentMinutes: 25,
        statusOutcome: 'COMPLETED',
        notes: `Completed intentional routine slot for day ${d}`,
      },
    });
  }

  // 7. Create Weekly Reflection
  const weekStart = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000);
  await prisma.reflection.create({
    data: {
      userId: user.id,
      weekStartDate: weekStart,
      weekEndDate: now,
      actionsCompletedCount: 18,
      actionsMissedCount: 2,
      strongestArea: 'Health & Fitness',
      needsAttentionArea: 'Spanish Reading',
      whatWentWell: 'Consistently completed morning fitness routines with high focus. Kept 7-day consistency alive without feeling overwhelmed.',
      whatWasDifficult: 'Late work meetings on Thursday made evening Spanish reading challenging.',
      nextWeekFocus: 'Protect the 8:00 PM routine window and schedule conversational Spanish session on Wednesday.',
      energyMoodRating: 5,
    },
  });

  console.log('✅ Seed completed successfully with 3 rich goals, milestones, actions, and reflection!');
}

main()
  .catch(e => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
