// ============================================================
// MOZ TECH - GRÁFICOS
// 1) Colunas empilhadas - vendas semanal
// 2) Linhas múltiplas - vendas + faturamento (MT)
// 3) Rosca concêntrica/radial - vendas semanal
// ============================================================

let graficoVendasEmpilhadas = null;
let graficoVendasFaturamento = null;
let graficoSemanalRadial = null;

const CORES_MOZ = {
    azul: "#3b82f6",
    laranja: "#f59e0b",
    vermelho: "#ef4444",
    cinza: "#64748b"
};

function numero(v) {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
}

function destruir(grafico) {
    if (!grafico) return;
    try {
        grafico.destroy();
    } catch (_) {}
}

function compraConcluida(compra) {
    const status = String(compra?.status || "concluida")
        .trim()
        .toLowerCase();

    return [
        "concluida",
        "concluido",
        "concluída",
        "concluído",
        "finalizada",
        "finalizado",
        "sucesso",
        "success"
    ].includes(status);
}

function dataCompra(compra) {
    return (
        compra?.criadoEm ||
        compra?.criado_em ||
        compra?.data ||
        compra?.dataCompra ||
        compra?.createdAt ||
        compra?.created_at ||
        ""
    );
}

function dataLocal(valor) {
    const d = new Date(valor);

    if (Number.isNaN(d.getTime())) {
        return "";
    }

    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function formatarDia(valor) {
    const p = String(valor).split("-");

    if (p.length !== 3) {
        return valor;
    }

    return `${p[2]}/${p[1]}`;
}

function valorCompra(compra) {
    return numero(compra?.valor);
}

function obterSemanaAtual() {
    const hoje = new Date();
    const resultado = [];

    // Segunda-feira até domingo
    const diaSemana = hoje.getDay();
    const deslocamento = diaSemana === 0 ? -6 : 1 - diaSemana;

    const segunda = new Date(hoje);
    segunda.setDate(hoje.getDate() + deslocamento);
    segunda.setHours(0, 0, 0, 0);

    for (let i = 0; i < 7; i++) {
        const dia = new Date(segunda);
        dia.setDate(segunda.getDate() + i);
        resultado.push(dataLocal(dia));
    }

    return resultado;
}

function calcularDadosSemanais(compras) {
    const dias = obterSemanaAtual();

    const vendas = {};
    const faturamento = {};

    dias.forEach(dia => {
        vendas[dia] = 0;
        faturamento[dia] = 0;
    });

    compras.forEach(compra => {
        const dia = dataLocal(dataCompra(compra));

        if (!dia || !(dia in vendas)) {
            return;
        }

        vendas[dia] += 1;
        faturamento[dia] += valorCompra(compra);
    });

    return {
        dias,
        vendas: dias.map(dia => vendas[dia]),
        faturamento: dias.map(dia => faturamento[dia])
    };
}

// ============================================================
// 1. COLUNAS EMPILHADAS - VENDAS SEMANAL
// ============================================================

function criarGraficoVendasEmpilhadas(dados) {
    const canvas = document.getElementById("graficoVendasEmpilhadas");

    if (!canvas) {
        console.warn(
            "[MOZ TECH] Canvas #graficoVendasEmpilhadas não encontrado."
        );
        return;
    }

    destruir(graficoVendasEmpilhadas);

    // Cada dia fica dividido em vendas concluídas e restante da escala.
    // A coluna continua sendo uma visualização semanal de vendas.
    const maximo = Math.max(...dados.vendas, 1);

    const altas = dados.vendas.map(v => v >= maximo * 0.75 ? v : 0);
    const normais = dados.vendas.map(v =>
        v > 0 && v < maximo * 0.75 ? v : 0
    );

    graficoVendasEmpilhadas = new Chart(canvas, {
        type: "bar",

        data: {
            labels: dados.dias.map(formatarDia),

            datasets: [
                {
                    label: "Vendas altas",
                    data: altas,
                    backgroundColor: CORES_MOZ.vermelho,
                    stack: "vendas",
                    borderRadius: 5
                },
                {
                    label: "Vendas normais/baixas",
                    data: normais,
                    backgroundColor: CORES_MOZ.laranja,
                    stack: "vendas",
                    borderRadius: 5
                }
            ]
        },

        options: {
            responsive: true,
            maintainAspectRatio: false,

            plugins: {
                tooltip: {
                    callbacks: {
                        footer: function(items) {
                            const index = items[0]?.dataIndex ?? 0;

                            return `Total: ${dados.vendas[index] || 0} venda(s)`;
                        }
                    }
                }
            },

            scales: {
                x: {
                    stacked: true
                },

                y: {
                    stacked: true,
                    beginAtZero: true,
                    ticks: {
                        precision: 0
                    },

                    title: {
                        display: true,
                        text: "Vendas"
                    }
                }
            }
        }
    });
}

// ============================================================
// 2. LINHAS MÚLTIPLAS - VENDAS + FATURAMENTO
// ============================================================

function criarGraficoVendasFaturamento(dados) {
    const canvas = document.getElementById("graficoVendasFaturamento");

    if (!canvas) {
        console.warn(
            "[MOZ TECH] Canvas #graficoVendasFaturamento não encontrado."
        );
        return;
    }

    destruir(graficoVendasFaturamento);

    graficoVendasFaturamento = new Chart(canvas, {
        type: "line",

        data: {
            labels: dados.dias.map(formatarDia),

            datasets: [
                {
                    label: "Vendas",
                    data: dados.vendas,
                    borderColor: CORES_MOZ.azul,
                    backgroundColor: CORES_MOZ.azul,
                    borderWidth: 3,
                    tension: 0.35,
                    pointRadius: 5,
                    pointHoverRadius: 7,
                    yAxisID: "yVendas"
                },

                {
                    label: "Faturamento",
                    data: dados.faturamento,
                    borderColor: CORES_MOZ.laranja,
                    backgroundColor: CORES_MOZ.laranja,
                    borderWidth: 3,
                    tension: 0.35,
                    pointRadius: 5,
                    pointHoverRadius: 7,
                    yAxisID: "yMT"
                }
            ]
        },

        options: {
            responsive: true,
            maintainAspectRatio: false,

            interaction: {
                mode: "index",
                intersect: false
            },

            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const valor = context.parsed.y;

                            if (context.dataset.label === "Faturamento") {
                                return ` Faturamento: ${numero(valor).toLocaleString("pt-MZ")} MT`;
                            }

                            return ` Vendas: ${numero(valor)}`;
                        }
                    }
                }
            },

            scales: {
                yVendas: {
                    type: "linear",
                    position: "left",
                    beginAtZero: true,

                    ticks: {
                        precision: 0
                    },

                    title: {
                        display: true,
                        text: "Vendas"
                    }
                },

                yMT: {
                    type: "linear",
                    position: "right",
                    beginAtZero: true,

                    grid: {
                        drawOnChartArea: false
                    },

                    ticks: {
                        callback: value =>
                            `${numero(value).toLocaleString("pt-MZ")} MT`
                    },

                    title: {
                        display: true,
                        text: "Faturamento (MT)"
                    }
                }
            }
        }
    });
}

// ============================================================
// 3. ROSCA CONCÊNTRICA / RADIAL - SEMANAL
// ============================================================

function criarGraficoSemanalRadial(dados) {
    const canvas = document.getElementById("graficoSemanalRadial");

    if (!canvas) {
        console.warn(
            "[MOZ TECH] Canvas #graficoSemanalRadial não encontrado."
        );
        return;
    }

    destruir(graficoSemanalRadial);

    // Cada anel representa um dia da semana.
    // O valor preenchido representa as vendas daquele dia.
    const maior = Math.max(...dados.vendas, 1);

    const datasets = dados.dias.map((dia, index) => {

        const vendas = dados.vendas[index];

        return {
            label: formatarDia(dia),
            data: [
                vendas,
                Math.max(maior - vendas, 0)
            ],
            backgroundColor: [
                vendas >= maior * 0.75
                    ? CORES_MOZ.vermelho
                    : vendas === 0
                        ? CORES_MOZ.azul
                        : CORES_MOZ.laranja,

                "rgba(148, 163, 184, 0.12)"
            ],
            borderWidth: 2
        };
    });

    graficoSemanalRadial = new Chart(canvas, {
        type: "doughnut",

        data: {
            labels: dados.dias.map(formatarDia),
            datasets
        },

        options: {
            responsive: true,
            maintainAspectRatio: false,

            cutout: "35%",

            plugins: {
                legend: {
                    position: "right"
                },

                tooltip: {
                    callbacks: {
                        label: function(context) {

                            const datasetIndex =
                                context.datasetIndex;

                            const valor =
                                dados.vendas[datasetIndex] || 0;

                            const dia =
                                formatarDia(
                                    dados.dias[datasetIndex]
                                );

                            return ` ${dia}: ${valor} venda(s)`;
                        }
                    }
                }
            }
        }
    });
}

// ============================================================
// CARREGAR
// ============================================================

async function carregarGraficos() {

    try {

        if (typeof Chart === "undefined") {
            console.error("[MOZ TECH] Chart.js não foi carregado.");
            return;
        }

        if (
            !window.MOZ_API ||
            typeof window.MOZ_API.get !== "function"
        ) {
            console.error("[MOZ TECH] MOZ_API não está disponível.");
            return;
        }

        console.log(
            "[MOZ TECH] Carregando gráficos semanais..."
        );

        const resposta =
            await window.MOZ_API.get("/relatorios");

        if (
            !resposta ||
            resposta.success !== true
        ) {
            throw new Error(
                resposta?.message ||
                resposta?.error ||
                "Erro ao carregar relatórios."
            );
        }

        const compras =
            Array.isArray(resposta.compras)
                ? resposta.compras.filter(compraConcluida)
                : [];

        const dadosSemanais =
            calcularDadosSemanais(compras);

        console.log(
            "[MOZ TECH] Dados semanais:",
            dadosSemanais
        );

        criarGraficoVendasEmpilhadas(
            dadosSemanais
        );

        criarGraficoVendasFaturamento(
            dadosSemanais
        );

        criarGraficoSemanalRadial(
            dadosSemanais
        );

        console.log(
            "[MOZ TECH] Gráficos semanais carregados."
        );

    } catch (erro) {

        console.error(
            "[MOZ TECH] Erro nos gráficos:",
            erro
        );
    }
}

window.carregarGraficos = carregarGraficos;

function iniciarGraficos() {

    console.log(
        "[MOZ TECH] charts.js iniciado."
    );

    carregarGraficos();
}

if (document.readyState === "loading") {

    document.addEventListener(
        "DOMContentLoaded",
        iniciarGraficos,
        { once: true }
    );

} else {

    iniciarGraficos();
}

setInterval(
    carregarGraficos,
    10000
);
