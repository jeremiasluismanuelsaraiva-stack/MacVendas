/* ============================================================
   MOZ TECH / MACVENDAS
   CRM AVANÇADO - VERSÃO LIMPA
   public/js/crm.js

   IMPORTANTE:
   - Este arquivo não depende de garantirEstatisticasCRM()
   - Não cria cards antigos de clientes
   - Usa diretamente a tabela #tabelaClientes
   - Busca as compras em /compras e agrupa os clientes
   ============================================================ */

(function () {
    "use strict";

    const API_URL = "/api";
    let carregando = false;
    let clientesCRM = [];

    function numero(valor) {
        const n = Number(valor);
        return Number.isFinite(n) ? n : 0;
    }

    function escapar(valor) {
        return String(valor ?? "-")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function formatarMT(valor) {
        return `${numero(valor).toLocaleString("pt-MZ", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        })} MT`;
    }

    function formatarGB(valor) {
        return `${numero(valor).toLocaleString("pt-MZ", {
            maximumFractionDigits: 2
        })} GB`;
    }

    function dataValida(valor) {
        if (!valor) return null;
        const data = new Date(valor);
        return Number.isNaN(data.getTime()) ? null : data;
    }

    function formatarData(valor) {
        const data = dataValida(valor);
        if (!data) return "-";

        return data.toLocaleString("pt-MZ", {
            day: "2-digit",
            month: "2-digit",
            year: "2-digit",
            hour: "2-digit",
            minute: "2-digit"
        });
    }

    function obterDataCompra(compra) {
        return (
            compra?.criadoEm ||
            compra?.criado_em ||
            compra?.createdAt ||
            compra?.data ||
            compra?.dataCompra ||
            compra?.updatedAt ||
            compra?.atualizadoEm ||
            null
        );
    }

    function obterNome(compra) {
        return (
            compra?.nomeCliente ||
            compra?.nome_cliente ||
            compra?.clienteNome ||
            compra?.cliente_nome ||
            compra?.nome ||
            "-"
        );
    }

    function obterNumeroCliente(compra) {
        return (
            compra?.numeroCliente ||
            compra?.numero_cliente ||
            compra?.telefone ||
            compra?.phone ||
            compra?.msisdn ||
            compra?.numero ||
            "-"
        );
    }

    function obterNumeroRecebeu(compra) {
        return (
            compra?.numeroRecebeu ||
            compra?.numero_recebeu ||
            compra?.numeroDestino ||
            compra?.numero_destino ||
            compra?.destino ||
            "-"
        );
    }

    function obterGrupo(compra) {
        return (
            compra?.grupo ||
            compra?.nomeGrupo ||
            compra?.grupoNome ||
            "-"
        );
    }

    function obterGB(compra) {
        const gb = numero(
            compra?.gb ??
            compra?.GB ??
            compra?.gbPacote ??
            compra?.gb_pacote ??
            compra?.quantidadeGB ??
            compra?.quantidade_gb
        );

        if (gb > 0) return gb;

        const mb = numero(
            compra?.mb ??
            compra?.MB ??
            compra?.megabytes ??
            compra?.quantidadeMB ??
            compra?.quantidade_mb
        );

        return mb > 0 ? mb / 1000 : 0;
    }

    function obterValor(compra) {
        return numero(
            compra?.valor ??
            compra?.preco ??
            compra?.preço ??
            compra?.total ??
            compra?.venda
        );
    }

    function obterCusto(compra) {
        return numero(
            compra?.custo ??
            compra?.custoTotal ??
            compra?.custo_total
        );
    }

    function obterLucro(compra) {
        const informado = numero(
            compra?.lucro ??
            compra?.lucroTotal ??
            compra?.lucro_total
        );

        return informado || (obterValor(compra) - obterCusto(compra));
    }

    function chaveCliente(compra) {
        const numeroCliente = String(obterNumeroCliente(compra)).trim();

        if (numeroCliente && numeroCliente !== "-") {
            return `numero:${numeroCliente}`;
        }

        const nome = String(obterNome(compra)).trim().toLowerCase();

        if (nome && nome !== "-") {
            return `nome:${nome}`;
        }

        return `compra:${String(compra?.id || Math.random())}`;
    }

    function agruparClientes(compras) {
        const mapa = new Map();

        (Array.isArray(compras) ? compras : []).forEach((compra) => {
            const chave = chaveCliente(compra);

            if (!mapa.has(chave)) {
                mapa.set(chave, {
                    id: chave,
                    nome: obterNome(compra),
                    numeroCliente: obterNumeroCliente(compra),
                    numeroRecebeu: obterNumeroRecebeu(compra),
                    grupo: obterGrupo(compra),
                    compras: [],
                    totalGB: 0,
                    totalGasto: 0,
                    totalCusto: 0,
                    totalLucro: 0,
                    primeiraCompra: obterDataCompra(compra),
                    ultimaCompra: obterDataCompra(compra)
                });
            }

            const cliente = mapa.get(chave);

            cliente.compras.push(compra);
            cliente.totalGB += obterGB(compra);
            cliente.totalGasto += obterValor(compra);
            cliente.totalCusto += obterCusto(compra);
            cliente.totalLucro += obterLucro(compra);

            const data = dataValida(obterDataCompra(compra));

            if (data) {
                const primeira = dataValida(cliente.primeiraCompra);
                const ultima = dataValida(cliente.ultimaCompra);

                if (!primeira || data < primeira) {
                    cliente.primeiraCompra = data.toISOString();
                }

                if (!ultima || data > ultima) {
                    cliente.ultimaCompra = data.toISOString();

                    cliente.nome = obterNome(compra) || cliente.nome;
                    cliente.numeroCliente =
                        obterNumeroCliente(compra) || cliente.numeroCliente;
                    cliente.numeroRecebeu =
                        obterNumeroRecebeu(compra) || cliente.numeroRecebeu;
                    cliente.grupo =
                        obterGrupo(compra) || cliente.grupo;
                }
            }
        });

        return Array.from(mapa.values()).sort((a, b) => {
            const da = dataValida(a.ultimaCompra)?.getTime() || 0;
            const db = dataValida(b.ultimaCompra)?.getTime() || 0;
            return db - da;
        });
    }

    async function requisicao(endpoint) {
        if (typeof window.garantirCredenciaisAPI === "function") {
            try {
                await window.garantirCredenciaisAPI();
            } catch (erro) {
                console.warn("[CRM] Credenciais:", erro);
            }
        }

        if (
            window.MOZ_API &&
            typeof window.MOZ_API.get === "function"
        ) {
            return await window.MOZ_API.get(endpoint);
        }

        const headers = {
            "Content-Type": "application/json"
        };

        const apiKey =
            localStorage.getItem("apiKey") ||
            localStorage.getItem("API_KEY") ||
            "";

        const uid =
            localStorage.getItem("uid") ||
            localStorage.getItem("userUID") ||
            "";

        if (apiKey) headers["x-api-key"] = apiKey;
        if (uid) headers["x-uid"] = uid;

        const resposta = await fetch(`${API_URL}${endpoint}`, {
            method: "GET",
            headers
        });

        let json = {};

        try {
            json = await resposta.json();
        } catch {
            json = {};
        }

        if (!resposta.ok) {
            throw new Error(
                json.error ||
                json.message ||
                `HTTP ${resposta.status}`
            );
        }

        return json;
    }

    function extrairCompras(resposta) {
        if (Array.isArray(resposta)) return resposta;
        if (Array.isArray(resposta?.compras)) return resposta.compras;
        if (Array.isArray(resposta?.vendas)) return resposta.vendas;
        if (Array.isArray(resposta?.data)) return resposta.data;
        if (Array.isArray(resposta?.data?.compras)) {
            return resposta.data.compras;
        }
        if (Array.isArray(resposta?.data?.vendas)) {
            return resposta.data.vendas;
        }
        return [];
    }

    function atualizarEstatisticasCRM(clientes) {
        const lista = Array.isArray(clientes) ? clientes : [];
        const agora = Date.now();
        const trintaDias = 30 * 24 * 60 * 60 * 1000;
        const seteDias = 7 * 24 * 60 * 60 * 1000;

        const ativos = lista.filter((cliente) => {
            const data = dataValida(cliente.ultimaCompra)?.getTime() || 0;
            return data > 0 && agora - data <= trintaDias;
        }).length;

        const novos = lista.filter((cliente) => {
            const data = dataValida(cliente.primeiraCompra)?.getTime() || 0;
            return data > 0 && agora - data <= seteDias;
        }).length;

        const compras = lista.reduce(
            (total, cliente) => total + cliente.compras.length,
            0
        );

        const totalGB = lista.reduce(
            (total, cliente) => total + numero(cliente.totalGB),
            0
        );

        const totalGasto = lista.reduce(
            (total, cliente) => total + numero(cliente.totalGasto),
            0
        );

        const totalLucro = lista.reduce(
            (total, cliente) => total + numero(cliente.totalLucro),
            0
        );

        const ticket = compras > 0 ? totalGasto / compras : 0;

        const valores = {
            totalClientes: lista.length,
            clientesAtivos: ativos,
            clientesRecentes: novos,
            totalGastoCRM: formatarMT(totalGasto),
            totalComprasCRM: compras,
            totalGBCRM: formatarGB(totalGB),
            ticketMedioCRM: formatarMT(ticket),
            ticketMedioGeral: formatarMT(ticket),
            lucroCRM: formatarMT(totalLucro),
            lucroTotalCRM: formatarMT(totalLucro)
        };

        Object.entries(valores).forEach(([id, valor]) => {
            const elemento = document.getElementById(id);
            if (elemento) elemento.textContent = valor;
        });
    }

    function garantirEstruturaTabela() {
        const tabela = document.getElementById("tabelaClientes");

        if (!tabela) {
            console.warn("[CRM] #tabelaClientes não encontrado.");
            return null;
        }

        let thead = tabela.querySelector("thead");

        if (!thead) {
            thead = document.createElement("thead");
            tabela.prepend(thead);
        }

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

        let tbody = tabela.querySelector("tbody");

        if (!tbody) {
            tbody = document.createElement("tbody");
            tabela.appendChild(tbody);
        }

        tabela.style.width = "100%";
        tabela.style.minWidth = "1100px";
        tabela.style.borderCollapse = "collapse";

        return tbody;
    }

    function prepararEstiloTabela() {
        if (document.getElementById("crmTabelaStyle")) return;

        const style = document.createElement("style");
        style.id = "crmTabelaStyle";

        style.textContent = `
            #panelCRM #tabelaClientes {
                width: 100%;
                min-width: 1100px;
                border-collapse: collapse;
            }

            #panelCRM #tabelaClientes th,
            #panelCRM #tabelaClientes td {
                padding: 12px 14px;
                vertical-align: middle;
                text-align: left;
                white-space: nowrap;
            }

            #panelCRM #tabelaClientes tbody tr {
                cursor: pointer;
                transition: background .15s ease;
            }

            #panelCRM #tabelaClientes tbody tr:hover {
                background: rgba(56, 189, 248, .08);
            }

            #panelCRM .crm-acoes {
                display: flex;
                gap: 7px;
                align-items: center;
            }

            #panelCRM .crm-acoes button {
                border: 0;
                border-radius: 8px;
                padding: 8px 11px;
                color: #fff;
                cursor: pointer;
                font-weight: 700;
                white-space: nowrap;
            }

            #panelCRM .crm-ver-detalhes {
                background: #2563eb;
            }

            #panelCRM .crm-gestao-cliente {
                background: #0ea5e9;
            }

            #panelCRM .crm-acoes button:hover {
                filter: brightness(1.1);
            }

            #crmDetalhesOverlay {
                position: fixed;
                inset: 0;
                z-index: 99999;
                display: none;
                align-items: center;
                justify-content: center;
                padding: 20px;
                background: rgba(5, 15, 35, .72);
                backdrop-filter: blur(5px);
            }

            #crmDetalhesModal {
                width: min(900px, 96vw);
                max-height: 90vh;
                overflow: auto;
                border-radius: 18px;
                background: #0b1730;
                color: #f8fafc;
                border: 1px solid #1e3a8a;
                box-shadow: 0 25px 70px rgba(0,0,0,.45);
            }

            #crmDetalhesModal .crm-modal-header {
                display: flex;
                justify-content: space-between;
                gap: 15px;
                align-items: center;
                padding: 20px;
                border-bottom: 1px solid #1e3a8a;
            }

            #crmDetalhesModal .crm-modal-body {
                padding: 20px;
            }

            #crmDetalhesModal .crm-fechar {
                border: 0;
                border-radius: 8px;
                padding: 8px 12px;
                cursor: pointer;
                background: #ef4444;
                color: #fff;
                font-weight: 700;
            }

            #crmDetalhesModal .crm-info-grid {
                display: grid;
                grid-template-columns: repeat(4, minmax(0, 1fr));
                gap: 12px;
                margin-bottom: 20px;
            }

            #crmDetalhesModal .crm-info {
                padding: 14px;
                border-radius: 12px;
                background: #10264a;
                border: 1px solid #1e3a8a;
            }

            #crmDetalhesModal .crm-info small {
                display: block;
                opacity: .7;
                margin-bottom: 5px;
            }

            #crmDetalhesModal .crm-historico {
                overflow-x: auto;
            }

            #crmDetalhesModal table {
                width: 100%;
                border-collapse: collapse;
            }

            #crmDetalhesModal th,
            #crmDetalhesModal td {
                padding: 10px;
                border-bottom: 1px solid #1e3a8a;
                text-align: left;
            }

            @media (max-width: 800px) {
                #crmDetalhesModal .crm-info-grid {
                    grid-template-columns: repeat(2, minmax(0, 1fr));
                }
            }

            @media (max-width: 520px) {
                #crmDetalhesModal .crm-info-grid {
                    grid-template-columns: 1fr;
                }
            }
        `;

        document.head.appendChild(style);
    }

    function renderizarClientes(clientes) {
        clientesCRM = Array.isArray(clientes) ? clientes : [];

        prepararEstiloTabela();

        const tbody = garantirEstruturaTabela();

        if (!tbody) return;

        atualizarEstatisticasCRM(clientesCRM);

        if (clientesCRM.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="9" style="text-align:center;padding:30px;">
                        Nenhum cliente com compras encontrado.
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = "";

        clientesCRM.forEach((cliente) => {
            const tr = document.createElement("tr");

            tr.innerHTML = `
                <td>${escapar(cliente.nome)}</td>
                <td>${escapar(cliente.numeroCliente)}</td>
                <td>${escapar(cliente.numeroRecebeu)}</td>
                <td>${escapar(formatarGB(cliente.totalGB))}</td>
                <td>${cliente.compras.length}</td>
                <td>${escapar(formatarMT(cliente.totalGasto))}</td>
                <td>${escapar(cliente.grupo)}</td>
                <td>${escapar(formatarData(cliente.ultimaCompra))}</td>
                <td>
                    <div class="crm-acoes">
                        <button type="button" class="crm-ver-detalhes">
                            Ver detalhes
                        </button>
                        <button type="button" class="crm-gestao-cliente">
                            Gestão
                        </button>
                    </div>
                </td>
            `;

            tr.addEventListener("dblclick", () => {
                abrirDetalhesCRM(cliente);
            });

            tr.querySelector(".crm-ver-detalhes")
                ?.addEventListener("click", (evento) => {
                    evento.stopPropagation();
                    abrirDetalhesCRM(cliente);
                });

            tr.querySelector(".crm-gestao-cliente")
                ?.addEventListener("click", (evento) => {
                    evento.stopPropagation();
                    abrirDetalhesCRM(cliente);
                });

            tbody.appendChild(tr);
        });
    }

    function criarModal() {
        if (document.getElementById("crmDetalhesOverlay")) return;

        const overlay = document.createElement("div");
        overlay.id = "crmDetalhesOverlay";

        overlay.innerHTML = `
            <div id="crmDetalhesModal">
                <div class="crm-modal-header">
                    <div>
                        <h2 id="crmModalNome" style="margin:0;">
                            Cliente
                        </h2>
                        <small id="crmModalNumero">
                            -
                        </small>
                    </div>

                    <button
                        type="button"
                        class="crm-fechar"
                        id="crmFecharModal"
                    >
                        Fechar
                    </button>
                </div>

                <div class="crm-modal-body">
                    <div class="crm-info-grid">
                        <div class="crm-info">
                            <small>Total GB</small>
                            <strong id="crmModalGB">0 GB</strong>
                        </div>

                        <div class="crm-info">
                            <small>Compras</small>
                            <strong id="crmModalCompras">0</strong>
                        </div>

                        <div class="crm-info">
                            <small>Total gasto</small>
                            <strong id="crmModalGasto">0 MT</strong>
                        </div>

                        <div class="crm-info">
                            <small>Lucro</small>
                            <strong id="crmModalLucro">0 MT</strong>
                        </div>
                    </div>

                    <p>
                        <strong>Nº que recebeu:</strong>
                        <span id="crmModalRecebeu">-</span>
                    </p>

                    <p>
                        <strong>Grupo:</strong>
                        <span id="crmModalGrupo">-</span>
                    </p>

                    <div class="crm-historico">
                        <h3>Histórico de compras</h3>

                        <table>
                            <thead>
                                <tr>
                                    <th>Data</th>
                                    <th>Pacote</th>
                                    <th>GB</th>
                                    <th>Valor</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody id="crmModalHistorico"></tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        document.getElementById("crmFecharModal")
            ?.addEventListener("click", fecharDetalhesCRM);

        overlay.addEventListener("click", (evento) => {
            if (evento.target === overlay) {
                fecharDetalhesCRM();
            }
        });
    }

    function abrirDetalhesCRM(cliente) {
        if (!cliente) return;

        prepararEstiloTabela();
        criarModal();

        document.getElementById("crmModalNome").textContent =
            cliente.nome || "-";

        document.getElementById("crmModalNumero").textContent =
            cliente.numeroCliente || "-";

        document.getElementById("crmModalGB").textContent =
            formatarGB(cliente.totalGB);

        document.getElementById("crmModalCompras").textContent =
            String(cliente.compras.length);

        document.getElementById("crmModalGasto").textContent =
            formatarMT(cliente.totalGasto);

        document.getElementById("crmModalLucro").textContent =
            formatarMT(cliente.totalLucro);

        document.getElementById("crmModalRecebeu").textContent =
            cliente.numeroRecebeu || "-";

        document.getElementById("crmModalGrupo").textContent =
            cliente.grupo || "-";

        const tbody =
            document.getElementById("crmModalHistorico");

        tbody.innerHTML = "";

        const compras = [...cliente.compras].sort((a, b) => {
            const da = dataValida(obterDataCompra(a))?.getTime() || 0;
            const db = dataValida(obterDataCompra(b))?.getTime() || 0;
            return db - da;
        });

        compras.forEach((compra) => {
            const tr = document.createElement("tr");

            tr.innerHTML = `
                <td>${escapar(formatarData(obterDataCompra(compra)))}</td>
                <td>${escapar(compra?.pacote || "-")}</td>
                <td>${escapar(formatarGB(obterGB(compra)))}</td>
                <td>${escapar(formatarMT(obterValor(compra)))}</td>
                <td>${escapar(compra?.status || "-")}</td>
            `;

            tbody.appendChild(tr);
        });

        document.getElementById("crmDetalhesOverlay").style.display =
            "flex";
    }

    function fecharDetalhesCRM() {
        const modal = document.getElementById("crmDetalhesOverlay");

        if (modal) {
            modal.style.display = "none";
        }
    }

    async function carregarClientes() {
        if (carregando) return clientesCRM;

        carregando = true;

        try {
            console.log("[CRM] Carregando clientes...");

            const resposta = await requisicao("/compras");
            const compras = extrairCompras(resposta);

            console.log("[CRM] Compras recebidas:", compras.length);

            const clientes = agruparClientes(compras);

            console.log("[CRM] Clientes agrupados:", clientes.length);

            renderizarClientes(clientes);

            return clientes;
        } catch (erro) {
            console.error(
                "[CRM] ERRO AO CARREGAR CLIENTES:",
                erro
            );

            const tbody = document.querySelector(
                "#tabelaClientes tbody"
            );

            if (tbody) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="9"
                            style="text-align:center;padding:25px;">
                            Erro ao carregar clientes:
                            ${escapar(erro.message)}
                        </td>
                    </tr>
                `;
            }

            return [];
        } finally {
            carregando = false;
        }
    }

    async function abrirCRM() {
        const painel =
            document.getElementById("panelCRM") ||
            document.getElementById("painelCRM") ||
            document.getElementById("crm");

        if (painel) {
            painel.style.display = "";
            painel.classList.add("active");
        }

        return carregarClientes();
    }

    async function iniciarCRM() {
        return carregarClientes();
    }

    function atualizarCRM() {
        return carregarClientes();
    }

    window.carregarClientes = carregarClientes;
    window.abrirCRM = abrirCRM;
    window.iniciarCRM = iniciarCRM;
    window.atualizarCRM = atualizarCRM;
    window.abrirDetalhesCRM = abrirDetalhesCRM;
    window.fecharDetalhesCRM = fecharDetalhesCRM;
    window.atualizarEstatisticasCRM = atualizarEstatisticasCRM;
    window.agruparClientesCRM = agruparClientes;

    console.log("[CRM] CRM limpo carregado.");

})();
