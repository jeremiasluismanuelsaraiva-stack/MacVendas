// =====================================================
// MACVENDAS - APP.JS
// PAINÉIS + MENU + USUÁRIO + API KEY
// =====================================================


// =====================================================
// IMPORTAR FIREBASE
// =====================================================

import {
    auth,
    onAuthState,
    obterDadosUsuario
} from "../firebase.js";


// =====================================================
// SISTEMA DE PAINÉIS
// =====================================================

window.showPanel = function (panelId) {

    console.log(
        "Abrindo painel:",
        panelId
    );


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
    // ESCONDER TODOS
    // ==========================================

    Object.values(paineis).forEach(
        id => {

            const elemento =
                document.getElementById(id);


            if (elemento) {

                elemento.style.display =
                    "none";

            }

        }
    );


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
    // MOSTRAR PAINEL
    // ==========================================

    painel.style.display =
        "block";


    // ==========================================
    // MENU ATIVO
    // ==========================================

    document
        .querySelectorAll(
            ".menu-item[data-panel]"
        )
        .forEach(
            item => {

                item.classList.remove(
                    "active"
                );

            }
        );


    const botao =
        document.querySelector(
            `.menu-item[data-panel="${panelId}"]`
        );


    if (botao) {

        botao.classList.add(
            "active"
        );

    }


    // ==========================================
    // CARREGAR DADOS DO PAINEL
    // ==========================================

    try {


        // --------------------------------------
        // DASHBOARD
        // --------------------------------------

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


        // --------------------------------------
        // CRM
        // --------------------------------------

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


        // --------------------------------------
        // PACOTES
        // --------------------------------------

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


        // --------------------------------------
        // PEDIDOS
        // --------------------------------------

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


        // --------------------------------------
        // DISPOSITIVOS
        // --------------------------------------

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


        // --------------------------------------
        // CONFIGURAÇÕES
        // --------------------------------------

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


        // --------------------------------------
        // TUTORIAL
        // --------------------------------------

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


    // ==========================================
    // FECHAR MENU NO TELEMÓVEL
    // ==========================================

    if (
        window.innerWidth <= 768
    ) {

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


// =====================================================
// CLIQUES DO MENU
// =====================================================

function inicializarMenu() {

    document
        .querySelectorAll(
            ".menu-item[data-panel]"
        )
        .forEach(
            item => {

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

            }
        );

}


// =====================================================
// CARREGAR DADOS DO USUÁRIO
// =====================================================

async function carregarUsuario() {

    try {

        console.log(
            "Carregando dados do usuário..."
        );


        const usuario =
            auth.currentUser;


        if (!usuario) {

            console.warn(
                "Nenhum usuário autenticado."
            );

            return;

        }


        console.log(
            "UID:",
            usuario.uid
        );


        // ==========================================
        // BUSCAR DADOS NO FIREBASE
        // ==========================================

        const resultado =
            await obterDadosUsuario();


        if (!resultado) {

            console.error(
                "Nenhum dado retornado."
            );

            return;

        }


        // ==========================================
        // ACEITAR OS DOIS FORMATOS
        // ==========================================

        const dados =
            resultado.data ||
            resultado;


        const uid =
            dados.uid ||
            usuario.uid;


        const apiKey =
            dados.apiKey ||
            "";


        const nome =
            dados.name ||
            dados.nome ||
            usuario.displayName ||
            "Usuário";


        const email =
            dados.email ||
            usuario.email ||
            "-";


        console.log(
            "Dados carregados:",
            {
                uid,
                apiKey,
                nome,
                email
            }
        );


        // =================================================
        // SIDEBAR - NOME
        // =================================================

        const nomeElemento =
            document.getElementById(
                "sidebarUserName"
            );


        if (nomeElemento) {

            nomeElemento.textContent =
                nome;

        }


        // =================================================
        // SIDEBAR - EMAIL
        // =================================================

        const emailElemento =
            document.getElementById(
                "sidebarUserEmail"
            );


        if (emailElemento) {

            emailElemento.textContent =
                email;

        }


        // =================================================
        // SIDEBAR - UID
        // =================================================

        const uidElemento =
            document.getElementById(
                "sidebarUserUid"
            );


        if (uidElemento) {

            uidElemento.textContent =
                "UID: " + uid;

        }


        // =================================================
        // SIDEBAR - API KEY
        // =================================================

        const apiElemento =
            document.getElementById(
                "sidebarApiKey"
            );


        if (apiElemento) {

            apiElemento.textContent =
                "API Key: " +
                (
                    apiKey ||
                    "Não disponível"
                );

        }


        // =================================================
        // TUTORIAL - UID
        // =================================================

        const tutorialUid =
            document.getElementById(
                "tutorialUid"
            );


        if (tutorialUid) {

            tutorialUid.textContent =
                uid;

        }


        // =================================================
        // TUTORIAL - API KEY
        // =================================================

        const tutorialApiKey =
            document.getElementById(
                "tutorialApiKey"
            );


        if (tutorialApiKey) {

            tutorialApiKey.textContent =
                apiKey ||
                "Não disponível";

        }


        // =================================================
        // GUARDAR LOCAL
        // =================================================

        localStorage.setItem(
            "userData",
            JSON.stringify({

                uid: uid,

                email: email,

                name: nome,

                apiKey: apiKey

            })
        );


    }
    catch (erro) {

        console.error(
            "Erro ao carregar usuário:",
            erro
        );

    }

}


// =====================================================
// COPIAR UID
// =====================================================

async function copiarUID() {

    try {

        const elemento =
            document.getElementById(
                "tutorialUid"
            );


        if (!elemento) return;


        const valor =
            elemento.textContent.trim();


        if (
            !valor ||
            valor === "-"
        ) {

            return;

        }


        await navigator.clipboard.writeText(
            valor
        );


        alert(
            "UID copiado!"
        );

    }
    catch (erro) {

        console.error(
            "Erro ao copiar UID:",
            erro
        );

    }

}


// =====================================================
// COPIAR API KEY
// =====================================================

async function copiarAPIKey() {

    try {

        const elemento =
            document.getElementById(
                "tutorialApiKey"
            );


        if (!elemento) return;


        const valor =
            elemento.textContent.trim();


        if (
            !valor ||
            valor === "-" ||
            valor === "Não disponível"
        ) {

            alert(
                "API Key não disponível."
            );

            return;

        }


        await navigator.clipboard.writeText(
            valor
        );


        alert(
            "API Key copiada!"
        );

    }
    catch (erro) {

        console.error(
            "Erro ao copiar API Key:",
            erro
        );

    }

}


// =====================================================
// BOTÕES DE COPIAR
// =====================================================

function inicializarBotoesCopiar() {


    // ==========================================
    // UID
    // ==========================================

    const botaoUID =
        document.getElementById(
            "copyTutorialUidBtn"
        );


    if (botaoUID) {

        botaoUID.addEventListener(
            "click",
            copiarUID
        );

    }


    const botaoUID2 =
        document.getElementById(
            "copiarUid"
        );


    if (botaoUID2) {

        botaoUID2.addEventListener(
            "click",
            copiarUID
        );

    }


    // ==========================================
    // API KEY
    // ==========================================

    const botaoAPI =
        document.getElementById(
            "copyTutorialApiKeyBtn"
        );


    if (botaoAPI) {

        botaoAPI.addEventListener(
            "click",
            copiarAPIKey
        );

    }


    const botaoAPI2 =
        document.getElementById(
            "copiarApiKey"
        );


    if (botaoAPI2) {

        botaoAPI2.addEventListener(
            "click",
            copiarAPIKey
        );

    }

}


// =====================================================
// LOGOUT
// =====================================================

async function sairSistema() {

    try {

        await signOut(auth);

        localStorage.removeItem(
            "userData"
        );


        window.location.href =
            "/";

    }
    catch (erro) {

        console.error(
            "Erro ao sair:",
            erro
        );

    }

}


// =====================================================
// BOTÃO SAIR
// =====================================================

function inicializarLogout() {

    const botoes =
        document.querySelectorAll(
            "#logoutBtn, .logout-btn, [data-action='logout']"
        );


    botoes.forEach(
        botao => {

            botao.addEventListener(
                "click",
                function (e) {

                    e.preventDefault();

                    sairSistema();

                }
            );

        }
    );

}


// =====================================================
// FIREBASE - SESSÃO
// =====================================================

onAuthState(
    auth,
    async user => {

        if (!user) {

            console.warn(
                "Nenhum usuário conectado."
            );

            return;

        }


        console.log(
            "Sessão Firebase:",
            user.email
        );


        await carregarUsuario();

    }
);


// =====================================================
// INICIALIZAÇÃO
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        console.log(
            "MacVendas iniciado."
        );


        inicializarMenu();

        inicializarBotoesCopiar();

        inicializarLogout();


        // ==========================================
        // MOSTRAR DASHBOARD
        // ==========================================

        window.showPanel(
            "dashboard"
        );

    }
);
