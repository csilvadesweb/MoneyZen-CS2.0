let data = JSON.parse(localStorage.getItem('moneyzen')) || [];
let chart;

const themeBtn = document.getElementById('toggleTheme');
themeBtn.onclick = () => {
  document.body.classList.toggle('dark');
  localStorage.setItem('theme', document.body.classList.contains('dark'));
};

if (localStorage.getItem('theme') === 'true')
  document.body.classList.add('dark');

function addTransaction() {
  if (!date.value || !desc.value || !value.value) return;

  data.push({
    date: date.value,
    desc: desc.value,
    value: Number(value.value),
    type: type.value,
    category: category.value
  });

  // LIMPA CAMPOS
  desc.value = '';
  value.value = '';

  save();
}

function save() {
  localStorage.setItem('moneyzen', JSON.stringify(data));
  render();
}

function render() {
  history.innerHTML = '';
  let income = 0, expense = 0;

  data.forEach(t => {
    t.type === 'income' ? income += t.value : expense += t.value;

    history.innerHTML += `
      <div>
        ${t.date} • ${t.desc} • ${t.category} • R$ ${t.value.toFixed(2)}
      </div>`;
  });

  summary.innerHTML = `
    <h3>Resumo Financeiro</h3>
    <p>Rendas: R$ ${income.toFixed(2)}</p>
    <p>Despesas: R$ ${expense.toFixed(2)}</p>
    <p><strong>Saldo: R$ ${(income-expense).toFixed(2)}</strong></p>
  `;

  drawChart(income, expense);
}

function drawChart(i,e){
  if(chart) chart.destroy();
  chart = new Chart(chartEl,{
    type:'doughnut',
    data:{
      labels:['Rendas','Despesas'],
      datasets:[{data:[i,e]}]
    }
  });
}

const chartEl = document.getElementById('chart');

function exportCSV(){
  let csv='Data,Descrição,Categoria,Tipo,Valor\n';
  data.forEach(t=>{
    csv+=`${t.date},${t.desc},${t.category},${t.type},${t.value}\n`;
  });
  download(csv,'MoneyZen-CS.csv','text/csv');
}

function exportPDF(){
  html2pdf().from(document.getElementById('report')).set({
    filename:'MoneyZen-CS-Relatorio.pdf',
    margin:0.5
  }).save();
}

function clearAll(){
  if(confirm('Apagar tudo?')){
    data=[];
    save();
  }
}

function download(c,f,t){
  const a=document.createElement('a');
  a.href=URL.createObjectURL(new Blob([c],{type:t}));
  a.download=f;
  a.click();
}

render();