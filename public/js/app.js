// =====================================================
// MOZ TECH
// APP.JS
// SISTEMA DE PAINÉIS
// + MENU MOBILE
// + TEMA GLOBAL
// + CREDENCIAIS DA API
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
    // AUXILIAR
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


        if (document.body) {

            document.body.classList.remove(
                "theme-dark",
                "theme-light"
            );


            document.body.classList.add(
                "theme-" + tema
            );

        }


        localStorage.setItem(
            "tema",
            tema
        );


        const seletor =
            el("tema");


        if (seletor) {

            seletor.value =
                tema;

        }

    }


    // =====================================================
    // TEMA LOCAL
    // =====================================================

    function carregarTemaLocal() {

        const tema =
            localStorage.getItem("tema") ||
            "dark";


        aplicarTema(
            tema
        );

    }


    // =====================================================
    // TEMA API
    // =====================================================

    async function carregarTemaAPI() {

        try {

            if (
                !window.MOZ_API ||
                typeof window.MOZ_API.get !== "function"
            ) {

                return;

            }


            const json =
                await window.MOZ_API.get(
                    "/configuracoes"
                );


            if (
                !json ||
                json.success !== true
            ) {

                return;

            }


            const configuracao =
                json.configuracao ||
                json.config ||
                json.data;


            if (!configuracao) {

                return;

            }


            aplicarTema(
                configuracao.tema
            );

        }
        catch (erro) {

            console.warn(
                "[MOZ TECH] Não foi possível carregar tema da API:",
                erro.message
            );

            // IMPORTANTE:
            // erro de API NÃO impede o sistema de funcionar

        }

    }


    // =====================================================
    // MENU MOBILE
    // =====================================================

    function abrirMenuMobile() {

        const sidebar =
            el("sidebar");

        const overlay =
            el("menuOverlay");

        const botao =
            el("menuToggle");


        if (!sidebar) {

            return;

        }


        sidebar.classList.add(
            "open"
        );


        if (overlay) {

            overlay.classList.add(
                "active"
            );

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
    // ERRO DO PAINEL
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

            try {

                if (
                    typeof window.carregarTudo ===
                    "function"
                ) {

                    await window.carregarTudo();

                }
                else if (
                    typeof window.carregarDashboard ===
                    "function"
                ) {

                    await window.carregarDashboard();

                }

            }
            catch (erro) {

                console.error(
                    "[MOZ TECH] Erro Dashboard:",
                    erro
                );

            }

            return;

        }


        // =================================================
        // CRM
        // =================================================

        if (panelId === "crm") {

            try {

                if (
                    typeof window.carregarClientes ===
                    "function"
                ) {

                    await window.carregarClientes();

                }
                else {

                    mostrarErroPainel(
                        "crmConteudo",
                        "Não foi possível carregar os clientes."
                    );

                }

            }
            catch (erro) {

                console.error(
                    "[MOZ TECH] Erro CRM:",
                    erro
                );

                mostrarErroPainel(
                    "crmConteudo",
                    "Erro ao carregar clientes."
                );

            }

            return;

        }


        // =================================================
        // PACOTES
        // =================================================

        if (panelId === "pacotes") {

            try {

                if (
                    typeof window.carregarPacotes ===
                    "function"
                ) {

                    await window.carregarPacotes();

                }
                else {

                    mostrarErroPainel(
                        "pacotesConteudo",
                        "Não foi possível carregar os pacotes."
                    );

                }

            }
            catch (erro) {

                console.error(
                    "[MOZ TECH] Erro Pacotes:",
                    erro
                );

                mostrarErroPainel(
                    "pacotesConteudo",
                    "Erro ao carregar pacotes."
                );

            }

            return;

        }


        // =================================================
        // PEDIDOS
        // =================================================

        if (panelId === "pedidos") {

            try {

                if (
                    typeof window.carregarPedidos ===
                    "function"
                ) {

                    await window.carregarPedidos();

                }
                else {

                    mostrarErroPainel(
                        "pedidosConteudo",
                        "Não foi possível carregar os pedidos."
                    );

                }

            }
            catch (erro) {

                console.error(
                    "[MOZ TECH] Erro Pedidos:",
                    erro
                );

                mostrarErroPainel(
                    "pedidosConteudo",
                    "Erro ao carregar pedidos."
                );

            }

            return;

        }


        // =================================================
        // DISPOSITIVOS
        // =================================================

        if (panelId === "dispositivos") {

            try {

                if (
                    typeof window.carregarDispositivos ===
                    "function"
                ) {

                    await window.carregarDispositivos();

                }
                else {

                    mostrarErroPainel(
                        "dispositivosConteudo",
                        "Não foi possível carregar os dispositivos."
                    );

                }

            }
            catch (erro) {

                console.error(
                    "[MOZ TECH] Erro Dispositivos:",
                    erro
                );

                mostrarErroPainel(
                    "dispositivosConteudo",
                    "Erro ao carregar dispositivos."
                );

            }

            return;

        }


        // =================================================
        // CONFIGURAÇÕES
        // =================================================

        if (panelId === "config") {

            try {

                if (
                    typeof window.carregarConfiguracoes ===
                    "function"
                ) {

                    await window.carregarConfiguracoes();

                }
                else {

                    mostrarErroPainel(
                        "configConteudo",
                        "Não foi possível carregar as configurações."
                    );

                }

            }
            catch (erro) {

                console.error(
                    "[MOZ TECH] Erro Configurações:",
                    erro
                );

                mostrarErroPainel(
                    "configConteudo",
                    "Erro ao carregar configurações."
                );

            }

            return;

        }


        // =================================================
        // TUTORIAL
        // =================================================

        if (panelId === "tutorial") {

            try {

                await carregarCredenciaisTutorial();

            }
            catch (erro) {

                console.error(
                    "[MOZ TECH] Erro Tutorial:",
                    erro
                );

            }

            return;

        }

    }


    // =====================================================
    // CREDENCIAIS DA API
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

            if (
                !window.MOZ_API ||
                typeof window.MOZ_API.get !== "function"
            ) {

                throw new Error(
                    "MOZ_API não disponível."
                );

            }


            const json =
                await window.MOZ_API.get(
                    "/configuracoes"
                );


            console.log(
                "[MOZ TECH] Configurações:",
                json
            );


            if (
                !json ||
                json.success !== true
            ) {

                throw new Error(
                    json?.error ||
                    "Resposta inválida da API."
                );

            }


            const configuracao =
                json.configuracao ||
                json.config ||
                json.data;


            if (!configuracao) {

                throw new Error(
                    "Configuração não encontrada."
                );

            }


            const uid =
                configuracao.uid ||
                configuracao.UID ||
                configuracao.userId ||
                configuracao.user_id ||
                "";


            const apiKey =
                configuracao.apiKey ||
                configuracao.apikey ||
                configuracao.api_key ||
                configuracao.API_KEY ||
                "";


            if (uidElemento) {

                uidElemento.textContent =
                    uid ||
                    "UID não encontrado";

            }


            if (apiKeyElemento) {

                apiKeyElemento.textContent =
                    apiKey ||
                    "API Key não encontrada";

            }


            window.MOZ_CREDENCIAIS_API = {

                uid:
                    uid,

                apiKey:
                    apiKey

            };


            console.log(
                "[MOZ TECH] Credenciais carregadas."
            );

        }
        catch (erro) {

            console.error(
                "[MOZ TECH] Erro credenciais:",
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
    // COPIAR UID
    // =====================================================

    window.copiarUID =
        async function () {

            try {

                if (
                    !window.MOZ_CREDENCIAIS_API?.uid
                ) {

                    await carregarCredenciaisTutorial();

                }


                const uid =
                    window.MOZ_CREDENCIAIS_API?.uid;


                if (!uid) {

                    alert(
                        "UID não disponível."
                    );

                    return;

                }


                await navigator.clipboard.writeText(
                    uid
                );


                alert(
                    "UID copiado com sucesso!"
                );

            }
            catch (erro) {

                console.error(
                    "[MOZ TECH] Erro copiar UID:",
                    erro
                );


                alert(
                    "Não foi possível copiar o UID."
                );

            }

        };


    // =====================================================
    // COPIAR API KEY
    // =====================================================

    window.copiarApiKey =
        async function () {

            try {

                if (
                    !window.MOZ_CREDENCIAIS_API?.apiKey
                ) {

                    await carregarCredenciaisTutorial();

                }


                const apiKey =
                    window.MOZ_CREDENCIAIS_API?.apiKey;


                if (!apiKey) {

                    alert(
                        "API Key não disponível."
                    );

                    return;

                }


                await navigator.clipboard.writeText(
                    apiKey
                );


                alert(
                    "API Key copiada com sucesso!"
                );

            }
            catch (erro) {

                console.error(
                    "[MOZ TECH] Erro copiar API Key:",
                    erro
                );


                alert(
                    "Não foi possível copiar a API Key."
                );

            }

        };


    // =====================================================
    // MOSTRAR PAINEL
    // =====================================================

    window.showPanel =
        async function (panelId) {

            console.log(
                "[MOZ TECH] Abrindo painel:",
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
            // ESCONDER TODOS
            // =================================================

            Object.values(paineis)
                .forEach(function (id) {

                    const painel =
                        el(id);


                    if (painel) {

                        painel.style.display =
                            "none";

                    }

                });


            // =================================================
            // ABRIR PAINEL
            // =================================================

            const painel =
                el(painelId);


            if (!painel) {

                console.error(
                    "[MOZ TECH] Painel não encontrado:",
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

            try {

                await carregarPainel(
                    panelId
                );

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


    // =====================================================
    // INICIALIZAR MENU
    // =====================================================

    function inicializarMenu() {

        const botoes =
            document.querySelectorAll(
                ".menu-item[data-panel]"
            );


        console.log(
            "[MOZ TECH] Botões encontrados:",
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
                        botao.dataset.panel ||
                        botao.getAttribute(
                            "data-panel"
                        );


                    console.log(
                        "[MOZ TECH] Clique:",
                        panel
                    );


                    if (!panel) {

                        console.error(
                            "[MOZ TECH] Botão sem data-panel."
                        );

                        return;

                    }


                    // NÃO esperar aqui.
                    // Assim um erro/carregamento de outro
                    // sistema não bloqueia os botões.

                    window.showPanel(
                        panel
                    );

                }
            );

        });

    }


    // =====================================================
    // BOTÃO MENU MOBILE
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
    // SELETOR DE TEMA
    // =====================================================

    function inicializarSeletorTema() {

        const seletor =
            el("tema");


        if (!seletor) {

            return;

        }


        if (
            seletor.dataset.mozTema ===
            "true"
        ) {

            return;

        }


        seletor.dataset.mozTema =
            "true";


        seletor.addEventListener(
            "change",
            function () {

                aplicarTema(
                    this.value
                );

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
    // INICIAR SISTEMA
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


        // =================================================
        // TEMA LOCAL
        // =================================================

        carregarTemaLocal();


        // =================================================
        // ESTADO
        // =================================================

        estadoInicial();


        // =================================================
        // MENU
        // =================================================

        inicializarMenu();

        inicializarBotaoMobile();

        inicializarOverlay();

        inicializarESC();

        inicializarSeletorTema();


        // =================================================
        // TEMA API
        // =================================================
        //
        // NÃO deixar erro da API parar o sistema.
        //
        // =================================================

        carregarTemaAPI()
            .catch(function (erro) {

                console.warn(
                    "[MOZ TECH] Tema API:",
                    erro
                );

            });


        // =================================================
        // ABRIR DASHBOARD
        // =================================================

        setTimeout(function () {

            if (
                typeof window.showPanel ===
                "function"
            ) {

                window.showPanel(
                    "dashboard"
                );

            }

        }, 0);


        console.log(
            "[MOZ TECH] Sistema pronto."
        );

    }


    // =====================================================
    // EXPORTAR
    // =====================================================

    window.aplicarTema =
        aplicarTema;


    window.carregarTemaLocal =
        carregarTemaLocal;


    window.carregarTemaAPI =
        carregarTemaAPI;


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
