"use strict";

// =====================================================
// MOZ TECH
// APP.JS
// SISTEMA DE PAINÉIS
// + MENU MOBILE
// + TEMA GLOBAL
// + CREDENCIAIS VINDAS DO FIREBASE
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
    // CREDENCIAIS DA API — FIREBASE
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
                typeof window.obterDadosUsuario !==
                "function"
            ) {

                throw new Error(
                    "firebase.js não foi carregado."
                );

            }


            const dados =
                await window.obterDadosUsuario();


            if (!dados) {

                throw new Error(
                    "Nenhum usuário autenticado."
                );

            }


            const uid =
                String(
                    dados.uid || ""
                ).trim();


            const apiKey =
                String(
                    dados.apiKey || ""
                ).trim();


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


            // =================================================
            // DEFINIR CREDENCIAIS NA API
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
            else {

                window.MOZ_CREDENCIAIS_API = {

                    uid:
                        uid,

                    apiKey:
                        apiKey

                };

            }


            // =================================================
            // LOCAL STORAGE
            // =================================================

            if (uid) {

                localStorage.setItem(
                    "uid",
                    uid
                );

            }


            if (apiKey) {

                localStorage.setItem(
                    "apiKey",
                    apiKey
                );

            }


            console.log(
                "[MOZ TECH] Credenciais obtidas diretamente do Firebase."
            );

            console.log(
                "[MOZ TECH] UID:",
                uid
            );

            console.log(
                "[MOZ TECH] API Key encontrada:",
                !!apiKey
            );

        }
        catch (erro) {

            console.error(
                "[MOZ TECH] Erro ao buscar credenciais do Firebase:",
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


            window.MOZ_CREDENCIAIS_API = {

                uid:
                    "",

                apiKey:
                    ""

            };

        }

    }


    // =====================================================
    // COPIAR UID
    // =====================================================

    window.copiarUID =
        async function () {

            try {

                if (
                    typeof window.obterDadosUsuario !==
                    "function"
                ) {

                    throw new Error(
                        "firebase.js não foi carregado."
                    );

                }


                const dados =
                    await window.obterDadosUsuario();


                const uid =
                    String(
                        dados?.uid || ""
                    ).trim();


                if (!uid) {

                    alert(
                        "UID não disponível."
                    );

                    return;

                }


                window.MOZ_CREDENCIAIS_API = {

                    ...(window.MOZ_CREDENCIAIS_API || {}),

                    uid:
                        uid

                };


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
                    typeof window.obterDadosUsuario !==
                    "function"
                ) {

                    throw new Error(
                        "firebase.js não foi carregado."
                    );

                }


                const dados =
                    await window.obterDadosUsuario();


                const apiKey =
                    String(
                        dados?.apiKey || ""
                    ).trim();


                if (!apiKey) {

                    alert(
                        "API Key não disponível."
                    );

                    return;

                }


                window.MOZ_CREDENCIAIS_API = {

                    ...(window.MOZ_CREDENCIAIS_API || {}),

                    apiKey:
                        apiKey

                };


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


            Object.values(paineis)
                .forEach(function (id) {

                    const painel =
                        el(id);


                    if (painel) {

                        painel.style.display =
                            "none";

                    }

                });


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


                    if (!panel) {

                        console.error(
                            "[MOZ TECH] Botão sem data-panel."
                        );

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


        carregarTemaLocal();

        estadoInicial();

        inicializarMenu();

        inicializarBotaoMobile();

        inicializarOverlay();

        inicializarESC();

        inicializarSeletorTema();


        // =================================================
        // CARREGAR CREDENCIAIS PRIMEIRO
        // =================================================
        //
        // Isto garante que:
        //
        // MOZ_API
        //
        // já possui UID + API KEY antes
        // de carregar o Dashboard.
        //
        // =================================================

        try {

            await carregarCredenciaisTutorial();

        }
        catch (erro) {

            console.warn(
                "[MOZ TECH] Credenciais:",
                erro
            );

        }


        // =================================================
        // TEMA API
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
