const API = window.location.origin;


// =====================================
// CARREGAR PEDIDOS
// =====================================

async function carregarPedidos() {

    try {

        const resposta =
            await fetch(API + "/pedidos");

        if (!resposta.ok) {

            throw new Error(
                "Erro HTTP: " + resposta.status
            );

        }

        const json =
            await resposta.json();


        if (!json.success) {

            console.error(
                "Erro da API:",
                json
            );

            return;

        }


        const tabela =
            document.getElementById(
                "tabelaPedidos"
            );


        if (!tabela) return;


        tabela.innerHTML = "";


        const pedidos =
            json.pedidos || [];


        // =====================================
        // NENHUM PEDIDO
        // =====================================

        if (pedidos.length === 0) {

            tabela.innerHTML = `
                <tr>

                    <td
                        colspan="8"
                        style="text-align:center;padding:25px;"
                    >
                        Nenhum pedido encontrado.

                    </td>

                </tr>
            `;

            return;

        }


        // =====================================
        // MOSTRAR PEDIDOS
        // =====================================

        pedidos.forEach(pedido => {

            const tr =
                document.createElement("tr");


            tr.innerHTML = `

                <td>
                    ${pedido.id || "-"}
                </td>

                <td>
                    ${pedido.cliente || "-"}
                </td>

                <td>
                    ${pedido.numero || "-"}
                </td>

                <td>
                    ${pedido.pacote || "-"}
                </td>

                <td>
                    ${pedido.gb || 0} GB
                </td>

                <td>
                    ${pedido.valor || 0} MT
                </td>

                <td>
                    ${pedido.estado || "Pendente"}
                </td>

                <td>

                    <button
                        class="btn btn-outline"
                        data-editar-pedido="${pedido.id}"
                    >
                        <i class="fas fa-edit"></i>
                        Editar
                    </button>


                    <button
                        class="btn btn-outline"
                        data-remover-pedido="${pedido.id}"
                    >
                        <i class="fas fa-trash"></i>
                        Remover
                    </button>

                </td>

            `;


            tabela.appendChild(tr);

        });


        // =====================================
        // BOTÃO EDITAR
        // =====================================

        tabela
            .querySelectorAll(
                "[data-editar-pedido]"
            )
            .forEach(botao => {

                botao.addEventListener(
                    "click",
                    function () {

                        const id =
                            this.getAttribute(
                                "data-editar-pedido"
                            );

                        editarPedido(id);

                    }
                );

            });


        // =====================================
        // BOTÃO REMOVER
        // =====================================

        tabela
            .querySelectorAll(
                "[data-remover-pedido]"
            )
            .forEach(botao => {

                botao.addEventListener(
                    "click",
                    function () {

                        const id =
                            this.getAttribute(
                                "data-remover-pedido"
                            );

                        removerPedido(id);

                    }
                );

            });

    }

    catch (erro) {

        console.error(
            "Erro ao carregar pedidos:",
            erro
        );

    }

}


// =====================================
// ADICIONAR PEDIDO
// =====================================

async function adicionarPedido(dados) {

    try {

        const resposta =
            await fetch(
                API + "/pedidos",
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
                "Erro ao adicionar pedido."
            );

        }


        await carregarPedidos();


        return json;

    }

    catch (erro) {

        console.error(
            "Erro ao adicionar pedido:",
            erro
        );


        alert(
            "Não foi possível adicionar o pedido."
        );


        return {
            success: false,
            error: erro.message
        };

    }

}


// =====================================
// EDITAR PEDIDO
// =====================================

async function editarPedido(id) {

    const estado =
        prompt(
            "Novo estado do pedido:"
        );


    if (estado === null) {
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


    try {

        const resposta =
            await fetch(
                API +
                "/pedidos/" +
                encodeURIComponent(id),
                {

                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({
                            estado: estadoFinal
                        })

                }
            );


        const json =
            await resposta.json();


        if (!resposta.ok) {

            throw new Error(
                json.error ||
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
            "Erro ao editar pedido:",
            erro
        );


        alert(
            "Não foi possível editar o pedido."
        );

    }

}


// =====================================
// REMOVER PEDIDO
// =====================================

async function removerPedido(id) {

    if (
        !confirm(
            "Deseja remover este pedido?"
        )
    ) {

        return;

    }


    try {

        const resposta =
            await fetch(
                API +
                "/pedidos/" +
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
            "Erro ao remover pedido:",
            erro
        );


        alert(
            "Não foi possível remover o pedido."
        );

    }

}


// =====================================
// DISPONIBILIZAR FUNÇÕES
// =====================================

window.carregarPedidos =
    carregarPedidos;

window.adicionarPedido =
    adicionarPedido;

window.editarPedido =
    editarPedido;

window.removerPedido =
    removerPedido;


// =====================================
// INICIALIZAÇÃO
// =====================================

carregarPedidos();


// Atualizar a cada 5 segundos
setInterval(
    carregarPedidos,
    5000
);
