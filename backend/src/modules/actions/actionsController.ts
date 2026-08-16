import { Response } from 'express';
import { z } from 'zod';
import { prisma } from '../../database/prisma';
import { AuthRequest } from '../../middleware/auth';
import { calculateGoalStatus } from '../status-engine/statusCalculator';

const createActionSchema = z.object({
  goalId: z.string().uuid(),
  milestoneId: z.string().uuid().optional().nullable(),
  title: z.string().min(1),
  description: z.string().optional(),
  dueDate: z.string().optional().nullable(),
  preferredTime: z.string().optional().nullable(),
  estimatedDurationMinutes: z.number().min(1).default(30),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).default('MEDIUM'),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).default('MEDIUM'),
  isRecurring: z.boolean().default(false),
});

const completeActionSchema = z.object({
  durationSpentMinutes: z.number().min(1).optional(),
  notes: z.string().optional(),
  completedAt: z.string().optional(),
});

export const createAction = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const validated = createActionSchema.parse(req.body);
    const userId = req.userId!;

    const goal = await prisma.goal.findFirst({ where: { id: validated.goalId, userId } });
    if (!goal) {
      res.status(404).json({ error: 'Goal not found' });
      return;
    }

    const action = await prisma.action.create({
      data: {
        goalId: validated.goalId,
        milestoneId: validated.milestoneId || null,
        title: validated.title,
        description: validated.description,
        dueDate: validated.dueDate ? new Date(validated.dueDate) : null,
        preferredTime: validated.preferredTime || null,
        estimatedDurationMinutes: validated.estimatedDurationMinutes,
        priority: validated.priority,
        difficulty: validated.difficulty,
        isRecurring: validated.isRecurring,
      },
    });

    res.status(201).json(action);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
      return;
    }
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

export const completeAction = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const userId = req.userId!;
    const body = completeActionSchema.parse(req.body || {});

    const action = await prisma.action.findUnique({
      where: { id },
      include: { goal: true },
    });

    if (!action || action.goal.userId !== userId) {
      res.status(404).json({ error: 'Action not found' });
      return;
    }

    // 1. Update action status to COMPLETED
    const updatedAction = await prisma.action.update({
      where: { id },
      data: { status: 'COMPLETED' },
    });

    // 2. Create ActionLog entry for rich history
    const actionLog = await prisma.actionLog.create({
      data: {
        actionId: id,
        userId,
        durationSpentMinutes: body.durationSpentMinutes ?? action.estimatedDurationMinutes,
        notes: body.notes,
        completedAt: body.completedAt ? new Date(body.completedAt) : new Date(),
        statusOutcome: 'COMPLETED',
      },
    });

    // 3. Recalculate goal progress & status
    const allGoalActions = await prisma.action.findMany({ where: { goalId: action.goalId } });
    const total = allGoalActions.length;
    const completed = allGoalActions.filter(a => a.status === 'COMPLETED').length;
    const missed = allGoalActions.filter(a => a.status === 'MISSED').length;

    const calc = calculateGoalStatus({
      startDate: action.goal.startDate,
      targetDate: action.goal.targetDate,
      totalActions: total,
      completedActions: completed,
      missedActionsLast14Days: missed,
      scheduledActionsLast14Days: Math.max(1, total),
    });

    await prisma.goal.update({
      where: { id: action.goalId },
      data: {
        progressPercentage: calc.progressPercentage,
        statusState: calc.statusState,
      },
    });

    res.json({
      action: updatedAction,
      log: actionLog,
      updatedGoalProgress: {
        goalId: action.goalId,
        progressPercentage: calc.progressPercentage,
        statusState: calc.statusState,
        statusNote: calc.statusNote,
      },
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
      return;
    }
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

export const skipAction = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const userId = req.userId!;
    const { notes } = req.body;

    const action = await prisma.action.findUnique({
      where: { id },
      include: { goal: true },
    });

    if (!action || action.goal.userId !== userId) {
      res.status(404).json({ error: 'Action not found' });
      return;
    }

    const updatedAction = await prisma.action.update({
      where: { id },
      data: { status: 'SKIPPED' },
    });

    await prisma.actionLog.create({
      data: {
        actionId: id,
        userId,
        durationSpentMinutes: 0,
        notes: notes || 'Skipped for recovery/schedule adjustment',
        statusOutcome: 'SKIPPED',
      },
    });

    res.json(updatedAction);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

export const updateAction = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const userId = req.userId!;
    const body = req.body;

    const action = await prisma.action.findUnique({
      where: { id },
      include: { goal: true },
    });

    if (!action || action.goal.userId !== userId) {
      res.status(404).json({ error: 'Action not found' });
      return;
    }

    const updated = await prisma.action.update({
      where: { id },
      data: {
        title: body.title !== undefined ? body.title : action.title,
        description: body.description !== undefined ? body.description : action.description,
        status: body.status !== undefined ? body.status : action.status,
        dueDate: body.dueDate ? new Date(body.dueDate) : action.dueDate,
        preferredTime: body.preferredTime !== undefined ? body.preferredTime : action.preferredTime,
        estimatedDurationMinutes: body.estimatedDurationMinutes !== undefined ? body.estimatedDurationMinutes : action.estimatedDurationMinutes,
        priority: body.priority !== undefined ? body.priority : action.priority,
        difficulty: body.difficulty !== undefined ? body.difficulty : action.difficulty,
        milestoneId: body.milestoneId !== undefined ? body.milestoneId : action.milestoneId,
      },
    });

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

export const deleteAction = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const userId = req.userId!;

    const action = await prisma.action.findUnique({
      where: { id },
      include: { goal: true },
    });

    if (!action || action.goal.userId !== userId) {
      res.status(404).json({ error: 'Action not found' });
      return;
    }

    await prisma.action.delete({ where: { id } });
    res.json({ message: 'Action deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

