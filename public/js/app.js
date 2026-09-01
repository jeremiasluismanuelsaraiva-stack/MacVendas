// =====================================================
// MOZ TECH
// APP.JS
// SISTEMA DE PAINÉIS + MENU MOBILE
// VERSÃO CORRIGIDA
// =====================================================

(function () {

    "use strict";


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
    // ELEMENTOS
    // =====================================================

    function el(id) {

        return document.getElementById(id);

    }


    // =====================================================
    // MENU MOBILE
    // =====================================================

    function abrirMenuMobile() {

        const sidebar = el("sidebar");
        const overlay = el("menuOverlay");
        const botao = el("menuToggle");

        if (!sidebar) {
            return;
        }

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

    }


    function fecharMenuMobile() {

        const sidebar = el("sidebar");
        const overlay = el("menuOverlay");
        const botao = el("menuToggle");

        if (sidebar) {
            sidebar.classList.remove("open");
        }

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

    }


    function alternarMenuMobile() {

        const sidebar = el("sidebar");

        if (!sidebar) {
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


    // =====================================================
    // CARREGAR PAINEL
    // =====================================================

    async function carregarPainel(panelId) {

        console.log(
            "[MOZ TECH] Carregando painel:",
            panelId
        );


        // =================================================
        // DASHBOARD
        // =================================================

        if (panelId === "dashboard") {

            if (
                typeof window.carregarTudo ===
                "function"
            ) {

                try {

                    await window.carregarTudo();

                }
                catch (erro) {

                    console.error(
                        "[MOZ TECH] Erro ao carregar dashboard:",
                        erro
                    );

                }

            }

            else if (
                typeof window.carregarDashboard ===
                "function"
            ) {

                try {

                    await window.carregarDashboard();

                }
                catch (erro) {

                    console.error(
                        "[MOZ TECH] Erro dashboard:",
                        erro
                    );

                }

            }
            else {

                console.warn(
                    "[MOZ TECH] carregarDashboard ainda não disponível."
                );

            }

            return;

        }


        // =================================================
        // CRM
        // =================================================

        if (panelId === "crm") {

            if (
                typeof window.carregarClientes ===
                "function"
            ) {

                try {

                    await window.carregarClientes();

                }
                catch (erro) {

                    console.error(
                        "[MOZ TECH] Erro CRM:",
                        erro
                    );

                }

            }
            else {

                console.error(
                    "[MOZ TECH] carregarClientes() não existe."
                );

                mostrarErroPainel(
                    "crmConteudo",
                    "Não foi possível carregar os clientes."
                );

            }

            return;

        }


        // =================================================
        // PACOTES
        // =================================================

        if (panelId === "pacotes") {

            if (
                typeof window.carregarPacotes ===
                "function"
            ) {

                try {

                    await window.carregarPacotes();

                }
                catch (erro) {

                    console.error(
                        "[MOZ TECH] Erro Pacotes:",
                        erro
                    );

                }

            }
            else {

                console.error(
                    "[MOZ TECH] carregarPacotes() não existe."
                );

                mostrarErroPainel(
                    "pacotesConteudo",
                    "Não foi possível carregar os pacotes."
                );

            }

            return;

        }


        // =================================================
        // PEDIDOS
        // =================================================

        if (panelId === "pedidos") {

            if (
                typeof window.carregarPedidos ===
                "function"
            ) {

                try {

                    await window.carregarPedidos();

                }
                catch (erro) {

                    console.error(
                        "[MOZ TECH] Erro Pedidos:",
                        erro
                    );

                }

            }
            else {

                console.error(
                    "[MOZ TECH] carregarPedidos() não existe."
                );

                mostrarErroPainel(
                    "pedidosConteudo",
                    "Não foi possível carregar os pedidos."
                );

            }

            return;

        }


        // =================================================
        // DISPOSITIVOS
        // =================================================

        if (panelId === "dispositivos") {

            if (
                typeof window.carregarDispositivos ===
                "function"
            ) {

                try {

                    await window.carregarDispositivos();

                }
                catch (erro) {

                    console.error(
                        "[MOZ TECH] Erro Dispositivos:",
                        erro
                    );

                }

            }
            else {

                console.error(
                    "[MOZ TECH] carregarDispositivos() não existe."
                );

                mostrarErroPainel(
                    "dispositivosConteudo",
                    "Não foi possível carregar os dispositivos."
                );

            }

            return;

        }


        // =================================================
        // CONFIGURAÇÕES
        // =================================================

        if (panelId === "config") {

            if (
                typeof window.carregarConfiguracoes ===
                "function"
            ) {

                try {

                    await window.carregarConfiguracoes();

                }
                catch (erro) {

                    console.error(
                        "[MOZ TECH] Erro Configurações:",
                        erro
                    );

                }

            }
            else {

                console.error(
                    "[MOZ TECH] carregarConfiguracoes() não existe."
                );

                mostrarErroPainel(
                    "configConteudo",
                    "Não foi possível carregar as configurações."
                );

            }

            return;

        }


        // =================================================
        // TUTORIAL
        // =================================================

        if (panelId === "tutorial") {

            carregarCredenciaisTutorial();

            return;

        }

    }


    // =====================================================
    // MOSTRAR ERRO
    // =====================================================

    function mostrarErroPainel(id, mensagem) {

        const elemento = el(id);

        if (!elemento) {
            return;
        }

        elemento.innerHTML = `

            <div style="
                padding:20px;
                border:1px solid var(--border-color);
                border-radius:10px;
                color:var(--text-secondary);
            ">

                <i class="fas fa-triangle-exclamation"></i>

                ${mensagem}

            </div>

        `;

    }


    // =====================================================
    // CREDENCIAIS DA API
    // =====================================================

    async function carregarCredenciaisTutorial() {

        const uid = el("tutorialUid");
        const apiKey = el("tutorialApiKey");

        if (!uid && !apiKey) {
            return;
        }


        if (uid) {
            uid.textContent = "Carregando...";
        }

        if (apiKey) {
            apiKey.textContent = "Carregando...";
        }


        try {

            console.log(
                "[MOZ TECH] Buscando credenciais da API..."
            );


            const resposta = await fetch(
                "/api/configuracoes",
                {

                    method: "GET",

                    headers: {
                        "Accept":
                            "application/json"
                    },

                    cache: "no-store"

                }
            );


            console.log(
                "[MOZ TECH] Credenciais HTTP:",
                resposta.status
            );


            if (!resposta.ok) {

                throw new Error(
                    "HTTP " +
                    resposta.status
                );

            }


            const json =
                await resposta.json();


            console.log(
                "[MOZ TECH] Configurações:",
                json
            );


            const dados =
                json.configuracoes ||
                json.config ||
                json.data ||
                json;


            const valorUID =

                dados?.uid ||
                dados?.UID ||
                dados?.userId ||
                dados?.user_id ||
                "";


            const valorApiKey =

                dados?.apiKey ||
                dados?.apikey ||
                dados?.api_key ||
                dados?.API_KEY ||
                "";


            if (uid) {

                uid.textContent =
                    valorUID ||
                    "UID não encontrado";

            }


            if (apiKey) {

                apiKey.textContent =
                    valorApiKey ||
                    "API Key não encontrada";

            }


        }
        catch (erro) {

            console.error(
                "[MOZ TECH] Erro ao carregar credenciais:",
                erro
            );


            if (uid) {

                uid.textContent =
                    "Erro ao carregar";

            }


            if (apiKey) {

                apiKey.textContent =
                    "Erro ao carregar";

            }

        }

    }


    // =====================================================
    // MOSTRAR PAINEL
    // =====================================================

    window.showPanel = async function (panelId) {

        console.log(
            "[MOZ TECH] Abrindo:",
            panelId
        );


        const painelId =
            paineis[panelId];


        if (!painelId) {

            console.error(
                "[MOZ TECH] Painel inválido:",
                panelId
            );

            return;

        }


        // =================================================
        // ESCONDER TODOS OS PAINÉIS
        // =================================================

        Object.values(paineis)
            .forEach(function (id) {

                const painel = el(id);

                if (painel) {

                    painel.style.display =
                        "none";

                }

            });


        // =================================================
        // MOSTRAR PAINEL ESCOLHIDO
        // =================================================

        const painel =
            el(painelId);


        if (!painel) {

            console.error(
                "[MOZ TECH] Elemento não encontrado:",
                painelId
            );

            return;

        }


        painel.style.display =
            "block";


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


        const itemAtivo =
            document.querySelector(
                '.menu-item[data-panel="' +
                panelId +
                '"]'
            );


        if (itemAtivo) {

            itemAtivo.classList.add(
                "active"
            );

        }


        // =================================================
        // CARREGAR CONTEÚDO
        // =================================================

        await carregarPainel(
            panelId
        );


        // =================================================
        // FECHAR MENU NO MOBILE
        // =================================================

        if (
            window.innerWidth <= 768
        ) {

            fecharMenuMobile();

        }

    };


    // =====================================================
    // INICIALIZAR MENU
    // =====================================================

    function inicializarMenu() {

        const botoes =
            document.querySelectorAll(
                ".menu-item[data-panel]"
            );


        console.log(
            "[MOZ TECH] Menus encontrados:",
            botoes.length
        );


        botoes.forEach(function (botao) {

            if (
                botao.dataset.mozAppMenu ===
                "true"
            ) {

                return;

            }


            botao.dataset.mozAppMenu =
                "true";


            botao.addEventListener(
                "click",
                function (event) {

                    event.preventDefault();
                    event.stopPropagation();


                    const panel =
                        botao.getAttribute(
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
    // BOTÃO MOBILE
    // =====================================================

    function inicializarBotaoMobile() {

        const botao =
            el("menuToggle");


        if (!botao) {

            console.warn(
                "[MOZ TECH] #menuToggle não encontrado."
            );

            return;

        }


        if (
            botao.dataset.mozAppBotao ===
            "true"
        ) {

            return;

        }


        botao.dataset.mozAppBotao =
            "true";


        botao.addEventListener(
            "click",
            function (event) {

                event.preventDefault();
                event.stopPropagation();

                alternarMenuMobile();

            }
        );

    }


    // =====================================================
    // OVERLAY
    // =====================================================

    function inicializarOverlay() {

        const overlay =
            el("menuOverlay");


        if (!overlay) {
            return;
        }


        if (
            overlay.dataset.mozAppOverlay ===
            "true"
        ) {

            return;

        }


        overlay.dataset.mozAppOverlay =
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


    // =====================================================
    // ESC
    // =====================================================

    function inicializarESC() {

        if (
            window.__mozAppESC
        ) {

            return;

        }


        window.__mozAppESC =
            true;


        document.addEventListener(
            "keydown",
            function (event) {

                if (
                    event.key ===
                    "Escape"
                ) {

                    fecharMenuMobile();

                }

            }
        );

    }


    // =====================================================
    // ESTADO INICIAL
    // =====================================================

    function estadoInicial() {

        const sidebar =
            el("sidebar");

        const overlay =
            el("menuOverlay");

        const botao =
            el("menuToggle");


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

    }


    // =====================================================
    // INICIAR
    // =====================================================

    async function iniciarSistema() {

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


        inicializarBotaoMobile();


        inicializarOverlay();


        inicializarESC();


        // =================================================
        // ABRIR DASHBOARD
        // =================================================

        await window.showPanel(
            "dashboard"
        );


        console.log(
            "[MOZ TECH] Sistema pronto."
        );

    }


    // =====================================================
    // EXPORTAR
    // =====================================================

    window.abrirMenuMobile =
        abrirMenuMobile;


    window.fecharMenuMobile =
        fecharMenuMobile;


    window.alternarMenuMobile =
        alternarMenuMobile;


    window.carregarCredenciaisTutorial =
        carregarCredenciaisTutorial;


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


})();
