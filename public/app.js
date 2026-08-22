// =========================
// DASHBOARD
// =========================

let graficoHoje = null;
let graficoDias = null;
let graficoMeses = null;


// =========================
// FORMATAR NÚMEROS
// =========================

function numero(valor) {

    return Number(valor || 0)
        .toLocaleString("pt-PT");

}


// =========================
// CARREGAR DASHBOARD
// =========================

async function carregarDashboard() {

    try {

        const resposta =
            await fetch("/relatorios");

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


        // =========================
        // ESTATÍSTICAS
        // =========================

        const vendas =
            document.getElementById("vendas");

        const valor =
            document.getElementById("valor");

        const clientes =
            document.getElementById("clientes");

        const disp =
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


        if (disp) {

            disp.textContent =
                numero(resumo.totalDispositivos);

        }


    } catch (erro) {

        console.error(
            "Erro ao carregar dashboard:",
            erro
        );

    }

}


// =========================
// TABELA DE VENDAS
// =========================

async function carregarTabela() {

    try {

        const resposta =
            await fetch("/vendas");

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
                    <td colspan="4"
                        style="text-align:center;padding:20px;">
                        Nenhuma venda encontrada.
                    </td>
                </tr>
            `;

            return;

        }


        vendas.forEach(v => {

            const tr =
                document.createElement("tr");


            tr.innerHTML = `

                <td>
                    ${v.numero || "-"}
                </td>

                <td>
                    ${v.mb || v.gb || 0}
                </td>

                <td>
                    ${v.valor_venda ||
                      v.valor ||
                      0} MT
                </td>

                <td>

                    <span class="status ok">
                        ${v.status || "Concluído"}
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


// =========================
// CARREGAR RELATÓRIOS
// =========================

async function carregarGraficos() {

    try {

        const resposta =
            await fetch("/relatorios");

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


        // =========================
        // DADOS
        // =========================

        const vendasPorDia =
            dados.vendasPorDia || {};

        const vendasPorMes =
            dados.vendasPorMes || {};


        // =========================
        // GRÁFICO POR DIA
        // =========================

        const canvasDias =
            document.getElementById(
                "graficoDias"
            );


        if (canvasDias) {

            if (graficoDias) {
                graficoDias.destroy();
            }


            const dias =
                Object.keys(vendasPorDia);


            const valores =
                Object.values(vendasPorDia);


            graficoDias =
                new Chart(
                    canvasDias,
                    {

                        type: "line",

                        data: {

                            labels: dias,

                            datasets: [

                                {

                                    label:
                                        "Vendas",

                                    data:
                                        valores,

                                    borderColor:
                                        "#22c55e",

                                    backgroundColor:
                                        "rgba(34,197,94,0.1)",

                                    tension:
                                        0.4,

                                    fill:
                                        true,

                                    borderWidth:
                                        3

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
                                        true

                                }

                            }

                        }

                    }
                );

        }


        // =========================
        // GRÁFICO MENSAL
        // =========================

        const canvasMeses =
            document.getElementById(
                "graficoMeses"
            );


        if (canvasMeses) {

            if (graficoMeses) {
                graficoMeses.destroy();
            }


            const meses =
                Object.keys(vendasPorMes);


            const valoresMes =
                Object.values(vendasPorMes);


            graficoMeses =
                new Chart(
                    canvasMeses,
                    {

                        type: "bar",

                        data: {

                            labels: meses,

                            datasets: [

                                {

                                    label:
                                        "Vendas",

                                    data:
                                        valoresMes,

                                    backgroundColor:
                                        "#ef4444",

                                    borderRadius:
                                        8,

                                    borderWidth:
                                        0

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
                                        true

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


// =========================
// DATA ATUAL
// =========================

const elementoData =
    document.getElementById("data");


if (elementoData) {

    elementoData.textContent =
        new Date().toLocaleString("pt-PT");

}


// =========================
// INICIALIZAR
// =========================

carregarDashboard();

carregarTabela();

carregarGraficos();


// =========================
// ATUALIZAÇÃO AUTOMÁTICA
// =========================

setInterval(() => {

    carregarDashboard();

    carregarTabela();

    carregarGraficos();

}, 10000);
