// =====================================================
// MACVENDAS - FIREBASE.JS
// FIREBASE CLIENT
// =====================================================

"use strict";

// =====================================================
// FIREBASE APP
// =====================================================

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

// =====================================================
// FIREBASE AUTH
// =====================================================

import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendEmailVerification,
    sendPasswordResetEmail,
    onAuthStateChanged,
    signOut,
    GoogleAuthProvider,
    signInWithPopup,
    updateProfile
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// =====================================================
// FIREBASE REALTIME DATABASE
// =====================================================

import {
    getDatabase,
    ref,
    get,
    set,
    update
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

// =====================================================
// CONFIGURAÇÃO DO FIREBASE
// =====================================================
//
// Esta configuração identifica o PROJETO Firebase.
//
// NÃO colocar aqui:
// - UID do usuário
// - API Key individual do usuário
//
// UID será obtido pelo Firebase Authentication.
//
// API Key individual será obtida em:
//
// users/{UID}/apiKey
//
// =====================================================

const firebaseConfig = {

    apiKey:
        "AIzaSyBwRDNVI8bwr65s_FaVgwEtKhrorLD6VUI",

    authDomain:
        "macvendas.firebaseapp.com",

    databaseURL:
        "https://macvendas-default-rtdb.firebaseio.com",

    projectId:
        "macvendas",

    storageBucket:
        "macvendas.firebasestorage.app",

    messagingSenderId:
        "379729143460",

    appId:
        "1:379729143460:web:9ebbd307a8e730984aa831",

    measurementId:
        "G-XGH076BKGN"

};

// =====================================================
// INICIALIZAR FIREBASE
// =====================================================

const app = initializeApp(firebaseConfig);

// =====================================================
// AUTHENTICATION
// =====================================================

const auth = getAuth(app);

// =====================================================
// REALTIME DATABASE
// =====================================================

const database = getDatabase(app);

console.log("[FIREBASE] Firebase inicializado.");
console.log("[FIREBASE] Projeto:", firebaseConfig.projectId);
console.log("[FIREBASE] Database:", firebaseConfig.databaseURL);

// =====================================================
// GERAR API KEY INDIVIDUAL
// =====================================================

function gerarApiKey() {

    try {

        if (
            typeof crypto !== "undefined" &&
            typeof crypto.randomUUID === "function"
        ) {

            return (
                "mk_" +
                crypto
                    .randomUUID()
                    .replace(/-/g, "")
            );

        }

    }
    catch (erro) {

        console.warn(
            "[FIREBASE] Erro ao gerar API Key:",
            erro
        );

    }

    return (
        "mk_" +
        Date.now() +
        "_" +
        Math.random()
            .toString(36)
            .substring(2, 18)
    );

}

// =====================================================
// TRADUZIR ERROS
// =====================================================

function traduzirErroFirebase(error) {

    const codigo = error?.code || "";

    const mensagens = {

        "auth/email-already-in-use":
            "Este email já está registado.",

        "auth/invalid-email":
            "O email informado não é válido.",

        "auth/weak-password":
            "A palavra-passe deve ter pelo menos 6 caracteres.",

        "auth/user-not-found":
            "Usuário não encontrado.",

        "auth/wrong-password":
            "Palavra-passe incorreta.",

        "auth/invalid-credential":
            "Email ou palavra-passe incorretos.",

        "auth/user-disabled":
            "Esta conta foi desativada.",

        "auth/too-many-requests":
            "Muitas tentativas. Tente novamente mais tarde.",

        "auth/popup-closed-by-user":
            "A janela do Google foi fechada.",

        "auth/popup-blocked":
            "O navegador bloqueou a janela do Google.",

        "auth/cancelled-popup-request":
            "O login Google foi cancelado.",

        "auth/network-request-failed":
            "Erro de conexão com a internet.",

        "auth/operation-not-allowed":
            "Este método de login não está ativado no Firebase.",

        "auth/invalid-api-key":
            "A configuração do Firebase está incorreta.",

        "auth/app-not-authorized":
            "Este domínio não está autorizado no Firebase.",

        "PERMISSION_DENIED":
            "O Firebase bloqueou o acesso ao Realtime Database. Verifique as regras.",

        "NETWORK_ERROR":
            "Não foi possível conectar ao Realtime Database."

    };

    return (
        mensagens[codigo] ||
        error?.message ||
        "Ocorreu um erro. Tente novamente."
    );

}

// =====================================================
// GARANTIR API KEY
// =====================================================

async function garantirApiKey(
    usuarioRef,
    dados
) {

    // -------------------------------------------------
    // API KEY JÁ EXISTE
    // -------------------------------------------------

    if (
        dados &&
        dados.apiKey &&
        String(dados.apiKey).trim()
    ) {

        console.log(
            "[FIREBASE] API Key encontrada."
        );

        return dados.apiKey;

    }

    // -------------------------------------------------
    // CRIAR NOVA API KEY
    // -------------------------------------------------

    console.log(
        "[FIREBASE] API Key não encontrada. Criando..."
    );

    const apiKey = gerarApiKey();

    await update(
        usuarioRef,
        {
            apiKey: apiKey
        }
    );

    console.log(
        "[FIREBASE] API Key criada e salva."
    );

    return apiKey;

}

// =====================================================
// CRIAR / BUSCAR DADOS DO USUÁRIO
// =====================================================

async function criarDadosUsuario(
    user,
    name = ""
) {

    if (
        !user ||
        !user.uid
    ) {

        throw new Error(
            "Usuário Firebase inválido."
        );

    }

    // -------------------------------------------------
    // UID AUTOMÁTICO
    // -------------------------------------------------

    const uid = user.uid;

    console.log(
        "[FIREBASE] UID:",
        uid
    );

    // -------------------------------------------------
    // users/{UID}
    // -------------------------------------------------

    const usuarioRef = ref(
        database,
        "users/" + uid
    );

    // -------------------------------------------------
    // BUSCAR
    // -------------------------------------------------

    const snapshot = await get(
        usuarioRef
    );

    // -------------------------------------------------
    // USUÁRIO JÁ EXISTE
    // -------------------------------------------------

    if (snapshot.exists()) {

        const dados =
            snapshot.val() || {};

        const apiKey =
            await garantirApiKey(
                usuarioRef,
                dados
            );

        // Garantir UID
        if (dados.uid !== uid) {

            await update(
                usuarioRef,
                {
                    uid: uid
                }
            );

        }

        return {

            ...dados,

            uid: uid,

            email:
                user.email ||
                dados.email ||
                "",

            fullName:
                dados.fullName ||
                user.displayName ||
                "",

            apiKey: apiKey

        };

    }

    // -------------------------------------------------
    // USUÁRIO NOVO
    // -------------------------------------------------

    const apiKey =
        gerarApiKey();

    const dadosUsuario = {

        uid: uid,

        email:
            user.email || "",

        fullName:
            name ||
            user.displayName ||
            "",

        apiKey:
            apiKey,

        criadoEm:
            new Date().toISOString()

    };

    await set(
        usuarioRef,
        dadosUsuario
    );

    console.log(
        "[FIREBASE] users/" + uid + " criado."
    );

    return dadosUsuario;

}

// =====================================================
// REGISTAR
// =====================================================

async function registerUser(
    name,
    email,
    password
) {

    name =
        String(name || "").trim();

    email =
        String(email || "").trim();

    password =
        String(password || "");

    if (!name) {

        return {
            success: false,
            message: "Informe seu nome."
        };

    }

    if (!email) {

        return {
            success: false,
            message: "Informe o email."
        };

    }

    if (!password) {

        return {
            success: false,
            message: "Informe a palavra-passe."
        };

    }

    if (password.length < 6) {

        return {
            success: false,
            message:
                "A palavra-passe deve ter pelo menos 6 caracteres."
        };

    }

    try {

        console.log(
            "[FIREBASE] Criando conta..."
        );

        // -------------------------------------------------
        // FIREBASE AUTH CRIA O USUÁRIO E O UID
        // -------------------------------------------------

        const credential =
            await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );

        const user =
            credential.user;

        console.log(
            "[FIREBASE] Conta criada."
        );

        console.log(
            "[FIREBASE] UID:",
            user.uid
        );

        // -------------------------------------------------
        // NOME
        // -------------------------------------------------

        if (name) {

            try {

                await updateProfile(
                    user,
                    {
                        displayName: name
                    }
                );

            }
            catch (erro) {

                console.warn(
                    "[FIREBASE] Erro ao salvar nome:",
                    erro
                );

            }

        }

        // -------------------------------------------------
        // DATABASE
        // -------------------------------------------------

        const dadosUsuario =
            await criarDadosUsuario(
                user,
                name
            );

        // -------------------------------------------------
        // EMAIL
        // -------------------------------------------------

        try {

            await sendEmailVerification(
                user
            );

        }
        catch (erro) {

            console.warn(
                "[FIREBASE] Erro de verificação:",
                erro
            );

        }

        // -------------------------------------------------
        // LOCAL STORAGE
        // -------------------------------------------------

        localStorage.setItem(
            "userData",
            JSON.stringify(
                dadosUsuario
            )
        );

        localStorage.setItem(
            "uid",
            dadosUsuario.uid
        );

        localStorage.setItem(
            "apiKey",
            dadosUsuario.apiKey
        );

        return {

            success: true,

            message:
                "Conta criada com sucesso! Verifique seu email.",

            user:
                dadosUsuario

        };

    }
    catch (error) {

        console.error(
            "[FIREBASE] ERRO CADASTRO:",
            error
        );

        return {

            success: false,

            message:
                traduzirErroFirebase(
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
        String(email || "").trim();

    password =
        String(password || "");

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
            "[FIREBASE] Iniciando login..."
        );

        // -------------------------------------------------
        // AUTH
        // -------------------------------------------------

        const credential =
            await signInWithEmailAndPassword(
                auth,
                email,
                password
            );

        const user =
            credential.user;

        console.log(
            "[FIREBASE] Login OK."
        );

        console.log(
            "[FIREBASE] UID:",
            user.uid
        );

        // -------------------------------------------------
        // VERIFICAR EMAIL
        // -------------------------------------------------

        if (!user.emailVerified) {

            await signOut(
                auth
            );

            return {

                success: false,

                message:
                    "Seu email ainda não foi verificado. Verifique sua caixa de entrada."

            };

        }

        // -------------------------------------------------
        // BUSCAR AUTOMATICAMENTE
        // users/{UID}
        // -------------------------------------------------

        const dados =
            await obterDadosUsuario();

        // -------------------------------------------------
        // API KEY
        // -------------------------------------------------

        if (
            !dados ||
            !dados.apiKey
        ) {

            await signOut(
                auth
            );

            return {

                success: false,

                message:
                    "A conta não possui API Key."

            };

        }

        // -------------------------------------------------
        // SALVAR
        // -------------------------------------------------

        localStorage.setItem(
            "userData",
            JSON.stringify(
                dados
            )
        );

        localStorage.setItem(
            "uid",
            dados.uid
        );

        localStorage.setItem(
            "apiKey",
            dados.apiKey
        );

        console.log(
            "[FIREBASE] UID carregado:",
            dados.uid
        );

        console.log(
            "[FIREBASE] API Key carregada."
        );

        return {

            success: true,

            message:
                "Login realizado com sucesso.",

            user:
                dados

        };

    }
    catch (error) {

        console.error(
            "[FIREBASE] ERRO LOGIN:",
            error
        );

        return {

            success: false,

            message:
                traduzirErroFirebase(
                    error
                )

        };

    }

}

// =====================================================
// GOOGLE LOGIN
// =====================================================

async function googleLogin() {

    try {

        const provider =
            new GoogleAuthProvider();

        const result =
            await signInWithPopup(
                auth,
                provider
            );

        const user =
            result.user;

        console.log(
            "[FIREBASE] Google Login OK."
        );

        console.log(
            "[FIREBASE] UID:",
            user.uid
        );

        // -------------------------------------------------
        // BUSCA/CRIA users/{UID}
        // -------------------------------------------------

        const dadosUsuario =
            await criarDadosUsuario(
                user,
                user.displayName || ""
            );

        // -------------------------------------------------
        // LOCAL STORAGE
        // -------------------------------------------------

        localStorage.setItem(
            "userData",
            JSON.stringify(
                dadosUsuario
            )
        );

        localStorage.setItem(
            "uid",
            dadosUsuario.uid
        );

        localStorage.setItem(
            "apiKey",
            dadosUsuario.apiKey
        );

        return {

            success: true,

            message:
                "Login Google realizado com sucesso.",

            user:
                dadosUsuario

        };

    }
    catch (error) {

        console.error(
            "[FIREBASE] ERRO GOOGLE:",
            error
        );

        return {

            success: false,

            message:
                traduzirErroFirebase(
                    error
                )

        };

    }

}

// =====================================================
// OBTER DADOS DO USUÁRIO
// =====================================================
//
// NÃO recebe UID.
// NÃO recebe API KEY.
//
// Descobre:
// auth.currentUser.uid
//
// Depois busca:
// users/{UID}
//
// =====================================================

async function obterDadosUsuario() {

    const user =
        auth.currentUser;

    if (!user) {

        console.warn(
            "[FIREBASE] Nenhum usuário autenticado."
        );

        return null;

    }

    // -------------------------------------------------
    // UID AUTOMÁTICO
    // -------------------------------------------------

    const uid =
        user.uid;

    console.log(
        "[FIREBASE] Buscando:",
        "users/" + uid
    );

    // -------------------------------------------------
    // REFERÊNCIA
    // -------------------------------------------------

    const usuarioRef =
        ref(
            database,
            "users/" + uid
        );

    // -------------------------------------------------
    // LER DATABASE
    // -------------------------------------------------

    const snapshot =
        await get(
            usuarioRef
        );

    // -------------------------------------------------
    // NÃO EXISTE
    // -------------------------------------------------

    if (!snapshot.exists()) {

        console.log(
            "[FIREBASE] Usuário não existe. Criando..."
        );

        return await criarDadosUsuario(
            user,
            user.displayName || ""
        );

    }

    // -------------------------------------------------
    // DADOS
    // -------------------------------------------------

    const dados =
        snapshot.val() || {};

    // -------------------------------------------------
    // API KEY AUTOMÁTICA
    // -------------------------------------------------

    const apiKey =
        await garantirApiKey(
            usuarioRef,
            dados
        );

    // -------------------------------------------------
    // RESULTADO
    // -------------------------------------------------

    const resultado = {

        ...dados,

        uid:
            uid,

        email:
            user.email ||
            dados.email ||
            "",

        name:
            dados.fullName ||
            user.displayName ||
            "",

        fullName:
            dados.fullName ||
            user.displayName ||
            "",

        apiKey:
            apiKey

    };

    // -------------------------------------------------
    // LOCAL STORAGE
    // -------------------------------------------------

    localStorage.setItem(
        "userData",
        JSON.stringify(
            resultado
        )
    );

    localStorage.setItem(
        "uid",
        resultado.uid
    );

    localStorage.setItem(
        "apiKey",
        resultado.apiKey
    );

    return resultado;

}

// =====================================================
// OBTER UID AUTOMATICAMENTE
// =====================================================

function obterUID() {

    const user =
        auth.currentUser;

    if (!user) {

        return null;

    }

    return user.uid;

}

// =====================================================
// OBTER API KEY AUTOMATICAMENTE
// =====================================================

async function obterApiKey() {

    const dados =
        await obterDadosUsuario();

    return (
        dados?.apiKey ||
        null
    );

}

// =====================================================
// RECUPERAR SENHA
// =====================================================

async function recuperarSenha(
    email
) {

    email =
        String(email || "").trim();

    if (!email) {

        return {

            success: false,

            message:
                "Informe seu email."

        };

    }

    try {

        await sendPasswordResetEmail(
            auth,
            email
        );

        return {

            success: true,

            message:
                "Enviamos um link para redefinir sua palavra-passe."

        };

    }
    catch (error) {

        return {

            success: false,

            message:
                traduzirErroFirebase(
                    error
                )

        };

    }

}

// =====================================================
// REENVIAR VERIFICAÇÃO
// =====================================================

async function resendVerification() {

    try {

        const user =
            auth.currentUser;

        if (!user) {

            return {

                success: false,

                message:
                    "Nenhum usuário está conectado."

            };

        }

        await sendEmailVerification(
            user
        );

        return {

            success: true,

            message:
                "Email de verificação reenviado."

        };

    }
    catch (error) {

        return {

            success: false,

            message:
                traduzirErroFirebase(
                    error
                )

        };

    }

}

// =====================================================
// SAIR
// =====================================================

async function sair() {

    try {

        await signOut(
            auth
        );

        localStorage.removeItem(
            "userData"
        );

        localStorage.removeItem(
            "uid"
        );

        localStorage.removeItem(
            "apiKey"
        );

        window.location.href = "/";

    }
    catch (error) {

        console.error(
            "[FIREBASE] Erro ao sair:",
            error
        );

    }

}

// =====================================================
// ESTADO AUTH
// =====================================================

function onAuthState(callback) {

    return onAuthStateChanged(
        auth,
        callback
    );

}

// =====================================================
// DISPONIBILIZAR PARA OUTROS JS
// =====================================================

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

// =====================================================
// EXPORTAÇÕES
// =====================================================

export {

    app,

    auth,

    database,

    gerarApiKey,

    criarDadosUsuario,

    registerUser,

    loginUser,

    recuperarSenha,

    resendVerification,

    onAuthState,

    googleLogin,

    sair,

    obterDadosUsuario,

    obterUID,

    obterApiKey

};
