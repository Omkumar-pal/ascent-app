import 'milestone.dart';
import 'routine.dart';
import 'action_item.dart';

enum GoalCategory {
  health,
  learning,
  career,
  personal,
  finance,
  relationships,
  productivity,
  custom,
}

enum GoalStatusState {
  onTrack,
  ahead,
  needsAttention,
  behind,
  completed,
}

class Goal {
  final String id;
  final String title;
  final String? description;
  final String? whyItMatters;
  final String category;
  final String priority;
  final DateTime startDate;
  final DateTime? targetDate;
  final String status;
  final GoalStatusState statusState;
  final double progressPercentage;
  final int targetFrequencyPerWeek;
  final List<Milestone> milestones;
  final List<ActionItem> actions;
  final Routine? routine;

  Goal({
    required this.id,
    required this.title,
    this.description,
    this.whyItMatters,
    required this.category,
    this.priority = 'MEDIUM',
    required this.startDate,
    this.targetDate,
    this.status = 'ACTIVE',
    this.statusState = GoalStatusState.onTrack,
    this.progressPercentage = 0.0,
    this.targetFrequencyPerWeek = 3,
    this.milestones = const [],
    this.actions = const [],
    this.routine,
  });

  factory Goal.fromJson(Map<String, dynamic> json) {
    GoalStatusState parseState(String? s) {
      switch (s) {
        case 'AHEAD': return GoalStatusState.ahead;
        case 'NEEDS_ATTENTION': return GoalStatusState.needsAttention;
        case 'BEHIND': return GoalStatusState.behind;
        case 'COMPLETED': return GoalStatusState.completed;
        default: return GoalStatusState.onTrack;
      }
    }

    return Goal(
      id: json['id'] ?? '',
      title: json['title'] ?? '',
      description: json['description'],
      whyItMatters: json['whyItMatters'],
      category: json['category'] ?? 'PERSONAL',
      priority: json['priority'] ?? 'MEDIUM',
      startDate: DateTime.tryParse(json['startDate'] ?? '') ?? DateTime.now(),
      targetDate: json['targetDate'] != null ? DateTime.tryParse(json['targetDate']) : null,
      status: json['status'] ?? 'ACTIVE',
      statusState: parseState(json['statusState']),
      progressPercentage: (json['progressPercentage'] as num?)?.toDouble() ?? 0.0,
      targetFrequencyPerWeek: json['targetFrequencyPerWeek'] ?? 3,
      milestones: (json['milestones'] as List?)?.map((m) => Milestone.fromJson(m)).toList() ?? [],
      actions: (json['actions'] as List?)?.map((a) => ActionItem.fromJson(a)).toList() ?? [],
      routine: json['routine'] != null ? Routine.fromJson(json['routine']) : null,
    );
  }
}
