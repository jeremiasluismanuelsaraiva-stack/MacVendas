// ==========================================
// GRÁFICOS DO SISTEMA
// Arquivo: charts.js
// MACVENDAS / MOZ TECH
// ==========================================

"use strict";

let graficoHoje = null;
let graficoDias = null;
let graficoMeses = null;

let carregandoGraficos = false;

// ==========================================
// DESTRUIR GRÁFICO COM SEGURANÇA
// ==========================================

function destruirGrafico(grafico) {

    if (!grafico) {
        return null;
    }

    try {

        if (typeof grafico.destroy === "function") {
            grafico.destroy();
        }

    }
    catch (erro) {

        console.warn(
            "[MOZ TECH] Erro ao destruir gráfico:",
            erro
        );

    }

    return null;
}

// Compatibilidade com versões antigas
window.destruirGrafico = destruirGrafico;

// ==========================================
// NÚMEROS
// ==========================================

function numero(valor) {

    const n = Number(valor);

    return Number.isFinite(n) ? n : 0;
}

function gbCompra(compra) {

    const gb = numero(compra?.gb);

    if (gb > 0) {
        return gb;
    }

    const mb = numero(compra?.mb);

    return mb / 1000;
}

function mbCompra(compra) {

    const mb = numero(compra?.mb);

    if (mb > 0) {
        return mb;
    }

    return numero(compra?.gb) * 1000;
}

function valorCompra(compra) {
    return numero(compra?.valor);
}

function dataCompra(compra) {

    return (
        compra?.criadoEm ||
        compra?.criado_em ||
        compra?.data ||
        compra?.createdAt ||
        compra?.created_at ||
        null
    );
}

function dataLocal(compra) {

    const valor = dataCompra(compra);

    if (!valor) {
        return null;
    }

    const data = new Date(valor);

    if (Number.isNaN(data.getTime())) {
        return null;
    }

    return data;
}

function mesmoDia(data, hoje) {

    return (
        data &&
        data.getFullYear() === hoje.getFullYear() &&
        data.getMonth() === hoje.getMonth() &&
        data.getDate() === hoje.getDate()
    );
}

function chaveDia(data) {

    if (!data) {
        return "";
    }

    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, "0");
    const dia = String(data.getDate()).padStart(2, "0");

    return `${ano}-${mes}-${dia}`;
}

function chaveMes(data) {

    if (!data) {
        return "";
    }

    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, "0");

    return `${ano}-${mes}`;
}

function formatarDia(chave) {

    if (!chave) {
        return "";
    }

    const partes = chave.split("-");

    if (partes.length !== 3) {
        return chave;
    }

    return `${partes[2]}/${partes[1]}`;
}

function formatarMes(chave) {

    if (!chave) {
        return "";
    }

    const partes = chave.split("-");

    if (partes.length !== 2) {
        return chave;
    }

    return `${partes[1]}/${partes[0]}`;
}

// ==========================================
// OBTER COMPRAS DA RESPOSTA
// ==========================================

function extrairCompras(resposta) {

    if (Array.isArray(resposta)) {
        return resposta;
    }

    if (Array.isArray(resposta?.compras)) {
        return resposta.compras;
    }

    if (Array.isArray(resposta?.data)) {
        return resposta.data;
    }

    if (Array.isArray(resposta?.vendas)) {
        return resposta.vendas;
    }

    return [];
}

// ==========================================
// OPÇÕES
// ==========================================

function opcoesBase() {

    return {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
            duration: 400
        },
        plugins: {
            legend: {
                display: true
            },
            tooltip: {
                enabled: true
            }
        }
    };
}

// ==========================================
// CARREGAR GRÁFICOS
// ==========================================

async function carregarGraficos() {

    if (carregandoGraficos) {
        return;
    }

    carregandoGraficos = true;

    try {

        if (typeof Chart === "undefined") {

            console.error(
                "[MOZ TECH] Chart.js não foi carregado."
            );

            return;
        }

        if (
            !window.MOZ_API ||
            typeof window.MOZ_API.get !== "function"
        ) {

            console.warn(
                "[MOZ TECH] MOZ_API ainda não está disponível para os gráficos."
            );

            return;
        }

        console.log(
            "[MOZ TECH] Carregando dados dos gráficos..."
        );

        const resposta =
            await window.MOZ_API.get(
                "/compras"
            );

        console.log(
            "[MOZ TECH] Resposta /compras:",
            resposta
        );

        const compras =
            extrairCompras(resposta);

        const hoje =
            new Date();

        // ==========================================
        // HOJE POR HORA
        // ==========================================

        const vendasHora =
            Array(24).fill(0);

        const gbHora =
            Array(24).fill(0);

        const mbHora =
            Array(24).fill(0);

        compras.forEach(
            compra => {

                const data =
                    dataLocal(compra);

                if (
                    !mesmoDia(
                        data,
                        hoje
                    )
                ) {
                    return;
                }

                const hora =
                    data.getHours();

                vendasHora[hora] += 1;
                gbHora[hora] += gbCompra(compra);
                mbHora[hora] += mbCompra(compra);

            }
        );

        const canvasHoje =
            document.getElementById(
                "graficoHoje"
            );

        if (canvasHoje) {

            graficoHoje =
                destruirGrafico(
                    graficoHoje
                );

            graficoHoje =
                new Chart(
                    canvasHoje,
                    {
                        type: "line",

                        data: {
                            labels:
                                Array.from(
                                    { length: 24 },
                                    (_, i) =>
                                        `${String(i).padStart(2, "0")}h`
                                ),

                            datasets: [
                                {
                                    label: "Vendas",
                                    data: vendasHora,
                                    tension: 0.35,
                                    borderWidth: 3,
                                    pointRadius: 3
                                }
                            ]
                        },

                        options: {
                            ...opcoesBase(),

                            scales: {
                                y: {
                                    beginAtZero: true,
                                    ticks: {
                                        precision: 0
                                    }
                                }
                            },

                            plugins: {
                                ...opcoesBase().plugins,

                                tooltip: {
                                    callbacks: {
                                        afterLabel: function(ctx) {

                                            const i =
                                                ctx.dataIndex;

                                            return [
                                                `GB: ${gbHora[i].toFixed(2)}`,
                                                `MB: ${Math.round(mbHora[i])}`
                                            ];
                                        }
                                    }
                                }
                            }
                        }
                    }
                );
        }

        // ==========================================
        // ÚLTIMOS 7 DIAS
        // ==========================================

        const dias = [];
        const vendasDias = [];
        const gbDias = [];
        const mbDias = [];
        const faturamentoDias = [];

        for (let i = 6; i >= 0; i--) {

            const data =
                new Date(hoje);

            data.setHours(
                0,
                0,
                0,
                0
            );

            data.setDate(
                data.getDate() - i
            );

            dias.push(
                chaveDia(data)
            );

            vendasDias.push(0);
            gbDias.push(0);
            mbDias.push(0);
            faturamentoDias.push(0);
        }

        const indiceDias =
            new Map(
                dias.map(
                    (dia, indice) =>
                        [dia, indice]
                )
            );

        compras.forEach(
            compra => {

                const data =
                    dataLocal(compra);

                const chave =
                    chaveDia(data);

                const indice =
                    indiceDias.get(chave);

                if (indice === undefined) {
                    return;
                }

                vendasDias[indice] += 1;
                gbDias[indice] += gbCompra(compra);
                mbDias[indice] += mbCompra(compra);
                faturamentoDias[indice] += valorCompra(compra);

            }
        );

        const canvasDias =
            document.getElementById(
                "graficoDias"
            );

        if (canvasDias) {

            graficoDias =
                destruirGrafico(
                    graficoDias
                );

            graficoDias =
                new Chart(
                    canvasDias,
                    {
                        type: "bar",

                        data: {
                            labels:
                                dias.map(
                                    formatarDia
                                ),

                            datasets: [
                                {
                                    label: "GB",
                                    data: gbDias,
                                    borderRadius: 7
                                }
                            ]
                        },

                        options: {
                            ...opcoesBase(),

                            scales: {
                                y: {
                                    beginAtZero: true
                                }
                            },

                            plugins: {
                                ...opcoesBase().plugins,

                                tooltip: {
                                    callbacks: {
                                        label: function(ctx) {

                                            const i =
                                                ctx.dataIndex;

                                            return [
                                                `GB: ${gbDias[i].toFixed(2)}`,
                                                `MB: ${Math.round(mbDias[i])}`,
                                                `Vendas: ${vendasDias[i]}`,
                                                `Faturamento: ${faturamentoDias[i].toFixed(2)} MT`
                                            ];
                                        }
                                    }
                                }
                            }
                        }
                    }
                );
        }

        // ==========================================
        // ÚLTIMOS 30 DIAS / FATURAMENTO
        // ==========================================

        const mesesMap = {};

        compras.forEach(
            compra => {

                const data =
                    dataLocal(compra);

                if (!data) {
                    return;
                }

                const chave =
                    chaveMes(data);

                if (!mesesMap[chave]) {

                    mesesMap[chave] = {
                        vendas: 0,
                        gb: 0,
                        mb: 0,
                        faturamento: 0
                    };
                }

                mesesMap[chave].vendas += 1;
                mesesMap[chave].gb += gbCompra(compra);
                mesesMap[chave].mb += mbCompra(compra);
                mesesMap[chave].faturamento += valorCompra(compra);

            }
        );

        const mesesOrdenados =
            Object.keys(
                mesesMap
            )
                .sort()
                .slice(-6);

        const canvasMeses =
            document.getElementById(
                "graficoMeses"
            );

        if (canvasMeses) {

            graficoMeses =
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
                                mesesOrdenados.map(
                                    formatarMes
                                ),

                            datasets: [
                                {
                                    label: "Faturamento (MT)",
                                    data:
                                        mesesOrdenados.map(
                                            mes =>
                                                mesesMap[mes].faturamento
                                        ),
                                    borderRadius: 7
                                }
                            ]
                        },

                        options: {
                            ...opcoesBase(),

                            scales: {
                                y: {
                                    beginAtZero: true
                                }
                            },

                            plugins: {
                                ...opcoesBase().plugins,

                                tooltip: {
                                    callbacks: {
                                        afterLabel: function(ctx) {

                                            const dados =
                                                mesesMap[
                                                    mesesOrdenados[
                                                        ctx.dataIndex
                                                    ]
                                                ];

                                            return [
                                                `Vendas: ${dados.vendas}`,
                                                `GB: ${dados.gb.toFixed(2)}`,
                                                `MB: ${Math.round(dados.mb)}`
                                            ];
                                        }
                                    }
                                }
                            }
                        }
                    }
                );
        }

        console.log(
            "[MOZ TECH] Gráficos carregados com sucesso.",
            {
                compras: compras.length,
                hoje: vendasHora.reduce(
                    (a, b) => a + b,
                    0
                ),
                gb:
                    compras.reduce(
                        (total, compra) =>
                            total + gbCompra(compra),
                        0
                    ),
                mb:
                    compras.reduce(
                        (total, compra) =>
                            total + mbCompra(compra),
                        0
                    )
            }
        );

    }
    catch (erro) {

        console.error(
            "[MOZ TECH] Erro ao carregar gráficos:",
            erro
        );

    }
    finally {

        carregandoGraficos = false;
    }
}

// ==========================================
// DISPONIBILIZAR FUNÇÃO
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
    carregarGraficos,
    10000
);
