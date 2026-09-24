/* =========================================================
   MOZ TECH / MACVENDAS
   PEDIDOS — FILA EM CARDS
   Estados:
   PENDENTE
   PROCESSANDO
   CONCLUIDO
   FALHADO
   CANCELADO
   ========================================================= */

"use strict";

if (window.__MOZ_PEDIDOS_MODULO_INICIADO__) {
    console.warn("[PEDIDOS] Módulo já iniciado. Ignorando segunda inicialização.");
} else {
    window.__MOZ_PEDIDOS_MODULO_INICIADO__ = true;


(function () {

    const VERSAO = "pedidos-resumo-alinhado-modal-20260924-v4";

    let pedidos = [];
    let filtroAtual = "todos";
    let carregando = false;
    let timerAtualizacao = null;

    const STATUS = {
        pendente: {
            texto: "Pendente",
            classe: "pendente",
            icone: "fa-clock"
        },
        processando: {
            texto: "Em processamento",
            classe: "processando",
            icone: "fa-spinner"
        },
        concluido: {
            texto: "Concluído",
            classe: "concluido",
            icone: "fa-check-circle"
        },
        falhado: {
            texto: "Falhado",
            classe: "falhado",
            icone: "fa-circle-xmark"
        },
        cancelado: {
            texto: "Cancelado",
            classe: "cancelado",
            icone: "fa-ban"
        }
    };

    function el(id) {
        return document.getElementById(id);
    }

    function escapeHtml(valor) {
        return String(valor ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function numero(valor) {
        const n = Number(valor);
        return Number.isFinite(n) ? n : 0;
    }

    function dinheiro(valor) {
        return numero(valor).toLocaleString("pt-MZ", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }) + " MT";
    }

    function dataHora(valor) {
        if (!valor) return "-";
        const d = new Date(valor);
        if (Number.isNaN(d.getTime())) return String(valor);

        return d.toLocaleString("pt-MZ", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    }

    function normalizarStatus(status) {
        const s = String(status || "pendente")
            .trim()
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");

        if (["processando", "processamento", "em_processamento"].includes(s)) {
            return "processando";
        }

        if (["concluido", "concluida", "sucesso", "success"].includes(s)) {
            return "concluido";
        }

        if (["falhado", "falhou", "erro", "failed"].includes(s)) {
            return "falhado";
        }

        if (["cancelado", "cancelada", "cancelled"].includes(s)) {
            return "cancelado";
        }

        return "pendente";
    }

    function normalizarPedido(p) {
        p = p && typeof p === "object" ? p : {};

        return {
            ...p,
            id: p.id || p.pedidoId || p.idPedido || "-",
            status: normalizarStatus(p.status),
            nomeCliente:
                p.nomeCliente ||
                p.cliente ||
                p.nome ||
                "-",
            numeroCliente:
                p.numeroCliente ||
                p.numero ||
                p.telefone ||
                "-",
            numeroRecebeu:
                p.numeroRecebeu ||
                p.numeroDestino ||
                p.destino ||
                "-",
            pacote:
                p.pacote ||
                p.nomePacote ||
                "-",
            gb:
                numero(p.gb || p.quantidadeGB || p.quantidadeGb),
            mb:
                numero(p.mb || p.quantidadeMB || p.quantidadeMb),
            valor:
                numero(p.valor || p.preco || p.total),
            grupo:
                p.grupo ||
                p.nomeGrupo ||
                "-",
            dispositivo:
                p.dispositivo ||
                p.aparelho ||
                p.device ||
                "-",
            tentativas:
                numero(p.tentativas || p.tentativa),
            criadoEm:
                p.criadoEm ||
                p.createdAt ||
                p.data ||
                null,
            iniciadoEm:
                p.iniciadoEm ||
                p.processadoEm ||
                null,
            concluidoEm:
                p.concluidoEm ||
                p.finalizadoEm ||
                null,
            atualizadoEm:
                p.atualizadoEm ||
                p.updatedAt ||
                null,
            erro:
                p.erro ||
                p.mensagemErro ||
                p.error ||
                ""
        };
    }

    async function apiGetPedidos() {
        if (window.MOZ_API && typeof window.MOZ_API.get === "function") {
            return await window.MOZ_API.get("/pedidos");
        }

        const resposta = await fetch("/api/pedidos", {
            headers: headersAPI()
        });

        if (!resposta.ok) {
            throw new Error("HTTP " + resposta.status);
        }

        return await resposta.json();
    }

    async function apiPutPedido(id, dados) {
        if (window.MOZ_API && typeof window.MOZ_API.put === "function") {
            return await window.MOZ_API.put(
                "/pedidos/" + encodeURIComponent(id),
                dados
            );
        }

        const resposta = await fetch(
            "/api/pedidos/" + encodeURIComponent(id),
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    ...headersAPI()
                },
                body: JSON.stringify(dados)
            }
        );

        if (!resposta.ok) {
            throw new Error("HTTP " + resposta.status);
        }

        return await resposta.json();
    }

    function headersAPI() {
        const headers = {};

        const apiKey =
            localStorage.getItem("apiKey") ||
            localStorage.getItem("moz_api_key") ||
            localStorage.getItem("API_KEY");

        const uid =
            localStorage.getItem("uid") ||
            localStorage.getItem("moz_uid") ||
            localStorage.getItem("UID");

        if (apiKey) headers["x-api-key"] = apiKey;
        if (uid) headers["x-uid"] = uid;

        return headers;
    }

    function obterListaResposta(json) {
        if (Array.isArray(json)) return json;
        if (json && Array.isArray(json.pedidos)) return json.pedidos;
        if (json && Array.isArray(json.data)) return json.data;
        if (json && json.data && Array.isArray(json.data.pedidos)) {
            return json.data.pedidos;
        }
        return [];
    }

    function montarInterface() {
        const container =
            el("pedidosConteudo") ||
            el("listaPedidos") ||
            el("pedidosLista");

        if (!container) {
            console.warn("[PEDIDOS] Container não encontrado.");
            return null;
        }

        container.innerHTML = `
            <div class="pedidos-fila-app">

                <div class="pedidos-gestao-card">
                    <div>
                        <span class="pedidos-label">Gestão</span>
                        <h2>Fila de Pedidos</h2>
                        <p>
                            Cada pedido passa pela fila antes de ser enviado
                            para processamento.
                        </p>
                    </div>

                    <button
                        type="button"
                        class="pedidos-btn atualizar"
                        onclick="window.atualizarPedidos()">
                        <i class="fas fa-rotate"></i>
                        <span>Atualizar fila</span>
                    </button>
                </div>

                <div id="pedidosEstatisticas" class="pedidos-stats-grid"></div>

                <div class="pedidos-filtros-card">
                    <div class="pedidos-filtros-titulo">
                        <strong>Fila</strong>
                        <span>Filtrar pedidos por estado</span>
                    </div>

                    <div id="pedidosFiltros" class="pedidos-filtros-grid">
                        ${filtroCard("todos", "Todos", "fa-layer-group")}
                        ${filtroCard("pendente", "Pendentes", "fa-clock")}
                        ${filtroCard("processando", "Em processamento", "fa-spinner")}
                        ${filtroCard("concluido", "Concluídos", "fa-check-circle")}
                        ${filtroCard("falhado", "Falhados", "fa-circle-xmark")}
                        ${filtroCard("cancelado", "Cancelados", "fa-ban")}
                    </div>
                </div>

                <div class="pedidos-lista-header">
                    <div>
                        <strong id="pedidosTituloLista">Todos os pedidos</strong>
                        <span id="pedidosQuantidadeLista">0 pedidos</span>
                    </div>
                </div>

                <div id="pedidosCards" class="pedidos-cards-grid">
                    <div class="pedidos-loading-card">
                        <i class="fas fa-spinner fa-spin"></i>
                        <span>Carregando pedidos...</span>
                    </div>
                </div>

            </div>

            <style>
                .pedidos-fila-app {
                    width: 100%;
                    display: flex;
                    flex-direction: column;
                    gap: 18px;
                }

                .pedidos-gestao-card,
                .pedidos-filtros-card {
                    background: var(--card-bg, #111827);
                    border: 1px solid rgba(255,255,255,.08);
                    border-radius: 18px;
                    padding: 22px;
                    box-shadow: 0 10px 30px rgba(0,0,0,.12);
                }

                .pedidos-gestao-card {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 20px;
                }

                .pedidos-label {
                    display: inline-block;
                    font-size: 12px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: .08em;
                    opacity: .65;
                    margin-bottom: 5px;
                }

                .pedidos-gestao-card h2 {
                    margin: 0 0 5px;
                    font-size: 25px;
                }

                .pedidos-gestao-card p {
                    margin: 0;
                    opacity: .68;
                }

                .pedidos-btn {
                    border: 0;
                    border-radius: 12px;
                    padding: 12px 17px;
                    cursor: pointer;
                    font-weight: 700;
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                }

                .pedidos-btn.atualizar {
                    background: #2563eb;
                    color: #fff;
                }

                .pedidos-stats-grid {
                    display: grid;
                    grid-template-columns: repeat(6, minmax(0,1fr));
                    gap: 14px;
                }

                .pedido-stat-card {
                    background: var(--card-bg, #111827);
                    border: 1px solid rgba(255,255,255,.08);
                    border-radius: 16px;
                    padding: 18px;
                    min-height: 105px;
                }

                .pedido-stat-card .icone {
                    width: 34px;
                    height: 34px;
                    border-radius: 10px;
                    display: grid;
                    place-items: center;
                    background: rgba(255,255,255,.07);
                    margin-bottom: 12px;
                }

                .pedido-stat-card .valor {
                    font-size: 27px;
                    font-weight: 800;
                }

                .pedido-stat-card .nome {
                    margin-top: 3px;
                    font-size: 12px;
                    opacity: .62;
                }

                .pedidos-filtros-titulo {
                    margin-bottom: 14px;
                }

                .pedidos-filtros-titulo strong {
                    display: block;
                    font-size: 17px;
                }

                .pedidos-filtros-titulo span {
                    font-size: 13px;
                    opacity: .62;
                }

                .pedidos-filtros-grid {
                    display: grid;
                    grid-template-columns: repeat(6, minmax(0,1fr));
                    gap: 12px;
                }

                .pedido-filtro {
                    border: 1px solid rgba(255,255,255,.08);
                    background: rgba(255,255,255,.035);
                    border-radius: 14px;
                    padding: 15px 12px;
                    cursor: pointer;
                    transition: .18s ease;
                    color: inherit;
                    text-align: left;
                }

                .pedido-filtro:hover {
                    transform: translateY(-2px);
                    border-color: rgba(37,99,235,.45);
                }

                .pedido-filtro.ativo {
                    border-color: #2563eb;
                    background: rgba(37,99,235,.14);
                }

                .pedido-filtro i {
                    display: block;
                    margin-bottom: 9px;
                }

                .pedido-filtro strong {
                    display: block;
                    font-size: 13px;
                }

                .pedido-filtro small {
                    display: block;
                    margin-top: 3px;
                    opacity: .58;
                }

                .pedidos-lista-header {
                    background: var(--card-bg, #111827);
                    border: 1px solid rgba(255,255,255,.08);
                    border-radius: 14px;
                    padding: 15px 18px;
                }

                .pedidos-lista-header > div {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 10px;
                }

                #pedidosQuantidadeLista {
                    font-size: 13px;
                    opacity: .6;
                }

                .pedidos-cards-grid {
                    display: flex !important;
                    flex-direction: column !important;
                    gap: 10px !important;
                    width: 100% !important;
                }

                .pedido-card {
                    width: 100% !important;
                    max-width: none !important;
                    box-sizing: border-box !important;
                    min-height: 64px;
                    background: var(--card-bg, #111827);
                    border: 1px solid rgba(255,255,255,.08);
                    border-radius: 12px;
                    padding: 12px 16px;
                    box-shadow: 0 5px 16px rgba(0,0,0,.08);
                    overflow: hidden;
                    display: grid !important;
                    grid-template-columns: minmax(180px, 1.15fr) minmax(130px, .75fr) minmax(300px, 2fr) minmax(140px, .8fr) minmax(110px, auto);
                    align-items: center;
                    column-gap: 18px;
                }

                .pedido-card-topo {
                    display: contents !important;
                }

                .pedido-card-topo > div {
                    display: contents !important;
                }

                .pedido-id {
                    grid-column: 3;
                    grid-row: 1;
                    font-size: 13px;
                    font-weight: 700;
                    word-break: break-all;
                    min-width: 0;
                }

                .pedido-subtitulo {
                    display: none !important;
                }

                .pedido-status {
                    grid-column: 4;
                    grid-row: 1;
                    justify-self: start;
                }

                .pedido-card::before {
                    content: "Nome: " attr(data-nome);
                    grid-column: 1;
                    grid-row: 1;
                    font-size: 13px;
                    font-weight: 700;
                    min-width: 0;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }

                .pedido-card::after {
                    content: "Valor: " attr(data-valor);
                    grid-column: 2;
                    grid-row: 1;
                    font-size: 13px;
                    font-weight: 700;
                    white-space: nowrap;
                }

                .pedido-card-topo {
                    display: flex;
                    align-items: flex-start;
                    justify-content: space-between;
                    gap: 12px;
                    margin-bottom: 16px;
                }

                .pedido-id {
                    font-weight: 800;
                    word-break: break-all;
                }

                .pedido-subtitulo {
                    margin-top: 4px;
                    font-size: 12px;
                    opacity: .55;
                }

                .pedido-status {
                    flex: 0 0 auto;
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 7px 9px;
                    border-radius: 999px;
                    font-size: 11px;
                    font-weight: 800;
                    white-space: nowrap;
                }

                .pedido-status.pendente {
                    background: rgba(245,158,11,.13);
                    color: #f59e0b;
                }

                .pedido-status.processando {
                    background: rgba(37,99,235,.14);
                    color: #60a5fa;
                }

                .pedido-status.concluido {
                    background: rgba(16,185,129,.13);
                    color: #34d399;
                }

                .pedido-status.falhado {
                    background: rgba(239,68,68,.13);
                    color: #f87171;
                }

                .pedido-status.cancelado {
                    background: rgba(148,163,184,.13);
                    color: #94a3b8;
                }

                .pedido-dados {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 10px;
                }

                .pedido-dado {
                    border: 1px solid rgba(255,255,255,.06);
                    background: rgba(255,255,255,.025);
                    border-radius: 11px;
                    padding: 10px;
                    min-width: 0;
                }

                .pedido-dado.full {
                    grid-column: 1 / -1;
                }

                .pedido-dado .rotulo {
                    display: block;
                    font-size: 10px;
                    opacity: .5;
                    margin-bottom: 4px;
                    text-transform: uppercase;
                    letter-spacing: .04em;
                }

                .pedido-dado .texto {
                    display: block;
                    font-size: 13px;
                    font-weight: 650;
                    word-break: break-word;
                }

                .pedido-progresso {
                    margin-top: 15px;
                    padding-top: 14px;
                    border-top: 1px solid rgba(255,255,255,.06);
                }

                .pedido-progresso-linha {
                    display: flex;
                    justify-content: space-between;
                    font-size: 11px;
                    opacity: .65;
                    margin-bottom: 7px;
                }

                .pedido-progresso-barra {
                    height: 5px;
                    border-radius: 999px;
                    background: rgba(255,255,255,.07);
                    overflow: hidden;
                }

                .pedido-progresso-barra span {
                    display: block;
                    height: 100%;
                    width: 0;
                    border-radius: inherit;
                    background: #2563eb;
                    transition: width .3s;
                }

                .pedido-erro {
                    margin-top: 12px;
                    border-radius: 10px;
                    padding: 10px;
                    background: rgba(239,68,68,.09);
                    color: #fca5a5;
                    font-size: 12px;
                }

                .pedido-acoes {
                    display: flex;
                    gap: 8px;
                    margin-top: 15px;
                }

                .pedido-acao {
                    flex: 1;
                    border: 1px solid rgba(255,255,255,.08);
                    background: rgba(255,255,255,.035);
                    color: inherit;
                    border-radius: 10px;
                    padding: 10px;
                    cursor: pointer;
                    font-weight: 700;
                }

                .pedido-acoes {
                    grid-column: 5;
                    grid-row: 1;
                    display: flex;
                    align-items: center;
                    justify-content: flex-end;
                    gap: 8px;
                    margin: 0;
                    min-width: 0;
                }

                .pedido-acao {
                    flex: 0 0 auto;
                    width: auto;
                    min-width: 105px;
                    border: 1px solid rgba(255,255,255,.08);
                    background: rgba(255,255,255,.035);
                    color: inherit;
                    border-radius: 9px;
                    padding: 9px 12px;
                    cursor: pointer;
                    font-weight: 700;
                    white-space: nowrap;
                }

                .pedido-acao.cancelar {
                    color: #f87171;
                }

                .pedidos-empty,
                .pedidos-loading-card {
                    grid-column: 1 / -1;
                    background: var(--card-bg, #111827);
                    border: 1px solid rgba(255,255,255,.08);
                    border-radius: 18px;
                    padding: 45px 20px;
                    text-align: center;
                    opacity: .7;
                }

                @media (max-width: 1100px) {
                    .pedidos-stats-grid {
                        grid-template-columns: repeat(3, 1fr);
                    }

                    .pedidos-filtros-grid {
                        grid-template-columns: repeat(3, 1fr);
                    }
                }

                @media (max-width: 1000px) {
                    .pedido-card {
                        grid-template-columns: minmax(160px, 1.2fr) minmax(120px, .8fr) minmax(220px, 1.5fr) minmax(125px, .8fr) minmax(105px, auto);
                        column-gap: 10px;
                    }
                }

                @media (max-width: 760px) {
                    .pedido-card {
                        grid-template-columns: 1fr 1fr;
                        row-gap: 9px;
                    }

                    .pedido-card::before {
                        grid-column: 1;
                        grid-row: 1;
                    }

                    .pedido-card::after {
                        grid-column: 2;
                        grid-row: 1;
                    }

                    .pedido-id {
                        grid-column: 1 / -1;
                        grid-row: 2;
                    }

                    .pedido-status {
                        grid-column: 1;
                        grid-row: 3;
                    }

                    .pedido-acoes {
                        grid-column: 2;
                        grid-row: 3;
                    }
                }

                @media (max-width: 700px) {
                    .pedidos-gestao-card {
                        flex-direction: column;
                        align-items: stretch;
                    }

                    .pedidos-stats-grid,
                    .pedidos-filtros-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }

                    .pedido-dados {
                        grid-template-columns: 1fr;
                    }

                    .pedido-dado.full {
                        grid-column: auto;
                    }

                    .pedidos-lista-header > div {
                        flex-direction: column;
                        align-items: flex-start;
                    }
                }
            </style>
        `;

        return container;
    }

    function filtroCard(status, titulo, icone) {
        return `
            <button
                type="button"
                class="pedido-filtro ${status === "todos" ? "ativo" : ""}"
                data-filtro-pedido="${status}"
                onclick="window.filtrarPedidos('${status}')">
                <i class="fas ${icone}"></i>
                <strong>${titulo}</strong>
                <small id="contadorFiltro_${status}">0 pedidos</small>
            </button>
        `;
    }

    function atualizarEstatisticas() {
        const box = el("pedidosEstatisticas");
        if (!box) return;

        const contagem = {
            total: pedidos.length,
            pendente: 0,
            processando: 0,
            concluido: 0,
            falhado: 0,
            cancelado: 0
        };

        pedidos.forEach(p => {
            const status = normalizarStatus(p.status);
            contagem[status]++;
        });

        const cards = [
            ["total", "Total", "fa-layer-group"],
            ["pendente", "Pendentes", "fa-clock"],
            ["processando", "Em processamento", "fa-spinner"],
            ["concluido", "Concluídos", "fa-check-circle"],
            ["falhado", "Falhados", "fa-circle-xmark"],
            ["cancelado", "Cancelados", "fa-ban"]
        ];

        box.innerHTML = cards.map(([chave, nome, icone]) => `
            <div class="pedido-stat-card">
                <div class="icone">
                    <i class="fas ${icone}"></i>
                </div>
                <div class="valor">${contagem[chave]}</div>
                <div class="nome">${nome}</div>
            </div>
        `).join("");

        Object.entries({
            todos: contagem.total,
            pendente: contagem.pendente,
            processando: contagem.processando,
            concluido: contagem.concluido,
            falhado: contagem.falhado,
            cancelado: contagem.cancelado
        }).forEach(([chave, valor]) => {
            const item = el("contadorFiltro_" + chave);
            if (item) {
                item.textContent =
                    valor + (valor === 1 ? " pedido" : " pedidos");
            }
        });
    }

    function renderizarPedidos() {
        const lista = el("pedidosCards");
        if (!lista) return;

        const filtrados = pedidos.filter(p => {
            if (filtroAtual === "todos") return true;
            return normalizarStatus(p.status) === filtroAtual;
        });

        const titulos = {
            todos: "Todos os pedidos",
            pendente: "Pedidos pendentes",
            processando: "Pedidos em processamento",
            concluido: "Pedidos concluídos",
            falhado: "Pedidos falhados",
            cancelado: "Pedidos cancelados"
        };

        const titulo = el("pedidosTituloLista");
        const quantidade = el("pedidosQuantidadeLista");

        if (titulo) titulo.textContent = titulos[filtroAtual] || "Pedidos";

        if (quantidade) {
            quantidade.textContent =
                filtrados.length +
                (filtrados.length === 1 ? " pedido" : " pedidos");
        }

        if (!filtrados.length) {
            lista.innerHTML = `
                <div class="pedidos-empty">
                    <i class="fas fa-inbox"></i>
                    <div style="margin-top:10px;font-weight:700">
                        Nenhum pedido nesta fila
                    </div>
                    <div style="margin-top:5px;font-size:13px">
                        Os pedidos aparecerão aqui assim que forem criados.
                    </div>
                </div>
            `;
            return;
        }

        const ordenados = [...filtrados].sort((a, b) => {
            const ordem = {
                pendente: 1,
                processando: 2,
                falhado: 3,
                concluido: 4,
                cancelado: 5
            };

            const sa = normalizarStatus(a.status);
            const sb = normalizarStatus(b.status);

            if (ordem[sa] !== ordem[sb]) {
                return ordem[sa] - ordem[sb];
            }

            return new Date(a.criadoEm || 0) - new Date(b.criadoEm || 0);
        });

        lista.innerHTML = ordenados.map(renderizarCardPedido).join("");
    }

    function renderizarCardPedido(p) {
        const status = normalizarStatus(p.status);
        const info = STATUS[status];

        const podeCancelar =
            status === "pendente" ||
            status === "processando";

        return `
            <article
                class="pedido-card"
                data-nome="${escapeHtml(p.nomeCliente)}"
                data-valor="${escapeHtml(dinheiro(p.valor))}">

                <div class="pedido-card-topo">
                    <div>
                        <div class="pedido-id">
                            ${escapeHtml(p.id)}
                        </div>
                        <div class="pedido-subtitulo">
                            Criado em ${escapeHtml(dataHora(p.criadoEm))}
                        </div>
                    </div>

                    <span class="pedido-status ${info.classe}">
                        <i class="fas ${info.icone}"></i>
                        ${info.texto}
                    </span>
                </div>

                <div class="pedido-acoes">
                    <button
                        type="button"
                        class="pedido-acao"
                        onclick="window.verDetalhesPedido('${escapeHtml(String(p.id))}')">
                        <i class="fas fa-eye"></i>
                        Detalhes
                    </button>

                    ${podeCancelar ? `
                        <button
                            type="button"
                            class="pedido-acao cancelar"
                            onclick="window.cancelarPedido('${escapeHtml(String(p.id))}')">
                            <i class="fas fa-ban"></i>
                            Cancelar
                        </button>
                    ` : ""}
                </div>

            </article>
        `;
    }


    window.filtrarPedidos = function (status) {
        filtroAtual = status || "todos";

        document
            .querySelectorAll("[data-filtro-pedido]")
            .forEach(btn => {
                btn.classList.toggle(
                    "ativo",
                    btn.getAttribute("data-filtro-pedido") === filtroAtual
                );
            });

        renderizarPedidos();
    };

    window.verDetalhesPedido = function (id) {
        const pedido = pedidos.find(
            p => String(p.id) === String(id)
        );

        if (!pedido) return;

        const formatarNomeCampo = campo => String(campo)
            .replace(/([a-z])([A-Z])/g, "$1 $2")
            .replace(/_/g, " ")
            .replace(/\buid\b/i, "UID")
            .replace(/\bid\b/i, "ID")
            .replace(/^./, c => c.toUpperCase());

        const formatarValor = (campo, valor) => {
            if (valor === null || valor === undefined || valor === "") return "-";

            if (campo === "status") {
                return STATUS[normalizarStatus(valor)]?.texto || String(valor);
            }

            if (campo === "valor" || campo === "preco" || campo === "total") {
                return dinheiro(valor);
            }

            if (/(criado|iniciado|concluido|finalizado|atualizado|cancelado|processado|createdAt|updatedAt|data)/i.test(campo)) {
                return dataHora(valor);
            }

            if (typeof valor === "object") {
                try {
                    return JSON.stringify(valor, null, 2);
                } catch (_) {
                    return String(valor);
                }
            }

            return String(valor);
        };

        const campos = Object.entries(pedido)
            .filter(([_, valor]) => valor !== undefined && valor !== null && valor !== "")
            .map(([campo, valor]) => `
                <div class="pedido-detalhe-item">
                    <span class="pedido-detalhe-label">${escapeHtml(formatarNomeCampo(campo))}</span>
                    <span class="pedido-detalhe-value">${escapeHtml(formatarValor(campo, valor))}</span>
                </div>
            `)
            .join("");

        const antigo = document.getElementById("modalDetalhesPedido");
        if (antigo) antigo.remove();

        const modal = document.createElement("div");
        modal.id = "modalDetalhesPedido";
        modal.innerHTML = `
            <div class="pedido-modal-backdrop" onclick="window.fecharDetalhesPedido(event)">
                <div class="pedido-modal" onclick="event.stopPropagation()">
                    <div class="pedido-modal-header">
                        <div>
                            <div class="pedido-modal-titulo">Detalhes do pedido</div>
                            <div class="pedido-modal-subtitulo">${escapeHtml(pedido.id)}</div>
                        </div>
                        <button type="button" class="pedido-modal-fechar" onclick="window.fecharDetalhesPedido()">×</button>
                    </div>
                    <div class="pedido-modal-conteudo">
                        ${campos}
                    </div>
                    <div class="pedido-modal-footer">
                        <button type="button" class="pedido-modal-btn" onclick="window.fecharDetalhesPedido()">Fechar</button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        if (!document.getElementById("estilosModalDetalhesPedido")) {
            const estilo = document.createElement("style");
            estilo.id = "estilosModalDetalhesPedido";
            estilo.textContent = `
                .pedido-modal-backdrop {
                    position: fixed; inset: 0; z-index: 99999;
                    background: rgba(0,0,0,.72);
                    display: flex; align-items: center; justify-content: center;
                    padding: 20px;
                }
                .pedido-modal {
                    width: min(760px, 100%); max-height: 90vh; overflow: hidden;
                    background: var(--card-bg, #111827); color: inherit;
                    border: 1px solid rgba(255,255,255,.1); border-radius: 16px;
                    box-shadow: 0 25px 70px rgba(0,0,0,.4);
                    display: flex; flex-direction: column;
                }
                .pedido-modal-header {
                    display: flex; justify-content: space-between; align-items: center;
                    gap: 15px; padding: 18px 20px;
                    border-bottom: 1px solid rgba(255,255,255,.08);
                }
                .pedido-modal-titulo { font-size: 19px; font-weight: 800; }
                .pedido-modal-subtitulo { margin-top: 4px; font-size: 12px; opacity: .6; word-break: break-all; }
                .pedido-modal-fechar {
                    width: 36px; height: 36px; border: 0; border-radius: 9px;
                    background: rgba(255,255,255,.07); color: inherit; font-size: 25px; cursor: pointer;
                }
                .pedido-modal-conteudo {
                    overflow-y: auto; padding: 18px 20px;
                    display: flex; flex-direction: column; gap: 8px;
                }
                .pedido-detalhe-item {
                    display: grid; grid-template-columns: minmax(150px, 220px) 1fr;
                    gap: 15px; align-items: start; padding: 11px 12px;
                    border-radius: 9px; background: rgba(255,255,255,.035);
                    border: 1px solid rgba(255,255,255,.05);
                }
                .pedido-detalhe-label { font-weight: 700; opacity: .65; }
                .pedido-detalhe-value { word-break: break-word; white-space: pre-wrap; }
                .pedido-modal-footer { padding: 14px 20px; border-top: 1px solid rgba(255,255,255,.08); text-align: right; }
                .pedido-modal-btn {
                    border: 0; border-radius: 9px; padding: 10px 18px;
                    background: #2563eb; color: #fff; cursor: pointer; font-weight: 700;
                }
                @media(max-width:600px){
                    .pedido-detalhe-item { grid-template-columns: 1fr; gap: 4px; }
                }
            `;
            document.head.appendChild(estilo);
        }
    };

    window.fecharDetalhesPedido = function (event) {
        if (event && event.target && !event.target.classList.contains("pedido-modal-backdrop")) return;
        const modal = document.getElementById("modalDetalhesPedido");
        if (modal) modal.remove();
    };

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") window.fecharDetalhesPedido();
    });
    };

    window.cancelarPedido = async function (id) {
        const pedido = pedidos.find(
            p => String(p.id) === String(id)
        );

        if (!pedido) return;

        const status = normalizarStatus(pedido.status);

        if (!["pendente", "processando"].includes(status)) {
            return;
        }

        if (!confirm("Cancelar este pedido?")) {
            return;
        }

        try {
            await apiPutPedido(id, {
                status: "cancelado",
                canceladoEm: new Date().toISOString()
            });

            await window.carregarPedidos();

        } catch (erro) {
            console.error("[PEDIDOS] Erro ao cancelar:", erro);
            alert("Não foi possível cancelar o pedido.");
        }
    };

    window.carregarPedidos = async function () {
        if (carregando) return pedidos;

        carregando = true;

        try {
            montarInterface();

            const json = await apiGetPedidos();
            pedidos = obterListaResposta(json)
                .map(normalizarPedido);

            console.log(
                "[PEDIDOS] Pedidos recebidos:",
                pedidos.length
            );

            atualizarEstatisticas();
            renderizarPedidos();

            return pedidos;

        } catch (erro) {
            console.error(
                "[PEDIDOS] Erro ao carregar pedidos:",
                erro
            );

            const lista = el("pedidosCards");

            if (lista) {
                lista.innerHTML = `
                    <div class="pedidos-empty">
                        <i class="fas fa-triangle-exclamation"></i>
                        <div style="margin-top:10px;font-weight:700">
                            Não foi possível carregar os pedidos.
                        </div>
                        <div style="margin-top:5px;font-size:13px">
                            Verifique a API e tente novamente.
                        </div>
                    </div>
                `;
            }

            return [];

        } finally {
            carregando = false;
        }
    };

    window.atualizarPedidos = async function () {
        await window.carregarPedidos();
    };

    window.iniciarPedidos = function () {
        window.carregarPedidos();

        if (timerAtualizacao) {
            clearInterval(timerAtualizacao);
        }

        timerAtualizacao = setInterval(() => {
            if (
                document.getElementById("panelPedidos") &&
                document.getElementById("panelPedidos").style.display !== "none"
            ) {
                window.carregarPedidos();
            }
        }, 5000);
    };

    window.PEDIDOS_VERSAO = VERSAO;

    console.log(
        "[PEDIDOS] Fila em cards carregada:",
        VERSAO
    );

})();

}
