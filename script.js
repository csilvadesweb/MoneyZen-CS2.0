let rendas = [];
let despesas = [];
let chart;

function salvarDados() {
  localStorage.setItem("moneyzen_rendas", JSON.stringify(rendas));
  localStorage.setItem("moneyzen_despesas", JSON.stringify(despesas));
}

function carregarDados() {
  rendas = JSON.parse(localStorage.getItem("moneyzen_rendas")) || [];
  despesas = JSON.parse(localStorage.getItem("moneyzen_despesas")) || [];
}

const moeda = v => v.toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
const dataHoje = () => new Date().toLocaleDateString("pt-BR");

function salvarRenda() {
  const nome = inputRendaNome.value.trim();
  const valor = Number(inputRendaValor.value);
  if (!nome || valor <= 0) return;
  rendas.push({ nome, valor, data: dataHoje() });
  inputRendaNome.value = "";
  inputRendaValor.value = "";
  salvarDados(); atualizar();
}

function salvarDespesa() {
  const nome = inputDespesaNome.value.trim();
  const valor = Number(inputDespesaValor.value);
  if (!nome || valor <= 0) return;
  despesas.push({ nome, valor, data: dataHoje() });
  inputDespesaNome.value = "";
  inputDespesaValor.value = "";
  salvarDados(); atualizar();
}

const totalRendas = () => rendas.reduce((a,r)=>a+r.valor,0);
const totalDespesas = () => despesas.reduce((a,d)=>a+d.valor,0);

function atualizar() {
  valorRenda.innerText = moeda(totalRendas());
  valorDespesas.innerText = moeda(totalDespesas());
  valorSaldo.innerText = moeda(totalRendas() - totalDespesas());
  renderHistorico();
  renderGrafico();
}

function renderHistorico() {
  historico.innerHTML = "";
  [...rendas.map(r=>({...r,t:"Renda"})),...despesas.map(d=>({...d,t:"Despesa"}))]
  .forEach(i=>{
    const div=document.createElement("div");
    div.className="historico-item";
    div.innerHTML=`<span>${i.t}: ${i.nome}<br><small>${i.data}</small></span><strong>${moeda(i.valor)}</strong>`;
    historico.appendChild(div);
  });
}

function renderGrafico() {
  if (chart) chart.destroy();
  chart = new Chart(grafico,{
    type:"doughnut",
    data:{labels:["Rendas","Despesas"],datasets:[{data:[totalRendas(),totalDespesas()],backgroundColor:["#0f4c75","#d9534f"]}]},
    options:{plugins:{legend:{position:"bottom"}}}
  });
}

function exportarPDF() {
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF();
  let y=15;
  pdf.setFontSize(18);
  pdf.text("MoneyZen CS - Relatório Financeiro",105,y,{align:"center"});
  y+=10;
  pdf.setFontSize(11);
  pdf.text(`Rendas: ${moeda(totalRendas())}`,10,y); y+=6;
  pdf.text(`Despesas: ${moeda(totalDespesas())}`,10,y); y+=6;
  pdf.text(`Saldo: ${moeda(totalRendas()-totalDespesas())}`,10,y);
  pdf.save("MoneyZen-CS-Relatorio.pdf");
}

function limparTudo() {
  if(confirm("Apagar todos os dados?")){
    rendas=[]; despesas=[];
    salvarDados(); atualizar();
  }
}

function alternarTema(){
  document.body.classList.toggle("dark");
  localStorage.setItem("tema",document.body.classList.contains("dark")?"dark":"light");
}

window.onload=()=>{
  carregarDados();
  if(localStorage.getItem("tema")==="dark") document.body.classList.add("dark");
  atualizar();
};