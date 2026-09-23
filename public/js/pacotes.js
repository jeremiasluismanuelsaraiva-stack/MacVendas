"use strict";

// ======================================
// PACOTES.JS
// MACVENDAS
// API PRÓPRIA
// ======================================


// ======================================
// GARANTIR API
// ======================================

async function garantirAPI() {

    if (
        typeof window.garantirCredenciaisAPI ===
        "function"
    ) {

        await window.garantirCredenciaisAPI();

    }


    if (!window.MOZ_API) {

        throw new Error(
            "MOZ_API não está disponível."
        );

    }

}


// ======================================
// CARREGAR PACOTES
// GET /pacotes
// ======================================

async function carregarPacotes() {

    try {

        await garantirAPI();


        const json =
            await window.MOZ_API.get(
                "/pacotes"
            );


        if (
            !json ||
            json.success === false
        ) {

            console.error(
                "Erro da API:",
                json
            );

            return [];

        }


        const tabela =
            document.getElementById(
                "tabelaPacotes"
            );


        if (!tabela) {

            return [];

        }


        tabela.innerHTML = "";


        const pacotes =
            Array.isArray(
                json.pacotes
            )
                ? json.pacotes
                : [];


        if (
            pacotes.length ===
            0
        ) {

            tabela.innerHTML = `

                <tr>

                    <td
                        colspan="7"
                        style="
                            text-align:center;
                            padding:25px;
                        "
                    >

                        Nenhum pacote cadastrado.

                    </td>

                </tr>

            `;

            return [];

        }


        // ======================================
        // MOSTRAR PACOTES
        // ======================================

        pacotes.forEach(
            pacote => {

                const tr =
                    document.createElement(
                        "tr"
                    );


                const id =
                    pacote.id ?? "";


                const nome =
                    pacote.nome ?? "-";


                const tipo =
                    pacote.tipo ?? "-";


                const gb =
                    pacote.gb ??
                    pacote.quantidadeGB ??
                    0;


                const valor =
                    pacote.valor ??
                    pacote.preco ??
                    pacote.valorVenda ??
                    pacote.valor_venda ??
                    0;


                const vantagem =
                    pacote.vantagem ??
                    "-";


                const ativo =
                    pacote.ativo !== false;


                tr.innerHTML = `

                    <td>
                        ${escaparHTML(nome)}
                    </td>

                    <td>
                        ${escaparHTML(tipo)}
                    </td>

                    <td>
                        ${escaparHTML(gb)} GB
                    </td>

                    <td>
                        ${escaparHTML(valor)} MT
                    </td>

                    <td>
                        ${escaparHTML(vantagem)}
                    </td>

                    <td>
                        ${
                            ativo
                                ? "Ativo"
                                : "Desativado"
                        }
                    </td>

                    <td>

                        <button
                            type="button"
                            class="btn btn-outline"
                            data-editar-pacote="${escaparHTML(id)}"
                        >

                            <i class="fas fa-edit"></i>

                            Editar

                        </button>


                        <button
                            type="button"
                            class="btn btn-outline"
                            data-remover-pacote="${escaparHTML(id)}"
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


        // ======================================
        // BOTÃO EDITAR
        // ======================================

        tabela
            .querySelectorAll(
                "[data-editar-pacote]"
            )
            .forEach(
                botao => {

                    botao.addEventListener(
                        "click",
                        function (event) {

                            event.preventDefault();

                            event.stopPropagation();


                            const id =
                                this.getAttribute(
                                    "data-editar-pacote"
                                );


                            editarPacote(
                                id
                            );

                        }
                    );

                }
            );


        // ======================================
        // BOTÃO REMOVER
        // ======================================

        tabela
            .querySelectorAll(
                "[data-remover-pacote]"
            )
            .forEach(
                botao => {

                    botao.addEventListener(
                        "click",
                        function (event) {

                            event.preventDefault();

                            event.stopPropagation();


                            const id =
                                this.getAttribute(
                                    "data-remover-pacote"
                                );


                            removerPacote(
                                id
                            );

                        }
                    );

                }
            );


        console.log(
            "[MACVENDAS] Pacotes carregados:",
            pacotes.length
        );


        return pacotes;

    }

    catch (erro) {

        console.error(
            "Erro ao carregar pacotes:",
            erro
        );


        const tabela =
            document.getElementById(
                "tabelaPacotes"
            );


        if (tabela) {

            tabela.innerHTML = `

                <tr>

                    <td
                        colspan="7"
                        style="
                            text-align:center;
                            padding:25px;
                        "
                    >

                        Não foi possível carregar
                        os pacotes.

                    </td>

                </tr>

            `;

        }


        return [];

    }

}


// ======================================
// ADICIONAR PACOTE
// POST /pacotes
// ======================================

async function adicionarPacote(
    dados
) {

    try {

        await garantirAPI();


        console.log(
            "[MACVENDAS] Adicionando pacote:",
            dados
        );


        const json =
            await window.MOZ_API.post(
                "/pacotes",
                dados
            );


        if (
            !json ||
            json.success === false
        ) {

            throw new Error(
                json?.error ||
                json?.message ||
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
            erro.message ||
            "Não foi possível adicionar o pacote."
        );


        return {

            success: false,

            error:
                erro.message

        };

    }

}


// ======================================
// EDITAR PACOTE
// PUT /pacotes/:id
// ======================================

async function editarPacote(
    id
) {

    const nome =
        prompt(
            "Nome do pacote:"
        );


    if (
        nome === null
    ) {

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

        await garantirAPI();


        console.log(
            "[MACVENDAS] Editando pacote:",
            id
        );


        const json =
            await window.MOZ_API.put(
                "/pacotes/" +
                encodeURIComponent(id),
                {
                    nome:
                        nomeFinal
                }
            );


        if (
            !json ||
            json.success === false
        ) {

            throw new Error(
                json?.error ||
                json?.message ||
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
            erro.message ||
            "Não foi possível editar o pacote."
        );

    }

}


// ======================================
// REMOVER PACOTE
// DELETE /pacotes/:id
// ======================================

async function removerPacote(
    id
) {

    const confirmar =
        confirm(
            "Deseja remover este pacote?"
        );


    if (
        !confirmar
    ) {

        return;

    }


    try {

        await garantirAPI();


        console.log(
            "[MACVENDAS] Removendo pacote:",
            id
        );


        const json =
            await window.MOZ_API.delete(
                "/pacotes/" +
                encodeURIComponent(id)
            );


        if (
            !json ||
            json.success === false
        ) {

            throw new Error(
                json?.error ||
                json?.message ||
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
            erro.message ||
            "Não foi possível remover o pacote."
        );

    }

}


// ======================================
// ESCAPAR HTML
// ======================================

function escaparHTML(
    valor
) {

    return String(
        valor ?? ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

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

function iniciarPacotes() {

    console.log(
        "[MACVENDAS] pacotes.js iniciado."
    );


    if (
        typeof window.garantirCredenciaisAPI ===
        "function"
    ) {

        window.garantirCredenciaisAPI()
            .then(
                () =>
                    carregarPacotes()
            )
            .catch(
                erro => {

                    console.error(
                        "[MACVENDAS] Erro ao iniciar pacotes:",
                        erro
                    );

                }
            );

    }

    else {

        carregarPacotes();

    }

}


// ======================================
// DOM READY
// ======================================

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        iniciarPacotes,
        {
            once: true
        }
    );

}

else {

    iniciarPacotes();

}


// ======================================
// ATUALIZAÇÃO AUTOMÁTICA
// ======================================

setInterval(
    function () {

        carregarPacotes();

    },
    10000
);

