/* =====================================================
   MoneyZen CS - Script Oficial
   © C.Silva - Uso Proprietário
   ===================================================== */

let rendas = [];
let despesas = [];
let chart = null;

/* =====================
   LOCAL STORAGE
===================== */
function salvarDados() {
  localStorage.setItem("moneyzen_rendas", JSON.stringify(rendas));
  localStorage.setItem("moneyzen_despesas", JSON.stringify(despesas));
}

function carregarDados() {
  rendas = JSON.parse(localStorage.getItem("moneyzen_rendas")) || [];
  despesas = JSON.parse(localStorage.getItem("moneyzen_despesas")) || [];
}

/* =====================
   UTILIDADES
===================== */
function moeda(valor) {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

function dataAtual() {
  return new Date().toLocaleDateString("pt-BR");
}

/* =====================
   RENDAS
===================== */
function salvarRenda() {
  const nome = document.getElementById("inputRendaNome").value.trim();
  const valor = Number(document.getElementById("inputRendaValor").value);

  if (!nome || valor <= 0) return;

  rendas.push({
    nome,
    valor,
    data: dataAtual()
  });

  document.getElementById("inputRendaNome").value = "";
  document.getElementById("inputRendaValor").value = "";

  salvarDados();
  atualizarTela();
}

/* =====================
   DESPESAS
===================== */
function salvarDespesa() {
  const nome = document.getElementById("inputDespesaNome").value.trim();
  const valor = Number(document.getElementById("inputDespesaValor").value);

  if (!nome || valor <= 0) return;

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
   CÁLCULOS
===================== */
function totalRendas() {
  return rendas.reduce((acc, r) => acc + r.valor, 0);
}

function totalDespesas() {
  return despesas.reduce((acc, d) => acc + d.valor, 0);
}

function saldoFinal() {
  return totalRendas() - totalDespesas();
}

/* =====================
   HISTÓRICO
===================== */
function renderHistorico() {
  const lista = document.getElementById("historico");
  lista.innerHTML = "";

  const itens = [
    ...rendas.map(r => ({ ...r, tipo: "Renda" })),
    ...despesas.map(d => ({ ...d, tipo: "Despesa" }))
  ];

  itens.forEach(i => {
    const div = document.createElement("div");
    div.className = "historico-item";
    div.innerHTML = `
      <span>${i.tipo}: ${i.nome}<br><small>${i.data}</small></span>
      <strong>${moeda(i.valor)}</strong>
    `;
    lista.appendChild(div);
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
      labels: ["Rendas", "Despesas"],
      datasets: [{
        data: [totalRendas(), totalDespesas()],
        backgroundColor: ["#0f4c75", "#d9534f"]
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
   PDF PROFISSIONAL (PADRÃO EXECUTIVO)
===================== */
function exportarPDF() {
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF("p", "mm", "a4");

  let y = 20;

  // TÍTULO
  pdf.setFontSize(18);
  pdf.text("MoneyZen CS – Relatório Financeiro", 105, y, { align: "center" });

  y += 8;
  pdf.setFontSize(11);
  pdf.text(`Data: ${dataAtual()}`, 105, y, { align: "center" });

  // Linha
  y += 6;
  pdf.setLineWidth(0.5);
  pdf.line(10, y, 200, y);

  // RESUMO
  y += 10;
  pdf.setFontSize(14);
  pdf.text("Resumo Geral", 10, y);

  y += 8;
  pdf.setFontSize(11);
  pdf.text(`Renda Total: ${moeda(totalRendas())}`, 10, y);
  y += 6;
  pdf.text(`Despesas Totais: ${moeda(totalDespesas())}`, 10, y);
  y += 6;
  pdf.text(`Saldo Final: ${moeda(saldoFinal())}`, 10, y);

  // RENDAS
  y += 10;
  pdf.setFontSize(13);
  pdf.text("Rendas", 10, y);

  y += 6;
  pdf.setFontSize(10);

  if (rendas.length === 0) {
    pdf.text("Nenhuma renda cadastrada.", 10, y);
    y += 6;
  } else {
    rendas.forEach(r => {
      pdf.text(`${r.data} - ${r.nome} - ${moeda(r.valor)}`, 10, y);
      y += 6;
    });
  }

  // DESPESAS
  y += 6;
  pdf.setFontSize(13);
  pdf.text("Histórico de Despesas", 10, y);

  y += 6;
  pdf.setFontSize(10);

  if (despesas.length === 0) {
    pdf.text("Nenhuma despesa cadastrada.", 10, y);
  } else {
    despesas.forEach(d => {
      if (y > 270) return;
      pdf.text(`${d.data} - ${d.nome} - ${moeda(d.valor)}`, 10, y);
      y += 6;
    });
  }

  // RODAPÉ
  pdf.setFontSize(9);
  pdf.text(
    "Assinatura: MoneyZen CS © C.Silva",
    105,
    290,
    { align: "center" }
  );

  pdf.save("MoneyZen-CS-Relatorio-Financeiro.pdf");
}

/* =====================
   LIMPAR DADOS
===================== */
function limparTudo() {
  if (!confirm("Deseja apagar todos os dados?")) return;
  rendas = [];
  despesas = [];
  salvarDados();
  atualizarTela();
}

/* =====================
   TEMA
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
  document.getElementById("valorRenda").innerText = moeda(totalRendas());
  document.getElementById("valorDespesas").innerText = moeda(totalDespesas());
  document.getElementById("valorSaldo").innerText = moeda(saldoFinal());

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