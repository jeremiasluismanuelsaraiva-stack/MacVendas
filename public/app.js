// =========================
// DASHBOARD
// =========================

let graficoHoje;
let graficoDias;
let graficoMeses;

// =========================
// DASHBOARD
// =========================
async function carregarDashboard() {

    const resposta = await fetch("/dashboard");
    const dados = await resposta.json();

    document.getElementById("vendas").innerHTML = dados.vendas;
    document.getElementById("valor").innerHTML = dados.faturamento + " MT";
    document.getElementById("clientes").innerHTML = dados.clientes;
    document.getElementById("disp").innerHTML = dados.dispositivos;

}

// =========================
// TABELA
// =========================
async function carregarTabela() {

    const resposta = await fetch("/vendas");
    const vendas = await resposta.json();

    let html = "";

    vendas.forEach(v => {

        html += `
        <tr>
            <td>${v.numero}</td>
            <td>${v.mb}</td>
            <td>${v.valor} MT</td>
            <td><span class="status ok">${v.status}</span></td>
        </tr>
        `;

    });

    document.getElementById("lista").innerHTML = html;

}

// =========================
// GRÁFICO HOJE
// =========================
function criarGraficoHoje() {

    const ctx = document.getElementById("graficoHoje");

    graficoHoje = new Chart(ctx, {
        type: "bar",
        data: {
            labels: ["00","02","04","06","08","10","12","14","16","18","20","22","24"],
            datasets: [{
                data: [5,8,10,13,18,22,28,31,36,34,38,35,40],
                backgroundColor: "#3b82f6",
                borderRadius: 8,
                borderSkipped: false,
                barThickness: 8,
                maxBarThickness: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins:{
                legend:{display:false}
            }
        }
    });

}

// =========================
// GRÁFICO POR DIA
// =========================
function criarGraficoDias() {

    const ctx = document.getElementById("graficoDias");

    graficoDias = new Chart(ctx,{
        type:"line",
        data:{
            labels:["1","5","10","15","20","25","30"],
            datasets:[{
                data:[30,45,52,48,60,72,90],
                borderColor:"#22c55e",
                backgroundColor:"#22c55e",
                tension:.4,
                fill:false
            }]
        },
        options:{
            responsive:true,
            maintainAspectRatio:false,
            plugins:{
                legend:{display:false}
            }
        }
    });

}

// =========================
// GRÁFICO MENSAL
// =========================
function criarGraficoMeses() {

    const ctx=document.getElementById("graficoMeses");

    graficoMeses=new Chart(ctx,{
        type:"bar",
        data:{
            labels:["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"],
            datasets:[{
                data:[120,150,180,170,210,240,270,260,300,320,340,380],
                backgroundColor:"#ef4444",
                borderRadius:8
            }]
        },
        options:{
            responsive:true,
            maintainAspectRatio:false,
            plugins:{
                legend:{display:false}
            }
        }
    });

}

// =========================
// DATA
// =========================
document.getElementById("data").innerHTML =
new Date().toLocaleString("pt-PT");

// =========================
// INICIAR
// =========================
criarGraficoHoje();
criarGraficoDias();
criarGraficoMeses();

carregarDashboard();
carregarTabela();

// =========================
// ATUALIZAR
// =========================
setInterval(() => {

    carregarDashboard();
    carregarTabela();

}, 5000);
