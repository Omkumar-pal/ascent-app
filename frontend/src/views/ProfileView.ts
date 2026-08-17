import { ApiClient } from '../api/apiClient';

export class ProfileView {
  static async render(container: HTMLElement, onNavigate: (view: string, param?: string) => void) {
    container.innerHTML = `
      <div class="loading-spinner-container">
        <div class="pulse-ring"></div>
        <p class="loading-label">Loading profile...</p>
      </div>
    `;

    try {
      const data = await ApiClient.getProfile();
      const notifs = data.notificationPreferences || {};

      container.innerHTML = `
        <header style="margin-bottom: 24px;">
          <h1 class="screen-title">Personal Profile</h1>
        </header>

        <!-- User Info Card -->
        <section class="card-glass" style="display: flex; align-items: center; gap: 16px; margin-bottom: 20px;">
          <div style="width: 60px; height: 60px; border-radius: 50%; background: linear-gradient(135deg, var(--accent-violet) 0%, var(--accent-cyan) 100%); display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: 700; color: #FFF; box-shadow: var(--shadow-glow-violet);">
            ${data.fullName.charAt(0)}
          </div>
          <div style="flex: 1;">
            <h2 style="font-size: 18px;">${data.fullName}</h2>
            <div style="font-size: 13px; color: var(--text-secondary);">${data.email}</div>
            <div style="font-size: 12px; color: var(--accent-emerald); font-weight: 600; margin-top: 4px;">
              Progress Style: ${data.profile?.preferredProgressStyle || 'Balanced'}
            </div>
          </div>
        </section>

        <!-- Personal Lifetime Stats Grid -->
        <section style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 24px;">
          <div class="card-glass" style="padding: 16px; text-align: center;">
            <div style="font-size: 22px; font-weight: 800; color: var(--accent-violet);">${data.stats?.totalGoals ?? 0}</div>
            <div style="font-size: 12px; color: var(--text-muted); margin-top: 2px;">Active Goals</div>
          </div>

          <div class="card-glass" style="padding: 16px; text-align: center;">
            <div style="font-size: 22px; font-weight: 800; color: var(--accent-emerald);">${data.stats?.totalActionsCompleted ?? 0}</div>
            <div style="font-size: 12px; color: var(--text-muted); margin-top: 2px;">Actions Achieved</div>
          </div>
        </section>

        <!-- Notifications Settings -->
        <section class="card-glass" style="padding: 18px; margin-bottom: 24px;">
          <h3 style="font-size: 16px; margin-bottom: 14px;">Notification Cadence</h3>

          <div style="display: flex; flex-direction: column; gap: 14px;">
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <div>
                <div style="font-size: 14px; font-weight: 600;">Morning Focus Reminder</div>
                <div style="font-size: 12px; color: var(--text-muted);">Daily digest of today's actions at 07:30 AM</div>
              </div>
              <input type="checkbox" id="notif-morning" ${notifs.morningFocusReminder !== false ? 'checked' : ''} style="width: 20px; height: 20px; accent-color: var(--accent-violet);">
            </div>

            <div style="display: flex; align-items: center; justify-content: space-between; border-top: 1px solid var(--border-subtle); padding-top: 12px;">
              <div>
                <div style="font-size: 14px; font-weight: 600;">Evening Routine Check-in</div>
                <div style="font-size: 12px; color: var(--text-muted);">Gentle nudge for evening habit at 08:30 PM</div>
              </div>
              <input type="checkbox" id="notif-evening" ${notifs.eveningCheckInReminder !== false ? 'checked' : ''} style="width: 20px; height: 20px; accent-color: var(--accent-violet);">
            </div>

            <div style="display: flex; align-items: center; justify-content: space-between; border-top: 1px solid var(--border-subtle); padding-top: 12px;">
              <div>
                <div style="font-size: 14px; font-weight: 600;">Weekly Reflection Prompt</div>
                <div style="font-size: 12px; color: var(--text-muted);">Sunday evening review at 06:00 PM</div>
              </div>
              <input type="checkbox" id="notif-reflection" ${notifs.weeklyReflectionReminder !== false ? 'checked' : ''} style="width: 20px; height: 20px; accent-color: var(--accent-violet);">
            </div>
          </div>
        </section>

        <!-- Onboarding & App Management -->
        <section style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px;">
          <button class="btn-secondary" id="btn-reopen-onboarding">
            🚀 Review Onboarding Experience
          </button>
          <button class="btn-secondary" id="btn-logout" style="color: var(--accent-rose); border-color: rgba(244,63,94,0.3);">
            Log Out
          </button>
        </section>
      `;

      // Event listeners
      container.querySelector('#btn-reopen-onboarding')?.addEventListener('click', () => (window as any).openOnboardingModal());
      container.querySelector('#btn-logout')?.addEventListener('click', () => {
        ApiClient.clearToken();
        (window as any).showToast('Logged out successfully');
        onNavigate('auth');
      });

      // Notification toggle listener
      const saveNotifs = async () => {
        const morning = (container.querySelector('#notif-morning') as HTMLInputElement)?.checked;
        const evening = (container.querySelector('#notif-evening') as HTMLInputElement)?.checked;
        const reflection = (container.querySelector('#notif-reflection') as HTMLInputElement)?.checked;

        await ApiClient.updateNotifications({
          morningFocusReminder: morning,
          eveningCheckInReminder: evening,
          weeklyReflectionReminder: reflection,
        });
        (window as any).showToast('Notification preferences saved');
      };

      container.querySelector('#notif-morning')?.addEventListener('change', saveNotifs);
      container.querySelector('#notif-evening')?.addEventListener('change', saveNotifs);
      container.querySelector('#notif-reflection')?.addEventListener('change', saveNotifs);
    } catch (err: any) {
      container.innerHTML = `<p style="color: red;">Error: ${err.message}</p>`;
    }
  }
}
