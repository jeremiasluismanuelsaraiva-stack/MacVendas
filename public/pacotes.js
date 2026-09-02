const API = window.location.origin;


// ======================================
// CARREGAR PACOTES
// ======================================

async function carregarPacotes() {

    try {

        const resposta =
            await fetch(API + "/pacotes");

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
                "tabelaPacotes"
            );


        if (!tabela) return;


        tabela.innerHTML = "";


        const pacotes =
            json.pacotes || [];


        if (pacotes.length === 0) {

            tabela.innerHTML = `
                <tr>
                    <td
                        colspan="7"
                        style="text-align:center;padding:25px;"
                    >
                        Nenhum pacote cadastrado.
                    </td>
                </tr>
            `;

            return;

        }


        pacotes.forEach(pacote => {

            const tr =
                document.createElement("tr");


            tr.innerHTML = `

                <td>
                    ${pacote.nome || "-"}
                </td>

                <td>
                    ${pacote.tipo || "-"}
                </td>

                <td>
                    ${pacote.gb || 0} GB
                </td>

                <td>
                    ${pacote.valor || 0} MT
                </td>

                <td>
                    ${pacote.vantagem || "-"}
                </td>

                <td>
                    ${
                        pacote.ativo
                            ? "Ativo"
                            : "Desativado"
                    }
                </td>

                <td>

                    <button
                        class="btn btn-outline"
                        data-editar-pacote="${pacote.id}"
                    >
                        <i class="fas fa-edit"></i>
                        Editar
                    </button>

                    <button
                        class="btn btn-outline"
                        data-remover-pacote="${pacote.id}"
                    >
                        <i class="fas fa-trash"></i>
                        Remover
                    </button>

                </td>

            `;


            tabela.appendChild(tr);

        });


        // ======================================
        // BOTÃO EDITAR
        // ======================================

        tabela
            .querySelectorAll(
                "[data-editar-pacote]"
            )
            .forEach(botao => {

                botao.addEventListener(
                    "click",
                    () => {

                        const id =
                            botao.getAttribute(
                                "data-editar-pacote"
                            );

                        editarPacote(id);

                    }
                );

            });


        // ======================================
        // BOTÃO REMOVER
        // ======================================

        tabela
            .querySelectorAll(
                "[data-remover-pacote]"
            )
            .forEach(botao => {

                botao.addEventListener(
                    "click",
                    () => {

                        const id =
                            botao.getAttribute(
                                "data-remover-pacote"
                            );

                        removerPacote(id);

                    }
                );

            });


    }

    catch (erro) {

        console.error(
            "Erro ao carregar pacotes:",
            erro
        );

    }

}


// ======================================
// ADICIONAR PACOTE
// ======================================

async function adicionarPacote(dados) {

    try {

        const resposta =
            await fetch(
                API + "/pacotes",
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
                "Erro ao adicionar pacote."
            );

        }


        await carregarPacotes();


        return json;

    }

    catch (erro) {

        console.error(
            "Erro ao adicionar pacote:",
            erro
        );


        alert(
            "Não foi possível adicionar o pacote."
        );


        return {
            success: false,
            error: erro.message
        };

    }

}


// ======================================
// EDITAR PACOTE
// ======================================

async function editarPacote(id) {

    const nome =
        prompt(
            "Nome do pacote:"
        );


    if (nome === null) {
        return;
    }


    const nomeFinal =
        nome.trim();


    if (!nomeFinal) {

        alert(
            "O nome do pacote não pode ficar vazio."
        );

        return;

    }


    try {

        const resposta =
            await fetch(
                API +
                "/pacotes/" +
                encodeURIComponent(id),
                {

                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({
                            nome: nomeFinal
                        })

                }
            );


        const json =
            await resposta.json();


        if (!resposta.ok) {

            throw new Error(
                json.error ||
                "Erro ao editar pacote."
            );

        }


        await carregarPacotes();


        alert(
            "Pacote atualizado com sucesso!"
        );

    }

    catch (erro) {

        console.error(
            "Erro ao editar pacote:",
            erro
        );


        alert(
            "Não foi possível editar o pacote."
        );

    }

}


// ======================================
// REMOVER PACOTE
// ======================================

async function removerPacote(id) {

    const confirmar =
        confirm(
            "Deseja remover este pacote?"
        );


    if (!confirmar) {
        return;
    }


    try {

        const resposta =
            await fetch(
                API +
                "/pacotes/" +
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
                "Erro ao remover pacote."
            );

        }


        await carregarPacotes();


        alert(
            "Pacote removido com sucesso!"
        );

    }

    catch (erro) {

        console.error(
            "Erro ao remover pacote:",
            erro
        );


        alert(
            "Não foi possível remover o pacote."
        );

    }

}


// ======================================
// DISPONIBILIZAR FUNÇÕES
// ======================================

window.carregarPacotes =
    carregarPacotes;

window.adicionarPacote =
    adicionarPacote;

window.editarPacote =
    editarPacote;

window.removerPacote =
    removerPacote;


// ======================================
// INICIALIZAÇÃO
// ======================================

carregarPacotes();


// Atualização automática
setInterval(
    carregarPacotes,
    10000
);
