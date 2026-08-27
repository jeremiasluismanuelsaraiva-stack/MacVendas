// =====================================================
// MOZ TECH
// SISTEMA DE PAINÉIS + MENU MOBILE
// =====================================================


// =====================================================
// MAPA DOS PAINÉIS
// =====================================================

const paineis = {

    dashboard: "panelDashboard",
    crm: "panelCRM",
    pacotes: "panelPacotes",
    pedidos: "panelPedidos",
    dispositivos: "panelDispositivos",
    tutorial: "panelTutorial",
    config: "panelConfig"

};


// =====================================================
// ABRIR PAINEL
// =====================================================

window.showPanel = function (panelId) {

    console.log("Abrindo painel:", panelId);


    // =================================================
    // ESCONDER TODOS OS PAINÉIS
    // =================================================

    Object.values(paineis).forEach(function (id) {

        const painel =
            document.getElementById(id);

        if (painel) {

            painel.style.display = "none";

        }

    });


    // =================================================
    // VERIFICAR PAINEL
    // =================================================

    const painelId =
        paineis[panelId];

    if (!painelId) {

        console.error(
            "Painel não encontrado:",
            panelId
        );

        return;

    }


    // =================================================
    // ENCONTRAR ELEMENTO
    // =================================================

    const painel =
        document.getElementById(
            painelId
        );

    if (!painel) {

        console.error(
            "Elemento do painel não encontrado:",
            painelId
        );

        return;

    }


    // =================================================
    // MOSTRAR PAINEL
    // =================================================

    painel.style.display = "block";


    // =================================================
    // MARCAR MENU ATIVO
    // =================================================

    document
        .querySelectorAll(
            ".menu-item[data-panel]"
        )
        .forEach(function (item) {

            item.classList.remove(
                "active"
            );

        });


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
    // CARREGAR DADOS DO PAINEL
    // =================================================

    try {


        // ---------------------------------------------
        // DASHBOARD
        // ---------------------------------------------

        if (
            panelId === "dashboard" &&
            typeof window.carregarDashboard ===
            "function"
        ) {

            window.carregarDashboard();

        }


        // ---------------------------------------------
        // CRM
        // ---------------------------------------------

        if (
            panelId === "crm" &&
            typeof window.carregarClientes ===
            "function"
        ) {

            window.carregarClientes();

        }


        // ---------------------------------------------
        // PACOTES
        // ---------------------------------------------

        if (
            panelId === "pacotes" &&
            typeof window.carregarPacotes ===
            "function"
        ) {

            window.carregarPacotes();

        }


        // ---------------------------------------------
        // PEDIDOS
        // ---------------------------------------------

        if (
            panelId === "pedidos" &&
            typeof window.carregarPedidos ===
            "function"
        ) {

            window.carregarPedidos();

        }


        // ---------------------------------------------
        // DISPOSITIVOS
        // ---------------------------------------------

        if (
            panelId === "dispositivos" &&
            typeof window.carregarDispositivos ===
            "function"
        ) {

            window.carregarDispositivos();

        }


        // ---------------------------------------------
        // CONFIGURAÇÕES
        // ---------------------------------------------

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
            "Erro ao carregar painel:",
            erro
        );

    }


    // =================================================
    // FECHAR MENU NO MOBILE
    // =================================================

    if (window.innerWidth <= 768) {

        fecharMenuMobile();

    }

};


// =====================================================
// ABRIR MENU MOBILE
// =====================================================

function abrirMenuMobile() {

    console.log(
        "Abrindo menu mobile..."
    );


    const sidebar =
        document.getElementById(
            "sidebar"
        );

    const overlay =
        document.getElementById(
            "menuOverlay"
        );

    const botao =
        document.getElementById(
            "menuToggle"
        );


    // Sidebar

    if (sidebar) {

        sidebar.classList.add(
            "open"
        );

    }
    else {

        console.error(
            "Elemento #sidebar não encontrado."
        );

    }


    // Overlay

    if (overlay) {

        overlay.classList.add(
            "active"
        );

    }


    // Botão

    if (botao) {

        botao.setAttribute(
            "aria-expanded",
            "true"
        );

    }

}


// =====================================================
// FECHAR MENU MOBILE
// =====================================================

function fecharMenuMobile() {

    console.log(
        "Fechando menu mobile..."
    );


    const sidebar =
        document.getElementById(
            "sidebar"
        );

    const overlay =
        document.getElementById(
            "menuOverlay"
        );

    const botao =
        document.getElementById(
            "menuToggle"
        );


    // Sidebar

    if (sidebar) {

        sidebar.classList.remove(
            "open"
        );

    }


    // Overlay

    if (overlay) {

        overlay.classList.remove(
            "active"
        );

    }


    // Botão

    if (botao) {

        botao.setAttribute(
            "aria-expanded",
            "false"
        );

    }

}


// =====================================================
// INICIALIZAR MENUS
// =====================================================

function inicializarMenu() {

    console.log(
        "Inicializando menus..."
    );


    const botoes =
        document.querySelectorAll(
            ".menu-item[data-panel]"
        );


    console.log(
        "Menus encontrados:",
        botoes.length
    );


    botoes.forEach(function (item) {

        // Evitar adicionar o evento duas vezes

        if (
            item.dataset.menuInicializado ===
            "true"
        ) {

            return;

        }


        item.dataset.menuInicializado =
            "true";


        item.addEventListener(
            "click",
            function (e) {

                e.preventDefault();

                e.stopPropagation();


                const panel =
                    this.getAttribute(
                        "data-panel"
                    );


                console.log(
                    "Menu clicado:",
                    panel
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

}


// =====================================================
// BOTÃO DAS 3 BARRAS
// =====================================================

function inicializarBotaoMenu() {

    const botao =
        document.getElementById(
            "menuToggle"
        );


    if (!botao) {

        console.error(
            "Botão #menuToggle não encontrado."
        );

        return;

    }


    // Evitar evento duplicado

    if (
        botao.dataset.menuInicializado ===
        "true"
    ) {

        return;

    }


    botao.dataset.menuInicializado =
        "true";


    console.log(
        "Botão das 3 barras encontrado."
    );


    botao.addEventListener(
        "click",
        function (e) {

            e.preventDefault();

            e.stopPropagation();


            const sidebar =
                document.getElementById(
                    "sidebar"
                );


            if (!sidebar) {

                console.error(
                    "Sidebar não encontrada."
                );

                return;

            }


            if (
                sidebar.classList.contains(
                    "open"
                )
            ) {

                fecharMenuMobile();

            }
            else {

                abrirMenuMobile();

            }

        }
    );

}


// =====================================================
// OVERLAY
// =====================================================

function inicializarOverlay() {

    const overlay =
        document.getElementById(
            "menuOverlay"
        );


    if (!overlay) {

        console.warn(
            "Overlay #menuOverlay não encontrado."
        );

        return;

    }


    if (
        overlay.dataset.menuInicializado ===
        "true"
    ) {

        return;

    }


    overlay.dataset.menuInicializado =
        "true";


    overlay.addEventListener(
        "click",
        function (e) {

            e.preventDefault();

            fecharMenuMobile();

        }
    );

}


// =====================================================
// TECLA ESC
// =====================================================

function inicializarTeclaESC() {

    if (
        document.documentElement.dataset
            .escInicializado === "true"
    ) {

        return;

    }


    document.documentElement.dataset
        .escInicializado = "true";


    document.addEventListener(
        "keydown",
        function (e) {

            if (
                e.key === "Escape"
            ) {

                fecharMenuMobile();

            }

        }
    );

}


// =====================================================
// CLIQUE FORA NO MOBILE
// =====================================================

function inicializarCliqueFora() {

    if (
        document.documentElement.dataset
            .cliqueForaInicializado === "true"
    ) {

        return;

    }


    document.documentElement.dataset
        .cliqueForaInicializado = "true";


    document.addEventListener(
        "click",
        function (e) {

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
                    e.target
                )
            ) {

                return;

            }


            if (
                botao &&
                botao.contains(
                    e.target
                )
            ) {

                return;

            }


            fecharMenuMobile();

        }
    );

}


// =====================================================
// REDIMENSIONAMENTO
// =====================================================

function inicializarResize() {

    if (
        window.__resizeMenuInicializado
    ) {

        return;

    }


    window.__resizeMenuInicializado =
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


// =====================================================
// INICIALIZAÇÃO
// =====================================================

function iniciarSistema() {

    console.log(
        "================================"
    );

    console.log(
        "MOZ TECH - SISTEMA INICIADO"
    );

    console.log(
        "================================"
    );


    // Menu

    inicializarMenu();


    // 3 barras

    inicializarBotaoMenu();


    // Overlay

    inicializarOverlay();


    // ESC

    inicializarTeclaESC();


    // Clique fora

    inicializarCliqueFora();


    // Resize

    inicializarResize();


    // Dashboard inicial

    window.showPanel(
        "dashboard"
    );


    console.log(
        "Sistema pronto."
    );

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
        iniciarSistema,
        {
            once: true
        }
    );

}
else {

    iniciarSistema();

}
