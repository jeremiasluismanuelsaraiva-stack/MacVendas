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

 Este arquivo também cria:

 window.MOZ_API
 window.MOZ_CREDENCIAIS_API

 para integração com app.js/dashboard.js.
=====================================================
*/


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
// CREDENCIAIS LOCAIS
// =====================================================

function obterCredenciaisLocalStorage() {

    const uid =
        localStorage.getItem("uid") ||
        localStorage.getItem("userUID") ||
        localStorage.getItem("moz_uid") ||
        "";

    const apiKey =
        localStorage.getItem("apiKey") ||
        localStorage.getItem("api_key") ||
        localStorage.getItem("moz_api_key") ||
        "";

    return {
        uid: String(uid || "").trim(),
        apiKey: String(apiKey || "").trim()
    };

}


function salvarCredenciais(uid, apiKey) {

    uid =
        String(uid || "").trim();

    apiKey =
        String(apiKey || "").trim();


    if (uid) {

        localStorage.setItem("uid", uid);
        localStorage.setItem("userUID", uid);
        localStorage.setItem("moz_uid", uid);

    }


    if (apiKey) {

        localStorage.setItem("apiKey", apiKey);
        localStorage.setItem("api_key", apiKey);
        localStorage.setItem("moz_api_key", apiKey);

    }

}


// =====================================================
// DEFINIR CREDENCIAIS
// =====================================================

function definirCredenciais(uid, apiKey) {

    usuarioAPI.uid =
        String(uid || "").trim();

    usuarioAPI.apiKey =
        String(apiKey || "").trim();


    if (
        usuarioAPI.uid &&
        usuarioAPI.apiKey
    ) {

        window.MOZ_CREDENCIAIS_API = {

            uid:
                usuarioAPI.uid,

            apiKey:
                usuarioAPI.apiKey

        };

    }


    salvarCredenciais(
        usuarioAPI.uid,
        usuarioAPI.apiKey
    );


    return {
        uid: usuarioAPI.uid,
        apiKey: usuarioAPI.apiKey
    };

}


// =====================================================
// FIREBASE
// =====================================================

async function aguardarFirebase(
    tempoMaximo = 10000
) {

    const inicio =
        Date.now();


    while (
        typeof window.obterDadosUsuario !== "function" &&
        Date.now() - inicio < tempoMaximo
    ) {

        await new Promise(
            resolve =>
                setTimeout(resolve, 100)
        );

    }


    return (
        typeof window.obterDadosUsuario === "function"
    );

}


async function obterDadosFirebase() {

    try {

        const firebaseDisponivel =
            await aguardarFirebase();


        if (!firebaseDisponivel) {

            console.warn(
                "[API] firebase.js não ficou disponível."
            );

            return null;

        }


        let dados =
            await window.obterDadosUsuario();


        if (
            dados &&
            dados.uid
        ) {

            return dados;

        }


        if (
            typeof window.onAuthState === "function"
        ) {

            console.log(
                "[API] Aguardando restauração da sessão Firebase..."
            );


            dados =
                await new Promise(
                    (resolve) => {

                        let finalizado =
                            false;


                        const terminar =
                            async (usuario) => {

                                if (finalizado) {
                                    return;
                                }


                                finalizado =
                                    true;


                                try {

                                    if (!usuario) {

                                        resolve(null);
                                        return;

                                    }


                                    const dadosUsuario =
                                        await window.obterDadosUsuario();


                                    resolve(
                                        dadosUsuario || null
                                    );

                                }
                                catch (erro) {

                                    console.error(
                                        "[API] Erro ao obter dados Firebase:",
                                        erro
                                    );

                                    resolve(null);

                                }

                            };


                        try {

                            window.onAuthState(
                                async (usuario) => {

                                    await terminar(
                                        usuario
                                    );

                                }
                            );

                        }
                        catch (erro) {

                            console.error(
                                "[API] Erro no onAuthState:",
                                erro
                            );

                            resolve(null);

                        }


                        setTimeout(
                            () => {

                                if (!finalizado) {

                                    finalizado =
                                        true;

                                    console.warn(
                                        "[API] Timeout aguardando Firebase Auth."
                                    );

                                    resolve(null);

                                }

                            },
                            10000
                        );

                    }
                );


            if (
                dados &&
                dados.uid
            ) {

                return dados;

            }

        }

    }
    catch (erro) {

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


    if (
        dadosFirebase &&
        dadosFirebase.uid
    ) {

        const uid =
            String(
                dadosFirebase.uid || ""
            ).trim();


        const apiKey =
            String(
                dadosFirebase.apiKey ||
                dadosFirebase.api_key ||
                ""
            ).trim();


        if (uid) {

            usuarioAPI.uid =
                uid;

        }


        if (apiKey) {

            usuarioAPI.apiKey =
                apiKey;

        }


        definirCredenciais(
            uid,
            apiKey
        );


        usuarioAPI.fullName =
            dadosFirebase.fullName ||
            dadosFirebase.full_name ||
            dadosFirebase.name ||
            dadosFirebase.nome ||
            "";

        usuarioAPI.email =
            dadosFirebase.email ||
            "";


        console.log(
            "[API] Credenciais obtidas pelo Firebase:",
            {
                uid,
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


    if (
        local.uid &&
        local.apiKey
    ) {

        window.MOZ_CREDENCIAIS_API = {

            uid:
                local.uid,

            apiKey:
                local.apiKey

        };

    }


    return {

        uid:
            local.uid,

        apiKey:
            local.apiKey,

        dadosFirebase:
            null

    };

}


// =====================================================
// HEADERS
// =====================================================

async function obterHeadersAPI() {

    const credenciais =
        await obterCredenciais();


    const headers = {

        "Accept":
            "application/json",

        "Content-Type":
            "application/json"

    };


    if (credenciais.uid) {

        headers["x-uid"] =
            credenciais.uid;

        headers["uid"] =
            credenciais.uid;

    }


    if (credenciais.apiKey) {

        headers["x-api-key"] =
            credenciais.apiKey;

        headers["apiKey"] =
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
// REQUISIÇÃO GENÉRICA
// =====================================================

async function fazerRequisicao(
    metodo,
    endpoint,
    dados = undefined
) {

    const headers =
        await obterHeadersAPI();


    const opcoes = {

        method:
            metodo,

        headers,

        cache:
            "no-store"

    };


    if (
        dados !== undefined &&
        metodo !== "GET" &&
        metodo !== "HEAD"
    ) {

        opcoes.body =
            JSON.stringify(dados);

    }


    const resposta =
        await fetch(
            API_URL + endpoint,
            opcoes
        );


    const texto =
        await resposta.text();


    let resultado = {};


    if (texto) {

        try {

            resultado =
                JSON.parse(texto);

        }
        catch (_) {

            resultado = {

                success:
                    resposta.ok,

                message:
                    texto

            };

        }

    }


    if (!resposta.ok) {

        throw new Error(

            resultado?.error ||
            resultado?.erro ||
            resultado?.message ||
            `HTTP ${resposta.status}`

        );

    }


    return resultado;

}


// =====================================================
// GET
// =====================================================

async function apiGet(endpoint) {

    try {

        return await fazerRequisicao(
            "GET",
            endpoint
        );

    }
    catch (erro) {

        console.error(
            "[API GET]",
            endpoint,
            erro
        );

        throw erro;

    }

}


// =====================================================
// POST
// =====================================================

async function apiPost(
    endpoint,
    dados = {}
) {

    try {

        return await fazerRequisicao(
            "POST",
            endpoint,
            dados
        );

    }
    catch (erro) {

        console.error(
            "[API POST]",
            endpoint,
            erro
        );

        throw erro;

    }

}


// =====================================================
// PUT
// =====================================================

async function apiPut(
    endpoint,
    dados = {}
) {

    try {

        return await fazerRequisicao(
            "PUT",
            endpoint,
            dados
        );

    }
    catch (erro) {

        console.error(
            "[API PUT]",
            endpoint,
            erro
        );

        throw erro;

    }

}


// =====================================================
// DELETE
// =====================================================

async function apiDelete(endpoint) {

    try {

        return await fazerRequisicao(
            "DELETE",
            endpoint
        );

    }
    catch (erro) {

        console.error(
            "[API DELETE]",
            endpoint,
            erro
        );

        throw erro;

    }

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


        const dados =
            await apiGet(
                "/configuracoes"
            );


        const configuracao =
            dados?.configuracao ||
            dados?.config ||
            dados?.data ||
            dados ||
            {};


        usuarioAPI.fullName =
            configuracao.nomeEmpresa ||
            configuracao.nome ||
            configuracao.fullName ||
            credenciais.dadosFirebase?.nome ||
            credenciais.dadosFirebase?.name ||
            credenciais.dadosFirebase?.displayName ||
            usuarioAPI.fullName ||
            "";


        usuarioAPI.email =
            configuracao.email ||
            credenciais.dadosFirebase?.email ||
            usuarioAPI.email ||
            "";


        usuarioAPI.uid =
            credenciais.uid;


        usuarioAPI.apiKey =
            credenciais.apiKey;


        console.log(
            "[API] Usuário carregado:",
            {
                uid:
                    usuarioAPI.uid,

                nome:
                    usuarioAPI.fullName,

                email:
                    usuarioAPI.email
            }
        );


        return usuarioAPI;

    }
    catch (erro) {

        console.error(
            "[API] Erro ao carregar usuário:",
            erro
        );

        return null;

    }

}


// =====================================================
// COPIAR UID
// =====================================================

async function copiarUID() {

    const credenciais =
        await obterCredenciais();


    const uid =
        usuarioAPI.uid ||
        credenciais.uid;


    if (!uid) {

        console.warn(
            "[API] UID não disponível para copiar."
        );

        return;

    }


    try {

        await navigator.clipboard.writeText(
            uid
        );

        console.log(
            "[API] UID copiado."
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

    const credenciais =
        await obterCredenciais();


    const apiKey =
        usuarioAPI.apiKey ||
        credenciais.apiKey;


    if (!apiKey) {

        console.warn(
            "[API] API Key não disponível para copiar."
        );

        return;

    }


    try {

        await navigator.clipboard.writeText(
            apiKey
        );

        console.log(
            "[API] API Key copiada."
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

    }
    catch (erro) {

        console.error(
            "[API] Erro ao copiar código:",
            erro
        );

    }

}


// =====================================================
// OBJETO MOZ_API
// =====================================================

window.MOZ_API = {

    definirCredenciais,

    obterCredenciais,

    obterHeadersAPI,

    verificarCredenciais,

    carregarUsuario,

    get:
        apiGet,

    post:
        apiPost,

    put:
        apiPut,

    delete:
        apiDelete

};


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

window.definirCredenciaisAPI =
    definirCredenciais;

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


        if (
            credenciais.uid &&
            credenciais.apiKey
        ) {

            console.log(
                "[API] UID atual:",
                credenciais.uid
            );


            /*
            Não é obrigatório carregar /configuracoes
            aqui. O dashboard/app poderá fazer isso
            depois que a autenticação estiver pronta.
            */

        }
        else {

            console.warn(
                "[API] Nenhum conjunto completo de credenciais encontrado."
            );

        }

    }
    catch (erro) {

        console.error(
            "[API] Erro na inicialização:",
            erro
        );

    }

})();
