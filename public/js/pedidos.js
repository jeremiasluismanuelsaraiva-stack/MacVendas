
const API = window.location.origin;

// =====================================
// CARREGAR PEDIDOS
// =====================================

async function carregarPedidos() {

    try {

        const resposta = await fetch(API + "/pedidos");

        const json = await resposta.json();

        if (!json.success) return;

        const tabela = document.getElementById("tabelaPedidos");

        if (!tabela) return;

        tabela.innerHTML = "";

        json.pedidos.forEach(pedido => {

            tabela.innerHTML += `
                <tr>

                    <td>${pedido.id}</td>

                    <td>${pedido.cliente || "-"}</td>

                    <td>${pedido.numero || "-"}</td>

                    <td>${pedido.pacote || "-"}</td>

                    <td>${pedido.gb || 0} GB</td>

                    <td>${pedido.valor || 0} MT</td>

                    <td>${pedido.estado || "Pendente"}</td>

                    <td>

                        <button onclick="editarPedido('${pedido.id}')">
                            Editar
                        </button>

                        <button onclick="removerPedido('${pedido.id}')">
                            Remover
                        </button>

                    </td>

                </tr>
            `;

        });

    }

    catch (erro) {

        console.error(erro);

    }

}

// =====================================
// ADICIONAR PEDIDO
// =====================================

async function adicionarPedido(dados) {

    try {

        await fetch(API + "/pedidos", {

            method: "POST",

            headers: {

                "Content-Type": "application/json"

            },

            body: JSON.stringify(dados)

        });

        carregarPedidos();

    }

    catch (erro) {

        console.error(erro);

    }

}

// =====================================
// EDITAR PEDIDO
// =====================================

async function editarPedido(id) {

    const estado = prompt("Novo estado do pedido:");

    if (!estado) return;

    try {

        await fetch(API + "/pedidos/" + id, {

            method: "PUT",

            headers: {

                "Content-Type": "application/json"

            },

            body: JSON.stringify({

                estado

            })

        });

        carregarPedidos();

    }

    catch (erro) {

        console.error(erro);

    }

}

// =====================================
// REMOVER PEDIDO
// =====================================

async function removerPedido(id) {

    if (!confirm("Deseja remover este pedido?")) return;

    try {

        await fetch(API + "/pedidos/" + id, {

            method: "DELETE"

        });

        carregarPedidos();

    }

    catch (erro) {

        console.error(erro);

    }

}

// =====================================

carregarPedidos();

setInterval(carregarPedidos, 5000);
