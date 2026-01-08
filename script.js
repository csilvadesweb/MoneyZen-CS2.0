// ===============================
// MoneyZen CS - Script Oficial
// Autor: C. Silva
// ===============================

// ---------- ELEMENTOS ----------
const rendaForm = document.getElementById("renda-form");
const despesaForm = document.getElementById("despesa-form");

const rendaDescricao = document.getElementById("renda-descricao");
const rendaValor = document.getElementById("renda-valor");

const despesaDescricao = document.getElementById("despesa-descricao");
const despesaValor = document.getElementById("despesa-valor");

const totalRendaEl = document.getElementById("total-renda");
const totalDespesaEl = document.getElementById("total-despesa");
const saldoEl = document.getElementById("saldo");

const listaDespesas = document.getElementById("lista-despesas");

// ---------- ESTADO ----------
let rendas = JSON.parse(localStorage.getItem("rendas")) || [];
let despesas = JSON.parse(localStorage.getItem("despesas")) || [];

// ---------- UTIL ----------
function salvarDados() {
  localStorage.setItem("rendas", JSON.stringify(rendas));
  localStorage.setItem("despesas", JSON.stringify(despesas));
}

function formatarMoeda(valor) {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function hoje() {
  return new Date().toLocaleDateString("pt-BR");
}

// ---------- TOTAIS ----------
function totalRendas() {
  return rendas.reduce((t, r) => t + r.valor, 0);
}

function totalDespesas() {
  return despesas.reduce((t, d) => t + d.valor, 0);
}

function atualizarResumo() {
  totalRendaEl.textContent = formatarMoeda(totalRendas());
  totalDespesaEl.textContent = formatarMoeda(totalDespesas());
  saldoEl.textContent = formatarMoeda(totalRendas() - totalDespesas());
}

// ---------- RENDER ----------
function renderDespesas() {
  listaDespesas.innerHTML = "";
  despesas
    .slice()
    .reverse()
    .forEach((d) => {
      const li = document.createElement("li");
      li.textContent = `${d.data} - ${d.descricao} - ${formatarMoeda(
        d.valor
      )}`;
      listaDespesas.appendChild(li);
    });
}

// ---------- EVENTOS ----------
rendaForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const descricao = rendaDescricao.value.trim();
  const valor = parseFloat(rendaValor.value);

  if (!descricao || valor <= 0) return;

  rendas.push({
    descricao,
    valor,
    data: hoje(),
  });

  salvarDados();
  atualizarResumo();

  rendaDescricao.value = "";
  rendaValor.value = "";
});

despesaForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const descricao = despesaDescricao.value.trim();
  const valor = parseFloat(despesaValor.value);

  if (!descricao || valor <= 0) return;

  despesas.push({
    descricao,
    valor,
    data: hoje(),
  });

  salvarDados();
  atualizarResumo();
  renderDespesas();

  despesaDescricao.value = "";
  despesaValor.value = "";
});

// ---------- PDF PROFISSIONAL ----------
function gerarPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text("MoneyZen CS - Relatório Financeiro", 14, 20);
  doc.setFontSize(10);
  doc.text(`Data: ${hoje()}`, 14, 28);

  doc.setFontSize(12);
  doc.text("Resumo", 14, 40);
  doc.setFontSize(10);

  doc.text(`Renda: ${formatarMoeda(totalRendas())}`, 14, 48);
  doc.text(`Despesas: ${formatarMoeda(totalDespesas())}`, 14, 55);
  doc.text(
    `Saldo: ${formatarMoeda(totalRendas() - totalDespesas())}`,
    14,
    62
  );

  let y = 75;
  doc.setFontSize(12);
  doc.text("Histórico de Despesas", 14, y);

  y += 8;
  doc.setFontSize(10);

  despesas.forEach((d) => {
    doc.text(
      `${d.data} - ${d.descricao} - ${formatarMoeda(d.valor)}`,
      14,
      y
    );
    y += 6;
  });

  doc.setFontSize(9);
  doc.text(
    "Assinatura: MoneyZen CS • C. Silva",
    14,
    290
  );

  doc.save("MoneyZen-CS-Relatorio.pdf");
}

// ---------- INIT ----------
atualizarResumo();
renderDespesas();