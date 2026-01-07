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

  // Limpa campos
  descInput.value = "";
  amountInput.value = "";

  updateUI();
}

/* ===============================
   ATUALIZA INTERFACE
================================ */
function updateUI() {
  const totalExpense = expenses.reduce((sum, e) => sum + e.value, 0);
  const balance = income - totalExpense;

  document.getElementById("totalIncome").textContent = income.toFixed(2);
  document.getElementById("totalExpense").textContent = totalExpense.toFixed(2);
  document.getElementById("balance").textContent = balance.toFixed(2);

  renderHistory();
  renderChart(income, totalExpense);
}

/* ===============================
   HISTÓRICO
   (primeira despesa no topo)
================================ */
function renderHistory() {
  historyList.innerHTML = "";

  expenses.forEach(exp => {
    const li = document.createElement("li");
    li.textContent = `${exp.desc} | R$ ${exp.value.toFixed(2)} | ${exp.date}`;
    historyList.appendChild(li);
  });
}

/* ===============================
   GRÁFICO
================================ */
function renderChart(income, expense) {
  const ctx = document.getElementById("chart");

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Renda", "Despesas"],
      datasets: [{
        data: [income, expense]
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "bottom"
        }
      }
    }
  });
}

/* ===============================
   LIMPAR DADOS
================================ */
function clearAll() {
  if (!confirm("Deseja apagar todos os dados?")) return;

  localStorage.clear();
  location.reload();
}

/* ===============================
   PDF AVANÇADO (1 FOLHA)
================================ */
async function exportPDF() {
  const area = document.getElementById("pdfArea");
  const canvas = await html2canvas(area, { scale: 2 });
  const imgData = canvas.toDataURL("image/png");

  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF("p", "mm", "a4");

  pdf.addImage(imgData, "PNG", 10, 10, 190, 0);
  pdf.setFontSize(10);
  pdf.text(
    "MoneyZen CS | Desenvolvido por C. Silva | " + new Date().toLocaleDateString("pt-BR"),
    10,
    290
  );

  pdf.save("MoneyZen-CS-Relatorio.pdf");
}

/* ===============================
   TEMA CLARO / ESCURO
================================ */
document.getElementById("toggleTheme").onclick = () => {
  document.body.classList.toggle("dark");
  localStorage.setItem("theme", document.body.className);
};

if (localStorage.getItem("theme")) {
  document.body.className = localStorage.getItem("theme");
}

/* ===============================
   PWA - SERVICE WORKER
================================ */
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js");
  });
}

/* ===============================
   BOTÃO INSTALAR APP
================================ */
let deferredPrompt;

window.addEventListener("beforeinstallprompt", event => {
  event.preventDefault();
  deferredPrompt = event;
  installBtn.hidden = false;
});

installBtn.addEventListener("click", async () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  deferredPrompt = null;
  installBtn.hidden = true;
});

/* ===============================
   INICIALIZAÇÃO
================================ */
updateUI();