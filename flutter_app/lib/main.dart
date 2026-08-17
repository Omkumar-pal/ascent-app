import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'core/constants/app_colors.dart';
import 'core/network/api_client.dart';
import 'domain/entities/goal.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const AscentApp());
}

class AscentApp extends StatelessWidget {
  const AscentApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Ascent — Intentional Goals & Routines',
      debugShowCheckedModeBanner: false,
      theme: ThemeData.dark().copyWith(
        scaffoldBackgroundColor: AppColors.bgBase,
        colorScheme: const ColorScheme.dark(
          primary: AppColors.accentViolet,
          secondary: AppColors.accentEmerald,
          surface: AppColors.bgSurface,
        ),
        textTheme: GoogleFonts.plusJakartaSansTextTheme(
          ThemeData.dark().textTheme,
        ),
      ),
      home: const MainNavigationScreen(),
    );
  }
}

class MainNavigationScreen extends StatefulWidget {
  const MainNavigationScreen({super.key});

  @override
  State<MainNavigationScreen> createState() => _MainNavigationScreenState();
}

class _MainNavigationScreenState extends State<MainNavigationScreen> {
  int _currentIndex = 0;
  bool _isLoading = true;
  Map<String, dynamic>? _dashboardData;
  List<Goal> _goals = [];
  String _selectedCategoryFilter = 'ALL';

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    try {
      await ApiClient.login('alex@ascent.app', 'password123');
      final dash = await ApiClient.getDashboard();
      final goals = await ApiClient.getGoals();
      if (mounted) {
        setState(() {
          _dashboardData = dash;
          _goals = goals;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(
        body: Center(
          child: CircularProgressIndicator(color: AppColors.accentViolet),
        ),
      );
    }

    final screens = [
      _buildTodayTab(),
      _buildGoalsTab(),
      _buildCalendarTab(),
      _buildProgressTab(),
      _buildProfileTab(),
    ];

    return Scaffold(
      body: SafeArea(child: screens[_currentIndex]),
      floatingActionButton: (_currentIndex == 0 || _currentIndex == 1)
          ? FloatingActionButton.extended(
              backgroundColor: AppColors.accentViolet,
              elevation: 8,
              onPressed: () => _showCreateGoalBottomSheet(),
              icon: const Icon(Icons.add, color: Colors.white),
              label: Text(
                'New Goal',
                style: GoogleFonts.outfit(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                  fontSize: 14,
                ),
              ),
            )
          : null,
      bottomNavigationBar: Container(
        decoration: const BoxDecoration(
          color: Color(0xE00F141E),
          border: Border(top: BorderSide(color: AppColors.borderSubtle)),
        ),
        child: BottomNavigationBar(
          currentIndex: _currentIndex,
          onTap: (idx) => setState(() => _currentIndex = idx),
          backgroundColor: Colors.transparent,
          elevation: 0,
          type: BottomNavigationBarType.fixed,
          selectedItemColor: AppColors.accentViolet,
          unselectedItemColor: AppColors.textMuted,
          items: const [
            BottomNavigationBarItem(icon: Icon(Icons.explore_outlined), activeIcon: Icon(Icons.explore), label: 'Today'),
            BottomNavigationBarItem(icon: Icon(Icons.track_changes_outlined), activeIcon: Icon(Icons.track_changes), label: 'Goals'),
            BottomNavigationBarItem(icon: Icon(Icons.calendar_month_outlined), activeIcon: Icon(Icons.calendar_month), label: 'Calendar'),
            BottomNavigationBarItem(icon: Icon(Icons.show_chart_outlined), activeIcon: Icon(Icons.show_chart), label: 'Progress'),
            BottomNavigationBarItem(icon: Icon(Icons.person_outline), activeIcon: Icon(Icons.person), label: 'Profile'),
          ],
        ),
      ),
    );
  }

  // 1. TODAY TAB
  Widget _buildTodayTab() {
    final todayFocus = _dashboardData?['todayFocus'] ?? {'percentage': 67, 'headline': '4 of 6 actions completed'};
    final actions = (_dashboardData?['todayActionFlow'] as List?) ?? [];
    final consistency = _dashboardData?['consistency'] ?? {'consistencyPillText': '7-Day Streak · 88%'};

    return ListView(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              _dashboardData?['greeting'] ?? 'Good morning, Alex 👋',
              style: GoogleFonts.outfit(fontSize: 22, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
            ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(
                color: AppColors.accentViolet.withOpacity(0.15),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: AppColors.accentViolet.withOpacity(0.4)),
              ),
              child: Text(
                '🔥 ${consistency['consistencyPillText'] ?? '7-Day Consistency'}',
                style: const TextStyle(color: Color(0xFFDDD6FE), fontSize: 11, fontWeight: FontWeight.bold),
              ),
            ),
          ],
        ),
        const SizedBox(height: 20),

        // Today's Focus Card
        Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: AppColors.bgGlassCard,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: AppColors.borderSubtle),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text("Today's Focus", style: TextStyle(color: AppColors.textSecondary, fontSize: 13, fontWeight: FontWeight.w500)),
                    const SizedBox(height: 4),
                    Text(
                      todayFocus['headline'] ?? '4 of 6 actions completed',
                      style: GoogleFonts.outfit(fontSize: 17, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      "${todayFocus['percentage']}% Completed · Maintain Cadence",
                      style: const TextStyle(color: AppColors.accentEmerald, fontSize: 12, fontWeight: FontWeight.w600),
                    ),
                  ],
                ),
              ),
              Stack(
                alignment: Alignment.center,
                children: [
                  SizedBox(
                    width: 64,
                    height: 64,
                    child: CircularProgressIndicator(
                      value: ((todayFocus['percentage'] as num?)?.toDouble() ?? 67.0) / 100,
                      strokeWidth: 6,
                      color: AppColors.accentViolet,
                      backgroundColor: Colors.white10,
                    ),
                  ),
                  Text("${todayFocus['percentage']}%", style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                ],
              ),
            ],
          ),
        ),
        const SizedBox(height: 24),

        // Active Goals
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text('Active Goals', style: GoogleFonts.outfit(fontSize: 18, fontWeight: FontWeight.w600)),
            TextButton(
              onPressed: () => setState(() => _currentIndex = 1),
              child: const Text('View all >', style: TextStyle(color: AppColors.accentViolet, fontSize: 13)),
            ),
          ],
        ),
        const SizedBox(height: 8),
        SizedBox(
          height: 145,
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            itemCount: _goals.length,
            separatorBuilder: (_, __) => const SizedBox(width: 12),
            itemBuilder: (ctx, idx) {
              final g = _goals[idx];
              return GestureDetector(
                onTap: () => _showGoalDetailSheet(g),
                child: Container(
                  width: 185,
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: AppColors.bgGlassCard,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: AppColors.borderSubtle),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(g.category, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.accentViolet)),
                      Text(g.title, maxLines: 2, overflow: TextOverflow.ellipsis, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(
                              color: AppColors.accentEmerald.withOpacity(0.2),
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: const Text('ON TRACK', style: TextStyle(color: AppColors.accentEmerald, fontSize: 10, fontWeight: FontWeight.bold)),
                          ),
                          Text('${g.progressPercentage.toInt()}%', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                        ],
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        ),
        const SizedBox(height: 24),

        // Today's Action Flow
        Text("Today's Action Flow", style: GoogleFonts.outfit(fontSize: 18, fontWeight: FontWeight.w600)),
        const SizedBox(height: 12),
        ...actions.map((a) {
          final isCompleted = a['status'] == 'COMPLETED';
          return Container(
            margin: const EdgeInsets.only(bottom: 10),
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: AppColors.bgGlassCard,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: AppColors.borderSubtle),
            ),
            child: Row(
              children: [
                GestureDetector(
                  onTap: () async {
                    await ApiClient.createAction({'id': a['id'], 'status': isCompleted ? 'SCHEDULED' : 'COMPLETED'});
                    _loadData();
                  },
                  child: Container(
                    width: 26,
                    height: 26,
                    decoration: BoxDecoration(
                      color: isCompleted ? AppColors.accentEmerald : Colors.transparent,
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: isCompleted ? AppColors.accentEmerald : AppColors.borderSubtle),
                    ),
                    child: isCompleted ? const Icon(Icons.check, size: 16, color: Colors.white) : null,
                  ),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        a['title'],
                        style: TextStyle(
                          fontWeight: FontWeight.w600,
                          fontSize: 14,
                          decoration: isCompleted ? TextDecoration.lineThrough : null,
                          color: isCompleted ? AppColors.textMuted : AppColors.textPrimary,
                        ),
                      ),
                      Text("⏱ ${a['estimatedDurationMinutes'] ?? 25} mins · Today's Cadence", style: TextStyle(fontSize: 11, color: AppColors.textMuted)),
                    ],
                  ),
                ),
              ],
            ),
          );
        }),
        const SizedBox(height: 60), // Room for FAB
      ],
    );
  }

  // 2. GOALS TAB
  Widget _buildGoalsTab() {
    final categories = ['ALL', 'SKILL_ACQUISITION', 'HEALTH_FITNESS', 'CAREER', 'MINDSET'];
    final filteredGoals = _selectedCategoryFilter == 'ALL'
        ? _goals
        : _goals.filter((g) => g.category == _selectedCategoryFilter).toList();

    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        Text('Goals Explorer', style: GoogleFonts.outfit(fontSize: 24, fontWeight: FontWeight.bold)),
        const SizedBox(height: 12),

        // Category Filter Chips
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: Row(
            children: categories.map((cat) {
              final isSelected = _selectedCategoryFilter == cat;
              return Padding(
                padding: const EdgeInsets.only(right: 8),
                child: FilterChip(
                  label: Text(cat.replaceAll('_', ' '), style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: isSelected ? Colors.white : AppColors.textMuted)),
                  selected: isSelected,
                  selectedColor: AppColors.accentViolet,
                  backgroundColor: AppColors.bgSurface,
                  onSelected: (val) => setState(() => _selectedCategoryFilter = cat),
                ),
              );
            }).toList(),
          ),
        ),
        const SizedBox(height: 16),

        ...filteredGoals.map((g) => GestureDetector(
          onTap: () => _showGoalDetailSheet(g),
          child: Container(
            margin: const EdgeInsets.only(bottom: 16),
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.bgGlassCard,
              borderRadius: BorderRadius.circular(18),
              border: Border.all(color: AppColors.borderSubtle),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(g.category, style: const TextStyle(color: AppColors.accentViolet, fontWeight: FontWeight.bold, fontSize: 12)),
                    Text('${g.progressPercentage.toInt()}%', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                  ],
                ),
                const SizedBox(height: 6),
                Text(g.title, style: GoogleFonts.outfit(fontSize: 17, fontWeight: FontWeight.bold)),
                if (g.whyItMatters != null) ...[
                  const SizedBox(height: 4),
                  Text('“${g.whyItMatters}”', style: TextStyle(color: AppColors.textMuted, fontSize: 12, fontStyle: FontStyle.italic)),
                ],
                const SizedBox(height: 12),
                ClipRRect(
                  borderRadius: BorderRadius.circular(4),
                  child: LinearProgressIndicator(
                    value: g.progressPercentage / 100,
                    color: AppColors.accentEmerald,
                    backgroundColor: Colors.white10,
                    minHeight: 6,
                  ),
                ),
              ],
            ),
          ),
        )),
        const SizedBox(height: 60), // Room for FAB
      ],
    );
  }

  // 3. CALENDAR TAB
  Widget _buildCalendarTab() {
    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        Text('Schedule & Routines', style: GoogleFonts.outfit(fontSize: 24, fontWeight: FontWeight.bold)),
        const SizedBox(height: 16),

        // Weekly schedule strip
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppColors.bgGlassCard,
            borderRadius: BorderRadius.circular(18),
            border: Border.all(color: AppColors.borderSubtle),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Weekly Cadence Plan', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
              const SizedBox(height: 12),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: ['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day) {
                  final isRest = day == 'S';
                  return Container(
                    width: 36,
                    height: 48,
                    decoration: BoxDecoration(
                      color: isRest ? Colors.white.withOpacity(0.04) : AppColors.accentViolet.withOpacity(0.18),
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: isRest ? Colors.transparent : AppColors.accentViolet.withOpacity(0.5)),
                    ),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(day, style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: isRest ? AppColors.textMuted : AppColors.accentViolet)),
                        const SizedBox(height: 4),
                        Icon(isRest ? Icons.nightlight_round : Icons.check_circle, size: 10, color: isRest ? AppColors.textMuted : AppColors.accentEmerald),
                      ],
                    ),
                  );
                }).toList(),
              ),
            ],
          ),
        ),
        const SizedBox(height: 20),

        Text('Time Blocked Routines', style: GoogleFonts.outfit(fontSize: 18, fontWeight: FontWeight.w600)),
        const SizedBox(height: 12),

        _routineCard('08:00 AM', 'Morning Spanish Listening & Vocab', '20 mins · 4x per week', AppColors.accentViolet),
        _routineCard('06:30 PM', 'Hypertrophy Strength Session', '45 mins · 3x per week', AppColors.accentEmerald),
        _routineCard('09:00 PM', 'Python Asyncio & Code Review', '30 mins · 5x per week', AppColors.accentAmber),
      ],
    );
  }

  Widget _routineCard(String time, String title, String sub, Color color) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.bgGlassCard,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.borderSubtle),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
            decoration: BoxDecoration(
              color: color.withOpacity(0.15),
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: color.withOpacity(0.3)),
            ),
            child: Text(time, style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: color)),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                Text(sub, style: TextStyle(fontSize: 12, color: AppColors.textMuted)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // 4. PROGRESS & REFLECTION TAB
  Widget _buildProgressTab() {
    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        Text('Progress & Reflection', style: GoogleFonts.outfit(fontSize: 24, fontWeight: FontWeight.bold)),
        const SizedBox(height: 16),

        // Consistency Hero Card
        Container(
          padding: const EdgeInsets.all(18),
          decoration: BoxDecoration(
            color: AppColors.bgGlassCard,
            borderRadius: BorderRadius.circular(18),
            border: Border.all(color: AppColors.borderSubtle),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Weekly Cadence · 88% Consistency', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
              const SizedBox(height: 14),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  _statBadge('18', 'Completed', AppColors.accentEmerald),
                  _statBadge('2', 'Rest Days', AppColors.accentAmber),
                  _statBadge('88%', 'Cadence', AppColors.accentViolet),
                ],
              ),
            ],
          ),
        ),
        const SizedBox(height: 20),

        // Reflection Review Card
        Container(
          padding: const EdgeInsets.all(18),
          decoration: BoxDecoration(
            color: AppColors.bgGlassCard,
            borderRadius: BorderRadius.circular(18),
            border: Border.all(color: AppColors.borderSubtle),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Week in Review', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(color: AppColors.accentViolet.withOpacity(0.2), borderRadius: BorderRadius.circular(6)),
                    child: const Text('⚡ 4.5 / 5 Energy', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFFDDD6FE))),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Text('What Went Well:', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppColors.accentEmerald)),
              const SizedBox(height: 2),
              const Text('Maintained regular Spanish morning habits without fatigue.', style: TextStyle(fontSize: 13, color: AppColors.textPrimary)),
              const SizedBox(height: 10),
              Text('Next Week Focus:', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppColors.accentViolet)),
              const SizedBox(height: 2),
              const Text('Progress to intermediate grammar exercises & longer code sessions.', style: TextStyle(fontSize: 13, color: AppColors.textPrimary)),
              const SizedBox(height: 16),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(backgroundColor: AppColors.accentViolet, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
                  onPressed: () => _showWeeklyReflectionBottomSheet(),
                  icon: const Icon(Icons.edit_note, size: 18, color: Colors.white),
                  label: const Text('Start Weekly Reflection', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  // 5. PROFILE TAB
  Widget _buildProfileTab() {
    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        Text('Personal Profile', style: GoogleFonts.outfit(fontSize: 24, fontWeight: FontWeight.bold)),
        const SizedBox(height: 16),

        // User card
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppColors.bgGlassCard,
            borderRadius: BorderRadius.circular(18),
            border: Border.all(color: AppColors.borderSubtle),
          ),
          child: const Row(
            children: [
              CircleAvatar(radius: 28, backgroundColor: AppColors.accentViolet, child: Text('A', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 22))),
              SizedBox(width: 14),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Alex Rivera', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 17)),
                  Text('alex@ascent.app', style: TextStyle(color: AppColors.textMuted, fontSize: 13)),
                  SizedBox(height: 4),
                  Text('Progress Style: Sustainable Cadence', style: TextStyle(color: AppColors.accentEmerald, fontSize: 12, fontWeight: FontWeight.w600)),
                ],
              ),
            ],
          ),
        ),
        const SizedBox(height: 20),

        // Lifetime Mastery Stats Grid
        Text('Personal Mastery Stats', style: GoogleFonts.outfit(fontSize: 18, fontWeight: FontWeight.w600)),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(
              child: Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(color: AppColors.bgGlassCard, borderRadius: BorderRadius.circular(16), border: Border.all(color: AppColors.borderSubtle)),
                child: Column(
                  children: [
                    Text('${_goals.length}', style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: AppColors.accentViolet)),
                    const SizedBox(height: 2),
                    Text('Active Goals', style: TextStyle(fontSize: 12, color: AppColors.textMuted)),
                  ],
                ),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(color: AppColors.bgGlassCard, borderRadius: BorderRadius.circular(16), border: Border.all(color: AppColors.borderSubtle)),
                child: Column(
                  children: [
                    const Text('42', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: AppColors.accentEmerald)),
                    const SizedBox(height: 2),
                    Text('Actions Done', style: TextStyle(fontSize: 12, color: AppColors.textMuted)),
                  ],
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 24),

        // Notifications Settings
        Text('Preferences & Cadence', style: GoogleFonts.outfit(fontSize: 18, fontWeight: FontWeight.w600)),
        const SizedBox(height: 12),
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(color: AppColors.bgGlassCard, borderRadius: BorderRadius.circular(18), border: Border.all(color: AppColors.borderSubtle)),
          child: Column(
            children: [
              _settingRow(Icons.wb_sunny_outlined, 'Morning Digest', '07:30 AM Daily Focus', true),
              const Divider(color: AppColors.borderSubtle),
              _settingRow(Icons.nightlight_outlined, 'Evening Check-in', '08:30 PM Gentle nudge', true),
              const Divider(color: AppColors.borderSubtle),
              _settingRow(Icons.weekend_outlined, 'Scheduled Rest Days', 'Saturday & Sunday', true),
            ],
          ),
        ),
        const SizedBox(height: 24),

        // Subtle Server Status Footer
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
          decoration: BoxDecoration(color: Colors.white.withOpacity(0.03), borderRadius: BorderRadius.circular(12)),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Row(
                children: [
                  Icon(Icons.cloud_done, size: 16, color: AppColors.accentEmerald),
                  SizedBox(width: 8),
                  Text('Cloud Connected • Render API', style: TextStyle(fontSize: 12, color: AppColors.textMuted, fontWeight: FontWeight.w600)),
                ],
              ),
              IconButton(
                icon: const Icon(Icons.settings, size: 16, color: AppColors.textMuted),
                onPressed: () => _showServerConfigDialog(),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _settingRow(IconData icon, String title, String sub, bool enabled) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        children: [
          Icon(icon, size: 20, color: AppColors.accentViolet),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                Text(sub, style: TextStyle(fontSize: 12, color: AppColors.textMuted)),
              ],
            ),
          ),
          Switch(
            value: enabled,
            activeColor: AppColors.accentViolet,
            onChanged: (val) {},
          ),
        ],
      ),
    );
  }

  Widget _statBadge(String val, String label, Color color) {
    return Column(
      children: [
        Text(val, style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: color)),
        Text(label, style: TextStyle(fontSize: 11, color: AppColors.textMuted)),
      ],
    );
  }

  // MODAL 1: CREATE GOAL BOTTOM SHEET
  void _showCreateGoalBottomSheet() {
    final titleCtrl = TextEditingController();
    final whyCtrl = TextEditingController();
    String category = 'SKILL_ACQUISITION';
    double freq = 4;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppColors.bgSurface,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setModalState) => Padding(
          padding: EdgeInsets.only(
            left: 20, right: 20, top: 20,
            bottom: MediaQuery.of(ctx).viewInsets.bottom + 24,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('Create New Goal', style: GoogleFonts.outfit(fontSize: 20, fontWeight: FontWeight.bold)),
                  IconButton(icon: const Icon(Icons.close), onPressed: () => Navigator.pop(ctx)),
                ],
              ),
              const SizedBox(height: 16),
              TextField(
                controller: titleCtrl,
                style: const TextStyle(color: Colors.white),
                decoration: InputDecoration(
                  labelText: 'Goal Title',
                  labelStyle: const TextStyle(color: AppColors.textMuted),
                  filled: true,
                  fillColor: AppColors.bgGlassCard,
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                ),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: whyCtrl,
                style: const TextStyle(color: Colors.white),
                decoration: InputDecoration(
                  labelText: 'Why It Matters (Emotional Anchor)',
                  labelStyle: const TextStyle(color: AppColors.textMuted),
                  filled: true,
                  fillColor: AppColors.bgGlassCard,
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                ),
              ),
              const SizedBox(height: 14),
              const Text('Category', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
              const SizedBox(height: 6),
              DropdownButtonFormField<String>(
                value: category,
                dropdownColor: AppColors.bgSurface,
                decoration: InputDecoration(filled: true, fillColor: AppColors.bgGlassCard, border: OutlineInputBorder(borderRadius: BorderRadius.circular(12))),
                items: const [
                  DropdownMenuItem(value: 'SKILL_ACQUISITION', child: Text('📚 Skill Acquisition')),
                  DropdownMenuItem(value: 'HEALTH_FITNESS', child: Text('🏃 Health & Fitness')),
                  DropdownMenuItem(value: 'CAREER', child: Text('💼 Career & Work')),
                  DropdownMenuItem(value: 'MINDSET', child: Text('🧘 Mindset & Habit')),
                ],
                onChanged: (val) => setModalState(() => category = val!),
              ),
              const SizedBox(height: 14),
              Text('Weekly Frequency: ${freq.toInt()} days / week', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
              Slider(
                value: freq,
                min: 1, max: 7, divisions: 6,
                activeColor: AppColors.accentViolet,
                onChanged: (v) => setModalState(() => freq = v),
              ),
              const SizedBox(height: 16),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.accentViolet,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  onPressed: () async {
                    if (titleCtrl.text.trim().isEmpty) return;
                    await ApiClient.createGoal({
                      'title': titleCtrl.text.trim(),
                      'whyItMatters': whyCtrl.text.trim(),
                      'category': category,
                      'targetFrequencyPerWeek': freq.toInt(),
                    });
                    Navigator.pop(ctx);
                    _loadData();
                  },
                  child: const Text('Create Intentional Goal', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  // MODAL 2: GOAL DETAIL SHEET
  void _showGoalDetailSheet(Goal g) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppColors.bgSurface,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (ctx) => Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(g.category, style: const TextStyle(color: AppColors.accentViolet, fontWeight: FontWeight.bold, fontSize: 12)),
                IconButton(icon: const Icon(Icons.close), onPressed: () => Navigator.pop(ctx)),
              ],
            ),
            Text(g.title, style: GoogleFonts.outfit(fontSize: 20, fontWeight: FontWeight.bold)),
            if (g.whyItMatters != null) ...[
              const SizedBox(height: 4),
              Text('“${g.whyItMatters}”', style: TextStyle(color: AppColors.textMuted, fontStyle: FontStyle.italic)),
            ],
            const SizedBox(height: 16),
            ClipRRect(
              borderRadius: BorderRadius.circular(6),
              child: LinearProgressIndicator(value: g.progressPercentage / 100, color: AppColors.accentEmerald, backgroundColor: Colors.white10, minHeight: 8),
            ),
            const SizedBox(height: 8),
            Text('${g.progressPercentage.toInt()}% Completed · On Track', style: const TextStyle(color: AppColors.accentEmerald, fontWeight: FontWeight.bold, fontSize: 13)),
            const SizedBox(height: 20),
            const Text('Milestones & Actions', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
            const SizedBox(height: 10),
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(color: AppColors.bgGlassCard, borderRadius: BorderRadius.circular(14)),
              child: const Row(
                children: [
                  Icon(Icons.flag, size: 18, color: AppColors.accentViolet),
                  SizedBox(width: 10),
                  Text('Core Checkpoint 1 (Completed)', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
                ],
              ),
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  // MODAL 3: WEEKLY REFLECTION SHEET
  void _showWeeklyReflectionBottomSheet() {
    final wellCtrl = TextEditingController(text: 'Maintained consistency without burnout.');
    final focusCtrl = TextEditingController(text: 'Start higher difficulty modules.');

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppColors.bgSurface,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (ctx) => Padding(
        padding: EdgeInsets.only(
          left: 20, right: 20, top: 20,
          bottom: MediaQuery.of(ctx).viewInsets.bottom + 24,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Weekly Reflection', style: GoogleFonts.outfit(fontSize: 20, fontWeight: FontWeight.bold)),
                IconButton(icon: const Icon(Icons.close), onPressed: () => Navigator.pop(ctx)),
              ],
            ),
            const SizedBox(height: 12),
            TextField(
              controller: wellCtrl,
              style: const TextStyle(color: Colors.white),
              decoration: InputDecoration(labelText: 'What went well this week?', filled: true, fillColor: AppColors.bgGlassCard, border: OutlineInputBorder(borderRadius: BorderRadius.circular(12))),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: focusCtrl,
              style: const TextStyle(color: Colors.white),
              decoration: InputDecoration(labelText: 'Next week\'s top priority focus', filled: true, fillColor: AppColors.bgGlassCard, border: OutlineInputBorder(borderRadius: BorderRadius.circular(12))),
            ),
            const SizedBox(height: 16),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(backgroundColor: AppColors.accentViolet, padding: const EdgeInsets.symmetric(vertical: 14), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
                onPressed: () async {
                  await ApiClient.submitReflection({
                    'whatWentWell': wellCtrl.text.trim(),
                    'nextWeekFocus': focusCtrl.text.trim(),
                    'energyMoodRating': 5,
                  });
                  Navigator.pop(ctx);
                  _loadData();
                },
                child: const Text('Save Reflection', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // DIALOG: SERVER CONFIG
  void _showServerConfigDialog() {
    final ctrl = TextEditingController(text: ApiClient.baseUrl);
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppColors.bgSurface,
        title: const Text('Backend Server URL'),
        content: TextField(
          controller: ctrl,
          style: const TextStyle(color: Colors.white),
          decoration: const InputDecoration(hintText: 'https://...', hintStyle: TextStyle(color: Colors.white30)),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.accentViolet),
            onPressed: () {
              ApiClient.setBaseUrl(ctrl.text.trim());
              Navigator.pop(ctx);
              _loadData();
            },
            child: const Text('Save & Reconnect'),
          ),
        ],
      ),
    );
  }
}

extension FilterExt<T> on List<T> {
  List<T> filter(bool Function(T) test) {
    return where(test).toList();
  }
}
