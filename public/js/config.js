const API = window.location.origin;


// =====================================================
// CARREGAR CONFIGURAÇÕES
// =====================================================

async function carregarConfiguracoes() {

    try {

        const resposta = await fetch(
            API + "/configuracoes"
        );


        if (!resposta.ok) {

            throw new Error(
                "Erro HTTP: " + resposta.status
            );

        }


        const json = await resposta.json();


        if (!json.success) {

            console.error(
                "[CONFIG] Erro da API:",
                json
            );

            return;

        }


        const configuracoes =
            json.configuracoes || [];


        if (configuracoes.length === 0) {

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

        if (tema) {

            tema.value =
                cfg.tema || "dark";

        }


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
        // BUSCAR CONFIGURAÇÃO EXISTENTE
        // =================================================

        const resposta =
            await fetch(
                API + "/configuracoes"
            );


        if (!resposta.ok) {

            throw new Error(
                "Erro HTTP: " + resposta.status
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
        // OBTER DADOS
        // =================================================

        const dados =
            obterDadosConfiguracoes();


        let salvarResposta;


        // =================================================
        // ATUALIZAR
        // =================================================

        if (id) {

            salvarResposta =
                await fetch(
                    API +
                    "/configuracoes/" +
                    encodeURIComponent(id),
                    {

                        method: "PUT",

                        headers: {

                            "Content-Type":
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
                    API + "/configuracoes",
                    {

                        method: "POST",

                        headers: {

                            "Content-Type":
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
        // RECARREGAR CONFIGURAÇÕES
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


// =====================================================
// INICIALIZAÇÃO
// =====================================================

function inicializarConfiguracoes() {

    console.log(
        "[CONFIG] Inicializando..."
    );


    // =================================================
    // CARREGAR CONFIGURAÇÕES
    // =================================================

    carregarConfiguracoes();


    // =================================================
    // BOTÃO SALVAR
    // =================================================

    const btn =
        document.getElementById(
            "btnSalvarConfiguracoes"
        );


    if (!btn) {

        console.warn(
            "[CONFIG] #btnSalvarConfiguracoes não encontrado."
        );

        return;

    }


    // =================================================
    // EVITAR EVENTO DUPLICADO
    // =================================================

    if (
        btn.dataset.configInicializado ===
        "true"
    ) {

        return;

    }


    btn.dataset.configInicializado =
        "true";


    // =================================================
    // CLIQUE NO BOTÃO
    // =================================================

    btn.addEventListener(
        "click",
        function (evento) {

            evento.preventDefault();

            salvarConfiguracoes();

        }
    );


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
