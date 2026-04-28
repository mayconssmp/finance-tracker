// elementos do formulário
const form = {
  transactionsList: () => document.getElementById('transactions'),
  summaryTotal:     () => document.getElementById('summary-total'),
  summaryIncome:    () => document.getElementById('summary-income'),
  summaryExpense:   () => document.getElementById('summary-expense'),
  lineChart:        () => document.getElementById('line-chart')
};

// autenticação
firebase.auth().onAuthStateChanged(user => {
  if (user) findTransactions(user);
});

function logout() {
  firebase.auth().signOut()
    .then(() => window.location.href = "/meu_site/pages/index/index.html")
    .catch(error => alert(error.message));
}

// navegação
function newTransaction() {
  window.location.href = "/meu_site/pages/transactions/transaction.html";
}

// transações
function findTransactions(user) {
  showLoading();
  transactionService.findByUser(user)
    .then(transactions => {
      hideLoading();
      renderTransactions(transactions);
    })
    .catch(error => {
      hideLoading();
      alert(error.message);
    });
}

function renderTransactions(transactions) {
  form.transactionsList().innerHTML = '';

  const { totalIncome, totalExpense } = calcTotals(transactions);

  transactions.forEach(transaction => {
    form.transactionsList().appendChild(createTransactionItem(transaction));
  });

  form.summaryTotal().innerText   = formatCurrency({ currency: 'BRL', value: totalIncome - totalExpense });
  form.summaryIncome().innerText  = formatCurrency({ currency: 'BRL', value: totalIncome });
  form.summaryExpense().innerText = formatCurrency({ currency: 'BRL', value: totalExpense });

  renderLineChart(transactions);
}

function calcTotals(transactions) {
  let totalIncome = 0;
  let totalExpense = 0;
  transactions.forEach(t => {
    if (t.type === 'income')  totalIncome  += t.money.value;
    if (t.type === 'expense') totalExpense += t.money.value;
  });
  return { totalIncome, totalExpense };
}

function removeTransaction(transaction) {
  showLoading();
  transactionService.remove(transaction)
    .then(() => {
      hideLoading();
      document.getElementById(transaction.uid).remove();
    })
    .catch(error => {
      hideLoading();
      alert(error.message);
    });
}

function askRemoveTransaction(transaction) {
  const confirmed = confirm("Tem certeza que deseja remover esta transação?");
  if (confirmed) removeTransaction(transaction);
}

// criação de elementos
function createTransactionItem(transaction) {
  const li = document.createElement('li');
  li.classList.add(transaction.type);
  li.id = transaction.uid;
  li.addEventListener('click', () => {
    window.location.href = "/meu_site/pages/transactions/transaction.html?id=" + transaction.uid;
  });

  li.appendChild(createTransactionInfo(transaction));
  li.appendChild(createTransactionRight(transaction));

  return li;
}

function createTransactionInfo(transaction) {
  const div = document.createElement('div');
  div.classList.add('tx-info');
  div.innerHTML = `
    <span class="tx-name">${transaction.transactionType}</span>
    <span class="tx-date">${formatDate(transaction.date)}</span>
    ${transaction.description ? `<span class="tx-description">${transaction.description}</span>` : ''}
  `;
  return div;
}

function createTransactionRight(transaction) {
  const div = document.createElement('div');
  div.classList.add('tx-right');
  div.appendChild(createAmountSpan(transaction));
  div.appendChild(createDeleteButton(transaction));
  return div;
}

function createAmountSpan(transaction) {
  const span = document.createElement('span');
  span.classList.add('tx-amount', transaction.type);
  span.innerText = `${transaction.type === 'expense' ? '-' : '+'} ${formatCurrency(transaction.money)}`;
  return span;
}

function createDeleteButton(transaction) {
  const button = document.createElement('button');
  button.innerHTML = "Excluir";
  button.classList.add('outline', 'danger');
  button.addEventListener('click', event => {
    event.stopPropagation();
    askRemoveTransaction(transaction);
  });
  return button;
}

// gráfico
function renderLineChart(transactions) {
  const months = groupExpensesByMonth(transactions);
  const sorted = Object.keys(months).sort();

  const labels = sorted.map(k => {
    const [year, month] = k.split('-');
    return new Date(year, month - 1).toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
  });
  const values = sorted.map(k => months[k]);

  const existing = Chart.getChart('line-chart');
  if (existing) existing.destroy();

  new Chart(form.lineChart(), {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Gastos mensais',
        data: values,
        borderColor: '#ff4d4d',
        backgroundColor: 'rgba(255,77,77,0.08)',
        pointBackgroundColor: '#ff4d4d',
        pointRadius: 5,
        tension: 0.4,
        fill: true,
        borderWidth: 2
      }]
    },
    options: {
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color: '#888', font: { size: 11 } }, grid: { color: '#2a2a2a' } },
        y: {
          ticks: { color: '#888', font: { size: 11 }, callback: v => `R$ ${v.toLocaleString('pt-BR')}` },
          grid: { color: '#2a2a2a' }
        }
      }
    }
  });
}

function groupExpensesByMonth(transactions) {
  const months = {};
  transactions.forEach(t => {
    if (t.type !== 'expense') return;
    const date = t.date.toDate ? t.date.toDate() : new Date(t.date);
    const key  = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    if (!months[key]) months[key] = 0;
    months[key] += t.money.value;
  });
  return months;
}

// formatação
function formatCurrency(money) {
  return new Intl.NumberFormat('pt-BR', { currency: 'BRL', style: 'currency' }).format(money.value);
}

function formatDate(date) {
  if (!date) return '';
  const d = date.toDate ? date.toDate() : new Date(date);
  return d.toLocaleDateString('pt-BR');
}