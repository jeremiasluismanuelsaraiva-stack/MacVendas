// =====================================================
// MOZ TECH
// CRM - CLIENTES
// Local: public/js/crm.js
// =====================================================

(function () {
    "use strict";

    const API = "http://br1.bronxyshost.com:4234";

    let carregando = false;

    async function garantirCredenciais() {
        if (typeof window.garantirCredenciaisAPI === "function") {
            const ok = await window.garantirCredenciaisAPI();
            if (!ok) {
                throw new Error(
                    "Usuário não autenticado ou credenciais da API não encontradas."
                );
            }
        }
    }

    async function chamarAPI(endpoint, options = {}) {
        const metodo = String(options.method || "GET").toUpperCase();

        // Usa a API central quando ela estiver disponível.
        if (window.MOZ_API) {
            if (metodo === "GET" && typeof window.MOZ_API.get === "function") {
                return await window.MOZ_API.get(endpoint);
            }

            if (metodo === "POST" && typeof window.MOZ_API.post === "function") {
                return await window.MOZ_API.post(endpoint, options.body || {});
            }

            if (metodo === "PUT" && typeof window.MOZ_API.put === "function") {
                return await window.MOZ_API.put(endpoint, options.body || {});
            }

            if (metodo === "DELETE" && typeof window.MOZ_API.delete === "function") {
                return await window.MOZ_API.delete(endpoint);
            }
        }

        const apiKey = localStorage.getItem("apiKey") || "";
        const uid = localStorage.getItem("uid") || "";

        const headers = {
            "Content-Type": "application/json"
        };

        if (apiKey) headers["x-api-key"] = apiKey;
        if (uid) headers["x-uid"] = uid;

        const config = {
            method: metodo,
            headers
        };

        if (options.body !== undefined && metodo !== "GET") {
            config.body = JSON.stringify(options.body);
        }

        const resposta = await fetch(API + endpoint, config);

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
                "Erro HTTP " + resposta.status
            );
        }

        return json;
    }

    function escaparHTML(valor) {
        return String(valor ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function escaparAtributo(valor) {
        return escaparHTML(valor);
    }

    function numero(valor) {
        const n = Number(valor);
        return Number.isFinite(n) ? n : 0;
    }

    function formatarSaldo(saldo) {
        return numero(saldo) + " GB";
    }

    function obterTabela() {
        return document.getElementById("tabelaClientes");
    }

    async function carregarClientes() {
        if (carregando) {
            return;
        }

        const tabela = obterTabela();

        if (!tabela) {
            console.warn(
                "[MOZ TECH] #tabelaClientes não encontrado neste momento."
            );
            return;
        }

        carregando = true;

        try {
            const tbody = tabela.querySelector("tbody");

            if (!tbody) {
                throw new Error(
                    "A tabela #tabelaClientes não possui <tbody>."
                );
            }

            tbody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align:center;padding:25px;">
                        <i class="fas fa-spinner fa-spin"></i>
                        Carregando clientes...
                    </td>
                </tr>
            `;

            await garantirCredenciais();

            console.log("[MOZ TECH] CRM: buscando clientes...");

            const json = await chamarAPI("/clientes");

            console.log("[MOZ TECH] CRM: resposta clientes:", json);

            if (!json || json.success !== true) {
                throw new Error(
                    json?.error ||
                    json?.message ||
                    "A API não retornou sucesso."
                );
            }

            const clientes = Array.isArray(json.clientes)
                ? json.clientes
                : [];

            tbody.innerHTML = "";

            if (clientes.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="7" style="text-align:center;padding:30px;">
                            <i
                                class="fas fa-users"
                                style="font-size:28px;display:block;margin-bottom:10px;"
                            ></i>
                            Nenhum cliente encontrado.
                        </td>
                    </tr>
                `;
                return;
            }

            clientes.forEach(cliente => {
                const tr = document.createElement("tr");

                tr.innerHTML = `
                    <td>${escaparHTML(cliente.id || "-")}</td>

                    <td>${escaparHTML(cliente.nome || "-")}</td>

                    <td>
                        ${escaparHTML(
                            cliente.telefone ||
                            cliente.numero ||
                            cliente.numeroCliente ||
                            "-"
                        )}
                    </td>

                    <td>${escaparHTML(cliente.email || "-")}</td>

                    <td>${escaparHTML(cliente.grupo || "-")}</td>

                    <td>${formatarSaldo(cliente.saldo)}</td>

                    <td>
                        <button
                            type="button"
                            class="btn btn-outline"
                            data-editar-cliente="${escaparAtributo(cliente.id)}"
                        >
                            <i class="fas fa-edit"></i>
                            Editar
                        </button>

                        <button
                            type="button"
                            class="btn btn-danger"
                            data-remover-cliente="${escaparAtributo(cliente.id)}"
                        >
                            <i class="fas fa-trash"></i>
                            Remover
                        </button>
                    </td>
                `;

                tbody.appendChild(tr);
            });

            tbody.querySelectorAll("[data-editar-cliente]").forEach(botao => {
                botao.addEventListener("click", function () {
                    editarCliente(
                        this.getAttribute("data-editar-cliente")
                    );
                });
            });

            tbody.querySelectorAll("[data-remover-cliente]").forEach(botao => {
                botao.addEventListener("click", function () {
                    removerCliente(
                        this.getAttribute("data-remover-cliente")
                    );
                });
            });

        } catch (erro) {
            console.error(
                "[MOZ TECH] Erro ao carregar clientes:",
                erro
            );

            const tbody = tabela.querySelector("tbody");

            if (tbody) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="7" style="text-align:center;padding:30px;">
                            <i
                                class="fas fa-circle-exclamation"
                                style="font-size:28px;display:block;margin-bottom:10px;"
                            ></i>

                            <strong>Não foi possível carregar os clientes.</strong>

                            <br>

                            <small>
                                ${escaparHTML(erro.message)}
                            </small>

                            <br><br>

                            <button
                                type="button"
                                class="btn btn-outline"
                                id="btnTentarClientes"
                            >
                                <i class="fas fa-rotate"></i>
                                Tentar novamente
                            </button>
                        </td>
                    </tr>
                `;

                const btn = document.getElementById("btnTentarClientes");

                if (btn) {
                    btn.addEventListener("click", carregarClientes);
                }
            }
        } finally {
            carregando = false;
        }
    }

    async function adicionarCliente(dados) {
        try {
            await garantirCredenciais();

            const json = await chamarAPI("/clientes", {
                method: "POST",
                body: dados
            });

            if (!json || json.success !== true) {
                throw new Error(
                    json?.error || "Erro ao adicionar cliente."
                );
            }

            await carregarClientes();

            return json;

        } catch (erro) {
            console.error(
                "[MOZ TECH] Erro ao adicionar cliente:",
                erro
            );

            alert(
                "Não foi possível adicionar o cliente.\n\n" +
                erro.message
            );

            return {
                success: false,
                error: erro.message
            };
        }
    }

    async function editarCliente(id) {
        const nome = prompt("Digite o novo nome do cliente:");

        if (nome === null) return;

        const nomeLimpo = nome.trim();

        if (!nomeLimpo) {
            alert("O nome não pode ficar vazio.");
            return;
        }

        try {
            await garantirCredenciais();

            const json = await chamarAPI(
                "/clientes/" + encodeURIComponent(id),
                {
                    method: "PUT",
                    body: {
                        nome: nomeLimpo
                    }
                }
            );

            if (!json || json.success !== true) {
                throw new Error(
                    json?.error || "Erro ao editar cliente."
                );
            }

            await carregarClientes();

            alert("Cliente atualizado com sucesso!");

        } catch (erro) {
            console.error(
                "[MOZ TECH] Erro ao editar cliente:",
                erro
            );

            alert(
                "Não foi possível editar o cliente.\n\n" +
                erro.message
            );
        }
    }

    async function removerCliente(id) {
        const confirmar = confirm(
            "Tem certeza que deseja remover este cliente?"
        );

        if (!confirmar) return;

        try {
            await garantirCredenciais();

            const json = await chamarAPI(
                "/clientes/" + encodeURIComponent(id),
                {
                    method: "DELETE"
                }
            );

            if (!json || json.success !== true) {
                throw new Error(
                    json?.error || "Erro ao remover cliente."
                );
            }

            await carregarClientes();

            alert("Cliente removido com sucesso!");

        } catch (erro) {
            console.error(
                "[MOZ TECH] Erro ao remover cliente:",
                erro
            );

            alert(
                "Não foi possível remover o cliente.\n\n" +
                erro.message
            );
        }
    }

    function iniciarCRM() {
        const tabela = obterTabela();

        if (!tabela) {
            // O app.js pode chamar antes do painel terminar de existir.
            // Tenta novamente depois de um pequeno intervalo.
            setTimeout(() => {
                if (obterTabela()) {
                    carregarClientes();
                }
            }, 300);

            return false;
        }

        carregarClientes();
        return true;
    }

    // Compatibilidade com o app.js e com outros módulos.
    window.carregarClientes = carregarClientes;
    window.adicionarCliente = adicionarCliente;
    window.editarCliente = editarCliente;
    window.removerCliente = removerCliente;
    window.iniciarCRM = iniciarCRM;
    window.abrirCRM = iniciarCRM;

    document.addEventListener("DOMContentLoaded", function () {
        setTimeout(() => {
            if (obterTabela()) {
                carregarClientes();
            }
        }, 500);
    });

})();
