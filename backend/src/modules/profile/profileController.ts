import { Response } from 'express';
import { prisma } from '../../database/prisma';
import { AuthRequest } from '../../middleware/auth';

export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        notificationPreferences: true,
      },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const goalsCount = await prisma.goal.count({ where: { userId } });
    const completedGoalsCount = await prisma.goal.count({ where: { userId, status: 'COMPLETED' } });
    const totalActionsCompleted = await prisma.actionLog.count({ where: { userId, statusOutcome: 'COMPLETED' } });

    res.json({
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      profile: user.profile,
      notificationPreferences: user.notificationPreferences,
      stats: {
        totalGoals: goalsCount,
        completedGoals: completedGoalsCount,
        totalActionsCompleted,
        currentConsistency: '7 Days',
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const { fullName, primaryObjective, preferredProgressStyle, avatarUrl, timezone } = req.body;

    if (fullName) {
      await prisma.user.update({
        where: { id: userId },
        data: { fullName },
      });
    }

    const profile = await prisma.userProfile.upsert({
      where: { userId },
      update: {
        primaryObjective: primaryObjective !== undefined ? primaryObjective : undefined,
        preferredProgressStyle: preferredProgressStyle !== undefined ? preferredProgressStyle : undefined,
        avatarUrl: avatarUrl !== undefined ? avatarUrl : undefined,
        timezone: timezone !== undefined ? timezone : undefined,
      },
      create: {
        userId,
        primaryObjective: primaryObjective || 'Continuous growth and mindful consistency',
        preferredProgressStyle: preferredProgressStyle || 'BALANCED',
        avatarUrl,
        timezone: timezone || 'UTC',
      },
    });

    res.json({ message: 'Profile updated successfully', profile });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

export const updateNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const body = req.body;

    const notif = await prisma.notificationPreference.upsert({
      where: { userId },
      update: {
        morningFocusReminder: body.morningFocusReminder,
        morningReminderTime: body.morningReminderTime,
        eveningCheckInReminder: body.eveningCheckInReminder,
        eveningReminderTime: body.eveningReminderTime,
        weeklyReflectionReminder: body.weeklyReflectionReminder,
        weeklyReflectionDay: body.weeklyReflectionDay,
        weeklyReflectionTime: body.weeklyReflectionTime,
        pushEnabled: body.pushEnabled,
        emailEnabled: body.emailEnabled,
      },
      create: {
        userId,
        ...body,
      },
    });

    res.json(notif);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};
