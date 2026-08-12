const DEFAULT_TRANSACTIONS = [
  { id: '1', title: 'Monthly Salary', amount: 55000, type: 'income', category: 'Salary', date: '2026-08-01', description: 'Primary job salary' },
  { id: '2', title: 'Apartment Rent', amount: 1500, type: 'expense', category: 'Housing', date: '2026-08-02', description: 'Rent for August' }, // adjusted Rent to fit screenshots
  { id: '3', title: 'Supermarket Grocery', amount: 4200, type: 'expense', category: 'Food', date: '2026-08-04', description: 'Weekly groceries' },
  { id: '4', title: 'Freelance Design', amount: 12500, type: 'income', category: 'Freelance', date: '2026-08-05', description: 'Landing page design client' },
  { id: '5', title: 'Electricity Bill', amount: 2800, type: 'expense', category: 'Utilities', date: '2026-08-06', description: 'Electricity bill' },
  { id: '6', title: 'Netflix Subscription', amount: 800, type: 'expense', category: 'Entertainment', date: '2026-08-07', description: 'Premium ultra HD plan' },
  { id: '7', title: 'Fine Dining Dinner', amount: 3500, type: 'expense', category: 'Food', date: '2026-08-08', description: 'Dinner celebration' },
  { id: '8', title: 'Uber & Transport', amount: 1200, type: 'expense', category: 'Transport', date: '2026-08-09', description: 'Office commutes' }
];

const DEFAULT_BUDGETS = [
  { category: 'Food', limit: 15000 }, // updated limits to match user screenshot values
  { category: 'Housing', limit: 20000 },
  { category: 'Utilities', limit: 5000 },
  { category: 'Transport', limit: 4000 },
  { category: 'Entertainment', limit: 3000 },
  { category: 'Others', limit: 5000 }
];

const DEFAULT_GOALS = [
  { id: 'g1', name: 'Emergency Fund', targetAmount: 100000, currentAmount: 65000, deadline: '2026-12-31' },
  { id: 'g2', name: 'New MacBook Pro', targetAmount: 150000, currentAmount: 45000, deadline: '2026-11-30' },
  { id: 'g3', name: 'Vacation to Japan', targetAmount: 200000, currentAmount: 80000, deadline: '2027-05-15' }
];

const getLocalStorageItem = (key, defaultValue) => {
  const data = localStorage.getItem(key);
  if (!data) {
    localStorage.setItem(key, JSON.stringify(defaultValue));
    return defaultValue;
  }
  return JSON.parse(data);
};

const setLocalStorageItem = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};

class FinanceStore {
  static STORAGE_KEY_TX = 'finance_dashboard_tx';
  static STORAGE_KEY_BUDGETS = 'finance_dashboard_budgets';
  static STORAGE_KEY_GOALS = 'finance_dashboard_goals';

  static getTransactions() {
    return getLocalStorageItem(this.STORAGE_KEY_TX, DEFAULT_TRANSACTIONS);
  }

  static addTransaction(tx) {
    const transactions = this.getTransactions();
    const newTx = {
      ...tx,
      id: Math.random().toString(36).substring(2, 9)
    };
    transactions.unshift(newTx);
    setLocalStorageItem(this.STORAGE_KEY_TX, transactions);
    return newTx;
  }

  static deleteTransaction(id) {
    let transactions = this.getTransactions();
    transactions = transactions.filter(t => t.id !== id);
    setLocalStorageItem(this.STORAGE_KEY_TX, transactions);
  }

  static getBudgets() {
    return getLocalStorageItem(this.STORAGE_KEY_BUDGETS, DEFAULT_BUDGETS);
  }

  static setBudget(category, limit) {
    const budgets = this.getBudgets();
    const existing = budgets.find(b => b.category.toLowerCase() === category.toLowerCase());
    if (existing) {
      existing.limit = limit;
    } else {
      budgets.push({ category, limit });
    }
    setLocalStorageItem(this.STORAGE_KEY_BUDGETS, budgets);
  }

  static getGoals() {
    return getLocalStorageItem(this.STORAGE_KEY_GOALS, DEFAULT_GOALS);
  }

  static addGoal(goal) {
    const goals = this.getGoals();
    const newGoal = {
      ...goal,
      id: 'g' + Math.random().toString(36).substring(2, 9)
    };
    goals.push(newGoal);
    setLocalStorageItem(this.STORAGE_KEY_GOALS, goals);
    return newGoal;
  }

  static updateGoalProgress(id, currentAmount) {
    const goals = this.getGoals();
    const goal = goals.find(g => g.id === id);
    if (goal) {
      goal.currentAmount = currentAmount;
      setLocalStorageItem(this.STORAGE_KEY_GOALS, goals);
    }
  }

  static deleteGoal(id) {
    let goals = this.getGoals();
    goals = goals.filter(g => g.id !== id);
    setLocalStorageItem(this.STORAGE_KEY_GOALS, goals);
  }

  static getSummary() {
    const transactions = this.getTransactions();
    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach(t => {
      if (t.type === 'income') {
        totalIncome += t.amount;
      } else {
        totalExpense += t.amount;
      }
    });

    return {
      balance: totalIncome - totalExpense,
      income: totalIncome,
      expenses: totalExpense
    };
  }

  static getCategorySummary() {
    const transactions = this.getTransactions();
    const categories = {};

    transactions.forEach(t => {
      if (t.type === 'expense') {
        const cat = t.category;
        categories[cat] = (categories[cat] || 0) + t.amount;
      }
    });

    return categories;
  }
}

// Attach to window so it is accessible globally
window.FinanceStore = FinanceStore;
