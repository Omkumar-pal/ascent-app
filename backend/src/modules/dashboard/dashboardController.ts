import { Response } from 'express';
import { prisma } from '../../database/prisma';
import { AuthRequest } from '../../middleware/auth';
import { calculateGoalStatus } from '../status-engine/statusCalculator';
import { computeWeeklyConsistency } from '../consistency/consistencyEngine';

export const getTodayDashboard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;

    // 1. Fetch user & profile
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // 2. Fetch active goals with routines & milestones
    const goals = await prisma.goal.findMany({
      where: { userId, status: 'ACTIVE' },
      include: {
        milestones: { include: { actions: true }, orderBy: { sortOrder: 'asc' } },
        actions: { include: { actionLogs: true } },
        routines: true,
      },
      orderBy: { priority: 'desc' },
    });

    // 3. Enrich goals with calculated status
    const enrichedGoals = goals.map(g => {
      const allActions = g.actions.length > 0 ? g.actions : g.milestones.flatMap(m => m.actions);
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
        id: g.id,
        title: g.title,
        category: g.category,
        customCategoryName: g.customCategoryName,
        priority: g.priority,
        status: g.status,
        statusState: calc.statusState,
        progressPercentage: calc.progressPercentage,
        velocityFactor: calc.velocityFactor,
        expectedProgress: calc.expectedProgress,
        statusNote: calc.statusNote,
        actionsCount: total,
        completedActionsCount: completed,
        routine: g.routines[0] ? {
          ...g.routines[0],
          daysOfWeek: JSON.parse(g.routines[0].daysOfWeek || '[1,3,5]'),
        } : null,
      };
    });

    // 4. Fetch all actions across active goals for today's flow
    const allActions = await prisma.action.findMany({
      where: { goal: { userId, status: 'ACTIVE' } },
      include: {
        goal: { select: { id: true, title: true, category: true } },
        milestone: { select: { id: true, title: true } },
      },
      orderBy: { preferredTime: 'asc' },
    });

    const totalTodayActions = allActions.length;
    const completedTodayActions = allActions.filter(a => a.status === 'COMPLETED').length;
    const todayFocusPercentage = totalTodayActions > 0 ? Math.round((completedTodayActions / totalTodayActions) * 100) : 0;

    // 5. Compute consistency & streak
    const recentLogs = await prisma.actionLog.findMany({
      where: { userId },
      orderBy: { completedAt: 'desc' },
      take: 50,
    });

    const routineConfigs = goals.flatMap(g => g.routines.map(r => ({
      daysOfWeek: JSON.parse(r.daysOfWeek || '[1,3,5]') as number[],
      targetFrequencyPerWeek: r.weeklyFrequencyTarget,
    })));

    const consistency = computeWeeklyConsistency(recentLogs, routineConfigs);

    // 6. Time of day greeting
    const hour = new Date().getHours();
    let timeGreeting = 'Good morning';
    if (hour >= 12 && hour < 17) timeGreeting = 'Good afternoon';
    else if (hour >= 17) timeGreeting = 'Good evening';

    res.json({
      greeting: `${timeGreeting}, ${user.fullName.split(' ')[0]}`,
      user: {
        id: user.id,
        fullName: user.fullName,
        avatarUrl: user.profile?.avatarUrl,
        primaryObjective: user.profile?.primaryObjective,
      },
      todayFocus: {
        completedCount: completedTodayActions,
        totalCount: totalTodayActions,
        percentage: todayFocusPercentage,
        headline: `${completedTodayActions} of ${totalTodayActions} actions completed`,
      },
      consistency,
      activeGoals: enrichedGoals,
      todayActionFlow: allActions,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};
