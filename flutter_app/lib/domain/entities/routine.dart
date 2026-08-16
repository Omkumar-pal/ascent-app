class Routine {
  final String id;
  final String goalId;
  final String routineType;
  final List<int> daysOfWeek;
  final String preferredTime;
  final int targetDurationMinutes;
  final int weeklyFrequencyTarget;

  Routine({
    required this.id,
    required this.goalId,
    this.routineType = 'DAYS_OF_WEEK',
    this.daysOfWeek = const [1, 3, 5],
    this.preferredTime = '08:00',
    this.targetDurationMinutes = 30,
    this.weeklyFrequencyTarget = 3,
  });

  factory Routine.fromJson(Map<String, dynamic> json) {
    List<int> parsedDays = [1, 3, 5];
    if (json['daysOfWeek'] is List) {
      parsedDays = (json['daysOfWeek'] as List).map((e) => e as int).toList();
    }

    return Routine(
      id: json['id'] ?? '',
      goalId: json['goalId'] ?? '',
      routineType: json['routineType'] ?? 'DAYS_OF_WEEK',
      daysOfWeek: parsedDays,
      preferredTime: json['preferredTime'] ?? '08:00',
      targetDurationMinutes: json['targetDurationMinutes'] ?? 30,
      weeklyFrequencyTarget: json['weeklyFrequencyTarget'] ?? 3,
    );
  }
}
