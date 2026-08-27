// =====================================================
// MOZ TECH - APP.JS
// PAINÉIS + MENU MOBILE + ATUALIZAÇÃO
// =====================================================


// =====================================================
// SISTEMA DE PAINÉIS
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
    // ESCONDER TODOS OS PAINÉIS
    // =================================================

    Object.values(paineis).forEach(function (id) {

        const elemento =
            document.getElementById(id);

        if (elemento) {

            elemento.style.display = "none";

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
    // CARREGAR DADOS DO PAINEL
    // =================================================

    try {


        // -----------------------------
        // DASHBOARD
        // -----------------------------

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


        // -----------------------------
        // CRM
        // -----------------------------

        if (panelId === "crm") {

            if (
                typeof window.carregarClientes ===
                "function"
            ) {

                window.carregarClientes();

            }

        }


        // -----------------------------
        // PACOTES
        // -----------------------------

        if (panelId === "pacotes") {

            if (
                typeof window.carregarPacotes ===
                "function"
            ) {

                window.carregarPacotes();

            }

        }


        // -----------------------------
        // PEDIDOS
        // -----------------------------

        if (panelId === "pedidos") {

            if (
                typeof window.carregarPedidos ===
                "function"
            ) {

                window.carregarPedidos();

            }

        }


        // -----------------------------
        // DISPOSITIVOS
        // -----------------------------

        if (panelId === "dispositivos") {

            if (
                typeof window.carregarDispositivos ===
                "function"
            ) {

                window.carregarDispositivos();

            }

        }


        // -----------------------------
        // CONFIGURAÇÕES
        // -----------------------------

        if (panelId === "config") {

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
            "Erro ao carregar painel:",
            panelId,
            erro
        );

    }


    // =================================================
    // FECHAR MENU NO TELEMÓVEL
    // =================================================

    fecharMenuMobile();

};


// =====================================================
// MENU MOBILE
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


    console.log(
        "Menu mobile aberto"
    );

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
// ALTERNAR MENU MOBILE
// =====================================================

function alternarMenuMobile() {

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


// =====================================================
// CLIQUES DOS MENUS
// =====================================================

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


// =====================================================
// BOTÃO DAS 3 BARRAS
// =====================================================

function inicializarBotaoMenu() {

    const botao =
        document.getElementById(
            "menuToggle"
        );


    if (!botao) {

        console.warn(
            "Botão menuToggle não encontrado."
        );

        return;

    }


    botao.addEventListener(
        "click",
        function (e) {

            e.preventDefault();

            e.stopPropagation();

            alternarMenuMobile();

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

        return;

    }


    overlay.addEventListener(
        "click",
        function () {

            fecharMenuMobile();

        }
    );

}


// =====================================================
// TECLA ESC
// =====================================================

function inicializarTeclaESC() {

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
// BOTÃO ATUALIZAR
// =====================================================

function inicializarBotaoAtualizar() {

    const botoes = [

        document.getElementById(
            "btnAtualizar"
        ),

        document.getElementById(
            "atualizarBtn"
        ),

        document.getElementById(
            "refreshBtn"
        ),

        document.getElementById(
            "btnRefresh"
        )

    ];


    const botao =
        botoes.find(
            function (item) {

                return item !== null;

            }
        );


    if (!botao) {

        console.warn(
            "Botão de atualizar não encontrado."
        );

        return;

    }


    botao.addEventListener(
        "click",
        async function (e) {

            e.preventDefault();

            e.stopPropagation();


            console.log(
                "Atualizando dashboard..."
            );


            // Efeito visual

            const textoOriginal =
                botao.innerHTML;


            botao.disabled = true;


            botao.innerHTML =
                '<i class="fas fa-spinner fa-spin"></i> Atualizando...';


            try {


                // Dashboard

                if (
                    typeof window.carregarDashboard ===
                    "function"
                ) {

                    await window.carregarDashboard();

                }


                // Tabela

                if (
                    typeof window.carregarTabela ===
                    "function"
                ) {

                    await window.carregarTabela();

                }


                // Gráficos

                if (
                    typeof window.carregarGraficos ===
                    "function"
                ) {

                    await window.carregarGraficos();

                }


                console.log(
                    "Dashboard atualizado."
                );


            }
            catch (erro) {

                console.error(
                    "Erro ao atualizar:",
                    erro
                );

            }
            finally {

                botao.disabled = false;

                botao.innerHTML =
                    textoOriginal;

            }

        }
    );

}


// =====================================================
// INICIALIZAÇÃO
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log(
            "MOZ TECH - App iniciado"
        );


        inicializarMenu();


        inicializarBotaoMenu();


        inicializarOverlay();


        inicializarTeclaESC();


        inicializarBotaoAtualizar();


        // Dashboard inicial

        window.showPanel(
            "dashboard"
        );

    }
);


// =====================================================
// EXPOR FUNÇÕES
// =====================================================

window.abrirMenuMobile =
    abrirMenuMobile;

window.fecharMenuMobile =
    fecharMenuMobile;

window.alternarMenuMobile =
    alternarMenuMobile;
