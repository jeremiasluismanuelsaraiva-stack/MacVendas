// ==========================================
// GRÁFICOS DO SISTEMA - MOZ TECH
// Compatível com /relatorios atual:
// resumo, vendas, porDia, compras
// ==========================================

let graficoHoje = null;
let graficoDias = null;
let graficoMeses = null;

function obterNumero(valor) {
    const numero = Number(valor);
    return Number.isFinite(numero) ? numero : 0;
}

function destruirGrafico(grafico) {
    if (!grafico) return;
    try {
        grafico.destroy();
    } catch (erro) {
        console.warn("[MOZ TECH] Erro ao destruir gráfico:", erro);
    }
}

function obterCompras(resposta) {
    if (Array.isArray(resposta?.compras)) return resposta.compras;
    if (Array.isArray(resposta?.vendas)) return resposta.vendas;
    return [];
}

function compraConcluida(compra) {
    const status = String(compra?.status || "concluida").trim().toLowerCase();

    return [
        "concluida", "concluido", "concluída", "concluído",
        "finalizada", "finalizado", "sucesso", "success"
    ].includes(status);
}

function obterDataCompra(compra) {
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

function dataLocalISO(data) {
    const objeto = new Date(data);
    if (Number.isNaN(objeto.getTime())) return "";

    const ano = objeto.getFullYear();
    const mes = String(objeto.getMonth() + 1).padStart(2, "0");
    const dia = String(objeto.getDate()).padStart(2, "0");

    return `${ano}-${mes}-${dia}`;
}

function mesLocal(data) {
    const objeto = new Date(data);
    if (Number.isNaN(objeto.getTime())) return "";

    const ano = objeto.getFullYear();
    const mes = String(objeto.getMonth() + 1).padStart(2, "0");

    return `${ano}-${mes}`;
}

function normalizarRelatorio(resposta) {
    const compras = obterCompras(resposta);

    // Fonte principal: compras devolvidas pelo /relatorios.
    const comprasValidas = compras.filter(compraConcluida);

    const porDia = {};
    const porMes = {};

    comprasValidas.forEach(compra => {
        const data = obterDataCompra(compra);
        if (!data) return;

        const dia = dataLocalISO(data);
        const mes = mesLocal(data);

        if (dia) porDia[dia] = (porDia[dia] || 0) + 1;
        if (mes) porMes[mes] = (porMes[mes] || 0) + 1;
    });

    return {
        compras: comprasValidas,
        porDia,
        porMes
    };
}

async function carregarGraficos() {
    try {
        if (typeof Chart === "undefined") {
            console.error("[MOZ TECH] Chart.js não foi carregado.");
            return;
        }

        if (!window.MOZ_API || typeof window.MOZ_API.get !== "function") {
            console.error("[MOZ TECH] MOZ_API não está disponível.");
            return;
        }

        console.log("[MOZ TECH] Carregando dados dos gráficos...");

        const resposta = await window.MOZ_API.get("/relatorios");

        if (!resposta || resposta.success !== true) {
            throw new Error(
                resposta?.error ||
                resposta?.message ||
                "Erro ao carregar relatórios."
            );
        }

        console.log("[MOZ TECH] Resposta relatórios:", resposta);

        const dados = normalizarRelatorio(resposta);

        console.log("[MOZ TECH] Dados usados nos gráficos:", dados);

        const datas = Object.keys(dados.porDia).sort();
        const meses = Object.keys(dados.porMes).sort();

        // ==========================================
        // GRÁFICO DE HOJE
        // ==========================================

        const canvasHoje = document.getElementById("graficoHoje");

        if (canvasHoje) {
            destruirGrafico(graficoHoje);

            const hoje = dataLocalISO(new Date());
            const quantidadeHoje = obterNumero(dados.porDia[hoje]);

            graficoHoje = new Chart(canvasHoje, {
                type: "bar",
                data: {
                    labels: ["Hoje"],
                    datasets: [{
                        label: "Vendas",
                        data: [quantidadeHoje],
                        borderWidth: 0,
                        borderRadius: 8
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    animation: { duration: 500 },
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            callbacks: {
                                label: context =>
                                    ` ${context.parsed.y} venda(s)`
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: { precision: 0 }
                        }
                    }
                }
            });
        }

        // ==========================================
        // GRÁFICO POR DIA
        // ==========================================

        const canvasDias = document.getElementById("graficoDias");

        if (canvasDias) {
            destruirGrafico(graficoDias);

            const valoresDias = datas.map(data =>
                obterNumero(dados.porDia[data])
            );

            graficoDias = new Chart(canvasDias, {
                type: "line",
                data: {
                    labels: datas,
                    datasets: [{
                        label: "Vendas",
                        data: valoresDias,
                        borderWidth: 3,
                        tension: 0.35,
                        fill: false,
                        pointRadius: 4,
                        pointHoverRadius: 6
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    animation: { duration: 500 },
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            callbacks: {
                                label: context =>
                                    ` ${context.parsed.y} venda(s)`
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: { precision: 0 }
                        }
                    }
                }
            });
        }

        // ==========================================
        // GRÁFICO POR MÊS
        // ==========================================

        const canvasMeses = document.getElementById("graficoMeses");

        if (canvasMeses) {
            destruirGrafico(graficoMeses);

            const valoresMeses = meses.map(mes =>
                obterNumero(dados.porMes[mes])
            );

            graficoMeses = new Chart(canvasMeses, {
                type: "bar",
                data: {
                    labels: meses,
                    datasets: [{
                        label: "Vendas",
                        data: valoresMeses,
                        borderWidth: 0,
                        borderRadius: 8
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    animation: { duration: 500 },
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            callbacks: {
                                label: context =>
                                    ` ${context.parsed.y} venda(s)`
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: { precision: 0 }
                        }
                    }
                }
            });
        }

        console.log("[MOZ TECH] Gráficos carregados com sucesso.", {
            vendasHoje: dados.porDia[dataLocalISO(new Date())] || 0,
            dias: datas.length,
            meses: meses.length,
            comprasConcluidas: dados.compras.length
        });

    } catch (erro) {
        console.error("[MOZ TECH] Erro ao carregar gráficos:", erro);
    }
}

window.carregarGraficos = carregarGraficos;

function iniciarGraficos() {
    console.log("[MOZ TECH] charts.js iniciado.");
    carregarGraficos();
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", iniciarGraficos, { once: true });
} else {
    iniciarGraficos();
}

setInterval(() => {
    carregarGraficos();
}, 10000);
