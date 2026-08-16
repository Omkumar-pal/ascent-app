import { ApiClient } from '../api/apiClient';

export class GoalsView {
  private static selectedCategory: string = 'ALL';
  private static selectedStatus: string = 'ACTIVE';

  static async render(container: HTMLElement, onNavigate: (view: string, param?: string) => void) {
    container.innerHTML = `
      <div class="loading-spinner-container">
        <div class="pulse-ring"></div>
        <p class="loading-label">Loading goals...</p>
      </div>
    `;

    try {
      const categoryParam = this.selectedCategory === 'ALL' ? undefined : this.selectedCategory;
      const statusParam = this.selectedStatus === 'ALL' ? undefined : this.selectedStatus;
      const goals = await ApiClient.getGoals(statusParam, categoryParam);

      const categories = ['ALL', 'HEALTH', 'LEARNING', 'CAREER', 'PRODUCTIVITY', 'PERSONAL'];

      container.innerHTML = `
        <header style="margin-bottom: 20px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
            <h1 class="screen-title">Goals Explorer</h1>
            <button class="btn-primary" id="btn-add-goal" style="width: auto; padding: 8px 16px; font-size: 13px;">+ New Goal</button>
          </div>

          <!-- Category filter pills -->
          <div style="display: flex; gap: 8px; overflow-x: auto; padding-bottom: 8px; scrollbar-width: none;">
            ${categories.map(cat => `
              <button class="category-pill ${this.selectedCategory === cat ? 'active' : ''}" data-cat="${cat}" style="
                padding: 6px 14px;
                border-radius: var(--radius-full);
                background: ${this.selectedCategory === cat ? 'var(--accent-violet)' : 'rgba(255,255,255,0.06)'};
                color: ${this.selectedCategory === cat ? '#FFF' : 'var(--text-secondary)'};
                border: 1px solid ${this.selectedCategory === cat ? 'var(--accent-violet)' : 'var(--border-subtle)'};
                font-size: 12px;
                font-weight: 600;
                cursor: pointer;
                white-space: nowrap;
              ">${cat}</button>
            `).join('')}
          </div>
        </header>

        <!-- Goals List -->
        <div style="display: flex; flex-direction: column; gap: 16px;">
          ${goals.length === 0 ? `
            <div style="text-align: center; padding: 40px 10px; color: var(--text-muted);">
              <p>No goals found in this category.</p>
              <button class="btn-secondary" id="btn-create-first-goal" style="margin-top: 14px;">Create a Goal</button>
            </div>
          ` : goals.map(g => `
            <div class="card-glass goal-card-detailed" data-goal-id="${g.id}" style="cursor: pointer;">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
                <span class="category-badge cat-${g.category.toLowerCase()}">${g.category}</span>
                <span class="status-pill status-${g.statusState.toLowerCase().replace('_', '-')}">${g.statusState.replace('_', ' ')}</span>
              </div>
              <h3 style="font-size: 18px; margin-bottom: 6px;">${g.title}</h3>
              ${g.whyItMatters ? `<p style="font-size: 13px; color: var(--text-muted); margin-bottom: 12px; font-style: italic;">“${g.whyItMatters}”</p>` : ''}
              
              <div style="display: flex; align-items: center; justify-content: space-between; font-size: 13px; color: var(--text-secondary); margin-bottom: 8px;">
                <span>${g.completedActionsCount || 0} / ${g.actionsCount || 0} actions</span>
                <span style="font-weight: 700; color: var(--text-primary);">${g.progressPercentage}%</span>
              </div>
              <div class="progress-bar-wrapper">
                <div class="progress-bar-fill" style="width: ${g.progressPercentage}%;"></div>
              </div>
              
              <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 14px; font-size: 12px; color: var(--text-muted); border-top: 1px solid var(--border-subtle); padding-top: 10px;">
                <span>🗓 Target: ${g.targetDate ? new Date(g.targetDate).toLocaleDateString() : 'Continuous'}</span>
                <span style="color: var(--accent-violet); font-weight: 600;">Details &rsaquo;</span>
              </div>
            </div>
          `).join('')}
        </div>
      `;

      // Event Listeners
      container.querySelector('#btn-add-goal')?.addEventListener('click', () => (window as any).openCreateGoalModal());
      container.querySelector('#btn-create-first-goal')?.addEventListener('click', () => (window as any).openCreateGoalModal());

      container.querySelectorAll('.category-pill').forEach(btn => {
        btn.addEventListener('click', () => {
          this.selectedCategory = (btn as HTMLElement).dataset.cat || 'ALL';
          this.render(container, onNavigate);
        });
      });

      container.querySelectorAll('.goal-card-detailed').forEach(card => {
        card.addEventListener('click', () => {
          const goalId = (card as HTMLElement).dataset.goalId;
          if (goalId) onNavigate('goal-detail', goalId);
        });
      });
    } catch (err: any) {
      container.innerHTML = `<p style="color: red;">Error: ${err.message}</p>`;
    }
  }
}
