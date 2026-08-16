import { Response } from 'express';
import { z } from 'zod';
import { prisma } from '../../database/prisma';
import { AuthRequest } from '../../middleware/auth';
import { calculateGoalStatus } from '../status-engine/statusCalculator';

const createGoalSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  whyItMatters: z.string().optional(),
  category: z.string().default('PERSONAL'),
  customCategoryName: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  startDate: z.string().optional(),
  targetDate: z.string().optional(),
  targetFrequencyPerWeek: z.number().min(1).max(7).default(3),
  routine: z.object({
    routineType: z.enum(['DAYS_OF_WEEK', 'FREQUENCY_BASED']).default('DAYS_OF_WEEK'),
    daysOfWeek: z.array(z.number()).default([1, 3, 5]),
    preferredTime: z.string().default('08:00'),
    targetDurationMinutes: z.number().default(30),
  }).optional(),
  milestones: z.array(z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    targetDate: z.string().optional(),
    actions: z.array(z.object({
      title: z.string().min(1),
      estimatedDurationMinutes: z.number().default(30),
      difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).default('MEDIUM'),
      preferredTime: z.string().optional(),
      dueDate: z.string().optional(),
    })).optional(),
  })).optional(),
});

export const createGoal = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const validated = createGoalSchema.parse(req.body);
    const userId = req.userId!;

    const goal = await prisma.goal.create({
      data: {
        userId,
        title: validated.title,
        description: validated.description,
        whyItMatters: validated.whyItMatters,
        category: validated.category,
        customCategoryName: validated.customCategoryName,
        priority: validated.priority,
        startDate: validated.startDate ? new Date(validated.startDate) : new Date(),
        targetDate: validated.targetDate ? new Date(validated.targetDate) : null,
        targetFrequencyPerWeek: validated.targetFrequencyPerWeek,
        routines: validated.routine ? {
          create: {
            routineType: validated.routine.routineType,
            daysOfWeek: JSON.stringify(validated.routine.daysOfWeek),
            preferredTime: validated.routine.preferredTime,
            targetDurationMinutes: validated.routine.targetDurationMinutes,
            weeklyFrequencyTarget: validated.targetFrequencyPerWeek,
          },
        } : undefined,
        milestones: validated.milestones ? {
          create: validated.milestones.map((m, idx) => ({
            title: m.title,
            description: m.description,
            sortOrder: idx + 1,
            targetDate: m.targetDate ? new Date(m.targetDate) : null,
            actions: m.actions ? {
              create: m.actions.map(a => ({
                title: a.title,
                estimatedDurationMinutes: a.estimatedDurationMinutes,
                difficulty: a.difficulty,
                preferredTime: a.preferredTime,
                dueDate: a.dueDate ? new Date(a.dueDate) : null,
                goalId: '', // Will be linked automatically by Prisma relation
              })),
            } : undefined,
          })),
        } : undefined,
      },
      include: {
        milestones: { include: { actions: true } },
        actions: true,
        routines: true,
      },
    });

    res.status(201).json(goal);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
      return;
    }
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

export const getGoals = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const { status, category } = req.query;

    const whereClause: any = { userId };
    if (status) whereClause.status = String(status);
    if (category) whereClause.category = String(category);

    const goals = await prisma.goal.findMany({
      where: whereClause,
      include: {
        milestones: {
          include: { actions: true },
          orderBy: { sortOrder: 'asc' },
        },
        actions: true,
        routines: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Enrich with real-time calculated status
    const enrichedGoals = goals.map(g => {
      const allActions = g.actions.length > 0 
        ? g.actions 
        : g.milestones.flatMap(m => m.actions);
      
      const total = allActions.length;
      const completed = allActions.filter(a => a.status === 'COMPLETED').length;
      const missed = allActions.filter(a => a.status === 'MISSED').length;

      const calc = calculateGoalStatus({
        startDate: g.startDate,
        targetDate: g.targetDate,
        totalActions: total,
        completedActions: completed,
        missedActionsLast14Days: missed,
        scheduledActionsLast14Days: Math.max(1, total),
      });

      return {
        ...g,
        progressPercentage: calc.progressPercentage,
        statusState: calc.statusState,
        velocityFactor: calc.velocityFactor,
        expectedProgress: calc.expectedProgress,
        statusNote: calc.statusNote,
        actionsCount: total,
        completedActionsCount: completed,
      };
    });

    res.json(enrichedGoals);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

export const getGoalById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const userId = req.userId!;

    const goal = await prisma.goal.findFirst({
      where: { id, userId },
      include: {
        milestones: {
          include: {
            actions: {
              include: { actionLogs: true },
              orderBy: { createdAt: 'asc' },
            },
          },
          orderBy: { sortOrder: 'asc' },
        },
        actions: {
          include: { actionLogs: true },
          orderBy: { createdAt: 'asc' },
        },
        routines: true,
      },
    });

    if (!goal) {
      res.status(404).json({ error: 'Goal not found' });
      return;
    }

    const allActions = goal.actions && goal.actions.length > 0
      ? goal.actions
      : (goal.milestones || []).flatMap((m: any) => m.actions || []);

    const total = allActions.length;
    const completed = allActions.filter((a: any) => a.status === 'COMPLETED').length;
    const missed = allActions.filter((a: any) => a.status === 'MISSED').length;

    const calc = calculateGoalStatus({
      startDate: goal.startDate,
      targetDate: goal.targetDate,
      totalActions: total,
      completedActions: completed,
      missedActionsLast14Days: missed,
      scheduledActionsLast14Days: Math.max(1, total),
    });

    res.json({
      ...goal,
      progressPercentage: calc.progressPercentage,
      statusState: calc.statusState,
      velocityFactor: calc.velocityFactor,
      expectedProgress: calc.expectedProgress,
      statusNote: calc.statusNote,
      actionsCount: total,
      completedActionsCount: completed,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

export const updateGoal = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const userId = req.userId!;
    const body = req.body;

    const goal = await prisma.goal.findFirst({ where: { id, userId } });
    if (!goal) {
      res.status(404).json({ error: 'Goal not found' });
      return;
    }

    const updated = await prisma.goal.update({
      where: { id },
      data: {
        title: body.title !== undefined ? body.title : goal.title,
        description: body.description !== undefined ? body.description : goal.description,
        whyItMatters: body.whyItMatters !== undefined ? body.whyItMatters : goal.whyItMatters,
        category: body.category !== undefined ? body.category : goal.category,
        customCategoryName: body.customCategoryName !== undefined ? body.customCategoryName : goal.customCategoryName,
        priority: body.priority !== undefined ? body.priority : goal.priority,
        status: body.status !== undefined ? body.status : goal.status,
        targetDate: body.targetDate ? new Date(body.targetDate) : goal.targetDate,
        targetFrequencyPerWeek: body.targetFrequencyPerWeek !== undefined ? body.targetFrequencyPerWeek : goal.targetFrequencyPerWeek,
      },
      include: { milestones: { include: { actions: true } }, routines: true },
    });

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

export const deleteGoal = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const userId = req.userId!;

    const goal = await prisma.goal.findFirst({ where: { id, userId } });
    if (!goal) {
      res.status(404).json({ error: 'Goal not found' });
      return;
    }

    await prisma.goal.delete({ where: { id } });
    res.json({ message: 'Goal deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};
