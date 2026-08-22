
const API = window.location.origin;

async function carregarClientes() {

    try {

        const resposta = await fetch(API + "/clientes");

        const json = await resposta.json();

        if (!json.success) return;

        const tabela = document.getElementById("tabelaClientes");

        if (!tabela) return;

        tabela.innerHTML = "";

        json.clientes.forEach(cliente => {

            tabela.innerHTML += `
                <tr>
                    <td>${cliente.id}</td>
                    <td>${cliente.nome || "-"}</td>
                    <td>${cliente.numero || "-"}</td>
                    <td>${cliente.email || "-"}</td>
                    <td>${cliente.grupo || "-"}</td>
                    <td>${cliente.saldo || 0} GB</td>
                    <td>
                        <button onclick="editarCliente('${cliente.id}')">
                            Editar
                        </button>

                        <button onclick="removerCliente('${cliente.id}')">
                            Remover
                        </button>
                    </td>
                </tr>
            `;

        });

    }

    catch (err) {

        console.error(err);

    }

}

async function adicionarCliente(dados) {

    try {

        await fetch(API + "/clientes", {

            method: "POST",

            headers: {

                "Content-Type": "application/json"

            },

            body: JSON.stringify(dados)

        });

        carregarClientes();

    }

    catch (err) {

        console.error(err);

    }

}

async function editarCliente(id) {

    const nome = prompt("Nome:");

    if (!nome) return;

    try {

        await fetch(API + "/clientes/" + id, {

            method: "PUT",

            headers: {

                "Content-Type": "application/json"

            },

            body: JSON.stringify({

                nome

            })

        });

        carregarClientes();

    }

    catch (err) {

        console.error(err);

    }

}

async function removerCliente(id) {

    if (!confirm("Remover este cliente?")) return;

    try {

        await fetch(API + "/clientes/" + id, {

            method: "DELETE"

        });

        carregarClientes();

    }

    catch (err) {

        console.error(err);

    }

}

carregarClientes();

setInterval(carregarClientes, 10000);
