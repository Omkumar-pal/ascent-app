import { ApiClient } from '../api/apiClient';

export class GoalDetailView {
  static async render(container: HTMLElement, goalId: string, onNavigate: (view: string, param?: string) => void) {
    container.innerHTML = `
      <div class="loading-spinner-container">
        <div class="pulse-ring"></div>
        <p class="loading-label">Loading goal breakdown...</p>
      </div>
    `;

    try {
      const goal = await ApiClient.getGoalById(goalId);

      const routine = goal.routines && goal.routines[0] ? goal.routines[0] : null;
      let routineDaysText = 'Mon, Wed, Fri';
      if (routine?.daysOfWeek) {
        const daysMap: Record<number, string> = { 1: 'Mon', 2: 'Tue', 3: 'Wed', 4: 'Thu', 5: 'Fri', 6: 'Sat', 7: 'Sun' };
        try {
          const arr: number[] = typeof routine.daysOfWeek === 'string' ? JSON.parse(routine.daysOfWeek) : routine.daysOfWeek;
          routineDaysText = arr.map(d => daysMap[d] || 'Day').join(', ');
        } catch {
          routineDaysText = 'Scheduled routine';
        }
      }

      container.innerHTML = `
        <!-- Top Back Navigation Header -->
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px;">
          <button id="btn-back-goals" style="background: none; border: none; color: var(--text-primary); font-size: 20px; cursor: pointer; display: flex; align-items: center; gap: 6px;">
            <span>&larr;</span>
            <span style="font-size: 14px; font-weight: 600;">Back</span>
          </button>
          <div style="display: flex; gap: 8px;">
            <button id="btn-edit-goal" class="btn-secondary" style="width: auto; padding: 6px 12px; font-size: 12px;">Edit</button>
          </div>
        </div>

        <!-- Goal Header & Progress Pill -->
        <section style="display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 20px;">
          <div style="flex: 1; padding-right: 14px;">
            <h1 style="font-size: 24px; margin-bottom: 8px;">${goal.title}</h1>
            <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
              <span class="category-badge cat-${goal.category.toLowerCase()}">${goal.category}</span>
              <span class="status-pill status-${goal.statusState.toLowerCase().replace('_', '-')}">${goal.statusState.replace('_', ' ')}</span>
            </div>
            ${goal.whyItMatters ? `<p style="font-size: 13px; color: var(--text-secondary); margin-top: 10px; line-height: 1.4;">${goal.whyItMatters}</p>` : ''}
          </div>

          <!-- Circular Metric -->
          <div class="progress-ring-container" style="width: 74px; height: 74px; flex-shrink: 0;">
            <svg class="progress-ring-svg" viewBox="0 0 88 88">
              <circle class="progress-ring-circle-bg" cx="44" cy="44" r="36"></circle>
              <circle class="progress-ring-circle-val" cx="44" cy="44" r="36"
                stroke-dasharray="${2 * Math.PI * 36}"
                stroke-dashoffset="${(2 * Math.PI * 36) - (goal.progressPercentage / 100) * (2 * Math.PI * 36)}"></circle>
            </svg>
            <div class="progress-ring-label" style="font-size: 15px;">${goal.progressPercentage}%</div>
          </div>
        </section>

        <!-- Personal Routine Card -->
        <section class="card-glass" style="display: flex; align-items: center; gap: 14px; margin-bottom: 24px; background: rgba(22, 28, 41, 0.9);">
          <div style="width: 42px; height: 42px; border-radius: 12px; background: rgba(139, 92, 246, 0.15); display: flex; align-items: center; justify-content: center; color: var(--accent-violet); font-size: 20px;">
            🗓
          </div>
          <div>
            <div style="font-size: 14px; font-weight: 700; color: var(--text-primary);">Personal Routine</div>
            <div style="font-size: 13px; color: var(--text-secondary);">${routineDaysText} at ${routine?.preferredTime || '08:00'} (${routine?.targetDurationMinutes || 30} min)</div>
          </div>
        </section>

        <!-- Milestones Hierarchy Section -->
        <section style="margin-bottom: 24px;">
          <div class="section-title">
            <h2>Milestones & Actions</h2>
            <button id="btn-add-milestone" style="background: none; border: none; color: var(--accent-violet); font-size: 13px; font-weight: 600; cursor: pointer;">+ Add Milestone</button>
          </div>

          <div style="display: flex; flex-direction: column; gap: 16px;">
            ${(goal.milestones || []).length === 0 ? `
              <div style="text-align: center; padding: 24px; color: var(--text-muted);">
                <p>No milestones created yet.</p>
                <button class="btn-secondary" id="btn-add-first-milestone" style="margin-top: 10px;">+ Create First Milestone</button>
              </div>
            ` : goal.milestones.map((m: any, idx: number) => `
              <div class="card-glass milestone-card" style="padding: 16px;">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
                  <div>
                    <span style="font-size: 11px; font-weight: 600; color: var(--accent-violet); text-transform: uppercase;">Milestone ${idx + 1}</span>
                    <h3 style="font-size: 16px;">${m.title}</h3>
                  </div>
                  <span style="font-size: 12px; color: var(--text-muted); font-weight: 600;">
                    ${(m.actions || []).filter((a: any) => a.status === 'COMPLETED').length}/${(m.actions || []).length} Actions
                  </span>
                </div>

                <!-- Milestone Actions list -->
                <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 12px;">
                  ${(m.actions || []).map((action: any) => `
                    <div style="display: flex; align-items: center; gap: 12px; background: rgba(0,0,0,0.2); padding: 10px 12px; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
                      <div class="action-check-toggle ${action.status === 'COMPLETED' ? 'checked' : ''}" data-action-id="${action.id}" style="width: 22px; height: 22px;">
                        ${action.status === 'COMPLETED' ? `
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        ` : ''}
                      </div>
                      <div style="flex: 1;">
                        <div style="font-size: 13px; font-weight: 600; color: ${action.status === 'COMPLETED' ? 'var(--text-muted)' : 'var(--text-primary)'}; text-decoration: ${action.status === 'COMPLETED' ? 'line-through' : 'none'};">
                          ${action.title}
                        </div>
                        <div style="font-size: 11px; color: var(--text-muted);">⏱ ${action.estimatedDurationMinutes} mins · ${action.difficulty}</div>
                      </div>
                    </div>
                  `).join('')}
                </div>

                <button class="btn-secondary btn-add-action-to-m" data-milestone-id="${m.id}" style="margin-top: 12px; padding: 8px; font-size: 12px;">
                  + Add Action to Milestone
                </button>
              </div>
            `).join('')}
          </div>
        </section>

        <!-- Bottom Action Button -->
        <button class="btn-primary" id="btn-add-action-floating" style="margin-top: 10px;">
          + Add New Action
        </button>
      `;

      // Event Listeners
      container.querySelector('#btn-back-goals')?.addEventListener('click', () => onNavigate('goals'));
      container.querySelector('#btn-add-milestone')?.addEventListener('click', () => (window as any).openCreateMilestoneModal(goalId));
      container.querySelector('#btn-add-first-milestone')?.addEventListener('click', () => (window as any).openCreateMilestoneModal(goalId));
      container.querySelector('#btn-add-action-floating')?.addEventListener('click', () => (window as any).openCreateActionModal(goalId));

      container.querySelectorAll('.btn-add-action-to-m').forEach(btn => {
        btn.addEventListener('click', () => {
          const mId = (btn as HTMLElement).dataset.milestoneId;
          (window as any).openCreateActionModal(goalId, mId);
        });
      });

      // Toggle action complete
      container.querySelectorAll('.action-check-toggle').forEach(toggle => {
        toggle.addEventListener('click', async () => {
          const actionId = (toggle as HTMLElement).dataset.actionId;
          if (!actionId) return;

          toggle.classList.toggle('checked');
          (window as any).showToast('✨ Progress updated!');
          await ApiClient.completeAction(actionId);
          GoalDetailView.render(container, goalId, onNavigate);
        });
      });
    } catch (err: any) {
      container.innerHTML = `<p style="color: red;">Error: ${err.message}</p>`;
    }
  }
}
