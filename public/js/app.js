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

    Object.values(paineis).forEach(id => {

        const elemento =
            document.getElementById(id);

        if (elemento) {

            elemento.style.display = "none";

        }

    });


    // ==========================================
    // VERIFICAR PAINEL
    // ==========================================

    const painelId = paineis[panelId];

    if (!painelId) {

        console.error(
            "Painel não encontrado:",
            panelId
        );

        return;

    }


    const painel =
        document.getElementById(painelId);

    if (!painel) {

        console.error(
            "Elemento não encontrado:",
            painelId
        );

        return;

    }


    // ==========================================
    // MOSTRAR PAINEL
    // ==========================================

    painel.style.display = "block";


    // ==========================================
    // MENU ATIVO
    // ==========================================

    document
        .querySelectorAll(".menu-item[data-panel]")
        .forEach(item => {

            item.classList.remove("active");

        });


    const botao =
        document.querySelector(
            `.menu-item[data-panel="${panelId}"]`
        );


    if (botao) {

        botao.classList.add("active");

    }


    // ==========================================
    // CARREGAR CONTEÚDO
    // ==========================================

    try {

        // DASHBOARD

        if (panelId === "dashboard") {

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


        // CRM

        if (panelId === "crm") {

            if (
                typeof window.carregarClientes ===
                "function"
            ) {

                window.carregarClientes();

            }

        }


        // PACOTES

        if (panelId === "pacotes") {

            if (
                typeof window.carregarPacotes ===
                "function"
            ) {

                window.carregarPacotes();

            }

        }


        // PEDIDOS

        if (panelId === "pedidos") {

            if (
                typeof window.carregarPedidos ===
                "function"
            ) {

                window.carregarPedidos();

            }

        }


        // DISPOSITIVOS

        if (panelId === "dispositivos") {

            if (
                typeof window.carregarDispositivos ===
                "function"
            ) {

                window.carregarDispositivos();

            }

        }


        // CONFIGURAÇÕES

        if (panelId === "config") {

            if (
                typeof window.carregarConfiguracoes ===
                "function"
            ) {

                window.carregarConfiguracoes();

            }

        }


    } catch (erro) {

        console.error(
            "Erro ao carregar painel:",
            panelId,
            erro
        );

    }


    // ==========================================
    // FECHAR MENU NO TELEMÓVEL
    // ==========================================

    if (window.innerWidth <= 768) {

        const sidebar =
            document.getElementById("sidebar");

        const overlay =
            document.getElementById("menuOverlay");


        if (sidebar) {

            sidebar.classList.remove("open");

        }


        if (overlay) {

            overlay.classList.remove("active");

        }

    }

};


// ==========================================
// CLIQUES DO MENU
// ==========================================

function inicializarMenu() {

    document
        .querySelectorAll(".menu-item[data-panel]")
        .forEach(item => {

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


                    window.showPanel(panel);

                }
            );

        });

}


// ==========================================
// INICIALIZAÇÃO
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        inicializarMenu();

        // Dashboard inicial
        window.showPanel("dashboard");

    }
);
