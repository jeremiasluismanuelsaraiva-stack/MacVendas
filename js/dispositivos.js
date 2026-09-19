// =====================================================
// MOZ TECH
// DISPOSITIVOS.JS
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
    // CARREGAR DISPOSITIVOS
    // GET /dispositivos
    // =====================================================

    async function carregarDispositivos() {

        console.log(
            "[MOZ TECH] Carregando dispositivos..."
        );


        try {

            const resposta =
                await fetch(
                    API + "/dispositivos",
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
                "[MOZ TECH] Dispositivos HTTP:",
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
                "[MOZ TECH] Resposta dispositivos:",
                json
            );


            // =================================================
            // VALIDAR RESPOSTA
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
                    "tabelaDispositivos"
                );


            if (!tabela) {

                console.warn(
                    "[MOZ TECH] #tabelaDispositivos não encontrado."
                );

                return [];

            }


            // =================================================
            // DISPOSITIVOS
            // =================================================

            const dispositivos =
                Array.isArray(
                    json.dispositivos
                )
                    ? json.dispositivos
                    : [];


            tabela.innerHTML = "";


            // =================================================
            // NENHUM DISPOSITIVO
            // =================================================

            if (
                dispositivos.length === 0
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

                            Nenhum dispositivo encontrado.

                        </td>

                    </tr>

                `;

                return [];

            }


            // =================================================
            // MOSTRAR DISPOSITIVOS
            // =================================================

            dispositivos.forEach(
                function (dispositivo) {

                    const tr =
                        document.createElement(
                            "tr"
                        );


                    const id =
                        dispositivo.id ?? "-";


                    const nome =
                        dispositivo.nome ?? "-";


                    const modelo =
                        dispositivo.modelo ?? "-";


                    const numero =
                        dispositivo.numero ?? "-";


                    const status =
                        dispositivo.status ||
                        "Offline";


                    const ultimaAtividade =
                        dispositivo.ultimaAtividade ??
                        "-";


                    tr.innerHTML = `

                        <td>
                            ${escapar(id)}
                        </td>

                        <td>
                            ${escapar(nome)}
                        </td>

                        <td>
                            ${escapar(modelo)}
                        </td>

                        <td>
                            ${escapar(numero)}
                        </td>

                        <td>

                            <span class="status">

                                ${escapar(status)}

                            </span>

                        </td>

                        <td>
                            ${escapar(
                                ultimaAtividade
                            )}
                        </td>

                        <td>

                            <button
                                type="button"
                                class="btn btn-outline"
                                data-editar-dispositivo="${escapar(id)}"
                            >

                                <i class="fas fa-edit"></i>

                                Editar

                            </button>


                            <button
                                type="button"
                                class="btn btn-outline"
                                data-remover-dispositivo="${escapar(id)}"
                            >

                                <i class="fas fa-trash"></i>

                                Remover

                            </button>

                        </td>

                    `;


                    tabela.appendChild(tr);

                }
            );


            // =================================================
            // BOTÃO EDITAR
            // =================================================

            tabela
                .querySelectorAll(
                    "[data-editar-dispositivo]"
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
                                        "data-editar-dispositivo"
                                    );


                                editarDispositivo(id);

                            }
                        );

                    }
                );


            // =================================================
            // BOTÃO REMOVER
            // =================================================

            tabela
                .querySelectorAll(
                    "[data-remover-dispositivo]"
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
                                        "data-remover-dispositivo"
                                    );


                                removerDispositivo(id);

                            }
                        );

                    }
                );


            console.log(
                "[MOZ TECH] Dispositivos carregados:",
                dispositivos.length
            );


            return dispositivos;

        }
        catch (erro) {

            console.error(
                "[MOZ TECH] Erro ao carregar dispositivos:",
                erro
            );


            const tabela =
                elemento(
                    "tabelaDispositivos"
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
                            os dispositivos.

                        </td>

                    </tr>

                `;

            }


            return [];

        }

    }


    // =====================================================
    // ADICIONAR DISPOSITIVO
    // POST /dispositivos
    // =====================================================

    async function adicionarDispositivo(dados) {

        console.log(
            "[MOZ TECH] Adicionando dispositivo:",
            dados
        );


        try {

            const resposta =
                await fetch(
                    API + "/dispositivos",
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
                "[MOZ TECH] Resposta adicionar dispositivo:",
                json
            );


            if (!resposta.ok) {

                throw new Error(
                    json?.error ||
                    "Erro ao adicionar dispositivo."
                );

            }


            await carregarDispositivos();


            return json;

        }
        catch (erro) {

            console.error(
                "[MOZ TECH] Erro ao adicionar dispositivo:",
                erro
            );


            alert(
                "Não foi possível adicionar o dispositivo."
            );


            return {

                success: false,

                error:
                    erro.message

            };

        }

    }


    // =====================================================
    // EDITAR DISPOSITIVO
    // PUT /dispositivos/:id
    // =====================================================

    async function editarDispositivo(id) {

        const nome =
            prompt(
                "Nome do dispositivo:"
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
                "O nome não pode ficar vazio."
            );

            return;

        }


        console.log(
            "[MOZ TECH] Editando dispositivo:",
            id
        );


        try {

            const resposta =
                await fetch(
                    API +
                    "/dispositivos/" +
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

                                nome:
                                    nomeFinal

                            })

                    }
                );


            const json =
                await resposta.json();


            console.log(
                "[MOZ TECH] Resposta editar dispositivo:",
                json
            );


            if (!resposta.ok) {

                throw new Error(
                    json?.error ||
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
                "[MOZ TECH] Erro ao editar dispositivo:",
                erro
            );


            alert(
                "Não foi possível editar o dispositivo."
            );

        }

    }


    // =====================================================
    // REMOVER DISPOSITIVO
    // DELETE /dispositivos/:id
    // =====================================================

    async function removerDispositivo(id) {

        const confirmar =
            confirm(
                "Deseja remover este dispositivo?"
            );


        if (!confirmar) {

            return;

        }


        console.log(
            "[MOZ TECH] Removendo dispositivo:",
            id
        );


        try {

            const resposta =
                await fetch(
                    API +
                    "/dispositivos/" +
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
                "[MOZ TECH] Resposta remover dispositivo:",
                json
            );


            if (!resposta.ok) {

                throw new Error(
                    json?.error ||
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
                "[MOZ TECH] Erro ao remover dispositivo:",
                erro
            );


            alert(
                "Não foi possível remover o dispositivo."
            );

        }

    }


    // =====================================================
    // DISPONIBILIZAR FUNÇÕES GLOBALMENTE
    // =====================================================

    window.carregarDispositivos =
        carregarDispositivos;


    window.adicionarDispositivo =
        adicionarDispositivo;


    window.editarDispositivo =
        editarDispositivo;


    window.removerDispositivo =
        removerDispositivo;


    // =====================================================
    // INICIALIZAÇÃO
    // =====================================================

    function iniciarDispositivos() {

        console.log(
            "[MOZ TECH] dispositivos.js iniciado."
        );


        carregarDispositivos();

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
            iniciarDispositivos,
            {
                once: true
            }
        );

    }
    else {

        iniciarDispositivos();

    }


    // =====================================================
    // ATUALIZAÇÃO AUTOMÁTICA
    // =====================================================

    setInterval(
        function () {

            carregarDispositivos();

        },
        5000
    );


})();
