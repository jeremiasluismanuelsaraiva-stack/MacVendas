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
                "[MOZ TECH] Erro ao destruir gráfico:",
                erro
            );

        }

    }

}


// ==========================================
// OBTER VALOR NUMÉRICO
// ==========================================

function obterNumero(valor) {

    const numero =
        Number(valor);


    if (!Number.isFinite(numero)) {

        return 0;

    }


    return numero;

}


// ==========================================
// ORDENAR DATAS
// ==========================================

function ordenarDatas(objeto) {

    return Object.keys(
        objeto || {}
    ).sort();

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
                "[MOZ TECH] Chart.js não foi carregado."
            );

            return;

        }


        console.log(
            "[MOZ TECH] Carregando dados dos gráficos..."
        );


        // --------------------------------------
        // BUSCAR RELATÓRIOS
        // --------------------------------------

        const resposta =
            await fetch(
                API_CHARTS + "/relatorios",
                {

                    method: "GET",

                    headers: {

                        "Accept":
                            "application/json"

                    },

                    cache: "no-store"

                }
            );


        console.log(
            "[MOZ TECH] Relatórios HTTP:",
            resposta.status
        );


        if (!resposta.ok) {

            throw new Error(
                "Erro HTTP: " +
                resposta.status
            );

        }


        const json =
            await resposta.json();


        console.log(
            "[MOZ TECH] Resposta relatórios:",
            json
        );


        // --------------------------------------
        // VALIDAR RESPOSTA
        // --------------------------------------

        if (
            !json ||
            json.success !== true
        ) {

            throw new Error(
                json?.error ||
                "Resposta inválida da API de relatórios."
            );

        }


        const vendasPorDia =
            json.vendasPorDia &&
            typeof json.vendasPorDia === "object"
                ? json.vendasPorDia
                : {};


        const vendasPorMes =
            json.vendasPorMes &&
            typeof json.vendasPorMes === "object"
                ? json.vendasPorMes
                : {};


        // ==========================================
        // DATAS
        // ==========================================

        const datas =
            ordenarDatas(
                vendasPorDia
            );


        const meses =
            ordenarDatas(
                vendasPorMes
            );


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


            const agora =
                new Date();


            const hoje =
                agora
                    .toISOString()
                    .substring(
                        0,
                        10
                    );


            const quantidadeHoje =
                obterNumero(
                    vendasPorDia[hoje]
                );


            graficoHoje =
                new Chart(
                    canvasHoje,
                    {

                        type:
                            "bar",

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

                            animation: {

                                duration:
                                    500

                            },

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


            const labelsDias =
                datas;


            const valoresDias =
                labelsDias.map(
                    function (data) {

                        return obterNumero(
                            vendasPorDia[data]
                        );

                    }
                );


            graficoDias =
                new Chart(
                    canvasDias,
                    {

                        type:
                            "line",

                        data: {

                            labels:
                                labelsDias,

                            datasets: [

                                {

                                    label:
                                        "Vendas",

                                    data:
                                        valoresDias,

                                    borderWidth:
                                        3,

                                    tension:
                                        0.35,

                                    fill:
                                        false,

                                    pointRadius:
                                        4,

                                    pointHoverRadius:
                                        6

                                }

                            ]

                        },

                        options: {

                            responsive:
                                true,

                            maintainAspectRatio:
                                false,

                            animation: {

                                duration:
                                    500

                            },

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


            const labelsMeses =
                meses;


            const valoresMeses =
                labelsMeses.map(
                    function (mes) {

                        return obterNumero(
                            vendasPorMes[mes]
                        );

                    }
                );


            graficoMeses =
                new Chart(
                    canvasMeses,
                    {

                        type:
                            "bar",

                        data: {

                            labels:
                                labelsMeses,

                            datasets: [

                                {

                                    label:
                                        "Vendas",

                                    data:
                                        valoresMeses,

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

                            animation: {

                                duration:
                                    500

                            },

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


        console.log(
            "[MOZ TECH] Gráficos carregados com sucesso."
        );

    }
    catch (erro) {

        console.error(
            "[MOZ TECH] Erro ao carregar gráficos:",
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

function iniciarGraficos() {

    console.log(
        "[MOZ TECH] charts.js iniciado."
    );


    carregarGraficos();

}


// ==========================================
// DOM READY
// ==========================================

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        iniciarGraficos,
        {
            once: true
        }
    );

}
else {

    iniciarGraficos();

}


// ==========================================
// ATUALIZAÇÃO AUTOMÁTICA
// ==========================================

setInterval(
    function () {

        carregarGraficos();

    },
    10000
);
