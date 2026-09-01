// ==========================================
// GRÁFICOS DO SISTEMA
// Arquivo: charts.js
// ==========================================

let graficoHoje = null;
let graficoDias = null;
let graficoMeses = null;

const API_CHARTS = window.location.origin;


// ==========================================
// DESTRUIR GRÁFICO COM SEGURANÇA
// ==========================================

function destruirGrafico(grafico) {

    if (grafico) {

        try {

            grafico.destroy();

        }
        catch (erro) {

            console.warn(
                "Erro ao destruir gráfico:",
                erro
            );

        }

    }

}


// ==========================================
// CARREGAR DADOS DOS GRÁFICOS
// ==========================================

async function carregarGraficos() {

    try {

        // --------------------------------------
        // VERIFICAR CHART.JS
        // --------------------------------------

        if (typeof Chart === "undefined") {

            console.error(
                "Chart.js não foi carregado."
            );

            return;

        }


        // --------------------------------------
        // BUSCAR RELATÓRIOS
        // --------------------------------------

        const resposta =
            await fetch(
                API_CHARTS + "/relatorios"
            );


        if (!resposta.ok) {

            throw new Error(
                "Erro HTTP: " +
                resposta.status
            );

        }


        const json =
            await resposta.json();


        if (!json.success) {

            console.error(
                "API de relatórios retornou erro:",
                json
            );

            return;

        }


        const vendasPorDia =
            json.vendasPorDia || {};


        const vendasPorMes =
            json.vendasPorMes || {};


        // ==========================================
        // GRÁFICO DE HOJE
        // ==========================================

        const canvasHoje =
            document.getElementById(
                "graficoHoje"
            );


        if (canvasHoje) {

            destruirGrafico(
                graficoHoje
            );


            const hoje =
                new Date()
                    .toISOString()
                    .substring(
                        0,
                        10
                    );


            const quantidadeHoje =
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
                                        quantidadeHoje
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

                                    display:
                                        false

                                }

                            },

                            scales: {

                                y: {

                                    beginAtZero:
                                        true,

                                    ticks: {

                                        precision:
                                            0

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

            destruirGrafico(
                graficoDias
            );


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
                                        0.35,

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

                                    display:
                                        false

                                }

                            },

                            scales: {

                                y: {

                                    beginAtZero:
                                        true,

                                    ticks: {

                                        precision:
                                            0

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

            destruirGrafico(
                graficoMeses
            );


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

                                    display:
                                        false

                                }

                            },

                            scales: {

                                y: {

                                    beginAtZero:
                                        true,

                                    ticks: {

                                        precision:
                                            0

                                    }

                                }

                            }

                        }

                    }
                );

        }

    }
    catch (erro) {

        console.error(
            "Erro ao carregar gráficos:",
            erro
        );

    }

}


// ==========================================
// DISPONIBILIZAR FUNÇÃO GLOBAL
// ==========================================

window.carregarGraficos =
    carregarGraficos;


// ==========================================
// INICIALIZAÇÃO
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        carregarGraficos();

    }
);


// ==========================================
// ATUALIZAÇÃO AUTOMÁTICA
// ==========================================

setInterval(
    carregarGraficos,
    10000
);
