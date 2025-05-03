
let scanner;
let codigosLidos = [];
let ultimoCodigoLido = "";
let aguardando = false;

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
      } else if (codigosLidos.includes(codigo)) {
        resultadoEl.innerHTML = '<p class="usado">⛔ Código já lido nesta sessão.</p>';
      } else {
        resultadoEl.innerHTML = '<p class="ok">✅ Acesso liberado para ' + item.nome + '</p>';
        codigosLidos.push(codigo);
        salvarCheckin(item.nome);
        atualizarLista();
      }

      aguardando = true;
      setTimeout(() => {
        aguardando = false;
        ultimoCodigoLido = "";
      }, 6000);
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
  ultimoCodigoLido = "";
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

      if (aguardando || codigo === ultimoCodigoLido) return;

      ultimoCodigoLido = codigo;
      validarCodigo(codigo);
    },
    (errorMessage) => { }
  ).catch(err => {
    document.getElementById('resultado').innerHTML = '<p class="invalido">Erro ao iniciar câmera.</p>';
  });
}

startScanner();
atualizarLista();
