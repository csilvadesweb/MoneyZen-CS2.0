let rendas = JSON.parse(localStorage.getItem("rendas")) || [];
let despesas = JSON.parse(localStorage.getItem("despesas")) || [];
let grafico;

/* =========================
   SALVAR RENDA
========================= */
function salvarRenda() {
  const nome = inputRendaNome.value.trim();
  const valor = parseFloat(inputRendaValor.value);

  if (!nome || valor <= 0) {
    alert("Preencha corretamente o nome e o valor da renda.");
    return;
  }

  rendas.push({
    nome,
    valor,
    data: new Date().toLocaleDateString("pt-BR")
  });

  localStorage.setItem("rendas", JSON.stringify(rendas));

  inputRendaNome.value = "";
  inputRendaValor.value = "";

  atualizarTudo();
}

/* =========================
   SALVAR DESPESA
========================= */
function salvarDespesa() {
  const nome = inputDespesaNome.value.trim();
  const valor = parseFloat(inputDespesaValor.value);

  if (!nome || valor <= 0) {
    alert("Preencha corretamente o nome e o valor da despesa.");
    return;
  }

  despesas.push({
    nome,
    valor,
    data: new Date().toLocaleDateString("pt-BR")
  });

  localStorage.setItem("despesas", JSON.stringify(despesas));

  inputDespesaNome.value = "";
  inputDespesaValor.value = "";

  atualizarTudo();
}

/* =========================
   ATUALIZAR RESUMO
========================= */
function atualizarTudo() {
  const totalRenda = rendas.reduce((s, r) => s + r.valor, 0);
  const totalDespesa = despesas.reduce((s, d) => s + d.valor, 0);
  const saldo = totalRenda - totalDespesa;

  valorRenda.textContent = totalRenda.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });

  valorDespesas.textContent = totalDespesa.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });

  valorSaldo.textContent = saldo.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });

  renderHistorico();
  renderGrafico(totalRenda, totalDespesa);
}

/* =========================
   HISTÓRICO NA TELA
========================= */
function renderHistorico() {
  historico.innerHTML = "";

  despesas.forEach(d => {
    const div = document.createElement("div");
    div.className = "historico-item";
    div.innerHTML = `
      <strong>${d.nome}</strong><br>
      R$ ${d.valor.toFixed(2)}<br>
      <small>${d.data}</small>
    `;
    historico.appendChild(div);
  });
}

/* =========================
   GRÁFICO
========================= */
function renderGrafico(renda, despesa) {
  if (grafico) grafico.destroy();

  grafico = new Chart(document.getElementById("grafico"), {
    type: "doughnut",
    data: {
      labels: ["Renda", "Despesas"],
      datasets: [
        {
          data: [renda, despesa],
          backgroundColor: ["#0f4c75", "#e63946"]
        }
      ]
    },
    options: {
      plugins: {
        legend: {
          position: "bottom"
        }
      }
    }
  });
}

/* =========================
   EXPORTAÇÃO PDF PREMIUM
========================= */
function exportarPDF() {
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF("p", "mm", "a4");

  let y = 15;

  /* TÍTULO */
  pdf.setFontSize(18);
  pdf.text("MoneyZen CS", 105, y, { align: "center" });

  y += 8;
  pdf.setFontSize(11);
  pdf.text("Relatório Financeiro Completo", 105, y, { align: "center" });

  y += 12;

  /* RESUMO */
  pdf.setFontSize(12);
  pdf.text(`Renda Total: ${valorRenda.textContent}`, 15, y);
  y += 8;
  pdf.text(`Despesas Totais: ${valorDespesas.textContent}`, 15, y);
  y += 8;
  pdf.text(`Saldo Final: ${valorSaldo.textContent}`, 15, y);

  y += 10;

  /* GRÁFICO EMBUTIDO */
  const canvas = document.getElementById("grafico");
  const imgData = canvas.toDataURL("image/png", 1.0);

  pdf.addImage(imgData, "PNG", 55, y, 100, 100);
  y += 110;

  /* HISTÓRICO DE RENDAS */
  pdf.setFontSize(13);
  pdf.text("Histórico de Rendas", 15, y);
  y += 6;

  pdf.setFontSize(10);
  rendas.forEach(r => {
    pdf.text(
      `${r.data} - ${r.nome}: R$ ${r.valor.toFixed(2)}`,
      15,
      y
    );
    y += 5;
  });

  y += 5;

  /* HISTÓRICO DE DESPESAS */
  pdf.setFontSize(13);
  pdf.text("Histórico de Despesas", 15, y);
  y += 6;

  pdf.setFontSize(10);
  despesas.forEach(d => {
    pdf.text(
      `${d.data} - ${d.nome}: R$ ${d.valor.toFixed(2)}`,
      15,
      y
    );
    y += 5;
  });

  /* ASSINATURA */
  pdf.setFontSize(9);
  pdf.text(
    "MoneyZen CS © C.Silva — Relatório gerado automaticamente",
    105,
    290,
    { align: "center" }
  );

  pdf.save("MoneyZen-CS-Relatorio-Premium.pdf");
}

/* =========================
   TEMA
========================= */
function alternarTema() {
  document.body.classList.toggle("dark");
}

/* =========================
   LIMPAR DADOS
========================= */
function limparTudo() {
  if (confirm("Deseja apagar todos os dados?")) {
    localStorage.clear();
    rendas = [];
    despesas = [];
    atualizarTudo();
  }
}

/* INIT */
atualizarTudo();