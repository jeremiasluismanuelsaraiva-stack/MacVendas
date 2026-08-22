const API = window.location.origin;


// ==========================================
// CARREGAR CLIENTES
// ==========================================

async function carregarClientes() {

    try {

        const resposta =
            await fetch(API + "/clientes");

        if (!resposta.ok) {
            throw new Error(
                `Erro HTTP: ${resposta.status}`
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
                "tabelaClientes"
            );

        if (!tabela) return;

        tabela.innerHTML = "";


        if (
            !json.clientes ||
            json.clientes.length === 0
        ) {

            tabela.innerHTML = `
                <tr>
                    <td colspan="7"
                        style="text-align:center;padding:20px;">
                        Nenhum cliente encontrado.
                    </td>
                </tr>
            `;

            return;

        }


        json.clientes.forEach(cliente => {

            const tr =
                document.createElement("tr");


            tr.innerHTML = `

                <td>
                    ${cliente.id ?? "-"}
                </td>

                <td>
                    ${cliente.nome || "-"}
                </td>

                <td>
                    ${cliente.numero || "-"}
                </td>

                <td>
                    ${cliente.email || "-"}
                </td>

                <td>
                    ${cliente.grupo || "-"}
                </td>

                <td>
                    ${cliente.saldo || 0} GB
                </td>

                <td>

                    <button
                        class="btn btn-outline"
                        data-editar="${cliente.id}"
                    >
                        <i class="fas fa-edit"></i>
                        Editar
                    </button>

                    <button
                        class="btn btn-danger"
                        data-remover="${cliente.id}"
                    >
                        <i class="fas fa-trash"></i>
                        Remover
                    </button>

                </td>

            `;


            tabela.appendChild(tr);

        });


        // ==========================================
        // BOTÃO EDITAR
        // ==========================================

        tabela
            .querySelectorAll("[data-editar]")
            .forEach(botao => {

                botao.addEventListener(
                    "click",
                    function () {

                        const id =
                            this.getAttribute(
                                "data-editar"
                            );

                        editarCliente(id);

                    }
                );

            });


        // ==========================================
        // BOTÃO REMOVER
        // ==========================================

        tabela
            .querySelectorAll("[data-remover]")
            .forEach(botao => {

                botao.addEventListener(
                    "click",
                    function () {

                        const id =
                            this.getAttribute(
                                "data-remover"
                            );

                        removerCliente(id);

                    }
                );

            });

    }

    catch (err) {

        console.error(
            "Erro ao carregar clientes:",
            err
        );

    }

}


// ==========================================
// ADICIONAR CLIENTE
// ==========================================

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

    catch (err) {

        console.error(
            "Erro ao adicionar cliente:",
            err
        );

        return {
            success: false,
            error: err.message
        };

    }

}


// ==========================================
// EDITAR CLIENTE
// ==========================================

async function editarCliente(id) {

    const nome =
        prompt(
            "Digite o novo nome do cliente:"
        );


    if (nome === null) return;


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
                API + "/clientes/" + encodeURIComponent(id),
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

    catch (err) {

        console.error(
            "Erro ao editar cliente:",
            err
        );


        alert(
            "Não foi possível editar o cliente."
        );

    }

}


// ==========================================
// REMOVER CLIENTE
// ==========================================

async function removerCliente(id) {

    const confirmar =
        confirm(
            "Tem certeza que deseja remover este cliente?"
        );


    if (!confirmar) return;


    try {

        const resposta =
            await fetch(
                API + "/clientes/" + encodeURIComponent(id),
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

    catch (err) {

        console.error(
            "Erro ao remover cliente:",
            err
        );


        alert(
            "Não foi possível remover o cliente."
        );

    }

}


// ==========================================
// DISPONIBILIZAR FUNÇÕES GLOBALMENTE
// ==========================================

window.carregarClientes =
    carregarClientes;

window.adicionarCliente =
    adicionarCliente;

window.editarCliente =
    editarCliente;

window.removerCliente =
    removerCliente;


// ==========================================
// INICIALIZAÇÃO
// ==========================================

carregarClientes();


// Atualizar a cada 10 segundos
setInterval(
    carregarClientes,
    10000
);
