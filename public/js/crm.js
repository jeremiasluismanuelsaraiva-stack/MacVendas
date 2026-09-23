// =====================================================
// MOZ TECH - CRM DE VENDAS
// public/js/crm.js
// =====================================================
(function () {
    "use strict";

    const API_URL = "/api";
    let carregando = false;

    function obterCredenciais() {
        const cred = window.MOZ_CREDENCIAIS_API || {};
        return {
            uid: String(cred.uid || localStorage.getItem("uid") || localStorage.getItem("moz_uid") || "").trim(),
            apiKey: String(cred.apiKey || localStorage.getItem("apiKey") || localStorage.getItem("moz_api_key") || "").trim()
        };
    }

    async function requisicao(url, opcoes = {}) {
        const { uid, apiKey } = obterCredenciais();
        if (!uid || !apiKey) throw new Error("UID ou API Key não encontrados.");

        const resposta = await fetch(url, {
            ...opcoes,
            headers: {
                "Content-Type": "application/json",
                "x-api-key": apiKey,
                "x-uid": uid,
                ...(opcoes.headers || {})
            }
        });

        let dados = null;
        try { dados = await resposta.json(); } catch (_) {}

        console.log("[CRM] REQUEST:", url);
        console.log("[CRM] HTTP:", resposta.status);
        console.log("[CRM] Resposta:", dados);

        if (!resposta.ok) {
            throw new Error(dados?.error || dados?.message || `HTTP ${resposta.status}`);
        }
        return dados;
    }

    function tabela() {
        return document.getElementById("tabelaClientes");
    }

    function escapar(valor) {
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

    function formatarMT(valor) {
        return `${numero(valor).toLocaleString("pt-MZ")} MT`;
    }

    function formatarGB(gb, mb) {
        const g = numero(gb);
        const m = numero(mb);
        if (g > 0) return `${g.toLocaleString("pt-MZ")} GB`;
        if (m > 0) return `${m.toLocaleString("pt-MZ")} MB`;
        return "0 GB";
    }

    function obterNumero(cliente) {
        return cliente.numeroCliente || cliente.telefone || cliente.numero || cliente.phone || "";
    }

    function chaveCliente(cliente) {
        return String(obterNumero(cliente)).replace(/\D/g, "") || String(cliente.id || cliente._id || "");
    }

    function dataCompra(compra) {
        return compra.criadoEm || compra.data || compra.createdAt || compra.atualizadoEm || "";
    }

    function formatarData(valor) {
        if (!valor) return "-";
        const d = new Date(valor);
        if (Number.isNaN(d.getTime())) return String(valor);
        return d.toLocaleDateString("pt-MZ");
    }

    function configurarCabecalho() {
        const t = tabela();
        if (!t) return;

        const thead = t.querySelector("thead");
        if (thead) thead.innerHTML = "";
    }

    function mensagem(texto, erro = false) {
        const t = tabela();
        if (!t) return;

        const tbody = t.querySelector("tbody");
        if (!tbody) return;

        tbody.innerHTML = `
            <tr>
                <td colspan="9" style="text-align:center;padding:25px;${erro ? "color:#ff6b6b;" : ""}">
                    ${texto}
                </td>
            </tr>
        `;
    }

    function obterCampo(compra, campos, padrao = "") {
        for (const campo of campos) {
            if (
                compra &&
                compra[campo] !== undefined &&
                compra[campo] !== null &&
                String(compra[campo]).trim() !== ""
            ) {
                return compra[campo];
            }
        }
        return padrao;
    }

    function obterCliente(compra) {
        return obterCampo(
            compra,
            ["nomeCliente", "nome", "cliente", "nome_cliente"],
            "-"
        );
    }

    function obterNumeroClienteCompra(compra) {
        return obterCampo(
            compra,
            ["numeroCliente", "numero_cliente", "telefone", "numero", "phone"],
            "-"
        );
    }

    function obterNumeroRecebeu(compra) {
        return obterCampo(
            compra,
            [
                "numeroRecebeu",
                "numero_recebeu",
                "numeroDestino",
                "numero_destino",
                "destino",
                "numero",
            ],
            "-"
        );
    }

    function obterPacote(compra) {
        return obterCampo(
            compra,
            ["pacote", "nomePacote", "nome_pacote"],
            "-"
        );
    }

    function obterPagamento(compra) {
        return obterCampo(
            compra,
            [
                "metodoPagamento",
                "metodo_pagamento",
                "pagamento",
                "metodo",
                "formaPagamento",
                "forma_pagamento",
            ],
            "-"
        );
    }

    function obterDispositivo(compra) {
        return obterCampo(
            compra,
            [
                "dispositivoUsado",
                "dispositivo_usado",
                "dispositivo",
                "nomeDispositivo",
                "nome_dispositivo",
                "aparelho",
                "device",
            ],
            "-"
        );
    }

    function obterGrupo(compra) {
        return obterCampo(
            compra,
            ["grupo", "nomeGrupo", "nome_grupo"],
            "-"
        );
    }

    function obterStatus(compra) {
        return obterCampo(
            compra,
            ["status", "estado"],
            "pendente"
        );
    }

    function obterQuantidade(compra) {
        const mb = numero(
            obterCampo(compra, ["mb", "MB", "quantidadeMB", "quantidade_mb"], 0)
        );

        const gb = numero(
            obterCampo(compra, ["gb", "GB", "quantidadeGB", "quantidade_gb"], 0)
        );

        if (gb > 0) {
            return `${gb.toLocaleString("pt-MZ", {
                maximumFractionDigits: 2
            })} GB`;
        }

        if (mb > 0) {
            return `${mb.toLocaleString("pt-MZ", {
                maximumFractionDigits: 2
            })} MB`;
        }

        return "-";
    }

    function obterValor(compra) {
        return numero(
            obterCampo(compra, ["valor", "valorVenda", "valor_venda", "preco"], 0)
        );
    }

    function classeStatus(status) {
        const normalizado = String(status || "")
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");

        if (
            normalizado.includes("conclu") ||
            normalizado.includes("concluida") ||
            normalizado.includes("concluido")
        ) {
            return "concluido";
        }

        if (
            normalizado.includes("process") ||
            normalizado.includes("enviando")
        ) {
            return "processando";
        }

        if (
            normalizado.includes("erro") ||
            normalizado.includes("falh") ||
            normalizado.includes("cancel")
        ) {
            return "erro";
        }

        return "pendente";
    }

    function textoStatus(status) {
        const valor = String(status || "pendente").trim();

        const mapa = {
            concluida: "Concluído",
            concluido: "Concluído",
            concluída: "Concluído",
            concluído: "Concluído",
            processando: "Processando",
            pendente: "Pendente",
            erro: "Erro",
            falhou: "Falhou",
            cancelado: "Cancelado",
            cancelada: "Cancelado",
        };

        return mapa[valor.toLowerCase()] || valor;
    }

    function agruparClientes(compras) {
        const mapa = new Map();

        (Array.isArray(compras) ? compras : []).forEach((compra, indice) => {
            const numeroCliente = obterNumeroClienteCompra(compra);
            const numeroLimpo = String(numeroCliente || "").replace(/\D/g, "");
            const numeroRecebeu = obterNumeroRecebeu(compra);
            const chave = numeroLimpo || String(compra.clienteId || compra.id || indice);

            if (!mapa.has(chave)) {
                mapa.set(chave, {
                    id: compra.clienteId || chave,
                    nome: obterCliente(compra),
                    numeroCliente,
                    numeroRecebeu,
                    grupo: obterGrupo(compra),
                    compras: [],
                    totalGB: 0,
                    totalMB: 0,
                    totalGasto: 0,
                    totalCusto: 0,
                    totalLucro: 0,
                    primeiraCompra: dataCompra(compra),
                    ultimaCompra: dataCompra(compra)
                });
            }

            const cliente = mapa.get(chave);

            cliente.compras.push(compra);

            if (obterCliente(compra) !== "-") {
                cliente.nome = obterCliente(compra);
            }

            if (numeroRecebeu !== "-") {
                cliente.numeroRecebeu = numeroRecebeu;
            }

            if (obterGrupo(compra) !== "-") {
                cliente.grupo = obterGrupo(compra);
            }

            const gb = numero(obterCampo(compra, ["gb", "GB", "quantidadeGB", "quantidade_gb"], 0));
            const mb = numero(obterCampo(compra, ["mb", "MB", "quantidadeMB", "quantidade_mb"], 0));

            cliente.totalGB += gb || (mb / 1000);
            cliente.totalMB += mb || (gb * 1000);
            cliente.totalGasto += obterValor(compra);
            cliente.totalCusto += numero(obterCampo(compra, ["custo", "valorCusto", "valor_custo"], 0));

            const lucroInformado = numero(obterCampo(compra, ["lucro"], 0));
            cliente.totalLucro += lucroInformado || (obterValor(compra) - numero(obterCampo(compra, ["custo", "valorCusto", "valor_custo"], 0)));

            const data = dataCompra(compra);
            if (data) {
                if (!cliente.primeiraCompra || new Date(data) < new Date(cliente.primeiraCompra)) {
                    cliente.primeiraCompra = data;
                }
                if (!cliente.ultimaCompra || new Date(data) > new Date(cliente.ultimaCompra)) {
                    cliente.ultimaCompra = data;
                }
            }
        });

        return Array.from(mapa.values()).sort((a, b) => {
            return new Date(b.ultimaCompra || 0) - new Date(a.ultimaCompra || 0);
        });
    }

    function instalarModal() {
        if (document.getElementById("crmDetalhesCliente")) return;

        const style = document.createElement("style");
        style.id = "crmDetalhesStyle";
        style.textContent = `
            /* ESTATISTICAS DO CRM */
            .crm-stats-grid {
                display: grid;
                grid-template-columns: repeat(4, minmax(0, 1fr));
                gap: 18px;
                margin-bottom: 24px;
            }
            .crm-stat-card {
                min-height: 125px;
                padding: 22px;
                box-sizing: border-box;
                border-radius: 20px;
                background: rgba(20, 25, 40, .72);
                border: 1px solid rgba(0, 102, 204, .35);
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                text-align: center;
            }
            .crm-stat-icon {
                font-size: 18px;
                margin-bottom: 8px;
                color: #f8fafc;
            }
            .crm-stat-value {
                font-size: 30px;
                line-height: 1.1;
                font-weight: 800;
                color: #f8fafc;
            }
            .crm-stat-label {
                margin-top: 9px;
                font-size: 12px;
                font-weight: 700;
                color: #f8fafc;
                text-transform: uppercase;
                letter-spacing: .04em;
            }

            /* DETALHES CRM — visual simples */
            #crmDetalhesCliente {
                position: fixed;
                inset: 0;
                z-index: 99999;
                display: none;
                align-items: center;
                justify-content: center;
                padding: 20px;
                box-sizing: border-box;

                /* apenas o fundo atrás fica escuro e desfocado */
                background: rgba(5, 25, 65, .68);
                backdrop-filter: blur(9px);
                -webkit-backdrop-filter: blur(9px);
            }

            #crmDetalhesCliente.ativo {
                display: flex;
            }

            /* fundo da janela de detalhes */
            #crmDetalhesCliente .crm-modal {
                width: min(1050px, 100%);
                max-height: 90vh;
                overflow: auto;
                background: #0b1730;
                color: #f8fafc;
                border: 1px solid #1e3a8a;
                border-radius: 16px;
                box-shadow: 0 20px 60px rgba(0, 0, 0, .35);
            }

            /* TODAS as letras do detalhe usam a mesma cor */
            #crmDetalhesCliente,
            #crmDetalhesCliente h1,
            #crmDetalhesCliente h2,
            #crmDetalhesCliente h3,
            #crmDetalhesCliente h4,
            #crmDetalhesCliente p,
            #crmDetalhesCliente span,
            #crmDetalhesCliente small,
            #crmDetalhesCliente strong,
            #crmDetalhesCliente th,
            #crmDetalhesCliente td,
            #crmDetalhesCliente .crm-card-label,
            #crmDetalhesCliente .crm-card-value,
            #crmDetalhesCliente .crm-subtitulo,
            #crmDetalhesCliente .crm-info-item small {
                color: #f8fafc;
            }

            /* cabeçalho do detalhe */
            #crmDetalhesCliente .crm-modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                gap: 15px;
                padding: 18px 20px;
                background: #10264a;
                border-bottom: 1px solid #1e3a8a;
            }

            #crmDetalhesCliente .crm-identidade {
                display: flex;
                align-items: center;
                gap: 12px;
            }

            #crmDetalhesCliente .crm-avatar {
                width: 48px;
                height: 48px;
                border-radius: 50%;
                display: grid;
                place-items: center;
                background: #16345f;
                color: #f8fafc;
                font-weight: 700;
            }

            #crmDetalhesCliente .crm-subtitulo {
                font-size: 13px;
                margin-top: 3px;
            }

            #crmDetalhesCliente .crm-fechar {
                border: 0;
                background: #16345f;
                color: #f8fafc;
                width: 40px;
                height: 40px;
                border-radius: 10px;
                cursor: pointer;
                font-size: 20px;
            }

            #crmDetalhesCliente .crm-resumo {
                display: grid;
                grid-template-columns: repeat(4, minmax(0, 1fr));
                gap: 12px;
                padding: 18px 20px;
                background: #0b1730;
            }

            #crmDetalhesCliente .crm-card {
                border: 1px solid #1e3a8a;
                border-radius: 12px;
                padding: 14px;
                background: #10264a;
            }

            #crmDetalhesCliente .crm-info {
                display: grid;
                grid-template-columns: repeat(3, minmax(0, 1fr));
                gap: 10px;
                padding: 0 20px 18px;
                background: #0b1730 !important;
            }

            #crmDetalhesCliente .crm-info-item {
                padding: 12px;
                border: 1px solid #1e3a8a;
                border-radius: 10px;
                background: #10264a;
            }

            #crmDetalhesCliente .crm-info-item small {
                display: block;
                margin-bottom: 4px;
            }

            #crmDetalhesCliente .crm-historico {
                padding: 0 20px 20px;
                background: #0b1730;
            }

            #crmDetalhesCliente .crm-historico-wrap {
                overflow-x: auto;
                border: 1px solid #1e3a8a;
                border-radius: 12px;
            }

            #crmDetalhesCliente table {
                width: 100%;
                border-collapse: collapse;
                min-width: 850px;
            }

            #crmDetalhesCliente th,
            #crmDetalhesCliente td {
                padding: 11px;
                text-align: left;
                border-bottom: 1px solid #1e3a8a;
                white-space: nowrap;
                font-size: 13px;
                color: #f8fafc !important;
            }

            #crmDetalhesCliente th {
                background: #10264a;
                color: #f8fafc;
                font-weight: 700;
            }

            #crmDetalhesCliente td {
                background: #0b1730;
            }

            /* FORCA O TEMA ESCURO EM TODO O DETALHE */
            #crmDetalhesCliente .crm-modal,
            #crmDetalhesCliente .crm-modal * {
                color: #f8fafc !important;
            }

            #crmDetalhesCliente .crm-modal,
            #crmDetalhesCliente .crm-info,
            #crmDetalhesCliente .crm-resumo,
            #crmDetalhesCliente .crm-historico,
            #crmDetalhesCliente .crm-card,
            #crmDetalhesCliente .crm-info-item,
            #crmDetalhesCliente .crm-historico-wrap,
            #crmDetalhesCliente table,
            #crmDetalhesCliente tbody,
            #crmDetalhesCliente tr,
            #crmDetalhesCliente td,
            #crmDetalhesCliente th {
                background-color: #0b1730 !important;
            }

            #crmDetalhesCliente .crm-modal-header,
            #crmDetalhesCliente .crm-card,
            #crmDetalhesCliente .crm-info-item,
            #crmDetalhesCliente th,
            #crmDetalhesCliente .crm-fechar,
            #crmDetalhesCliente .crm-avatar,
            #crmDetalhesCliente .crm-status {
                background-color: #10264a !important;
            }

            #crmDetalhesCliente .crm-modal,
            #crmDetalhesCliente .crm-card,
            #crmDetalhesCliente .crm-info-item,
            #crmDetalhesCliente .crm-historico-wrap,
            #crmDetalhesCliente th,
            #crmDetalhesCliente td {
                border-color: #1e3a8a !important;
            }

            /* status também segue a mesma cor das letras */
            #crmDetalhesCliente .crm-status {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                padding: 5px 10px;
                border-radius: 999px;
                font-size: 12px;
                font-weight: 700;
                color: #f8fafc !important;
                background: #10264a !important;
                border: 1px solid #1e3a8a;
            }

            /* CARDS DOS CLIENTES NO CRM */
            #tabelaClientes thead { display: none !important; }
            #tabelaClientes,
            #tabelaClientes tbody {
                width: 100%;
                border-collapse: separate !important;
                border-spacing: 0 14px !important;
            }
            #tabelaClientes tbody tr,
            #tabelaClientes tbody td {
                background: transparent !important;
                border: 0 !important;
            }
            .crm-cliente-card {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 20px;
                min-height: 108px;
                padding: 22px 24px;
                box-sizing: border-box;
                background: rgba(20, 25, 40, .72);
                border: 1px solid rgba(0, 102, 204, .35);
                border-radius: 20px;
                cursor: pointer;
                transition: transform .18s ease, border-color .18s ease, box-shadow .18s ease;
            }
            .crm-cliente-card:hover,
            .crm-cliente-card:focus {
                transform: translateY(-2px);
                border-color: rgba(59, 130, 246, .8);
                box-shadow: 0 12px 30px rgba(0,0,0,.18);
                outline: none;
            }
            .crm-cliente-card-top {
                display: flex;
                flex-direction: column;
                gap: 9px;
                min-width: 0;
            }
            .crm-cliente-nome {
                font-size: 18px;
                font-weight: 800;
                color: #f8fafc;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
            .crm-cliente-dados {
                font-size: 15px;
                font-weight: 700;
                color: #f8fafc;
            }
            .crm-ver-detalhes {
                flex: 0 0 auto;
                border: 1px solid #1e3a8a;
                background: #10264a;
                color: #f8fafc;
                padding: 11px 18px;
                border-radius: 10px;
                cursor: pointer;
                font-weight: 700;
            }
            .crm-ver-detalhes:hover {
                background: #16345f;
            }

            @media (max-width: 700px) {
                #crmDetalhesCliente {
                    padding: 10px;
                }

                .crm-stats-grid {
                    grid-template-columns: repeat(2, minmax(0, 1fr));
                }

                .crm-cliente-card {
                    min-height: 96px;
                    padding: 18px;
                }

                .crm-cliente-nome {
                    font-size: 16px;
                }

                .crm-ver-detalhes {
                    padding: 9px 12px;
                    font-size: 12px;
                }

                #crmDetalhesCliente .crm-resumo {
                    grid-template-columns: repeat(2, minmax(0, 1fr));
                }

                #crmDetalhesCliente .crm-info {
                    grid-template-columns: 1fr;
                }
            }
        `;
        document.head.appendChild(style);

        const modal = document.createElement("div");
        modal.id = "crmDetalhesCliente";
        modal.innerHTML = `
            <div class="crm-modal" role="dialog" aria-modal="true" aria-labelledby="crmDetalhesTitulo">
                <div class="crm-modal-header">
                    <div class="crm-identidade">
                        <div class="crm-avatar" id="crmAvatar">C</div>
                        <div>
                            <h2 id="crmDetalhesTitulo" style="margin:0;">Cliente</h2>
                            <div id="crmDetalhesSubtitulo" class="crm-subtitulo"></div>
                        </div>
                    </div>
                    <button type="button" class="crm-fechar" id="crmFecharDetalhes" aria-label="Fechar">×</button>
                </div>

                <div id="crmDetalhesConteudo"></div>
            </div>
        `;

        document.body.appendChild(modal);

        document.getElementById("crmFecharDetalhes").addEventListener("click", fecharDetalhesCRM);

        modal.addEventListener("click", (event) => {
            if (event.target === modal) fecharDetalhesCRM();
        });

        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape") fecharDetalhesCRM();
        });
    }

    function abrirDetalhesCRM(cliente) {
        document.body.classList.add("crm-detalhes-aberto");
        instalarModal();

        const modal = document.getElementById("crmDetalhesCliente");
        const titulo = document.getElementById("crmDetalhesTitulo");
        const subtitulo = document.getElementById("crmDetalhesSubtitulo");
        const avatar = document.getElementById("crmAvatar");
        const conteudo = document.getElementById("crmDetalhesConteudo");

        titulo.textContent = cliente.nome || "Cliente";
        subtitulo.textContent = cliente.numeroCliente || "Número não informado";
        avatar.textContent = String(cliente.nome || "C").trim().charAt(0).toUpperCase();

        const compras = [...cliente.compras].sort((a, b) => {
            return new Date(dataCompra(b) || 0) - new Date(dataCompra(a) || 0);
        });

            const totalCompras = compras.length;
        const ticketMedio = totalCompras ? cliente.totalGasto / totalCompras : 0;

        conteudo.innerHTML = `
            <div class="crm-resumo">
                <div class="crm-card">
                    <div class="crm-card-label">Total de compras</div>
                    <div class="crm-card-value">${totalCompras}</div>
                </div>
                <div class="crm-card">
                    <div class="crm-card-label">Total gasto</div>
                    <div class="crm-card-value">${formatarMT(cliente.totalGasto)}</div>
                </div>
                <div class="crm-card">
                    <div class="crm-card-label">Total de dados</div>
                    <div class="crm-card-value">${numero(cliente.totalGB).toLocaleString("pt-MZ", { maximumFractionDigits: 2 })} GB</div>
                </div>
                <div class="crm-card">
                    <div class="crm-card-label">Ticket médio</div>
                    <div class="crm-card-value">${formatarMT(ticketMedio)}</div>
                </div>
            </div>

            <div class="crm-info">
                <div class="crm-info-item">
                    <small>Nome</small>
                    <strong>${escapar(cliente.nome || "-")}</strong>
                </div>
                <div class="crm-info-item">
                    <small>Nº Cliente</small>
                    <strong>${escapar(cliente.numeroCliente || "-")}</strong>
                </div>
                <div class="crm-info-item">
                    <small>Nº que recebeu</small>
                    <strong>${escapar(cliente.numeroRecebeu || "-")}</strong>
                </div>
                <div class="crm-info-item">
                    <small>Grupo</small>
                    <strong>${escapar(cliente.grupo || "-")}</strong>
                </div>
                <div class="crm-info-item">
                    <small>Primeira compra</small>
                    <strong>${formatarDataHora(cliente.primeiraCompra)}</strong>
                </div>
                <div class="crm-info-item">
                    <small>Última compra</small>
                    <strong>${formatarDataHora(cliente.ultimaCompra)}</strong>
                </div>
                <div class="crm-info-item">
                    <small>Total MB</small>
                    <strong>${numero(cliente.totalMB).toLocaleString("pt-MZ", { maximumFractionDigits: 2 })} MB</strong>
                </div>
                <div class="crm-info-item">
                    <small>Total custo</small>
                    <strong>${formatarMT(cliente.totalCusto)}</strong>
                </div>
                <div class="crm-info-item">
                    <small>Lucro</small>
                    <strong>${formatarMT(cliente.totalLucro)}</strong>
                </div>
            </div>

            <div class="crm-historico">
                <h3 style="margin:0 0 12px;">Histórico de compras</h3>
                <div class="crm-historico-wrap">
                    <table>
                        <thead>
                            <tr>
                                <th>Data / hora</th>
                                <th>Pacote</th>
                                <th>MB / GB</th>
                                <th>Valor</th>
                                <th>Pagamento</th>
                                <th>Dispositivo</th>
                                <th>Grupo</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${compras.map(compra => {
                                const status = obterStatus(compra);
                                return `
                                    <tr>
                                        <td>${formatarDataHora(dataCompra(compra))}</td>
                                        <td>${escapar(obterPacote(compra))}</td>
                                        <td>${escapar(obterQuantidade(compra))}</td>
                                        <td>${formatarMT(obterValor(compra))}</td>
                                        <td>${escapar(obterPagamento(compra))}</td>
                                        <td>${escapar(obterDispositivo(compra))}</td>
                                        <td>${escapar(obterGrupo(compra))}</td>
                                        <td><span class="crm-status ${classeStatus(status)}">${escapar(textoStatus(status))}</span></td>
                                    </tr>
                                `;
                            }).join("")}
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        modal.classList.add("ativo");
    }

    function fecharDetalhesCRM() {
        document.body.classList.remove("crm-detalhes-aberto");
            const modal = document.getElementById("crmDetalhesCliente");
        if (modal) modal.classList.remove("ativo");
    }

    function formatarDataHora(valor) {
        if (!valor) return "-";

        const d = new Date(valor);

        if (Number.isNaN(d.getTime())) return String(valor);

        return d.toLocaleString("pt-MZ", {
            dateStyle: "short",
            timeStyle: "short"
        });
    }

    function prepararPainelEstatisticas() {
        const grid = document.querySelector("#panelCRM .crm-stats-grid");
        if (!grid) return;

        grid.innerHTML = `
            <div class="crm-stat-card"><div class="crm-stat-icon"><i class="fas fa-users"></i></div><div class="crm-stat-value" id="totalClientes">0</div><div class="crm-stat-label">Clientes</div></div>
            <div class="crm-stat-card"><div class="crm-stat-icon"><i class="fas fa-user-check"></i></div><div class="crm-stat-value" id="clientesAtivos">0</div><div class="crm-stat-label">Ativos</div></div>
            <div class="crm-stat-card"><div class="crm-stat-icon"><i class="fas fa-user-plus"></i></div><div class="crm-stat-value" id="clientesRecentes">0</div><div class="crm-stat-label">Novos</div></div>
            <div class="crm-stat-card"><div class="crm-stat-icon"><i class="fas fa-money-bill-wave"></i></div><div class="crm-stat-value" id="totalGastoCRM">0 MT</div><div class="crm-stat-label">Total gasto</div></div>
            <div class="crm-stat-card"><div class="crm-stat-icon"><i class="fas fa-shopping-cart"></i></div><div class="crm-stat-value" id="totalComprasCRM">0</div><div class="crm-stat-label">Compras</div></div>
            <div class="crm-stat-card"><div class="crm-stat-icon"><i class="fas fa-database"></i></div><div class="crm-stat-value" id="totalGBCRM">0 GB</div><div class="crm-stat-label">Total GB</div></div>
            <div class="crm-stat-card"><div class="crm-stat-icon"><i class="fas fa-calculator"></i></div><div class="crm-stat-value" id="ticketMedioGeral">0 MT</div><div class="crm-stat-label">Ticket médio</div></div>
            <div class="crm-stat-card"><div class="crm-stat-icon"><i class="fas fa-chart-line"></i></div><div class="crm-stat-value" id="lucroTotalCRM">0 MT</div><div class="crm-stat-label">Lucro</div></div>
        `;
    }

    function atualizarEstatisticasCRM(clientes) {
        prepararPainelEstatisticas();
        const compras = clientes.flatMap(c => c.compras || []);
        const agora = Date.now();
        const trintaDias = 30 * 24 * 60 * 60 * 1000;
        const seteDias = 7 * 24 * 60 * 60 * 1000;

        const ativos = clientes.filter(c => {
            const d = new Date(c.ultimaCompra || 0).getTime();
            return Number.isFinite(d) && agora - d <= trintaDias;
        }).length;

        const recentes = clientes.filter(c => {
            const d = new Date(c.primeiraCompra || 0).getTime();
            return Number.isFinite(d) && agora - d <= seteDias;
        }).length;

        const totalGasto = clientes.reduce((s, c) => s + numero(c.totalGasto), 0);
        const totalGB = clientes.reduce((s, c) => s + numero(c.totalGB), 0);
        const totalLucro = clientes.reduce((s, c) => s + numero(c.totalLucro), 0);
        const ticket = compras.length ? totalGasto / compras.length : 0;

        const valores = {
            totalClientes: clientes.length,
            clientesAtivos: ativos,
            clientesRecentes: recentes,
            totalGastoCRM: formatarMT(totalGasto),
            totalComprasCRM: compras.length,
            totalGBCRM: `${totalGB.toLocaleString("pt-MZ", { maximumFractionDigits: 2 })} GB`,
            ticketMedioGeral: formatarMT(ticket),
            lucroTotalCRM: formatarMT(totalLucro)
        };

        Object.entries(valores).forEach(([id, valor]) => {
            const el = document.getElementById(id);
            if (el) el.textContent = valor;
        });
    }

    function renderizarClientes(clientes) {
        const t = tabela();

        if (!t) {
            throw new Error("#tabelaClientes não encontrado.");
        }

        const tbody = t.querySelector("tbody");
        if (!tbody) throw new Error("tbody do CRM não encontrado.");

        atualizarEstatisticasCRM(clientes);
        configurarCabecalho();

        if (!clientes.length) {
            mensagem("Nenhum cliente com compras encontrado.");
            return;
        }

        tbody.innerHTML = "";

        clientes.forEach((cliente) => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td colspan="9" style="padding:0;border:0;background:transparent;">
                    <article class="crm-cliente-card" tabindex="0" role="button" aria-label="Ver detalhes de ${escapar(cliente.nome || "cliente")}">
                        <div class="crm-cliente-card-top">
                            <div class="crm-cliente-nome">${escapar(cliente.nome || "-")}</div>
                            <div class="crm-cliente-dados">${numero(cliente.totalGB).toLocaleString("pt-MZ", { maximumFractionDigits: 2 })} GB</div>
                        </div>
                        <button type="button" class="crm-ver-detalhes">Ver detalhes</button>
                    </article>
                </td>
            `;

            const card = tr.querySelector(".crm-cliente-card");
            const botao = tr.querySelector(".crm-ver-detalhes");

            card.addEventListener("click", () => abrirDetalhesCRM(cliente));
            card.addEventListener("keydown", (event) => {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    abrirDetalhesCRM(cliente);
                }
            });
            botao.addEventListener("click", (event) => {
                event.stopPropagation();
                abrirDetalhesCRM(cliente);
            });

            tbody.appendChild(tr);
        });
    }

    async function carregarClientes() {
        if (carregando) return;
        carregando = true;

        try {
            mensagem("Carregando clientes...");
            configurarCabecalho();

            const dadosCompras = await requisicao(`${API_URL}/compras`);
            const compras = Array.isArray(dadosCompras?.compras)
                ? dadosCompras.compras
                : (Array.isArray(dadosCompras) ? dadosCompras : []);

            const clientes = agruparClientes(compras);

            console.log("[CRM] Compras recebidas:", compras.length);
            console.log("[CRM] Clientes agrupados:", clientes.length);

            renderizarClientes(clientes);
            return clientes;
        } catch (erro) {
            console.error("[CRM] ERRO AO CARREGAR CLIENTES:", erro);
            mensagem(`Não foi possível carregar os clientes.<br><small>${escapar(erro.message)}</small><br><button type="button" onclick="carregarClientes()">Tentar novamente</button>`, true);
            throw erro;
        } finally {
            carregando = false;
        }
    }

    async function abrirCRM() {
        const painel = document.getElementById("panelCRM") || document.getElementById("painelCRM") || document.getElementById("crm");
        if (painel) {
            painel.style.display = "";
            painel.classList.add("active");
        }
        return carregarClientes();
    }

    async function iniciarCRM() {
        return carregarClientes();
    }

    function verClienteCRM(id) {
        alert(`Cliente: ${id}`);
    }

    window.carregarClientes = carregarClientes;
    window.abrirCRM = abrirCRM;
    window.iniciarCRM = iniciarCRM;
    window.verClienteCRM = verClienteCRM;
    window.abrirDetalhesCRM = abrirDetalhesCRM;
    window.fecharDetalhesCRM = fecharDetalhesCRM;

    console.log("[CRM] CRM de vendas com detalhes carregado.");
})();

document.addEventListener("keydown", function (evento) {
    if (evento.key !== "Escape") return;

    const modal = document.getElementById("crmDetalhesCliente");
    if (modal && modal.classList.contains("ativo")) {
        if (typeof fecharDetalhesCRM === "function") {
            fecharDetalhesCRM();
        } else {
            modal.classList.remove("ativo");
            document.body.classList.remove("crm-detalhes-aberto");
        }
    }
});
