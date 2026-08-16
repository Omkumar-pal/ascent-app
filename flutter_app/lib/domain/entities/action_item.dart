class ActionItem {
  final String id;
  final String goalId;
  final String? milestoneId;
  final String title;
  final String? description;
  final DateTime? dueDate;
  final String? preferredTime;
  final int estimatedDurationMinutes;
  final String priority;
  final String difficulty;
  final String status;
  final bool isRecurring;

  ActionItem({
    required this.id,
    required this.goalId,
    this.milestoneId,
    required this.title,
    this.description,
    this.dueDate,
    this.preferredTime,
    this.estimatedDurationMinutes = 30,
    this.priority = 'MEDIUM',
    this.difficulty = 'MEDIUM',
    this.status = 'UPCOMING',
    this.isRecurring = false,
  });

  bool get isCompleted => status == 'COMPLETED';

  factory ActionItem.fromJson(Map<String, dynamic> json) {
    return ActionItem(
      id: json['id'] ?? '',
      goalId: json['goalId'] ?? '',
      milestoneId: json['milestoneId'],
      title: json['title'] ?? '',
      description: json['description'],
      dueDate: json['dueDate'] != null ? DateTime.tryParse(json['dueDate']) : null,
      preferredTime: json['preferredTime'],
      estimatedDurationMinutes: json['estimatedDurationMinutes'] ?? 30,
      priority: json['priority'] ?? 'MEDIUM',
      difficulty: json['difficulty'] ?? 'MEDIUM',
      status: json['status'] ?? 'UPCOMING',
      isRecurring: json['isRecurring'] ?? false,
    );
  }
}
