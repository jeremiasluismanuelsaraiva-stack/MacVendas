const API = window.location.origin;


// =====================================
// CARREGAR CONFIGURAÇÕES
// =====================================

async function carregarConfiguracoes() {

    try {

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


        if (!json.success) {

            console.error(
                "Erro da API:",
                json
            );

            return;

        }


        const configuracoes =
            json.configuracoes || [];


        if (configuracoes.length === 0) {
            return;
        }


        const cfg =
            configuracoes[0];


        // =====================================
        // CAMPOS
        // =====================================

        const nomeEmpresa =
            document.getElementById(
                "nomeEmpresa"
            );

        if (nomeEmpresa) {
            nomeEmpresa.value =
                cfg.nomeEmpresa || "";
        }


        const telefone =
            document.getElementById(
                "telefone"
            );

        if (telefone) {
            telefone.value =
                cfg.telefone || "";
        }


        const email =
            document.getElementById(
                "email"
            );

        if (email) {
            email.value =
                cfg.email || "";
        }


        const moeda =
            document.getElementById(
                "moeda"
            );

        if (moeda) {
            moeda.value =
                cfg.moeda || "MT";
        }


        const vendaGB =
            document.getElementById(
                "vendaGB"
            );

        if (vendaGB) {
            vendaGB.value =
                cfg.vendaGB ?? 0;
        }


        const custoGB =
            document.getElementById(
                "custoGB"
            );

        if (custoGB) {
            custoGB.value =
                cfg.custoGB ?? 0;
        }


        const ussd =
            document.getElementById(
                "ussd"
            );

        if (ussd) {
            ussd.value =
                cfg.ussd || "*162#";
        }


        const tema =
            document.getElementById(
                "tema"
            );

        if (tema) {
            tema.value =
                cfg.tema || "dark";
        }


        const idioma =
            document.getElementById(
                "idioma"
            );

        if (idioma) {
            idioma.value =
                cfg.idioma || "pt";
        }


    }

    catch (erro) {

        console.error(
            "Erro ao carregar configurações:",
            erro
        );

    }

}


// =====================================
// OBTER DADOS DO FORMULÁRIO
// =====================================

function obterDadosConfiguracoes() {

    return {

        nomeEmpresa:
            document.getElementById(
                "nomeEmpresa"
            )?.value || "",

        telefone:
            document.getElementById(
                "telefone"
            )?.value || "",

        email:
            document.getElementById(
                "email"
            )?.value || "",

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
            )?.value || "*162#",

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


// =====================================
// SALVAR CONFIGURAÇÕES
// =====================================

async function salvarConfiguracoes() {

    try {

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
            json.configuracoes &&
            json.configuracoes.length
        ) {

            id =
                json.configuracoes[0].id;

        }


        const dados =
            obterDadosConfiguracoes();


        let salvarResposta;


        // =====================================
        // ATUALIZAR
        // =====================================

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
                            JSON.stringify(dados)

                    }
                );

        }

        // =====================================
        // CRIAR
        // =====================================

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
                            JSON.stringify(dados)

                    }
                );

        }


        if (!salvarResposta.ok) {

            let erroApi = {};

            try {
                erroApi =
                    await salvarResposta.json();
            } catch (_) {}


            throw new Error(
                erroApi.error ||
                "Erro ao guardar configurações."
            );

        }


        alert(
            "Configurações guardadas com sucesso!"
        );


        await carregarConfiguracoes();


    }

    catch (erro) {

        console.error(
            "Erro ao guardar configurações:",
            erro
        );


        alert(
            "Erro ao guardar as configurações."
        );

    }

}


// =====================================
// DISPONIBILIZAR FUNÇÕES
// =====================================

window.carregarConfiguracoes =
    carregarConfiguracoes;

window.salvarConfiguracoes =
    salvarConfiguracoes;


// =====================================
// INICIALIZAÇÃO
// =====================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        carregarConfiguracoes();


        const btn =
            document.getElementById(
                "btnSalvarConfiguracoes"
            );


        if (btn) {

            btn.addEventListener(
                "click",
                (evento) => {

                    evento.preventDefault();

                    salvarConfiguracoes();

                }
            );

        }

    }
);
