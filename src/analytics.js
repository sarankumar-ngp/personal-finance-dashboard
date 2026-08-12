const budgetProgressContainer = document.getElementById('budget-progress-container');
const goalsContainer = document.getElementById('goals-container');

// Goal Modal elements
const btnAddGoal = document.getElementById('btn-add-goal');
const goalModal = document.getElementById('goal-modal');
const btnCloseGoalModal = document.getElementById('btn-close-goal-modal');
const btnCancelGoalModal = document.getElementById('btn-cancel-goal-modal');
const goalForm = document.getElementById('goal-form');

let categoryChart = null;

document.addEventListener('DOMContentLoaded', () => {
  renderAnalytics();
  setupEventListeners();
});

function renderAnalytics() {
  renderCategoryChart();
  renderBudgets();
  renderGoals();
}

function renderCategoryChart() {
  const store = window.FinanceStore;
  const categorySummary = store.getCategorySummary();
  const categories = Object.keys(categorySummary);
  const dataValues = Object.values(categorySummary);

  const canvas = document.getElementById('category-chart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  if (categoryChart) {
    categoryChart.destroy();
  }

  if (categories.length === 0) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#64748b';
    ctx.font = '14px Plus Jakarta Sans';
    ctx.textAlign = 'center';
    ctx.fillText('No expense data logged yet.', canvas.width / 2, canvas.height / 2);
    return;
  }

  const colorMap = {
    food: '#f59e0b',
    housing: '#6366f1',
    utilities: '#0ea5e9',
    entertainment: '#a855f7',
    transport: '#818cf8',
    others: '#64748b'
  };

  const chartColors = categories.map(cat => colorMap[cat.toLowerCase()] || '#10b981');
  const ChartClass = window.Chart;

  categoryChart = new ChartClass(ctx, {
    type: 'doughnut',
    data: {
      labels: categories,
      datasets: [
        {
          data: dataValues,
          backgroundColor: chartColors,
          borderWidth: 2,
          borderColor: '#0f1524',
          hoverOffset: 4
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
          labels: {
            color: '#94a3b8',
            font: { family: 'Plus Jakarta Sans', size: 11, weight: 'bold' },
            boxWidth: 10,
            usePointStyle: true,
            pointStyle: 'circle'
          }
        },
        tooltip: {
          backgroundColor: '#0f1524',
          titleColor: '#f8fafc',
          bodyColor: '#94a3b8',
          borderColor: 'rgba(255,255,255,0.1)',
          borderWidth: 1,
          callbacks: {
            label: function(context) {
              const val = context.parsed;
              return ` ₹${val.toLocaleString('en-IN')}`;
            }
          }
        }
      },
      cutout: '65%'
    }
  });
}

function renderBudgets() {
  const store = window.FinanceStore;
  const budgets = store.getBudgets();
  const categoryExpenses = store.getCategorySummary();
  
  if (budgets.length === 0) {
    budgetProgressContainer.innerHTML = '<p style="color:var(--text-secondary)">No budgets defined yet.</p>';
    return;
  }

  budgetProgressContainer.innerHTML = budgets.map(budget => {
    const spent = categoryExpenses[budget.category] || 0;
    const percent = Math.min((spent / budget.limit) * 100, 100);
    const displayPercent = Math.round((spent / budget.limit) * 100);
    
    let fillClass = 'safe';
    if (percent > 90) {
      fillClass = 'danger';
    } else if (percent > 70) {
      fillClass = 'warning';
    }

    return `
      <div class="budget-item">
        <div class="budget-info">
          <span class="budget-cat">${budget.category}</span>
          <span class="budget-vals">₹${spent.toLocaleString('en-IN')} / ₹${budget.limit.toLocaleString('en-IN')} (${displayPercent}%)</span>
        </div>
        <div class="budget-progress-track">
          <div class="budget-progress-fill ${fillClass}" style="width: ${percent}%"></div>
        </div>
      </div>
    `;
  }).join('');
}

function renderGoals() {
  const store = window.FinanceStore;
  const goals = store.getGoals();

  if (goals.length === 0) {
    goalsContainer.innerHTML = `
      <div class="card-glass empty-state" style="grid-column: 1 / -1;">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v12m-3-2.818l.879-.659c1.546-1.16 3.019-1.161 4.565 0l.88.659M9 9.818l.879-.659c1.546-1.16 3.019-1.16 4.565 0l.88.659m-8.324 5.679a3 3 0 11-.477-5.529m0 0l-.477-5.529a3 3 0 013.953-3.125l.88.659" />
        </svg>
        <h3>No active goals</h3>
        <p>Start saving for things that matter. Add a new goal above!</p>
      </div>
    `;
    return;
  }

  goalsContainer.innerHTML = goals.map(goal => {
    const percent = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
    const displayPercent = Math.round(percent);
    const dateStr = goal.deadline ? new Date(goal.deadline).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'No target date';

    return `
      <div class="card-glass goal-card" data-id="${goal.id}">
        <div class="goal-header">
          <div class="goal-details">
            <h3>${goal.name}</h3>
            <p>Target Deadline: ${dateStr}</p>
          </div>
          <div class="goal-percentage">${displayPercent}%</div>
        </div>
        
        <div class="budget-progress-track">
          <div class="budget-progress-fill safe" style="width: ${percent}%; background: linear-gradient(90deg, var(--color-purple), var(--color-indigo)); box-shadow: 0 0 8px rgba(168, 85, 247, 0.4);"></div>
        </div>

        <div class="goal-amounts">
          <span class="goal-current">Saved: ₹${goal.currentAmount.toLocaleString('en-IN')}</span>
          <span class="goal-target">Target: ₹${goal.targetAmount.toLocaleString('en-IN')}</span>
        </div>

        <div style="display: flex; gap: 0.5rem; margin-top: 0.5rem; align-items: center;">
          <input type="number" class="form-control goal-adjust-input" style="padding:0.4rem; font-size:0.8125rem;" value="${goal.currentAmount}" placeholder="New value" />
          <button class="btn btn-secondary goal-save-btn" style="padding:0.4rem 0.75rem; font-size:0.8125rem; border-radius: var(--radius-sm);">Update</button>
          <button class="btn-danger-outline goal-delete-btn" style="padding:0.4rem; font-size:0.8125rem; margin-left:auto; border-radius: var(--radius-sm);" title="Delete goal">Delete</button>
        </div>
      </div>
    `;
  }).join('');

  goalsContainer.querySelectorAll('.goal-save-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const card = e.currentTarget.closest('.goal-card');
      const id = card.getAttribute('data-id');
      const input = card.querySelector('.goal-adjust-input');
      if (id && input) {
        const val = parseFloat(input.value);
        if (!isNaN(val) && val >= 0) {
          window.FinanceStore.updateGoalProgress(id, val);
          renderAnalytics();
        }
      }
    });
  });

  goalsContainer.querySelectorAll('.goal-delete-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const card = e.currentTarget.closest('.goal-card');
      const id = card.getAttribute('data-id');
      if (id) {
        window.FinanceStore.deleteGoal(id);
        renderAnalytics();
      }
    });
  });
}

function setupEventListeners() {
  btnAddGoal.addEventListener('click', () => {
    goalModal.classList.add('open');
  });

  const closeGoal = () => {
    goalModal.classList.remove('open');
    goalForm.reset();
  };

  btnCloseGoalModal.addEventListener('click', closeGoal);
  btnCancelGoalModal.addEventListener('click', closeGoal);

  goalForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('goal-name').value;
    const targetAmount = parseFloat(document.getElementById('goal-target').value);
    const currentAmount = parseFloat(document.getElementById('goal-current').value);
    const deadline = document.getElementById('goal-deadline').value;

    window.FinanceStore.addGoal({ name, targetAmount, currentAmount, deadline });
    closeGoal();
    renderAnalytics();
  });
}
