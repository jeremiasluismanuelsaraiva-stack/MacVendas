let grafico;

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
// GRÁFICO
// =========================
function criarGrafico() {

    const ctx = document.getElementById("graficoVendas");

    const gradiente = ctx.getContext("2d").createLinearGradient(0, 0, 0, 420);

    gradiente.addColorStop(0, "rgba(59,130,246,.45)");
    gradiente.addColorStop(1, "rgba(59,130,246,0)");

    grafico = new Chart(ctx, {

        type: "line",

        data: {

            labels: [
                "00","02","04","06","08","10",
                "12","14","16","18","20","22","24"
            ],

            datasets: [{

                label: "GB Vendidos",

                data: [
                    5,8,10,13,18,22,28,31,36,34,38,35,40
                ],

                borderColor: "#3b82f6",

                backgroundColor: gradiente,

                fill: true,

                borderWidth: 2,

                tension: 0.45,

                pointRadius: 0,

                pointHoverRadius: 7,

                pointHoverBackgroundColor: "#ffffff",

                pointHoverBorderColor: "#3b82f6",

                pointHoverBorderWidth: 3

            }]

        },

        options: {

            responsive: true,

            maintainAspectRatio: false,

            animation: {
                duration: 2500
            },

            interaction: {
                intersect: false,
                mode: "index"
            },

            plugins: {

                legend: {
                    display: false
                },

                tooltip: {

                    backgroundColor: "#0f172a",

                    callbacks: {

                        label(context) {
                            return context.raw + " GB vendidos";
                        }

                    }

                }

            },

            scales: {

                x: {

                    grid: {
                        color: "rgba(255,255,255,.05)"
                    },

                    ticks: {
                        color: "#cbd5e1"
                    }

                },

                y: {

                    beginAtZero: true,

                    ticks: {

                        color: "#cbd5e1",

                        callback(v) {
                            return v + "GB";
                        }

                    },

                    grid: {
                        color: "rgba(255,255,255,.05)"
                    }

                }

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
criarGrafico();

carregarDashboard();

carregarTabela();

// =========================
// ATUALIZAR
// =========================
setInterval(() => {

    carregarDashboard();

    carregarTabela();

}, 5000);
