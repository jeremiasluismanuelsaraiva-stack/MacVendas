const API = window.location.origin;

// ==========================================
// CRM - CARREGAR CLIENTES
// ==========================================

async function carregarCRM() {

    try {

        const resposta = await fetch(API + "/clientes");

        if (!resposta.ok) {
            throw new Error("Erro HTTP: " + resposta.status);
        }

        const json = await resposta.json();

        if (!json.success) {
            console.error("Erro da API:", json);
            return;
        }

        const clientes = json.clientes || [];

        const tabela = document.getElementById("tabelaClientes");

        if (!tabela) return;

        tabela.innerHTML = "";

        // ==========================================
        // ESTATÍSTICAS
        // ==========================================

        const total = clientes.length;

        const elementoTotal =
            document.getElementById("totalClientesCRM");

        if (elementoTotal) {
            elementoTotal.textContent = total;
        }


        // ==========================================
        // NENHUM CLIENTE
        // ==========================================

        if (clientes.length === 0) {

            tabela.innerHTML = `
                <tr>
                    <td colspan="7"
                        style="text-align:center;padding:30px;">
                        <i class="fas fa-users"
                           style="font-size:30px;"></i>

                        <br><br>

                        Nenhum cliente encontrado.
                    </td>
                </tr>
            `;

            return;
        }


        // ==========================================
        // MOSTRAR CLIENTES
        // ==========================================

        clientes.forEach(cliente => {

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
                        data-editar-cliente="${cliente.id}">
                        <i class="fas fa-edit"></i>
                        Editar
                    </button>

                    <button
                        class="btn btn-outline"
                        data-remover-cliente="${cliente.id}">
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
            .querySelectorAll("[data-editar-cliente]")
            .forEach(botao => {

                botao.addEventListener("click", () => {

                    const id =
                        botao.getAttribute(
                            "data-editar-cliente"
                        );

                    editarClienteCRM(id);

                });

            });


        // ==========================================
        // BOTÃO REMOVER
        // ==========================================

        tabela
            .querySelectorAll("[data-remover-cliente]")
            .forEach(botao => {

                botao.addEventListener("click", () => {

                    const id =
                        botao.getAttribute(
                            "data-remover-cliente"
                        );

                    removerClienteCRM(id);

                });

            });


    } catch (erro) {

        console.error(
            "Erro ao carregar CRM:",
            erro
        );

    }

}


// ==========================================
// EDITAR CLIENTE
// ==========================================

async function editarClienteCRM(id) {

    const nome =
        prompt("Digite o novo nome do cliente:");

    if (nome === null) {
        return;
    }

    const nomeFinal =
        nome.trim();

    if (!nomeFinal) {

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

                    body: JSON.stringify({
                        nome: nomeFinal
                    })
                }
            );


        const json =
            await resposta.json();


        if (!resposta.ok) {

            throw new Error(
                json.error ||
                "Não foi possível atualizar."
            );

        }


        alert(
            "Cliente atualizado com sucesso!"
        );


        carregarCRM();


    } catch (erro) {

        console.error(
            "Erro ao editar cliente:",
            erro
        );

        alert(
            "Erro ao editar o cliente."
        );

    }

}


// ==========================================
// REMOVER CLIENTE
// ==========================================

async function removerClienteCRM(id) {

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
                "Não foi possível remover."
            );

        }


        alert(
            "Cliente removido com sucesso!"
        );


        carregarCRM();


    } catch (erro) {

        console.error(
            "Erro ao remover cliente:",
            erro
        );

        alert(
            "Erro ao remover o cliente."
        );

    }

}


// ==========================================
// PESQUISA DO CRM
// ==========================================

function pesquisarCRM() {

    const input =
        document.getElementById(
            "pesquisaCliente"
        );

    const tabela =
        document.getElementById(
            "tabelaClientes"
        );

    if (!input || !tabela) {
        return;
    }


    const termo =
        input.value
            .toLowerCase()
            .trim();


    tabela
        .querySelectorAll("tr")
        .forEach(linha => {

            const texto =
                linha.textContent
                    .toLowerCase();

            linha.style.display =
                texto.includes(termo)
                    ? ""
                    : "none";

        });

}


// ==========================================
// DISPONIBILIZAR GLOBALMENTE
// ==========================================

window.carregarCRM =
    carregarCRM;

window.editarClienteCRM =
    editarClienteCRM;

window.removerClienteCRM =
    removerClienteCRM;

window.pesquisarCRM =
    pesquisarCRM;


// ==========================================
// PESQUISA AUTOMÁTICA
// ==========================================

const campoPesquisa =
    document.getElementById(
        "pesquisaCliente"
    );

if (campoPesquisa) {

    campoPesquisa.addEventListener(
        "input",
        pesquisarCRM
    );

}


// ==========================================
// INICIALIZAÇÃO
// ==========================================

carregarCRM();


// Atualizar CRM a cada 10 segundos

setInterval(
    carregarCRM,
    10000
);
