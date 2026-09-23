/*
 ORDEM DOS GRÁFICOS:
 1. DIÁRIO
 2. SEMANAL
 3. MENSAL

 Este arquivo mantém as funções existentes e deve ser carregado nesta ordem.
*/
// ============================================================
// MOZ TECH - 3 GRÁFICOS
// 1) Movimentos de hoje - 00h às 23h
// 2) Faturamento mensal
// 3) Rosca radial semanal
// ============================================================

let graficoDiario24h = null;
let graficoFaturamentoMensal = null;
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
    try { grafico.destroy(); } catch (_) {}
}

function compraConcluida(compra) {
    const status = String(compra?.status || "concluida").trim().toLowerCase();
    return [
        "concluida", "concluido", "concluída", "concluído",
        "finalizada", "finalizado", "sucesso", "success"
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

function valorCompra(compra) {
    return numero(compra?.valor);
}

function dataLocal(valor) {
    const d = new Date(valor);
    if (Number.isNaN(d.getTime())) return "";
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function obterHoje() {
    const d = new Date();
    return dataLocal(d);
}

function obterMesAtual() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function formatarData(valor) {
    const p = String(valor).split("-");
    return p.length === 3 ? `${p[2]}/${p[1]}` : valor;
}

function obterSemanaAtual() {
    const hoje = new Date();
    const resultado = [];
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

function nivelCor(valor, maior) {
    if (valor === 0 || valor <= maior * 0.35) return CORES_MOZ.azul;
    if (valor >= maior * 0.75) return CORES_MOZ.vermelho;
    return CORES_MOZ.laranja;
}

// ============================================================
// 1. MOVIMENTOS DE HOJE - 24 HORAS
// ============================================================

function calcularDadosDiarios(compras) {
    const agora = new Date();
    const ano = agora.getFullYear();
    const mes = agora.getMonth();
    const dia = agora.getDate();

    const vendas = Array(24).fill(0);
    const gb = Array(24).fill(0);
    const mb = Array(24).fill(0);

    compras.forEach(compra => {
        const data = new Date(compra.criadoEm || compra.data || compra.createdAt);
        if (isNaN(data.getTime()) ||
            data.getFullYear() !== ano ||
            data.getMonth() !== mes ||
            data.getDate() !== dia) return;

        const hora = data.getHours();
        const mbCompra = Number(compra.mb || 0);
        const gbCompra = Number(compra.gb || 0) || (mbCompra / 1000);

        vendas[hora] += 1;
        mb[hora] += mbCompra;
        gb[hora] += gbCompra;
    });

    return { vendas, gb, mb };
}

function criarGraficoDiario24h(dados) {
    const canvas = document.getElementById("graficoDiario24h");
    if (!canvas) return;

    destruir(graficoDiario24h);

    const maior = Math.max(...dados.movimentos, 1);
    const cores = dados.movimentos.map(v => nivelCor(v, maior));

    graficoDiario24h = new Chart(canvas, {
        type: "bar",
        data: {
            labels: Array.from({ length: 24 }, (_, h) => `${String(h).padStart(2, "0")}h`),
            datasets: [{
                label: "Movimentos",
                data: dados.movimentos,
                backgroundColor: cores,
                borderRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: context => ` Movimentos: ${numero(context.parsed.y)}`,
                        afterLabel: context =>
                            ` Faturamento: ${numero(dados.faturamento[context.dataIndex]).toLocaleString("pt-MZ")} MT`
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { precision: 0 },
                    title: { display: true, text: "Movimentos" }
                }
            }
        }
    });
}

// ============================================================
// 2. FATURAMENTO MENSAL
// ============================================================

function calcularFaturamentoMensal(compras) {
    const agora = new Date();
    const ano = agora.getFullYear();
    const mes = agora.getMonth();
    const diasNoMes = new Date(ano, mes + 1, 0).getDate();

    const faturamento = Array(diasNoMes).fill(0);
    const gb = Array(diasNoMes).fill(0);
    const mb = Array(diasNoMes).fill(0);

    compras.forEach(compra => {
        const data = new Date(compra.criadoEm || compra.data || compra.createdAt);
        if (isNaN(data.getTime()) ||
            data.getFullYear() !== ano ||
            data.getMonth() !== mes) return;

        const dia = data.getDate() - 1;
        const mbCompra = Number(compra.mb || 0);
        const gbCompra = Number(compra.gb || 0) || (mbCompra / 1000);

        faturamento[dia] += Number(compra.valor || 0);
        mb[dia] += mbCompra;
        gb[dia] += gbCompra;
    });

    return { faturamento, gb, mb };
}

function criarGraficoFaturamentoMensal(dados) {
    const canvas = document.getElementById("graficoFaturamentoMensal");
    if (!canvas) return;

    destruir(graficoFaturamentoMensal);

    graficoFaturamentoMensal = new Chart(canvas, {
        type: "line",
        data: {
            labels: dados.dias.map(formatarData),
            datasets: [{
                label: "Faturamento",
                data: dados.faturamento,
                borderColor: CORES_MOZ.laranja,
                backgroundColor: "rgba(245, 158, 11, 0.16)",
                fill: true,
                borderWidth: 3,
                tension: 0.35,
                pointRadius: 4,
                pointHoverRadius: 6
            }]
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
                        label: context =>
                            ` Faturamento: ${numero(context.parsed.y).toLocaleString("pt-MZ")} MT`
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: value =>
                            `${numero(value).toLocaleString("pt-MZ")} MT`
                    },
                    title: { display: true, text: "Faturamento (MT)" }
                }
            }
        }
    });
}

// ============================================================
// 3. ROSCA RADIAL SEMANAL
// ============================================================

function criarGraficoSemanalRadial(compras) {
    const canvas = document.getElementById("graficoSemanalRadial");
    if (!canvas) return;

    destruir(graficoSemanalRadial);

    const dias = obterSemanaAtual();
    const vendas = dias.map(dia =>
        compras.filter(compra => dataLocal(dataCompra(compra)) === dia).length
    );

    const maior = Math.max(...vendas, 1);

    const datasets = dias.map((dia, index) => {
        const valor = vendas[index];

        return {
            label: formatarData(dia),
            data: [valor, Math.max(maior - valor, 0)],
            backgroundColor: [
                nivelCor(valor, maior),
                "rgba(148, 163, 184, 0.12)"
            ],
            borderWidth: 2
        };
    });

    graficoSemanalRadial = new Chart(canvas, {
        type: "doughnut",
        data: {
            labels: dias.map(formatarData),
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
                        label: context => {
                            const index = context.datasetIndex;
                            return ` ${formatarData(dias[index])}: ${vendas[index]} venda(s)`;
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

async function extrairComprasGraficos() {
    if (typeof window.garantirCredenciaisAPI === "function") {
        const autenticado = await window.garantirCredenciaisAPI();
        if (!autenticado) {
            throw new Error("Credenciais da API não encontradas.");
        }
    }

    if (!window.MOZ_API || typeof window.MOZ_API.get !== "function") {
        throw new Error("MOZ_API ainda não está disponível.");
    }

    const resposta = await window.MOZ_API.get("/compras");

    console.log("[MOZ TECH] Resposta /compras:", resposta);

    if (!resposta || resposta.success === false) {
        throw new Error(
            resposta?.message ||
            resposta?.error ||
            "Erro ao carregar compras."
        );
    }

    if (Array.isArray(resposta)) return resposta;
    if (Array.isArray(resposta.compras)) return resposta.compras;
    if (Array.isArray(resposta.vendas)) return resposta.vendas;
    if (Array.isArray(resposta.data)) return resposta.data;
    if (resposta.data && Array.isArray(resposta.data.compras)) {
        return resposta.data.compras;
    }
    if (resposta.data && Array.isArray(resposta.data.vendas)) {
        return resposta.data.vendas;
    }

    return [];
}

let carregandoGraficos = false;

function calcularDadosSemanais(compras) {
    const agora = new Date();
    const inicioSemana = new Date(agora);
    const diaSemana = agora.getDay();
    const deslocamento = diaSemana === 0 ? 6 : diaSemana - 1;

    inicioSemana.setDate(agora.getDate() - deslocamento);
    inicioSemana.setHours(0, 0, 0, 0);

    const vendas = Array(7).fill(0);
    const gb = Array(7).fill(0);
    const mb = Array(7).fill(0);

    compras.forEach(compra => {
        const data = new Date(compra.criadoEm || compra.data || compra.createdAt);
        if (isNaN(data.getTime())) return;

        const dia = new Date(data);
        dia.setHours(0, 0, 0, 0);
        const diferenca = Math.floor(
            (dia.getTime() - inicioSemana.getTime()) / 86400000
        );

        if (diferenca < 0 || diferenca > 6) return;

        const mbCompra = Number(compra.mb || 0);
        const gbCompra = Number(compra.gb || 0) || (mbCompra / 1000);

        vendas[diferenca] += 1;
        mb[diferenca] += mbCompra;
        gb[diferenca] += gbCompra;
    });

    return { vendas, gb, mb };
}

async function carregarGraficos() {
    try {
        if (typeof Chart === "undefined") {
            console.warn("[MOZ TECH] Chart.js ainda não está disponível.");
            return;
        }

        const compras = await extrairComprasGraficos();

        const diario = calcularDadosDiarios(compras);
        const semanal = calcularDadosSemanais(compras);
        const mensal = calcularFaturamentoMensal(compras);

        destruirGrafico("graficoDiario24h");
        destruirGrafico("graficoSemanalRadial");
        destruirGrafico("graficoFaturamentoMensal");

        const ctxDiario = document.getElementById("graficoDiario24h");
        if (ctxDiario) {
            graficos.graficoDiario24h = new Chart(ctxDiario, {
                type: "line",
                data: {
                    labels: Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, "0")}h`),
                    datasets: [
                        { label: "Vendas", data: diario.vendas, yAxisID: "y" },
                        { label: "GB", data: diario.gb, yAxisID: "gb", tension: 0.3 },
                        { label: "MB", data: diario.mb, yAxisID: "mb", tension: 0.3 }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: { mode: "index", intersect: false },
                    scales: {
                        y: { beginAtZero: true, title: { display: true, text: "Vendas" } },
                        gb: {
                            position: "right", beginAtZero: true,
                            grid: { drawOnChartArea: false },
                            title: { display: true, text: "GB" }
                        },
                        mb: { display: false, beginAtZero: true }
                    },
                    plugins: {
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const v = context.parsed.y || 0;
                                    if (context.dataset.label === "GB") return `GB: ${v.toFixed(2)} GB`;
                                    if (context.dataset.label === "MB") return `MB: ${v.toFixed(0)} MB`;
                                    return `Vendas: ${v}`;
                                }
                            }
                        }
                    }
                }
            });
        }

        const ctxSemanal = document.getElementById("graficoSemanalRadial");
        if (ctxSemanal) {
            graficos.graficoSemanalRadial = new Chart(ctxSemanal, {
                type: "doughnut",
                data: {
                    labels: ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"],
                    datasets: [{ label: "GB vendidos", data: semanal.gb, borderWidth: 2 }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: "45%",
                    plugins: {
                        legend: { position: "right" },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const i = context.dataIndex;
                                    return [
                                        `${context.label}:`,
                                        `GB: ${semanal.gb[i].toFixed(2)} GB`,
                                        `MB: ${semanal.mb[i].toFixed(0)} MB`,
                                        `Vendas: ${semanal.vendas[i]}`
                                    ];
                                }
                            }
                        }
                    }
                }
            });
        }

        const ctxMensal = document.getElementById("graficoFaturamentoMensal");
        if (ctxMensal) {
            const labels = mensal.faturamento.map((_, i) => String(i + 1).padStart(2, "0"));

            graficos.graficoFaturamentoMensal = new Chart(ctxMensal, {
                type: "bar",
                data: {
                    labels,
                    datasets: [
                        { label: "Faturamento (MT)", data: mensal.faturamento, yAxisID: "dinheiro" },
                        { label: "GB vendidos", data: mensal.gb, type: "line", yAxisID: "gb", tension: 0.3 },
                        { label: "MB vendidos", data: mensal.mb, type: "line", yAxisID: "mb", tension: 0.3 }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: { mode: "index", intersect: false },
                    scales: {
                        dinheiro: { beginAtZero: true, title: { display: true, text: "MT" } },
                        gb: {
                            position: "right", beginAtZero: true,
                            grid: { drawOnChartArea: false },
                            title: { display: true, text: "GB" }
                        },
                        mb: { display: false, beginAtZero: true }
                    },
                    plugins: {
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const i = context.dataIndex;
                                    if (context.dataset.label === "Faturamento (MT)")
                                        return `Faturamento: ${mensal.faturamento[i].toFixed(2)} MT`;
                                    if (context.dataset.label === "GB vendidos")
                                        return `GB: ${mensal.gb[i].toFixed(2)} GB`;
                                    return `MB: ${mensal.mb[i].toFixed(0)} MB`;
                                }
                            }
                        }
                    }
                }
            });
        }

        console.log("[MOZ TECH] Gráficos carregados:", {
            compras: compras.length,
            hojeGB: diario.gb.reduce((a, b) => a + b, 0),
            hojeMB: diario.mb.reduce((a, b) => a + b, 0),
            semanaGB: semanal.gb.reduce((a, b) => a + b, 0),
            mesGB: mensal.gb.reduce((a, b) => a + b, 0)
        });
    } catch (erro) {
        console.error("[MOZ TECH] Erro ao carregar gráficos:", erro);
    }
}

window.carregarGraficos = carregarGraficos;

function iniciarGraficos() {
    setTimeout(carregarGraficos, 300);
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", iniciarGraficos, { once: true });
} else {
    iniciarGraficos();
}

let intervaloGraficos = null;

function iniciarAtualizacaoAutomaticaGraficos() {
    if (intervaloGraficos) {
        clearInterval(intervaloGraficos);
    }

    intervaloGraficos = setInterval(
        carregarGraficos,
        10000
    );
}

iniciarAtualizacaoAutomaticaGraficos();
