// =====================================================
// MOZ TECH - TERMINAL WEB SOCKET
// =====================================================
(function () {
    "use strict";

    let socket = null;
    let configAtual = {};

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

    function status(texto, online) {
        const node = el("terminalStatus");
        if (!node) return;
        node.classList.toggle("online", !!online);
        node.classList.toggle("offline", !online);
        node.textContent = online ? "● " + texto : "● " + texto;
    }

    function atualizarHostInfo() {
        const node = el("terminalHostInfo");
        if (!node) return;
        if (!configAtual.host) {
            node.textContent = "Servidor não configurado.";
            return;
        }
        node.textContent = `${configAtual.protocolo || "wss"}://${configAtual.host}:${configAtual.porta || 8080}`;
    }

    function atualizarBotoes(conectado) {
        if (el("btnTerminalExecutar")) el("btnTerminalExecutar").disabled = !conectado;
        if (el("terminalCommand")) el("terminalCommand").disabled = !conectado;
        if (el("btnTerminalParar")) el("btnTerminalParar").disabled = !conectado;
    }

    function fecharSocket(mensagem) {
        if (socket) {
            try { socket.close(); } catch (_) {}
            socket = null;
        }
        atualizarBotoes(false);
        status(mensagem || "Desconectado", false);
    }

    function conectarTerminal() {
        if (!configAtual || configAtual.ativo !== true) {
            adicionarLinha("Terminal está desativado nas Configurações.", "error");
            status("Desativado", false);
            return;
        }

        if (!configAtual.host || !configAtual.token) {
            adicionarLinha("Configure Host e Token em Configurações → Terminal.", "error");
            return;
        }

        if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
            return;
        }

        const protocolo = configAtual.protocolo === "ws" ? "ws" : "wss";
        const url = `${protocolo}://${configAtual.host}:${Number(configAtual.porta || 8080)}`;

        adicionarLinha(`Conectando a ${url} ...`, "info");
        status("Conectando...", false);

        try {
            socket = new WebSocket(url);
        } catch (erro) {
            adicionarLinha("Erro ao criar conexão: " + erro.message, "error");
            fecharSocket("Erro de conexão");
            return;
        }

        socket.addEventListener("open", function () {
            status("Conectando...", false);
            socket.send(JSON.stringify({ type: "auth", token: configAtual.token }));
        });

        socket.addEventListener("message", function (event) {
            let msg;
            try { msg = JSON.parse(event.data); } catch (_) {
                adicionarLinha(event.data, "normal");
                return;
            }

            if (msg.type === "auth") {
                if (msg.ok) {
                    status("Conectado", true);
                    atualizarBotoes(true);
                    adicionarLinha("Conexão autenticada.", "success");
                } else {
                    adicionarLinha(msg.message || "Token inválido.", "error");
                    fecharSocket("Autenticação recusada");
                }
                return;
            }

            if (msg.type === "status") {
                if (msg.online !== false) status("Conectado", true);
                if (msg.data) {
                    const d = msg.data;
                    const info = `Servidor: ${d.hostname || "-"} | CPU: ${d.cpuPercent ?? "-"}% | RAM: ${d.memoryUsedMB ?? "-"}/${d.memoryTotalMB ?? "-"} MB | Uptime: ${d.uptime || "-"}`;
                    atualizarHostInfo();
                    if (el("terminalHostInfo")) el("terminalHostInfo").textContent = info;
                }
                return;
            }

            if (msg.type === "output") {
                adicionarLinha(msg.data || "", msg.stream === "stderr" ? "error" : "normal");
                return;
            }

            if (msg.type === "system") {
                adicionarLinha(msg.message || "", msg.level || "info");
                return;
            }

            if (msg.type === "exit") {
                adicionarLinha(`Processo terminou com código ${msg.code ?? "?"}.`, msg.code === 0 ? "success" : "error");
                return;
            }

            if (msg.type === "error") {
                adicionarLinha(msg.message || "Erro no terminal.", "error");
            }
        });

        socket.addEventListener("close", function () {
            atualizarBotoes(false);
            status("Desconectado", false);
            adicionarLinha("Conexão encerrada.", "info");
            socket = null;
        });

        socket.addEventListener("error", function () {
            adicionarLinha("Falha na conexão WebSocket. Verifique Host, porta, protocolo, firewall e serviço do terminal.", "error");
            status("Erro", false);
        });
    }

    function executarComando() {
        const input = el("terminalCommand");
        const comando = input?.value?.trim();
        if (!comando || !socket || socket.readyState !== WebSocket.OPEN) return;
        socket.send(JSON.stringify({ type: "command", command: comando }));
        adicionarLinha("$ " + comando, "command");
        input.value = "";
    }

    function interromper() {
        if (!socket || socket.readyState !== WebSocket.OPEN) return;
        socket.send(JSON.stringify({ type: "interrupt" }));
    }

    function limpar() {
        const output = el("terminalOutput");
        if (output) output.innerHTML = "";
    }

    function atualizarConfiguracao(cfg) {
        configAtual = {
            ativo: cfg?.ativo === true,
            host: String(cfg?.host || "").trim(),
            porta: Number(cfg?.porta || 8080),
            protocolo: cfg?.protocolo === "ws" ? "ws" : "wss",
            token: String(cfg?.token || "").trim()
        };
        atualizarHostInfo();
        if (configAtual.ativo !== true && socket) fecharSocket("Desativado");
    }

    function inicializar() {
        el("btnTerminalConectar")?.addEventListener("click", conectarTerminal);
        el("btnTerminalExecutar")?.addEventListener("click", executarComando);
        el("btnTerminalParar")?.addEventListener("click", interromper);
        el("btnTerminalLimpar")?.addEventListener("click", limpar);
        el("terminalCommand")?.addEventListener("keydown", function (e) {
            if (e.key === "Enter") executarComando();
        });
        atualizarBotoes(false);
        atualizarHostInfo();
    }

    window.terminalAtualizarConfiguracao = atualizarConfiguracao;
    window.terminalConectar = conectarTerminal;
    window.terminalDesconectar = () => fecharSocket("Desconectado");

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", inicializar, { once: true });
    } else {
        inicializar();
    }
})();
