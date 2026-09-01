// =====================================================
// MOZ TECH
// SISTEMA DE PAINÉIS + MENU MOBILE
// VERSÃO UNIFICADA
// =====================================================

(function () {

    "use strict";


    // =================================================
    // MAPA DOS PAINÉIS
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
    // ELEMENTOS
    // =================================================

    function getElementosMenu() {

        return {

            botao:
                document.getElementById("menuToggle"),

            sidebar:
                document.getElementById("sidebar"),

            overlay:
                document.getElementById("menuOverlay")

        };

    }


    // =================================================
    // ATUALIZAR ÍCONE
    // =================================================

    function atualizarIconeMenu(aberto) {

        const botao =
            document.getElementById("menuToggle");

        if (!botao) {
            return;
        }


        const icon =
            botao.querySelector("i");


        if (!icon) {
            return;
        }


        /*
         * O ícone permanece SEMPRE como 3 barras.
         *
         * Não colocamos fa-xmark.
         */

        icon.classList.remove("fa-xmark");

        icon.classList.add("fa-bars");

    }


    // =================================================
    // ABRIR MENU MOBILE
    // =================================================

    function abrirMenuMobile() {

        const {
            botao,
            sidebar,
            overlay
        } = getElementosMenu();


        if (!sidebar) {

            console.error(
                "[MOZ TECH] #sidebar não encontrado."
            );

            return;

        }


        console.log(
            "[MOZ TECH] Abrindo menu..."
        );


        sidebar.classList.add("open");


        if (overlay) {

            overlay.classList.add("active");

        }


        if (botao) {

            botao.setAttribute(
                "aria-expanded",
                "true"
            );

            botao.setAttribute(
                "aria-label",
                "Fechar menu"
            );

        }


        document.body.classList.add(
            "menu-open"
        );


        atualizarIconeMenu(true);

    }


    // =================================================
    // FECHAR MENU MOBILE
    // =================================================

    function fecharMenuMobile() {

        const {
            botao,
            sidebar,
            overlay
        } = getElementosMenu();


        if (!sidebar) {
            return;
        }


        console.log(
            "[MOZ TECH] Fechando menu..."
        );


        sidebar.classList.remove("open");


        if (overlay) {

            overlay.classList.remove("active");

        }


        if (botao) {

            botao.setAttribute(
                "aria-expanded",
                "false"
            );

            botao.setAttribute(
                "aria-label",
                "Abrir menu"
            );

        }


        document.body.classList.remove(
            "menu-open"
        );


        atualizarIconeMenu(false);

    }


    // =================================================
    // ALTERNAR MENU
    // =================================================

    function alternarMenuMobile() {

        const sidebar =
            document.getElementById(
                "sidebar"
            );


        if (!sidebar) {

            console.error(
                "[MOZ TECH] Sidebar não encontrada."
            );

            return;

        }


        if (
            sidebar.classList.contains("open")
        ) {

            fecharMenuMobile();

        }
        else {

            abrirMenuMobile();

        }

    }


    // =================================================
    // ABRIR PAINEL
    // =================================================

    window.showPanel = function (panelId) {

        console.log(
            "[MOZ TECH] Abrindo painel:",
            panelId
        );


        // =============================================
        // ESCONDER TODOS
        // =============================================

        Object.values(paineis)
            .forEach(function (id) {

                const painel =
                    document.getElementById(id);


                if (painel) {

                    painel.style.display =
                        "none";

                }

            });


        // =============================================
        // VERIFICAR PAINEL
        // =============================================

        const painelId =
            paineis[panelId];


        if (!painelId) {

            console.error(
                "[MOZ TECH] Painel não encontrado:",
                panelId
            );

            return;

        }


        // =============================================
        // ENCONTRAR PAINEL
        // =============================================

        const painel =
            document.getElementById(
                painelId
            );


        if (!painel) {

            console.error(
                "[MOZ TECH] Elemento não encontrado:",
                painelId
            );

            return;

        }


        // =============================================
        // MOSTRAR
        // =============================================

        painel.style.display =
            "block";


        // =============================================
        // MENU ATIVO
        // =============================================

        document
            .querySelectorAll(
                ".menu-item[data-panel]"
            )
            .forEach(function (item) {

                item.classList.remove(
                    "active"
                );

            });


        const botaoMenu =
            document.querySelector(
                '.menu-item[data-panel="' +
                panelId +
                '"]'
            );


        if (botaoMenu) {

            botaoMenu.classList.add(
                "active"
            );

        }


        // =============================================
        // CARREGAR DADOS
        // =============================================

        try {


            // -----------------------------------------
            // DASHBOARD
            // -----------------------------------------

            if (
                panelId === "dashboard" &&
                typeof window.carregarDashboard ===
                "function"
            ) {

                window.carregarDashboard()
                    .catch(function (erro) {

                        console.error(
                            "[MOZ TECH] Erro dashboard:",
                            erro
                        );

                    });

            }


            // -----------------------------------------
            // CRM
            // -----------------------------------------

            if (
                panelId === "crm" &&
                typeof window.carregarClientes ===
                "function"
            ) {

                window.carregarClientes();

            }


            // -----------------------------------------
            // PACOTES
            // -----------------------------------------

            if (
                panelId === "pacotes" &&
                typeof window.carregarPacotes ===
                "function"
            ) {

                window.carregarPacotes();

            }


            // -----------------------------------------
            // PEDIDOS
            // -----------------------------------------

            if (
                panelId === "pedidos" &&
                typeof window.carregarPedidos ===
                "function"
            ) {

                window.carregarPedidos();

            }


            // -----------------------------------------
            // DISPOSITIVOS
            // -----------------------------------------

            if (
                panelId === "dispositivos" &&
                typeof window.carregarDispositivos ===
                "function"
            ) {

                window.carregarDispositivos();

            }


            // -----------------------------------------
            // CONFIGURAÇÕES
            // -----------------------------------------

            if (
                panelId === "config" &&
                typeof window.carregarConfiguracoes ===
                "function"
            ) {

                window.carregarConfiguracoes();

            }

        }
        catch (erro) {

            console.error(
                "[MOZ TECH] Erro ao carregar painel:",
                erro
            );

        }


        // =============================================
        // FECHAR MENU NO CELULAR
        // =============================================

        if (
            window.innerWidth <= 768
        ) {

            fecharMenuMobile();

        }

    };


    // =================================================
    // INICIALIZAR CLIQUES DOS PAINÉIS
    // =================================================

    function inicializarMenu() {

        const botoes =
            document.querySelectorAll(
                ".menu-item[data-panel]"
            );


        console.log(
            "[MOZ TECH] Menus encontrados:",
            botoes.length
        );


        botoes.forEach(function (item) {


            /*
             * Não usar dataset.menuInicializado
             * antigo.
             *
             * Este sistema controla tudo sozinho.
             */

            if (
                item.dataset.mozMenuAtivo ===
                "true"
            ) {

                return;

            }


            item.dataset.mozMenuAtivo =
                "true";


            item.addEventListener(
                "click",
                function (event) {

                    event.preventDefault();

                    event.stopPropagation();


                    const panel =
                        item.getAttribute(
                            "data-panel"
                        );


                    if (!panel) {

                        return;

                    }


                    console.log(
                        "[MOZ TECH] Menu:",
                        panel
                    );


                    window.showPanel(
                        panel
                    );

                }
            );

        });

    }


    // =================================================
    // BOTÃO 3 BARRAS
    // =================================================

    function inicializarBotaoMenu() {

        const botao =
            document.getElementById(
                "menuToggle"
            );


        if (!botao) {

            console.error(
                "[MOZ TECH] #menuToggle não encontrado."
            );

            return;

        }


        /*
         * Se outro script já colocou evento,
         * este sistema usa uma marca própria.
         */

        if (
            botao.dataset.mozMenuBotao ===
            "true"
        ) {

            return;

        }


        botao.dataset.mozMenuBotao =
            "true";


        console.log(
            "[MOZ TECH] Botão 3 barras encontrado."
        );


        botao.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                event.stopPropagation();


                console.log(
                    "[MOZ TECH] 3 barras clicado."
                );


                alternarMenuMobile();

            }
        );


        // Estado inicial

        atualizarIconeMenu(false);


        botao.setAttribute(
            "aria-expanded",
            "false"
        );


        botao.setAttribute(
            "aria-label",
            "Abrir menu"
        );

    }


    // =================================================
    // OVERLAY
    // =================================================

    function inicializarOverlay() {

        const overlay =
            document.getElementById(
                "menuOverlay"
            );


        if (!overlay) {

            console.warn(
                "[MOZ TECH] #menuOverlay não encontrado."
            );

            return;

        }


        if (
            overlay.dataset.mozOverlay ===
            "true"
        ) {

            return;

        }


        overlay.dataset.mozOverlay =
            "true";


        overlay.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                event.stopPropagation();


                fecharMenuMobile();

            }
        );

    }


    // =================================================
    // ESC
    // =================================================

    function inicializarESC() {

        if (
            window.__mozEscInicializado
        ) {

            return;

        }


        window.__mozEscInicializado =
            true;


        document.addEventListener(
            "keydown",
            function (event) {

                if (
                    event.key === "Escape"
                ) {

                    fecharMenuMobile();

                }

            }
        );

    }


    // =================================================
    // CLICAR NO MENU
    // =================================================

    function inicializarFecharMenuItem() {

        const sidebar =
            document.getElementById(
                "sidebar"
            );


        if (!sidebar) {
            return;
        }


        const itens =
            sidebar.querySelectorAll(
                ".menu-item"
            );


        itens.forEach(function (item) {

            if (
                item.dataset.mozFecharMenu ===
                "true"
            ) {

                return;

            }


            item.dataset.mozFecharMenu =
                "true";


            item.addEventListener(
                "click",
                function () {

                    if (
                        window.innerWidth <= 768
                    ) {

                        fecharMenuMobile();

                    }

                }
            );

        });

    }


    // =================================================
    // CLIQUE FORA
    // =================================================

    function inicializarCliqueFora() {

        if (
            window.__mozCliqueForaInicializado
        ) {

            return;

        }


        window.__mozCliqueForaInicializado =
            true;


        document.addEventListener(
            "click",
            function (event) {

                if (
                    window.innerWidth > 768
                ) {

                    return;

                }


                const sidebar =
                    document.getElementById(
                        "sidebar"
                    );


                const botao =
                    document.getElementById(
                        "menuToggle"
                    );


                if (!sidebar) {
                    return;
                }


                if (
                    !sidebar.classList.contains(
                        "open"
                    )
                ) {

                    return;

                }


                if (
                    sidebar.contains(
                        event.target
                    )
                ) {

                    return;

                }


                if (
                    botao &&
                    botao.contains(
                        event.target
                    )
                ) {

                    return;

                }


                fecharMenuMobile();

            }
        );

    }


    // =================================================
    // RESIZE
    // =================================================

    function inicializarResize() {

        if (
            window.__mozResizeInicializado
        ) {

            return;

        }


        window.__mozResizeInicializado =
            true;


        window.addEventListener(
            "resize",
            function () {

                if (
                    window.innerWidth > 768
                ) {

                    fecharMenuMobile();

                }

            }
        );

    }


    // =================================================
    // ESTADO INICIAL
    // =================================================

    function estadoInicial() {

        const {
            sidebar,
            overlay,
            botao
        } = getElementosMenu();


        if (sidebar) {

            sidebar.classList.remove(
                "open"
            );

        }


        if (overlay) {

            overlay.classList.remove(
                "active"
            );

        }


        if (botao) {

            botao.setAttribute(
                "aria-expanded",
                "false"
            );

            botao.setAttribute(
                "aria-label",
                "Abrir menu"
            );

        }


        document.body.classList.remove(
            "menu-open"
        );


        atualizarIconeMenu(false);

    }


    // =================================================
    // INICIAR SISTEMA
    // =================================================

    function iniciarSistema() {

        console.log(
            "======================================"
        );

        console.log(
            "MOZ TECH - SISTEMA INICIADO"
        );

        console.log(
            "======================================"
        );


        estadoInicial();


        inicializarMenu();


        inicializarBotaoMenu();


        inicializarOverlay();


        inicializarESC();


        inicializarFecharMenuItem();


        inicializarCliqueFora();


        inicializarResize();


        // =============================================
        // DASHBOARD INICIAL
        // =============================================

        window.showPanel(
            "dashboard"
        );


        console.log(
            "[MOZ TECH] Sistema pronto."
        );

    }


    // =================================================
    // EXPOR FUNÇÕES
    // =================================================

    window.abrirMenuMobile =
        abrirMenuMobile;


    window.fecharMenuMobile =
        fecharMenuMobile;


    window.alternarMenuMobile =
        alternarMenuMobile;


    // =================================================
    // DOM READY
    // =================================================

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            iniciarSistema,
            {
                once: true
            }
        );

    }
    else {

        iniciarSistema();

    }


})();
