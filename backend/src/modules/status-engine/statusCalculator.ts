export type GoalStatusState = 'ON_TRACK' | 'AHEAD' | 'NEEDS_ATTENTION' | 'BEHIND' | 'COMPLETED';

export interface GoalStatusCalculationInput {
  startDate: Date;
  targetDate: Date | null;
  totalActions: number;
  completedActions: number;
  missedActionsLast14Days: number;
  scheduledActionsLast14Days: number;
  consecutiveMissedRoutineSlots?: number;
}

export interface GoalStatusResult {
  progressPercentage: number;
  statusState: GoalStatusState;
  velocityFactor: number;
  expectedProgress: number;
  statusNote: string;
}

/**
 * Calculates the dynamic progress velocity and qualitative status for a goal.
 * Factors in timeframe, expected pace vs actual execution, and recent cadence.
 */
export function calculateGoalStatus(input: GoalStatusCalculationInput): GoalStatusResult {
  const {
    startDate,
    targetDate,
    totalActions,
    completedActions,
    missedActionsLast14Days,
    scheduledActionsLast14Days,
    consecutiveMissedRoutineSlots = 0,
  } = input;

  // 1. Calculate actual progress percentage
  const actualProgress = totalActions > 0 ? Math.min(1.0, completedActions / totalActions) : 0.0;
  const progressPercentage = Math.round(actualProgress * 100 * 10) / 10;

  if (actualProgress >= 1.0 && totalActions > 0) {
    return {
      progressPercentage: 100.0,
      statusState: 'COMPLETED',
      velocityFactor: 1.0,
      expectedProgress: 100.0,
      statusNote: 'All planned milestones and actions achieved!',
    };
  }

  // 2. Determine expected progress based on timeframe
  const now = new Date().getTime();
  const start = new Date(startDate).getTime();
  let expectedProgress = 0.5; // Default fallback

  if (targetDate) {
    const end = new Date(targetDate).getTime();
    const totalDuration = end - start;
    const elapsedDuration = now - start;

    if (totalDuration > 0) {
      const timeRatio = Math.max(0.0, Math.min(1.0, elapsedDuration / totalDuration));
      expectedProgress = timeRatio;
    }
  } else {
    // If no target date, expected progress is normalized against an assumed 90-day window
    const defaultDuration = 90 * 24 * 60 * 60 * 1000;
    const elapsed = Math.max(0, now - start);
    expectedProgress = Math.min(1.0, elapsed / defaultDuration);
  }

  // 3. Calculate cadence penalty from recent missed actions
  let cadenceMultiplier = 1.0;
  if (scheduledActionsLast14Days > 0) {
    const missedRatio = Math.min(1.0, missedActionsLast14Days / scheduledActionsLast14Days);
    cadenceMultiplier = Math.max(0.7, 1.0 - (0.3 * missedRatio));
  }

  // 4. Calculate Velocity Factor (V)
  const safeExpected = Math.max(0.05, expectedProgress);
  const velocityFactor = (actualProgress / safeExpected) * cadenceMultiplier;

  // 5. Categorize Status
  let statusState: GoalStatusState = 'ON_TRACK';
  let statusNote = 'Cadence is healthy and aligned with your personal routine.';

  if (actualProgress >= 1.0) {
    statusState = 'COMPLETED';
    statusNote = 'Goal fully completed!';
  } else if (velocityFactor >= 1.15 || (actualProgress - expectedProgress >= 0.15)) {
    statusState = 'AHEAD';
    statusNote = "You're outpacing your target schedule! Great momentum.";
  } else if (velocityFactor >= 0.85 && consecutiveMissedRoutineSlots < 2) {
    statusState = 'ON_TRACK';
    statusNote = 'Cadence is steady and on target.';
  } else if (velocityFactor >= 0.60 || consecutiveMissedRoutineSlots === 2) {
    statusState = 'NEEDS_ATTENTION';
    statusNote = 'Slight dip in cadence. Consider adjusting action times or difficulty.';
  } else {
    statusState = 'BEHIND';
    statusNote = "Pace is behind schedule. Let's recalibrate upcoming actions or break them into smaller steps.";
  }

  return {
    progressPercentage,
    statusState,
    velocityFactor: Math.round(velocityFactor * 100) / 100,
    expectedProgress: Math.round(expectedProgress * 100 * 10) / 10,
    statusNote,
  };
}
