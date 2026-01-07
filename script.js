let income = Number(localStorage.getItem("income")) || 0;
let expenses = JSON.parse(localStorage.getItem("expenses")) || [];
let chart;

const incomeEl = document.getElementById("income");
const descEl = document.getElementById("desc");
const amountEl = document.getElementById("amount");

function saveIncome() {
  income = Number(incomeEl.value);
  localStorage.setItem("income", income);
  update();
}

function addExpense() {
  if (!amountEl.value) return;
  expenses.unshift({
    desc: descEl.value,
    value: Number(amountEl.value),
    date: new Date().toLocaleString()
  });
  localStorage.setItem("expenses", JSON.stringify(expenses));
  descEl.value = "";
  amountEl.value = "";
  update();
}

function update() {
  const totalExpense = expenses.reduce((a, b) => a + b.value, 0);
  document.getElementById("totalIncome").textContent = income;
  document.getElementById("totalExpense").textContent = totalExpense;
  document.getElementById("balance").textContent = income - totalExpense;

  const history = document.getElementById("history");
  history.innerHTML = "";
  expenses.forEach(e => {
    const li = document.createElement("li");
    li.textContent = `${e.date} - ${e.desc}: R$ ${e.value}`;
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
      datasets: [{
        data: [i, e]
      }]
    }
  });
}

function clearAll() {
  if (!confirm("Deseja apagar todos os dados?")) return;
  localStorage.clear();
  location.reload();
}

function exportPDF() {
  window.print();
}

document.getElementById("toggleTheme").onclick = () => {
  document.body.classList.toggle("dark");
  localStorage.setItem("theme", document.body.className);
};

if (localStorage.getItem("theme")) {
  document.body.className = localStorage.getItem("theme");
}

update();

/* PWA */
let deferredPrompt;
window.addEventListener("beforeinstallprompt", e => {
  e.preventDefault();
  deferredPrompt = e;
  installBtn.hidden = false;
});

installBtn.onclick = async () => {
  deferredPrompt.prompt();
};