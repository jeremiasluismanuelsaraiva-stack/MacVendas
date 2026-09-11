"use strict";

/*
=====================================================
 MOZ TECH
 API.JS
 CREDENCIAIS + API + USUARIO
=====================================================

 PRIORIDADE DAS CREDENCIAIS:

 1. Firebase
 2. localStorage (fallback)

 O UID principal vem do Firebase.
 A API Key continua sendo usada para autenticar
 as chamadas à API.
=====================================================
*/


// =====================================================
// CONFIGURAÇÃO DA API
// =====================================================

const API_URL = window.location.origin + "/api";


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
// OBTER CREDENCIAIS DO LOCALSTORAGE
// =====================================================

function obterCredenciaisLocalStorage() {

    const uid =
        localStorage.getItem("uid") ||
        localStorage.getItem("userUID") ||
        "";

    const apiKey =
        localStorage.getItem("apiKey") ||
        localStorage.getItem("api_key") ||
        "";

    return {
        uid,
        apiKey
    };
}


// =====================================================
// SALVAR CREDENCIAIS
// =====================================================

function salvarCredenciais(uid, apiKey) {

    if (uid) {

        localStorage.setItem("uid", uid);
        localStorage.setItem("userUID", uid);

    }

    if (apiKey) {

        localStorage.setItem("apiKey", apiKey);
        localStorage.setItem("api_key", apiKey);

    }

}


// =====================================================
// OBTER DADOS DO FIREBASE
// =====================================================

async function obterDadosFirebase() {

    try {

        // -------------------------------------------------
        // Se firebase.js ainda não carregou
        // -------------------------------------------------

        if (typeof window.obterDadosUsuario !== "function") {

            console.warn(
                "[API] obterDadosUsuario() ainda não disponível."
            );

            return null;
        }


        // -------------------------------------------------
        // Primeira tentativa
        // -------------------------------------------------

        let dados = await window.obterDadosUsuario();


        if (dados && dados.uid) {

            return dados;

        }


        // -------------------------------------------------
        // Firebase Auth pode ainda estar restaurando
        // a sessão.
        //
        // Esperamos o onAuthState.
        // -------------------------------------------------

        if (typeof window.onAuthState === "function") {

            console.log(
                "[API] Aguardando restauração da sessão Firebase..."
            );


            dados = await new Promise((resolve) => {

                let finalizado = false;


                const terminar = async (usuario) => {

                    if (finalizado) {
                        return;
                    }

                    finalizado = true;


                    try {

                        if (!usuario) {

                            resolve(null);
                            return;

                        }


                        // Depois que o Auth confirmou o usuário,
                        // buscamos os dados completos.

                        const dadosUsuario =
                            await window.obterDadosUsuario();

                        resolve(dadosUsuario || null);

                    } catch (erro) {

                        console.error(
                            "[API] Erro ao obter dados Firebase:",
                            erro
                        );

                        resolve(null);
                    }

                };


                try {

                    window.onAuthState(async (usuario) => {

                        await terminar(usuario);

                    });

                } catch (erro) {

                    console.error(
                        "[API] Erro no onAuthState:",
                        erro
                    );

                    resolve(null);
                }


                // -------------------------------------------------
                // Timeout de segurança
                // -------------------------------------------------

                setTimeout(() => {

                    if (!finalizado) {

                        finalizado = true;

                        console.warn(
                            "[API] Timeout aguardando Firebase Auth."
                        );

                        resolve(null);

                    }

                }, 10000);

            });


            if (dados && dados.uid) {

                return dados;

            }

        }


    } catch (erro) {

        console.error(
            "[API] Erro ao obter credenciais Firebase:",
            erro
        );

    }


    return null;
}


// =====================================================
// OBTER CREDENCIAIS
// =====================================================

async function obterCredenciais() {

    /*
    =====================================================
    PRIMEIRO: FIREBASE
    =====================================================
    */

    const dadosFirebase =
        await obterDadosFirebase();


    if (dadosFirebase && dadosFirebase.uid) {

        const uid =
            dadosFirebase.uid || "";


        const apiKey =
            dadosFirebase.apiKey ||
            dadosFirebase.api_key ||
            "";


        if (uid) {

            usuarioAPI.uid = uid;

        }


        if (apiKey) {

            usuarioAPI.apiKey = apiKey;

        }


        // -------------------------------------------------
        // Guardar para compatibilidade
        // -------------------------------------------------

        salvarCredenciais(
            uid,
            apiKey
        );


        console.log(
            "[API] Credenciais obtidas pelo Firebase:",
            {
                uid: uid,
                possuiApiKey: !!apiKey
            }
        );


        return {

            uid,
            apiKey,

            dadosFirebase

        };

    }


    /*
    =====================================================
    FALLBACK: LOCALSTORAGE
    =====================================================
    */

    console.warn(
        "[API] Firebase não forneceu credenciais. " +
        "Usando localStorage como fallback."
    );


    const local =
        obterCredenciaisLocalStorage();


    usuarioAPI.uid =
        local.uid || "";


    usuarioAPI.apiKey =
        local.apiKey || "";


    return {

        uid: local.uid,
        apiKey: local.apiKey,

        dadosFirebase: null

    };

}


// =====================================================
// HEADERS DA API
// =====================================================

async function obterHeadersAPI() {

    const credenciais =
        await obterCredenciais();


    const headers = {

        "Content-Type":
            "application/json"

    };


    if (credenciais.uid) {

        headers["x-uid"] =
            credenciais.uid;

    }


    if (credenciais.apiKey) {

        headers["x-api-key"] =
            credenciais.apiKey;

    }


    return headers;

}


// =====================================================
// VERIFICAR CREDENCIAIS
// =====================================================

async function verificarCredenciais() {

    const credenciais =
        await obterCredenciais();


    if (!credenciais.uid) {

        console.warn(
            "[API] UID não encontrado."
        );

        return false;

    }


    if (!credenciais.apiKey) {

        console.warn(
            "[API] API Key não encontrada."
        );

        return false;

    }


    return true;

}


// =====================================================
// CARREGAR USUÁRIO
// =====================================================

async function carregarUsuario() {

    try {

        const credenciais =
            await obterCredenciais();


        if (!credenciais.uid) {

            console.warn(
                "[API] Nenhum UID disponível."
            );

            return null;

        }


        /*
        =================================================
        BUSCAR CONFIGURAÇÕES DA API
        =================================================
        */

        const headers =
            await obterHeadersAPI();


        const resposta =
            await fetch(
                API_URL + "/configuracoes",
                {
                    method: "GET",
                    headers
                }
            );


        /*
        =================================================
        ERRO HTTP
        =================================================
        */

        if (!resposta.ok) {

            let erroTexto = "";

            try {

                erroTexto =
                    await resposta.text();

            } catch (_) {

                erroTexto =
                    "Erro desconhecido";

            }


            console.error(
                "[API] Erro HTTP:",
                resposta.status,
                erroTexto
            );


            return null;

        }


        const dados =
            await resposta.json();


        /*
        =================================================
        CONFIGURAÇÃO RETORNADA
        =================================================
        */

        const configuracao =
            dados?.configuracao ||
            dados?.data ||
            dados ||
            {};


        /*
        =================================================
        NOME
        =================================================
        */

        usuarioAPI.fullName =
            configuracao.nomeEmpresa ||
            configuracao.nome ||
            configuracao.fullName ||
            credenciais.dadosFirebase?.nome ||
            credenciais.dadosFirebase?.displayName ||
            "";


        /*
        =================================================
        EMAIL
        =================================================
        */

        usuarioAPI.email =
            configuracao.email ||
            credenciais.dadosFirebase?.email ||
            "";


        /*
        =================================================
        UID
        =================================================
        */

        usuarioAPI.uid =
            credenciais.uid;


        /*
        =================================================
        API KEY
        =================================================
        */

        usuarioAPI.apiKey =
            credenciais.apiKey;


        console.log(
            "[API] Usuário carregado:",
            {
                uid: usuarioAPI.uid,
                nome: usuarioAPI.fullName,
                email: usuarioAPI.email
            }
        );


        return usuarioAPI;

    } catch (erro) {

        console.error(
            "[API] Erro ao carregar usuário:",
            erro
        );

        return null;

    }

}


// =====================================================
// REQUISIÇÃO GENÉRICA GET
// =====================================================

async function apiGet(endpoint) {

    try {

        const headers =
            await obterHeadersAPI();


        const resposta =
            await fetch(
                API_URL + endpoint,
                {
                    method: "GET",
                    headers
                }
            );


        const dados =
            await resposta.json();


        if (!resposta.ok) {

            throw new Error(
                dados?.erro ||
                dados?.message ||
                `HTTP ${resposta.status}`
            );

        }


        return dados;

    } catch (erro) {

        console.error(
            "[API GET]",
            endpoint,
            erro
        );

        throw erro;

    }

}


// =====================================================
// REQUISIÇÃO GENÉRICA POST
// =====================================================

async function apiPost(endpoint, dados = {}) {

    try {

        const headers =
            await obterHeadersAPI();


        const resposta =
            await fetch(
                API_URL + endpoint,
                {
                    method: "POST",
                    headers,
                    body: JSON.stringify(dados)
                }
            );


        const resultado =
            await resposta.json();


        if (!resposta.ok) {

            throw new Error(
                resultado?.erro ||
                resultado?.message ||
                `HTTP ${resposta.status}`
            );

        }


        return resultado;

    } catch (erro) {

        console.error(
            "[API POST]",
            endpoint,
            erro
        );

        throw erro;

    }

}


// =====================================================
// REQUISIÇÃO GENÉRICA PUT
// =====================================================

async function apiPut(endpoint, dados = {}) {

    try {

        const headers =
            await obterHeadersAPI();


        const resposta =
            await fetch(
                API_URL + endpoint,
                {
                    method: "PUT",
                    headers,
                    body: JSON.stringify(dados)
                }
            );


        const resultado =
            await resposta.json();


        if (!resposta.ok) {

            throw new Error(
                resultado?.erro ||
                resultado?.message ||
                `HTTP ${resposta.status}`
            );

        }


        return resultado;

    } catch (erro) {

        console.error(
            "[API PUT]",
            endpoint,
            erro
        );

        throw erro;

    }

}


// =====================================================
// REQUISIÇÃO GENÉRICA DELETE
// =====================================================

async function apiDelete(endpoint) {

    try {

        const headers =
            await obterHeadersAPI();


        const resposta =
            await fetch(
                API_URL + endpoint,
                {
                    method: "DELETE",
                    headers
                }
            );


        const resultado =
            await resposta.json();


        if (!resposta.ok) {

            throw new Error(
                resultado?.erro ||
                resultado?.message ||
                `HTTP ${resposta.status}`
            );

        }


        return resultado;

    } catch (erro) {

        console.error(
            "[API DELETE]",
            endpoint,
            erro
        );

        throw erro;

    }

}


// =====================================================
// COPIAR UID
// =====================================================

async function copiarUID() {

    const uid =
        usuarioAPI.uid ||
        (await obterCredenciais()).uid;


    if (!uid) {

        console.warn(
            "[API] UID não disponível para copiar."
        );

        return;

    }


    try {

        await navigator.clipboard.writeText(uid);

        console.log(
            "[API] UID copiado."
        );

    } catch (erro) {

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

    const apiKey =
        usuarioAPI.apiKey ||
        (await obterCredenciais()).apiKey;


    if (!apiKey) {

        console.warn(
            "[API] API Key não disponível para copiar."
        );

        return;

    }


    try {

        await navigator.clipboard.writeText(apiKey);

        console.log(
            "[API] API Key copiada."
        );

    } catch (erro) {

        console.error(
            "[API] Erro ao copiar API Key:",
            erro
        );

    }

}


// =====================================================
// COPIAR CÓDIGO
// =====================================================

async function copiarCodigo(codigo) {

    if (!codigo) {

        console.warn(
            "[API] Nenhum código para copiar."
        );

        return;

    }


    try {

        await navigator.clipboard.writeText(
            String(codigo)
        );

        console.log(
            "[API] Código copiado."
        );

    } catch (erro) {

        console.error(
            "[API] Erro ao copiar código:",
            erro
        );

    }

}


// =====================================================
// DISPONIBILIZAR GLOBALMENTE
// =====================================================

window.usuarioAPI =
    usuarioAPI;

window.obterCredenciais =
    obterCredenciais;

window.obterCredenciaisLocalStorage =
    obterCredenciaisLocalStorage;

window.obterDadosFirebase =
    obterDadosFirebase;

window.obterHeadersAPI =
    obterHeadersAPI;

window.verificarCredenciais =
    verificarCredenciais;

window.carregarUsuario =
    carregarUsuario;

window.apiGet =
    apiGet;

window.apiPost =
    apiPost;

window.apiPut =
    apiPut;

window.apiDelete =
    apiDelete;

window.copiarUID =
    copiarUID;

window.copiarAPIKey =
    copiarAPIKey;

window.copiarCodigo =
    copiarCodigo;


// =====================================================
// INICIALIZAÇÃO
// =====================================================

(async function iniciarAPI() {

    try {

        console.log(
            "[API] Inicializando sistema de credenciais..."
        );


        const credenciais =
            await obterCredenciais();


        if (credenciais.uid) {

            console.log(
                "[API] UID atual:",
                credenciais.uid
            );

        } else {

            console.warn(
                "[API] Nenhum UID encontrado na inicialização."
            );

        }


        /*
        =================================================
        NÃO fazemos a chamada /configuracoes
        imediatamente se ainda não houver API Key.

        Isso evita requisições inválidas enquanto
        o Firebase ainda restaura a sessão.
        =================================================
        */

        if (
            credenciais.uid &&
            credenciais.apiKey
        ) {

            await carregarUsuario();

        }


    } catch (erro) {

        console.error(
            "[API] Erro na inicialização:",
            erro
        );

    }

})();
