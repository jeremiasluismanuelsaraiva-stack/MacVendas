// =====================================================
// MOZ TECH - CONFIGURAÇÕES
// =====================================================
(function () {
    "use strict";

    function el(id) {
        return document.getElementById(id);
    }

    // =================================================
    // TEMA
    // =================================================

    function aplicarTema(tema) {
        const finalTema = tema === "light" ? "light" : "dark";

        document.documentElement.setAttribute(
            "data-theme",
            finalTema
        );

        if (document.body) {
            document.body.classList.remove(
                "theme-dark",
                "theme-light"
            );

            document.body.classList.add(
                "theme-" + finalTema
            );
        }

        localStorage.setItem("tema", finalTema);
    }

    function carregarTema() {
        aplicarTema(
            localStorage.getItem("tema") || "dark"
        );
    }

    // =================================================
    // OBTER CONFIGURAÇÃO
    // =================================================

    async function obterConfiguracao() {

        // Garantir UID + API Key antes da chamada
        if (
            typeof window.garantirCredenciaisAPI === "function"
        ) {
            const autenticado =
                await window.garantirCredenciaisAPI();

            if (!autenticado) {
                throw new Error(
                    "Usuário não autenticado ou credenciais da API não encontradas."
                );
            }
        }

        if (
            window.MOZ_API &&
            typeof window.MOZ_API.get === "function"
        ) {
            return await window.MOZ_API.get(
                "/configuracoes"
            );
        }

        throw new Error(
            "API do sistema ainda não está disponível."
        );
    }

    // =================================================
    // CARREGAR CONFIGURAÇÕES
    // =================================================

    async function carregarConfiguracoes() {
        try {
            const json =
                await obterConfiguracao();

            if (!json || !json.success) {
                throw new Error(
                    json?.error ||
                    "Não foi possível carregar as configurações."
                );
            }

            const cfg =
                json.configuracao || {};

            const terminal =
                cfg.terminal || {};

            // =========================================
            // DADOS GERAIS
            // =========================================

            if (el("nomeEmpresa")) {
                el("nomeEmpresa").value =
                    cfg.nomeEmpresa || "";
            }

            if (el("telefone")) {
                el("telefone").value =
                    cfg.telefone || "";
            }

            if (el("email")) {
                el("email").value =
                    cfg.email || "";
            }

            if (el("moeda")) {
                el("moeda").value =
                    cfg.moeda || "MT";
            }

            if (el("vendaGB")) {
                el("vendaGB").value =
                    cfg.vendaGB ?? 28;
            }

            if (el("custoGB")) {
                el("custoGB").value =
                    cfg.custoGB ?? 21;
            }

            if (el("tema")) {
                el("tema").value =
                    cfg.tema === "light"
                        ? "light"
                        : "dark";
            }

            if (el("idioma")) {
                el("idioma").value =
                    cfg.idioma || "pt";
            }

            // =========================================
            // TERMINAL
            // =========================================

            if (el("terminalAtivo")) {
                el("terminalAtivo").checked =
                    terminal.ativo === true ||
                    terminal.ativo === "true" ||
                    terminal.ativo === 1;
            }

            if (el("terminalApi")) {
                el("terminalApi").value =
                    terminal.api || "";
            }

            if (el("terminalEndpoint")) {
                el("terminalEndpoint").value =
                    terminal.endpoint || "";
            }

            if (el("terminalMetodo")) {
                const metodo =
                    String(
                        terminal.metodo || "POST"
                    ).toUpperCase();

                el("terminalMetodo").value =
                    [
                        "GET",
                        "POST",
                        "PUT",
                        "PATCH",
                        "DELETE"
                    ].includes(metodo)
                        ? metodo
                        : "POST";
            }

            if (el("terminalToken")) {
                el("terminalToken").value =
                    terminal.token || "";
            }

            // =========================================
            // TEMA
            // =========================================

            aplicarTema(
                cfg.tema
            );

            // =========================================
            // CONFIGURAÇÃO GLOBAL DO TERMINAL
            // =========================================

            window.MOZ_TERMINAL_CONFIG =
                terminal;

            // =========================================
            // SINCRONIZAR TERMINAL
            // =========================================

            if (
                typeof window.terminalAtualizarConfiguracao ===
                "function"
            ) {
                window.terminalAtualizarConfiguracao(
                    terminal
                );
            }

            console.log(
                "[CONFIG] Configurações carregadas."
            );

            return cfg;

        } catch (erro) {

            console.error(
                "[CONFIG] Erro ao carregar:",
                erro
            );

            const area =
                el("configConteudo");

            if (
                area &&
                !area.querySelector(".config-grid")
            ) {
                area.innerHTML = `
                    <div class="message error">
                        ${String(
                            erro.message ||
                            "Erro ao carregar configurações."
                        )}
                    </div>
                `;
            }

            return null;
        }
    }

    // =================================================
    // OBTER DADOS DAS CONFIGURAÇÕES
    // =================================================

    function obterDadosConfiguracoes() {

        return {

            nomeEmpresa:
                el("nomeEmpresa")?.value?.trim() || "",

            telefone:
                el("telefone")?.value?.trim() || "",

            email:
                el("email")?.value?.trim() || "",

            moeda:
                el("moeda")?.value || "MT",

            vendaGB:
                Number(
                    el("vendaGB")?.value || 0
                ),

            custoGB:
                Number(
                    el("custoGB")?.value || 0
                ),

            tema:
                el("tema")?.value || "dark",

            idioma:
                el("idioma")?.value || "pt",

            // =========================================
            // TERMINAL VIA API
            // =========================================

            terminal: {

                ativo:
                    el("terminalAtivo")?.checked === true,

                api:
                    el("terminalApi")?.value?.trim() || "",

                endpoint:
                    el("terminalEndpoint")?.value?.trim() || "",

                metodo:
                    String(
                        el("terminalMetodo")?.value ||
                        "POST"
                    ).toUpperCase(),

                token:
                    el("terminalToken")?.value?.trim() || ""

            }
        };
    }

    // =================================================
    // VALIDAR TERMINAL
    // =================================================

    function validarTerminal(terminal) {

        if (!terminal.ativo) {
            return true;
        }

        if (!terminal.api) {

            alert(
                "Defina a API / Servidor do terminal antes de ativá-lo."
            );

            return false;
        }

        try {

            const url =
                new URL(
                    terminal.api
                );

            if (
                url.protocol !== "http:" &&
                url.protocol !== "https:"
            ) {
                throw new Error();
            }

        } catch {

            alert(
                "A API / Servidor do terminal não é uma URL válida."
            );

            return false;
        }

        if (!terminal.metodo) {

            alert(
                "Selecione o método HTTP do terminal."
            );

            return false;
        }

        return true;
    }

    // =================================================
    // SALVAR CONFIGURAÇÕES
    // =================================================

    async function salvarConfiguracoes() {

        const dados =
            obterDadosConfiguracoes();

        // =============================================
        // VALIDAR TERMINAL
        // =============================================

        if (
            !validarTerminal(
                dados.terminal
            )
        ) {
            return;
        }

        try {

            // Garantir UID + API Key antes da gravação
            if (
                typeof window.garantirCredenciaisAPI === "function"
            ) {
                const autenticado =
                    await window.garantirCredenciaisAPI();

                if (!autenticado) {
                    throw new Error(
                        "Usuário não autenticado ou credenciais da API não encontradas."
                    );
                }
            }

            aplicarTema(
                dados.tema
            );

            if (
                !window.MOZ_API ||
                typeof window.MOZ_API.put !== "function"
            ) {
                throw new Error(
                    "API do sistema ainda não está disponível."
                );
            }

            const json =
                await window.MOZ_API.put(
                    "/configuracoes",
                    dados
                );

            if (
                !json ||
                !json.success
            ) {
                throw new Error(
                    json?.error ||
                    "Erro ao guardar configurações."
                );
            }

            // =========================================
            // CONFIGURAÇÃO REALMENTE SALVA
            // =========================================

            const configuracaoSalva =
                json.configuracao || {};

            window.MOZ_TERMINAL_CONFIG =
                configuracaoSalva.terminal ||
                dados.terminal;

            if (configuracaoSalva.tema) {
                aplicarTema(configuracaoSalva.tema);
            }

            const terminalSalvo =
                window.MOZ_TERMINAL_CONFIG || {};

            // =========================================
            // SINCRONIZAR INTERFACE
            // =========================================

            if (el("terminalAtivo")) {
                el("terminalAtivo").checked =
                    terminalSalvo.ativo === true;
            }

            if (el("terminalApi")) {
                el("terminalApi").value =
                    terminalSalvo.api || "";
            }

            if (el("terminalEndpoint")) {
                el("terminalEndpoint").value =
                    terminalSalvo.endpoint || "";
            }

            if (el("terminalMetodo")) {
                el("terminalMetodo").value =
                    terminalSalvo.metodo || "POST";
            }

            if (el("terminalToken")) {
                el("terminalToken").value =
                    terminalSalvo.token || "";
            }

            // =========================================
            // SINCRONIZAR TERMINAL
            // =========================================

            if (
                typeof window.terminalAtualizarConfiguracao ===
                "function"
            ) {
                window.terminalAtualizarConfiguracao(
                    terminalSalvo
                );
            }

            alert(
                "Configurações guardadas com sucesso!"
            );

            console.log(
                "[CONFIG] Configurações guardadas."
            );

        } catch (erro) {

            console.error(
                "[CONFIG] Erro ao guardar:",
                erro
            );

            alert(
                erro.message ||
                "Erro ao guardar as configurações."
            );
        }
    }

    // =================================================
    // INICIALIZAR CONFIGURAÇÕES
    // =================================================

    function inicializarConfiguracoes() {

        carregarTema();

        // =============================================
        // TEMA
        // =============================================

        el("tema")?.addEventListener(
            "change",
            function () {

                aplicarTema(
                    this.value
                );

            }
        );

        // =============================================
        // BOTÃO GUARDAR
        // =============================================

        const btn =
            el("btnSalvarConfiguracoes");

        if (
            btn &&
            btn.dataset.configInicializado !== "true"
        ) {

            btn.dataset.configInicializado =
                "true";

            btn.addEventListener(
                "click",
                function (event) {

                    event.preventDefault();

                    salvarConfiguracoes();

                }
            );
        }

        // =============================================
        // CARREGAR
        // =============================================

        carregarConfiguracoes();
    }

    // =================================================
    // EXPORTAR
    // =================================================

    window.carregarConfiguracoes =
        carregarConfiguracoes;

    window.salvarConfiguracoes =
        salvarConfiguracoes;

    window.aplicarTema =
        aplicarTema;

    window.alterarTema =
        aplicarTema;

    window.carregarTema =
        carregarTema;

    // =================================================
    // START
    // =================================================

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            inicializarConfiguracoes,
            {
                once: true
            }
        );

    } else {

        inicializarConfiguracoes();

    }

})();
