class Reflection {
  final String id;
  final String userId;
  final DateTime weekStartDate;
  final DateTime weekEndDate;
  final int actionsCompletedCount;
  final int actionsMissedCount;
  final String? strongestArea;
  final String? needsAttentionArea;
  final String? whatWentWell;
  final String? whatWasDifficult;
  final String? nextWeekFocus;
  final int energyMoodRating;

  Reflection({
    required this.id,
    required this.userId,
    required this.weekStartDate,
    required this.weekEndDate,
    this.actionsCompletedCount = 0,
    this.actionsMissedCount = 0,
    this.strongestArea,
    this.needsAttentionArea,
    this.whatWentWell,
    this.whatWasDifficult,
    this.nextWeekFocus,
    this.energyMoodRating = 4,
  });

  factory Reflection.fromJson(Map<String, dynamic> json) {
    return Reflection(
      id: json['id'] ?? '',
      userId: json['userId'] ?? '',
      weekStartDate: DateTime.tryParse(json['weekStartDate'] ?? '') ?? DateTime.now(),
      weekEndDate: DateTime.tryParse(json['weekEndDate'] ?? '') ?? DateTime.now(),
      actionsCompletedCount: json['actionsCompletedCount'] ?? 0,
      actionsMissedCount: json['actionsMissedCount'] ?? 0,
      strongestArea: json['strongestArea'],
      needsAttentionArea: json['needsAttentionArea'],
      whatWentWell: json['whatWentWell'],
      whatWasDifficult: json['whatWasDifficult'],
      nextWeekFocus: json['nextWeekFocus'],
      energyMoodRating: json['energyMoodRating'] ?? 4,
    );
  }
}
