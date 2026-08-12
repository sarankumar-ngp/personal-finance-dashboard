import { FinanceStore } from './state';

// DOM elements
const ledgerBody = document.getElementById('ledger-body') as HTMLElement;
const ledgerEmptyState = document.getElementById('ledger-empty-state') as HTMLElement;

// Filter fields
const searchInput = document.getElementById('search-tx') as HTMLInputElement;
const filterType = document.getElementById('filter-type') as HTMLSelectElement;
const filterCategory = document.getElementById('filter-category') as HTMLSelectElement;
const btnResetFilters = document.getElementById('btn-reset-filters') as HTMLButtonElement;

// Add Tx Modal elements
const btnAddTx = document.getElementById('btn-add-tx') as HTMLButtonElement;
const txModal = document.getElementById('tx-modal') as HTMLElement;
const btnCloseModal = document.getElementById('btn-close-modal') as HTMLButtonElement;
const btnCancelModal = document.getElementById('btn-cancel-modal') as HTMLButtonElement;
const txForm = document.getElementById('tx-form') as HTMLFormElement;
const txDateInput = document.getElementById('tx-date') as HTMLInputElement;

document.addEventListener('DOMContentLoaded', () => {
  renderLedger();
  setupEventListeners();
});

function renderLedger() {
  const transactions = FinanceStore.getTransactions();
  const searchVal = searchInput.value.toLowerCase().trim();
  const typeVal = filterType.value;
  const categoryVal = filterCategory.value;

  // Filter logic
  const filtered = transactions.filter(tx => {
    // 1. Search Query
    const matchesSearch = tx.title.toLowerCase().includes(searchVal) || 
                          (tx.description && tx.description.toLowerCase().includes(searchVal));
    
    // 2. Type
    const matchesType = typeVal === 'all' ? true : tx.type === typeVal;

    // 3. Category
    const matchesCategory = categoryVal === 'all' ? true : tx.category.toLowerCase() === categoryVal.toLowerCase();

    return matchesSearch && matchesType && matchesCategory;
  });

  if (filtered.length === 0) {
    ledgerBody.innerHTML = '';
    ledgerEmptyState.style.display = 'flex';
    return;
  }

  ledgerEmptyState.style.display = 'none';
  ledgerBody.innerHTML = filtered.map(tx => {
    const isIncome = tx.type === 'income';
    const amountPrefix = isIncome ? '+' : '-';
    const amountClass = isIncome ? 'income' : 'expense';
    const dateFormatted = new Date(tx.date).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });

    return `
      <tr class="ledger-row" data-id="${tx.id}">
        <td>
          <div style="font-weight: 600; color: var(--text-primary);">${tx.title}</div>
          ${tx.description ? `<div style="font-size:0.75rem; color:var(--text-secondary); margin-top:0.125rem;">${tx.description}</div>` : ''}
        </td>
        <td>
          <span style="font-size: 0.875rem; color: var(--text-secondary);">${tx.category}</span>
        </td>
        <td>
          <span style="font-size: 0.875rem; color: var(--text-secondary);">${dateFormatted}</span>
        </td>
        <td>
          <span class="badge-tag ${tx.type}">${tx.type}</span>
        </td>
        <td>
          <span class="tx-amount ${amountClass}" style="font-weight:700;">${amountPrefix}₹${tx.amount.toLocaleString('en-IN')}</span>
        </td>
        <td>
          <button class="tx-delete-btn ledger-delete-btn" title="Delete transaction">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </td>
      </tr>
    `;
  }).join('');

  // Attach delete handlers
  ledgerBody.querySelectorAll('.ledger-delete-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const row = (e.currentTarget as HTMLElement).closest('.ledger-row');
      if (row) {
        const id = row.getAttribute('data-id');
        if (id) {
          FinanceStore.deleteTransaction(id);
          renderLedger();
        }
      }
    });
  });
}

function setupEventListeners() {
  // Input filters
  searchInput.addEventListener('input', renderLedger);
  filterType.addEventListener('change', renderLedger);
  filterCategory.addEventListener('change', renderLedger);

  // Reset Filters
  btnResetFilters.addEventListener('click', () => {
    searchInput.value = '';
    filterType.value = 'all';
    filterCategory.value = 'all';
    renderLedger();
  });

  // Modal Handlers
  btnAddTx.addEventListener('click', () => {
    txDateInput.value = new Date().toISOString().split('T')[0];
    txModal.classList.add('open');
  });

  const closeModal = () => {
    txModal.classList.remove('open');
    txForm.reset();
  };

  btnCloseModal.addEventListener('click', closeModal);
  btnCancelModal.addEventListener('click', closeModal);

  txForm.addEventListener('submit', (e) => {
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

    closeModal();
    renderLedger();
  });
}
