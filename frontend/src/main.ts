import { TodayView } from './views/TodayView';
import { GoalsView } from './views/GoalsView';
import { GoalDetailView } from './views/GoalDetailView';
import { CalendarView } from './views/CalendarView';
import { ProgressView } from './views/ProgressView';
import { ProfileView } from './views/ProfileView';
import { AuthView } from './views/AuthView';
import { ModalsManager } from './views/Modals';
import { ApiClient } from './api/apiClient';

class App {
  private currentTab = 'today';
  private currentGoalId: string | null = null;
  private container = document.getElementById('main-content') as HTMLElement;
  private navTabs = document.querySelectorAll('.nav-tab');
  private bottomNav = document.getElementById('bottom-nav') as HTMLElement;

  async init() {
    this.setupGlobals();
    this.setupNavigation();

    // Check existing authenticated session
    if (!ApiClient.getToken()) {
      this.navigate('auth');
    } else {
      this.navigate('today');
    }
  }

  setupGlobals() {
    (window as any).showToast = (message: string) => {
      const toast = document.getElementById('toast') as HTMLElement;
      toast.textContent = message;
      toast.classList.remove('hidden');
      setTimeout(() => {
        toast.classList.add('hidden');
      }, 3500);
    };

    (window as any).openCreateGoalModal = () => {
      ModalsManager.openCreateGoal(() => this.navigate(this.currentTab, this.currentGoalId || undefined));
    };

    (window as any).openCreateMilestoneModal = (goalId: string) => {
      ModalsManager.openCreateMilestone(goalId, () => this.navigate('goal-detail', goalId));
    };

    (window as any).openCreateActionModal = (goalId: string, milestoneId?: string) => {
      ModalsManager.openCreateAction(goalId, milestoneId, () => this.navigate('goal-detail', goalId));
    };

    (window as any).openWeeklyReflectionModal = () => {
      ModalsManager.openWeeklyReflection(() => this.navigate('progress'));
    };

    (window as any).openOnboardingModal = () => {
      ModalsManager.openOnboarding(() => this.navigate('today'));
    };

    document.getElementById('global-fab-btn')?.addEventListener('click', () => {
      (window as any).openCreateGoalModal();
    });
  }

  setupNavigation() {
    this.navTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const targetTab = (tab as HTMLElement).dataset.tab;
        if (targetTab) {
          this.navigate(targetTab);
        }
      });
    });
  }

  navigate(tab: string, param?: string) {
    this.currentTab = tab;
    if (param) this.currentGoalId = param;

    const fabBtn = document.getElementById('global-fab-btn') as HTMLElement;

    if (tab === 'auth') {
      if (this.bottomNav) this.bottomNav.style.display = 'none';
      if (fabBtn) fabBtn.style.display = 'none';
      AuthView.render(this.container, (isNewUser) => {
        if (isNewUser) {
          ModalsManager.openOnboarding(() => this.navigate('today'));
        } else {
          this.navigate('today');
        }
      });
      return;
    }

    // Ensure Bottom Nav is visible for app views
    if (this.bottomNav) this.bottomNav.style.display = 'flex';

    // Update Bottom Nav active state
    this.navTabs.forEach(btn => {
      if ((btn as HTMLElement).dataset.tab === tab) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Context-aware FAB visibility based on screen architecture
    if (fabBtn) {
      if (tab === 'today' || tab === 'goals') {
        fabBtn.style.display = 'flex';
      } else {
        fabBtn.style.display = 'none';
      }
    }

    const onNav = (nextTab: string, nextParam?: string) => this.navigate(nextTab, nextParam);

    switch (tab) {
      case 'today':
        TodayView.render(this.container, onNav);
        break;
      case 'goals':
        GoalsView.render(this.container, onNav);
        break;
      case 'goal-detail':
        if (this.currentGoalId) {
          GoalDetailView.render(this.container, this.currentGoalId, onNav);
        } else {
          GoalsView.render(this.container, onNav);
        }
        break;
      case 'calendar':
        CalendarView.render(this.container, onNav);
        break;
      case 'progress':
        ProgressView.render(this.container, onNav);
        break;
      case 'profile':
        ProfileView.render(this.container, onNav);
        break;
      default:
        TodayView.render(this.container, onNav);
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init();
});
