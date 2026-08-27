// =====================================================
// MACVENDAS - DASHBOARD
// =====================================================

import {
    auth,
    onAuthState,
    obterDadosUsuario
} from "../firebase.js";


// =====================================================
// API
// =====================================================

const API = window.location.origin;


// =====================================================
// DASHBOARD - MOZ TECH
// =====================================================

let graficoHoje = null;
let graficoDias = null;
let graficoMeses = null;


// =====================================================
// FORMATAR NÚMEROS
// =====================================================

function numero(valor) {

    return Number(valor || 0).toLocaleString("pt-PT");

}


// =====================================================
// FORMATAR MT
// =====================================================

function dinheiro(valor) {

    return Number(valor || 0).toLocaleString("pt-PT", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }) + " MT";

}


// =====================================================
// CARREGAR DASHBOARD
// =====================================================

async function carregarDashboard() {

    try {

        console.log("Carregando Dashboard...");

        const resposta =
            await fetch("/dashboard", {
                method: "GET",
                headers: {
                    "Accept": "application/json"
                },
                cache: "no-store"
            });


        if (!resposta.ok) {

            throw new Error(
                "Erro HTTP: " + resposta.status
            );

        }


        const dados =
            await resposta.json();


        console.log(
            "Dados do Dashboard:",
            dados
        );


        if (!dados.success) {

            console.error(
                "API retornou erro:",
                dados.error
            );

            return;

        }


        const resumo =
            dados.resumo ||
            dados.dashboard ||
            {};


        // =================================================
        // VENDAS
        // =================================================

        const vendas =
            document.getElementById("vendas");

        if (vendas) {

            vendas.textContent =
                numero(
                    resumo.totalVendas ??
                    resumo.vendas ??
                    0
                );

        }


        // =================================================
        // FATURAMENTO
        // =================================================

        const valor =
            document.getElementById("valor");

        if (valor) {

            valor.textContent =
                dinheiro(
                    resumo.faturamento
                );

        }


        // =================================================
        // CLIENTES
        // =================================================

        const clientes =
            document.getElementById("clientes");

        if (clientes) {

            clientes.textContent =
                numero(
                    resumo.totalClientes ??
                    resumo.clientes ??
                    0
                );

        }


        // =================================================
        // DISPOSITIVOS
        // =================================================

        const dispositivos =
            document.getElementById("dispositivos");

        const disp =
            document.getElementById("disp");


        const totalDispositivos =
            numero(
                resumo.totalDispositivos ??
                resumo.dispositivos ??
                0
            );


        if (dispositivos) {

            dispositivos.textContent =
                totalDispositivos;

        }


        if (disp) {

            disp.textContent =
                totalDispositivos;

        }


        // =================================================
        // PEDIDOS
        // =================================================

        const pedidos =
            document.getElementById("pedidos");

        if (pedidos) {

            pedidos.textContent =
                numero(
                    resumo.totalPedidos ??
                    resumo.pedidos ??
                    0
                );

        }


        // =================================================
        // PACOTES
        // =================================================

        const pacotes =
            document.getElementById("pacotes");

        if (pacotes) {

            pacotes.textContent =
                numero(
                    resumo.totalPacotes ??
                    0
                );

        }


        // =================================================
        // GRUPOS
        // =================================================

        const grupos =
            document.getElementById("grupos");

        if (grupos) {

            grupos.textContent =
                numero(
                    resumo.totalGrupos ??
                    0
                );

        }


        // =================================================
        // TOTAL GB
        // =================================================

        const totalGB =
            document.getElementById("totalGB");

        if (totalGB) {

            totalGB.textContent =
                numero(
                    resumo.totalGB
                ) + " GB";

        }


        // =================================================
        // CUSTO
        // =================================================

        const custo =
            document.getElementById("custo");

        if (custo) {

            custo.textContent =
                dinheiro(
                    resumo.custo
                );

        }


        // =================================================
        // LUCRO
        // =================================================

        const lucro =
            document.getElementById("lucro");

        if (lucro) {

            lucro.textContent =
                dinheiro(
                    resumo.lucro
                );

        }


        // =================================================
        // VENDAS HOJE
        // =================================================

        const vendasHoje =
            document.getElementById("vendasHoje");

        if (vendasHoje) {

            vendasHoje.textContent =
                numero(
                    resumo.vendasHoje
                );

        }


    }
    catch (erro) {

        console.error(
            "ERRO AO CARREGAR DASHBOARD:",
            erro
        );

    }

}


// =====================================================
// CARREGAR TABELA DE VENDAS
// =====================================================

async function carregarTabela() {

    try {

        const resposta =
            await fetch("/vendas", {
                method: "GET",
                headers: {
                    "Accept": "application/json"
                },
                cache: "no-store"
            });


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
                : (
                    json.vendas ||
                    []
                );


        const lista =
            document.getElementById("lista");


        if (!lista) {

            return;

        }


        lista.innerHTML = "";


        if (vendas.length === 0) {

            lista.innerHTML = `
                <tr>
                    <td
                        colspan="4"
                        style="
                            text-align:center;
                            padding:20px;
                        "
                    >
                        Nenhuma venda encontrada.
                    </td>
                </tr>
            `;

            return;

        }


        vendas.forEach(
            function (venda) {

                const tr =
                    document.createElement("tr");


                const numeroVenda =
                    venda.numero ||
                    "-";


                const quantidade =
                    venda.mb !== undefined
                        ? numero(venda.mb) + " MB"
                        : (
                            venda.gb !== undefined
                                ? numero(venda.gb) + " GB"
                                : "0"
                        );


                const valorVenda =
                    venda.valor_venda ??
                    venda.valor ??
                    venda.valor_pacote ??
                    0;


                const status =
                    venda.status ||
                    "Concluído";


                tr.innerHTML = `

                    <td>
                        ${numeroVenda}
                    </td>

                    <td>
                        ${quantidade}
                    </td>

                    <td>
                        ${dinheiro(valorVenda)}
                    </td>

                    <td>

                        <span class="status ok">
                            ${status}
                        </span>

                    </td>

                `;


                lista.appendChild(tr);

            }
        );


    }
    catch (erro) {

        console.error(
            "ERRO AO CARREGAR VENDAS:",
            erro
        );

    }

}


// =====================================================
// CARREGAR GRÁFICOS
// =====================================================

async function carregarGraficos() {

    try {

        const resposta =
            await fetch("/dashboard", {
                method: "GET",
                headers: {
                    "Accept": "application/json"
                },
                cache: "no-store"
            });


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
            dados.vendasPorDia ||
            {};


        const vendasPorMes =
            dados.vendasPorMes ||
            {};


        // =================================================
        // GRÁFICO DIÁRIO
        // =================================================

        const canvasDias =
            document.getElementById(
                "graficoDias"
            );


        if (
            canvasDias &&
            typeof Chart !== "undefined"
        ) {

            if (graficoDias) {

                graficoDias.destroy();

            }


            const dias =
                Object.keys(
                    vendasPorDia
                );


            const valores =
                Object.values(
                    vendasPorDia
                );


            graficoDias =
                new Chart(
                    canvasDias,
                    {

                        type: "line",

                        data: {

                            labels: dias,

                            datasets: [

                                {

                                    label: "Vendas",

                                    data: valores,

                                    borderColor:
                                        "#22c55e",

                                    backgroundColor:
                                        "rgba(34,197,94,0.1)",

                                    tension: 0.4,

                                    fill: true,

                                    borderWidth: 3

                                }

                            ]

                        },

                        options: {

                            responsive: true,

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


        // =================================================
        // GRÁFICO MENSAL
        // =================================================

        const canvasMeses =
            document.getElementById(
                "graficoMeses"
            );


        if (
            canvasMeses &&
            typeof Chart !== "undefined"
        ) {

            if (graficoMeses) {

                graficoMeses.destroy();

            }


            const meses =
                Object.keys(
                    vendasPorMes
                );


            const valoresMes =
                Object.values(
                    vendasPorMes
                );


            graficoMeses =
                new Chart(
                    canvasMeses,
                    {

                        type: "bar",

                        data: {

                            labels: meses,

                            datasets: [

                                {

                                    label: "Vendas",

                                    data: valoresMes,

                                    backgroundColor:
                                        "#ef4444",

                                    borderRadius: 8,

                                    borderWidth: 0

                                }

                            ]

                        },

                        options: {

                            responsive: true,

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


    }
    catch (erro) {

        console.error(
            "ERRO AO CARREGAR GRÁFICOS:",
            erro
        );

    }

}


// =====================================================
// DATA ATUAL
// =====================================================

function atualizarData() {

    const elementoData =
        document.getElementById(
            "data"
        );


    if (!elementoData) {

        return;

    }


    elementoData.textContent =
        new Date().toLocaleString(
            "pt-PT"
        );

}


// =====================================================
// ATUALIZAR DASHBOARD COMPLETO
// =====================================================

async function atualizarDashboard() {

    console.log(
        "Atualizando Dashboard..."
    );


    await carregarDashboard();

    await carregarTabela();

    await carregarGraficos();

    atualizarData();

}


// =====================================================
// DISPONIBILIZAR GLOBALMENTE
// =====================================================

window.carregarDashboard =
    carregarDashboard;

window.carregarTabela =
    carregarTabela;

window.carregarGraficos =
    carregarGraficos;

window.atualizarDashboard =
    atualizarDashboard;


// =====================================================
// INICIAR
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        atualizarDashboard();

    }
);


// =====================================================
// ATUALIZAÇÃO AUTOMÁTICA
// A CADA 10 SEGUNDOS
// =====================================================

setInterval(
    function () {

        atualizarDashboard();

    },
    10000
);
  
