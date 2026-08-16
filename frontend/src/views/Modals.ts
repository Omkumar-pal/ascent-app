import { ApiClient } from '../api/apiClient';

export class ModalsManager {
  private static overlay = document.getElementById('modal-container') as HTMLElement;
  private static content = document.getElementById('modal-content') as HTMLElement;

  static show(html: string) {
    this.content.innerHTML = html;
    this.overlay.classList.remove('hidden');

    this.content.querySelector('.modal-close-btn')?.addEventListener('click', () => this.hide());
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) this.hide();
    });
  }

  static hide() {
    this.overlay.classList.add('hidden');
    this.content.innerHTML = '';
  }

  static openCreateGoal(onSuccess: () => void) {
    this.show(`
      <div class="modal-header">
        <h2 style="font-size: 20px;">Define New Goal</h2>
        <button class="modal-close-btn">&times;</button>
      </div>

      <form id="form-create-goal">
        <div class="form-group">
          <label class="form-label">Goal Title *</label>
          <input type="text" id="goal-title" class="form-input" placeholder="e.g. Master Classical Guitar" required>
        </div>

        <div class="form-group">
          <label class="form-label">Category</label>
          <select id="goal-category" class="form-select">
            <option value="LEARNING">Learning</option>
            <option value="HEALTH">Health & Fitness</option>
            <option value="CAREER">Career & Leadership</option>
            <option value="PRODUCTIVITY">Productivity & Focus</option>
            <option value="PERSONAL">Personal & Well-being</option>
            <option value="FINANCE">Finance</option>
            <option value="RELATIONSHIPS">Relationships</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">Why does this goal matter? (Core Intent)</label>
          <textarea id="goal-why" class="form-textarea" placeholder="e.g. Express creativity and share music with friends and family during evenings."></textarea>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div class="form-group">
            <label class="form-label">Priority</label>
            <select id="goal-priority" class="form-select">
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
              <option value="LOW">Low</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Weekly Frequency</label>
            <select id="goal-freq" class="form-select">
              <option value="3">3x per week</option>
              <option value="4">4x per week</option>
              <option value="5">5x per week</option>
              <option value="2">2x per week</option>
              <option value="7">Every day</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Target Completion Date</label>
          <input type="date" id="goal-target-date" class="form-input" value="${new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0]}">
        </div>

        <button type="submit" class="btn-primary" style="margin-top: 10px;">
          Create Goal & Setup Routine
        </button>
      </form>
    `);

    document.getElementById('form-create-goal')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const title = (document.getElementById('goal-title') as HTMLInputElement).value;
      const category = (document.getElementById('goal-category') as HTMLSelectElement).value;
      const whyItMatters = (document.getElementById('goal-why') as HTMLTextAreaElement).value;
      const priority = (document.getElementById('goal-priority') as HTMLSelectElement).value;
      const freq = parseInt((document.getElementById('goal-freq') as HTMLSelectElement).value);
      const targetDate = (document.getElementById('goal-target-date') as HTMLInputElement).value;

      try {
        await ApiClient.createGoal({
          title,
          category,
          whyItMatters,
          priority,
          targetFrequencyPerWeek: freq,
          targetDate,
          routine: {
            routineType: 'DAYS_OF_WEEK',
            daysOfWeek: [1, 3, 5],
            preferredTime: '08:00',
            targetDurationMinutes: 30,
          },
          milestones: [
            {
              title: 'Phase 1: Foundations',
              actions: [
                { title: `Daily practice for ${title}`, estimatedDurationMinutes: 30, difficulty: 'MEDIUM' }
              ]
            }
          ]
        });

        (window as any).showToast('🎉 Goal created successfully with routine!');
        this.hide();
        onSuccess();
      } catch (err: any) {
        alert('Error: ' + err.message);
      }
    });
  }

  static openCreateMilestone(goalId: string, onSuccess: () => void) {
    this.show(`
      <div class="modal-header">
        <h2 style="font-size: 20px;">Add Milestone</h2>
        <button class="modal-close-btn">&times;</button>
      </div>

      <form id="form-create-milestone">
        <div class="form-group">
          <label class="form-label">Milestone Title *</label>
          <input type="text" id="m-title" class="form-input" placeholder="e.g. Master intermediate repertoire" required>
        </div>

        <div class="form-group">
          <label class="form-label">Description (Optional)</label>
          <textarea id="m-desc" class="form-textarea" placeholder="Key outcomes or focus for this milestone"></textarea>
        </div>

        <button type="submit" class="btn-primary" style="margin-top: 10px;">
          Add Milestone
        </button>
      </form>
    `);

    document.getElementById('form-create-milestone')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const title = (document.getElementById('m-title') as HTMLInputElement).value;
      const description = (document.getElementById('m-desc') as HTMLTextAreaElement).value;

      try {
        await ApiClient.createMilestone({ goalId, title, description });
        (window as any).showToast('Milestone added!');
        this.hide();
        onSuccess();
      } catch (err: any) {
        alert('Error: ' + err.message);
      }
    });
  }

  static openCreateAction(goalId: string, milestoneId?: string, onSuccess?: () => void) {
    this.show(`
      <div class="modal-header">
        <h2 style="font-size: 20px;">Create Action</h2>
        <button class="modal-close-btn">&times;</button>
      </div>

      <form id="form-create-action">
        <div class="form-group">
          <label class="form-label">Action Name *</label>
          <input type="text" id="a-title" class="form-input" placeholder="e.g. Practice fingerpicking drills" required>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div class="form-group">
            <label class="form-label">Duration</label>
            <select id="a-duration" class="form-select">
              <option value="15">15 mins</option>
              <option value="30" selected>30 mins</option>
              <option value="45">45 mins</option>
              <option value="60">60 mins</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Preferred Time</label>
            <input type="time" id="a-time" class="form-input" value="08:00">
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Difficulty</label>
          <select id="a-difficulty" class="form-select">
            <option value="EASY">Easy</option>
            <option value="MEDIUM" selected>Medium</option>
            <option value="HARD">Hard</option>
          </select>
        </div>

        <button type="submit" class="btn-primary" style="margin-top: 10px;">
          Schedule Action
        </button>
      </form>
    `);

    document.getElementById('form-create-action')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const title = (document.getElementById('a-title') as HTMLInputElement).value;
      const estimatedDurationMinutes = parseInt((document.getElementById('a-duration') as HTMLSelectElement).value);
      const preferredTime = (document.getElementById('a-time') as HTMLInputElement).value;
      const difficulty = (document.getElementById('a-difficulty') as HTMLSelectElement).value;

      try {
        await ApiClient.createAction({
          goalId,
          milestoneId: milestoneId || null,
          title,
          estimatedDurationMinutes,
          preferredTime,
          difficulty,
        });

        (window as any).showToast('Action scheduled!');
        this.hide();
        if (onSuccess) onSuccess();
      } catch (err: any) {
        alert('Error: ' + err.message);
      }
    });
  }

  static openWeeklyReflection(onSuccess: () => void) {
    this.show(`
      <div class="modal-header">
        <h2 style="font-size: 20px;">Weekly Reflection & Next Steps</h2>
        <button class="modal-close-btn">&times;</button>
      </div>

      <form id="form-reflection">
        <div class="form-group">
          <label class="form-label">What went well this week? 🌟</label>
          <textarea id="ref-well" class="form-textarea" placeholder="Recognize your consistency, key insights, and small wins."></textarea>
        </div>

        <div class="form-group">
          <label class="form-label">What made things difficult or created friction? 💡</label>
          <textarea id="ref-diff" class="form-textarea" placeholder="Time crunches, energy dips, unexpected events..."></textarea>
        </div>

        <div class="form-group">
          <label class="form-label">What is your primary priority next week? 🎯</label>
          <input type="text" id="ref-next" class="form-input" placeholder="e.g. Protect 8 PM routine slot and complete 1 conversational Spanish session.">
        </div>

        <div class="form-group">
          <label class="form-label">Overall Energy & Cadence Rating (1 - 5)</label>
          <select id="ref-rating" class="form-select">
            <option value="5">⭐⭐⭐⭐⭐ Excellent & Energized</option>
            <option value="4" selected>⭐⭐⭐⭐ Good & Consistent</option>
            <option value="3">⭐⭐⭐ Balanced / Steady</option>
            <option value="2">⭐⭐ Slightly Fatigued</option>
            <option value="1">⭐ Challenging</option>
          </select>
        </div>

        <button type="submit" class="btn-primary" style="margin-top: 10px;">
          Save Reflection & Lock In Next Week
        </button>
      </form>
    `);

    document.getElementById('form-reflection')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const whatWentWell = (document.getElementById('ref-well') as HTMLTextAreaElement).value;
      const whatWasDifficult = (document.getElementById('ref-diff') as HTMLTextAreaElement).value;
      const nextWeekFocus = (document.getElementById('ref-next') as HTMLInputElement).value;
      const energyMoodRating = parseInt((document.getElementById('ref-rating') as HTMLSelectElement).value);

      try {
        await ApiClient.saveWeeklyReflection({
          whatWentWell,
          whatWasDifficult,
          nextWeekFocus,
          energyMoodRating,
        });

        (window as any).showToast('✨ Weekly reflection recorded!');
        this.hide();
        onSuccess();
      } catch (err: any) {
        alert('Error: ' + err.message);
      }
    });
  }

  static openOnboarding(onComplete: () => void) {
    let currentStep = 1;

    const renderStep = () => {
      if (currentStep === 1) {
        this.show(`
          <div class="modal-header">
            <span style="font-size: 12px; font-weight: 700; color: var(--accent-violet);">STEP 1 OF 3</span>
            <button class="modal-close-btn">&times;</button>
          </div>
          <h2 style="font-size: 22px; margin-bottom: 8px;">Welcome to Ascent</h2>
          <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 20px;">
            Let's personalize your experience. How should Ascent support your rhythm?
          </p>

          <div class="form-group">
            <label class="form-label">Your Name</label>
            <input type="text" id="ob-name" class="form-input" value="Alex Rivera">
          </div>

          <div class="form-group">
            <label class="form-label">Primary Life Objective</label>
            <input type="text" id="ob-objective" class="form-input" value="Cultivate intentional habits, learn Spanish, and master physical resilience.">
          </div>

          <button id="ob-next-1" class="btn-primary" style="margin-top: 14px;">Continue &rsaquo;</button>
        `);

        document.getElementById('ob-next-1')?.addEventListener('click', () => {
          currentStep = 2;
          renderStep();
        });
      } else if (currentStep === 2) {
        this.show(`
          <div class="modal-header">
            <span style="font-size: 12px; font-weight: 700; color: var(--accent-violet);">STEP 2 OF 3</span>
            <button class="modal-close-btn">&times;</button>
          </div>
          <h2 style="font-size: 22px; margin-bottom: 8px;">Your Rhythm & Preferences</h2>
          <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 20px;">
            Ascent respects your schedule and avoids toxic daily streaks.
          </p>

          <div class="form-group">
            <label class="form-label">Preferred Time of Day</label>
            <select id="ob-time" class="form-select">
              <option value="MORNING">Morning (06:00 - 09:00 AM)</option>
              <option value="EVENING" selected>Evening (07:00 - 10:00 PM)</option>
              <option value="AFTERNOON">Afternoon</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Progress Measurement Style</label>
            <select id="ob-style" class="form-select">
              <option value="BALANCED" selected>Balanced (Cadence & Milestones)</option>
              <option value="ROUTINE_DRIVEN">Routine-Driven (Weekly Consistency)</option>
              <option value="MILESTONE_DRIVEN">Milestone-Driven (Big Outcomes)</option>
            </select>
          </div>

          <button id="ob-next-2" class="btn-primary" style="margin-top: 14px;">Continue &rsaquo;</button>
        `);

        document.getElementById('ob-next-2')?.addEventListener('click', () => {
          currentStep = 3;
          renderStep();
        });
      } else {
        this.show(`
          <div class="modal-header">
            <span style="font-size: 12px; font-weight: 700; color: var(--accent-emerald);">STEP 3 OF 3</span>
            <button class="modal-close-btn">&times;</button>
          </div>
          <h2 style="font-size: 22px; margin-bottom: 8px;">You're All Set! 🚀</h2>
          <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 20px;">
            Your personal space has been tailored. We've loaded starter goals with healthy cadences so you can begin immediately.
          </p>

          <div class="card-glass" style="padding: 16px; margin-bottom: 20px; border-color: var(--border-emerald);">
            <div style="font-weight: 700; color: #34D399; margin-bottom: 4px;">🎯 Non-Toxic Consistency Active</div>
            <p style="font-size: 12px; color: var(--text-muted);">
              Rest days are recognized as essential recovery. Rescheduling never penalizes your momentum.
            </p>
          </div>

          <button id="ob-finish" class="btn-primary">Enter Dashboard &rsaquo;</button>
        `);

        document.getElementById('ob-finish')?.addEventListener('click', () => {
          this.hide();
          (window as any).showToast('✨ Welcome to Ascent!');
          onComplete();
        });
      }
    };

    renderStep();
  }
}
