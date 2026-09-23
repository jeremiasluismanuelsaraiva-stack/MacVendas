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
        if (!thead) return;

        thead.innerHTML = `
            <tr>
                <th>Cliente</th>
                <th>Nº Cliente</th>
                <th>Nº que recebeu</th>
                <th>Total GB</th>
                <th>Compras</th>
                <th>Total gasto</th>
                <th>Grupo</th>
                <th>Última compra</th>
                <th>Ações</th>
            </tr>
        `;
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
            cliente.totalLucro += lucroInformado || (obterValor(compra) - cliente.totalCusto);

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
            #crmDetalhesCliente {
                position: fixed;
                inset: 0;
                z-index: 99999;
                display: none;
                align-items: center;
                justify-content: center;
                padding: 20px;
                background: rgba(5, 25, 65, .72);
                backdrop-filter: blur(8px);
                -webkit-backdrop-filter: blur(8px);
                animation: crmFundoEntrada .18s ease-out;
            }

            #crmDetalhesCliente.ativo {
                display: flex;
            }

            #crmDetalhesCliente .crm-modal {
                width: min(1050px, 100%);
                max-height: 90vh;
                overflow: auto;
                background: #ffffff;
                color: #0f172a;
                border-radius: 16px;
                border: 1px solid #bfdbfe;
                box-shadow: 0 20px 60px rgba(0,0,0,.35);
            }

            #crmDetalhesCliente .crm-modal-header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                gap: 15px;
                padding: 20px;
                border-bottom: 1px solid #e5e7eb;
            }

            #crmDetalhesCliente .crm-fechar {
                border: 0;
                background: #1e3a8a;
                color: #fff;
                width: 40px;
                height: 40px;
                border-radius: 10px;
                cursor: pointer;
                font-size: 20px;
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
                background: #1e3a8a;
                color: #fff;
                font-weight: 700;
            }

            #crmDetalhesCliente .crm-subtitulo {
                color: #6b7280;
                font-size: 13px;
                margin-top: 3px;
            }

            #crmDetalhesCliente .crm-resumo {
                display: grid;
                grid-template-columns: repeat(4, minmax(0,1fr));
                gap: 12px;
                padding: 18px 20px;
            }

            #crmDetalhesCliente .crm-card {
                border: 1px solid #e5e7eb;
                border-radius: 12px;
                padding: 14px;
                background: #eff6ff;
            }

            #crmDetalhesCliente .crm-card-label {
                color: #6b7280;
                font-size: 12px;
                margin-bottom: 6px;
            }

            #crmDetalhesCliente .crm-card-value {
                font-size: 18px;
                font-weight: 700;
            }

            #crmDetalhesCliente .crm-info {
                display: grid;
                grid-template-columns: repeat(3, minmax(0,1fr));
                gap: 10px;
                padding: 0 20px 18px;
            }

            #crmDetalhesCliente .crm-info-item {
                padding: 12px;
                border-bottom: 1px solid #e5e7eb;
            }

            #crmDetalhesCliente .crm-info-item small {
                display: block;
                color: #6b7280;
                margin-bottom: 4px;
            }

            #crmDetalhesCliente .crm-historico {
                padding: 0 20px 20px;
            }

            #crmDetalhesCliente .crm-historico-wrap {
                overflow-x: auto;
                border: 1px solid #e5e7eb;
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
                border-bottom: 1px solid #e5e7eb;
                white-space: nowrap;
                font-size: 13px;
            }

            #crmDetalhesCliente th {
                background: #eff6ff;
                font-weight: 700;
            }

            #crmDetalhesCliente .crm-status {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                padding: 5px 10px;
                border-radius: 999px;
                font-size: 12px;
                font-weight: 700;
                line-height: 1;
                border: 1px solid transparent;
            }

            #crmDetalhesCliente .crm-status.concluido {
                color: #166534;
                background: #dcfce7;
                border-color: #86efac;
            }

            #crmDetalhesCliente .crm-status.processando {
                color: #92400e;
                background: #fef3c7;
                border-color: #fcd34d;
            }

            #crmDetalhesCliente .crm-status.pendente {
                color: #1d4ed8;
                background: #dbeafe;
                border-color: #93c5fd;
            }

            #crmDetalhesCliente .crm-status.erro {
                color: #991b1b;
                background: #fee2e2;
                border-color: #fca5a5;
            }

            @media (max-width: 700px) {
                #crmDetalhesCliente .crm-resumo {
                    grid-template-columns: repeat(2, minmax(0,1fr));
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

    function renderizarClientes(clientes) {
        const t = tabela();

        if (!t) {
            throw new Error("#tabelaClientes não encontrado.");
        }

        const tbody = t.querySelector("tbody");

        if (!tbody) {
            throw new Error("tbody da tabela de clientes não encontrado.");
        }

        configurarCabecalho();

        if (!clientes.length) {
            mensagem("Nenhum cliente com compras encontrado.");
            return;
        }

        tbody.innerHTML = "";

        clientes.forEach((cliente) => {
            const tr = document.createElement("tr");

            tr.style.cursor = "pointer";
            tr.title = "Clique para ver os detalhes deste cliente";

            tr.innerHTML = `
                <td>${escapar(cliente.nome || "-")}</td>
                <td>${escapar(cliente.numeroCliente || "-")}</td>
                <td>${escapar(cliente.numeroRecebeu || "-")}</td>
                <td>${numero(cliente.totalGB).toLocaleString("pt-MZ", { maximumFractionDigits: 2 })} GB</td>
                <td>${cliente.compras.length}</td>
                <td>${formatarMT(cliente.totalGasto)}</td>
                <td>${escapar(cliente.grupo || "-")}</td>
                <td>${formatarDataHora(cliente.ultimaCompra)}</td>
                <td>
                    <button type="button" class="crm-ver-detalhes">
                        Ver detalhes
                    </button>
                </td>
            `;

            tr.addEventListener("click", () => abrirDetalhesCRM(cliente));

            const botao = tr.querySelector(".crm-ver-detalhes");
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
