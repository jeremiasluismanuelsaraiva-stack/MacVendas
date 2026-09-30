// =====================================================

// MOZ TECH - TERMINAL VIA API

// =====================================================

(function () {

    "use strict";


    let configAtual = {};

    let executando = false;
    let socketTerminal = null;
    let timerReconexao = null;
    let reconectando = false;
    let conexaoManual = false;


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
        const carregou = await carregarConfiguracao();

        if (!carregou) {
            atualizarStatus("Erro", false);
            return;
        }

        if (!configAtual.ativo) {
            atualizarStatus("Desativado", false);
            adicionarLinha("Terminal está desativado nas Configurações.", "error");
            atualizarBotoes(false);
            return;
        }

        if (!configAtual.api) {
            atualizarStatus("API não configurada", false);
            adicionarLinha("Configure a API / Servidor do terminal.", "error");
            atualizarBotoes(false);
            return;
        }

        desconectarSocket(false);
        conexaoManual = false;

        const urlBase = String(configAtual.api).trim().replace(/\/$/, "");
        let wsUrl;

        try {
            const parsed = new URL(urlBase);
            parsed.protocol = parsed.protocol === "https:" ? "wss:" : "ws:";
            wsUrl = parsed.toString().replace(/\/$/, "");
        } catch (_) {
            atualizarStatus("Erro", false);
            adicionarLinha("URL da API do terminal inválida.", "error");
            atualizarBotoes(false);
            return;
        }

        adicionarLinha(`Conectando ao Terminal: ${wsUrl}`, "info");
        atualizarStatus("Conectando...", false);

        if (!configAtual.token) {
            adicionarLinha("Token do Terminal não configurado.", "error");
            atualizarStatus("Token não configurado", false);
            atualizarBotoes(false);
            return;
        }

        try {
            socketTerminal = new WebSocket(wsUrl);

            socketTerminal.addEventListener("open", () => {
                adicionarLinha("WebSocket conectado. Autenticando...", "info");
                socketTerminal.send(JSON.stringify({
                    type: "auth",
                    token: configAtual.token
                }));
            });

            socketTerminal.addEventListener("message", event => {
                let msg;
                try {
                    msg = JSON.parse(event.data);
                } catch (_) {
                    adicionarLinha(String(event.data ?? ""), "normal");
                    return;
                }

                if (msg.type === "auth") {
                    if (msg.ok) {
                        atualizarStatus("Conectado", true);
                        atualizarBotoes(true);
                        adicionarLinha("Terminal autenticado com sucesso.", "success");
                    } else {
                        atualizarStatus("Token inválido", false);
                        atualizarBotoes(false);
                        adicionarLinha(msg.message || "Falha na autenticação.", "error");
                        try { socketTerminal.close(); } catch (_) {}
                    }
                    return;
                }

                if (msg.type === "status") {
                    if (msg.online) {
                        atualizarStatus("Conectado", true);
                        atualizarBotoes(true);
                    }
                    if (msg.data) {
                        atualizarHostInfo();
                        const texto = [
                            msg.data.hostname ? `Host: ${msg.data.hostname}` : "",
                            msg.data.platform ? `Sistema: ${msg.data.platform}` : "",
                            msg.data.node ? `Node: ${msg.data.node}` : "",
                            msg.data.memoryUsedMB != null && msg.data.memoryTotalMB != null
                                ? `RAM: ${msg.data.memoryUsedMB}/${msg.data.memoryTotalMB} MB`
                                : "",
                            msg.data.uptime ? `Uptime: ${msg.data.uptime}` : ""
                        ].filter(Boolean).join(" | ");
                        if (texto) console.debug("[TERMINAL STATUS]", texto);
                    }
                    return;
                }

                if (msg.type === "output") {
                    adicionarLinha(msg.data || "", msg.stream === "stderr" ? "error" : "normal");
                    executando = false;
                    atualizarBotoes(true);
                    return;
                }

                if (msg.type === "exit") {
                    executando = false;
                    atualizarBotoes(true);
                    adicionarLinha(
                        `Shell encerrado. Código: ${msg.code ?? "?"}${msg.signal ? ` | Sinal: ${msg.signal}` : ""}`,
                        "info"
                    );
                    return;
                }

                if (msg.type === "system") {
                    adicionarLinha(msg.message || "", msg.level === "error" ? "error" : (msg.level === "success" ? "success" : "info"));
                    return;
                }

                if (msg.type === "error") {
                    executando = false;
                    atualizarBotoes(true);
                    adicionarLinha(msg.message || "Erro no Terminal.", "error");
                }
            });

            socketTerminal.addEventListener("error", () => {
                atualizarStatus("Erro de conexão", false);
                atualizarBotoes(false);
                adicionarLinha("Erro de conexão com o WebSocket do Terminal.", "error");
            });

            socketTerminal.addEventListener("close", event => {
                socketTerminal = null;
                executando = false;
                atualizarBotoes(false);
                atualizarStatus("Desconectado", false);

                if (!conexaoManual) {
                    adicionarLinha(
                        `Terminal desconectado. Código WebSocket: ${event.code || "desconhecido"}.`,
                        "error"
                    );
                }
            });
        } catch (erro) {
            atualizarStatus("Erro", false);
            atualizarBotoes(false);
            adicionarLinha("Erro ao abrir WebSocket: " + (erro.message || erro), "error");
        }
    }

    function desconectarSocket(mensagem = true) {
        conexaoManual = true;
        if (timerReconexao) {
            clearTimeout(timerReconexao);
            timerReconexao = null;
        }

        if (socketTerminal) {
            try { socketTerminal.close(); } catch (_) {}
            socketTerminal = null;
        }

        executando = false;
        atualizarBotoes(false);

        if (mensagem) {
            atualizarStatus("Desconectado", false);
            adicionarLinha("Terminal desconectado.", "info");
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
            adicionarLinha("Já existe um comando sendo executado.", "error");
            return;
        }

        const input = el("terminalCommand");
        const comando = input?.value?.trim();

        if (!comando) return;

        if (!configAtual.ativo) {
            adicionarLinha("Terminal está desativado.", "error");
            return;
        }

        if (!configAtual.api) {
            adicionarLinha("API do terminal não configurada.", "error");
            return;
        }

        if (!socketTerminal || socketTerminal.readyState !== WebSocket.OPEN) {
            adicionarLinha("Terminal não está conectado. Clique em Conectar.", "error");
            atualizarStatus("Desconectado", false);
            atualizarBotoes(false);
            return;
        }

        executando = true;
        atualizarBotoes(true);
        adicionarLinha("$ " + comando, "command");

        try {
            socketTerminal.send(JSON.stringify({
                type: "command",
                command: comando
            }));
        } catch (erro) {
            executando = false;
            atualizarBotoes(true);
            adicionarLinha("Erro ao enviar comando: " + (erro.message || erro), "error");
        } finally {
            if (input) input.value = "";
        }
    }

    // =====================================================

    // PARAR

    // =====================================================


    function interromper() {
        if (!socketTerminal || socketTerminal.readyState !== WebSocket.OPEN) {
            adicionarLinha("Terminal não está conectado.", "error");
            return;
        }

        if (!executando) {
            adicionarLinha("Nenhum comando está sendo executado.", "info");
            return;
        }

        try {
            socketTerminal.send(JSON.stringify({ type: "interrupt" }));
            adicionarLinha("Interrupção enviada ao Terminal.", "info");
        } catch (erro) {
            adicionarLinha("Erro ao interromper: " + (erro.message || erro), "error");
        }
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
