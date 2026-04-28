const form = {
  type:                 document.getElementById('type'),
  date:                 document.getElementById('date'),
  currency:             document.getElementById('currency'),
  value:                document.getElementById('value'),
  transactionType:      document.getElementById('transactionType'),
  description:          document.getElementById('description'),
  dateError:            document.getElementById('error-required-date'),
  valueError:           document.getElementById('error-required-value'),
  valueInvalidError:    document.getElementById('error-invalid-value'),
  transactionTypeError: document.getElementById('error-required-transactionType'),
  saveButton:           document.getElementById('save-button')
};

// carrega transação se for edição
firebase.auth().onAuthStateChanged(user => {
  if (user && !isNewTransaction()) findTransactionByUid(getTransactionUid());
});

// navegação
function backToHome() {
  window.location.href = "/meu_site/pages/home/home.html";
}

// helpers de URL
function getTransactionUid() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('id');
}

function isNewTransaction() {
  return !getTransactionUid();
}

// busca transação por id
function findTransactionByUid(uid) {
  showLoading();
  transactionService.findById(uid)
    .then(transaction => {
      hideLoading();
      if (transaction) {
        fillTransactionScreen(transaction);
      } else {
        alert('transação não encontrada');
        window.location.href = "/meu_site/pages/home/home.html";
      }
    })
    .catch(error => {
      hideLoading();
      alert(error.message);
    });
}

// preenche os campos com dados da transação
function fillTransactionScreen(transaction) {
  form.type.value            = transaction.type;
  form.currency.value        = transaction.money.currency;
  form.value.value           = transaction.money.value;
  form.transactionType.value = transaction.transactionType;
  form.description.value     = transaction.description || '';

  const date = transaction.date.toDate ? transaction.date.toDate() : new Date(transaction.date);
  form.date.value = date.toISOString().split('T')[0];

  toggleSaveButtonDisabled();
}

// validações
function onChangeDate() {
  form.dateError.style.display = !form.date.value ? 'block' : 'none';
  toggleSaveButtonDisabled();
}

function onChangeValue() {
  const value = parseFloat(form.value.value);
  form.valueError.style.display        = !form.value.value ? 'block' : 'none';
  form.valueInvalidError.style.display = form.value.value && value <= 0 ? 'block' : 'none';
  toggleSaveButtonDisabled();
}

function onChangeTransactionType() {
  form.transactionTypeError.style.display = !form.transactionType.value ? 'block' : 'none';
  toggleSaveButtonDisabled();
}

function toggleSaveButtonDisabled() {
  form.saveButton.disabled = !isFormValid();
}

function isFormValid() {
  return (
    form.type.value &&
    form.date.value &&
    parseFloat(form.value.value) > 0 &&
    form.transactionType.value
  );
}

// salvar
function saveTransaction() {
  showLoading();
  const transaction = createTransaction();
  if (isNewTransaction()) {
    save(transaction);
  } else {
    update(transaction);
  }
}

function save(transaction) {
  transactionService.save(transaction)
    .then(() => {
      hideLoading();
      window.location.href = "/meu_site/pages/home/home.html";
    })
    .catch(error => {
      hideLoading();
      alert(error.message);
    });
}

function update(transaction) {
  transactionService.update(transaction)
    .then(() => {
      hideLoading();
      window.location.href = "/meu_site/pages/home/home.html";
    })
    .catch(error => {
      hideLoading();
      alert(error.message);
    });
}

function createTransaction() {
  return {
    uid:             isNewTransaction() ? null : getTransactionUid(),
    type:            form.type.value,
    date:            form.date.value,
    money: {
      currency: form.currency.value,
      value:    parseFloat(form.value.value),
    },
    transactionType: form.transactionType.value,
    description:     form.description.value || null,
    user: {
      uid: firebase.auth().currentUser.uid,
    }
  };
}