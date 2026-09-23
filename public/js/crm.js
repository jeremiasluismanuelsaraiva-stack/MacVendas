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
                <th>MB / GB</th>
                <th>Pacote</th>
                <th>Valor</th>
                <th>Pagamento</th>
                <th>Dispositivo usado</th>
                <th>Grupo</th>
                <th>Status</th>
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
                <td colspan="10" style="text-align:center;padding:25px;${erro ? "color:#ff6b6b;" : ""}">
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

    function renderizarCompras(compras) {
        const t = tabela();

        if (!t) {
            throw new Error("#tabelaClientes não encontrado.");
        }

        const tbody = t.querySelector("tbody");

        if (!tbody) {
            throw new Error("tbody da tabela de clientes não encontrado.");
        }

        configurarCabecalho();

        if (!Array.isArray(compras) || compras.length === 0) {
            mensagem("Nenhuma compra encontrada.");
            return;
        }

        tbody.innerHTML = "";

        compras.forEach((compra) => {
            const status = obterStatus(compra);
            const statusTexto = textoStatus(status);
            const classe = classeStatus(status);

            const tr = document.createElement("tr");

            tr.innerHTML = `
                <td>${escapar(obterCliente(compra))}</td>
                <td>${escapar(obterNumeroClienteCompra(compra))}</td>
                <td>${escapar(obterNumeroRecebeu(compra))}</td>
                <td>${escapar(obterQuantidade(compra))}</td>
                <td>${escapar(obterPacote(compra))}</td>
                <td>${formatarMT(obterValor(compra))}</td>
                <td>${escapar(obterPagamento(compra))}</td>
                <td>${escapar(obterDispositivo(compra))}</td>
                <td>${escapar(obterGrupo(compra))}</td>
                <td>
                    <strong class="crm-status crm-status-${classe}">
                        ${escapar(statusTexto)}
                    </strong>
                </td>
            `;

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

            console.log("[CRM] Compras recebidas:", compras.length);
            renderizarCompras(compras);
            return compras;
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

    console.log("[CRM] crm.js de vendas carregado.");
})();
