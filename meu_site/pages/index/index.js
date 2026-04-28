// elementos do formulário
const form = {
  email:                 () => document.getElementById('email'),
  emailRequiredError:    () => document.getElementById('email-required-error'),
  emailInvalidError:     () => document.getElementById('email-invalid-error'),
  password:              () => document.getElementById('password'),
  passwordRequiredError: () => document.getElementById('password-required-error'),
  loginButton:           () => document.getElementById('login-button'),
  recoverPasswordButton: () => document.getElementById('recover-password-button')
};

// redireciona se já estiver logado
firebase.auth().onAuthStateChanged(user => {
  if (user) window.location.href = "/meu_site/pages/home/home.html";
});

// eventos
function onChangeEmail() {
  toggleEmailErrors();
  toggleButtonStates();
}

function onChangePassword() {
  togglePasswordErrors();
  toggleButtonStates();
}

// validações
function toggleEmailErrors() {
  const email = form.email().value;
  form.emailRequiredError().style.display = !email ? "block" : "none";
  form.emailInvalidError().style.display  = email && !validateEmail(email) ? "block" : "none";
}

function togglePasswordErrors() {
  const password = form.password().value;
  form.passwordRequiredError().style.display = !password ? "block" : "none";
}

function toggleButtonStates() {
  const emailValid    = isEmailValid();
  const passwordValid = isPasswordValid();
  form.recoverPasswordButton().disabled = !emailValid;
  form.loginButton().disabled           = !emailValid || !passwordValid;
}

function isEmailValid() {
  const email = form.email().value;
  return email ? validateEmail(email) : false;
}

function isPasswordValid() {
  return !!form.password().value;
}

// ações
function login() {
  showLoading();
  firebase.auth()
    .signInWithEmailAndPassword(form.email().value, form.password().value)
    .then(() => {
      hideLoading();
      window.location.href = "/meu_site/pages/home/home.html";
    })
    .catch(error => {
      hideLoading();
      alert(getErrorMessage(error));
    });
}

function register() {
  window.location.href = "/meu_site/pages/register/register.html";
}

function recoverPassword() {
  showLoading();
  firebase.auth()
    .sendPasswordResetEmail(form.email().value)
    .then(() => {
      hideLoading();
      alert("email enviado com sucesso");
    })
    .catch(error => {
      hideLoading();
      alert(getErrorMessage(error));
    });
}

function getErrorMessage(error) {
  if (error.code === "auth/invalid-credential") return "usuário não encontrado";
  return error.message;
}