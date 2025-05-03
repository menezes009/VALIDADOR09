
let ultimaLeitura = "";

function validarCodigo(codigo) {
  fetch('data.json')
    .then(response => response.json())
    .then(data => {
      const resultadoEl = document.getElementById('resultado');
      const listaEl = document.getElementById('lista-validacoes');
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
      }

      setTimeout(() => {
        startScanner(); // reinicia a câmera após leitura
      }, 2000);
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

function desfazerUltimo() {
  const lista = JSON.parse(localStorage.getItem("checkins") || "[]");
  lista.pop();
  localStorage.setItem("checkins", JSON.stringify(lista));
  atualizarLista();
  document.getElementById("resultado").innerHTML = '<p class="invalido">Último check-in removido.</p>';
}

function resetarTudo() {
  localStorage.removeItem("checkins");
  atualizarLista();
  document.getElementById("resultado").innerHTML = '<p class="invalido">Lista de check-ins zerada.</p>';
}

let scanner;

function startScanner() {
  if (scanner) {
    scanner.stop().then(() => {
      iniciar();
    }).catch(() => {
      iniciar();
    });
  } else {
    iniciar();
  }
}

function iniciar() {
  scanner = new Html5Qrcode("reader");
  const config = { fps: 10, qrbox: 250 };

  scanner.start(
    { facingMode: "environment" },
    config,
    (decodedText, decodedResult) => {
      if (decodedText !== ultimaLeitura) {
        ultimaLeitura = decodedText;
        scanner.stop().then(() => {
          const codigo = decodedText.includes("codigo=") ? decodedText.split("codigo=")[1] : decodedText;
          validarCodigo(codigo);
        });
      }
    },
    (errorMessage) => { }
  ).catch(err => {
    document.getElementById('resultado').innerHTML = '<p class="invalido">Erro ao iniciar câmera.</p>';
  });
}

startScanner();
atualizarLista();
