import { ApiClient } from '../api/apiClient';

export class AuthView {
  static render(container: HTMLElement, onAuthSuccess: (isNewUser?: boolean) => void) {
    let mode: 'login' | 'register' = 'login';

    const renderForm = () => {
      container.innerHTML = `
        <div style="min-height: 100%; display: flex; flex-direction: column; justify-content: center; padding: 24px 16px;">
          <!-- Brand Header -->
          <div style="text-align: center; margin-bottom: 28px;">
            <div style="width: 56px; height: 56px; margin: 0 auto 16px; border-radius: 16px; background: linear-gradient(135deg, var(--accent-violet) 0%, #6D28D9 100%); display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 24px var(--accent-violet-glow);">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
            </div>
            <h1 style="font-family: var(--font-heading); font-size: 26px; font-weight: 800; letter-spacing: -0.5px; background: linear-gradient(135deg, #FFFFFF 0%, #A1A1AA 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
              ASCENT
            </h1>
            <p style="font-size: 13px; color: var(--text-secondary); margin-top: 4px;">
              Intentional Personal Goals & Habit Systems
            </p>
          </div>

          <!-- Auth Card -->
          <div class="card-glass" style="padding: 24px; border-radius: 20px; box-shadow: 0 16px 40px rgba(0,0,0,0.5);">
            <!-- Tab Switcher -->
            <div style="display: flex; background: rgba(255,255,255,0.06); padding: 4px; border-radius: 12px; margin-bottom: 22px;">
              <button id="tab-btn-login" style="flex: 1; padding: 10px; border-radius: 8px; border: none; font-family: var(--font-heading); font-size: 13px; font-weight: 700; cursor: pointer; transition: all 0.2s; ${mode === 'login' ? 'background: var(--accent-violet); color: #FFF; box-shadow: 0 4px 12px var(--accent-violet-glow);' : 'background: transparent; color: var(--text-muted);'}">
                Sign In
              </button>
              <button id="tab-btn-register" style="flex: 1; padding: 10px; border-radius: 8px; border: none; font-family: var(--font-heading); font-size: 13px; font-weight: 700; cursor: pointer; transition: all 0.2s; ${mode === 'register' ? 'background: var(--accent-violet); color: #FFF; box-shadow: 0 4px 12px var(--accent-violet-glow);' : 'background: transparent; color: var(--text-muted);'}">
                Create Account
              </button>
            </div>

            <!-- Error Banner -->
            <div id="auth-error" style="display: none; padding: 10px 14px; border-radius: 10px; background: rgba(244,63,94,0.15); border: 1px solid rgba(244,63,94,0.3); color: #FDA4AF; font-size: 12px; margin-bottom: 16px;"></div>

            <!-- Form -->
            <form id="auth-form" style="display: flex; flex-direction: column; gap: 14px;">
              ${mode === 'register' ? `
                <div>
                  <label style="display: block; font-size: 12px; font-weight: 600; color: var(--text-secondary); margin-bottom: 6px;">Full Name</label>
                  <input type="text" id="auth-name" class="modal-input" placeholder="e.g. Alex Rivera" required style="width: 100%; box-sizing: border-box;">
                </div>
              ` : ''}

              <div>
                <label style="display: block; font-size: 12px; font-weight: 600; color: var(--text-secondary); margin-bottom: 6px;">Email Address</label>
                <input type="email" id="auth-email" class="modal-input" placeholder="you@example.com" value="" required style="width: 100%; box-sizing: border-box;">
              </div>

              <div>
                <label style="display: block; font-size: 12px; font-weight: 600; color: var(--text-secondary); margin-bottom: 6px;">Password</label>
                <input type="password" id="auth-password" class="modal-input" placeholder="••••••••" value="" required style="width: 100%; box-sizing: border-box;">
              </div>

              ${mode === 'register' ? `
                <div>
                  <label style="display: block; font-size: 12px; font-weight: 600; color: var(--text-secondary); margin-bottom: 6px;">Progress Approach</label>
                  <select id="auth-style" class="modal-input" style="width: 100%; box-sizing: border-box;">
                    <option value="BALANCED">⚖️ Balanced (Sustainable 3-4 days/week)</option>
                    <option value="ROUTINE_DRIVEN">⚡ High Intensity (Daily routine driven)</option>
                    <option value="MILESTONE_DRIVEN">🌱 Milestone Focused (Milestone driven)</option>
                  </select>
                </div>
              ` : ''}

              <button type="submit" id="auth-submit-btn" class="btn-primary" style="margin-top: 8px; width: 100%; padding: 14px; font-size: 14px;">
                ${mode === 'login' ? 'Sign In to Ascent' : 'Get Started — Free'}
              </button>
            </form>

            ${mode === 'login' ? `
              <!-- Quick Demo Fill -->
              <div style="margin-top: 18px; text-align: center; border-top: 1px solid var(--border-subtle); padding-top: 14px;">
                <button type="button" id="btn-quick-fill" style="background: rgba(139,92,246,0.12); border: 1px solid rgba(139,92,246,0.3); color: #DDD6FE; font-size: 12px; font-weight: 600; padding: 8px 14px; border-radius: 20px; cursor: pointer; transition: all 0.2s;">
                  ✨ Quick Fill Demo User (Alex Rivera)
                </button>
              </div>
            ` : ''}
          </div>
        </div>
      `;

      // Event handlers
      container.querySelector('#tab-btn-login')?.addEventListener('click', () => {
        mode = 'login';
        renderForm();
      });

      container.querySelector('#tab-btn-register')?.addEventListener('click', () => {
        mode = 'register';
        renderForm();
      });

      container.querySelector('#btn-quick-fill')?.addEventListener('click', () => {
        const emailInput = container.querySelector('#auth-email') as HTMLInputElement;
        const passInput = container.querySelector('#auth-password') as HTMLInputElement;
        if (emailInput) emailInput.value = 'alex@ascent.app';
        if (passInput) passInput.value = 'password123';
      });

      const form = container.querySelector('#auth-form') as HTMLFormElement;
      form?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = container.querySelector('#auth-submit-btn') as HTMLButtonElement;
        const errorBanner = container.querySelector('#auth-error') as HTMLElement;
        const email = (container.querySelector('#auth-email') as HTMLInputElement).value.trim();
        const password = (container.querySelector('#auth-password') as HTMLInputElement).value.trim();

        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.textContent = mode === 'login' ? 'Authenticating...' : 'Creating profile...';
        }
        if (errorBanner) errorBanner.style.display = 'none';

        try {
          if (mode === 'login') {
            await ApiClient.login(email, password);
            (window as any).showToast('Welcome back to Ascent!');
            onAuthSuccess(false);
          } else {
            const name = (container.querySelector('#auth-name') as HTMLInputElement)?.value.trim() || 'Ascent User';
            const style = (container.querySelector('#auth-style') as HTMLSelectElement)?.value || 'BALANCED';
            await ApiClient.register({
              fullName: name,
              name,
              email,
              password,
              preferredProgressStyle: style,
            });
            (window as any).showToast('Account created successfully!');
            onAuthSuccess(true);
          }
        } catch (err: any) {
          if (errorBanner) {
            errorBanner.textContent = err.message || 'Authentication failed. Please check your credentials.';
            errorBanner.style.display = 'block';
          }
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = mode === 'login' ? 'Sign In to Ascent' : 'Get Started — Free';
          }
        }
      });
    };

    renderForm();
  }
}
