// ==========================================
// SISTEMA DE PAINÉIS
// ==========================================

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


    // ==========================================
    // ESCONDER TODOS OS PAINÉIS
    // ==========================================

    Object.values(paineis).forEach(function (id) {

        const elemento =
            document.getElementById(id);

        if (elemento) {

            elemento.style.display = "none";

        }

    });


    // ==========================================
    // ENCONTRAR PAINEL
    // ==========================================

    const painelId =
        paineis[panelId];


    if (!painelId) {

        console.error(
            "Painel não encontrado:",
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


    // ==========================================
    // MOSTRAR
    // ==========================================

    painel.style.display = "block";


    // ==========================================
    // MENU ATIVO
    // ==========================================

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


    // ==========================================
    // CARREGAR DADOS
    // ==========================================

    try {

        if (
            panelId === "dashboard" &&
            typeof window.carregarDashboard ===
            "function"
        ) {

            window.carregarDashboard();

        }


        if (
            panelId === "crm" &&
            typeof window.carregarClientes ===
            "function"
        ) {

            window.carregarClientes();

        }


        if (
            panelId === "pacotes" &&
            typeof window.carregarPacotes ===
            "function"
        ) {

            window.carregarPacotes();

        }


        if (
            panelId === "pedidos" &&
            typeof window.carregarPedidos ===
            "function"
        ) {

            window.carregarPedidos();

        }


        if (
            panelId === "dispositivos" &&
            typeof window.carregarDispositivos ===
            "function"
        ) {

            window.carregarDispositivos();

        }


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


    // ==========================================
    // FECHAR MENU MOBILE
    // ==========================================

    if (window.innerWidth <= 768) {

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

};


// ==========================================
// CLIQUES DO MENU
// ==========================================

function inicializarMenu() {

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

}


// ==========================================
// INICIAR
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        inicializarMenu();

        window.showPanel(
            "dashboard"
        );

    }
);
