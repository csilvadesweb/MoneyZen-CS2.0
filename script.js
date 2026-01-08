let rendas = JSON.parse(localStorage.getItem("rendas")) || [];
let despesas = JSON.parse(localStorage.getItem("despesas")) || [];
let tema = localStorage.getItem("tema") || "claro";

document.body.className = tema;

const ctx = document.getElementById("grafico").getContext("2d");
let grafico;

function salvarRenda() {
  const nome = inputRendaNome.value;
  const valor = Number(inputRendaValor.value);
  if (!nome || !valor) return;
  rendas.unshift({ nome, valor, data: new Date().toLocaleDateString() });
  salvar();
  inputRendaNome.value = inputRendaValor.value = "";
}

function salvarDespesa() {
  const nome = inputDespesaNome.value;
  const valor = Number(inputDespesaValor.value);
  if (!nome || !valor) return;
  despesas.unshift({ nome, valor, data: new Date().toLocaleDateString() });
  salvar();
  inputDespesaNome.value = inputDespesaValor.value = "";
}

function salvar() {
  localStorage.setItem("rendas", JSON.stringify(rendas));
  localStorage.setItem("despesas", JSON.stringify(despesas));
  atualizar();
}

function atualizar() {
  const totalRenda = rendas.reduce((s, r) => s + r.valor, 0);
  const totalDespesa = despesas.reduce((s, d) => s + d.valor, 0);
  valorRenda.innerText = totalRenda.toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
  valorDespesas.innerText = totalDespesa.toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
  valorSaldo.innerText = (totalRenda-totalDespesa).toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
  historico.innerHTML = [...rendas.map(r=>`<p>➕ ${r.nome} - ${r.valor}</p>`),
                         ...despesas.map(d=>`<p>➖ ${d.nome} - ${d.valor}</p>`)].join("");
  if(grafico) grafico.destroy();
  grafico = new Chart(ctx,{
    type:"doughnut",
    data:{labels:["Rendas","Despesas"],datasets:[{data:[totalRenda,totalDespesa]}]}
  });
}

function exportarPDF() {
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF();
  pdf.text("MoneyZen CS - Relatório Financeiro",10,10);
  pdf.addImage(grafico.toBase64Image(),"PNG",15,20,180,80);
  pdf.text("Histórico:",10,110);
  let y=120;
  [...rendas.map(r=>`Renda: ${r.nome} - ${r.valor}`),
   ...despesas.map(d=>`Despesa: ${d.nome} - ${d.valor}`)]
   .forEach(l=>{ pdf.text(l,10,y); y+=6;});
  pdf.save("MoneyZenCS.pdf");
}

function limparTudo(){localStorage.clear();location.reload();}
function alternarTema(){tema=tema==="claro"?"escuro":"claro";localStorage.setItem("tema",tema);document.body.className=tema;}

atualizar();