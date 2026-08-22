let graficoDias = null;
let graficoMeses = null;


// ==========================================
// CARREGAR GRÁFICOS
// ==========================================

async function carregarGraficos() {

    try {

        const resposta =
            await fetch("/relatorios");

        if (!resposta.ok) {

            throw new Error(
                "Erro HTTP: " + resposta.status
            );

        }

        const json =
            await resposta.json();


        if (!json.success) {

            console.error(
                "Erro nos relatórios:",
                json
            );

            return;

        }


        // ==========================================
        // GRÁFICO POR DIA
        // ==========================================

        const dias =
            Object.keys(
                json.vendasPorDia || {}
            );


        const vendasDias =
            Object.values(
                json.vendasPorDia || {}
            );


        const elementoDias =
            document.getElementById(
                "graficoDias"
            );


        if (elementoDias) {

            if (graficoDias) {

                graficoDias.destroy();

            }


            const ctxDias =
                elementoDias.getContext("2d");


            graficoDias =
                new Chart(
                    ctxDias,
                    {

                        type: "line",

                        data: {

                            labels: dias,

                            datasets: [

                                {

                                    label: "Vendas por dia",

                                    data: vendasDias,

                                    borderWidth: 3,

                                    tension: 0.3,

                                    fill: false

                                }

                            ]

                        },

                        options: {

                            responsive: true,

                            maintainAspectRatio: false,

                            plugins: {

                                legend: {
                                    display: true
                                }

                            },

                            scales: {

                                y: {

                                    beginAtZero: true,

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

        const meses =
            Object.keys(
                json.vendasPorMes || {}
            );


        const vendasMes =
            Object.values(
                json.vendasPorMes || {}
            );


        const elementoMeses =
            document.getElementById(
                "graficoMeses"
            );


        if (elementoMeses) {

            if (graficoMeses) {

                graficoMeses.destroy();

            }


            const ctxMeses =
                elementoMeses.getContext("2d");


            graficoMeses =
                new Chart(
                    ctxMeses,
                    {

                        type: "bar",

                        data: {

                            labels: meses,

                            datasets: [

                                {

                                    label: "Vendas por mês",

                                    data: vendasMes,

                                    borderWidth: 2

                                }

                            ]

                        },

                        options: {

                            responsive: true,

                            maintainAspectRatio: false,

                            plugins: {

                                legend: {
                                    display: true
                                }

                            },

                            scales: {

                                y: {

                                    beginAtZero: true,

                                    ticks: {
                                        precision: 0
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
// DISPONIBILIZAR GLOBALMENTE
// ==========================================

window.carregarGraficos =
    carregarGraficos;


// ==========================================
// INICIALIZAÇÃO
// ==========================================

carregarGraficos();


// ==========================================
// ATUALIZAÇÃO AUTOMÁTICA
// ==========================================

setInterval(
    carregarGraficos,
    10000
);
