// loading
function showLoading() {
  const div = document.createElement("div");
  div.classList.add("loading");
  div.innerHTML = `
    <div class="loading-spinner"></div>
    <span class="loading-text">Carregando...</span>
  `;
  document.body.appendChild(div);
}

function hideLoading() {
  const loading = document.querySelector(".loading");
  if (loading) loading.remove();
}