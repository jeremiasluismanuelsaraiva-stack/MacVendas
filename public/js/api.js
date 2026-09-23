"use strict";

/*
=====================================================
 MACVENDAS
 API.JS
 CREDENCIAIS + API + USUÁRIO
 SEM FIREBASE
=====================================================

 API PRINCIPAL:

 http://br1.bronxyshost.com:4234/api

 CREDENCIAIS:

 - UID
 - API Key

 As credenciais são obtidas do localStorage.

 O arquivo também cria:

 window.MOZ_API
 window.MOZ_CREDENCIAIS_API

 para integração com app.js/dashboard.js.
=====================================================
*/


// =====================================================
// CONFIGURAÇÃO
// =====================================================

const API_URL =
    "/api";


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

        uid:
            String(
                uid || ""
            ).trim(),

        apiKey:
            String(
                apiKey || ""
            ).trim()

    };
}


// =====================================================
// SALVAR CREDENCIAIS
// =====================================================

function salvarCredenciais(
    uid,
    apiKey
) {

    uid =
        String(
            uid || ""
        ).trim();

    apiKey =
        String(
            apiKey || ""
        ).trim();


    if (uid) {

        localStorage.setItem(
            "uid",
            uid
        );

        localStorage.setItem(
            "userUID",
            uid
        );

        localStorage.setItem(
            "moz_uid",
            uid
        );
    }


    if (apiKey) {

        localStorage.setItem(
            "apiKey",
            apiKey
        );

        localStorage.setItem(
            "api_key",
            apiKey
        );

        localStorage.setItem(
            "moz_api_key",
            apiKey
        );
    }

}


// =====================================================
// DEFINIR CREDENCIAIS
// =====================================================

function definirCredenciais(
    uid,
    apiKey
) {

    usuarioAPI.uid =
        String(
            uid || ""
        ).trim();

    usuarioAPI.apiKey =
        String(
            apiKey || ""
        ).trim();


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

        uid:
            usuarioAPI.uid,

        apiKey:
            usuarioAPI.apiKey

    };
}


// =====================================================
// OBTER CREDENCIAIS
// =====================================================

async function obterCredenciais() {

    /*
    =====================================================
    A API própria não utiliza Firebase.

    As credenciais vêm do localStorage.
    =====================================================
    */

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
// FUNÇÃO DE COMPATIBILIDADE
// =====================================================

async function obterDadosFirebase() {

    /*
     * Firebase foi removido.
     *
     * Mantemos esta função apenas para evitar
     * quebrar código antigo do frontend que
     * ainda possa chamá-la.
     */

    const credenciais =
        obterCredenciaisLocalStorage();


    if (!credenciais.uid) {
        return null;
    }


    return {

        uid:
            credenciais.uid,

        apiKey:
            credenciais.apiKey,

        nome:
            usuarioAPI.fullName,

        fullName:
            usuarioAPI.fullName,

        email:
            usuarioAPI.email

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


    /*
     * UID
     */

    if (
        credenciais.uid
    ) {

        headers["x-uid"] =
            credenciais.uid;

        headers["uid"] =
            credenciais.uid;
    }


    /*
     * API KEY
     */

    if (
        credenciais.apiKey
    ) {

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


    /*
     * BODY
     */

    if (
        dados !== undefined &&
        metodo !== "GET" &&
        metodo !== "HEAD"
    ) {

        opcoes.body =
            JSON.stringify(
                dados
            );
    }


    /*
     * URL
     */

    const url =
        API_URL +
        endpoint;


    console.log(
        `[API] ${metodo} ${url}`
    );


    /*
     * REQUEST
     */

    let resposta;

    try {

        resposta =
            await fetch(
                url,
                opcoes
            );

    } catch (erro) {

        console.error(
            "[API] Erro de conexão:",
            erro
        );

        throw new Error(
            "Não foi possível conectar à API do MacVendas."
        );
    }


    /*
     * RESPOSTA
     */

    const texto =
        await resposta.text();


    let resultado = {};


    if (texto) {

        try {

            resultado =
                JSON.parse(
                    texto
                );

        } catch (_) {

            resultado = {

                success:
                    resposta.ok,

                message:
                    texto

            };
        }
    }


    /*
     * ERRO HTTP
     */

    if (!resposta.ok) {

        const mensagem =
            resultado?.error ||
            resultado?.erro ||
            resultado?.message ||
            `HTTP ${resposta.status}`;

        throw new Error(
            mensagem
        );
    }


    return resultado;
}


// =====================================================
// GET
// =====================================================

async function apiGet(
    endpoint
) {

    try {

        return await fazerRequisicao(
            "GET",
            endpoint
        );

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
// PATCH
// =====================================================

async function apiPatch(
    endpoint,
    dados = {}
) {

    try {

        return await fazerRequisicao(
            "PATCH",
            endpoint,
            dados
        );

    } catch (erro) {

        console.error(
            "[API PATCH]",
            endpoint,
            erro
        );

        throw erro;
    }
}


// =====================================================
// DELETE
// =====================================================

async function apiDelete(
    endpoint
) {

    try {

        return await fazerRequisicao(
            "DELETE",
            endpoint
        );

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
         * Buscar configurações do usuário
         */

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


        /*
         * NOME
         */

        usuarioAPI.fullName =
            configuracao.nomeEmpresa ||
            configuracao.nome ||
            configuracao.fullName ||
            configuracao.nomeUsuario ||
            usuarioAPI.fullName ||
            "";


        /*
         * EMAIL
         */

        usuarioAPI.email =
            configuracao.email ||
            usuarioAPI.email ||
            "";


        /*
         * CREDENCIAIS
         */

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

    } catch (erro) {

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

async function copiarCodigo(
    codigo
) {

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
// LIMPAR SESSÃO
// =====================================================

function limparCredenciais() {

    /*
     * Remover todas as chaves utilizadas
     * pelo sistema antigo e novo.
     */

    localStorage.removeItem(
        "uid"
    );

    localStorage.removeItem(
        "userUID"
    );

    localStorage.removeItem(
        "moz_uid"
    );

    localStorage.removeItem(
        "apiKey"
    );

    localStorage.removeItem(
        "api_key"
    );

    localStorage.removeItem(
        "moz_api_key"
    );


    usuarioAPI = {

        uid: "",

        apiKey: "",

        fullName: "",

        email: ""

    };


    window.MOZ_CREDENCIAIS_API =
        null;
}


// =====================================================
// TESTAR API
// =====================================================

async function testarAPI() {

    try {

        const resposta =
            await fetch(
                API_URL,
                {
                    method:
                        "GET",

                    cache:
                        "no-store"
                }
            );


        const texto =
            await resposta.text();


        let dados;

        try {

            dados =
                JSON.parse(
                    texto
                );

        } catch {

            dados = texto;
        }


        console.log(
            "[API] Teste:",
            resposta.status,
            dados
        );


        return {

            success:
                resposta.ok,

            status:
                resposta.status,

            data:
                dados

        };

    } catch (erro) {

        console.error(
            "[API] Falha no teste:",
            erro
        );

        return {

            success:
                false,

            status:
                0,

            error:
                erro.message

        };
    }
}


// =====================================================
// OBJETO MOZ_API
// =====================================================

window.MOZ_API = {

    URL:
        API_URL,

    definirCredenciais,

    obterCredenciais,

    obterHeadersAPI,

    verificarCredenciais,

    carregarUsuario,

    testarAPI,

    limparCredenciais,

    get:
        apiGet,

    post:
        apiPost,

    put:
        apiPut,

    patch:
        apiPatch,

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

window.apiPatch =
    apiPatch;

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

window.testarAPI =
    testarAPI;

window.limparCredenciais =
    limparCredenciais;


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

            console.log(
                "[API] API Key encontrada."
            );

        } else {

            console.warn(
                "[API] Nenhum conjunto completo de credenciais encontrado."
            );
        }

    } catch (erro) {

        console.error(
            "[API] Err

