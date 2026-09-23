"use strict";

// =====================================================
// MACVENDAS - API.JS
// SUBSTITUIÇÃO COMPLETA DO FIREBASE
// =====================================================

// =====================================================
// CONFIGURAÇÃO DA API
// =====================================================

const API_URL =
    "http://br1.bronxyshost.com:4234";


// =====================================================
// FUNÇÃO PRINCIPAL DA API
// =====================================================

async function apiFetch(
    endpoint,
    options = {}
) {

    const config = {
        ...options,
        headers: {
            "Content-Type":
                "application/json",

            ...(options.headers || {})
        }
    };

    // -------------------------------------------------
    // API KEY
    // -------------------------------------------------

    const apiKey =
        localStorage.getItem(
            "apiKey"
        );

    if (apiKey) {

        config.headers[
            "x-api-key"
        ] = apiKey;

    }

    // -------------------------------------------------
    // REQUEST
    // -------------------------------------------------

    let resposta;

    try {

        resposta =
            await fetch(
                `${API_URL}${endpoint}`,
                config
            );

    }
    catch (error) {

        console.error(
            "[API] Erro de conexão:",
            error
        );

        throw new Error(
            "Não foi possível conectar ao servidor."
        );

    }

    // -------------------------------------------------
    // JSON
    // -------------------------------------------------

    let dados = {};

    try {

        dados =
            await resposta.json();

    }
    catch {

        dados = {};

    }

    // -------------------------------------------------
    // ERRO HTTP
    // -------------------------------------------------

    if (!resposta.ok) {

        throw new Error(
            dados.message ||
            dados.error ||
            `Erro HTTP ${resposta.status}`
        );

    }

    return dados;
}


// =====================================================
// TESTAR API
// =====================================================

async function testarAPI() {

    try {

        const dados =
            await apiFetch(
                "/status"
            );

        console.log(
            "[API] Servidor online:",
            dados
        );

        return dados;

    }
    catch (error) {

        console.error(
            "[API] Servidor offline:",
            error
        );

        return null;

    }

}


// =====================================================
// GERAR API KEY
// =====================================================
// Mantido por compatibilidade.
// A API do servidor também gera uma API Key.
// =====================================================

function gerarApiKey() {

    try {

        if (
            typeof crypto !==
                "undefined" &&
            typeof crypto.randomUUID ===
                "function"
        ) {

            return (
                "mk_" +
                crypto
                    .randomUUID()
                    .replace(
                        /-/g,
                        ""
                    )
            );

        }

    }
    catch (error) {

        console.warn(
            "[API] Erro ao gerar API Key:",
            error
        );

    }

    return (
        "mk_" +
        Date.now() +
        "_" +
        Math.random()
            .toString(36)
            .substring(
                2,
                18
            )
    );

}


// =====================================================
// OBTER USUÁRIO DO LOCAL STORAGE
// =====================================================

function obterUsuarioLocal() {

    try {

        const dados =
            localStorage.getItem(
                "userData"
            );

        if (!dados) {

            return null;

        }

        return JSON.parse(
            dados
        );

    }
    catch (error) {

        console.error(
            "[API] Erro ao ler userData:",
            error
        );

        return null;

    }

}


// =====================================================
// SALVAR USUÁRIO
// =====================================================

function salvarUsuario(
    usuario
) {

    if (!usuario) {

        return;

    }

    localStorage.setItem(
        "userData",
        JSON.stringify(
            usuario
        )
    );

    if (
        usuario.uid
    ) {

        localStorage.setItem(
            "uid",
            usuario.uid
        );

    }

    if (
        usuario.apiKey
    ) {

        localStorage.setItem(
            "apiKey",
            usuario.apiKey
        );

    }

}


// =====================================================
// LIMPAR SESSÃO
// =====================================================

function limparSessao() {

    localStorage.removeItem(
        "userData"
    );

    localStorage.removeItem(
        "uid"
    );

    localStorage.removeItem(
        "apiKey"
    );

}


// =====================================================
// TRADUZIR ERRO
// =====================================================

function traduzirErro(
    error
) {

    if (!error) {

        return "Ocorreu um erro.";

    }

    const mensagem =
        error.message ||
        String(error);

    const mensagens = {

        "Failed to fetch":
            "Não foi possível conectar ao servidor.",

        "NetworkError":
            "Erro de conexão com a internet.",

        "Unauthorized":
            "Sessão inválida. Faça login novamente.",

        "API Key inválida.":
            "Sua sessão expirou. Faça login novamente.",

        "API Key não informada.":
            "Sua sessão não está ativa."

    };

    return (
        mensagens[mensagem] ||
        mensagem ||
        "Ocorreu um erro. Tente novamente."
    );

}


// =====================================================
// REGISTRAR USUÁRIO
// =====================================================

async function registerUser(
    name,
    email,
    password
) {

    name =
        String(
            name || ""
        ).trim();

    email =
        String(
            email || ""
        )
            .trim()
            .toLowerCase();

    password =
        String(
            password || ""
        );

    // -------------------------------------------------
    // VALIDAÇÕES
    // -------------------------------------------------

    if (!name) {

        return {

            success: false,

            message:
                "Informe seu nome."

        };

    }

    if (!email) {

        return {

            success: false,

            message:
                "Informe o email."

        };

    }

    if (!password) {

        return {

            success: false,

            message:
                "Informe a palavra-passe."

        };

    }

    if (
        password.length < 6
    ) {

        return {

            success: false,

            message:
                "A palavra-passe deve ter pelo menos 6 caracteres."

        };

    }

    // -------------------------------------------------
    // API
    // -------------------------------------------------

    try {

        console.log(
            "[API] Criando conta..."
        );

        const dados =
            await apiFetch(
                "/auth/register",
                {

                    method:
                        "POST",

                    body:
                        JSON.stringify({

                            name:
                                name,

                            email:
                                email,

                            password:
                                password

                        })

                }
            );

        console.log(
            "[API] Conta criada."
        );

        // -------------------------------------------------
        // USUÁRIO
        // -------------------------------------------------

        const usuario =
            dados.user ||
            dados.usuario;

        if (!usuario) {

            return {

                success: false,

                message:
                    "A API não retornou os dados do usuário."

            };

        }

        salvarUsuario(
            usuario
        );

        return {

            success: true,

            message:
                dados.message ||
                "Conta criada com sucesso!",

            user:
                usuario

        };

    }
    catch (error) {

        console.error(
            "[API] ERRO CADASTRO:",
            error
        );

        return {

            success: false,

            message:
                traduzirErro(
                    error
                )

        };

    }

}


// =====================================================
// LOGIN
// =====================================================

async function loginUser(
    email,
    password
) {

    email =
        String(
            email || ""
        )
            .trim()
            .toLowerCase();

    password =
        String(
            password || ""
        );

    // -------------------------------------------------
    // VALIDAÇÃO
    // -------------------------------------------------

    if (
        !email ||
        !password
    ) {

        return {

            success: false,

            message:
                "Informe o email e a palavra-passe."

        };

    }

    try {

        console.log(
            "[API] Iniciando login..."
        );

        // -------------------------------------------------
        // IMPORTANTE
        // -------------------------------------------------
        // Remover API KEY antiga antes do login.
        // -------------------------------------------------

        localStorage.removeItem(
            "apiKey"
        );

        const dados =
            await apiFetch(
                "/auth/login",
                {

                    method:
                        "POST",

                    body:
                        JSON.stringify({

                            email:
                                email,

                            password:
                                password

                        })

                }
            );

        console.log(
            "[API] Login OK."
        );

        const usuario =
            dados.user ||
            dados.usuario;

        if (!usuario) {

            return {

                success: false,

                message:
                    "A API não retornou os dados do usuário."

            };

        }

        // -------------------------------------------------
        // SALVAR
        // -------------------------------------------------

        salvarUsuario(
            usuario
        );

        console.log(
            "[API] UID:",
            usuario.uid
        );

        console.log(
            "[API] API Key carregada."
        );

        return {

            success: true,

            message:
                dados.message ||
                "Login realizado com sucesso.",

            user:
                usuario

        };

    }
    catch (error) {

        console.error(
            "[API] ERRO LOGIN:",
            error
        );

        limparSessao();

        return {

            success: false,

            message:
                traduzirErro(
                    error
                )

        };

    }

}


// =====================================================
// GOOGLE LOGIN
// =====================================================
// Firebase foi removido.
// A API atual ainda não possui Google OAuth.
// =====================================================

async function googleLogin() {

    return {

        success: false,

        message:
            "Login com Google ainda não está disponível nesta API."

    };

}


// =====================================================
// OBTER DADOS DO USUÁRIO
// =====================================================

async function obterDadosUsuario() {

    const apiKey =
        localStorage.getItem(
            "apiKey"
        );

    // -------------------------------------------------
    // NÃO TEM SESSÃO
    // -------------------------------------------------

    if (!apiKey) {

        console.warn(
            "[API] Nenhuma API Key encontrada."
        );

        return null;

    }

    try {

        const dados =
            await apiFetch(
                "/auth/me"
            );

        const usuario =
            dados.user ||
            dados.usuario;

        if (!usuario) {

            return null;

        }

        salvarUsuario(
            usuario
        );

        return usuario;

    }
    catch (error) {

        console.error(
            "[API] Erro ao obter usuário:",
            error
        );

        return null;

    }

}


// =====================================================
// OBTER UID
// =====================================================

function obterUID() {

    const uid =
        localStorage.getItem(
            "uid"
        );

    return uid || null;

}


// =====================================================
// OBTER API KEY
// =====================================================

async function obterApiKey() {

    const apiKey =
        localStorage.getItem(
            "apiKey"
        );

    if (apiKey) {

        return apiKey;

    }

    const usuario =
        await obterDadosUsuario();

    return (
        usuario?.apiKey ||
        null
    );

}


// =====================================================
// RECUPERAR SENHA
// =====================================================
// A API atual ainda não possui sistema de email.
// =====================================================

async function recuperarSenha(
    email
) {

    email =
        String(
            email || ""
        )
            .trim()
            .toLowerCase();

    if (!email) {

        return {

            success: false,

            message:
                "Informe seu email."

        };

    }

    return {

        success: false,

        message:
            "A recuperação de senha ainda não está disponível na API."

    };

}


// =====================================================
// REENVIAR VERIFICAÇÃO
// =====================================================
// A API atual não usa verificação de email.
// =====================================================

async function resendVerification() {

    return {

        success: false,

        message:
            "A verificação de email não está disponível na API."

    };

}


// =====================================================
// SAIR
// =====================================================

async function sair() {

    try {

        limparSessao();

        console.log(
            "[API] Sessão encerrada."
        );

        window.location.href =
            "/";

    }
    catch (error) {

        console.error(
            "[API] Erro ao sair:",
            error
        );

    }

}


// =====================================================
// ESTADO DE AUTENTICAÇÃO
// =====================================================
// Compatibilidade com o código antigo.
// Não existe Firebase Auth.
// =====================================================

function onAuthState(
    callback
) {

    if (
        typeof callback !==
        "function"
    ) {

        return () => {};

    }

    // -------------------------------------------------
    // Verificar sessão local
    // -------------------------------------------------

    const usuario =
        obterUsuarioLocal();

    setTimeout(
        () => {

            callback(
                usuario
            );

        },
        0
    );

    // -------------------------------------------------
    // Retornar função de unsubscribe
    // -------------------------------------------------

    return () => {};

}


// =====================================================
// VERIFICAR SESSÃO
// =====================================================

async function verificarSessao() {

    const apiKey =
        localStorage.getItem(
            "apiKey"
        );

    if (!apiKey) {

        return {

            autenticado:
                false,

            user:
                null

        };

    }

    const usuario =
        await obterDadosUsuario();

    if (!usuario) {

        limparSessao();

        return {

            autenticado:
                false,

            user:
                null

        };

    }

    return {

        autenticado:
            true,

        user:
            usuario

    };

}


// =====================================================
// COMPRAS
// =====================================================

async function obterCompras() {

    try {

        const dados =
            await apiFetch(
                "/compras"
            );

        return (
            dados.compras ||
            []
        );

    }
    catch (error) {

        console.error(
            "[API] Erro compras:",
            error
        );

        return [];

    }

}


async function registrarCompra(
    compra
) {

    try {

        const dados =
            await apiFetch(
                "/compras",
                {

                    method:
                        "POST",

                    body:
                        JSON.stringify(
                            compra
                        )

                }
            );

        return dados;

    }
    catch (error) {

        console.error(
            "[API] Erro registrar compra:",
            error
        );

        return {

            success: false,

            message:
                traduzirErro(
                    error
                )

        };

    }

}


// =====================================================
// CLIENTES
// =====================================================

async function obterClientes() {

    try {

        const dados =
            await apiFetch(
                "/clientes"
            );

        return (
            dados.clientes ||
            []
        );

    }
    catch (error) {

        console.error(
            "[API] Erro clientes:",
            error
        );

        return [];

    }

}


async function criarCliente(
    cliente
) {

    try {

        return await apiFetch(
            "/clientes",
            {

                method:
                    "POST",

                body:
                    JSON.stringify(
                        cliente
                    )

            }
        );

    }
    catch (error) {

        return {

            success: false,

            message:
                traduzirErro(
                    error
                )

        };

    }

}


// =====================================================
// GRUPOS
// =====================================================

async function obterGrupos() {

    try {

        const dados =
            await apiFetch(
                "/grupos"
            );

        return (
            dados.grupos ||
            []
        );

    }
    catch (error) {

        console.error(
            "[API] Erro grupos:",
            error
        );

        return [];

    }

}


async function criarGrupo(
    grupo
) {

    try {

        return await apiFetch(
            "/grupos",
            {

                method:
                    "POST",

                body:
                    JSON.stringify(
                        grupo
                    )

            }
        );

    }
    catch (error) {

        return {

            success: false,

            message:
                traduzirErro(
                    error
                )

        };

    }

}


// =====================================================
// PACOTES
// =====================================================

async function obterPacotes() {

    try {

        const dados =
            await apiFetch(
                "/pacotes"
            );

        return (
            dados.pacotes ||
            []
        );

    }
    catch (error) {

        console.error(
            "[API] Erro pacotes:",
            error
        );

        return [];

    }

}


async function criarPacote(
    pacote
) {

    try {

        return await apiFetch(
            "/pacotes",
            {

                method:
                    "POST",

                body:
                    JSON.stringify(
                        pacote
                    )

            }
        );

    }
    catch (error) {

        return {

            success: false,

            message:
                traduzirErro(
                    error
                )

        };

    }

}


// =====================================================
// DASHBOARD
// =====================================================

async function obterDashboard() {

    try {

        return await apiFetch(
            "/dashboard"
        );

    }
    catch (error) {

        console.error(
            "[API] Erro dashboard:",
            error
        );

        return {

            success: false,

            message:
                traduzirErro(
                    error
                )

        };

    }

}


// =====================================================
// DISPONIBILIZAR NO WINDOW
// =====================================================

window.API_URL =
    API_URL;

window.apiFetch =
    apiFetch;

window.testarAPI =
    testarAPI;

window.gerarApiKey =
    gerarApiKey;

window.criarConta =
    registerUser;

window.entrar =
    loginUser;

window.googleLogin =
    googleLogin;

window.sair =
    sair;

window.obterDadosUsuario =
    obterDadosUsuario;

window.obterUID =
    obterUID;

window.obterApiKey =
    obterApiKey;

window.recuperarSenha =
    recuperarSenha;

window.resendVerification =
    resendVerification;

window.onAuthState =
    onAuthState;

window.verificarSessao =
    verificarSessao;

window.obterCompras =
    obterCompras;

window.registrarCompra =
    registrarCompra;

window.obterClientes =
    obterClientes;

window.criarCliente =
    criarCliente;

window.obterGrupos =
    obterGrupos;

window.criarGrupo =
    criarGrupo;

window.obterPacotes =
    obterPacotes;

window.criarPacote =
    criarPacote;

window.obterDashboard =
    obterDashboard;


// =====================================================
// EXPORTAÇÕES
// =====================================================

export {

    API_URL,

    apiFetch,

    testarAPI,

    gerarApiKey,

    registerUser,

    loginUser,

    googleLogin,

    sair,

    obterDadosUsuario,

    obterUID,

    obterApiKey,

    recuperarSenha,

    resendVerification,

    onAuthState,

    verificarSessao,

    obterCompras,

    registrarCompra,

    obterClientes,

    criarCliente,

    obterGrupos,

    criarGrupo,

    obterPacotes,

    criarPacote,

    obterDashboard

};


// =====================================================
// INICIALIZAÇÃO
// =====================================================

console.log(
    "======================================"
);

console.log(
    "[MACVENDAS] API inicializada."
);

console.log(
    "[MACVENDAS] API:",
    API_URL
);

console.log(
    "[MACVENDAS] Firebase: DESATIVADO"
);

console.log(
    "======================================"
);

testarAPI();

