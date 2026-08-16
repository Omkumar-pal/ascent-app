const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'https://ascent-backend-api.onrender.com/api/v1'
  : 'https://ascent-backend-api.onrender.com/api/v1';

export class ApiClient {
  private static tokenKey = 'ascent_auth_token';

  static getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  static setToken(token: string) {
    localStorage.setItem(this.tokenKey, token);
  }

  static clearToken() {
    localStorage.removeItem(this.tokenKey);
  }

  private static async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401 && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/register')) {
      // Auto-login with demo credentials if token expired
      const autoAuth = await this.login('alex@ascent.app', 'password123');
      if (autoAuth?.token) {
        this.setToken(autoAuth.token);
        return this.request<T>(endpoint, options);
      }
    }

    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: 'Network request failed' }));
      throw new Error(err.error || `HTTP error ${response.status}`);
    }

    return response.json();
  }

  static async login(email = 'alex@ascent.app', password = 'password123') {
    const res = await this.request<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (res.token) this.setToken(res.token);
    return res;
  }

  static async register(data: { email: string; password: string; fullName: string; primaryObjective?: string; preferredProgressStyle?: string }) {
    const res = await this.request<{ token: string; user: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (res.token) this.setToken(res.token);
    return res;
  }

  static async getTodayDashboard() {
    return this.request<any>('/dashboard/today');
  }

  static async getGoals(status?: string, category?: string) {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (category) params.append('category', category);
    return this.request<any[]>(`/goals?${params.toString()}`);
  }

  static async getGoalById(id: string) {
    return this.request<any>(`/goals/${id}`);
  }

  static async createGoal(data: any) {
    return this.request<any>('/goals', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async updateGoal(id: string, data: any) {
    return this.request<any>(`/goals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  static async deleteGoal(id: string) {
    return this.request<any>(`/goals/${id}`, {
      method: 'DELETE',
    });
  }

  static async createMilestone(data: any) {
    return this.request<any>('/milestones', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async createAction(data: any) {
    return this.request<any>('/actions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async completeAction(id: string, durationSpentMinutes?: number, notes?: string) {
    return this.request<any>(`/actions/${id}/complete`, {
      method: 'POST',
      body: JSON.stringify({ durationSpentMinutes, notes }),
    });
  }

  static async skipAction(id: string, notes?: string) {
    return this.request<any>(`/actions/${id}/skip`, {
      method: 'POST',
      body: JSON.stringify({ notes }),
    });
  }

  static async getRoutines() {
    return this.request<any[]>('/routines');
  }

  static async updateRoutine(id: string, data: any) {
    return this.request<any>(`/routines/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  static async getWeeklyReflectionSummary() {
    return this.request<any>('/reflections/summary');
  }

  static async saveWeeklyReflection(data: any) {
    return this.request<any>('/reflections', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async getProfile() {
    return this.request<any>('/profile');
  }

  static async updateProfile(data: any) {
    return this.request<any>('/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  static async updateNotifications(data: any) {
    return this.request<any>('/profile/notifications', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }
}
