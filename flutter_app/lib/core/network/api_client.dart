import 'dart:convert';
import 'package:http/http.dart' as http;
import '../../domain/entities/goal.dart';
import '../../domain/entities/reflection.dart';

class ApiClient {
  static String baseUrl = 'https://ascent-backend-api.onrender.com/api/v1';
  static String? _authToken;

  static void setBaseUrl(String url) {
    baseUrl = url;
  }

  static void setToken(String token) {
    _authToken = token;
  }

  static Map<String, String> get _headers => {
    'Content-Type': 'application/json',
    'bypass-tunnel-reminder': 'true',
    if (_authToken != null) 'Authorization': 'Bearer $_authToken',
  };

  static Future<Map<String, dynamic>> login(String email, String password) async {
    final response = await http.post(
      Uri.parse('$baseUrl/auth/login'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'email': email, 'password': password}),
    );
    final data = jsonDecode(response.body);
    if (data['token'] != null) {
      setToken(data['token']);
    }
    return data;
  }

  static Future<Map<String, dynamic>> getDashboard() async {
    final response = await http.get(Uri.parse('$baseUrl/dashboard/today'), headers: _headers);
    return jsonDecode(response.body);
  }

  static Future<List<Goal>> getGoals() async {
    final response = await http.get(Uri.parse('$baseUrl/goals'), headers: _headers);
    final List list = jsonDecode(response.body);
    return list.map((g) => Goal.fromJson(g)).toList();
  }

  static Future<Goal> getGoalById(String id) async {
    final response = await http.get(Uri.parse('$baseUrl/goals/$id'), headers: _headers);
    return Goal.fromJson(jsonDecode(response.body));
  }

  static Future<Goal> createGoal(Map<String, dynamic> data) async {
    final response = await http.post(
      Uri.parse('$baseUrl/goals'),
      headers: _headers,
      body: jsonEncode(data),
    );
    return Goal.fromJson(jsonDecode(response.body));
  }

  static Future<void> createMilestone(String goalId, String title) async {
    await http.post(
      Uri.parse('$baseUrl/milestones'),
      headers: _headers,
      body: jsonEncode({'goalId': goalId, 'title': title}),
    );
  }

  static Future<void> createAction(Map<String, dynamic> data) async {
    await http.post(
      Uri.parse('$baseUrl/actions'),
      headers: _headers,
      body: jsonEncode(data),
    );
  }

  static Future<void> submitReflection(Map<String, dynamic> data) async {
    await http.post(
      Uri.parse('$baseUrl/reflections'),
      headers: _headers,
      body: jsonEncode(data),
    );
  }

  static Future<Reflection?> getWeeklyReflectionSummary() async {
    final response = await http.get(Uri.parse('$baseUrl/reflections/summary'), headers: _headers);
    final data = jsonDecode(response.body);
    if (data['reflection'] != null) {
      return Reflection.fromJson(data['reflection']);
    }
    return null;
  }
}
