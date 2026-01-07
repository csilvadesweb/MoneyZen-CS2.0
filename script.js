/* ========= BLINDAGEM ========= */
document.addEventListener("keydown", e => {
  if (e.ctrlKey && ["u","s","c","x","a"].includes(e.key.toLowerCase())) {
    e.preventDefault();
  }
});

/* ========= DADOS ========= */
let transactions = JSON.parse(localStorage.getItem("moneyzen")) || [];
let theme = localStorage.getItem("theme") || "dark";

if (theme === "light") document.body.classList.add("light");

/* ========= FUNÇÕES ========= */
function save() {
  localStorage.setItem("moneyzen", JSON.stringify(transactions));
}

function format(v) {
  return v.toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
}

function update() {
  const history = document.getElementById("history");
  history.innerHTML = "";

  let income = 0;
  let expense = 0;

  transactions.forEach(t => {
    const li = document.createElement("li");
    li.textContent = `${t.description} - ${format(t.amount)}`;
    history.appendChild(li);

    t.type === "income" ? income += t.amount : expense += t.amount;
  });

  document.getElementById("income").innerText = format(income);
  document.getElementById("expense").innerText = format(expense);
  document.getElementById("balance").innerText = format(income - expense);

  updateChart(income, expense);
}

function addTransaction() {
  const type = typeEl.value;
  const desc = description.value.trim();
  const value = Number(amount.value);

  if (!desc || value <= 0) return alert("Dados inválidos");

  transactions.unshift({type,description:desc,amount:value});
  save();
  update();

  description.value = "";
  amount.value = "";
}

/* ========= GRÁFICO ========= */
let chart;
function updateChart(income, expense) {
  const ctx = document.getElementById("financeChart");

  if (chart) chart.destroy();

  chart = new Chart(ctx,{
    type:"doughnut",
    data:{
      labels:["Renda","Despesas"],
      datasets:[{
        data:[income,expense],
        backgroundColor:["#22c55e","#ef4444"]
      }]
    }
  });
}

/* ========= PDF ========= */
function exportPDF() {
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF();

  pdf.text("MoneyZen CS - Relatório Financeiro",10,10);

  pdf.text(`Renda: ${income.innerText}`,10,25);
  pdf.text(`Despesas: ${expense.innerText}`,10,35);
  pdf.text(`Saldo: ${balance.innerText}`,10,45);

  let y = 60;
  transactions.forEach(t=>{
    pdf.text(`${t.description} - ${format(t.amount)}`,10,y);
    y+=8;
  });

  pdf.save("moneyzen-relatorio.pdf");
}

/* ========= TEMA ========= */
toggleTheme.onclick = () => {
  document.body.classList.toggle("light");
  localStorage.setItem("theme",
    document.body.classList.contains("light")?"light":"dark"
  );
};

/* ========= PWA ========= */
let deferredPrompt;
window.addEventListener("beforeinstallprompt",e=>{
  e.preventDefault();
  deferredPrompt=e;
  installBtn.hidden=false;
});
installBtn.onclick=()=>{
  deferredPrompt.prompt();
  deferredPrompt=null;
  installBtn.hidden=true;
};

update();