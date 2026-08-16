import { Response } from 'express';
import { z } from 'zod';
import { prisma } from '../../database/prisma';
import { AuthRequest } from '../../middleware/auth';

const saveReflectionSchema = z.object({
  whatWentWell: z.string().optional(),
  whatWasDifficult: z.string().optional(),
  nextWeekFocus: z.string().optional(),
  energyMoodRating: z.number().min(1).max(5).default(4),
  strongestArea: z.string().optional(),
  needsAttentionArea: z.string().optional(),
});

export const getWeeklyReflectionSummary = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const now = new Date();
    
    // Start of current week (Monday)
    const dayOfWeek = now.getDay();
    const normalizedDay = dayOfWeek === 0 ? 7 : dayOfWeek;
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - (normalizedDay - 1));
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    // Fetch action logs this week
    const logs = await prisma.actionLog.findMany({
      where: {
        userId,
        completedAt: { gte: weekStart, lte: weekEnd },
      },
      include: {
        action: {
          include: { goal: true },
        },
      },
    });

    const completedCount = logs.filter(l => l.statusOutcome === 'COMPLETED').length;
    const skippedCount = logs.filter(l => l.statusOutcome === 'SKIPPED').length;

    // Determine strongest & attention areas from goal categories
    const categoryCounts: Record<string, number> = {};
    logs.forEach(l => {
      const cat = l.action?.goal?.category || 'PERSONAL';
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });

    const sortedCategories = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]);
    const strongestArea = sortedCategories.length > 0 ? sortedCategories[0][0] : 'Health & Consistency';

    // Check existing reflection for this week
    const existingReflection = await prisma.reflection.findFirst({
      where: {
        userId,
        weekStartDate: { gte: weekStart },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      weekStartDate: weekStart,
      weekEndDate: weekEnd,
      actionsCompletedCount: completedCount,
      actionsRescheduledOrSkippedCount: skippedCount,
      strongestArea: existingReflection?.strongestArea || strongestArea,
      needsAttentionArea: existingReflection?.needsAttentionArea || 'Reading & Mindset',
      reflection: existingReflection,
      consistencyRate: 88,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

export const saveWeeklyReflection = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const body = saveReflectionSchema.parse(req.body);
    const now = new Date();

    const dayOfWeek = now.getDay();
    const normalizedDay = dayOfWeek === 0 ? 7 : dayOfWeek;
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - (normalizedDay - 1));
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    const logs = await prisma.actionLog.findMany({
      where: {
        userId,
        completedAt: { gte: weekStart, lte: weekEnd },
      },
    });

    const completedCount = logs.filter(l => l.statusOutcome === 'COMPLETED').length;
    const missedCount = logs.filter(l => l.statusOutcome === 'SKIPPED').length;

    const reflection = await prisma.reflection.create({
      data: {
        userId,
        weekStartDate: weekStart,
        weekEndDate: weekEnd,
        actionsCompletedCount: completedCount,
        actionsMissedCount: missedCount,
        strongestArea: body.strongestArea || 'Health & Fitness',
        needsAttentionArea: body.needsAttentionArea || 'Learning & Skills',
        whatWentWell: body.whatWentWell,
        whatWasDifficult: body.whatWasDifficult,
        nextWeekFocus: body.nextWeekFocus,
        energyMoodRating: body.energyMoodRating,
      },
    });

    res.status(201).json(reflection);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
      return;
    }
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};
