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
    // FUNÇÃO AUXILIAR
    // =====================================================

    function el(id) {

        return document.getElementById(id);

    }


    // =====================================================
    // TEMA GLOBAL
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


        console.log(
            "[MOZ TECH] Tema aplicado:",
            tema
        );

    }


    // =====================================================
    // CARREGAR TEMA LOCAL
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
    // TEMA VINDO DA API
    // =====================================================

    async function carregarTemaAPI() {

        try {

            if (
                !window.MOZ_API ||
                typeof window.MOZ_API.get !== "function"
            ) {

                console.warn(
                    "[MOZ TECH] MOZ_API ainda não disponível."
                );

                return;

            }


            const json =
                await window.MOZ_API.get(
                    "/configuracoes"
                );


            console.log(
                "[MOZ TECH] Configurações recebidas:",
                json
            );


            if (
                !json ||
                json.success !== true
            ) {

                console.warn(
                    "[MOZ TECH] Configurações inválidas."
                );

                return;

            }


            // =================================================
            // BACKEND RETORNA:
            //
            // {
            //     success: true,
            //     configuracao: {...}
            // }
            // =================================================

            const configuracao =
                json.configuracao ||
                json.config ||
                json.data;


            if (!configuracao) {

                console.warn(
                    "[MOZ TECH] Configuração não encontrada."
                );

                return;

            }


            const tema =
                configuracao.tema === "light"
                    ? "light"
                    : "dark";


            aplicarTema(
                tema
            );


            const seletor =
                el("tema");


            if (seletor) {

                seletor.value =
                    tema;

            }


            console.log(
                "[MOZ TECH] Tema sincronizado com API:",
                tema
            );

        }
        catch (erro) {

            console.error(
                "[MOZ TECH] Erro ao carregar tema da API:",
                erro
            );

        }

    }


    // =====================================================
    // EXPORTAR TEMA
    // =====================================================

    window.aplicarTema =
        aplicarTema;


    window.carregarTemaLocal =
        carregarTemaLocal;


    window.carregarTemaAPI =
        carregarTemaAPI;


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
            else {

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

            await carregarCredenciaisTutorial();

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


            // =================================================
            // BUSCAR CONFIGURAÇÕES
            // =================================================

            const json =
                await window.MOZ_API.get(
                    "/configuracoes"
                );


            console.log(
                "[MOZ TECH] Configurações recebidas:",
                json
            );


            if (
                !json ||
                json.success !== true
            ) {

                throw new Error(
                    json?.error ||
                    "A API não retornou uma configuração válida."
                );

            }


            // =================================================
            // BACKEND ATUAL
            //
            // {
            //     success: true,
            //     configuracao: {
            //         uid: "...",
            //         apiKey: "..."
            //     }
            // }
            // =================================================

            const configuracao =
                json.configuracao ||
                json.config ||
                json.data;


            if (!configuracao) {

                throw new Error(
                    "Nenhuma configuração encontrada."
                );

            }


            // =================================================
            // UID
            // =================================================

            const uid =
                configuracao.uid ||
                configuracao.UID ||
                configuracao.userId ||
                configuracao.user_id ||
                "";


            // =================================================
            // API KEY
            // =================================================

            const apiKey =
                configuracao.apiKey ||
                configuracao.apikey ||
                configuracao.api_key ||
                configuracao.API_KEY ||
                "";


            // =================================================
            // MOSTRAR UID
            // =================================================

            if (uidElemento) {

                uidElemento.textContent =
                    uid ||
                    "UID não encontrado";

            }


            // =================================================
            // MOSTRAR API KEY
            // =================================================

            if (apiKeyElemento) {

                apiKeyElemento.textContent =
                    apiKey ||
                    "API Key não encontrada";

            }


            // =================================================
            // GUARDAR PARA OS BOTÕES DE COPIAR
            // =================================================

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
    // COPIAR UID
    // =====================================================

    window.copiarUID =
        async function () {

            const credenciais =
                window.MOZ_CREDENCIAIS_API;


            if (
                !credenciais ||
                !credenciais.uid
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


            try {

                await navigator.clipboard.writeText(
                    uid
                );


                alert(
                    "UID copiado com sucesso!"
                );

            }
            catch (erro) {

                console.error(
                    "[MOZ TECH] Erro ao copiar UID:",
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

            const credenciais =
                window.MOZ_CREDENCIAIS_API;


            if (
                !credenciais ||
                !credenciais.apiKey
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


            try {

                await navigator.clipboard.writeText(
                    apiKey
                );


                alert(
                    "API Key copiada com sucesso!"
                );

            }
            catch (erro) {

                console.error(
                    "[MOZ TECH] Erro ao copiar API Key:",
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
            // MOSTRAR ESCOLHIDO
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
            // CARREGAR DADOS
            // =================================================

            await carregarPainel(
                panelId
            );


            // =================================================
            // MOBILE
            // =================================================

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


        // =================================================
        // TEMA LOCAL
        // =================================================

        carregarTemaLocal();


        // =================================================
        // MENU
        // =================================================

        estadoInicial();

        inicializarMenu();

        inicializarBotaoMobile();

        inicializarOverlay();

        inicializarESC();

        inicializarSeletorTema();


        // =================================================
        // TEMA API
        // =================================================

        await carregarTemaAPI();


        // =================================================
        // DASHBOARD
        // =================================================

        if (
            typeof window.showPanel ===
            "function"
        ) {

            await window.showPanel(
                "dashboard"
            );

        }


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
