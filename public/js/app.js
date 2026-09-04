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


        console.log(
            "[MOZ TECH] Tema:",
            tema
        );

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

                console.warn(
                    "[MOZ TECH] MOZ_API ainda não disponível."
                );

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

        }
        catch (erro) {

            console.warn(
                "[MOZ TECH] Não foi possível carregar tema da API:",
                erro.message
            );

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

    async function carregarPainel(
        panelId
    ) {

        console.log(
            "[MOZ TECH] Carregando painel:",
            panelId
        );


        // =================================================
        // DASHBOARD
        // =================================================

        if (
            panelId === "dashboard"
        ) {

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

        if (
            panelId === "crm"
        ) {

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

        if (
            panelId === "pacotes"
        ) {

            if (
                typeof window.carregarPacotes ===
                "function"
            ) {

                try {

                    await window.carregarPacotes();

                }
                catch (erro) {

                    console.error(
                        "[MOZ TECH] Erro pacotes:",
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

        if (
            panelId === "pedidos"
        ) {

            if (
                typeof window.carregarPedidos ===
                "function"
            ) {

                try {

                    await window.carregarPedidos();

                }
                catch (erro) {

                    console.error(
                        "[MOZ TECH] Erro pedidos:",
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

        if (
            panelId === "dispositivos"
        ) {

            if (
                typeof window.carregarDispositivos ===
                "function"
            ) {

                try {

                    await window.carregarDispositivos();

                }
                catch (erro) {

                    console.error(
                        "[MOZ TECH] Erro dispositivos:",
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

        if (
            panelId === "config"
        ) {

            if (
                typeof window.carregarConfiguracoes ===
                "function"
            ) {

                try {

                    await window.carregarConfiguracoes();

                }
                catch (erro) {

                    console.error(
                        "[MOZ TECH] Erro configurações:",
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

        if (
            panelId === "tutorial"
        ) {

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

            // =================================================
            // 1. VERIFICAR CREDENCIAIS JÁ SALVAS
            // =================================================

            let credenciais = null;


            if (
                window.MOZ_API &&
                typeof window.MOZ_API.obterCredenciais ===
                "function"
            ) {

                credenciais =
                    window.MOZ_API.obterCredenciais();

            }


            if (
                credenciais &&
                credenciais.uid &&
                credenciais.apiKey
            ) {

                mostrarCredenciais(
                    credenciais.uid,
                    credenciais.apiKey
                );

                return;

            }


            // =================================================
            // 2. API DISPONÍVEL?
            // =================================================

            if (
                !window.MOZ_API ||
                typeof window.MOZ_API.get !==
                "function"
            ) {

                throw new Error(
                    "MOZ_API não disponível."
                );

            }


            // =================================================
            // 3. BUSCAR CONFIGURAÇÃO
            // =================================================

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


            // =================================================
            // 4. CONFIGURAÇÃO
            // =================================================

            const configuracao =
                json.configuracao ||
                json.config ||
                json.data;


            if (!configuracao) {

                throw new Error(
                    "Configuração não encontrada."
                );

            }


            // =================================================
            // 5. UID
            // =================================================

            const uid =
                configuracao.uid ||
                configuracao.UID ||
                configuracao.userId ||
                configuracao.user_id ||
                "";


            // =================================================
            // 6. API KEY
            // =================================================

            const apiKey =
                configuracao.apiKey ||
                configuracao.apikey ||
                configuracao.api_key ||
                configuracao.API_KEY ||
                "";


            if (!uid) {

                throw new Error(
                    "UID não encontrado."
                );

            }


            if (!apiKey) {

                throw new Error(
                    "API Key não encontrada."
                );

            }


            // =================================================
            // 7. GUARDAR CREDENCIAIS
            // =================================================

            if (
                window.MOZ_API &&
                typeof window.MOZ_API.definirCredenciais ===
                "function"
            ) {

                window.MOZ_API.definirCredenciais(
                    uid,
                    apiKey
                );

            }


            // =================================================
            // 8. MOSTRAR
            // =================================================

            mostrarCredenciais(
                uid,
                apiKey
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
    // MOSTRAR CREDENCIAIS
    // =====================================================

    function mostrarCredenciais(
        uid,
        apiKey
    ) {

        const uidElemento =
            el("tutorialUid");

        const apiKeyElemento =
            el("tutorialApiKey");


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
                uid || "",

            apiKey:
                apiKey || ""

        };


        console.log(
            "[MOZ TECH] Credenciais mostradas."
        );

    }


    // =====================================================
    // COPIAR UID
    // =====================================================

    window.copiarUID =
        async function () {

            try {

                let credenciais =
                    window.MOZ_CREDENCIAIS_API;


                if (
                    !credenciais ||
                    !credenciais.uid
                ) {

                    await carregarCredenciaisTutorial();

                    credenciais =
                        window.MOZ_CREDENCIAIS_API;

                }


                const uid =
                    credenciais?.uid;


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

                let credenciais =
                    window.MOZ_CREDENCIAIS_API;


                if (
                    !credenciais ||
                    !credenciais.apiKey
                ) {

                    await carregarCredenciaisTutorial();

                    credenciais =
                        window.MOZ_CREDENCIAIS_API;

                }


                const apiKey =
                    credenciais?.apiKey;


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
            // MOSTRAR PAINEL
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
            // CARREGAR DADOS
            // =================================================

            await carregarPainel(
                panelId
            );


            // =================================================
            // FECHAR MENU MOBILE
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
                async function (event) {

                    event.preventDefault();

                    event.stopPropagation();


                    const panel =
                        botao.getAttribute(
                            "data-panel"
                        );


                    console.log(
                        "[MOZ TECH] Botão clicado:",
                        panel
                    );


                    if (!panel) {

                        console.error(
                            "[MOZ TECH] Botão sem data-panel."
                        );

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
    // SELETOR TEMA
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


        if (document.body) {

            document.body.classList.remove(
                "menu-open"
            );

        }

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
        //
        // NÃO deixar erro da API bloquear os botões.
        //
        // =================================================

        try {

            await carregarTemaAPI();

        }
        catch (erro) {

            console.warn(
                "[MOZ TECH] Tema API ignorado:",
                erro
            );

        }


        // =================================================
        // DASHBOARD
        // =================================================

        try {

            await window.showPanel(
                "dashboard"
            );

        }
        catch (erro) {

            console.error(
                "[MOZ TECH] Erro ao abrir dashboard:",
                erro
            );

        }


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
