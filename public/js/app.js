// =====================================================
// MOZ TECH
// SISTEMA DE PAINÉIS + MENU MOBILE
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

    function getElemento(id) {

        return document.getElementById(id);

    }


    // =================================================
    // ABRIR MENU MOBILE
    // =================================================

    function abrirMenuMobile() {

        const sidebar =
            getElemento("sidebar");

        const overlay =
            getElemento("menuOverlay");

        const botao =
            getElemento("menuToggle");


        if (!sidebar) {

            console.error(
                "[MOZ TECH] #sidebar não encontrado."
            );

            return;

        }


        // Abrir sidebar

        sidebar.classList.add("open");


        // Mostrar overlay

        if (overlay) {

            overlay.classList.add("active");

        }


        // Atualizar botão

        if (botao) {

            botao.setAttribute(
                "aria-expanded",
                "true"
            );

            botao.setAttribute(
                "aria-label",
                "Fechar menu"
            );


            const icon =
                botao.querySelector("i");


            if (icon) {

                icon.classList.remove(
                    "fa-bars"
                );

                icon.classList.add(
                    "fa-xmark"
                );

            }

        }


        console.log(
            "[MOZ TECH] Menu aberto."
        );

    }


    // =================================================
    // FECHAR MENU MOBILE
    // =================================================

    function fecharMenuMobile() {

        const sidebar =
            getElemento("sidebar");

        const overlay =
            getElemento("menuOverlay");

        const botao =
            getElemento("menuToggle");


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


            const icon =
                botao.querySelector("i");


            if (icon) {

                icon.classList.remove(
                    "fa-xmark"
                );

                icon.classList.add(
                    "fa-bars"
                );

            }

        }


        console.log(
            "[MOZ TECH] Menu fechado."
        );

    }


    // =================================================
    // TOGGLE MENU
    // =================================================

    function alternarMenuMobile() {

        const sidebar =
            getElemento("sidebar");


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


        // =================================================
        // VERIFICAR PAINEL
        // =================================================

        const painelId =
            paineis[panelId];


        if (!painelId) {

            console.error(
                "[MOZ TECH] Painel não encontrado:",
                panelId
            );

            return;

        }


        // =================================================
        // ESCONDER TODOS OS PAINÉIS
        // =================================================

        Object.values(paineis).forEach(
            function (id) {

                const painel =
                    getElemento(id);


                if (painel) {

                    painel.style.display =
                        "none";

                }

            }
        );


        // =================================================
        // ENCONTRAR PAINEL
        // =================================================

        const painel =
            getElemento(painelId);


        if (!painel) {

            console.error(
                "[MOZ TECH] Elemento não encontrado:",
                painelId
            );

            return;

        }


        // =================================================
        // MOSTRAR PAINEL
        // =================================================

        painel.style.display =
            "block";


        // =================================================
        // MENU ATIVO
        // =================================================

        document
            .querySelectorAll(
                ".menu-item[data-panel]"
            )
            .forEach(
                function (item) {

                    item.classList.remove(
                        "active"
                    );

                }
            );


        const botao =
            document.querySelector(
                '.menu-item[data-panel="' +
                panelId +
                '"]'
            );


        if (botao) {

            botao.classList.add(
                "active"
            );

        }


        // =================================================
        // CARREGAR DADOS
        // =================================================

        try {


            // DASHBOARD

            if (
                panelId === "dashboard" &&
                typeof window.carregarDashboard ===
                "function"
            ) {

                window.carregarDashboard()
                    .catch(
                        function (erro) {

                            console.error(
                                "[MOZ TECH] Erro dashboard:",
                                erro
                            );

                        }
                    );

            }


            // CRM

            else if (
                panelId === "crm" &&
                typeof window.carregarClientes ===
                "function"
            ) {

                window.carregarClientes();

            }


            // PACOTES

            else if (
                panelId === "pacotes" &&
                typeof window.carregarPacotes ===
                "function"
            ) {

                window.carregarPacotes();

            }


            // PEDIDOS

            else if (
                panelId === "pedidos" &&
                typeof window.carregarPedidos ===
                "function"
            ) {

                window.carregarPedidos();

            }


            // DISPOSITIVOS

            else if (
                panelId === "dispositivos" &&
                typeof window.carregarDispositivos ===
                "function"
            ) {

                window.carregarDispositivos();

            }


            // CONFIGURAÇÕES

            else if (
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


        // =================================================
        // FECHAR MENU NO MOBILE
        // =================================================

        if (
            window.innerWidth <= 768
        ) {

            fecharMenuMobile();

        }

    };


    // =================================================
    // INICIALIZAR BOTÃO 3 BARRAS
    // =================================================

    function inicializarBotaoMenu() {

        const botao =
            getElemento("menuToggle");


        if (!botao) {

            console.error(
                "[MOZ TECH] #menuToggle não encontrado."
            );

            return;

        }


        // Evitar duplicação

        if (
            botao.dataset.moztMenu ===
            "true"
        ) {

            return;

        }


        botao.dataset.moztMenu =
            "true";


        // Estado inicial

        botao.setAttribute(
            "aria-expanded",
            "false"
        );

        botao.setAttribute(
            "aria-label",
            "Abrir menu"
        );


        const icon =
            botao.querySelector("i");


        if (icon) {

            icon.classList.remove(
                "fa-xmark"
            );

            icon.classList.add(
                "fa-bars"
            );

        }


        // =================================================
        // CLICK
        // =================================================

        botao.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                event.stopPropagation();


                alternarMenuMobile();

            },
            false
        );


        console.log(
            "[MOZ TECH] Botão 3 barras configurado."
        );

    }


    // =================================================
    // INICIALIZAR MENUS
    // =================================================

    function inicializarMenus() {

        const botoes =
            document.querySelectorAll(
                ".menu-item[data-panel]"
            );


        console.log(
            "[MOZ TECH] Menus encontrados:",
            botoes.length
        );


        botoes.forEach(
            function (item) {


                if (
                    item.dataset.moztMenuItem ===
                    "true"
                ) {

                    return;

                }


                item.dataset.moztMenuItem =
                    "true";


                item.addEventListener(
                    "click",
                    function (event) {

                        event.preventDefault();

                        event.stopPropagation();


                        const panel =
                            this.getAttribute(
                                "data-panel"
                            );


                        if (!panel) {

                            return;

                        }


                        console.log(
                            "[MOZ TECH] Menu clicado:",
                            panel
                        );


                        window.showPanel(
                            panel
                        );

                    },
                    false
                );

            }
        );

    }


    // =================================================
    // INICIALIZAR OVERLAY
    // =================================================

    function inicializarOverlay() {

        const overlay =
            getElemento("menuOverlay");


        if (!overlay) {

            console.warn(
                "[MOZ TECH] #menuOverlay não encontrado."
            );

            return;

        }


        if (
            overlay.dataset.moztOverlay ===
            "true"
        ) {

            return;

        }


        overlay.dataset.moztOverlay =
            "true";


        overlay.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                event.stopPropagation();


                fecharMenuMobile();

            },
            false
        );

    }


    // =================================================
    // FECHAR AO CLICAR EM ITEM
    // =================================================

    function inicializarFecharMenuItens() {

        const sidebar =
            getElemento("sidebar");


        if (!sidebar) {

            return;

        }


        sidebar
            .querySelectorAll(".menu-item")
            .forEach(
                function (item) {

                    if (
                        item.dataset.moztFechar ===
                        "true"
                    ) {

                        return;

                    }


                    item.dataset.moztFechar =
                        "true";


                    item.addEventListener(
                        "click",
                        function () {

                            if (
                                window.innerWidth <=
                                768
                            ) {

                                fecharMenuMobile();

                            }

                        },
                        false
                    );

                }
            );

    }


    // =================================================
    // ESC
    // =================================================

    function inicializarESC() {

        if (
            window.__moztEsc === true
        ) {

            return;

        }


        window.__moztEsc =
            true;


        document.addEventListener(
            "keydown",
            function (event) {

                if (
                    event.key === "Escape"
                ) {

                    fecharMenuMobile();

                }

            },
            false
        );

    }


    // =================================================
    // CLIQUE FORA
    // =================================================

    function inicializarCliqueFora() {

        if (
            window.__moztCliqueFora ===
            true
        ) {

            return;

        }


        window.__moztCliqueFora =
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
                    getElemento("sidebar");

                const botao =
                    getElemento("menuToggle");


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


                // Clique dentro da sidebar

                if (
                    sidebar.contains(
                        event.target
                    )
                ) {

                    return;

                }


                // Clique no botão

                if (
                    botao &&
                    botao.contains(
                        event.target
                    )
                ) {

                    return;

                }


                fecharMenuMobile();

            },
            false
        );

    }


    // =================================================
    // RESIZE
    // =================================================

    function inicializarResize() {

        if (
            window.__moztResize === true
        ) {

            return;

        }


        window.__moztResize =
            true;


        window.addEventListener(
            "resize",
            function () {

                if (
                    window.innerWidth > 768
                ) {

                    fecharMenuMobile();

                }

            },
            false
        );

    }


    // =================================================
    // ESTADO INICIAL
    // =================================================

    function estadoInicialMenu() {

        const sidebar =
            getElemento("sidebar");

        const overlay =
            getElemento("menuOverlay");

        const botao =
            getElemento("menuToggle");


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


            const icon =
                botao.querySelector("i");


            if (icon) {

                icon.classList.remove(
                    "fa-xmark"
                );

                icon.classList.add(
                    "fa-bars"
                );

            }

        }

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


        // Estado inicial

        estadoInicialMenu();


        // Menu

        inicializarMenus();


        // Botão 3 barras

        inicializarBotaoMenu();


        // Overlay

        inicializarOverlay();


        // Fechar itens

        inicializarFecharMenuItens();


        // ESC

        inicializarESC();


        // Clique fora

        inicializarCliqueFora();


        // Resize

        inicializarResize();


        // =================================================
        // DASHBOARD INICIAL
        // =================================================

        window.showPanel(
            "dashboard"
        );


        console.log(
            "[MOZ TECH] Sistema pronto."
        );

    }


    // =================================================
    // EXPORTAR FUNÇÕES
    // =================================================

    window.abrirMenuMobile =
        abrirMenuMobile;


    window.fecharMenuMobile =
        fecharMenuMobile;


    window.configurarMenuMobile =
        iniciarSistema;


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
