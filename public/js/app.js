// =====================================================
// MOZ TECH - APP.JS
// SISTEMA DE PAINÉIS + MENU MOBILE
// =====================================================

(function () {

    "use strict";


    // =================================================
    // PAINÉIS
    // =================================================

    const paineis = {

        dashboard: "panelDashboard",
        crm: "panelCRM",
        pacotes: "panelPacotes",
        pedidos: "panelPedidos",
        dispositivos: "panelDispositivos",
        tutorial: "panelTutorial",
        config: "panelConfig"

    };


    // =================================================
    // ABRIR PAINEL
    // =================================================

    window.showPanel = function (panelId) {

        console.log(
            "[MOZ TECH] Abrindo painel:",
            panelId
        );


        const painelDestino =
            paineis[panelId];


        if (!painelDestino) {

            console.error(
                "[MOZ TECH] Painel inválido:",
                panelId
            );

            return;

        }


        // ---------------------------------------------
        // ESCONDER TODOS
        // ---------------------------------------------

        Object.values(paineis).forEach(function (id) {

            const elemento =
                document.getElementById(id);


            if (elemento) {

                elemento.style.display = "none";

                elemento.classList.remove("active");

            }

        });


        // ---------------------------------------------
        // MOSTRAR PAINEL
        // ---------------------------------------------

        const painel =
            document.getElementById(
                painelDestino
            );


        if (!painel) {

            console.error(
                "[MOZ TECH] Elemento não encontrado:",
                painelDestino
            );

            return;

        }


        painel.style.display = "block";

        painel.classList.add("active");


        // ---------------------------------------------
        // MENU ATIVO
        // ---------------------------------------------

        document
            .querySelectorAll(
                ".menu-item[data-panel]"
            )
            .forEach(function (item) {

                item.classList.remove("active");

            });


        const botao =
            document.querySelector(
                '.menu-item[data-panel="' +
                panelId +
                '"]'
            );


        if (botao) {

            botao.classList.add("active");

        }


        // ---------------------------------------------
        // CARREGAR DADOS
        // ---------------------------------------------

        try {


            if (
                panelId === "dashboard"
            ) {

                if (
                    typeof window.carregarDashboard ===
                    "function"
                ) {

                    window.carregarDashboard();

                }


                if (
                    typeof window.carregarTabela ===
                    "function"
                ) {

                    window.carregarTabela();

                }


                if (
                    typeof window.carregarGraficos ===
                    "function"
                ) {

                    window.carregarGraficos();

                }

            }


            if (
                panelId === "crm"
            ) {

                if (
                    typeof window.carregarClientes ===
                    "function"
                ) {

                    window.carregarClientes();

                }

            }


            if (
                panelId === "pacotes"
            ) {

                if (
                    typeof window.carregarPacotes ===
                    "function"
                ) {

                    window.carregarPacotes();

                }

            }


            if (
                panelId === "pedidos"
            ) {

                if (
                    typeof window.carregarPedidos ===
                    "function"
                ) {

                    window.carregarPedidos();

                }

            }


            if (
                panelId === "dispositivos"
            ) {

                if (
                    typeof window.carregarDispositivos ===
                    "function"
                ) {

                    window.carregarDispositivos();

                }

            }


            if (
                panelId === "tutorial"
            ) {

                if (
                    typeof window.carregarCredenciaisAPI ===
                    "function"
                ) {

                    window.carregarCredenciaisAPI();

                }

            }


            if (
                panelId === "config"
            ) {

                if (
                    typeof window.carregarConfiguracoes ===
                    "function"
                ) {

                    window.carregarConfiguracoes();

                }

            }


        }
        catch (erro) {

            console.error(
                "[MOZ TECH] Erro ao carregar painel:",
                erro
            );

        }


        // ---------------------------------------------
        // FECHAR SIDEBAR NO MOBILE
        // ---------------------------------------------

        if (
            window.innerWidth <= 768
        ) {

            fecharMenuMobile();

        }

    };


    // =================================================
    // MENU MOBILE
    // =================================================

    function abrirMenuMobile() {

        const sidebar =
            document.getElementById(
                "sidebar"
            );


        const overlay =
            document.getElementById(
                "menuOverlay"
            );


        if (sidebar) {

            sidebar.classList.add("open");

        }


        if (overlay) {

            overlay.classList.add("active");

        }

    }


    function fecharMenuMobile() {

        const sidebar =
            document.getElementById(
                "sidebar"
            );


        const overlay =
            document.getElementById(
                "menuOverlay"
            );


        if (sidebar) {

            sidebar.classList.remove("open");

        }


        if (overlay) {

            overlay.classList.remove("active");

        }

    }


    // =================================================
    // INICIALIZAR MENU
    // =================================================

    function inicializarMenu() {

        // ---------------------------------------------
        // BOTÕES DOS PAINÉIS
        // ---------------------------------------------

        const botoes =
            document.querySelectorAll(
                ".menu-item[data-panel]"
            );


        botoes.forEach(function (item) {

            item.addEventListener(
                "click",
                function (e) {

                    e.preventDefault();

                    e.stopPropagation();


                    const panel =
                        this.getAttribute(
                            "data-panel"
                        );


                    if (!panel) {

                        return;

                    }


                    window.showPanel(
                        panel
                    );

                }
            );

        });


        console.log(
            "[MOZ TECH] Menus encontrados:",
            botoes.length
        );


        // ---------------------------------------------
        // BOTÃO 3 BARRAS
        // ---------------------------------------------

        const menuToggle =
            document.getElementById(
                "menuToggle"
            );


        if (menuToggle) {

            menuToggle.addEventListener(
                "click",
                function (e) {

                    e.preventDefault();

                    e.stopPropagation();


                    const sidebar =
                        document.getElementById(
                            "sidebar"
                        );


                    if (
                        sidebar &&
                        sidebar.classList.contains("open")
                    ) {

                        fecharMenuMobile();

                    }
                    else {

                        abrirMenuMobile();

                    }

                }
            );

        }


        // ---------------------------------------------
        // OVERLAY
        // ---------------------------------------------

        const overlay =
            document.getElementById(
                "menuOverlay"
            );


        if (overlay) {

            overlay.addEventListener(
                "click",
                function () {

                    fecharMenuMobile();

                }
            );

        }

    }


    // =================================================
    // BOTÃO ATUALIZAR
    // =================================================

    function inicializarAtualizar() {

        const botoes = [

            "refreshBtn",
            "btnAtualizar",
            "atualizarBtn",
            "refreshButton"

        ];


        botoes.forEach(function (id) {

            const botao =
                document.getElementById(id);


            if (!botao) {

                return;

            }


            botao.addEventListener(
                "click",
                async function (e) {

                    e.preventDefault();

                    e.stopPropagation();


                    console.log(
                        "[MOZ TECH] Atualizando..."
                    );


                    const textoOriginal =
                        botao.innerHTML;


                    botao.disabled = true;


                    try {

                        if (
                            typeof window.carregarDashboard ===
                            "function"
                        ) {

                            await window.carregarDashboard();

                        }


                        if (
                            typeof window.carregarTabela ===
                            "function"
                        ) {

                            await window.carregarTabela();

                        }


                        if (
                            typeof window.carregarGraficos ===
                            "function"
                        ) {

                            await window.carregarGraficos();

                        }


                        botao.innerHTML =
                            "✓ Atualizado";


                        setTimeout(
                            function () {

                                botao.innerHTML =
                                    textoOriginal;

                            },
                            1500
                        );


                    }
                    catch (erro) {

                        console.error(
                            "[MOZ TECH] Erro ao atualizar:",
                            erro
                        );


                        botao.innerHTML =
                            "Erro";


                        setTimeout(
                            function () {

                                botao.innerHTML =
                                    textoOriginal;

                            },
                            1500
                        );

                    }
                    finally {

                        botao.disabled = false;

                    }

                }
            );

        });

    }


    // =================================================
    // INICIALIZAÇÃO
    // =================================================

    document.addEventListener(
        "DOMContentLoaded",
        function () {

            console.log(
                "[MOZ TECH] App iniciado."
            );


            inicializarMenu();

            inicializarAtualizar();


            // -----------------------------------------
            // DASHBOARD INICIAL
            // -----------------------------------------

            if (
                document.getElementById(
                    "panelDashboard"
                )
            ) {

                window.showPanel(
                    "dashboard"
                );

            }

        }
    );


})();
