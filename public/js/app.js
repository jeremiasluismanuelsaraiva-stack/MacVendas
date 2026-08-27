// =====================================================
// MOZ TECH
// SISTEMA DE PAINÉIS + MENU MOBILE
// =====================================================


// =====================================================
// PAINÉIS
// =====================================================

window.showPanel = function (panelId) {

    console.log("Abrindo painel:", panelId);


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
    // ESCONDER TODOS
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
            "Painel não configurado:",
            panelId
        );

        return;

    }


    const painel =
        document.getElementById(
            painelId
        );


    if (!painel) {

        console.error(
            "Elemento não encontrado:",
            painelId
        );

        return;

    }


    // =================================================
    // MOSTRAR
    // =================================================

    painel.style.display = "block";


    // =================================================
    // MENU ATIVO
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
    // CARREGAR DADOS
    // =================================================

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
            panelId === "config"
        ) {

            if (
                typeof window.carregarConfiguracoes ===
                "function"
            ) {

                window.carregarConfiguracoes();

            }

        }


        // =================================================
        // TUTORIAL / API
        // =================================================

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

    }
    catch (erro) {

        console.error(
            "Erro ao carregar painel:",
            panelId,
            erro
        );

    }


    // =================================================
    // FECHAR MENU NO CELULAR
    // =================================================

    if (
        window.innerWidth <= 768
    ) {

        fecharMenuMobile();

    }

};


// =====================================================
// ABRIR MENU MOBILE
// =====================================================

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

        sidebar.classList.add(
            "open"
        );

    }


    if (overlay) {

        overlay.classList.add(
            "active"
        );

    }

}


// =====================================================
// FECHAR MENU MOBILE
// =====================================================

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

        sidebar.classList.remove(
            "open"
        );

    }


    if (overlay) {

        overlay.classList.remove(
            "active"
        );

    }

}


// =====================================================
// INICIALIZAR MENU
// =====================================================

function inicializarMenu() {


    // =================================================
    // BOTÕES DOS PAINÉIS
    // =================================================

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


    // =================================================
    // BOTÃO 3 BARRAS
    // =================================================

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


    // =================================================
    // OVERLAY
    // =================================================

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


// =====================================================
// INICIALIZAÇÃO
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log(
            "MOZ TECH: inicializando..."
        );


        inicializarMenu();


        // Dashboard inicial

        window.showPanel(
            "dashboard"
        );

    }
);
