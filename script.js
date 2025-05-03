
const codigo = new URLSearchParams(window.location.search).get('codigo');

fetch('data.json')
  .then(response => response.json())
  .then(data => {
    const resultadoEl = document.getElementById('resultado');
    const item = data.find(entry => entry.codigo === codigo);

    if (!codigo) {
      resultadoEl.innerHTML = '<p class="invalido">Nenhum código informado.</p>';
    } else if (!item) {
      resultadoEl.innerHTML = '<p class="invalido">Código inválido.</p>';
    } else if (item.presenca === "sim") {
      resultadoEl.innerHTML = '<p class="usado">❌ Código já utilizado por ' + item.nome + '</p>';
    } else {
      resultadoEl.innerHTML = '<p class="ok">✅ Acesso liberado para ' + item.nome + '</p>';
    }
  });
