import { ApiClient } from '../api/apiClient';

export class CalendarView {
  static async render(container: HTMLElement, _onNavigate: (view: string, param?: string) => void) {
    container.innerHTML = `
      <div class="loading-spinner-container">
        <div class="pulse-ring"></div>
        <p class="loading-label">Loading schedule...</p>
      </div>
    `;

    try {
      const data = await ApiClient.getTodayDashboard();
      const now = new Date();
      const currentMonthName = now.toLocaleString('default', { month: 'long', year: 'numeric' });
      const currentDay = now.getDate();

      const daysOfWeek = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

      container.innerHTML = `
        <header style="margin-bottom: 20px;">
          <h1 class="screen-title">Schedule & Routines</h1>
          <p style="font-size: 13px; color: var(--text-secondary); margin-top: 4px;">Track upcoming routine slots & milestone targets</p>
        </header>

        <!-- Month Header -->
        <section class="card-glass" style="padding: 18px; margin-bottom: 24px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
            <h2 style="font-size: 16px; font-weight: 700;">${currentMonthName}</h2>
            <div style="font-size: 12px; color: var(--accent-violet); font-weight: 600;">Routine Cadence: Active</div>
          </div>

          <!-- Days Header -->
          <div class="calendar-grid" style="margin-top: 6px;">
            ${daysOfWeek.map(d => `<div class="cal-day-header">${d}</div>`).join('')}
          </div>

          <!-- Calendar Grid Cells -->
          <div class="calendar-grid">
            ${Array.from({ length: 31 }, (_, i) => {
              const day = i + 1;
              const isToday = day === currentDay;
              const hasRoutine = [1, 3, 5, 8, 10, 12, 15, 17, 19, 22, 24, 26, 29].includes(day);

              return `
                <div class="cal-day-cell ${isToday ? 'today' : ''}">
                  <span>${day}</span>
                  ${hasRoutine ? '<div class="cal-dot"></div>' : ''}
                </div>
              `;
            }).join('')}
          </div>
        </section>

        <!-- Agenda for Today -->
        <section>
          <div class="section-title">
            <h2>Today's Planned Agenda</h2>
            <span style="font-size: 13px; color: var(--text-muted);">${data.todayActionFlow.length} Items</span>
          </div>

          <div class="action-items-list">
            ${data.todayActionFlow.map((action: any) => `
              <div class="action-card ${action.status === 'COMPLETED' ? 'completed' : ''}">
                <div style="font-size: 18px;">${action.status === 'COMPLETED' ? '✅' : '⏳'}</div>
                <div class="action-details">
                  <div class="action-title">${action.title}</div>
                  <div class="action-meta">
                    <span>⏰ ${action.preferredTime || '08:00'}</span>
                    <span>⏱ ${action.estimatedDurationMinutes} mins</span>
                    <span class="routine-tag">${action.goal?.title || 'Active Routine'}</span>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </section>
      `;
    } catch (err: any) {
      container.innerHTML = `<p style="color: red;">Error: ${err.message}</p>`;
    }
  }
}
