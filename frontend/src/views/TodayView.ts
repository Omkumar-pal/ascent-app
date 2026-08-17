import { ApiClient } from '../api/apiClient';

export class TodayView {
  static async render(container: HTMLElement, onNavigate: (view: string, param?: string) => void) {
    container.innerHTML = `
      <div class="loading-spinner-container">
        <div class="pulse-ring"></div>
        <p class="loading-label">Gathering today's focus...</p>
      </div>
    `;

    try {
      const data = await ApiClient.getTodayDashboard();

      const { greeting, consistency, todayFocus, activeGoals, todayActionFlow } = data;
      const circumference = 2 * Math.PI * 36;
      const offset = circumference - (todayFocus.percentage / 100) * circumference;

      container.innerHTML = `
        <!-- Top Greeting Header -->
        <header class="dashboard-header">
          <div>
            <h1 class="user-greeting">${greeting} 👋</h1>
          </div>
          <div class="consistency-pill" id="consistency-badge">
            <span>🔥</span>
            <span>${consistency.consistencyPillText}</span>
          </div>
        </header>

        <!-- SVG Gradients -->
        <svg style="width:0;height:0;position:absolute;" aria-hidden="true" focusable="false">
          <linearGradient id="violetEmeraldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#8B5CF6" />
            <stop offset="100%" stop-color="#10B981" />
          </linearGradient>
        </svg>

        <!-- Hero Today's Focus Card -->
        <section class="card-glass focus-card">
          <div class="focus-card-info">
            <h3>Today's Focus</h3>
            <div class="focus-card-headline">${todayFocus.headline}</div>
            <div class="focus-card-subtext">${todayFocus.percentage}% Completed · Maintain Cadence</div>
          </div>
          <div class="progress-ring-container">
            <svg class="progress-ring-svg" viewBox="0 0 88 88">
              <circle class="progress-ring-circle-bg" cx="44" cy="44" r="36"></circle>
              <circle class="progress-ring-circle-val" cx="44" cy="44" r="36"
                stroke-dasharray="${circumference}"
                stroke-dashoffset="${offset}"></circle>
            </svg>
            <div class="progress-ring-label">${todayFocus.percentage}%</div>
          </div>
        </section>

        <!-- Active Goals Section -->
        <section style="margin-bottom: 24px;">
          <div class="section-title">
            <h2>Active Goals</h2>
            <a class="section-link" id="view-all-goals">View all &rsaquo;</a>
          </div>
          <div class="goals-carousel-track">
            ${activeGoals.map((g: any) => `
              <div class="goal-card-compact" data-goal-id="${g.id}">
                <span class="category-badge cat-${g.category.toLowerCase()}">${g.category}</span>
                <h4>${g.title}</h4>
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
                  <span class="status-pill status-${g.statusState.toLowerCase().replace('_', '-')}">${g.statusState.replace('_', ' ')}</span>
                  <span style="font-size: 12px; color: var(--text-secondary); font-weight: 600;">${g.progressPercentage}%</span>
                </div>
                <div class="progress-bar-wrapper">
                  <div class="progress-bar-fill" style="width: ${g.progressPercentage}%;"></div>
                </div>
              </div>
            `).join('')}
          </div>
        </section>

        <!-- Today's Action Flow Section -->
        <section>
          <div class="section-title">
            <h2>Today's Action Flow</h2>
            <span style="font-size: 13px; color: var(--text-muted);">${todayActionFlow.length} planned</span>
          </div>

          <div class="action-items-list">
            ${todayActionFlow.length === 0 ? `
              <div style="text-align: center; padding: 30px 10px; color: var(--text-muted);">
                <p>No actions scheduled for today.</p>
                <button class="btn-secondary" id="btn-add-action-empty" style="margin-top: 12px;">+ Add an Action</button>
              </div>
            ` : todayActionFlow.map((action: any) => `
              <div class="action-card ${action.status === 'COMPLETED' ? 'completed' : ''}" data-action-id="${action.id}">
                <div class="action-check-toggle ${action.status === 'COMPLETED' ? 'checked' : ''}" data-toggle-action="${action.id}">
                  ${action.status === 'COMPLETED' ? `
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  ` : ''}
                </div>
                <div class="action-details">
                  <div class="action-title">${action.title}</div>
                  <div class="action-meta">
                    ${action.preferredTime ? `<span>⏰ ${action.preferredTime}</span>` : ''}
                    <span>⏱ ${action.estimatedDurationMinutes} mins</span>
                    ${action.goal ? `<span class="routine-tag">${action.goal.title}</span>` : ''}
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </section>
      `;

      // Event Listeners
      container.querySelector('#view-all-goals')?.addEventListener('click', () => onNavigate('goals'));
      container.querySelector('#consistency-badge')?.addEventListener('click', () => onNavigate('progress'));

      // Goal card clicks -> Navigate to Goal Detail
      container.querySelectorAll('.goal-card-compact').forEach(card => {
        card.addEventListener('click', () => {
          const goalId = (card as HTMLElement).dataset.goalId;
          if (goalId) onNavigate('goal-detail', goalId);
        });
      });

      // Action Checkbox Toggle
      container.querySelectorAll('.action-check-toggle').forEach(toggle => {
        toggle.addEventListener('click', async (e) => {
          e.stopPropagation();
          const actionId = (toggle as HTMLElement).dataset.toggleAction;
          if (!actionId) return;

          const isChecked = toggle.classList.contains('checked');
          if (!isChecked) {
            // Optimistic update
            toggle.classList.add('checked');
            (toggle.closest('.action-card') as HTMLElement)?.classList.add('completed');
            (window as any).showToast('✨ Action completed! Cadence updated.');
            await ApiClient.completeAction(actionId);
            // Reload dashboard to update stats
            TodayView.render(container, onNavigate);
          }
        });
      });
    } catch (err: any) {
      container.innerHTML = `
        <div style="text-align: center; padding: 40px 20px;">
          <h3>Connecting to Ascent Engine...</h3>
          <p style="color: var(--text-muted); margin: 12px 0;">${err.message}</p>
          <button class="btn-primary" id="retry-btn">Retry Connection</button>
        </div>
      `;
      container.querySelector('#retry-btn')?.addEventListener('click', () => TodayView.render(container, onNavigate));
    }
  }
}
