// =====================================================
// MOZ TECH - CRM DEFINITIVO
// public/js/crm.js
// =====================================================

(function () {
    "use strict";

    const API_URL = "http://br1.bronxyshost.com:4234";

    let carregando = false;

    function elemento(id) {
        return document.getElementById(id);
    }

    function obterCredenciais() {
        const cred = window.MOZ_CREDENCIAIS_API || {};

        const uid = String(
            cred.uid ||
            localStorage.getItem("uid") ||
            localStorage.getItem("moz_uid") ||
            ""
        ).trim();

        const apiKey = String(
            cred.apiKey ||
            localStorage.getItem("apiKey") ||
            localStorage.getItem("moz_api_key") ||
            ""
        ).trim();

        return { uid, apiKey };
    }

    async function requisicaoClientes(url, opcoes = {}) {
        const { uid, apiKey } = obterCredenciais();

        if (!uid || !apiKey) {
            throw new Error("UID ou API Key não encontrados.");
        }

        const headers = {
            "Content-Type": "application/json",
            "x-api-key": apiKey,
            "x-uid": uid,
            ...(opcoes.headers || {})
        };

        console.log("[CRM] GET/REQUEST:", url);

        const resposta = await fetch(url, {
            ...opcoes,
            headers
        });

        let dados = null;

        try {
            dados = await resposta.json();
        } catch (_) {
            dados = null;
        }

        console.log("[CRM] HTTP:", resposta.status);
        console.log("[CRM] Resposta:", dados);

        if (!resposta.ok) {
            throw new Error(
                dados?.error ||
                dados?.message ||
                `HTTP ${resposta.status}`
            );
        }

        return dados;
    }

    function obterTabela() {
        return elemento("tabelaClientes");
    }

    function mostrarMensagem(mensagem, erro = false) {
        const tabela = obterTabela();

        if (!tabela) {
            console.warn("[CRM] #tabelaClientes não encontrado.");
            return;
        }

        const tbody = tabela.querySelector("tbody");

        if (!tbody) {
            console.warn("[CRM] tbody da tabela de clientes não encontrado.");
            return;
        }

        tbody.innerHTML = `
            <tr>
                <td colspan="7"
                    style="text-align:center;padding:25px;${erro ? "color:#ff6b6b;" : ""}">
                    ${mensagem}
                </td>
            </tr>
        `;
    }

    function escapar(valor) {
        return String(valor ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function renderizarClientes(clientes) {
        const tabela = obterTabela();

        if (!tabela) {
            throw new Error("#tabelaClientes não encontrado.");
        }

        const tbody = tabela.querySelector("tbody");

        if (!tbody) {
            throw new Error("tbody da tabela de clientes não encontrado.");
        }

        if (!Array.isArray(clientes) || clientes.length === 0) {
            mostrarMensagem("Nenhum cliente encontrado.");
            return;
        }

        tbody.innerHTML = "";

        clientes.forEach(cliente => {
            const id = cliente.id || "";
            const nome = cliente.nome || cliente.nomeCliente || "Sem nome";
            const telefone =
                cliente.telefone ||
                cliente.numero ||
                cliente.numeroCliente ||
                "";
            const email = cliente.email || "";
            const grupo =
                cliente.grupo ||
                cliente.grupoId ||
                cliente.grupo_id ||
                "";
            const saldo = Number(cliente.saldo || 0);

            const tr = document.createElement("tr");

            tr.innerHTML = `
                <td>${escapar(id)}</td>
                <td>${escapar(nome)}</td>
                <td>${escapar(telefone)}</td>
                <td>${escapar(email)}</td>
                <td>${escapar(grupo)}</td>
                <td>${saldo.toLocaleString("pt-MZ")} MT</td>
                <td>
                    <button type="button"
                            onclick="editarCliente('${escapar(id)}')">
                        Editar
                    </button>

                    <button type="button"
                            onclick="removerCliente('${escapar(id)}')">
                        Remover
                    </button>
                </td>
            `;

            tbody.appendChild(tr);
        });
    }

    async function carregarClientes() {
        if (carregando) {
            console.log("[CRM] Carregamento já em andamento.");
            return;
        }

        carregando = true;

        try {
            mostrarMensagem("Carregando clientes...");

            const { uid, apiKey } = obterCredenciais();

            console.log("[CRM] UID:", uid);
            console.log("[CRM] API Key encontrada:", !!apiKey);

            if (!uid || !apiKey) {
                throw new Error("Credenciais da API não encontradas.");
            }

            const dados = await requisicaoClientes(
                `${API_URL}/clientes`
            );

            const clientes = Array.isArray(dados?.clientes)
                ? dados.clientes
                : [];

            console.log(
                "[CRM] Total de clientes:",
                clientes.length
            );

            renderizarClientes(clientes);

            return dados;
        } catch (erro) {
            console.error(
                "[CRM] ERRO AO CARREGAR CLIENTES:",
                erro
            );

            mostrarMensagem(
                `Não foi possível carregar os clientes.<br>
                 <small>${escapar(erro.message)}</small><br>
                 <button type="button" onclick="carregarClientes()">
                    Tentar novamente
                 </button>`,
                true
            );

            throw erro;
        } finally {
            carregando = false;
        }
    }

    async function abrirCRM() {
        const painel =
            elemento("panelCRM") ||
            elemento("painelCRM") ||
            elemento("crm");

        if (painel) {
            painel.style.display = "";
            painel.classList.add("active");
        }

        return carregarClientes();
    }

    async function iniciarCRM() {
        return carregarClientes();
    }

    async function adicionarCliente(dados = {}) {
        try {
            const resposta = await requisicaoClientes(
                `${API_URL}/clientes`,
                {
                    method: "POST",
                    body: JSON.stringify(dados)
                }
            );

            await carregarClientes();
            return resposta;
        } catch (erro) {
            console.error("[CRM] Erro ao adicionar cliente:", erro);
            alert("Não foi possível adicionar o cliente.");
            throw erro;
        }
    }

    async function editarCliente(id, dados) {
        if (!id) {
            alert("ID do cliente não informado.");
            return;
        }

        if (dados === undefined) {
            const cliente = prompt("Digite os dados JSON do cliente:");

            if (!cliente) {
                return;
            }

            try {
                dados = JSON.parse(cliente);
            } catch (_) {
                alert("JSON inválido.");
                return;
            }
        }

        try {
            const resposta = await requisicaoClientes(
                `${API_URL}/clientes/${encodeURIComponent(id)}`,
                {
                    method: "PUT",
                    body: JSON.stringify(dados)
                }
            );

            await carregarClientes();
            return resposta;
        } catch (erro) {
            console.error("[CRM] Erro ao editar cliente:", erro);
            alert("Não foi possível editar o cliente.");
            throw erro;
        }
    }

    async function removerCliente(id) {
        if (!id) {
            return;
        }

        if (!confirm("Deseja realmente remover este cliente?")) {
            return;
        }

        try {
            const resposta = await requisicaoClientes(
                `${API_URL}/clientes/${encodeURIComponent(id)}`,
                {
                    method: "DELETE"
                }
            );

            await carregarClientes();

            alert("Cliente removido com sucesso.");

            return resposta;
        } catch (erro) {
            console.error("[CRM] Erro ao remover cliente:", erro);
            alert("Não foi possível remover o cliente.");
            throw erro;
        }
    }

    // =====================================================
    // EXPOR FUNÇÕES
    //
    // IMPORTANTE:
    // abrirCRM NÃO aponta para iniciarCRM.
    // iniciarCRM NÃO aponta para abrirCRM.
    // Assim não existe chamada circular.
    // =====================================================

    window.carregarClientes = carregarClientes;
    window.abrirCRM = abrirCRM;
    window.iniciarCRM = iniciarCRM;
    window.adicionarCliente = adicionarCliente;
    window.editarCliente = editarCliente;
    window.removerCliente = removerCliente;

    console.log("[CRM] crm.js definitivo carregado.");

})();
