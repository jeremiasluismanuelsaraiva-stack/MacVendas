"use strict";

(function () {

    let graficoDiario24h = null;
    let graficoFaturamentoMensal = null;
    let graficoSemanalRadial = null;
    let intervaloGraficos = null;

    const CORES = {
        azul: "#2563eb",
        laranja: "#f59e0b",
        vermelho: "#ef4444",
        cinza: "rgba(148,163,184,.16)"
    };

    function numero(valor) {
        const n = Number(valor);
        return Number.isFinite(n) ? n : 0;
    }

    function dataCompra(compra) {
        return compra?.criadoEm || compra?.data || compra?.createdAt || compra?.created_at || null;
    }

    function obterDataLocal(compra) {
        const valor = dataCompra(compra);
        if (!valor) return null;
        const d = new Date(valor);
        return Number.isNaN(d.getTime()) ? null : d;
    }

    function formatarMT(valor) {
        return `${numero(valor).toLocaleString("pt-MZ", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        })} MT`;
    }

    function destruirGrafico(grafico) {
        if (grafico) {
            try { grafico.destroy(); } catch (_) {}
        }
    }

    function obterCompras(resposta) {
        if (!resposta) return [];
        if (Array.isArray(resposta.compras)) return resposta.compras;
        if (Array.isArray(resposta.data?.compras)) return resposta.data.compras;
        if (Array.isArray(resposta.vendas?.compras)) return resposta.vendas.compras;
        return [];
    }

    // ---------------------------------------------------------
    // 1. MOVIMENTOS DE HOJE POR HORA - 00h ... 23h
    // ---------------------------------------------------------
    function criarGraficoDiario24h(compras) {
        const canvas = document.getElementById("graficoDiario24h");
        if (!canvas) return;

        destruirGrafico(graficoDiario24h);

        const agora = new Date();
        const ano = agora.getFullYear();
        const mes = agora.getMonth();
        const dia = agora.getDate();

        const movimentos = Array(24).fill(0);
        const faturamento = Array(24).fill(0);

        compras.forEach(compra => {
            const d = obterDataLocal(compra);
            if (!d) return;

            if (
                d.getFullYear() === ano &&
                d.getMonth() === mes &&
                d.getDate() === dia
            ) {
                const hora = d.getHours();
                movimentos[hora] += 1;
                faturamento[hora] += numero(compra.valor);
            }
        });

        const maior = Math.max(...movimentos, 1);

        const cores = movimentos.map(valor => {
            if (valor === 0) return CORES.azul;
            if (valor >= maior * 0.75) return CORES.vermelho;
            return CORES.laranja;
        });

        graficoDiario24h = new Chart(canvas, {
            type: "bar",
            data: {
                labels: Array.from({ length: 24 }, (_, h) => `${String(h).padStart(2, "0")}h`),
                datasets: [{
                    label: "Movimentos",
                    data: movimentos,
                    backgroundColor: cores,
                    borderRadius: 6,
                    borderSkipped: false,
                    maxBarThickness: 34
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: { duration: 450 },
                interaction: { mode: "index", intersect: false },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            title: items => items.length ? items[0].label : "",
                            label: context => ` Movimentos: ${movimentos[context.dataIndex]}`,
                            afterLabel: context => ` Faturamento: ${formatarMT(faturamento[context.dataIndex])}`
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: { maxRotation: 0, autoSkip: false, font: { size: 10 } }
                    },
                    y: {
                        beginAtZero: true,
                        ticks: { precision: 0 },
                        title: { display: true, text: "Movimentos" }
                    }
                }
            }
        });
    }

    // ---------------------------------------------------------
    // 2. FATURAMENTO MENSAL - DIA 01 ... ÚLTIMO DIA
    // ---------------------------------------------------------
    function criarGraficoFaturamentoMensal(compras) {
        const canvas = document.getElementById("graficoFaturamentoMensal");
        if (!canvas) return;

        destruirGrafico(graficoFaturamentoMensal);

        const agora = new Date();
        const ano = agora.getFullYear();
        const mes = agora.getMonth();
        const ultimoDia = new Date(ano, mes + 1, 0).getDate();

        const faturamento = Array(ultimoDia).fill(0);

        compras.forEach(compra => {
            const d = obterDataLocal(compra);
            if (!d) return;

            if (d.getFullYear() === ano && d.getMonth() === mes) {
                faturamento[d.getDate() - 1] += numero(compra.valor);
            }
        });

        graficoFaturamentoMensal = new Chart(canvas, {
            type: "line",
            data: {
                labels: Array.from({ length: ultimoDia }, (_, i) => String(i + 1).padStart(2, "0")),
                datasets: [{
                    label: "Faturamento",
                    data: faturamento,
                    borderColor: CORES.laranja,
                    backgroundColor: "rgba(245,158,11,.12)",
                    fill: true,
                    tension: 0.35,
                    borderWidth: 3,
                    pointRadius: 3,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: { duration: 450 },
                interaction: { mode: "index", intersect: false },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            title: items => items.length ? `Dia ${items[0].label}` : "",
                            label: context => ` Faturamento: ${formatarMT(context.parsed.y)}`
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: { maxRotation: 0 }
                    },
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: value => formatarMT(value)
                        },
                        title: { display: true, text: "Faturamento (MT)" }
                    }
                }
            }
        });
    }

    // ---------------------------------------------------------
    // 3. ROSCA RADIAL SEMANAL - 7 ANÉIS
    // ---------------------------------------------------------
    function criarGraficoSemanalRadial(compras) {
        const canvas = document.getElementById("graficoSemanalRadial");
        if (!canvas) return;

        destruirGrafico(graficoSemanalRadial);

        const agora = new Date();
        const hoje = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());

        // Segunda = 0 ... Domingo = 6
        const diaSemanaHoje = (hoje.getDay() + 6) % 7;
        const inicioSemana = new Date(hoje);
        inicioSemana.setDate(hoje.getDate() - diaSemanaHoje);

        const dias = [
            "Segunda", "Terça", "Quarta", "Quinta",
            "Sexta", "Sábado", "Domingo"
        ];

        const vendas = Array(7).fill(0);

        compras.forEach(compra => {
            const d = obterDataLocal(compra);
            if (!d) return;

            const data = new Date(d.getFullYear(), d.getMonth(), d.getDate());
            const diferenca = Math.floor((data - inicioSemana) / 86400000);

            if (diferenca >= 0 && diferenca < 7) {
                vendas[diferenca] += 1;
            }
        });

        const maior = Math.max(...vendas, 1);

        const datasets = vendas.map((valor, index) => {
            const raioExterno = 100 - index * 13;
            const raioInterno = raioExterno - 10;

            let cor = CORES.azul;
            if (valor > 0) {
                if (valor >= maior * 0.75) cor = CORES.vermelho;
                else cor = CORES.laranja;
            }

            return {
                label: dias[index],
                data: [valor, Math.max(maior - valor, 0)],
                backgroundColor: [cor, CORES.cinza],
                borderWidth: 1,
                borderColor: "rgba(255,255,255,.35)",
                radius: `${raioExterno}%`,
                cutout: `${raioInterno}%`
            };
        });

        graficoSemanalRadial = new Chart(canvas, {
            type: "doughnut",
            data: {
                labels: dias,
                datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: { duration: 500 },
                plugins: {
                    legend: {
                        position: "right",
                        labels: {
                            usePointStyle: true,
                            padding: 14
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: context => {
                                const index = context.datasetIndex;
                                return ` ${dias[index]}: ${vendas[index]} venda(s)`;
                            }
                        }
                    }
                }
            }
        });
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

            const resposta = await window.MOZ_API.get("/relatorios");

            if (!resposta || resposta.success !== true) {
                throw new Error(resposta?.message || resposta?.error || "Erro ao carregar relatórios.");
            }

            const compras = obterCompras(resposta);

            criarGraficoDiario24h(compras);
            criarGraficoFaturamentoMensal(compras);
            criarGraficoSemanalRadial(compras);

            console.log("[MOZ TECH] Gráficos atualizados:", {
                compras: compras.length,
                movimentosHoje: compras.filter(c => {
                    const d = obterDataLocal(c);
                    if (!d) return false;
                    const agora = new Date();
                    return d.getFullYear() === agora.getFullYear() &&
                        d.getMonth() === agora.getMonth() &&
                        d.getDate() === agora.getDate();
                }).length
            });
        } catch (erro) {
            console.error("[MOZ TECH] Erro nos gráficos:", erro);
        }
    }

    function iniciar() {
        carregarGraficos();

        if (intervaloGraficos) clearInterval(intervaloGraficos);
        intervaloGraficos = setInterval(carregarGraficos, 10000);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", iniciar, { once: true });
    } else {
        iniciar();
    }

    window.carregarGraficos = carregarGraficos;

})();
