import { ApiClient } from '../api/apiClient';

export class ProgressView {
  static async render(container: HTMLElement, _onNavigate: (view: string, param?: string) => void) {
    container.innerHTML = `
      <div class="loading-spinner-container">
        <div class="pulse-ring"></div>
        <p class="loading-label">Analyzing consistency and velocity...</p>
      </div>
    `;

    try {
      const summary = await ApiClient.getWeeklyReflectionSummary();
      const reflection = summary.reflection;

      // Simulated weekly consistency bars
      const barData = [
        { day: 'M', pct: 90 },
        { day: 'T', pct: 85 },
        { day: 'W', pct: 95 },
        { day: 'T', pct: 70 },
        { day: 'F', pct: 88 },
        { day: 'S', pct: 92 },
        { day: 'S', pct: 80 },
      ];

      container.innerHTML = `
        <header style="margin-bottom: 20px;">
          <h1 class="screen-title">Weekly Reflection & Progress</h1>
          <p style="font-size: 13px; color: var(--text-secondary); margin-top: 4px;">Oct 23 - 29 · Consistency Review</p>
        </header>

        <!-- Week in Review Chart Card -->
        <section class="card-glass" style="margin-bottom: 20px;">
          <div style="font-size: 14px; font-weight: 600; color: var(--text-secondary); margin-bottom: 8px;">Weekly Consistency (Mon-Sun)</div>
          
          <div class="weekly-bar-chart">
            ${barData.map(b => `
              <div class="bar-column">
                <span class="bar-pct-label">${b.pct}%</span>
                <div class="bar-tube">
                  <div class="bar-tube-fill" style="height: ${b.pct}%;"></div>
                </div>
                <span class="bar-day-name">${b.day}</span>
              </div>
            `).join('')}
          </div>
        </section>

        <!-- Metric Stat Cards Grid -->
        <section style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 20px;">
          <div class="card-glass" style="padding: 14px 10px; text-align: center; border-color: var(--border-emerald);">
            <div style="font-size: 18px; margin-bottom: 4px;">✅</div>
            <div style="font-size: 16px; font-weight: 700; color: var(--text-primary);">${summary.actionsCompletedCount || 18}</div>
            <div style="font-size: 11px; color: var(--text-muted);">Completed</div>
          </div>

          <div class="card-glass" style="padding: 14px 10px; text-align: center; border-color: rgba(245, 158, 11, 0.4);">
            <div style="font-size: 18px; margin-bottom: 4px;">➡️</div>
            <div style="font-size: 16px; font-weight: 700; color: var(--text-primary);">${summary.actionsRescheduledOrSkippedCount || 2}</div>
            <div style="font-size: 11px; color: var(--text-muted);">Rescheduled</div>
          </div>

          <div class="card-glass" style="padding: 14px 10px; text-align: center; border-color: var(--border-focus);">
            <div style="font-size: 18px; margin-bottom: 4px;">🔥</div>
            <div style="font-size: 16px; font-weight: 700; color: var(--text-primary);">${summary.consistencyRate || 88}%</div>
            <div style="font-size: 11px; color: var(--text-muted);">Consistency</div>
          </div>
        </section>

        <!-- Highlights Cards -->
        <section style="margin-bottom: 20px;">
          <div class="section-title">
            <h2>Cadence Highlights</h2>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <div class="card-glass" style="padding: 14px;">
              <div style="font-size: 12px; color: #34D399; font-weight: 600; margin-bottom: 4px;">🌟 Strongest Area</div>
              <div style="font-size: 14px; font-weight: 700;">${summary.strongestArea || 'Health & Fitness'}</div>
              <div style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">6 workouts completed · 100% adherence</div>
            </div>

            <div class="card-glass" style="padding: 14px;">
              <div style="font-size: 12px; color: #FBBF24; font-weight: 600; margin-bottom: 4px;">⚠️ Needs Attention</div>
              <div style="font-size: 14px; font-weight: 700;">${summary.needsAttentionArea || 'Spanish Reading'}</div>
              <div style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">Missed 1 routine slot on Thursday</div>
            </div>
          </div>
        </section>

        <!-- Reflective Journal Card -->
        <section class="card-glass" style="padding: 18px; margin-bottom: 24px; background: rgba(22, 28, 41, 0.95);">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
            <div style="font-size: 15px; font-weight: 700;">Reflective Journal</div>
            <button id="btn-edit-journal" style="background: none; border: none; color: var(--accent-violet); font-size: 16px; cursor: pointer;">✏️</button>
          </div>

          <div style="font-size: 13px; color: var(--text-muted); margin-bottom: 6px;">What went well this week?</div>
          <p style="font-size: 13px; font-style: italic; color: var(--text-secondary); line-height: 1.5; margin-bottom: 12px;">
            "${reflection?.whatWentWell || 'I consistently finished my morning routines and made great progress on the work project. Felt mindful during meditations. Need to prioritize early evenings better.'}"
          </p>

          ${reflection?.nextWeekFocus ? `
            <div style="font-size: 13px; color: var(--text-muted); margin-bottom: 6px;">Next week's primary focus:</div>
            <p style="font-size: 13px; color: var(--text-primary); font-weight: 500;">
              ${reflection.nextWeekFocus}
            </p>
          ` : ''}
        </section>

        <!-- Bottom Action Button -->
        <button class="btn-primary" id="btn-open-weekly-reflection-form">
          Set Next Week's Priorities & Reflection
        </button>
      `;

      // Event Listeners
      container.querySelector('#btn-open-weekly-reflection-form')?.addEventListener('click', () => (window as any).openWeeklyReflectionModal());
      container.querySelector('#btn-edit-journal')?.addEventListener('click', () => (window as any).openWeeklyReflectionModal());
    } catch (err: any) {
      container.innerHTML = `<p style="color: red;">Error: ${err.message}</p>`;
    }
  }
}
