/* ===============================
   ESTADO GLOBAL
================================ */
let income = Number(localStorage.getItem("income")) || 0;
let expenses = JSON.parse(localStorage.getItem("expenses")) || [];
let chart = null;

/* ===============================
   ELEMENTOS
================================ */
const incomeInput = document.getElementById("income");
const descInput = document.getElementById("desc");
const amountInput = document.getElementById("amount");
const historyList = document.getElementById("history");
const installBtn = document.getElementById("installBtn");

/* ===============================
   RENDA
================================ */
function saveIncome() {
  const value = Number(incomeInput.value);
  if (!value || value <= 0) return;
  income = value;
  localStorage.setItem("income", income);
  updateUI();
}

/* ===============================
   DESPESAS
================================ */
function addExpense() {
  const desc = descInput.value.trim();
  const value = Number(amountInput.value);
  if (!desc || !value || value <= 0) return;

  expenses.push({
    desc,
    value,
    date: new Date().toLocaleDateString("pt-BR")
  });

  localStorage.setItem("expenses", JSON.stringify(expenses));
  descInput.value = "";
  amountInput.value = "";
  updateUI();
}

/* ===============================
   UI
================================ */
function updateUI() {
  const totalExpense = expenses.reduce((s, e) => s + e.value, 0);
  document.getElementById("totalIncome").textContent = income.toFixed(2);
  document.getElementById("totalExpense").textContent = totalExpense.toFixed(2);
  document.getElementById("balance").textContent = (income - totalExpense).toFixed(2);
  renderHistory();
  renderChart(income, totalExpense);
}

function renderHistory() {
  historyList.innerHTML = "";
  expenses.forEach(e => {
    const li = document.createElement("li");
    li.textContent = `${e.desc} | R$ ${e.value.toFixed(2)} | ${e.date}`;
    historyList.appendChild(li);
  });
}

/* ===============================
   GRÁFICO
================================ */
function renderChart(i, e) {
  const ctx = document.getElementById("chart");
  if (chart) chart.destroy();
  chart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Renda", "Despesas"],
      datasets: [{ data: [i, e] }]
    },
    options: {
      plugins: { legend: { position: "bottom" } }
    }
  });
}

/* ===============================
   PDF PREMIUM ENTERPRISE
================================ */
function exportPDF() {
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF("p", "mm", "a4");

  const totalExpense = expenses.reduce((s, e) => s + e.value, 0);
  const balance = income - totalExpense;

  let y = 15;

  /* CABEÇALHO */
  pdf.setFillColor(15, 118, 110);
  pdf.rect(0, 0, 210, 25, "F");
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(18);
  pdf.text("MoneyZen CS", 105, 16, { align: "center" });

  pdf.setFontSize(10);
  pdf.text("Relatório Financeiro", 105, 22, { align: "center" });

  pdf.setTextColor(0, 0, 0);
  y = 35;

  /* RESUMO */
  pdf.setFontSize(14);
  pdf.text("Resumo Financeiro", 10, y);
  y += 8;

  pdf.setFontSize(11);
  pdf.text(`Renda: R$ ${income.toFixed(2)}`, 10, y);
  pdf.text(`Despesas: R$ ${totalExpense.toFixed(2)}`, 70, y);
  pdf.text(`Saldo: R$ ${balance.toFixed(2)}`, 140, y);
  y += 12;

  /* GRÁFICO */
  const chartImg = document.getElementById("chart").toDataURL("image/png", 1.0);
  pdf.addImage(chartImg, "PNG", 55, y, 100, 80);
  y += 90;

  /* HISTÓRICO */
  pdf.setFontSize(14);
  pdf.text("Histórico de Despesas", 10, y);
  y += 6;

  pdf.setFontSize(10);
  expenses.forEach((e, i) => {
    if (y > 260) return;
    pdf.text(
      `${i + 1}. ${e.desc}`,
      10,
      y
    );
    pdf.text(
      `R$ ${e.value.toFixed(2)}`,
      130,
      y,
      { align: "right" }
    );
    pdf.text(
      e.date,
      190,
      y,
      { align: "right" }
    );
    y += 5;
  });

  /* ASSINATURA */
  pdf.setFontSize(9);
  pdf.text(
    `Gerado em ${new Date().toLocaleDateString("pt-BR")} | Desenvolvido por C. Silva`,
    105,
    290,
    { align: "center" }
  );

  pdf.save("MoneyZen-CS-Relatorio-Premium.pdf");
}

/* ===============================
   LIMPAR
================================ */
function clearAll() {
  if (!confirm("Deseja apagar todos os dados?")) return;
  localStorage.clear();
  location.reload();
}

/* ===============================
   TEMA
================================ */
document.getElementById("toggleTheme").onclick = () => {
  document.body.classList.toggle("dark");
  localStorage.setItem("theme", document.body.className);
};

if (localStorage.getItem("theme")) {
  document.body.className = localStorage.getItem("theme");
}

/* ===============================
   PWA
================================ */
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js");
  });
}

let deferredPrompt;
window.addEventListener("beforeinstallprompt", e => {
  e.preventDefault();
  deferredPrompt = e;
  installBtn.hidden = false;
});

installBtn.onclick = () => {
  if (deferredPrompt) deferredPrompt.prompt();
};

/* ===============================
   INIT
================================ */
updateUI();