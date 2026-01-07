let data = JSON.parse(localStorage.getItem("moneyzen")) || [];
let chart;

const ctx = document.getElementById("chart").getContext("2d");

function save() {
  localStorage.setItem("moneyzen", JSON.stringify(data));
}

function addEntry() {
  if (!desc.value || !value.value) return;

  data.push({
    date: date.value,
    desc: desc.value,
    value: Number(value.value),
    type: type.value,
    category: category.value
  });

  desc.value = "";
  value.value = "";

  save();
  render();
}

function render() {
  history.innerHTML = "";
  let income = 0, expense = 0;

  data.forEach(e => {
    const li = document.createElement("li");
    li.textContent = `${e.date} | ${e.desc} | ${e.category} | R$ ${e.value}`;
    history.appendChild(li);

    e.type === "income" ? income += e.value : expense += e.value;
  });

  totalIncome.textContent = `R$ ${income}`;
  totalExpense.textContent = `R$ ${expense}`;
  balance.textContent = `R$ ${income - expense}`;

  if (chart) chart.destroy();
  chart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Renda", "Despesas"],
      datasets: [{ data: [income, expense] }]
    },
    options: { responsive: true, maintainAspectRatio: false }
  });
}

function exportCSV() {
  let csv = "Data,Descrição,Categoria,Tipo,Valor\n";
  data.forEach(e => {
    csv += `${e.date},${e.desc},${e.category},${e.type},${e.value}\n`;
  });

  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([csv]));
  a.download = "MoneyZen-CS.csv";
  a.click();
}

function exportPDF() {
  html2pdf().from(document.getElementById("app")).set({
    filename: "MoneyZen-CS-Relatorio.pdf",
    margin: 10,
    html2canvas: { scale: 2 },
    jsPDF: { orientation: "portrait" }
  }).save();
}

function clearAll() {
  if (confirm("Deseja apagar todo o histórico?")) {
    data = [];
    save();
    render();
  }
}

toggleTheme.onclick = () => document.body.classList.toggle("dark");

render();