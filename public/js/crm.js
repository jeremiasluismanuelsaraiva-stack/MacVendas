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
                <th>ID</th>
                <th>Nome</th>
                <th>Nº Cliente</th>
                <th>Nº que recebeu</th>
                <th>Grupo</th>
                <th>Total GB</th>
                <th>Compras</th>
                <th>Total gasto</th>
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
                <td colspan="10" style="text-align:center;padding:25px;${erro ? "color:#ff6b6b;" : ""}">
                    ${texto}
                </td>
            </tr>
        `;
    }

    function criarClientesDeCompras(compras) {
        const mapa = new Map();

        (Array.isArray(compras) ? compras : []).forEach(compra => {
            const numeroCliente = compra.numeroCliente || compra.telefone || compra.numero || "";
            const numeroRecebeu = compra.numeroRecebeu || compra.numeroDestino || compra.destino || "";
            const chave = String(numeroCliente || numeroRecebeu).replace(/\D/g, "");
            if (!chave) return;

            if (!mapa.has(chave)) {
                mapa.set(chave, {
                    id: compra.clienteId || chave,
                    nome: compra.nomeCliente || compra.nome || "Sem nome",
                    numeroCliente,
                    numeroRecebeu,
                    grupo: compra.grupo || "-",
                    totalGB: 0,
                    totalCompras: 0,
                    totalGasto: 0,
                    ultimaCompra: ""
                });
            }

            const c = mapa.get(chave);
            const gb = numero(compra.gb) || (numero(compra.mb) / 1000);
            c.totalGB += gb;
            c.totalCompras += 1;
            c.totalGasto += numero(compra.valor);
            if (numeroRecebeu) c.numeroRecebeu = numeroRecebeu;
            if (compra.nomeCliente || compra.nome) c.nome = compra.nomeCliente || compra.nome;
            if (compra.grupo) c.grupo = compra.grupo;

            const dataAtual = dataCompra(compra);
            if (dataAtual && (!c.ultimaCompra || new Date(dataAtual) > new Date(c.ultimaCompra))) {
                c.ultimaCompra = dataAtual;
            }
        });

        return Array.from(mapa.values());
    }

    function renderizarClientes(clientes) {
        const t = tabela();
        if (!t) throw new Error("#tabelaClientes não encontrado.");
        const tbody = t.querySelector("tbody");
        if (!tbody) throw new Error("tbody da tabela de clientes não encontrado.");

        configurarCabecalho();

        if (!clientes.length) {
            mensagem("Nenhum cliente com compras encontrado.");
            return;
        }

        tbody.innerHTML = "";

        clientes.forEach(cliente => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${escapar(cliente.id)}</td>
                <td>${escapar(cliente.nome)}</td>
                <td>${escapar(cliente.numeroCliente || "-")}</td>
                <td>${escapar(cliente.numeroRecebeu || "-")}</td>
                <td>${escapar(cliente.grupo || "-")}</td>
                <td>${numero(cliente.totalGB).toLocaleString("pt-MZ", { maximumFractionDigits: 2 })} GB</td>
                <td>${numero(cliente.totalCompras)}</td>
                <td>${formatarMT(cliente.totalGasto)}</td>
                <td>${formatarData(cliente.ultimaCompra)}</td>
                <td>
                    <button type="button" onclick="verClienteCRM('${escapar(cliente.id)}')">Ver</button>
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

            const clientes = criarClientesDeCompras(compras);
            console.log("[CRM] Clientes derivados das compras:", clientes.length);
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

    console.log("[CRM] crm.js de vendas carregado.");
})();
