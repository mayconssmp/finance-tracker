const form = {
  email:                    () => document.getElementById('email'),
  emailRequiredError:       () => document.getElementById('email-required-error'),
  emailInvalidError:        () => document.getElementById('email-invalid-error'),
  password:                 () => document.getElementById('password'),
  confirmPassword:          () => document.getElementById('confirmPassword'),
  passwordRequiredError:    () => document.getElementById('password-required-error'),
  passwordMinLengthError:   () => document.getElementById('password-min-length-error'),
  passwordDoesntMatchError: () => document.getElementById('password-doesnt-match-error'),
  registerButton:           () => document.getElementById('register-button')
};

// redireciona se já estiver logado
firebase.auth().onAuthStateChanged(user => {
  if (user) window.location.href = "/meu_site/pages/home/home.html";
});

// eventos
function onChangeEmail() {
  toggleEmailErrors();
  toggleRegisterButtonDisabled();
}

function onChangePassword() {
  togglePasswordErrors();
  validatePasswordMatch();
  toggleRegisterButtonDisabled();
}

function onChangeConfirmPassword() {
  validatePasswordMatch();
  toggleRegisterButtonDisabled();
}

// validações
function toggleEmailErrors() {
  const email = form.email().value;
  form.emailRequiredError().style.display  = !email ? "block" : "none";
  form.emailInvalidError().style.display   = email && !validateEmail(email) ? "block" : "none";
}

function togglePasswordErrors() {
  const password = form.password().value;
  form.passwordRequiredError().style.display  = !password ? "block" : "none";
  form.passwordMinLengthError().style.display = password && password.length < 6 ? "block" : "none";
}

function validatePasswordMatch() {
  const password        = form.password().value;
  const confirmPassword = form.confirmPassword().value;
  form.passwordDoesntMatchError().style.display =
    confirmPassword && password !== confirmPassword ? "block" : "none";
}

function isFormValid() {
  const email           = form.email().value;
  const password        = form.password().value;
  const confirmPassword = form.confirmPassword().value;
  return (
    email &&
    password &&
    confirmPassword &&
    validateEmail(email) &&
    password.length >= 6 &&
    password === confirmPassword
  );
}

function toggleRegisterButtonDisabled() {
  form.registerButton().disabled = !isFormValid();
}

// ações
function register() {
  showLoading();
  firebase.auth()
    .createUserWithEmailAndPassword(form.email().value, form.password().value)
    .then(() => {
      hideLoading();
      window.location.href = "/meu_site/pages/home/home.html";
    })
    .catch(error => {
      hideLoading();
      alert(getErrorMessage(error));
    });
}

function login() {
  window.location.href = "/meu_site/pages/index/index.html";
}

function getErrorMessage(error) {
  if (error.code === "auth/email-already-in-use") return "email já cadastrado";
  return error.message;
}