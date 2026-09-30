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

    let fechandoManualmente = false;


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


        const protocolo =

            window.location.protocol === "https:"

                ? "wss:"

                : "ws:";


        const base =

            protocolo +

            "//" +

            API_ORIGIN.replace(/^https?:\/\//, "");


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

        const evento = dados || {};


        /*

         * Evento principal mantido para compatibilidade

         * com dashboard, gráficos e CRM existentes.

         */

        window.dispatchEvent(

            new CustomEvent("moz:vendas", {

                detail: evento

            })

        );


        /*

         * Evento geral do sistema.

         * Usado para pedidos, vendas e outras atualizações.

         */

        window.dispatchEvent(

            new CustomEvent("moz:atualizacao", {

                detail: evento

            })

        );


        /*

         * Também publica no document para módulos que

         * estejam ouvindo document em vez de window.

         */

        document.dispatchEvent(

            new CustomEvent("moz:atualizacao", {

                detail: evento

            })

        );


        /*

         * Evento específico de pedidos.

         */

        if (

            evento.tipo === "pedidos" ||

            evento.entidade === "pedido"

        ) {

            window.dispatchEvent(

                new CustomEvent("moz:pedidos", {

                    detail: evento

                })

            );


            document.dispatchEvent(

                new CustomEvent("moz:pedidos", {

                    detail: evento

                })

            );

        }


        /*

         * Evento específico de vendas/compras.

         */

        if (

            evento.tipo === "vendas" ||

            evento.tipo === "venda" ||

            evento.entidade === "compra"

        ) {

            window.dispatchEvent(

                new CustomEvent("moz:venda-atualizada", {

                    detail: evento

                })

            );


            document.dispatchEvent(

                new CustomEvent("moz:venda-atualizada", {

                    detail: evento

                })

            );

        }

    }


    function atualizarModulosPorPedido(dados) {

        if (

            !dados ||

            (

                dados.tipo !== "pedidos" &&

                dados.entidade !== "pedido"

            )

        ) {

            return;

        }


        /*

         * O evento não altera diretamente os dados internos

         * dos módulos. Ele apenas avisa cada módulo para

         * recarregar os dados necessários.

         */


        window.dispatchEvent(

            new CustomEvent("moz:pedido-atualizado", {

                detail: dados

            })

        );


        document.dispatchEvent(

            new CustomEvent("moz:pedido-atualizado", {

                detail: dados

            })

        );


        console.log(

            "[WEBSOCKET] Pedido atualizado:",

            dados.acao || "atualização",

            dados.pedido?.id || ""

        );

    }


    function atualizarModulosPorVenda(dados) {

        if (

            !dados ||

            (

                dados.tipo !== "vendas" &&

                dados.tipo !== "venda" &&

                dados.entidade !== "compra"

            )

        ) {

            return;

        }


        window.dispatchEvent(

            new CustomEvent("moz:venda-atualizada", {

                detail: dados

            })

        );


        document.dispatchEvent(

            new CustomEvent("moz:venda-atualizada", {

                detail: dados

            })

        );

    }


    function agendarReconexao() {

        if (reconectarTimer || fechandoManualmente) {

            return;

        }


        const atraso = Math.min(

            30000,

            Math.max(

                1000,

                1000 * Math.pow(2, tentativa)

            )

        );


        tentativa++;


        reconectarTimer = setTimeout(() => {

            reconectarTimer = null;

            conectar();

        }, atraso);

    }


    function conectar() {

        limparTimers();

        fechandoManualmente = false;


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


            socket = null;

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


                atualizarModulosPorPedido(dados);

                atualizarModulosPorVenda(dados);


                if (

                    dados.tipo === "pedidos" ||

                    dados.entidade === "pedido"

                ) {

                    console.log(

                        "[WEBSOCKET] Evento de pedido:",

                        dados.acao || "atualização",

                        dados.pedido?.id || ""

                    );

                }


                if (

                    dados.tipo === "vendas" ||

                    dados.tipo === "venda"

                ) {

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

        if (iniciado) {

            return;

        }


        iniciado = true;


        setTimeout(conectar, 800);


        window.addEventListener(

            "storage",

            (event) => {

                if (

                    event.key === "apiKey" ||

                    event.key === "api_key" ||

                    event.key === "moz_api_key"

                ) {

                    tentativa = 0;

                    fechandoManualmente = false;


                    if (socket) {

                        try {

                            socket.close();

                        } catch (_) {}

                    }


                    socket = null;


                    setTimeout(

                        conectar,

                        200

                    );

                }

            }

        );

    }


    window.MOZ_WEBSOCKET_VENDAS = {

        conectar,


        fechar: function () {

            fechandoManualmente = true;


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


    if (

        document.readyState === "loading"

    ) {

        document.addEventListener(

            "DOMContentLoaded",

            iniciar,

            { once: true }

        );

    } else {

        iniciar();

    }

})();
