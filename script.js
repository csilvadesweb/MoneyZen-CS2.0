/* =====================================================
   MoneyZen CS - Script Oficial
   © C.Silva - Uso Proprietário
   ===================================================== */

let renda = 0;
let despesas = [];
let chart = null;

/* =====================
   LOCAL STORAGE
===================== */
function salvarDados() {
  localStorage.setItem("moneyzen_renda", renda);
  localStorage.setItem("moneyzen_despesas", JSON.stringify(despesas));
}

function carregarDados() {
  renda = Number(localStorage.getItem("moneyzen_renda")) || 0;
  despesas = JSON.parse(localStorage.getItem("moneyzen_despesas")) || [];
}

/* =====================
   UTILIDADES
===================== */
function formatarMoeda(valor) {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

function dataAtual() {
  return new Date().toLocaleDateString("pt-BR");
}

/* =====================
   RENDA
===================== */
function salvarRenda() {
  const input = document.getElementById("inputRenda");
  const valor = Number(input.value);

  if (!valor || valor <= 0) return;

  renda = valor;
  input.value = "";
  salvarDados();
  atualizarTela();
}

/* =====================
   DESPESAS
===================== */
function salvarDespesa() {
  const nome = document.getElementById("inputDespesaNome").value.trim();
  const valor = Number(document.getElementById("inputDespesaValor").value);

  if (!nome || !valor || valor <= 0) return;

  despesas.push({
    nome,
    valor,
    data: dataAtual()
  });

  document.getElementById("inputDespesaNome").value = "";
  document.getElementById("inputDespesaValor").value = "";

  salvarDados();
  atualizarTela();
}

/* =====================
   RESUMO
===================== */
function totalDespesas() {
  return despesas.reduce((acc, d) => acc + d.valor, 0);
}

function saldoFinal() {
  return renda - totalDespesas();
}

/* =====================
   HISTÓRICO
===================== */
function renderHistorico() {
  const lista = document.getElementById("historico");
  lista.innerHTML = "";

  despesas.forEach((d) => {
    const item = document.createElement("div");
    item.className = "historico-item";
    item.innerHTML = `
      <span>${d.nome}<br><small>${d.data}</small></span>
      <strong>${formatarMoeda(d.valor)}</strong>
    `;
    lista.appendChild(item);
  });
}

/* =====================
   GRÁFICO
===================== */
function renderGrafico() {
  const ctx = document.getElementById("grafico").getContext("2d");

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Renda", "Despesas"],
      datasets: [{
        data: [renda, totalDespesas()],
        backgroundColor: ["#0f4c6a", "#d9534f"]
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: "bottom" }
      }
    }
  });
}

/* =====================
   PDF PROFISSIONAL (1 FOLHA)
===================== */
async function exportarPDF() {
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF("p", "mm", "a4");

  let y = 15;

  pdf.setFontSize(18);
  pdf.text("MoneyZen CS - Relatório Financeiro", 105, y, { align: "center" });

  y += 10;
  pdf.setFontSize(11);
  pdf.text(`Data: ${dataAtual()}`, 105, y, { align: "center" });

  y += 12;
  pdf.setFontSize(13);
  pdf.text("Resumo", 10, y);

  y += 8;
  pdf.setFontSize(11);
  pdf.text(`Renda: ${formatarMoeda(renda)}`, 10, y);
  y += 6;
  pdf.text(`Despesas: ${formatarMoeda(totalDespesas())}`, 10, y);
  y += 6;
  pdf.text(`Saldo: ${formatarMoeda(saldoFinal())}`, 10, y);

  y += 10;
  const canvas = document.getElementById("grafico");
  const imgData = canvas.toDataURL("image/png");
  pdf.addImage(imgData, "PNG", 110, 45, 80, 80);

  y += 40;
  pdf.setFontSize(13);
  pdf.text("Histórico de Despesas", 10, y);

  y += 8;
  pdf.setFontSize(10);

  despesas.forEach((d) => {
    if (y > 270) return;
    pdf.text(`${d.data} - ${d.nome} - ${formatarMoeda(d.valor)}`, 10, y);
    y += 6;
  });

  pdf.setFontSize(9);
  pdf.text("Assinatura: MoneyZen CS © C.Silva", 105, 290, { align: "center" });

  pdf.save("MoneyZen-CS-Relatorio.pdf");
}

/* =====================
   LIMPAR DADOS
===================== */
function limparTudo() {
  if (!confirm("Deseja apagar todos os dados?")) return;
  renda = 0;
  despesas = [];
  salvarDados();
  atualizarTela();
}

/* =====================
   DARK MODE
===================== */
function alternarTema() {
  document.body.classList.toggle("dark");
  localStorage.setItem(
    "moneyzen_tema",
    document.body.classList.contains("dark") ? "dark" : "light"
  );
}

function carregarTema() {
  const tema = localStorage.getItem("moneyzen_tema");
  if (tema === "dark") document.body.classList.add("dark");
}

/* =====================
   ATUALIZAÇÃO GERAL
===================== */
function atualizarTela() {
  document.getElementById("valorRenda").innerText = formatarMoeda(renda);
  document.getElementById("valorDespesas").innerText = formatarMoeda(totalDespesas());
  document.getElementById("valorSaldo").innerText = formatarMoeda(saldoFinal());

  renderHistorico();
  renderGrafico();
}

/* =====================
   INIT
===================== */
window.onload = () => {
  carregarDados();
  carregarTema();
  atualizarTela();
};