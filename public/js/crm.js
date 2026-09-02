// =====================================================
// MOZ TECH
// CRM - CLIENTES
// Local: public/js/clientes.js
// =====================================================

(function () {

    "use strict";


    // =================================================
    // API
    // =================================================

    const API = window.location.origin;


    // =================================================
    // CARREGAR CLIENTES
    // GET /clientes
    // =================================================

    async function carregarClientes() {

        const tabela =
            document.getElementById("tabelaClientes");


        if (!tabela) {

            console.warn(
                "[MOZ TECH] #tabelaClientes não encontrado."
            );

            return;

        }


        try {

            tabela.innerHTML = `
                <tr>
                    <td
                        colspan="7"
                        style="text-align:center;padding:20px;"
                    >
                        Carregando clientes...
                    </td>
                </tr>
            `;


            const resposta =
                await fetch(
                    API + "/clientes",
                    {
                        method: "GET",
                        cache: "no-store"
                    }
                );


            if (!resposta.ok) {

                throw new Error(
                    "Erro HTTP: " +
                    resposta.status
                );

            }


            const json =
                await resposta.json();


            console.log(
                "[MOZ TECH] Clientes recebidos:",
                json
            );


            if (!json.success) {

                throw new Error(
                    json.error ||
                    "A API não retornou sucesso."
                );

            }


            const clientes =
                Array.isArray(json.clientes)
                    ? json.clientes
                    : [];


            tabela.innerHTML = "";


            if (clientes.length === 0) {

                tabela.innerHTML = `
                    <tr>

                        <td
                            colspan="7"
                            style="
                                text-align:center;
                                padding:25px;
                            "
                        >

                            <i
                                class="fas fa-users"
                                style="
                                    font-size:25px;
                                    margin-bottom:10px;
                                    display:block;
                                "
                            ></i>

                            Nenhum cliente encontrado.

                        </td>

                    </tr>
                `;

                return;

            }


            clientes.forEach(cliente => {

                const tr =
                    document.createElement("tr");


                tr.innerHTML = `

                    <td>
                        ${escaparHTML(
                            cliente.id ?? "-"
                        )}
                    </td>

                    <td>
                        ${escaparHTML(
                            cliente.nome || "-"
                        )}
                    </td>

                    <td>
                        ${escaparHTML(
                            cliente.telefone ||
                            cliente.numero ||
                            "-"
                        )}
                    </td>

                    <td>
                        ${escaparHTML(
                            cliente.email || "-"
                        )}
                    </td>

                    <td>
                        ${escaparHTML(
                            cliente.grupo || "-"
                        )}
                    </td>

                    <td>
                        ${formatarSaldo(
                            cliente.saldo
                        )}
                    </td>

                    <td>

                        <button
                            type="button"
                            class="btn btn-outline"
                            data-editar-cliente="${escaparAtributo(
                                cliente.id
                            )}"
                        >

                            <i
                                class="fas fa-edit"
                            ></i>

                            Editar

                        </button>


                        <button
                            type="button"
                            class="btn btn-danger"
                            data-remover-cliente="${escaparAtributo(
                                cliente.id
                            )}"
                        >

                            <i
                                class="fas fa-trash"
                            ></i>

                            Remover

                        </button>

                    </td>

                `;


                tabela.appendChild(tr);

            });


            // =================================================
            // EDITAR
            // =================================================

            tabela
                .querySelectorAll(
                    "[data-editar-cliente]"
                )
                .forEach(botao => {

                    botao.addEventListener(
                        "click",
                        function () {

                            const id =
                                this.getAttribute(
                                    "data-editar-cliente"
                                );


                            editarCliente(id);

                        }
                    );

                });


            // =================================================
            // REMOVER
            // =================================================

            tabela
                .querySelectorAll(
                    "[data-remover-cliente]"
                )
                .forEach(botao => {

                    botao.addEventListener(
                        "click",
                        function () {

                            const id =
                                this.getAttribute(
                                    "data-remover-cliente"
                                );


                            removerCliente(id);

                        }
                    );

                });

        }
        catch (erro) {

            console.error(
                "[MOZ TECH] Erro ao carregar clientes:",
                erro
            );


            tabela.innerHTML = `
                <tr>

                    <td
                        colspan="7"
                        style="
                            text-align:center;
                            padding:25px;
                        "
                    >

                        <i
                            class="fas fa-circle-exclamation"
                        ></i>

                        Não foi possível carregar os clientes.

                        <br>

                        <small>
                            ${escaparHTML(
                                erro.message
                            )}
                        </small>

                    </td>

                </tr>
            `;

        }

    }


    // =================================================
    // FORMATAR SALDO
    // =================================================

    function formatarSaldo(saldo) {

        const valor =
            Number(saldo);


        if (!Number.isFinite(valor)) {

            return "0 GB";

        }


        return valor + " GB";

    }


    // =================================================
    // ESCAPAR HTML
    // =================================================

    function escaparHTML(valor) {

        return String(valor ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    }


    // =================================================
    // ESCAPAR ATRIBUTO
    // =================================================

    function escaparAtributo(valor) {

        return escaparHTML(valor);

    }


    // =================================================
    // ADICIONAR CLIENTE
    // POST /clientes
    // =================================================

    async function adicionarCliente(dados) {

        try {

            const resposta =
                await fetch(
                    API + "/clientes",
                    {

                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify(dados)

                    }
                );


            const json =
                await resposta.json();


            if (!resposta.ok) {

                throw new Error(
                    json.error ||
                    "Erro ao adicionar cliente."
                );

            }


            await carregarClientes();


            return json;

        }
        catch (erro) {

            console.error(
                "[MOZ TECH] Erro ao adicionar cliente:",
                erro
            );


            alert(
                "Não foi possível adicionar o cliente."
            );


            return {

                success: false,

                error:
                    erro.message

            };

        }

    }


    // =================================================
    // EDITAR CLIENTE
    // =================================================

    async function editarCliente(id) {

        const nome =
            prompt(
                "Digite o novo nome do cliente:"
            );


        if (nome === null) {

            return;

        }


        const nomeLimpo =
            nome.trim();


        if (!nomeLimpo) {

            alert(
                "O nome não pode ficar vazio."
            );

            return;

        }


        try {

            const resposta =
                await fetch(
                    API +
                    "/clientes/" +
                    encodeURIComponent(id),
                    {

                        method: "PUT",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify({
                                nome: nomeLimpo
                            })

                    }
                );


            const json =
                await resposta.json();


            if (!resposta.ok) {

                throw new Error(
                    json.error ||
                    "Erro ao editar cliente."
                );

            }


            await carregarClientes();


            alert(
                "Cliente atualizado com sucesso!"
            );

        }
        catch (erro) {

            console.error(
                "[MOZ TECH] Erro ao editar cliente:",
                erro
            );


            alert(
                "Não foi possível editar o cliente."
            );

        }

    }


    // =================================================
    // REMOVER CLIENTE
    // =================================================

    async function removerCliente(id) {

        const confirmar =
            confirm(
                "Tem certeza que deseja remover este cliente?"
            );


        if (!confirmar) {

            return;

        }


        try {

            const resposta =
                await fetch(
                    API +
                    "/clientes/" +
                    encodeURIComponent(id),
                    {

                        method: "DELETE"

                    }
                );


            const json =
                await resposta.json();


            if (!resposta.ok) {

                throw new Error(
                    json.error ||
                    "Erro ao remover cliente."
                );

            }


            await carregarClientes();


            alert(
                "Cliente removido com sucesso!"
            );

        }
        catch (erro) {

            console.error(
                "[MOZ TECH] Erro ao remover cliente:",
                erro
            );


            alert(
                "Não foi possível remover o cliente."
            );

        }

    }


    // =================================================
    // DISPONIBILIZAR FUNÇÕES
    // =================================================

    window.carregarClientes =
        carregarClientes;

    window.adicionarCliente =
        adicionarCliente;

    window.editarCliente =
        editarCliente;

    window.removerCliente =
        removerCliente;


    // =================================================
    // INICIALIZAÇÃO
    // =================================================

    /*
     * NÃO chamar carregarClientes()
     * automaticamente.
     *
     * O app.js chama a função quando
     * o painel CRM é aberto.
     */

})();
