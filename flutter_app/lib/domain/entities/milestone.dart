import 'action_item.dart';

class Milestone {
  final String id;
  final String goalId;
  final String title;
  final String? description;
  final int sortOrder;
  final DateTime? targetDate;
  final double progressPercentage;
  final String status;
  final List<ActionItem> actions;

  Milestone({
    required this.id,
    required this.goalId,
    required this.title,
    this.description,
    this.sortOrder = 0,
    this.targetDate,
    this.progressPercentage = 0.0,
    this.status = 'PENDING',
    this.actions = const [],
  });

  factory Milestone.fromJson(Map<String, dynamic> json) {
    return Milestone(
      id: json['id'] ?? '',
      goalId: json['goalId'] ?? '',
      title: json['title'] ?? '',
      description: json['description'],
      sortOrder: json['sortOrder'] ?? 0,
      targetDate: json['targetDate'] != null ? DateTime.tryParse(json['targetDate']) : null,
      progressPercentage: (json['progressPercentage'] as num?)?.toDouble() ?? 0.0,
      status: json['status'] ?? 'PENDING',
      actions: (json['actions'] as List?)?.map((a) => ActionItem.fromJson(a)).toList() ?? [],
    );
  }
}
