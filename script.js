let rendas = JSON.parse(localStorage.getItem("rendas")) || [];
let despesas = JSON.parse(localStorage.getItem("despesas")) || [];
let grafico;

function salvarRenda() {
  const nome = inputRendaNome.value.trim();
  const valor = parseFloat(inputRendaValor.value);

  if (!nome || valor <= 0) return alert("Preencha a renda corretamente");

  rendas.push({ nome, valor, data: new Date().toLocaleDateString() });
  localStorage.setItem("rendas", JSON.stringify(rendas));

  inputRendaNome.value = "";
  inputRendaValor.value = "";

  atualizarTudo();
}

function salvarDespesa() {
  const nome = inputDespesaNome.value.trim();
  const valor = parseFloat(inputDespesaValor.value);

  if (!nome || valor <= 0) return alert("Preencha a despesa corretamente");

  despesas.push({ nome, valor, data: new Date().toLocaleDateString() });
  localStorage.setItem("despesas", JSON.stringify(despesas));

  inputDespesaNome.value = "";
  inputDespesaValor.value = "";

  atualizarTudo();
}

function atualizarTudo() {
  const totalRenda = rendas.reduce((s, r) => s + r.valor, 0);
  const totalDespesa = despesas.reduce((s, d) => s + d.valor, 0);
  const saldo = totalRenda - totalDespesa;

  valorRenda.textContent = totalRenda.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  valorDespesas.textContent = totalDespesa.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  valorSaldo.textContent = saldo.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  renderHistorico();
  renderGrafico(totalRenda, totalDespesa);
}

function renderHistorico() {
  historico.innerHTML = "";

  despesas.forEach(d => {
    const div = document.createElement("div");
    div.className = "historico-item";
    div.innerHTML = `<strong>${d.nome}</strong><br>R$ ${d.valor.toFixed(2)} — ${d.data}`;
    historico.appendChild(div);
  });
}

function renderGrafico(renda, despesa) {
  if (grafico) grafico.destroy();

  grafico = new Chart(document.getElementById("grafico"), {
    type: "doughnut",
    data: {
      labels: ["Renda", "Despesas"],
      datasets: [{
        data: [renda, despesa]
      }]
    }
  });
}

function exportarPDF() {
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF();

  pdf.text("MoneyZen CS - Relatório Financeiro", 10, 10);

  pdf.text(`Renda: ${valorRenda.textContent}`, 10, 25);
  pdf.text(`Despesas: ${valorDespesas.textContent}`, 10, 35);
  pdf.text(`Saldo: ${valorSaldo.textContent}`, 10, 45);

  let y = 60;
  pdf.text("Histórico de Despesas:", 10, y);
  y += 10;

  despesas.forEach(d => {
    pdf.text(`${d.nome} - R$ ${d.valor.toFixed(2)} (${d.data})`, 10, y);
    y += 8;
  });

  pdf.text("Assinatura: MoneyZen CS © C.Silva", 10, 280);

  pdf.save("MoneyZen-CS.pdf");
}

function alternarTema() {
  document.body.classList.toggle("dark");
}

function limparTudo() {
  if (confirm("Deseja apagar todos os dados?")) {
    localStorage.clear();
    rendas = [];
    despesas = [];
    atualizarTudo();
  }
}

atualizarTudo();