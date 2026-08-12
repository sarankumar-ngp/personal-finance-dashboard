// DOM elements
const ledgerBody = document.getElementById('ledger-body');
const ledgerEmptyState = document.getElementById('ledger-empty-state');

// Filter fields
const searchInput = document.getElementById('search-tx');
const filterType = document.getElementById('filter-type');
const filterCategory = document.getElementById('filter-category');
const btnResetFilters = document.getElementById('btn-reset-filters');

// Add Tx Modal elements
const btnAddTx = document.getElementById('btn-add-tx');
const txModal = document.getElementById('tx-modal');
const btnCloseModal = document.getElementById('btn-close-modal');
const btnCancelModal = document.getElementById('btn-cancel-modal');
const txForm = document.getElementById('tx-form');
const txDateInput = document.getElementById('tx-date');

document.addEventListener('DOMContentLoaded', () => {
  renderLedger();
  setupEventListeners();
});

function renderLedger() {
  const store = window.FinanceStore;
  const transactions = store.getTransactions();
  const searchVal = searchInput.value.toLowerCase().trim();
  const typeVal = filterType.value;
  const categoryVal = filterCategory.value;

  const filtered = transactions.filter(tx => {
    const matchesSearch = tx.title.toLowerCase().includes(searchVal) || 
                          (tx.description && tx.description.toLowerCase().includes(searchVal));
    const matchesType = typeVal === 'all' ? true : tx.type === typeVal;
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
    
    // Formatting date to ensure year displays correctly (e.g. Aug 10, 2026 instead of 260810)
    let dateObj = new Date(tx.date);
    if (isNaN(dateObj.getTime())) {
      dateObj = new Date();
    }
    const dateFormatted = dateObj.toLocaleDateString('en-US', { 
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

  ledgerBody.querySelectorAll('.ledger-delete-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const row = e.currentTarget.closest('.ledger-row');
      if (row) {
        const id = row.getAttribute('data-id');
        if (id) {
          window.FinanceStore.deleteTransaction(id);
          renderLedger();
        }
      }
    });
  });
}

function setupEventListeners() {
  searchInput.addEventListener('input', renderLedger);
  filterType.addEventListener('change', renderLedger);
  filterCategory.addEventListener('change', renderLedger);

  btnResetFilters.addEventListener('click', () => {
    searchInput.value = '';
    filterType.value = 'all';
    filterCategory.value = 'all';
    renderLedger();
  });

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
    const title = document.getElementById('tx-title').value;
    const amount = parseFloat(document.getElementById('tx-amount').value);
    const type = document.getElementById('tx-type').value;
    const category = document.getElementById('tx-category').value;
    const date = document.getElementById('tx-date').value;

    window.FinanceStore.addTransaction({ title, amount, type, category, date });
    closeModal();
    renderLedger();
  });
}
