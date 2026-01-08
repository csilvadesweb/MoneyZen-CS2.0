// ===============================
// MoneyZen CS - Script Principal
// Autor: C. Silva
// ===============================

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

function saldoFinal() {
  return totalRendas() - totalDespesas();
}

// ---------- PDF PROFISSIONAL ----------
function gerarPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF("p", "mm", "a4");

  // CORES
  const azul = [26, 115, 232];
  const cinza = [120, 120, 120];

  // HEADER
  doc.setFillColor(...azul);
  doc.rect(0, 0, 210, 25, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.text("MoneyZen CS – Relatório Financeiro", 14, 16);

  doc.setFontSize(10);
  doc.text(`Data: ${hoje()}`, 160, 16);

  // RESUMO
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(13);
  doc.text("Resumo Financeiro", 14, 35);

  doc.setFontSize(11);
  doc.text(`Renda Total: ${formatarMoeda(totalRendas())}`, 14, 45);
  doc.text(`Despesas Totais: ${formatarMoeda(totalDespesas())}`, 14, 52);
  doc.text(`Saldo Final: ${formatarMoeda(saldoFinal())}`, 14, 59);

  // GRÁFICO (SIMPLIFICADO)
  doc.setDrawColor(...azul);
  doc.setFillColor(230, 240, 255);

  const baseX = 120;
  const baseY = 65;

  const rendaBar = Math.min(totalRendas() / 50, 50);
  const despesaBar = Math.min(totalDespesas() / 50, 50);

  doc.text("Gráfico", baseX, baseY - 8);
  doc.rect(baseX, baseY, 15, -rendaBar, "F");
  doc.rect(baseX + 25, baseY, 15, -despesaBar, "F");

  doc.setFontSize(9);
  doc.text("Renda", baseX, baseY + 5);
  doc.text("Despesa", baseX + 22, baseY + 5);

  // HISTÓRICO DE DESPESAS
  let y = 85;
  doc.setFontSize(13);
  doc.text("Histórico de Despesas", 14, y);

  y += 8;
  doc.setFontSize(10);

  despesas.forEach((d) => {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
    doc.text(
      `${d.data} - ${d.descricao} - ${formatarMoeda(d.valor)}`,
      14,
      y
    );
    y += 6;
  });

  // RODAPÉ
  doc.setFontSize(9);
  doc.setTextColor(...cinza);
  doc.text(
    "Assinatura: MoneyZen CS • Desenvolvido por C. Silva",
    14,
    290
  );

  doc.save("MoneyZen-CS-Relatorio-Financeiro.pdf");
}

// ---------- EXEMPLO DE INSERÇÃO ----------
function adicionarRenda(descricao, valor) {
  rendas.push({ descricao, valor, data: hoje() });
  salvarDados();
}

function adicionarDespesa(descricao, valor) {
  despesas.push({ descricao, valor, data: hoje() });
  salvarDados();
}