var L=Object.defineProperty;var M=(u,e,t)=>e in u?L(u,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):u[e]=t;var m=(u,e,t)=>M(u,typeof e!="symbol"?e+"":e,t);(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))s(i);new MutationObserver(i=>{for(const o of i)if(o.type==="childList")for(const r of o.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&s(r)}).observe(document,{childList:!0,subtree:!0});function t(i){const o={};return i.integrity&&(o.integrity=i.integrity),i.referrerPolicy&&(o.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?o.credentials="include":i.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function s(i){if(i.ep)return;i.ep=!0;const o=t(i);fetch(i.href,o)}})();const S="http://localhost:5000/api/v1";class y{static getToken(){return localStorage.getItem(this.tokenKey)}static setToken(e){localStorage.setItem(this.tokenKey,e)}static clearToken(){localStorage.removeItem(this.tokenKey)}static async request(e,t={}){const s=this.getToken(),i={"Content-Type":"application/json",...t.headers||{}};s&&(i.Authorization=`Bearer ${s}`);const o=await fetch(`${S}${e}`,{...t,headers:i});if(o.status===401&&!e.includes("/auth/login")&&!e.includes("/auth/register")){const r=await this.login("alex@ascent.app","password123");if(r!=null&&r.token)return this.setToken(r.token),this.request(e,t)}if(!o.ok){const r=await o.json().catch(()=>({error:"Network request failed"}));throw new Error(r.error||`HTTP error ${o.status}`)}return o.json()}static async login(e="alex@ascent.app",t="password123"){const s=await this.request("/auth/login",{method:"POST",body:JSON.stringify({email:e,password:t})});return s.token&&this.setToken(s.token),s}static async register(e){const t=await this.request("/auth/register",{method:"POST",body:JSON.stringify(e)});return t.token&&this.setToken(t.token),t}static async getTodayDashboard(){return this.request("/dashboard/today")}static async getGoals(e,t){const s=new URLSearchParams;return e&&s.append("status",e),t&&s.append("category",t),this.request(`/goals?${s.toString()}`)}static async getGoalById(e){return this.request(`/goals/${e}`)}static async createGoal(e){return this.request("/goals",{method:"POST",body:JSON.stringify(e)})}static async updateGoal(e,t){return this.request(`/goals/${e}`,{method:"PUT",body:JSON.stringify(t)})}static async deleteGoal(e){return this.request(`/goals/${e}`,{method:"DELETE"})}static async createMilestone(e){return this.request("/milestones",{method:"POST",body:JSON.stringify(e)})}static async createAction(e){return this.request("/actions",{method:"POST",body:JSON.stringify(e)})}static async completeAction(e,t,s){return this.request(`/actions/${e}/complete`,{method:"POST",body:JSON.stringify({durationSpentMinutes:t,notes:s})})}static async skipAction(e,t){return this.request(`/actions/${e}/skip`,{method:"POST",body:JSON.stringify({notes:t})})}static async getRoutines(){return this.request("/routines")}static async updateRoutine(e,t){return this.request(`/routines/${e}`,{method:"PUT",body:JSON.stringify(t)})}static async getWeeklyReflectionSummary(){return this.request("/reflections/summary")}static async saveWeeklyReflection(e){return this.request("/reflections",{method:"POST",body:JSON.stringify(e)})}static async getProfile(){return this.request("/profile")}static async updateProfile(e){return this.request("/profile",{method:"PUT",body:JSON.stringify(e)})}static async updateNotifications(e){return this.request("/profile/notifications",{method:"PUT",body:JSON.stringify(e)})}}m(y,"tokenKey","ascent_auth_token");class w{static async render(e,t){var s,i,o,r;e.innerHTML=`
      <div class="loading-spinner-container">
        <div class="pulse-ring"></div>
        <p class="loading-label">Gathering today's focus...</p>
      </div>
    `;try{const c=await y.getTodayDashboard(),{greeting:n,consistency:a,todayFocus:p,activeGoals:d,todayActionFlow:v}=c,g=2*Math.PI*36,E=g-p.percentage/100*g;e.innerHTML=`
        <!-- Top Greeting Header -->
        <header class="dashboard-header">
          <div>
            <h1 class="user-greeting">${n} 👋</h1>
          </div>
          <div class="consistency-pill" id="consistency-badge">
            <span>🔥</span>
            <span>${a.consistencyPillText}</span>
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
            <div class="focus-card-headline">${p.headline}</div>
            <div class="focus-card-subtext">${p.percentage}% Completed · Maintain Cadence</div>
          </div>
          <div class="progress-ring-container">
            <svg class="progress-ring-svg" viewBox="0 0 88 88">
              <circle class="progress-ring-circle-bg" cx="44" cy="44" r="36"></circle>
              <circle class="progress-ring-circle-val" cx="44" cy="44" r="36"
                stroke-dasharray="${g}"
                stroke-dashoffset="${E}"></circle>
            </svg>
            <div class="progress-ring-label">${p.percentage}%</div>
          </div>
        </section>

        <!-- Active Goals Section -->
        <section style="margin-bottom: 24px;">
          <div class="section-title">
            <h2>Active Goals</h2>
            <a class="section-link" id="view-all-goals">View all &rsaquo;</a>
          </div>
          <div class="goals-carousel-track">
            ${d.map(l=>`
              <div class="goal-card-compact" data-goal-id="${l.id}">
                <span class="category-badge cat-${l.category.toLowerCase()}">${l.category}</span>
                <h4>${l.title}</h4>
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
                  <span class="status-pill status-${l.statusState.toLowerCase().replace("_","-")}">${l.statusState.replace("_"," ")}</span>
                  <span style="font-size: 12px; color: var(--text-secondary); font-weight: 600;">${l.progressPercentage}%</span>
                </div>
                <div class="progress-bar-wrapper">
                  <div class="progress-bar-fill" style="width: ${l.progressPercentage}%;"></div>
                </div>
              </div>
            `).join("")}
          </div>
        </section>

        <!-- Today's Action Flow Section -->
        <section>
          <div class="section-title">
            <h2>Today's Action Flow</h2>
            <span style="font-size: 13px; color: var(--text-muted);">${v.length} planned</span>
          </div>

          <div class="action-items-list">
            ${v.length===0?`
              <div style="text-align: center; padding: 30px 10px; color: var(--text-muted);">
                <p>No actions scheduled for today.</p>
                <button class="btn-secondary" id="btn-add-action-empty" style="margin-top: 12px;">+ Add an Action</button>
              </div>
            `:v.map(l=>`
              <div class="action-card ${l.status==="COMPLETED"?"completed":""}" data-action-id="${l.id}">
                <div class="action-check-toggle ${l.status==="COMPLETED"?"checked":""}" data-toggle-action="${l.id}">
                  ${l.status==="COMPLETED"?`
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  `:""}
                </div>
                <div class="action-details">
                  <div class="action-title">${l.title}</div>
                  <div class="action-meta">
                    ${l.preferredTime?`<span>⏰ ${l.preferredTime}</span>`:""}
                    <span>⏱ ${l.estimatedDurationMinutes} mins</span>
                    ${l.goal?`<span class="routine-tag">${l.goal.title}</span>`:""}
                  </div>
                </div>
              </div>
            `).join("")}
          </div>
        </section>

        <!-- Floating Add Goal / Action Button -->
        <button class="fab-btn" id="fab-create-goal">
          <span>+</span>
          <span>New Goal</span>
        </button>
      `,(s=e.querySelector("#view-all-goals"))==null||s.addEventListener("click",()=>t("goals")),(i=e.querySelector("#consistency-badge"))==null||i.addEventListener("click",()=>t("progress")),(o=e.querySelector("#fab-create-goal"))==null||o.addEventListener("click",()=>window.openCreateGoalModal()),e.querySelectorAll(".goal-card-compact").forEach(l=>{l.addEventListener("click",()=>{const h=l.dataset.goalId;h&&t("goal-detail",h)})}),e.querySelectorAll(".action-check-toggle").forEach(l=>{l.addEventListener("click",async h=>{var x;h.stopPropagation();const b=l.dataset.toggleAction;if(!b)return;l.classList.contains("checked")||(l.classList.add("checked"),(x=l.closest(".action-card"))==null||x.classList.add("completed"),window.showToast("✨ Action completed! Cadence updated."),await y.completeAction(b),w.render(e,t))})})}catch(c){e.innerHTML=`
        <div style="text-align: center; padding: 40px 20px;">
          <h3>Connecting to Ascent Engine...</h3>
          <p style="color: var(--text-muted); margin: 12px 0;">${c.message}</p>
          <button class="btn-primary" id="retry-btn">Retry Connection</button>
        </div>
      `,(r=e.querySelector("#retry-btn"))==null||r.addEventListener("click",()=>w.render(e,t))}}}class k{static async render(e,t){var s,i;e.innerHTML=`
      <div class="loading-spinner-container">
        <div class="pulse-ring"></div>
        <p class="loading-label">Loading goals...</p>
      </div>
    `;try{const o=this.selectedCategory==="ALL"?void 0:this.selectedCategory,r=this.selectedStatus==="ALL"?void 0:this.selectedStatus,c=await y.getGoals(r,o),n=["ALL","HEALTH","LEARNING","CAREER","PRODUCTIVITY","PERSONAL"];e.innerHTML=`
        <header style="margin-bottom: 20px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
            <h1 class="screen-title">Goals Explorer</h1>
            <button class="btn-primary" id="btn-add-goal" style="width: auto; padding: 8px 16px; font-size: 13px;">+ New Goal</button>
          </div>

          <!-- Category filter pills -->
          <div style="display: flex; gap: 8px; overflow-x: auto; padding-bottom: 8px; scrollbar-width: none;">
            ${n.map(a=>`
              <button class="category-pill ${this.selectedCategory===a?"active":""}" data-cat="${a}" style="
                padding: 6px 14px;
                border-radius: var(--radius-full);
                background: ${this.selectedCategory===a?"var(--accent-violet)":"rgba(255,255,255,0.06)"};
                color: ${this.selectedCategory===a?"#FFF":"var(--text-secondary)"};
                border: 1px solid ${this.selectedCategory===a?"var(--accent-violet)":"var(--border-subtle)"};
                font-size: 12px;
                font-weight: 600;
                cursor: pointer;
                white-space: nowrap;
              ">${a}</button>
            `).join("")}
          </div>
        </header>

        <!-- Goals List -->
        <div style="display: flex; flex-direction: column; gap: 16px;">
          ${c.length===0?`
            <div style="text-align: center; padding: 40px 10px; color: var(--text-muted);">
              <p>No goals found in this category.</p>
              <button class="btn-secondary" id="btn-create-first-goal" style="margin-top: 14px;">Create a Goal</button>
            </div>
          `:c.map(a=>`
            <div class="card-glass goal-card-detailed" data-goal-id="${a.id}" style="cursor: pointer;">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
                <span class="category-badge cat-${a.category.toLowerCase()}">${a.category}</span>
                <span class="status-pill status-${a.statusState.toLowerCase().replace("_","-")}">${a.statusState.replace("_"," ")}</span>
              </div>
              <h3 style="font-size: 18px; margin-bottom: 6px;">${a.title}</h3>
              ${a.whyItMatters?`<p style="font-size: 13px; color: var(--text-muted); margin-bottom: 12px; font-style: italic;">“${a.whyItMatters}”</p>`:""}
              
              <div style="display: flex; align-items: center; justify-content: space-between; font-size: 13px; color: var(--text-secondary); margin-bottom: 8px;">
                <span>${a.completedActionsCount||0} / ${a.actionsCount||0} actions</span>
                <span style="font-weight: 700; color: var(--text-primary);">${a.progressPercentage}%</span>
              </div>
              <div class="progress-bar-wrapper">
                <div class="progress-bar-fill" style="width: ${a.progressPercentage}%;"></div>
              </div>
              
              <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 14px; font-size: 12px; color: var(--text-muted); border-top: 1px solid var(--border-subtle); padding-top: 10px;">
                <span>🗓 Target: ${a.targetDate?new Date(a.targetDate).toLocaleDateString():"Continuous"}</span>
                <span style="color: var(--accent-violet); font-weight: 600;">Details &rsaquo;</span>
              </div>
            </div>
          `).join("")}
        </div>
      `,(s=e.querySelector("#btn-add-goal"))==null||s.addEventListener("click",()=>window.openCreateGoalModal()),(i=e.querySelector("#btn-create-first-goal"))==null||i.addEventListener("click",()=>window.openCreateGoalModal()),e.querySelectorAll(".category-pill").forEach(a=>{a.addEventListener("click",()=>{this.selectedCategory=a.dataset.cat||"ALL",this.render(e,t)})}),e.querySelectorAll(".goal-card-detailed").forEach(a=>{a.addEventListener("click",()=>{const p=a.dataset.goalId;p&&t("goal-detail",p)})})}catch(o){e.innerHTML=`<p style="color: red;">Error: ${o.message}</p>`}}}m(k,"selectedCategory","ALL"),m(k,"selectedStatus","ACTIVE");class T{static async render(e,t,s){var i,o,r,c;e.innerHTML=`
      <div class="loading-spinner-container">
        <div class="pulse-ring"></div>
        <p class="loading-label">Loading goal breakdown...</p>
      </div>
    `;try{const n=await y.getGoalById(t),a=n.routines&&n.routines[0]?n.routines[0]:null;let p="Mon, Wed, Fri";if(a!=null&&a.daysOfWeek){const d={1:"Mon",2:"Tue",3:"Wed",4:"Thu",5:"Fri",6:"Sat",7:"Sun"};try{p=(typeof a.daysOfWeek=="string"?JSON.parse(a.daysOfWeek):a.daysOfWeek).map(g=>d[g]||"Day").join(", ")}catch{p="Scheduled routine"}}e.innerHTML=`
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
            <h1 style="font-size: 24px; margin-bottom: 8px;">${n.title}</h1>
            <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
              <span class="category-badge cat-${n.category.toLowerCase()}">${n.category}</span>
              <span class="status-pill status-${n.statusState.toLowerCase().replace("_","-")}">${n.statusState.replace("_"," ")}</span>
            </div>
            ${n.whyItMatters?`<p style="font-size: 13px; color: var(--text-secondary); margin-top: 10px; line-height: 1.4;">${n.whyItMatters}</p>`:""}
          </div>

          <!-- Circular Metric -->
          <div class="progress-ring-container" style="width: 74px; height: 74px; flex-shrink: 0;">
            <svg class="progress-ring-svg" viewBox="0 0 88 88">
              <circle class="progress-ring-circle-bg" cx="44" cy="44" r="36"></circle>
              <circle class="progress-ring-circle-val" cx="44" cy="44" r="36"
                stroke-dasharray="${2*Math.PI*36}"
                stroke-dashoffset="${2*Math.PI*36-n.progressPercentage/100*(2*Math.PI*36)}"></circle>
            </svg>
            <div class="progress-ring-label" style="font-size: 15px;">${n.progressPercentage}%</div>
          </div>
        </section>

        <!-- Personal Routine Card -->
        <section class="card-glass" style="display: flex; align-items: center; gap: 14px; margin-bottom: 24px; background: rgba(22, 28, 41, 0.9);">
          <div style="width: 42px; height: 42px; border-radius: 12px; background: rgba(139, 92, 246, 0.15); display: flex; align-items: center; justify-content: center; color: var(--accent-violet); font-size: 20px;">
            🗓
          </div>
          <div>
            <div style="font-size: 14px; font-weight: 700; color: var(--text-primary);">Personal Routine</div>
            <div style="font-size: 13px; color: var(--text-secondary);">${p} at ${(a==null?void 0:a.preferredTime)||"08:00"} (${(a==null?void 0:a.targetDurationMinutes)||30} min)</div>
          </div>
        </section>

        <!-- Milestones Hierarchy Section -->
        <section style="margin-bottom: 24px;">
          <div class="section-title">
            <h2>Milestones & Actions</h2>
            <button id="btn-add-milestone" style="background: none; border: none; color: var(--accent-violet); font-size: 13px; font-weight: 600; cursor: pointer;">+ Add Milestone</button>
          </div>

          <div style="display: flex; flex-direction: column; gap: 16px;">
            ${(n.milestones||[]).length===0?`
              <div style="text-align: center; padding: 24px; color: var(--text-muted);">
                <p>No milestones created yet.</p>
                <button class="btn-secondary" id="btn-add-first-milestone" style="margin-top: 10px;">+ Create First Milestone</button>
              </div>
            `:n.milestones.map((d,v)=>`
              <div class="card-glass milestone-card" style="padding: 16px;">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
                  <div>
                    <span style="font-size: 11px; font-weight: 600; color: var(--accent-violet); text-transform: uppercase;">Milestone ${v+1}</span>
                    <h3 style="font-size: 16px;">${d.title}</h3>
                  </div>
                  <span style="font-size: 12px; color: var(--text-muted); font-weight: 600;">
                    ${(d.actions||[]).filter(g=>g.status==="COMPLETED").length}/${(d.actions||[]).length} Actions
                  </span>
                </div>

                <!-- Milestone Actions list -->
                <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 12px;">
                  ${(d.actions||[]).map(g=>`
                    <div style="display: flex; align-items: center; gap: 12px; background: rgba(0,0,0,0.2); padding: 10px 12px; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
                      <div class="action-check-toggle ${g.status==="COMPLETED"?"checked":""}" data-action-id="${g.id}" style="width: 22px; height: 22px;">
                        ${g.status==="COMPLETED"?`
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        `:""}
                      </div>
                      <div style="flex: 1;">
                        <div style="font-size: 13px; font-weight: 600; color: ${g.status==="COMPLETED"?"var(--text-muted)":"var(--text-primary)"}; text-decoration: ${g.status==="COMPLETED"?"line-through":"none"};">
                          ${g.title}
                        </div>
                        <div style="font-size: 11px; color: var(--text-muted);">⏱ ${g.estimatedDurationMinutes} mins · ${g.difficulty}</div>
                      </div>
                    </div>
                  `).join("")}
                </div>

                <button class="btn-secondary btn-add-action-to-m" data-milestone-id="${d.id}" style="margin-top: 12px; padding: 8px; font-size: 12px;">
                  + Add Action to Milestone
                </button>
              </div>
            `).join("")}
          </div>
        </section>

        <!-- Bottom Action Button -->
        <button class="btn-primary" id="btn-add-action-floating" style="margin-top: 10px;">
          + Add New Action
        </button>
      `,(i=e.querySelector("#btn-back-goals"))==null||i.addEventListener("click",()=>s("goals")),(o=e.querySelector("#btn-add-milestone"))==null||o.addEventListener("click",()=>window.openCreateMilestoneModal(t)),(r=e.querySelector("#btn-add-first-milestone"))==null||r.addEventListener("click",()=>window.openCreateMilestoneModal(t)),(c=e.querySelector("#btn-add-action-floating"))==null||c.addEventListener("click",()=>window.openCreateActionModal(t)),e.querySelectorAll(".btn-add-action-to-m").forEach(d=>{d.addEventListener("click",()=>{const v=d.dataset.milestoneId;window.openCreateActionModal(t,v)})}),e.querySelectorAll(".action-check-toggle").forEach(d=>{d.addEventListener("click",async()=>{const v=d.dataset.actionId;v&&(d.classList.toggle("checked"),window.showToast("✨ Progress updated!"),await y.completeAction(v),T.render(e,t,s))})})}catch(n){e.innerHTML=`<p style="color: red;">Error: ${n.message}</p>`}}}class C{static async render(e,t){e.innerHTML=`
      <div class="loading-spinner-container">
        <div class="pulse-ring"></div>
        <p class="loading-label">Loading schedule...</p>
      </div>
    `;try{const s=await y.getTodayDashboard(),i=new Date,o=i.toLocaleString("default",{month:"long",year:"numeric"}),r=i.getDate(),c=["M","T","W","T","F","S","S"];e.innerHTML=`
        <header style="margin-bottom: 20px;">
          <h1 class="screen-title">Schedule & Routines</h1>
          <p style="font-size: 13px; color: var(--text-secondary); margin-top: 4px;">Track upcoming routine slots & milestone targets</p>
        </header>

        <!-- Month Header -->
        <section class="card-glass" style="padding: 18px; margin-bottom: 24px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
            <h2 style="font-size: 16px; font-weight: 700;">${o}</h2>
            <div style="font-size: 12px; color: var(--accent-violet); font-weight: 600;">Routine Cadence: Active</div>
          </div>

          <!-- Days Header -->
          <div class="calendar-grid" style="margin-top: 6px;">
            ${c.map(n=>`<div class="cal-day-header">${n}</div>`).join("")}
          </div>

          <!-- Calendar Grid Cells -->
          <div class="calendar-grid">
            ${Array.from({length:31},(n,a)=>{const p=a+1,d=p===r,v=[1,3,5,8,10,12,15,17,19,22,24,26,29].includes(p);return`
                <div class="cal-day-cell ${d?"today":""}">
                  <span>${p}</span>
                  ${v?'<div class="cal-dot"></div>':""}
                </div>
              `}).join("")}
          </div>
        </section>

        <!-- Agenda for Today -->
        <section>
          <div class="section-title">
            <h2>Today's Planned Agenda</h2>
            <span style="font-size: 13px; color: var(--text-muted);">${s.todayActionFlow.length} Items</span>
          </div>

          <div class="action-items-list">
            ${s.todayActionFlow.map(n=>{var a;return`
              <div class="action-card ${n.status==="COMPLETED"?"completed":""}">
                <div style="font-size: 18px;">${n.status==="COMPLETED"?"✅":"⏳"}</div>
                <div class="action-details">
                  <div class="action-title">${n.title}</div>
                  <div class="action-meta">
                    <span>⏰ ${n.preferredTime||"08:00"}</span>
                    <span>⏱ ${n.estimatedDurationMinutes} mins</span>
                    <span class="routine-tag">${((a=n.goal)==null?void 0:a.title)||"Active Routine"}</span>
                  </div>
                </div>
              </div>
            `}).join("")}
          </div>
        </section>
      `}catch(s){e.innerHTML=`<p style="color: red;">Error: ${s.message}</p>`}}}class A{static async render(e,t){var s,i;e.innerHTML=`
      <div class="loading-spinner-container">
        <div class="pulse-ring"></div>
        <p class="loading-label">Analyzing consistency and velocity...</p>
      </div>
    `;try{const o=await y.getWeeklyReflectionSummary(),r=o.reflection,c=[{day:"M",pct:90},{day:"T",pct:85},{day:"W",pct:95},{day:"T",pct:70},{day:"F",pct:88},{day:"S",pct:92},{day:"S",pct:80}];e.innerHTML=`
        <header style="margin-bottom: 20px;">
          <h1 class="screen-title">Weekly Reflection & Progress</h1>
          <p style="font-size: 13px; color: var(--text-secondary); margin-top: 4px;">Oct 23 - 29 · Consistency Review</p>
        </header>

        <!-- Week in Review Chart Card -->
        <section class="card-glass" style="margin-bottom: 20px;">
          <div style="font-size: 14px; font-weight: 600; color: var(--text-secondary); margin-bottom: 8px;">Weekly Consistency (Mon-Sun)</div>
          
          <div class="weekly-bar-chart">
            ${c.map(n=>`
              <div class="bar-column">
                <span class="bar-pct-label">${n.pct}%</span>
                <div class="bar-tube">
                  <div class="bar-tube-fill" style="height: ${n.pct}%;"></div>
                </div>
                <span class="bar-day-name">${n.day}</span>
              </div>
            `).join("")}
          </div>
        </section>

        <!-- Metric Stat Cards Grid -->
        <section style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 20px;">
          <div class="card-glass" style="padding: 14px 10px; text-align: center; border-color: var(--border-emerald);">
            <div style="font-size: 18px; margin-bottom: 4px;">✅</div>
            <div style="font-size: 16px; font-weight: 700; color: var(--text-primary);">${o.actionsCompletedCount||18}</div>
            <div style="font-size: 11px; color: var(--text-muted);">Completed</div>
          </div>

          <div class="card-glass" style="padding: 14px 10px; text-align: center; border-color: rgba(245, 158, 11, 0.4);">
            <div style="font-size: 18px; margin-bottom: 4px;">➡️</div>
            <div style="font-size: 16px; font-weight: 700; color: var(--text-primary);">${o.actionsRescheduledOrSkippedCount||2}</div>
            <div style="font-size: 11px; color: var(--text-muted);">Rescheduled</div>
          </div>

          <div class="card-glass" style="padding: 14px 10px; text-align: center; border-color: var(--border-focus);">
            <div style="font-size: 18px; margin-bottom: 4px;">🔥</div>
            <div style="font-size: 16px; font-weight: 700; color: var(--text-primary);">${o.consistencyRate||88}%</div>
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
              <div style="font-size: 14px; font-weight: 700;">${o.strongestArea||"Health & Fitness"}</div>
              <div style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">6 workouts completed · 100% adherence</div>
            </div>

            <div class="card-glass" style="padding: 14px;">
              <div style="font-size: 12px; color: #FBBF24; font-weight: 600; margin-bottom: 4px;">⚠️ Needs Attention</div>
              <div style="font-size: 14px; font-weight: 700;">${o.needsAttentionArea||"Spanish Reading"}</div>
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
            "${(r==null?void 0:r.whatWentWell)||"I consistently finished my morning routines and made great progress on the work project. Felt mindful during meditations. Need to prioritize early evenings better."}"
          </p>

          ${r!=null&&r.nextWeekFocus?`
            <div style="font-size: 13px; color: var(--text-muted); margin-bottom: 6px;">Next week's primary focus:</div>
            <p style="font-size: 13px; color: var(--text-primary); font-weight: 500;">
              ${r.nextWeekFocus}
            </p>
          `:""}
        </section>

        <!-- Bottom Action Button -->
        <button class="btn-primary" id="btn-open-weekly-reflection-form">
          Set Next Week's Priorities & Reflection
        </button>
      `,(s=e.querySelector("#btn-open-weekly-reflection-form"))==null||s.addEventListener("click",()=>window.openWeeklyReflectionModal()),(i=e.querySelector("#btn-edit-journal"))==null||i.addEventListener("click",()=>window.openWeeklyReflectionModal())}catch(o){e.innerHTML=`<p style="color: red;">Error: ${o.message}</p>`}}}class z{static async render(e,t){var s,i,o,r,c,n,a,p;e.innerHTML=`
      <div class="loading-spinner-container">
        <div class="pulse-ring"></div>
        <p class="loading-label">Loading profile...</p>
      </div>
    `;try{const d=await y.getProfile(),v=d.notificationPreferences||{};e.innerHTML=`
        <header style="margin-bottom: 24px;">
          <h1 class="screen-title">Personal Profile</h1>
        </header>

        <!-- User Info Card -->
        <section class="card-glass" style="display: flex; align-items: center; gap: 16px; margin-bottom: 20px;">
          <div style="width: 60px; height: 60px; border-radius: 50%; background: linear-gradient(135deg, var(--accent-violet) 0%, var(--accent-cyan) 100%); display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: 700; color: #FFF; box-shadow: var(--shadow-glow-violet);">
            ${d.fullName.charAt(0)}
          </div>
          <div style="flex: 1;">
            <h2 style="font-size: 18px;">${d.fullName}</h2>
            <div style="font-size: 13px; color: var(--text-secondary);">${d.email}</div>
            <div style="font-size: 12px; color: var(--accent-emerald); font-weight: 600; margin-top: 4px;">
              Progress Style: ${((s=d.profile)==null?void 0:s.preferredProgressStyle)||"Balanced"}
            </div>
          </div>
        </section>

        <!-- Personal Lifetime Stats Grid -->
        <section style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 24px;">
          <div class="card-glass" style="padding: 16px; text-align: center;">
            <div style="font-size: 22px; font-weight: 800; color: var(--accent-violet);">${((i=d.stats)==null?void 0:i.totalGoals)||3}</div>
            <div style="font-size: 12px; color: var(--text-muted); margin-top: 2px;">Active Goals</div>
          </div>

          <div class="card-glass" style="padding: 16px; text-align: center;">
            <div style="font-size: 22px; font-weight: 800; color: var(--accent-emerald);">${((o=d.stats)==null?void 0:o.totalActionsCompleted)||24}</div>
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
              <input type="checkbox" id="notif-morning" ${v.morningFocusReminder!==!1?"checked":""} style="width: 20px; height: 20px; accent-color: var(--accent-violet);">
            </div>

            <div style="display: flex; align-items: center; justify-content: space-between; border-top: 1px solid var(--border-subtle); padding-top: 12px;">
              <div>
                <div style="font-size: 14px; font-weight: 600;">Evening Routine Check-in</div>
                <div style="font-size: 12px; color: var(--text-muted);">Gentle nudge for evening habit at 08:30 PM</div>
              </div>
              <input type="checkbox" id="notif-evening" ${v.eveningCheckInReminder!==!1?"checked":""} style="width: 20px; height: 20px; accent-color: var(--accent-violet);">
            </div>

            <div style="display: flex; align-items: center; justify-content: space-between; border-top: 1px solid var(--border-subtle); padding-top: 12px;">
              <div>
                <div style="font-size: 14px; font-weight: 600;">Weekly Reflection Prompt</div>
                <div style="font-size: 12px; color: var(--text-muted);">Sunday evening review at 06:00 PM</div>
              </div>
              <input type="checkbox" id="notif-reflection" ${v.weeklyReflectionReminder!==!1?"checked":""} style="width: 20px; height: 20px; accent-color: var(--accent-violet);">
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
      `,(r=e.querySelector("#btn-reopen-onboarding"))==null||r.addEventListener("click",()=>window.openOnboardingModal()),(c=e.querySelector("#btn-logout"))==null||c.addEventListener("click",()=>{y.clearToken(),window.showToast("Logged out"),t("today")});const g=async()=>{var b,$,x;const E=(b=e.querySelector("#notif-morning"))==null?void 0:b.checked,l=($=e.querySelector("#notif-evening"))==null?void 0:$.checked,h=(x=e.querySelector("#notif-reflection"))==null?void 0:x.checked;await y.updateNotifications({morningFocusReminder:E,eveningCheckInReminder:l,weeklyReflectionReminder:h}),window.showToast("Notification preferences saved")};(n=e.querySelector("#notif-morning"))==null||n.addEventListener("change",g),(a=e.querySelector("#notif-evening"))==null||a.addEventListener("change",g),(p=e.querySelector("#notif-reflection"))==null||p.addEventListener("change",g)}catch(d){e.innerHTML=`<p style="color: red;">Error: ${d.message}</p>`}}}class f{static show(e){var t;this.content.innerHTML=e,this.overlay.classList.remove("hidden"),(t=this.content.querySelector(".modal-close-btn"))==null||t.addEventListener("click",()=>this.hide()),this.overlay.addEventListener("click",s=>{s.target===this.overlay&&this.hide()})}static hide(){this.overlay.classList.add("hidden"),this.content.innerHTML=""}static openCreateGoal(e){var t;this.show(`
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
          <input type="date" id="goal-target-date" class="form-input" value="${new Date(Date.now()+90*864e5).toISOString().split("T")[0]}">
        </div>

        <button type="submit" class="btn-primary" style="margin-top: 10px;">
          Create Goal & Setup Routine
        </button>
      </form>
    `),(t=document.getElementById("form-create-goal"))==null||t.addEventListener("submit",async s=>{s.preventDefault();const i=document.getElementById("goal-title").value,o=document.getElementById("goal-category").value,r=document.getElementById("goal-why").value,c=document.getElementById("goal-priority").value,n=parseInt(document.getElementById("goal-freq").value),a=document.getElementById("goal-target-date").value;try{await y.createGoal({title:i,category:o,whyItMatters:r,priority:c,targetFrequencyPerWeek:n,targetDate:a,routine:{routineType:"DAYS_OF_WEEK",daysOfWeek:[1,3,5],preferredTime:"08:00",targetDurationMinutes:30},milestones:[{title:"Phase 1: Foundations",actions:[{title:`Daily practice for ${i}`,estimatedDurationMinutes:30,difficulty:"MEDIUM"}]}]}),window.showToast("🎉 Goal created successfully with routine!"),this.hide(),e()}catch(p){alert("Error: "+p.message)}})}static openCreateMilestone(e,t){var s;this.show(`
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
    `),(s=document.getElementById("form-create-milestone"))==null||s.addEventListener("submit",async i=>{i.preventDefault();const o=document.getElementById("m-title").value,r=document.getElementById("m-desc").value;try{await y.createMilestone({goalId:e,title:o,description:r}),window.showToast("Milestone added!"),this.hide(),t()}catch(c){alert("Error: "+c.message)}})}static openCreateAction(e,t,s){var i;this.show(`
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
    `),(i=document.getElementById("form-create-action"))==null||i.addEventListener("submit",async o=>{o.preventDefault();const r=document.getElementById("a-title").value,c=parseInt(document.getElementById("a-duration").value),n=document.getElementById("a-time").value,a=document.getElementById("a-difficulty").value;try{await y.createAction({goalId:e,milestoneId:t||null,title:r,estimatedDurationMinutes:c,preferredTime:n,difficulty:a}),window.showToast("Action scheduled!"),this.hide(),s&&s()}catch(p){alert("Error: "+p.message)}})}static openWeeklyReflection(e){var t;this.show(`
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
    `),(t=document.getElementById("form-reflection"))==null||t.addEventListener("submit",async s=>{s.preventDefault();const i=document.getElementById("ref-well").value,o=document.getElementById("ref-diff").value,r=document.getElementById("ref-next").value,c=parseInt(document.getElementById("ref-rating").value);try{await y.saveWeeklyReflection({whatWentWell:i,whatWasDifficult:o,nextWeekFocus:r,energyMoodRating:c}),window.showToast("✨ Weekly reflection recorded!"),this.hide(),e()}catch(n){alert("Error: "+n.message)}})}static openOnboarding(e){let t=1;const s=()=>{var i,o,r;t===1?(this.show(`
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
        `),(i=document.getElementById("ob-next-1"))==null||i.addEventListener("click",()=>{t=2,s()})):t===2?(this.show(`
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
        `),(o=document.getElementById("ob-next-2"))==null||o.addEventListener("click",()=>{t=3,s()})):(this.show(`
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
        `),(r=document.getElementById("ob-finish"))==null||r.addEventListener("click",()=>{this.hide(),window.showToast("✨ Welcome to Ascent!"),e()}))};s()}}m(f,"overlay",document.getElementById("modal-container")),m(f,"content",document.getElementById("modal-content"));class P{constructor(){m(this,"currentTab","today");m(this,"currentGoalId",null);m(this,"container",document.getElementById("main-content"));m(this,"navTabs",document.querySelectorAll(".nav-tab"))}async init(){if(this.setupGlobals(),this.setupNavigation(),!y.getToken())try{await y.login("alex@ascent.app","password123")}catch(e){console.warn("Initial login sync:",e)}this.navigate("today")}setupGlobals(){window.showToast=e=>{const t=document.getElementById("toast");t.textContent=e,t.classList.remove("hidden"),setTimeout(()=>{t.classList.add("hidden")},3500)},window.openCreateGoalModal=()=>{f.openCreateGoal(()=>this.navigate(this.currentTab,this.currentGoalId||void 0))},window.openCreateMilestoneModal=e=>{f.openCreateMilestone(e,()=>this.navigate("goal-detail",e))},window.openCreateActionModal=(e,t)=>{f.openCreateAction(e,t,()=>this.navigate("goal-detail",e))},window.openWeeklyReflectionModal=()=>{f.openWeeklyReflection(()=>this.navigate("progress"))},window.openOnboardingModal=()=>{f.openOnboarding(()=>this.navigate("today"))}}setupNavigation(){this.navTabs.forEach(e=>{e.addEventListener("click",()=>{const t=e.dataset.tab;t&&this.navigate(t)})})}navigate(e,t){this.currentTab=e,t&&(this.currentGoalId=t),this.navTabs.forEach(i=>{i.dataset.tab===e?i.classList.add("active"):i.classList.remove("active")});const s=(i,o)=>this.navigate(i,o);switch(e){case"today":w.render(this.container,s);break;case"goals":k.render(this.container,s);break;case"goal-detail":this.currentGoalId?T.render(this.container,this.currentGoalId,s):k.render(this.container,s);break;case"calendar":C.render(this.container,s);break;case"progress":A.render(this.container,s);break;case"profile":z.render(this.container,s);break;default:w.render(this.container,s)}}}document.addEventListener("DOMContentLoaded",()=>{new P().init()});
