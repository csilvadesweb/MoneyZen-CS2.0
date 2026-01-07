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
   ATUALIZA UI
================================ */
function updateUI() {
  const totalExpense = expenses.reduce((s, e) => s + e.value, 0);
  const balance = income - totalExpense;

  document.getElementById("totalIncome").textContent = income.toFixed(2);
  document.getElementById("totalExpense").textContent = totalExpense.toFixed(2);
  document.getElementById("balance").textContent = balance.toFixed(2);

  renderHistory();
  renderChart(income, totalExpense);
}

/* ===============================
   HISTÓRICO
================================ */
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
      plugins: {
        legend: { position: "bottom" }
      }
    }
  });
}

/* ===============================
   PDF ENTERPRISE (1 PÁGINA)
================================ */
function exportPDF() {
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF("p", "mm", "a4");

  let y = 15;

  /* TÍTULO */
  pdf.setFontSize(18);
  pdf.text("MoneyZen CS - Relatório Financeiro", 105, y, { align: "center" });
  y += 10;

  pdf.setFontSize(11);
  pdf.text(`Data: ${new Date().toLocaleDateString("pt-BR")}`, 105, y, { align: "center" });
  y += 12;

  /* RESUMO */
  pdf.setFontSize(14);
  pdf.text("Resumo Financeiro", 10, y);
  y += 6;

  pdf.setFontSize(11);
  pdf.text(`Renda: R$ ${income.toFixed(2)}`, 10, y);
  y += 6;
  pdf.text(`Despesas: R$ ${expenses.reduce((s, e) => s + e.value, 0).toFixed(2)}`, 10, y);
  y += 6;
  pdf.text(`Saldo: R$ ${(income - expenses.reduce((s, e) => s + e.value, 0)).toFixed(2)}`, 10, y);
  y += 10;

  /* GRÁFICO */
  const chartCanvas = document.getElementById("chart");
  const chartImg = chartCanvas.toDataURL("image/png", 1.0);
  pdf.addImage(chartImg, "PNG", 110, 45, 80, 80);

  /* HISTÓRICO */
  y += 5;
  pdf.setFontSize(14);
  pdf.text("Histórico de Despesas", 10, y);
  y += 6;

  pdf.setFontSize(10);

  expenses.forEach((e, index) => {
    if (y > 265) return; // mantém em 1 página
    pdf.text(
      `${index + 1}. ${e.desc} | R$ ${e.value.toFixed(2)} | ${e.date}`,
      10,
      y
    );
    y += 5;
  });

  /* ASSINATURA */
  pdf.setFontSize(9);
  pdf.text(
    "Desenvolvido por C. Silva – MoneyZen CS",
    105,
    290,
    { align: "center" }
  );

  pdf.save("MoneyZen-CS-Relatorio.pdf");
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
  if (deferredPrompt) {
    deferredPrompt.prompt();
    deferredPrompt = null;
  }
};

/* ===============================
   INIT
================================ */
updateUI();