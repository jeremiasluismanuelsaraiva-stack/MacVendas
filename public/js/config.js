// =====================================================
// CONFIG.JS
// Local: public/js/config.js
// =====================================================

(function () {

    "use strict";


    // =====================================================
    // CONFIGURAÇÃO DA API
    // =====================================================

    const API_CONFIG =
        window.location.origin;


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

            const url =
                API_CONFIG +
                "/api/configuracoes";


            console.log(
                "[CONFIG] GET:",
                url
            );


            const resposta =
                await fetch(
                    url,
                    {
                        method: "GET",

                        headers: {
                            "Accept":
                                "application/json"
                        },

                        cache: "no-store"
                    }
                );


            // =================================================
            // VERIFICAR HTTP
            // =================================================

            if (!resposta.ok) {

                let erroApi = {};


                try {

                    erroApi =
                        await resposta.json();

                }
                catch (_) {

                    erroApi = {};

                }


                throw new Error(
                    erroApi.error ||
                    erroApi.message ||
                    "Erro HTTP: " +
                    resposta.status
                );

            }


            // =================================================
            // LER JSON
            // =================================================

            const json =
                await resposta.json();


            console.log(
                "[CONFIG] Resposta:",
                json
            );


            // =================================================
            // VERIFICAR SUCCESS
            // =================================================

            if (!json.success) {

                console.error(
                    "[CONFIG] Erro da API:",
                    json
                );

                return;

            }


            // =================================================
            // CONFIGURAÇÃO
            // =================================================
            //
            // O backend retorna:
            //
            // {
            //     success: true,
            //     configuracao: {...}
            // }
            //
            // =================================================

            const cfg =
                json.configuracao || {};


            if (
                !cfg ||
                typeof cfg !== "object"
            ) {

                console.warn(
                    "[CONFIG] Configuração inválida."
                );

                return;

            }


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
                    cfg.vendaGB ?? 28;

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
                    cfg.custoGB ?? 21;

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


            // =================================================
            // FINAL
            // =================================================

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

            // =================================================
            // EMPRESA
            // =================================================

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


            // =================================================
            // MOEDA
            // =================================================

            moeda:
                document.getElementById(
                    "moeda"
                )?.value || "MT",


            // =================================================
            // VALORES
            // =================================================

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


            // =================================================
            // TEMA
            // =================================================

            tema:
                document.getElementById(
                    "tema"
                )?.value || "dark",


            // =================================================
            // IDIOMA
            // =================================================

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
            // PEGAR DADOS DO FORMULÁRIO
            // =================================================

            const dados =
                obterDadosConfiguracoes();


            console.log(
                "[CONFIG] Dados para guardar:",
                dados
            );


            // =================================================
            // APLICAR TEMA IMEDIATAMENTE
            // =================================================

            aplicarTema(
                dados.tema
            );


            // =================================================
            // URL DA API
            // =================================================

            const url =
                API_CONFIG +
                "/api/configuracoes";


            console.log(
                "[CONFIG] PUT:",
                url
            );


            // =================================================
            // ENVIAR CONFIGURAÇÕES
            // =================================================

            const salvarResposta =
                await fetch(
                    url,
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


            // =================================================
            // VERIFICAR HTTP
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
                    "Erro HTTP: " +
                    salvarResposta.status
                );

            }


            // =================================================
            // LER RESPOSTA
            // =================================================

            const json =
                await salvarResposta.json();


            console.log(
                "[CONFIG] Resposta ao guardar:",
                json
            );


            // =================================================
            // VERIFICAR SUCCESS
            // =================================================

            if (!json.success) {

                throw new Error(
                    json.error ||
                    json.message ||
                    "Erro ao guardar configurações."
                );

            }


            // =================================================
            // SUCESSO
            // =================================================

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
                erro.message ||
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
        // CARREGAR CONFIGURAÇÕES DA API
        // =================================================

        carregarConfiguracoes();


        // =================================================
        // FINAL
        // =================================================

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
