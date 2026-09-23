// =====================================================
// MOZ TECH - TERMINAL VIA API
// =====================================================
(function () {
    "use strict";

    let configAtual = {};
    let executando = false;

    const el = id => document.getElementById(id);


    // =====================================================
    // SAÍDA DO TERMINAL
    // =====================================================

    function adicionarLinha(texto, tipo = "normal") {

        const output =
            el("terminalOutput");

        if (!output) return;

        const linha =
            document.createElement("div");

        linha.className =
            "terminal-line terminal-" + tipo;

        linha.textContent =
            String(texto ?? "");

        output.appendChild(linha);

        output.scrollTop =
            output.scrollHeight;
    }


    // =====================================================
    // STATUS
    // =====================================================

    function atualizarStatus(texto, online = false) {

        const node =
            el("terminalStatus");

        if (!node) return;

        node.classList.toggle(
            "online",
            online === true
        );

        node.classList.toggle(
            "offline",
            online !== true
        );

        node.textContent =
            "● " + texto;
    }


    // =====================================================
    // INFORMAÇÕES DA API
    // =====================================================

    function atualizarHostInfo() {

        const node =
            el("terminalHostInfo");

        if (!node) return;


        if (!configAtual.api) {

            node.textContent =
                "API não configurada.";

            return;

        }


        node.textContent =
            `${configAtual.api}${configAtual.endpoint || ""}`;
    }


    // =====================================================
    // BOTÕES
    // =====================================================

    function atualizarBotoes(conectado) {

        const executar =
            el("btnTerminalExecutar");

        const comando =
            el("terminalCommand");

        const parar =
            el("btnTerminalParar");

        if (executar) {

            executar.disabled =
                !conectado;

        }

        if (comando) {

            comando.disabled =
                !conectado;

        }

        if (parar) {

            parar.disabled =
                !executando;

        }

    }


    // =====================================================
    // CONFIGURAÇÃO
    // =====================================================

    function atualizarConfiguracao(cfg) {

        configAtual = {

            ativo:
                cfg?.ativo === true ||
                cfg?.ativo === "true" ||
                cfg?.ativo === 1,

            api:
                String(
                    cfg?.api || ""
                ).trim(),

            endpoint:
                String(
                    cfg?.endpoint || ""
                ).trim(),

            metodo:
                String(
                    cfg?.metodo || "POST"
                )
                .trim()
                .toUpperCase(),

            token:
                String(
                    cfg?.token || ""
                ).trim()

        };


        atualizarHostInfo();


        if (!configAtual.ativo) {

            atualizarStatus(
                "Desativado",
                false
            );

            atualizarBotoes(false);

        }

    }


    // =====================================================
    // CARREGAR CONFIGURAÇÃO
    // =====================================================

    async function carregarConfiguracao() {

        try {

            if (
                typeof window.garantirCredenciaisAPI ===
                "function"
            ) {
                await window.garantirCredenciaisAPI();
            }

            if (
                !window.MOZ_API ||
                typeof window.MOZ_API.get !== "function"
            ) {

                throw new Error(
                    "API do sistema ainda não está disponível."
                );

            }


            const resposta =
                await window.MOZ_API.get(
                    "/configuracoes"
                );


            if (
                !resposta ||
                !resposta.success
            ) {

                throw new Error(
                    resposta?.error ||
                    "Não foi possível carregar a configuração."
                );

            }


            const terminal =
                resposta
                    .configuracao
                    ?.terminal || {};


            atualizarConfiguracao(
                terminal
            );


            console.log(
                "[TERMINAL] Configuração carregada:",
                configAtual
            );


            return true;

        }
        catch (erro) {

            console.error(
                "[TERMINAL] Erro ao carregar configuração:",
                erro
            );

            adicionarLinha(
                erro.message ||
                "Erro ao carregar configuração.",
                "error"
            );

            return false;

        }

    }


    // =====================================================
    // CONECTAR / TESTAR API
    // =====================================================

    async function conectarTerminal() {

        const carregou =
            await carregarConfiguracao();


        if (!carregou) {

            atualizarStatus(
                "Erro",
                false
            );

            return;

        }


        if (!configAtual.ativo) {

            atualizarStatus(
                "Desativado",
                false
            );

            adicionarLinha(
                "Terminal está desativado nas Configurações.",
                "error"
            );

            atualizarBotoes(false);

            return;

        }


        if (!configAtual.api) {

            atualizarStatus(
                "API não configurada",
                false
            );

            adicionarLinha(
                "Configure a API / Servidor do terminal.",
                "error"
            );

            return;

        }


        adicionarLinha(
            `Testando API: ${configAtual.api}`,
            "info"
        );


        atualizarStatus(
            "Conectando...",
            false
        );


        try {

            const resposta =
                await window.MOZ_API.get(
                    "/terminal/status"
                );


            if (
                resposta &&
                resposta.success
            ) {

                atualizarStatus(
                    "Conectado",
                    true
                );


                atualizarBotoes(true);


                adicionarLinha(
                    `API conectada. HTTP ${resposta.status ?? 200}`,
                    "success"
                );


                if (
                    resposta.resultado !==
                    undefined
                ) {

                    mostrarResultado(
                        resposta.resultado
                    );

                }

            }
            else {

                atualizarStatus(
                    "Erro",
                    false
                );


                atualizarBotoes(false);


                adicionarLinha(
                    resposta?.erro ||
                    "A API não respondeu corretamente.",
                    "error"
                );

            }

        }
        catch (erro) {

            atualizarStatus(
                "Erro",
                false
            );


            atualizarBotoes(false);


            adicionarLinha(
                "Erro de conexão: " +
                (
                    erro.message ||
                    erro
                ),
                "error"
            );

        }

    }


    // =====================================================
    // MOSTRAR RESULTADO
    // =====================================================

    function mostrarResultado(resultado) {

        if (
            resultado ===
            undefined ||
            resultado ===
            null
        ) {

            return;

        }


        if (
            typeof resultado ===
            "string"
        ) {

            adicionarLinha(
                resultado,
                "normal"
            );

            return;

        }


        try {

            adicionarLinha(
                JSON.stringify(
                    resultado,
                    null,
                    2
                ),
                "normal"
            );

        }
        catch {

            adicionarLinha(
                String(resultado),
                "normal"
            );

        }

    }


    // =====================================================
    // EXECUTAR COMANDO
    // =====================================================

    async function executarComando() {

        if (executando) {

            adicionarLinha(
                "Já existe um comando sendo executado.",
                "error"
            );

            return;

        }


        const input =
            el("terminalCommand");


        const comando =
            input?.value?.trim();


        if (!comando) {

            return;

        }


        if (!configAtual.ativo) {

            adicionarLinha(
                "Terminal está desativado.",
                "error"
            );

            return;

        }


        if (!configAtual.api) {

            adicionarLinha(
                "API do terminal não configurada.",
                "error"
            );

            return;

        }


        executando = true;

        atualizarBotoes(true);


        adicionarLinha(
            "$ " + comando,
            "command"
        );


        try {

            const resposta =
                await window.MOZ_API.post(
                    "/terminal/exec",
                    {
                        command:
                            comando
                    }
                );


            if (
                resposta &&
                resposta.success
            ) {

                mostrarResultado(
                    resposta.resultado
                );

            }
            else {

                adicionarLinha(
                    resposta?.erro ||
                    "Erro ao executar comando.",
                    "error"
                );

            }

        }
        catch (erro) {

            adicionarLinha(
                "Erro: " +
                (
                    erro.message ||
                    erro
                ),
                "error"
            );

        }
        finally {

            executando = false;

            if (input) {

                input.value = "";

            }


            atualizarBotoes(
                configAtual.ativo
            );

        }

    }


    // =====================================================
    // PARAR
    // =====================================================

    function interromper() {

        if (!executando) {

            adicionarLinha(
                "Nenhum comando está sendo executado.",
                "info"
            );

            return;

        }


        adicionarLinha(
            "O comando atual não possui cancelamento HTTP configurado.",
            "info"
        );

    }


    // =====================================================
    // LIMPAR
    // =====================================================

    function limpar() {

        const output =
            el("terminalOutput");

        if (output) {

            output.innerHTML =
                "";

        }

    }


    // =====================================================
    // INICIALIZAR
    // =====================================================

    function inicializar() {

        el(
            "btnTerminalConectar"
        )?.addEventListener(
            "click",
            conectarTerminal
        );


        el(
            "btnTerminalExecutar"
        )?.addEventListener(
            "click",
            executarComando
        );


        el(
            "btnTerminalParar"
        )?.addEventListener(
            "click",
            interromper
        );


        el(
            "btnTerminalLimpar"
        )?.addEventListener(
            "click",
            limpar
        );


        el(
            "terminalCommand"
        )?.addEventListener(
            "keydown",
            function (e) {

                if (
                    e.key === "Enter"
                ) {

                    e.preventDefault();

                    executarComando();

                }

            }
        );


        atualizarBotoes(
            false
        );


        atualizarHostInfo();


        if (
            typeof window.garantirCredenciaisAPI ===
            "function"
        ) {

            window.garantirCredenciaisAPI()
                .then(
                    () => carregarConfiguracao()
                )
                .catch(
                    erro => {

                        console.error(
                            "[TERMINAL] Erro ao preparar sessão:",
                            erro
                        );

                    }
                );

        }

        else {

            carregarConfiguracao();

        }

    }


    // =====================================================
    // FUNÇÕES GLOBAIS
    // =====================================================

    window.terminalAtualizarConfiguracao =
        atualizarConfiguracao;


    window.terminalConectar =
        conectarTerminal;


    window.terminalDesconectar =
        function () {

            atualizarBotoes(false);

            atualizarStatus(
                "Desconectado",
                false
            );

        };


    // =====================================================
    // START
    // =====================================================

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            inicializar,
            {
                once: true
            }
        );

    }
    else {

        inicializar();

    }

})();
