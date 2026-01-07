let transactions = JSON.parse(localStorage.getItem('moneyzen')) || [];
let chart;

const toggleTheme = document.getElementById('toggleTheme');

toggleTheme.onclick = () => {
  document.body.classList.toggle('dark');
  localStorage.setItem('theme', document.body.classList.contains('dark'));
};

if (localStorage.getItem('theme') === 'true') {
  document.body.classList.add('dark');
}

function addTransaction() {
  if (!date.value || !desc.value || !value.value) return;

  transactions.push({
    date: date.value,
    desc: desc.value,
    value: Number(value.value),
    type: type.value,
    category: category.value
  });

  save();
}

function save() {
  localStorage.setItem('moneyzen', JSON.stringify(transactions));
  render();
}

function render() {
  history.innerHTML = '';
  let income = 0, expense = 0;

  transactions.forEach(t => {
    t.type === 'income' ? income += t.value : expense += t.value;

    history.innerHTML += `
      <div>
        ${t.date} • ${t.desc} • ${t.category} • R$ ${t.value.toFixed(2)}
      </div>
    `;
  });

  summary.innerHTML = `
    <h3>Resumo Final</h3>
    <p>Total de Rendas: R$ ${income.toFixed(2)}</p>
    <p>Total de Despesas: R$ ${expense.toFixed(2)}</p>
    <p><strong>Saldo Final: R$ ${(income - expense).toFixed(2)}</strong></p>
  `;

  drawChart(income, expense);
}

function drawChart(income, expense) {
  if (chart) chart.destroy();

  chart = new Chart(document.getElementById('chart'), {
    type: 'pie',
    data: {
      labels: ['Rendas', 'Despesas'],
      datasets: [{
        data: [income, expense]
      }]
    }
  });
}

function exportCSV() {
  let csv = 'Data,Descrição,Categoria,Tipo,Valor\n';
  transactions.forEach(t => {
    csv += `${t.date},${t.desc},${t.category},${t.type},${t.value}\n`;
  });

  download(csv, 'MoneyZen-CS.csv', 'text/csv');
}

function exportPDF() {
  const element = document.body;
  html2pdf().from(element).set({
    filename: 'MoneyZen-CS-Relatorio.pdf',
    margin: 0.5
  }).save();
}

function clearAll() {
  if (confirm('Deseja apagar todo o histórico?')) {
    transactions = [];
    save();
  }
}

function download(content, filename, type) {
  const blob = new Blob([content], { type });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
}

render();
