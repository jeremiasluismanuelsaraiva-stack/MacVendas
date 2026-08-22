const API = window.location.origin;


// =====================================
// CARREGAR DISPOSITIVOS
// =====================================

async function carregarDispositivos() {

    try {

        const resposta =
            await fetch(API + "/dispositivos");

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
                "tabelaDispositivos"
            );


        if (!tabela) return;


        tabela.innerHTML = "";


        const dispositivos =
            json.dispositivos || [];


        // =====================================
        // NENHUM DISPOSITIVO
        // =====================================

        if (dispositivos.length === 0) {

            tabela.innerHTML = `
                <tr>

                    <td
                        colspan="7"
                        style="text-align:center;padding:25px;"
                    >
                        Nenhum dispositivo encontrado.
                    </td>

                </tr>
            `;

            return;

        }


        // =====================================
        // MOSTRAR DISPOSITIVOS
        // =====================================

        dispositivos.forEach(dispositivo => {

            const tr =
                document.createElement("tr");


            tr.innerHTML = `

                <td>
                    ${dispositivo.id || "-"}
                </td>

                <td>
                    ${dispositivo.nome || "-"}
                </td>

                <td>
                    ${dispositivo.modelo || "-"}
                </td>

                <td>
                    ${dispositivo.numero || "-"}
                </td>

                <td>
                    ${dispositivo.status || "Offline"}
                </td>

                <td>
                    ${dispositivo.ultimaAtividade || "-"}
                </td>

                <td>

                    <button
                        class="btn btn-outline"
                        data-editar-dispositivo="${dispositivo.id}"
                    >
                        <i class="fas fa-edit"></i>
                        Editar
                    </button>

                    <button
                        class="btn btn-outline"
                        data-remover-dispositivo="${dispositivo.id}"
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
                "[data-editar-dispositivo]"
            )
            .forEach(botao => {

                botao.addEventListener(
                    "click",
                    function () {

                        const id =
                            this.getAttribute(
                                "data-editar-dispositivo"
                            );

                        editarDispositivo(id);

                    }
                );

            });


        // =====================================
        // BOTÃO REMOVER
        // =====================================

        tabela
            .querySelectorAll(
                "[data-remover-dispositivo]"
            )
            .forEach(botao => {

                botao.addEventListener(
                    "click",
                    function () {

                        const id =
                            this.getAttribute(
                                "data-remover-dispositivo"
                            );

                        removerDispositivo(id);

                    }
                );

            });

    }

    catch (erro) {

        console.error(
            "Erro ao carregar dispositivos:",
            erro
        );

    }

}


// =====================================
// ADICIONAR DISPOSITIVO
// =====================================

async function adicionarDispositivo(dados) {

    try {

        const resposta =
            await fetch(
                API + "/dispositivos",
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
                "Erro ao adicionar dispositivo."
            );

        }


        await carregarDispositivos();


        return json;

    }

    catch (erro) {

        console.error(
            "Erro ao adicionar dispositivo:",
            erro
        );


        alert(
            "Não foi possível adicionar o dispositivo."
        );


        return {
            success: false,
            error: erro.message
        };

    }

}


// =====================================
// EDITAR DISPOSITIVO
// =====================================

async function editarDispositivo(id) {

    const nome =
        prompt(
            "Nome do dispositivo:"
        );


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
                "/dispositivos/" +
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
                "Erro ao editar dispositivo."
            );

        }


        await carregarDispositivos();


        alert(
            "Dispositivo atualizado com sucesso!"
        );

    }

    catch (erro) {

        console.error(
            "Erro ao editar dispositivo:",
            erro
        );


        alert(
            "Não foi possível editar o dispositivo."
        );

    }

}


// =====================================
// REMOVER DISPOSITIVO
// =====================================

async function removerDispositivo(id) {

    if (
        !confirm(
            "Deseja remover este dispositivo?"
        )
    ) {

        return;

    }


    try {

        const resposta =
            await fetch(
                API +
                "/dispositivos/" +
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
                "Erro ao remover dispositivo."
            );

        }


        await carregarDispositivos();


        alert(
            "Dispositivo removido com sucesso!"
        );

    }

    catch (erro) {

        console.error(
            "Erro ao remover dispositivo:",
            erro
        );


        alert(
            "Não foi possível remover o dispositivo."
        );

    }

}


// =====================================
// DISPONIBILIZAR FUNÇÕES
// =====================================

window.carregarDispositivos =
    carregarDispositivos;

window.adicionarDispositivo =
    adicionarDispositivo;

window.editarDispositivo =
    editarDispositivo;

window.removerDispositivo =
    removerDispositivo;


// =====================================
// INICIALIZAÇÃO
// =====================================

carregarDispositivos();


// Atualizar a cada 5 segundos
setInterval(
    carregarDispositivos,
    5000
);
