*
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
    const hoje = obterHoje();
    const movimentos = Array(24).fill(0);
    const faturamento = Array(24).fill(0);

    compras.forEach(compra => {
        const data = new Date(dataCompra(compra));
        if (Number.isNaN(data.getTime())) return;

        if (dataLocal(data) !== hoje) return;

        const hora = data.getHours();
        movimentos[hora] += 1;
        faturamento[hora] += valorCompra(compra);
    });

    return { movimentos, faturamento };
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
    const mesAtual = obterMesAtual();
    const agora = new Date();
    const ultimoDia = new Date(agora.getFullYear(), agora.getMonth() + 1, 0).getDate();

    const dias = [];
    const faturamento = [];

    for (let dia = 1; dia <= ultimoDia; dia++) {
        const chave = `${mesAtual}-${String(dia).padStart(2, "0")}`;
        dias.push(chave);
        faturamento.push(0);
    }

    compras.forEach(compra => {
        const data = new Date(dataCompra(compra));
        if (Number.isNaN(data.getTime())) return;

        const chave = dataLocal(data);
        const indice = dias.indexOf(chave);
        if (indice >= 0) faturamento[indice] += valorCompra(compra);
    });

    return { dias, faturamento };
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

async function carregarGraficos() {
    if (carregandoGraficos) return;
    carregandoGraficos = true;

    try {
        if (typeof Chart === "undefined") {
            console.error("[MOZ TECH] Chart.js não foi carregado.");
            return;
        }

        const compras = await extrairComprasGraficos();

        console.log(
            "[MOZ TECH] Total de compras recebidas:",
            compras.length
        );

        const diario = calcularDadosDiarios(compras);
        const mensal = calcularFaturamentoMensal(compras);

        criarGraficoDiario24h(diario);
        criarGraficoSemanalRadial(compras);
        criarGraficoFaturamentoMensal(mensal);

        console.log("[MOZ TECH] 3 gráficos carregados.", {
            compras: compras.length,
            movimentosHoje: diario.movimentos.reduce((a, b) => a + b, 0),
            faturamentoMes: mensal.faturamento.reduce((a, b) => a + b, 0)
        });
    } catch (erro) {
        console.error("[MOZ TECH] Erro nos gráficos:", erro);
    } finally {
        carregandoGraficos = false;
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

setInterval(carregarGraficos, 10000);
