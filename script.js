let income = Number(localStorage.getItem("income")) || 0;
let expenses = JSON.parse(localStorage.getItem("expenses")) || [];
let chart;

function saveIncome() {
  income = Number(document.getElementById("income").value);
  localStorage.setItem("income", income);
  update();
}

function addExpense() {
  const desc = document.getElementById("desc");
  const amount = document.getElementById("amount");

  if (!desc.value || !amount.value) return;

  expenses.push({
    desc: desc.value,
    value: Number(amount.value),
    date: new Date().toLocaleDateString()
  });

  localStorage.setItem("expenses", JSON.stringify(expenses));

  desc.value = "";
  amount.value = "";

  update();
}

function update() {
  const totalExpense = expenses.reduce((s, e) => s + e.value, 0);

  document.getElementById("totalIncome").textContent = income;
  document.getElementById("totalExpense").textContent = totalExpense;
  document.getElementById("balance").textContent = income - totalExpense;

  const history = document.getElementById("history");
  history.innerHTML = "";

  expenses.forEach(e => {
    const li = document.createElement("li");
    li.textContent = `${e.desc} | R$ ${e.value} | ${e.date}`;
    history.appendChild(li);
  });

  renderChart(income, totalExpense);
}

function renderChart(i, e) {
  if (chart) chart.destroy();
  chart = new Chart(document.getElementById("chart"), {
    type: "doughnut",
    data: {
      labels: ["Renda", "Despesas"],
      datasets: [{ data: [i, e] }]
    }
  });
}

async function exportPDF() {
  const area = document.getElementById("pdfArea");
  const canvas = await html2canvas(area, { scale: 2 });
  const img = canvas.toDataURL("image/png");

  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF("p", "mm", "a4");

  pdf.addImage(img, "PNG", 10, 10, 190, 0);
  pdf.text("MoneyZen CS - Desenvolvido por C. Silva", 10, 290);

  pdf.save("MoneyZen-CS-Relatorio.pdf");
}

function clearAll() {
  if (confirm("Deseja apagar todos os dados?")) {
    localStorage.clear();
    location.reload();
  }
}

/* Tema */
document.getElementById("toggleTheme").onclick = () => {
  document.body.classList.toggle("dark");
  localStorage.setItem("theme", document.body.className);
};

if (localStorage.getItem("theme")) {
  document.body.className = localStorage.getItem("theme");
}

/* PWA */
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./service-worker.js");
}

let deferredPrompt;
const installBtn = document.getElementById("installBtn");

window.addEventListener("beforeinstallprompt", e => {
  e.preventDefault();
  deferredPrompt = e;
  installBtn.hidden = false;
});

installBtn.onclick = async () => {
  deferredPrompt.prompt();
};

update();