
let graficoDias = null;
let graficoMeses = null;

async function carregarGraficos() {

    try {

        const resposta = await fetch("/relatorios");

        const json = await resposta.json();

        if (!json.success) return;

        // =============================
        // GRÁFICO POR DIA
        // =============================

        const dias = Object.keys(json.vendasPorDia);

        const vendasDias = Object.values(json.vendasPorDia);

        if (graficoDias) {

            graficoDias.destroy();

        }

        const ctxDias = document
            .getElementById("graficoDias")
            .getContext("2d");

        graficoDias = new Chart(ctxDias, {

            type: "line",

            data: {

                labels: dias,

                datasets: [

                    {

                        label: "Vendas",

                        data: vendasDias,

                        borderWidth: 3,

                        tension: 0.3,

                        fill: false

                    }

                ]

            },

            options: {

                responsive: true,

                maintainAspectRatio: false

            }

        });

        // =============================
        // GRÁFICO POR MÊS
        // =============================

        const meses = Object.keys(json.vendasPorMes);

        const vendasMes = Object.values(json.vendasPorMes);

        if (graficoMeses) {

            graficoMeses.destroy();

        }

        const ctxMeses = document
            .getElementById("graficoMeses")
            .getContext("2d");

        graficoMeses = new Chart(ctxMeses, {

            type: "bar",

            data: {

                labels: meses,

                datasets: [

                    {

                        label: "Vendas",

                        data: vendasMes,

                        borderWidth: 2

                    }

                ]

            },

            options: {

                responsive: true,

                maintainAspectRatio: false

            }

        });

    }

    catch (e) {

        console.error("Erro ao carregar gráficos:", e);

    }

}

carregarGraficos();

setInterval(carregarGraficos, 10000);
