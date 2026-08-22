
const API = window.location.origin;


// ==========================================
// VARIÁVEIS DOS GRÁFICOS
// ==========================================

let graficoHoje = null;
let graficoDias = null;
let graficoMeses = null;


// ==========================================
// FORMATAR NÚMEROS
// ==========================================

function numero(valor) {

    return Number(valor || 0)
        .toLocaleString("pt-PT");

}


// ==========================================
// CARREGAR DADOS DO DASHBOARD
// ==========================================

async function carregarDashboard() {

    try {

        const resposta =
            await fetch(API + "/relatorios");

        if (!resposta.ok) {

            throw new Error(
                "Erro HTTP: " + resposta.status
            );

        }

        const dados =
            await resposta.json();


        if (!dados.success) {
            return;
        }


        const resumo =
            dados.resumo || {};


        const vendas =
            document.getElementById("vendas");

        const valor =
            document.getElementById("valor");

        const clientes =
            document.getElementById("clientes");

        const dispositivos =
            document.getElementById("disp");


        if (vendas) {

            vendas.textContent =
                numero(resumo.totalVendas);

        }


        if (valor) {

            valor.textContent =
                numero(resumo.faturamento) + " MT";

        }


        if (clientes) {

            clientes.textContent =
                numero(resumo.totalClientes);

        }


        if (dispositivos) {

            dispositivos.textContent =
                numero(resumo.totalDispositivos);

        }


    } catch (erro) {

        console.error(
            "Erro ao carregar dashboard:",
            erro
        );

    }

}


// ==========================================
// CARREGAR TABELA DE VENDAS
// ==========================================

async function carregarTabela() {

    try {

        const resposta =
            await fetch(API + "/vendas");

        if (!resposta.ok) {

            throw new Error(
                "Erro HTTP: " + resposta.status
            );

        }


        const json =
            await resposta.json();


        const vendas =
            Array.isArray(json)
                ? json
                : (json.vendas || []);


        const lista =
            document.getElementById("lista");


        if (!lista) return;


        lista.innerHTML = "";


        if (vendas.length === 0) {

            lista.innerHTML = `
                <tr>
                    <td
                        colspan="4"
                        style="text-align:center;padding:20px;"
                    >
                        Nenhuma venda encontrada.
                    </td>
                </tr>
            `;

            return;

        }


        vendas.forEach(venda => {

            const tr =
                document.createElement("tr");


            tr.innerHTML = `

                <td>
                    ${venda.numero || "-"}
                </td>

                <td>
                    ${venda.mb || venda.gb || 0}
                </td>

                <td>
                    ${
                        venda.valor_venda ??
                        venda.valor ??
                        0
                    } MT
                </td>

                <td>

                    <span class="status ok">
                        ${venda.status || "Concluído"}
                    </span>

                </td>

            `;


            lista.appendChild(tr);

        });


    } catch (erro) {

        console.error(
            "Erro ao carregar tabela:",
            erro
        );

    }

}


// ==========================================
// CARREGAR GRÁFICOS
// ==========================================

async function carregarGraficos() {

    try {

        const resposta =
            await fetch(API + "/relatorios");


        if (!resposta.ok) {

            throw new Error(
                "Erro HTTP: " + resposta.status
            );

        }


        const dados =
            await resposta.json();


        if (!dados.success) {
            return;
        }


        const vendasPorDia =
            dados.vendasPorDia || {};

        const vendasPorMes =
            dados.vendasPorMes || {};


        // ==========================================
        // GRÁFICO DE HOJE
        // ==========================================

        const canvasHoje =
            document.getElementById(
                "graficoHoje"
            );


        if (canvasHoje) {

            if (graficoHoje) {
                graficoHoje.destroy();
            }


            const hoje =
                new Date()
                    .toISOString()
                    .substring(0, 10);


            const vendasHoje =
                vendasPorDia[hoje] || 0;


            graficoHoje =
                new Chart(
                    canvasHoje,
                    {

                        type: "bar",

                        data: {

                            labels: [
                                "Hoje"
                            ],

                            datasets: [

                                {

                                    label:
                                        "Vendas",

                                    data: [
                                        vendasHoje
                                    ],

                                    borderWidth:
                                        0,

                                    borderRadius:
                                        8

                                }

                            ]

                        },

                        options: {

                            responsive:
                                true,

                            maintainAspectRatio:
                                false,

                            plugins: {

                                legend: {
                                    display: false
                                }

                            },

                            scales: {

                                y: {

                                    beginAtZero:
                                        true,

                                    ticks: {
                                        precision: 0
                                    }

                                }

                            }

                        }

                    }
                );

        }


        // ==========================================
        // GRÁFICO POR DIA
        // ==========================================

        const canvasDias =
            document.getElementById(
                "graficoDias"
            );


        if (canvasDias) {

            if (graficoDias) {
                graficoDias.destroy();
            }


            graficoDias =
                new Chart(
                    canvasDias,
                    {

                        type: "line",

                        data: {

                            labels:
                                Object.keys(
                                    vendasPorDia
                                ),

                            datasets: [

                                {

                                    label:
                                        "Vendas",

                                    data:
                                        Object.values(
                                            vendasPorDia
                                        ),

                                    borderWidth:
                                        3,

                                    tension:
                                        0.4,

                                    fill:
                                        false

                                }

                            ]

                        },

                        options: {

                            responsive:
                                true,

                            maintainAspectRatio:
                                false,

                            plugins: {

                                legend: {
                                    display: false
                                }

                            },

                            scales: {

                                y: {

                                    beginAtZero:
                                        true,

                                    ticks: {
                                        precision: 0
                                    }

                                }

                            }

                        }

                    }
                );

        }


        // ==========================================
        // GRÁFICO POR MÊS
        // ==========================================

        const canvasMeses =
            document.getElementById(
                "graficoMeses"
            );


        if (canvasMeses) {

            if (graficoMeses) {
                graficoMeses.destroy();
            }


            graficoMeses =
                new Chart(
                    canvasMeses,
                    {

                        type: "bar",

                        data: {

                            labels:
                                Object.keys(
                                    vendasPorMes
                                ),

                            datasets: [

                                {

                                    label:
                                        "Vendas",

                                    data:
                                        Object.values(
                                            vendasPorMes
                                        ),

                                    borderWidth:
                                        0,

                                    borderRadius:
                                        8

                                }

                            ]

                        },

                        options: {

                            responsive:
                                true,

                            maintainAspectRatio:
                                false,

                            plugins: {

                                legend: {
                                    display: false
                                }

                            },

                            scales: {

                                y: {

                                    beginAtZero:
                                        true,

                                    ticks: {
                                        precision: 0
                                    }

                                }

                            }

                        }

                    }
                );

        }


    } catch (erro) {

        console.error(
            "Erro ao carregar gráficos:",
            erro
        );

    }

}


// ==========================================
// DATA ATUAL
// ==========================================

function atualizarData() {

    const elemento =
        document.getElementById("data");


    if (!elemento) return;


    elemento.textContent =
        new Date().toLocaleString("pt-PT");

}


// ==========================================
// DISPONIBILIZAR FUNÇÕES
// ==========================================

window.carregarDashboard =
    carregarDashboard;

window.carregarTabela =
    carregarTabela;

window.carregarGraficos =
    carregarGraficos;


// ==========================================
// INICIALIZAÇÃO
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        atualizarData();

        carregarDashboard();

        carregarTabela();

        carregarGraficos();

    }
);


// ==========================================
// ATUALIZAÇÃO AUTOMÁTICA
// ==========================================

setInterval(
    carregarDashboard,
    5000
);

setInterval(
    carregarTabela,
    5000
);

setInterval(
    carregarGraficos,
    10000
);
