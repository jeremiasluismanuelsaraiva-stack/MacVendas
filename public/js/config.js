// =====================================================
// CONFIG.JS
// Local: public/js/config.js
// =====================================================

(function () {

    "use strict";


    // =====================================================
    // CONFIGURAÇÃO DA API
    // =====================================================

    const CONFIG_API = "/api";


    // =====================================================
    // CONFIGURAÇÃO DE TEMA
    // =====================================================

    function aplicarTema(tema) {

        const temaFinal =
            tema === "light"
                ? "light"
                : "dark";


        document.documentElement.setAttribute(
            "data-theme",
            temaFinal
        );


        localStorage.setItem(
            "tema",
            temaFinal
        );

    }


    // =====================================================
    // CARREGAR TEMA LOCAL
    // =====================================================

    function carregarTema() {

        const temaSalvo =
            localStorage.getItem("tema");


        if (temaSalvo === "light") {

            aplicarTema("light");

        }
        else {

            aplicarTema("dark");

        }

    }


    // =====================================================
    // ALTERAR TEMA
    // =====================================================

    function alterarTema(tema) {

        aplicarTema(
            tema
        );

    }


    // =====================================================
    // CARREGAR CONFIGURAÇÕES
    // =====================================================

    async function carregarConfiguracoes() {

        try {

            const resposta =
                await fetch(
                    CONFIG_API + "/configuracoes",
                    {
                        method: "GET",

                        headers: {
                            "Accept":
                                "application/json"
                        },

                        cache: "no-store"
                    }
                );


            if (!resposta.ok) {

                throw new Error(
                    "Erro HTTP: " +
                    resposta.status
                );

            }


            const json =
                await resposta.json();


            if (!json.success) {

                console.error(
                    "[CONFIG] Erro da API:",
                    json
                );

                return;

            }


            const configuracoes =
                json.configuracoes || [];


            if (
                !Array.isArray(configuracoes) ||
                configuracoes.length === 0
            ) {

                console.warn(
                    "[CONFIG] Nenhuma configuração encontrada."
                );

                return;

            }


            const cfg =
                configuracoes[0];


            // =================================================
            // NOME DA EMPRESA
            // =================================================

            const nomeEmpresa =
                document.getElementById(
                    "nomeEmpresa"
                );


            if (nomeEmpresa) {

                nomeEmpresa.value =
                    cfg.nomeEmpresa || "";

            }


            // =================================================
            // TELEFONE
            // =================================================

            const telefone =
                document.getElementById(
                    "telefone"
                );


            if (telefone) {

                telefone.value =
                    cfg.telefone || "";

            }


            // =================================================
            // EMAIL
            // =================================================

            const email =
                document.getElementById(
                    "email"
                );


            if (email) {

                email.value =
                    cfg.email || "";

            }


            // =================================================
            // MOEDA
            // =================================================

            const moeda =
                document.getElementById(
                    "moeda"
                );


            if (moeda) {

                moeda.value =
                    cfg.moeda || "MT";

            }


            // =================================================
            // VENDA POR GB
            // =================================================

            const vendaGB =
                document.getElementById(
                    "vendaGB"
                );


            if (vendaGB) {

                vendaGB.value =
                    cfg.vendaGB ?? 0;

            }


            // =================================================
            // CUSTO POR GB
            // =================================================

            const custoGB =
                document.getElementById(
                    "custoGB"
                );


            if (custoGB) {

                custoGB.value =
                    cfg.custoGB ?? 0;

            }


            // =================================================
            // USSD
            // =================================================

            const ussd =
                document.getElementById(
                    "ussd"
                );


            if (ussd) {

                ussd.value =
                    cfg.ussd || "*162#";

            }


            // =================================================
            // TEMA
            // =================================================

            const tema =
                document.getElementById(
                    "tema"
                );


            const temaConfigurado =
                cfg.tema === "light"
                    ? "light"
                    : "dark";


            if (tema) {

                tema.value =
                    temaConfigurado;

            }


            aplicarTema(
                temaConfigurado
            );


            // =================================================
            // IDIOMA
            // =================================================

            const idioma =
                document.getElementById(
                    "idioma"
                );


            if (idioma) {

                idioma.value =
                    cfg.idioma || "pt";

            }


            console.log(
                "[CONFIG] Configurações carregadas."
            );

        }

        catch (erro) {

            console.error(
                "[CONFIG] Erro ao carregar configurações:",
                erro
            );

        }

    }


    // =====================================================
    // OBTER DADOS DO FORMULÁRIO
    // =====================================================

    function obterDadosConfiguracoes() {

        return {

            nomeEmpresa:
                document.getElementById(
                    "nomeEmpresa"
                )?.value?.trim() || "",


            telefone:
                document.getElementById(
                    "telefone"
                )?.value?.trim() || "",


            email:
                document.getElementById(
                    "email"
                )?.value?.trim() || "",


            moeda:
                document.getElementById(
                    "moeda"
                )?.value || "MT",


            vendaGB:
                Number(
                    document.getElementById(
                        "vendaGB"
                    )?.value || 0
                ),


            custoGB:
                Number(
                    document.getElementById(
                        "custoGB"
                    )?.value || 0
                ),


            ussd:
                document.getElementById(
                    "ussd"
                )?.value?.trim() || "*162#",


            tema:
                document.getElementById(
                    "tema"
                )?.value || "dark",


            idioma:
                document.getElementById(
                    "idioma"
                )?.value || "pt"

        };

    }


    // =====================================================
    // SALVAR CONFIGURAÇÕES
    // =====================================================

    async function salvarConfiguracoes() {

        try {

            // =================================================
            // BUSCAR CONFIGURAÇÃO ATUAL
            // =================================================

            const resposta =
                await fetch(
                    CONFIG_API + "/configuracoes",
                    {
                        method: "GET",

                        headers: {
                            "Accept":
                                "application/json"
                        },

                        cache: "no-store"
                    }
                );


            if (!resposta.ok) {

                throw new Error(
                    "Erro HTTP: " +
                    resposta.status
                );

            }


            const json =
                await resposta.json();


            let id = "";


            if (
                json.success &&
                Array.isArray(
                    json.configuracoes
                ) &&
                json.configuracoes.length > 0
            ) {

                id =
                    json.configuracoes[0].id;

            }


            // =================================================
            // PEGAR DADOS
            // =================================================

            const dados =
                obterDadosConfiguracoes();


            // =================================================
            // APLICAR TEMA IMEDIATAMENTE
            // =================================================

            aplicarTema(
                dados.tema
            );


            let salvarResposta;


            // =================================================
            // ATUALIZAR
            // =================================================

            if (id) {

                salvarResposta =
                    await fetch(
                        CONFIG_API +
                        "/configuracoes/" +
                        encodeURIComponent(id),
                        {

                            method: "PUT",

                            headers: {

                                "Content-Type":
                                    "application/json",

                                "Accept":
                                    "application/json"

                            },

                            body:
                                JSON.stringify(
                                    dados
                                )

                        }
                    );

            }


            // =================================================
            // CRIAR
            // =================================================

            else {

                salvarResposta =
                    await fetch(
                        CONFIG_API +
                        "/configuracoes",
                        {

                            method: "POST",

                            headers: {

                                "Content-Type":
                                    "application/json",

                                "Accept":
                                    "application/json"

                            },

                            body:
                                JSON.stringify(
                                    dados
                                )

                        }
                    );

            }


            // =================================================
            // VERIFICAR RESPOSTA
            // =================================================

            if (!salvarResposta.ok) {

                let erroApi = {};


                try {

                    erroApi =
                        await salvarResposta.json();

                }
                catch (_) {

                    erroApi = {};

                }


                throw new Error(
                    erroApi.error ||
                    erroApi.message ||
                    "Erro ao guardar configurações."
                );

            }


            console.log(
                "[CONFIG] Configurações guardadas."
            );


            alert(
                "Configurações guardadas com sucesso!"
            );


            // =================================================
            // RECARREGAR
            // =================================================

            await carregarConfiguracoes();

        }

        catch (erro) {

            console.error(
                "[CONFIG] Erro ao guardar configurações:",
                erro
            );


            alert(
                "Erro ao guardar as configurações."
            );

        }

    }


    // =====================================================
    // DISPONIBILIZAR FUNÇÕES GLOBALMENTE
    // =====================================================

    window.carregarConfiguracoes =
        carregarConfiguracoes;


    window.salvarConfiguracoes =
        salvarConfiguracoes;


    window.aplicarTema =
        aplicarTema;


    window.alterarTema =
        alterarTema;


    window.carregarTema =
        carregarTema;


    // =====================================================
    // INICIALIZAÇÃO
    // =====================================================

    function inicializarConfiguracoes() {

        console.log(
            "[CONFIG] Inicializando..."
        );


        // =================================================
        // PRIMEIRO: TEMA LOCAL
        // =================================================

        carregarTema();


        // =================================================
        // SELETOR DE TEMA
        // =================================================

        const seletorTema =
            document.getElementById(
                "tema"
            );


        if (seletorTema) {

            seletorTema.addEventListener(
                "change",
                function () {

                    alterarTema(
                        this.value
                    );

                }
            );

        }


        // =================================================
        // BOTÃO SALVAR
        // =================================================

        const btn =
            document.getElementById(
                "btnSalvarConfiguracoes"
            );


        if (
            btn &&
            btn.dataset.configInicializado !== "true"
        ) {

            btn.dataset.configInicializado =
                "true";


            btn.addEventListener(
                "click",
                function (evento) {

                    evento.preventDefault();

                    evento.stopPropagation();

                    salvarConfiguracoes();

                }
            );

        }


        // =================================================
        // CARREGAR CONFIGURAÇÕES
        // =================================================

        carregarConfiguracoes();


        console.log(
            "[CONFIG] Sistema de configurações pronto."
        );

    }


    // =====================================================
    // DOM READY
    // =====================================================

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

    }
    else {

        inicializarConfiguracoes();

    }

})();
