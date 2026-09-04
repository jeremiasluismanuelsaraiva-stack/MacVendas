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


        // =================================================
        // HTML
        // =================================================

        document.documentElement.setAttribute(
            "data-theme",
            tema
        );


        // =================================================
        // BODY
        // =================================================

        if (document.body) {

            document.body.classList.remove(
                "theme-dark",
                "theme-light"
            );


            document.body.classList.add(
                "theme-" + tema
            );

        }


        // =================================================
        // SALVAR LOCALMENTE
        // =================================================

        try {

            localStorage.setItem(
                "tema",
                tema
            );

        }
        catch (erro) {

            console.warn(
                "[MOZ TECH] Não foi possível salvar tema local:",
                erro
            );

        }


        // =================================================
        // SINCRONIZAR SELECTOR
        // =================================================

        const seletor =
            el("tema");


        if (seletor) {

            seletor.value =
                tema;

        }


        console.log(
            "[MOZ TECH] Tema aplicado:",
            tema
        );

    }


    // =====================================================
    // CARREGAR TEMA LOCAL
    // =====================================================

    function carregarTemaLocal() {

        let tema =
            "dark";


        try {

            tema =
                localStorage.getItem("tema") ||
                "dark";

        }
        catch (erro) {

            console.warn(
                "[MOZ TECH] Erro ao ler tema local:",
                erro
            );

        }


        aplicarTema(
            tema
        );

    }


    // =====================================================
    // TEMA VINDO DA API
    // =====================================================

    async function carregarTemaAPI() {

        try {

            // =================================================
            // VERIFICAR MOZ_API
            // =================================================

            if (
                !window.MOZ_API ||
                typeof window.MOZ_API.get !== "function"
            ) {

                console.warn(
                    "[MOZ TECH] MOZ_API ainda não disponível."
                );

                return;

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


            // =================================================
            // VERIFICAR RESPOSTA
            // =================================================

            if (
                !json ||
                json.success !== true
            ) {

                console.warn(
                    "[MOZ TECH] Configurações não disponíveis:",
                    json
                );

                return;

            }


            // =================================================
            // OBTER CONFIGURAÇÃO
            // =================================================
            //
            // O backend atual retorna:
            //
            // {
            //     success: true,
            //     configuracao: {...}
            // }
            //
            // Também deixamos compatibilidade com:
            //
            // configuracoes
            // config
            // data
            //
            // =================================================

            let configuracao =
                null;


            if (
                json.configuracao
            ) {

                configuracao =
                    json.configuracao;

            }
            else if (
                Array.isArray(
                    json.configuracoes
                ) &&
                json.configuracoes.length
            ) {

                configuracao =
                    json.configuracoes[0];

            }
            else if (
                json.config
            ) {

                configuracao =
                    json.config;

            }
            else if (
                json.data
            ) {

                configuracao =
                    json.data;

            }


            // =================================================
            // VERIFICAR CONFIGURAÇÃO
            // =================================================

            if (
                !configuracao
            ) {

                console.warn(
                    "[MOZ TECH] Nenhuma configuração encontrada."
                );

                return;

            }


            // =================================================
            // TEMA
            // =================================================

            const tema =
                String(
                    configuracao.tema ||
                    "dark"
                )
                .toLowerCase()
                .trim() === "light"
                    ? "light"
                    : "dark";


            aplicarTema(
                tema
            );


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


        if (document.body) {

            document.body.classList.add(
                "menu-open"
            );

        }

    }


    // =====================================================
    // FECHAR MENU MOBILE
    // =====================================================

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


        if (document.body) {

            document.body.classList.remove(
                "menu-open"
            );

        }

    }


    // =====================================================
    // ALTERNAR MENU
    // =====================================================

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

        if (
            panelId === "tutorial"
        ) {

            await carregarCredenciaisTutorial();

            return;

        }

    }


    // =====================================================
    // OBTER CONFIGURAÇÃO DA API
    // =====================================================

    async function obterConfiguracaoAPI() {

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
            "[MOZ TECH] Resposta /configuracoes:",
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
        // =================================================

        if (
            json.configuracao
        ) {

            return json.configuracao;

        }


        // =================================================
        // COMPATIBILIDADE
        // =================================================

        if (
            Array.isArray(
                json.configuracoes
            ) &&
            json.configuracoes.length
        ) {

            return json.configuracoes[0];

        }


        if (
            json.config
        ) {

            return json.config;

        }


        if (
            json.data
        ) {

            return json.data;

        }


        throw new Error(
            "Nenhuma configuração encontrada."
        );

    }


    // =====================================================
    // CREDENCIAIS DA API
    // =====================================================

    async function carregarCredenciaisTutorial() {

        const uidElemento =
            el("tutorialUid");


        const apiKeyElemento =
            el("tutorialApiKey");


        // =================================================
        // SE NÃO EXISTIREM OS ELEMENTOS
        // =================================================

        if (
            !uidElemento &&
            !apiKeyElemento
        ) {

            return;

        }


        // =================================================
        // ESTADO INICIAL
        // =================================================

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
            // BUSCAR CONFIGURAÇÃO
            // =================================================

            const configuracao =
                await obterConfiguracaoAPI();


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
            // SALVAR PARA USO DO TUTORIAL
            // =================================================

            window.MOZ_CREDENCIAIS = {

                uid,

                apiKey

            };


            console.log(
                "[MOZ TECH] Credenciais carregadas:",
                {
                    uid: uid ? "OK" : "VAZIO",
                    apiKey: apiKey ? "OK" : "VAZIO"
                }
            );


            // =================================================
            // ATUALIZAR CÓDIGOS DO TUTORIAL
            // =================================================

            atualizarCodigoTutorial(
                uid,
                apiKey
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
    // ATUALIZAR CÓDIGO DO TUTORIAL
    // =====================================================

    function atualizarCodigoTutorial(
        uid,
        apiKey
    ) {

        // =================================================
        // CÓDIGOS
        // =================================================

        const blocos =
            document.querySelectorAll(
                "pre code"
            );


        if (!blocos.length) {

            return;

        }


        blocos.forEach(function (bloco) {

            let codigo =
                bloco.textContent;


            if (!codigo) {

                return;

            }


            codigo =
                codigo.replace(
                    /SEU_UID/g,
                    uid || "SEU_UID"
                );


            codigo =
                codigo.replace(
                    /SUA_API_KEY/g,
                    apiKey || "SUA_API_KEY"
                );


            bloco.textContent =
                codigo;

        });

    }


    // =====================================================
    // COPIAR UID
    // =====================================================

    async function copiarUID() {

        try {

            const configuracao =
                await obterConfiguracaoAPI();


            const uid =
                configuracao.uid ||
                configuracao.UID ||
                configuracao.userId ||
                configuracao.user_id ||
                "";


            if (!uid) {

                throw new Error(
                    "UID não encontrado."
                );

            }


            await navigator.clipboard.writeText(
                uid
            );


            console.log(
                "[MOZ TECH] UID copiado."
            );


            mostrarMensagemCopia(
                "UID copiado com sucesso!"
            );

        }
        catch (erro) {

            console.error(
                "[MOZ TECH] Erro ao copiar UID:",
                erro
            );


            mostrarMensagemCopia(
                "Não foi possível copiar o UID."
            );

        }

    }


    // =====================================================
    // COPIAR API KEY
    // =====================================================

    async function copiarApiKey() {

        try {

            const configuracao =
                await obterConfiguracaoAPI();


            const apiKey =
                configuracao.apiKey ||
                configuracao.apikey ||
                configuracao.api_key ||
                configuracao.API_KEY ||
                "";


            if (!apiKey) {

                throw new Error(
                    "API Key não encontrada."
                );

            }


            await navigator.clipboard.writeText(
                apiKey
            );


            console.log(
                "[MOZ TECH] API Key copiada."
            );


            mostrarMensagemCopia(
                "API Key copiada com sucesso!"
            );

        }
        catch (erro) {

            console.error(
                "[MOZ TECH] Erro ao copiar API Key:",
                erro
            );


            mostrarMensagemCopia(
                "Não foi possível copiar a API Key."
            );

        }

    }


    // =====================================================
    // MENSAGEM DE CÓPIA
    // =====================================================

    function mostrarMensagemCopia(
        mensagem
    ) {

        console.log(
            "[MOZ TECH]",
            mensagem
        );


        // =================================================
        // TOAST EXISTENTE
        // =================================================

        const toast =
            el("mozToast");


        if (toast) {

            toast.textContent =
                mensagem;


            toast.classList.add(
                "show"
            );


            setTimeout(
                function () {

                    toast.classList.remove(
                        "show"
                    );

                },
                2000
            );


            return;

        }


        // =================================================
        // ALERTA SIMPLES
        // =================================================

        alert(
            mensagem
        );

    }


    // =====================================================
    // EXPORTAR CREDENCIAIS
    // =====================================================

    window.carregarCredenciaisTutorial =
        carregarCredenciaisTutorial;


    window.copiarUID =
        copiarUID;


    window.copiarApiKey =
        copiarApiKey;


    // =====================================================
    // MOSTRAR PAINEL
    // =====================================================

    window.showPanel =
        async function (panelId) {

            console.log(
                "[MOZ TECH] Abrindo:",
                panelId
            );


            // =================================================
            // VERIFICAR PAINEL
            // =================================================

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

            Object.values(
                paineis
            )
            .forEach(
                function (id) {

                    const painel =
                        el(id);


                    if (painel) {

                        painel.style.display =
                            "none";

                    }

                }
            );


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
                .forEach(
                    function (item) {

                        item.classList.remove(
                            "active"
                        );

                    }
                );


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
    // MENU
    // =====================================================

    function inicializarMenu() {

        const botoes =
            document.querySelectorAll(
                ".menu-item[data-panel]"
            );


        botoes.forEach(
            function (botao) {

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

            }
        );

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
            async function () {

                const tema =
                    this.value;


                aplicarTema(
                    tema
                );


                // =================================================
                // SALVAR TEMA NA API
                // =================================================

                try {

                    if (
                        !window.MOZ_API ||
                        typeof window.MOZ_API.put !==
                        "function"
                    ) {

                        return;

                    }


                    await window.MOZ_API.put(
                        "/configuracoes",
                        {
                            tema: tema
                        }
                    );


                    console.log(
                        "[MOZ TECH] Tema salvo na API:",
                        tema
                    );

                }
                catch (erro) {

                    console.error(
                        "[MOZ TECH] Erro ao salvar tema:",
                        erro
                    );

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


            const icon =
                botao.querySelector("i");


            if (icon) {

                icon.className =
                    "fas fa-bars";

            }

        }


        if (document.body) {

            document.body.classList.remove(
                "menu-open"
            );

        }

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
        // TEMA LOCAL PRIMEIRO
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
        // TEMA DA API
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
    // EXPORTAR MENU
    // =====================================================

    window.abrirMenuMobile =
        abrirMenuMobile;


    window.fecharMenuMobile =
        fecharMenuMobile;


    window.alternarMenuMobile =
        alternarMenuMobile;


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
