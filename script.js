document.addEventListener("DOMContentLoaded", () => {

  const rendaForm = document.getElementById("renda-form");
  const despesaForm = document.getElementById("despesa-form");

  const rendaDescricao = document.getElementById("renda-descricao");
  const rendaValor = document.getElementById("renda-valor");

  const despesaDescricao = document.getElementById("despesa-descricao");
  const despesaValor = document.getElementById("despesa-valor");

  const totalRendaEl = document.getElementById("total-renda");
  const totalDespesaEl = document.getElementById("total-despesa");
  const saldoEl = document.getElementById("saldo");
  const listaDespesas = document.getElementById("lista-despesas");

  let rendas = JSON.parse(localStorage.getItem("rendas")) || [];
  let despesas = JSON.parse(localStorage.getItem("despesas")) || [];

  function salvar() {
    localStorage.setItem("rendas", JSON.stringify(rendas));
    localStorage.setItem("despesas", JSON.stringify(despesas));
  }

  function moeda(v) {
    return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }

  function hoje() {
    return new Date().toLocaleDateString("pt-BR");
  }

  function atualizarResumo() {
    const tr = rendas.reduce((a, b) => a + b.valor, 0);
    const td = despesas.reduce((a, b) => a + b.valor, 0);
    totalRendaEl.textContent = moeda(tr);
    totalDespesaEl.textContent = moeda(td);
    saldoEl.textContent = moeda(tr - td);
  }

  function renderDespesas() {
    listaDespesas.innerHTML = "";
    despesas.slice().reverse().forEach(d => {
      const li = document.createElement("li");
      li.textContent = `${d.data} - ${d.descricao} - ${moeda(d.valor)}`;
      listaDespesas.appendChild(li);
    });
  }

  rendaForm.addEventListener("submit", e => {
    e.preventDefault();
    rendas.push({ descricao: rendaDescricao.value, valor: Number(rendaValor.value), data: hoje() });
    salvar();
    atualizarResumo();
    rendaForm.reset();
  });

  despesaForm.addEventListener("submit", e => {
    e.preventDefault();
    despesas.push({ descricao: despesaDescricao.value, valor: Number(despesaValor.value), data: hoje() });
    salvar();
    atualizarResumo();
    renderDespesas();
    despesaForm.reset();
  });

  window.gerarPDF = function () {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.text("MoneyZen CS - Relatório Financeiro", 14, 20);
    doc.text(`Renda: ${moeda(rendas.reduce((a,b)=>a+b.valor,0))}`, 14, 40);
    doc.text(`Despesas: ${moeda(despesas.reduce((a,b)=>a+b.valor,0))}`, 14, 48);
    doc.text(`Saldo: ${moeda(rendas.reduce((a,b)=>a+b.valor,0)-despesas.reduce((a,b)=>a+b.valor,0))}`, 14, 56);
    doc.save("MoneyZen-CS-Relatorio.pdf");
  }

  atualizarResumo();
  renderDespesas();
});