import { FinanceStore } from './state';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

// Dom Elements
const greetingTitle = document.getElementById('greeting-title') as HTMLElement;
const currentDateEl = document.getElementById('current-date') as HTMLElement;
const balanceEl = document.getElementById('balance-amount') as HTMLElement;
const incomeEl = document.getElementById('income-amount') as HTMLElement;
const expenseEl = document.getElementById('expense-amount') as HTMLElement;
const recentTransactionsContainer = document.getElementById('recent-transactions-container') as HTMLElement;

// Quick Tx Modal Elements
const btnQuickTx = document.getElementById('btn-quick-tx') as HTMLButtonElement;
const txModal = document.getElementById('tx-modal') as HTMLElement;
const btnCloseTxModal = document.getElementById('btn-close-modal') as HTMLButtonElement;
const btnCancelTxModal = document.getElementById('btn-cancel-modal') as HTMLButtonElement;
const quickTxForm = document.getElementById('quick-tx-form') as HTMLFormElement;
const txDateInput = document.getElementById('tx-date') as HTMLInputElement;

// Quick Budget Modal Elements
const btnQuickBudget = document.getElementById('btn-quick-budget') as HTMLButtonElement;
const budgetModal = document.getElementById('budget-modal') as HTMLElement;
const btnCloseBudgetModal = document.getElementById('btn-close-budget-modal') as HTMLButtonElement;
const btnCancelBudgetModal = document.getElementById('btn-cancel-budget-modal') as HTMLButtonElement;
const quickBudgetForm = document.getElementById('quick-budget-form') as HTMLFormElement;

let cashflowChart: Chart | null = null;

// Initialize Page
document.addEventListener('DOMContentLoaded', () => {
  setupGreeting();
  updateDashboard();
  setupEventListeners();
});

function setupGreeting() {
  const hours = new Date().getHours();
  let greet = 'Good Evening';
  if (hours < 12) greet = 'Good Morning';
  else if (hours < 17) greet = 'Good Afternoon';
  
  greetingTitle.textContent = `${greet}, Macha!`;
  
  // Set formatting date
  const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  currentDateEl.textContent = new Date().toLocaleDateString('en-US', options);
}

function updateDashboard() {
  // 1. Update stats card
  const summary = FinanceStore.getSummary();
  balanceEl.textContent = `₹${summary.balance.toLocaleString('en-IN')}`;
  incomeEl.textContent = `₹${summary.income.toLocaleString('en-IN')}`;
  expenseEl.textContent = `₹${summary.expenses.toLocaleString('en-IN')}`;
  
  // 2. Render recent transaction list (limit to 5)
  renderRecentTransactions();
  
  // 3. Render/refresh the Cash Flow trend chart
  renderCashflowChart();
}

function getCategoryIconClass(category: string): string {
  return category.toLowerCase();
}

function getCategorySVG(category: string): string {
  switch (category.toLowerCase()) {
    case 'salary':
    case 'freelance':
      return `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m-3-2.818l.879-.659c1.546-1.16 3.019-1.161 4.565 0l.88.659M9 9.818l.879-.659c1.546-1.16 3.019-1.16 4.565 0l.88.659m-8.324 5.679a3 3 0 11-.477-5.529m0 0l-.477-5.529a3 3 0 013.953-3.125l.88.659" /></svg>`;
    case 'housing':
      return `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21.75h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21.75h7.5" /></svg>`;
    case 'food':
      return `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.871c1.355 0 2.697.056 4.024.166C17.155 8.51 18 9.473 18 10.608v2.513M12 8.25c0 .75-.225 1.45-.615 2.034M12 8.25c0 .75.225 1.45.615 2.034M12 13.5v-3.216m0 3.216a3 3 0 01-3-3V10.608m3 2.892a3 3 0 003-3V10.608M3.375 19.5h17.25c.621 0 1.125-.504 1.125-1.125V18a3.375 3.375 0 00-3.375-3.375H6.75A3.375 3.375 0 003.375 18v.375c0 .621.504 1.125 1.125 1.125z" /></svg>`;
    case 'utilities':
      return `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg>`;
    case 'entertainment':
      return `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6 13.5V3.75m0 9.75a1.5 1.5 0 010-3m0 3a1.5 1.5 0 000-3m0 3.75h1.5m-1.5-3h1.5m-1.5-3.75V3.75m0 3h1.5M18 13.5V3.75m0 9.75a1.5 1.5 0 010-3m0 3a1.5 1.5 0 000-3m0 3.75h1.5m-1.5-3h1.5m-1.5-3.75V3.75m0 3h1.5m-9 10.5h9" /></svg>`;
    case 'transport':
      return `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h7.5m-9-6h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h9.75m0 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h4.5m0 0l-1.5-6h-13.5L3 12.75" /></svg>`;
    default:
      return `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 21l8.904-8.904m-8.904 3.808L18 7.096m-8.904 3.808L18 2.096M3 10.5h18" /></svg>`;
  }
}

function renderRecentTransactions() {
  const transactions = FinanceStore.getTransactions();
  const recents = transactions.slice(0, 5);
  
  if (recents.length === 0) {
    recentTransactionsContainer.innerHTML = `
      <div class="empty-state">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
        </svg>
        <h3>No recent transactions</h3>
        <p>Click "Add Transaction" to log some cash flow.</p>
      </div>
    `;
    return;
  }
  
  recentTransactionsContainer.innerHTML = recents.map(tx => {
    const isIncome = tx.type === 'income';
    const amountPrefix = isIncome ? '+' : '-';
    const amountClass = isIncome ? 'income' : 'expense';
    const categoryClass = getCategoryIconClass(tx.category);
    const categorySVG = getCategorySVG(tx.category);
    
    // Formatting date neatly
    const dateFormatted = new Date(tx.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    return `
      <div class="tx-item" data-id="${tx.id}">
        <div class="tx-item-left">
          <div class="tx-icon-wrapper ${categoryClass}">
            ${categorySVG}
          </div>
          <div class="tx-info">
            <div class="tx-title">${tx.title}</div>
            <div class="tx-meta">${tx.category} • ${dateFormatted}</div>
          </div>
        </div>
        <div class="tx-actions">
          <div class="tx-amount ${amountClass}">${amountPrefix}₹${tx.amount.toLocaleString('en-IN')}</div>
          <button class="tx-delete-btn" title="Delete transaction">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    `;
  }).join('');
  
  // Attach delete handlers
  recentTransactionsContainer.querySelectorAll('.tx-delete-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const item = (e.currentTarget as HTMLElement).closest('.tx-item');
      if (item) {
        const id = item.getAttribute('data-id');
        if (id) {
          FinanceStore.deleteTransaction(id);
          updateDashboard();
        }
      }
    });
  });
}

function renderCashflowChart() {
  const transactions = [...FinanceStore.getTransactions()].reverse(); // old to new
  
  // Aggregate daily income and expenses
  const datesMap: Record<string, { income: number; expense: number }> = {};
  
  // Fill the last 7 days with zero default to ensure a clean visual baseline if data is sparse
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    datesMap[dateStr] = { income: 0, expense: 0 };
  }
  
  // Populate aggregate data
  transactions.forEach(t => {
    const dateKey = t.date;
    if (datesMap[dateKey] !== undefined) {
      if (t.type === 'income') {
        datesMap[dateKey].income += t.amount;
      } else {
        datesMap[dateKey].expense += t.amount;
      }
    } else {
      // Allow dynamic dates outside last 7 days too if they fit in the range
      datesMap[dateKey] = {
        income: t.type === 'income' ? t.amount : 0,
        expense: t.type === 'expense' ? t.amount : 0
      };
    }
  });

  // Sort dates
  const sortedDates = Object.keys(datesMap).sort();
  const incomeData = sortedDates.map(d => datesMap[d].income);
  const expenseData = sortedDates.map(d => datesMap[d].expense);
  const labels = sortedDates.map(d => {
    const dateObj = new Date(d);
    return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  });

  const ctx = (document.getElementById('cashflow-chart') as HTMLCanvasElement).getContext('2d');
  if (!ctx) return;

  if (cashflowChart) {
    cashflowChart.destroy();
  }

  // Create beautiful gradients
  const incomeGradient = ctx.createLinearGradient(0, 0, 0, 300);
  incomeGradient.addColorStop(0, 'rgba(16, 185, 129, 0.35)');
  incomeGradient.addColorStop(1, 'rgba(16, 185, 129, 0.00)');

  const expenseGradient = ctx.createLinearGradient(0, 0, 0, 300);
  expenseGradient.addColorStop(0, 'rgba(244, 63, 94, 0.35)');
  expenseGradient.addColorStop(1, 'rgba(244, 63, 94, 0.00)');

  cashflowChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Inflow (Income)',
          data: incomeData,
          borderColor: '#10b981',
          borderWidth: 3,
          backgroundColor: incomeGradient,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#10b981',
          pointHoverRadius: 7,
          pointRadius: 4
        },
        {
          label: 'Outflow (Expenses)',
          data: expenseData,
          borderColor: '#f43f5e',
          borderWidth: 3,
          backgroundColor: expenseGradient,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#f43f5e',
          pointHoverRadius: 7,
          pointRadius: 4
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: {
            color: '#94a3b8',
            font: {
              family: 'Plus Jakarta Sans',
              size: 12,
              weight: 'bold'
            },
            boxWidth: 12,
            boxHeight: 12,
            usePointStyle: true,
            pointStyle: 'circle'
          }
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          backgroundColor: '#0f1524',
          titleColor: '#f8fafc',
          bodyColor: '#94a3b8',
          borderColor: 'rgba(255,255,255,0.1)',
          borderWidth: 1,
          titleFont: { family: 'Plus Jakarta Sans', size: 13, weight: 'bold' },
          bodyFont: { family: 'Plus Jakarta Sans', size: 12 },
          callbacks: {
            label: function(context) {
              let label = context.dataset.label || '';
              if (label) {
                label += ': ';
              }
              if (context.parsed.y !== null) {
                label += '₹' + context.parsed.y.toLocaleString('en-IN');
              }
              return label;
            }
          }
        }
      },
      scales: {
        x: {
          grid: {
            display: false
          },
          ticks: {
            color: '#64748b',
            font: { family: 'Plus Jakarta Sans', size: 11 }
          }
        },
        y: {
          grid: {
            color: 'rgba(255, 255, 255, 0.05)'
          },
          ticks: {
            color: '#64748b',
            font: { family: 'Plus Jakarta Sans', size: 11 },
            callback: function(value) {
              return '₹' + Number(value).toLocaleString('en-IN');
            }
          }
        }
      }
    }
  });
}

function setupEventListeners() {
  // Quick Tx Modal Handlers
  btnQuickTx.addEventListener('click', () => {
    // Pre-fill today's date
    txDateInput.value = new Date().toISOString().split('T')[0];
    txModal.classList.add('open');
  });

  const closeTx = () => {
    txModal.classList.remove('open');
    quickTxForm.reset();
  };

  btnCloseTxModal.addEventListener('click', closeTx);
  btnCancelTxModal.addEventListener('click', closeTx);

  quickTxForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = (document.getElementById('tx-title') as HTMLInputElement).value;
    const amount = parseFloat((document.getElementById('tx-amount') as HTMLInputElement).value);
    const type = (document.getElementById('tx-type') as HTMLSelectElement).value as 'income' | 'expense';
    const category = (document.getElementById('tx-category') as HTMLSelectElement).value;
    const date = (document.getElementById('tx-date') as HTMLInputElement).value;

    FinanceStore.addTransaction({
      title,
      amount,
      type,
      category,
      date
    });

    updateDashboard();
    closeTx();
  });

  // Quick Budget Modal Handlers
  btnQuickBudget.addEventListener('click', () => {
    budgetModal.classList.add('open');
  });

  const closeBudget = () => {
    budgetModal.classList.remove('open');
    quickBudgetForm.reset();
  };

  btnCloseBudgetModal.addEventListener('click', closeBudget);
  btnCancelBudgetModal.addEventListener('click', closeBudget);

  quickBudgetForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const category = (document.getElementById('budget-category') as HTMLSelectElement).value;
    const limit = parseFloat((document.getElementById('budget-limit') as HTMLInputElement).value);

    FinanceStore.setBudget(category, limit);
    closeBudget();
    updateDashboard(); // Refreshes page context if anything changes
  });
}
