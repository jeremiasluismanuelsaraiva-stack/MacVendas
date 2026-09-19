// =====================================================
// MOZ TECH - TERMINAL VIA API
// =====================================================
// A API é definida em:
// Configurações -> Terminal
//
// O navegador nunca chama a API externa diretamente.
// Ele chama:
//   /api/terminal/exec
//
// O backend encaminha a requisição para a API configurada.
// =====================================================

(function () {
    "use strict";

    let configAtual = {};
    let conectado = false;
    let executando = false;

    const el = id => document.getElementById(id);

    function adicionarLinha(texto, tipo = "normal") {
        const output = el("terminalOutput");
        if (!output) return;

        const linha = document.createElement("div");
        linha.className = "terminal-line terminal-" + tipo;
        linha.textContent = String(texto ?? "");

        output.appendChild(linha);
        output.scrollTop = output.scrollHeight;
    }

    function adicionarResultado(resultado) {
        if (resultado === undefined || resultado === null) {
            adicionarLinha("(sem resposta)", "info");
            return;
        }

        if (typeof resultado === "string") {
            adicionarLinha(resultado, "normal");
            return;
        }

        try {
            adicionarLinha(
                JSON.stringify(resultado, null, 2),
                "normal"
            );
        } catch (_) {
            adicionarLinha(String(resultado), "normal");
        }
    }

    function status(texto, online) {
        const node = el("terminalStatus");
        if (!node) return;

        node.classList.toggle("online", !!online);
        node.classList.toggle("offline", !online);
        node.textContent = "● " + texto;
    }

    function atualizarHostInfo() {
        const node = el("terminalHostInfo");
        if (!node) return;

        if (!configAtual.api) {
            node.textContent = "API não configurada.";
            return;
        }

        const api = configAtual.api.replace(/\/+$/, "");
        const endpoint = String(
            configAtual.endpoint || ""
        ).replace(/^\/+/, "");

        node.textContent =
            endpoint
                ? `${api}/${endpoint}`
                : api;
    }

    function atualizarBotoes() {
        const podeExecutar =
            conectado &&
            !executando;

        if (el("btnTerminalExecutar")) {
            el("btnTerminalExecutar").disabled =
                !podeExecutar;
        }

        if (el("terminalCommand")) {
            el("terminalCommand").disabled =
                !conectado;
        }

        if (el("btnTerminalParar")) {
            el("btnTerminalParar").disabled =
                !executando;
        }

        if (el("btnTerminalConectar")) {
            el("btnTerminalConectar").disabled =
                executando;
        }
    }

    function atualizarConfiguracao(cfg) {
        configAtual = {
            ativo:
                cfg?.ativo === true ||
                cfg?.ativo === "true" ||
                cfg?.ativo === 1,

            api:
                String(cfg?.api || "").trim(),

            endpoint:
                String(cfg?.endpoint || "").trim(),

            metodo:
                String(
                    cfg?.metodo || "POST"
                ).toUpperCase(),

            token:
                String(cfg?.token || "").trim()
        };

        atualizarHostInfo();

        if (!configAtual.ativo) {
            conectado = false;
            status("Desativado", false);
        }

        atualizarBotoes();
    }

    async function carregarConfiguracao() {
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

            if (!json?.success) return;

            atualizarConfiguracao(
                json.configuracao?.terminal || {}
            );
        } catch (erro) {
            console.warn(
                "[TERMINAL] Configuração:",
                erro
            );
        }
    }

    async function conectarTerminal() {
        if (!configAtual.ativo) {
            adicionarLinha(
                "Ative o terminal em Configurações → Terminal.",
                "error"
            );
            status("Desativado", false);
            return;
        }

        if (!configAtual.api) {
            adicionarLinha(
                "Configure a API em Configurações → Terminal.",
                "error"
            );
            status("API não configurada", false);
            return;
        }

        conectado = true;

        status("Pronto", true);

        adicionarLinha(
            "Terminal conectado à API.",
            "success"
        );

        adicionarLinha(
            `API: ${configAtual.api}`,
            "info"
        );

        if (configAtual.endpoint) {
            adicionarLinha(
                `Endpoint: ${configAtual.endpoint}`,
                "info"
            );
        }

        adicionarLinha(
            `Método: ${configAtual.metodo}`,
            "info"
        );

        atualizarBotoes();

        if (el("terminalCommand")) {
            el("terminalCommand").focus();
        }
    }

    async function executarComando() {
        if (!conectado) {
            adicionarLinha(
                "Conecte o terminal primeiro.",
                "error"
            );
            return;
        }

        const input = el("terminalCommand");
        const comando =
            input?.value?.trim() || "";

        if (!comando) return;

        if (
            !window.MOZ_API ||
            typeof window.MOZ_API.post !== "function"
        ) {
            adicionarLinha(
                "API do MOZ TECH ainda não está disponível.",
                "error"
            );
            return;
        }

        executando = true;
        atualizarBotoes();

        adicionarLinha(
            "$ " + comando,
            "command"
        );

        input.value = "";

        try {
            const resposta =
                await window.MOZ_API.post(
                    "/terminal/exec",
                    {
                        command: comando
                    }
                );

            if (!resposta) {
                adicionarLinha(
                    "A API não retornou resposta.",
                    "error"
                );
                return;
            }

            if (resposta.success) {
                adicionarResultado(
                    resposta.resultado
                );
            } else {
                adicionarLinha(
                    resposta.error ||
                    resposta.erro ||
                    "A API recusou a requisição.",
                    "error"
                );

                if (resposta.resultado !== undefined) {
                    adicionarResultado(
                        resposta.resultado
                    );
                }
            }
        } catch (erro) {
            console.error(
                "[TERMINAL] Execução:",
                erro
            );

            adicionarLinha(
                erro?.message ||
                "Erro ao executar requisição.",
                "error"
            );
        } finally {
            executando = false;
            atualizarBotoes();

            if (input) {
                input.focus();
            }
        }
    }

    function interromper() {
        /*
         * A API HTTP não mantém uma sessão de shell.
         * Portanto Ctrl+C apenas informa que a requisição
         * atual não pode ser interrompida pelo navegador.
         */
        adicionarLinha(
            "Ctrl+C não está disponível para esta requisição HTTP.",
            "info"
        );
    }

    function limpar() {
        const output =
            el("terminalOutput");

        if (output) {
            output.innerHTML = "";
        }
    }

    function inicializar() {
        el("btnTerminalConectar")
            ?.addEventListener(
                "click",
                conectarTerminal
            );

        el("btnTerminalExecutar")
            ?.addEventListener(
                "click",
                executarComando
            );

        el("btnTerminalParar")
            ?.addEventListener(
                "click",
                interromper
            );

        el("btnTerminalLimpar")
            ?.addEventListener(
                "click",
                limpar
            );

        el("terminalCommand")
            ?.addEventListener(
                "keydown",
                function (e) {
                    if (e.key === "Enter") {
                        e.preventDefault();
                        executarComando();
                    }
                }
            );

        atualizarBotoes();
        atualizarHostInfo();
        carregarConfiguracao();
    }

    window.terminalAtualizarConfiguracao =
        atualizarConfiguracao;

    window.terminalConectar =
        conectarTerminal;

    window.terminalDesconectar =
        function () {
            conectado = false;
            executando = false;
            status(
                "Desconectado",
                false
            );
            atualizarBotoes();
        };

    if (
        document.readyState ===
        "loading"
    ) {
        document.addEventListener(
            "DOMContentLoaded",
            inicializar,
            { once: true }
        );
    } else {
        inicializar();
    }
})();
