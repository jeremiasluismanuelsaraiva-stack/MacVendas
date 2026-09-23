// =====================================================
// MOZ TECH
// DISPOSITIVOS.JS
// =====================================================

(function () {

    "use strict";


    // =====================================================
    // CONFIGURAÇÃO DA API
    // =====================================================

    const API = window.MOZ_API;

    async function garantirAPI() {
        if (typeof window.garantirCredenciaisAPI === "function") {
            await window.garantirCredenciaisAPI();
        }

        if (!window.MOZ_API) {
            throw new Error("MOZ_API não está disponível.");
        }
    }


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

            await garantirAPI();

            const json =
                await API.get("/dispositivos");


            console.log(
                "[MOZ TECH] Dispositivos HTTP:",
                resposta.status
            );


            
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

            await garantirAPI();

            const json =
                await API.post(
                    "/dispositivos",
                    dados
                );


            console.log(
                "[MOZ TECH] Resposta adicionar dispositivo:",
                json
            );


            if (!json || json.success === false) {

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

            await garantirAPI();

            const json =
                await API.put(
                    "/dispositivos/" +
                    encodeURIComponent(id),
                    {
                        nome: nomeFinal
                    }
                );


            console.log(
                "[MOZ TECH] Resposta editar dispositivo:",
                json
            );


            if (!json || json.success === false) {

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

            await garantirAPI();

            const json =
                await API.delete(
                    "/dispositivos/" +
                    encodeURIComponent(id)
                );


            console.log(
                "[MOZ TECH] Resposta remover dispositivo:",
                json
            );


            if (!json || json.success === false) {

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


        if (typeof window.garantirCredenciaisAPI === "function") {
            window.garantirCredenciaisAPI()
                .then(() => carregarDispositivos())
                .catch((erro) => {
                    console.error(
                        "[MOZ TECH] Não foi possível iniciar dispositivos:",
                        erro
                    );
                });
        } else {
            carregarDispositivos();
        }

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
