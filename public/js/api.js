"use strict";


// =====================================================
// CONFIGURAÇÃO
// =====================================================

const API_URL =
    window.location.origin + "/api";


// =====================================================
// DADOS DO USUÁRIO
// =====================================================

let usuarioAPI = {

    uid: "",
    apiKey: "",
    fullName: "",
    email: ""

};


// =====================================================
// ELEMENTOS
// =====================================================

const elementoNome =
    document.getElementById("nomeUsuario");

const elementoEmail =
    document.getElementById("emailUsuario");

const elementoUID =
    document.getElementById("uidUsuario");

const elementoAPIKey =
    document.getElementById("apiKeyUsuario");


// =====================================================
// OBTER CREDENCIAIS
// =====================================================

function obterCredenciais() {

    const uid =
        localStorage.getItem("uid") ||
        localStorage.getItem("userUID") ||
        "";

    const apiKey =
        localStorage.getItem("apiKey") ||
        localStorage.getItem("api_key") ||
        "";

    return {

        uid:
            String(uid).trim(),

        apiKey:
            String(apiKey).trim()

    };

}


// =====================================================
// CARREGAR USUÁRIO
// =====================================================

async function carregarUsuario() {

    try {

        console.log(
            "[API] Carregando usuário..."
        );


        const credenciais =
            obterCredenciais();


        if (
            !credenciais.uid ||
            !credenciais.apiKey
        ) {

            console.warn(
                "[API] UID ou API Key não encontrados."
            );

            return;

        }


        usuarioAPI.uid =
            credenciais.uid;

        usuarioAPI.apiKey =
            credenciais.apiKey;


        // =================================================
        // BUSCAR CONFIGURAÇÕES
        // =================================================

        const resposta =
            await fetch(
                API_URL + "/configuracoes",
                {

                    method: "GET",

                    headers: {

                        "Accept":
                            "application/json",

                        "x-uid":
                            usuarioAPI.uid,

                        "x-api-key":
                            usuarioAPI.apiKey

                    },

                    cache:
                        "no-store"

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


        console.log(
            "[API] Resposta:",
            json
        );


        if (!json.success) {

            throw new Error(
                json.error ||
                "Erro ao carregar usuário."
            );

        }


        const configuracao =
            json.configuracao || {};


        // =================================================
        // DADOS
        // =================================================

        usuarioAPI.fullName =
            configuracao.nomeEmpresa ||
            "";

        usuarioAPI.email =
            configuracao.email ||
            "";


        mostrarUsuario();

        atualizarExemplos();


        console.log(
            "[API] Usuário carregado."
        );

    }
    catch (erro) {

        console.error(
            "[API] Erro:",
            erro
        );

    }

}


// =====================================================
// MOSTRAR USUÁRIO
// =====================================================

function mostrarUsuario() {

    if (elementoNome) {

        elementoNome.textContent =
            usuarioAPI.fullName ||
            "Usuário";

    }


    if (elementoEmail) {

        elementoEmail.textContent =
            usuarioAPI.email ||
            "";

    }


    if (elementoUID) {

        elementoUID.textContent =
            usuarioAPI.uid ||
            "Não disponível";

    }


    if (elementoAPIKey) {

        elementoAPIKey.textContent =
            usuarioAPI.apiKey ||
            "Não disponível";

    }

}


// =====================================================
// COPIAR UID
// =====================================================

async function copiarUID() {

    if (!usuarioAPI.uid) {

        alert(
            "UID não disponível."
        );

        return;

    }


    try {

        await navigator.clipboard.writeText(
            usuarioAPI.uid
        );


        alert(
            "UID copiado!"
        );

    }
    catch (erro) {

        console.error(
            "[API] Erro ao copiar UID:",
            erro
        );

    }

}


// =====================================================
// COPIAR API KEY
// =====================================================

async function copiarAPIKey() {

    if (!usuarioAPI.apiKey) {

        alert(
            "API Key não disponível."
        );

        return;

    }


    try {

        await navigator.clipboard.writeText(
            usuarioAPI.apiKey
        );


        alert(
            "API Key copiada!"
        );

    }
    catch (erro) {

        console.error(
            "[API] Erro ao copiar API Key:",
            erro
        );

    }

}


// =====================================================
// ATUALIZAR EXEMPLOS
// =====================================================

function atualizarExemplos() {

    const exemplos =
        document.querySelectorAll(
            "[data-api-example]"
        );


    exemplos.forEach(
        function (elemento) {

            let codigo =
                elemento.textContent;


            codigo =
                codigo.replace(
                    /SEU_UID/g,
                    usuarioAPI.uid
                );


            codigo =
                codigo.replace(
                    /SUA_API_KEY/g,
                    usuarioAPI.apiKey
                );


            elemento.textContent =
                codigo;

        }
    );

}


// =====================================================
// COPIAR CÓDIGO
// =====================================================

async function copiarCodigo(elemento) {

    if (!elemento) {

        return;

    }


    try {

        await navigator.clipboard.writeText(
            elemento.textContent
        );


        alert(
            "Código copiado!"
        );

    }
    catch (erro) {

        console.error(
            "[API] Erro ao copiar código:",
            erro
        );

    }

}


// =====================================================
// INICIALIZAR EVENTOS
// =====================================================

function inicializarEventos() {

    const btnUID =
        document.getElementById(
            "btnCopiarUID"
        );


    const btnAPIKey =
        document.getElementById(
            "btnCopiarAPIKey"
        );


    if (btnUID) {

        btnUID.addEventListener(
            "click",
            copiarUID
        );

    }


    if (btnAPIKey) {

        btnAPIKey.addEventListener(
            "click",
            copiarAPIKey
        );

    }


    const botoesCodigo =
        document.querySelectorAll(
            "[data-copiar-codigo]"
        );


    botoesCodigo.forEach(
        function (botao) {

            botao.addEventListener(
                "click",
                function () {

                    const id =
                        botao.dataset.copiarCodigo;


                    const bloco =
                        document.getElementById(
                            id
                        );


                    copiarCodigo(
                        bloco
                    );

                }
            );

        }
    );

}


// =====================================================
// INICIALIZAÇÃO
// =====================================================

function inicializarAPI() {

    console.log(
        "[API] Inicializando..."
    );


    inicializarEventos();

    carregarUsuario();


    console.log(
        "[API] Página API pronta."
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
        inicializarAPI,
        {
            once: true
        }
    );

}
else {

    inicializarAPI();

}


// =====================================================
// FUNÇÕES GLOBAIS
// =====================================================

window.copiarUID =
    copiarUID;

window.copiarAPIKey =
    copiarAPIKey;

window.copiarCodigo =
    copiarCodigo;
