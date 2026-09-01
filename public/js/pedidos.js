// =====================================================
// MOZ TECH
// PEDIDOS.JS
// =====================================================

(function () {

    "use strict";


    // =====================================================
    // CONFIGURAÇÃO DA API
    // =====================================================

    const API = window.location.origin;


    // =====================================================
    // ELEMENTO
    // =====================================================

    function elemento(id) {

        return document.getElementById(id);

    }


    // =====================================================
    // ESCAPAR HTML
    // =====================================================

    function escapar(valor) {

        return String(valor ?? "")

            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    }


    // =====================================================
    // CARREGAR PEDIDOS
    // GET /pedidos
    // =====================================================

    async function carregarPedidos() {

        console.log(
            "[MOZ TECH] Carregando pedidos..."
        );


        try {

            const resposta =
                await fetch(
                    API + "/pedidos",
                    {
                        method: "GET",

                        headers: {
                            "Accept":
                                "application/json"
                        },

                        cache: "no-store"
                    }
                );


            console.log(
                "[MOZ TECH] Pedidos HTTP:",
                resposta.status
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
                "[MOZ TECH] Resposta pedidos:",
                json
            );


            // =================================================
            // VERIFICAR RESPOSTA
            // =================================================

            if (
                !json ||
                json.success !== true
            ) {

                throw new Error(
                    json?.error ||
                    "Resposta inválida da API."
                );

            }


            // =================================================
            // TABELA
            // =================================================

            const tabela =
                elemento(
                    "tabelaPedidos"
                );


            if (!tabela) {

                console.warn(
                    "[MOZ TECH] #tabelaPedidos não encontrado."
                );

                return [];

            }


            // =================================================
            // PEDIDOS
            // =================================================

            const pedidos =
                Array.isArray(
                    json.pedidos
                )
                    ? json.pedidos
                    : [];


            // =================================================
            // LIMPAR TABELA
            // =================================================

            tabela.innerHTML = "";


            // =================================================
            // NENHUM PEDIDO
            // =================================================

            if (
                pedidos.length === 0
            ) {

                tabela.innerHTML = `

                    <tr>

                        <td
                            colspan="8"
                            style="
                                text-align:center;
                                padding:25px;
                            "
                        >

                            Nenhum pedido encontrado.

                        </td>

                    </tr>

                `;

                return [];

            }


            // =================================================
            // MOSTRAR PEDIDOS
            // =================================================

            pedidos.forEach(
                function (pedido) {

                    const tr =
                        document.createElement(
                            "tr"
                        );


                    const id =
                        pedido.id ?? "-";


                    const cliente =
                        pedido.cliente ?? "-";


                    const numero =
                        pedido.numero ?? "-";


                    const pacote =
                        pedido.pacote ?? "-";


                    const gb =
                        pedido.gb ?? 0;


                    const valor =
                        pedido.valor ?? 0;


                    const estado =
                        pedido.estado ||
                        "Pendente";


                    tr.innerHTML = `

                        <td>
                            ${escapar(id)}
                        </td>

                        <td>
                            ${escapar(cliente)}
                        </td>

                        <td>
                            ${escapar(numero)}
                        </td>

                        <td>
                            ${escapar(pacote)}
                        </td>

                        <td>
                            ${escapar(gb)} GB
                        </td>

                        <td>
                            ${escapar(valor)} MT
                        </td>

                        <td>

                            <span class="status">

                                ${escapar(estado)}

                            </span>

                        </td>

                        <td>

                            <button
                                type="button"
                                class="btn btn-outline"
                                data-editar-pedido="${escapar(id)}"
                            >

                                <i class="fas fa-edit"></i>

                                Editar

                            </button>


                            <button
                                type="button"
                                class="btn btn-outline"
                                data-remover-pedido="${escapar(id)}"
                            >

                                <i class="fas fa-trash"></i>

                                Remover

                            </button>

                        </td>

                    `;


                    tabela.appendChild(
                        tr
                    );

                }
            );


            // =================================================
            // BOTÃO EDITAR
            // =================================================

            tabela
                .querySelectorAll(
                    "[data-editar-pedido]"
                )
                .forEach(
                    function (botao) {

                        botao.addEventListener(
                            "click",
                            function (event) {

                                event.preventDefault();

                                event.stopPropagation();


                                const id =
                                    this.getAttribute(
                                        "data-editar-pedido"
                                    );


                                editarPedido(id);

                            }
                        );

                    }
                );


            // =================================================
            // BOTÃO REMOVER
            // =================================================

            tabela
                .querySelectorAll(
                    "[data-remover-pedido]"
                )
                .forEach(
                    function (botao) {

                        botao.addEventListener(
                            "click",
                            function (event) {

                                event.preventDefault();

                                event.stopPropagation();


                                const id =
                                    this.getAttribute(
                                        "data-remover-pedido"
                                    );


                                removerPedido(id);

                            }
                        );

                    }
                );


            console.log(
                "[MOZ TECH] Pedidos carregados:",
                pedidos.length
            );


            return pedidos;

        }
        catch (erro) {

            console.error(
                "[MOZ TECH] Erro ao carregar pedidos:",
                erro
            );


            const tabela =
                elemento(
                    "tabelaPedidos"
                );


            if (tabela) {

                tabela.innerHTML = `

                    <tr>

                        <td
                            colspan="8"
                            style="
                                text-align:center;
                                padding:25px;
                            "
                        >

                            Não foi possível carregar
                            os pedidos.

                        </td>

                    </tr>

                `;

            }


            return [];

        }

    }


    // =====================================================
    // ADICIONAR PEDIDO
    // POST /pedidos
    // =====================================================

    async function adicionarPedido(dados) {

        console.log(
            "[MOZ TECH] Adicionando pedido:",
            dados
        );


        try {

            const resposta =
                await fetch(
                    API + "/pedidos",
                    {

                        method: "POST",

                        headers: {

                            "Content-Type":
                                "application/json",

                            "Accept":
                                "application/json"

                        },

                        body:
                            JSON.stringify(
                                dados
                            )

                    }
                );


            const json =
                await resposta.json();


            console.log(
                "[MOZ TECH] Resposta adicionar pedido:",
                json
            );


            if (!resposta.ok) {

                throw new Error(
                    json?.error ||
                    "Erro ao adicionar pedido."
                );

            }


            await carregarPedidos();


            return json;

        }
        catch (erro) {

            console.error(
                "[MOZ TECH] Erro ao adicionar pedido:",
                erro
            );


            alert(
                "Não foi possível adicionar o pedido."
            );


            return {

                success: false,

                error:
                    erro.message

            };

        }

    }


    // =====================================================
    // EDITAR PEDIDO
    // PUT /pedidos/:id
    // =====================================================

    async function editarPedido(id) {

        const estado =
            prompt(
                "Novo estado do pedido:"
            );


        if (
            estado === null
        ) {

            return;

        }


        const estadoFinal =
            estado.trim();


        if (!estadoFinal) {

            alert(
                "O estado não pode ficar vazio."
            );

            return;

        }


        console.log(
            "[MOZ TECH] Editando pedido:",
            id
        );


        try {

            const resposta =
                await fetch(
                    API +
                    "/pedidos/" +
                    encodeURIComponent(
                        id
                    ),
                    {

                        method: "PUT",

                        headers: {

                            "Content-Type":
                                "application/json",

                            "Accept":
                                "application/json"

                        },

                        body:
                            JSON.stringify({

                                estado:
                                    estadoFinal

                            })

                    }
                );


            const json =
                await resposta.json();


            console.log(
                "[MOZ TECH] Resposta editar:",
                json
            );


            if (!resposta.ok) {

                throw new Error(
                    json?.error ||
                    "Erro ao editar pedido."
                );

            }


            await carregarPedidos();


            alert(
                "Pedido atualizado com sucesso!"
            );

        }
        catch (erro) {

            console.error(
                "[MOZ TECH] Erro ao editar pedido:",
                erro
            );


            alert(
                "Não foi possível editar o pedido."
            );

        }

    }


    // =====================================================
    // REMOVER PEDIDO
    // DELETE /pedidos/:id
    // =====================================================

    async function removerPedido(id) {

        const confirmar =
            confirm(
                "Deseja remover este pedido?"
            );


        if (!confirmar) {

            return;

        }


        console.log(
            "[MOZ TECH] Removendo pedido:",
            id
        );


        try {

            const resposta =
                await fetch(
                    API +
                    "/pedidos/" +
                    encodeURIComponent(
                        id
                    ),
                    {

                        method: "DELETE",

                        headers: {

                            "Accept":
                                "application/json"

                        }

                    }
                );


            const json =
                await resposta.json();


            console.log(
                "[MOZ TECH] Resposta remover:",
                json
            );


            if (!resposta.ok) {

                throw new Error(
                    json?.error ||
                    "Erro ao remover pedido."
                );

            }


            await carregarPedidos();


            alert(
                "Pedido removido com sucesso!"
            );

        }
        catch (erro) {

            console.error(
                "[MOZ TECH] Erro ao remover pedido:",
                erro
            );


            alert(
                "Não foi possível remover o pedido."
            );

        }

    }


    // =====================================================
    // DISPONIBILIZAR FUNÇÕES GLOBALMENTE
    // =====================================================

    window.carregarPedidos =
        carregarPedidos;


    window.adicionarPedido =
        adicionarPedido;


    window.editarPedido =
        editarPedido;


    window.removerPedido =
        removerPedido;


    // =====================================================
    // INICIALIZAÇÃO
    // =====================================================

    function iniciarPedidos() {

        console.log(
            "[MOZ TECH] pedidos.js iniciado."
        );


        carregarPedidos();

    }


    // =====================================================
    // DOM READY
    // =====================================================

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            iniciarPedidos,
            {
                once: true
            }
        );

    }
    else {

        iniciarPedidos();

    }


    // =====================================================
    // ATUALIZAÇÃO AUTOMÁTICA
    // =====================================================

    setInterval(
        function () {

            carregarPedidos();

        },
        5000
    );


})();
