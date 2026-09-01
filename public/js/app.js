// =====================================================
// MOZ TECH
// APP.JS
// SISTEMA DE PAINÉIS + MENU MOBILE
// + TEMA
// + CREDENCIAIS FIREBASE
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
    // FUNÇÃO AUXILIAR
    // =====================================================

    function el(id) {

        return document.getElementById(id);

    }


    // =====================================================
    // TEMA
    // =====================================================

    function aplicarTema(tema) {

        tema =
            String(tema || "dark")
                .toLowerCase()
                .trim();


        if (
            tema !== "light" &&
            tema !== "dark"
        ) {

            tema = "dark";

        }


        document.documentElement.setAttribute(
            "data-theme",
            tema
        );


        document.body.classList.remove(
            "theme-dark",
            "theme-light"
        );


        document.body.classList.add(
            "theme-" + tema
        );


        localStorage.setItem(
            "tema",
            tema
        );


        console.log(
            "[MOZ TECH] Tema aplicado:",
            tema
        );

    }


    function carregarTemaLocal() {

        const tema =
            localStorage.getItem("tema") ||
            "dark";


        aplicarTema(tema);

    }


    window.aplicarTema =
        aplicarTema;


    window.carregarTemaLocal =
        carregarTemaLocal;


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

            const icon =
                botao.querySelector("i");

            if (icon) {

                icon.className =
                    "fas fa-xmark";

            }

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


            const icon =
                botao.querySelector("i");

            if (icon) {

                icon.className =
                    "fas fa-bars";

            }

        }


        document.body.classList.remove(
            "menu-open"
        );

    }


    function alternarMenuMobile() {

        const sidebar =
            el("sidebar");


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
    // MOSTRAR ERRO
    // =====================================================

    function mostrarErroPainel(
        id,
        mensagem
    ) {

        const elemento =
            el(id);


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
                        "[MOZ TECH] Erro dashboard:",
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

            return;

        }


        // =================================================
        // TUTORIAL
        // =================================================

        if (panelId === "tutorial") {

            await carregarCredenciaisTutorial();

            return;

        }

    }


    // =====================================================
    // CREDENCIAIS DO FIREBASE
    // =====================================================

    async function carregarCredenciaisTutorial() {

        const uidElemento =
            el("tutorialUid");


        const apiKeyElemento =
            el("tutorialApiKey");


        if (
            !uidElemento &&
            !apiKeyElemento
        ) {

            return;

        }


        if (uidElemento) {

            uidElemento.textContent =
                "Carregando...";

        }


        if (apiKeyElemento) {

            apiKeyElemento.textContent =
                "Carregando...";

        }


        try {

            console.log(
                "[MOZ TECH] Buscando usuário Firebase..."
            );


            // =================================================
            // VERIFICAR FIREBASE
            // =================================================

            if (
                typeof window.obterDadosUsuario !==
                "function"
            ) {

                throw new Error(
                    "obterDadosUsuario() não está disponível."
                );

            }


            const dados =
                await window.obterDadosUsuario();


            console.log(
                "[MOZ TECH] Dados do usuário:",
                dados
            );


            if (!dados) {

                throw new Error(
                    "Usuário não autenticado."
                );

            }


            // =================================================
            // UID
            // =================================================

            if (uidElemento) {

                uidElemento.textContent =
                    dados.uid ||
                    "UID não encontrado";

            }


            // =================================================
            // API KEY
            // =================================================

            if (apiKeyElemento) {

                apiKeyElemento.textContent =
                    dados.apiKey ||
                    "API Key não encontrada";

            }


        }
        catch (erro) {

            console.error(
                "[MOZ TECH] Erro ao carregar credenciais:",
                erro
            );


            if (uidElemento) {

                uidElemento.textContent =
                    "Erro ao carregar";

            }


            if (apiKeyElemento) {

                apiKeyElemento.textContent =
                    "Erro ao carregar";

            }

        }

    }


    // =====================================================
    // MOSTRAR PAINEL
    // =====================================================

    window.showPanel =
        async function (panelId) {

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


            // =============================================
            // ESCONDER TODOS
            // =============================================

            Object.values(paineis)
                .forEach(function (id) {

                    const painel =
                        el(id);


                    if (painel) {

                        painel.style.display =
                            "none";

                    }

                });


            // =============================================
            // MOSTRAR ESCOLHIDO
            // =============================================

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


            // =============================================
            // CARREGAR
            // =============================================

            await carregarPainel(
                panelId
            );


            // =============================================
            // MOBILE
            // =============================================

            if (
                window.innerWidth <= 768
            ) {

                fecharMenuMobile();

            }

        };


    // =====================================================
    // MENU
    // =====================================================

    function inicializarMenu() {

        const botoes =
            document.querySelectorAll(
                ".menu-item[data-panel]"
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
                async function (event) {

                    event.preventDefault();
                    event.stopPropagation();


                    const panel =
                        botao.getAttribute(
                            "data-panel"
                        );


                    if (!panel) {
                        return;
                    }


                    await window.showPanel(
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
            function () {

                fecharMenuMobile();

            }
        );

    }


    // =====================================================
    // ESC
    // =====================================================

    function inicializarESC() {

        if (window.__mozAppESC) {
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


        // =============================================
        // TEMA PRIMEIRO
        // =============================================

        carregarTemaLocal();


        // =============================================
        // MENU
        // =============================================

        estadoInicial();

        inicializarMenu();

        inicializarBotaoMobile();

        inicializarOverlay();

        inicializarESC();


        // =============================================
        // DASHBOARD
        // =============================================

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
