
let scanner;
let codigosLidos = [];
let esperando = false;

function validarCodigo(codigo) {
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
        salvarCheckin(item.nome);
        atualizarLista();
        codigosLidos.push(codigo); // marca como lido somente se for válido e liberado
      }
      esperando = true;
      setTimeout(() => esperando = false, 6000);
    });
}

function salvarCheckin(nome) {
  const lista = JSON.parse(localStorage.getItem("checkins") || "[]");
  lista.push(nome);
  localStorage.setItem("checkins", JSON.stringify(lista));
}

function atualizarLista() {
  const lista = JSON.parse(localStorage.getItem("checkins") || "[]");
  const listaEl = document.getElementById("lista-validacoes");
  listaEl.innerHTML = "";
  lista.forEach(nome => {
    const li = document.createElement("li");
    li.textContent = nome;
    listaEl.appendChild(li);
  });
}

function resetarTudo() {
  localStorage.removeItem("checkins");
  codigosLidos = [];
  atualizarLista();
  document.getElementById("resultado").innerHTML = '<p class="invalido">Lista de check-ins zerada.</p>';
}

function exportarLista() {
  const lista = JSON.parse(localStorage.getItem("checkins") || "[]");
  const csvContent = "data:text/csv;charset=utf-8," + lista.map(nome => `${nome}`).join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "checkins.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function startScanner() {
  scanner = new Html5Qrcode("reader");
  const config = { fps: 10, qrbox: 250 };

  scanner.start(
    { facingMode: "environment" },
    config,
    (decodedText) => {
      const codigo = decodedText.includes("codigo=") ? decodedText.split("codigo=")[1] : decodedText;

      if (esperando) return;

      // a checagem de "já lido" será feita após verificar se é válido
      validarCodigo(codigo);
    },
    (errorMessage) => { }
  ).catch(err => {
    document.getElementById('resultado').innerHTML = '<p class="invalido">Erro ao iniciar câmera.</p>';
  });
}

startScanner();
atualizarLista();
