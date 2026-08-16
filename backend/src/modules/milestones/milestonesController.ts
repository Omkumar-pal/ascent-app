import { Response } from 'express';
import { z } from 'zod';
import { prisma } from '../../database/prisma';
import { AuthRequest } from '../../middleware/auth';

const createMilestoneSchema = z.object({
  goalId: z.string().uuid(),
  title: z.string().min(1),
  description: z.string().optional(),
  targetDate: z.string().optional(),
  sortOrder: z.number().optional(),
});

export const createMilestone = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const validated = createMilestoneSchema.parse(req.body);
    const userId = req.userId!;

    const goal = await prisma.goal.findFirst({ where: { id: validated.goalId, userId } });
    if (!goal) {
      res.status(404).json({ error: 'Goal not found' });
      return;
    }

    const milestone = await prisma.milestone.create({
      data: {
        goalId: validated.goalId,
        title: validated.title,
        description: validated.description,
        targetDate: validated.targetDate ? new Date(validated.targetDate) : null,
        sortOrder: validated.sortOrder ?? 1,
      },
      include: { actions: true },
    });

    res.status(201).json(milestone);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
      return;
    }
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

export const updateMilestone = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const body = req.body;

    const milestone = await prisma.milestone.findUnique({
      where: { id },
      include: { goal: true },
    });

    if (!milestone || milestone.goal.userId !== req.userId) {
      res.status(404).json({ error: 'Milestone not found' });
      return;
    }

    const updated = await prisma.milestone.update({
      where: { id },
      data: {
        title: body.title !== undefined ? body.title : milestone.title,
        description: body.description !== undefined ? body.description : milestone.description,
        status: body.status !== undefined ? body.status : milestone.status,
        targetDate: body.targetDate ? new Date(body.targetDate) : milestone.targetDate,
        sortOrder: body.sortOrder !== undefined ? body.sortOrder : milestone.sortOrder,
      },
      include: { actions: true },
    });

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

export const deleteMilestone = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const milestone = await prisma.milestone.findUnique({
      where: { id },
      include: { goal: true },
    });

    if (!milestone || milestone.goal.userId !== req.userId) {
      res.status(404).json({ error: 'Milestone not found' });
      return;
    }

    await prisma.milestone.delete({ where: { id } });
    res.json({ message: 'Milestone deleted' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};
