// =====================================================
// WEBSOCKET DE VENDAS — MACVENDAS / MOZ TECH
// =====================================================

(function () {
    "use strict";

    let socket = null;
    let reconectarTimer = null;
    let pingTimer = null;
    let tentativa = 0;
    let iniciado = false;

    const API_ORIGIN = "http://br1.bronxyshost.com:4234";

    function obterApiKey() {
        const credenciais = window.MOZ_CREDENCIAIS_API || {};

        return String(
            credenciais.apiKey ||
            localStorage.getItem("apiKey") ||
            localStorage.getItem("api_key") ||
            localStorage.getItem("moz_api_key") ||
            ""
        ).trim();
    }

    function obterUrlWebSocket() {
        const apiKey = obterApiKey();

        if (!apiKey) {
            return "";
        }

        // Se o backend tiver TLS, use wss://.
        // Em HTTP comum, ws://.
        const protocolo =
            window.location.protocol === "https:"
                ? "wss:"
                : "ws:";

        // Quando o dashboard estiver hospedado no próprio backend,
        // usamos o host atual. Caso esteja no Vercel/HTML separado,
        // usamos diretamente o servidor MacVendas.
        let base = "";

        if (
            window.location.hostname === "br1.bronxyshost.com" &&
            window.location.port === "4234"
        ) {
            base = `${protocolo}//br1.bronxyshost.com:4234`;
        } else {
            base = `${protocolo}//br1.bronxyshost.com:4234`;
        }

        return (
            base +
            "/vendas/ws?apiKey=" +
            encodeURIComponent(apiKey)
        );
    }

    function limparTimers() {
        if (reconectarTimer) {
            clearTimeout(reconectarTimer);
            reconectarTimer = null;
        }

        if (pingTimer) {
            clearInterval(pingTimer);
            pingTimer = null;
        }
    }

    function publicarEvento(dados) {
        window.dispatchEvent(
            new CustomEvent(
                "moz:vendas",
                {
                    detail: dados || {}
                }
            )
        );
    }

    function agendarReconexao() {
        if (reconectarTimer) return;

        const atraso = Math.min(
            30000,
            Math.max(1000, 1000 * Math.pow(2, tentativa))
        );

        tentativa++;

        reconectarTimer = setTimeout(() => {
            reconectarTimer = null;
            conectar();
        }, atraso);
    }

    function conectar() {
        limparTimers();

        const url = obterUrlWebSocket();

        if (!url) {
            agendarReconexao();
            return;
        }

        try {
            socket = new WebSocket(url);
        } catch (erro) {
            console.warn(
                "[WEBSOCKET] Não foi possível abrir conexão:",
                erro.message
            );

            agendarReconexao();
            return;
        }

        socket.addEventListener("open", () => {
            tentativa = 0;

            console.log(
                "[WEBSOCKET] Vendas conectado."
            );

            publicarEvento({
                tipo: "connected"
            });

            pingTimer = setInterval(() => {
                if (
                    socket &&
                    socket.readyState === WebSocket.OPEN
                ) {
                    try {
                        socket.send(
                            JSON.stringify({
                                tipo: "ping"
                            })
                        );
                    } catch (_) {}
                }
            }, 25000);
        });

        socket.addEventListener("message", (event) => {
            try {
                const dados =
                    JSON.parse(event.data);

                publicarEvento(dados);

                if (dados.tipo === "vendas") {
                    console.log(
                        "[WEBSOCKET] Nova alteração de vendas:",
                        dados.acao || "atualização"
                    );
                }
            } catch (erro) {
                console.warn(
                    "[WEBSOCKET] Mensagem inválida:",
                    erro.message
                );
            }
        });

        socket.addEventListener("error", () => {
            console.warn(
                "[WEBSOCKET] Erro na conexão."
            );
        });

        socket.addEventListener("close", () => {
            console.warn(
                "[WEBSOCKET] Conexão fechada. Reconectando..."
            );

            socket = null;
            limparTimers();
            publicarEvento({
                tipo: "disconnected"
            });

            agendarReconexao();
        });
    }

    function iniciar() {
        if (iniciado) return;

        iniciado = true;

        // Aguarda a API carregar credenciais.
        setTimeout(conectar, 800);

        window.addEventListener(
            "storage",
            (event) => {
                if (
                    event.key === "apiKey" ||
                    event.key === "moz_api_key"
                ) {
                    tentativa = 0;

                    if (socket) {
                        try {
                            socket.close();
                        } catch (_) {}
                    }

                    setTimeout(conectar, 200);
                }
            }
        );
    }

    window.MOZ_WEBSOCKET_VENDAS = {
        conectar,
        fechar: function () {
            limparTimers();

            if (socket) {
                try {
                    socket.close();
                } catch (_) {}
            }

            socket = null;
        },
        estado: function () {
            return socket
                ? socket.readyState
                : WebSocket.CLOSED;
        }
    };

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            iniciar,
            { once: true }
        );
    } else {
        iniciar();
    }
})();
