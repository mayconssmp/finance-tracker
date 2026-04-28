// autenticação
firebase.auth().onAuthStateChanged(user => {
  if (!user) window.location.href = "/meu_site/pages/index/index.html";
});