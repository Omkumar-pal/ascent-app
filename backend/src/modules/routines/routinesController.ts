import { Response } from 'express';
import { z } from 'zod';
import { prisma } from '../../database/prisma';
import { AuthRequest } from '../../middleware/auth';

const updateRoutineSchema = z.object({
  routineType: z.enum(['DAYS_OF_WEEK', 'FREQUENCY_BASED']).optional(),
  daysOfWeek: z.array(z.number()).optional(),
  preferredTime: z.string().optional(),
  targetDurationMinutes: z.number().min(5).max(360).optional(),
  weeklyFrequencyTarget: z.number().min(1).max(7).optional(),
});

export const getRoutines = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const routines = await prisma.routine.findMany({
      where: { goal: { userId } },
      include: {
        goal: {
          select: {
            id: true,
            title: true,
            category: true,
            status: true,
            statusState: true,
          },
        },
      },
    });

    const parsed = routines.map(r => ({
      ...r,
      daysOfWeek: JSON.parse(r.daysOfWeek || '[1,3,5]'),
    }));

    res.json(parsed);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

export const updateRoutine = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const userId = req.userId!;
    const body = updateRoutineSchema.parse(req.body);

    const routine = await prisma.routine.findUnique({
      where: { id },
      include: { goal: true },
    });

    if (!routine || routine.goal.userId !== userId) {
      res.status(404).json({ error: 'Routine not found' });
      return;
    }

    const updated = await prisma.routine.update({
      where: { id },
      data: {
        routineType: body.routineType !== undefined ? body.routineType : routine.routineType,
        daysOfWeek: body.daysOfWeek ? JSON.stringify(body.daysOfWeek) : routine.daysOfWeek,
        preferredTime: body.preferredTime !== undefined ? body.preferredTime : routine.preferredTime,
        targetDurationMinutes: body.targetDurationMinutes !== undefined ? body.targetDurationMinutes : routine.targetDurationMinutes,
        weeklyFrequencyTarget: body.weeklyFrequencyTarget !== undefined ? body.weeklyFrequencyTarget : routine.weeklyFrequencyTarget,
      },
      include: { goal: true },
    });

    res.json({
      ...updated,
      daysOfWeek: JSON.parse(updated.daysOfWeek),
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
      return;
    }
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};
