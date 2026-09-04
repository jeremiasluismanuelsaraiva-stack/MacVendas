// =====================================================
// MACVENDAS - FIREBASE
// FIREBASE CLIENT COMPLETO
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
// CONFIGURAÇÃO FIREBASE
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

const auth = getAuth(app);

const database = getDatabase(app);

console.log("[FIREBASE] Firebase inicializado.");
console.log(
    "[FIREBASE] Database:",
    "https://macvendas-default-rtdb.firebaseio.com"
);

// =====================================================
// GERAR API KEY
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
            "[FIREBASE] Erro randomUUID:",
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
            "O Firebase bloqueou o acesso ao Realtime Database. Verifique as regras de segurança.",

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
// SALVAR DADOS LOCALMENTE
// =====================================================

function salvarDadosLocais(dados) {

    if (!dados) {
        return;
    }

    const dadosFinais = {

        ...dados,

        uid:
            dados.uid || "",

        email:
            dados.email || "",

        name:
            dados.name ||
            dados.fullName ||
            "",

        fullName:
            dados.fullName ||
            dados.name ||
            "",

        apiKey:
            dados.apiKey || ""

    };

    localStorage.setItem(
        "userData",
        JSON.stringify(dadosFinais)
    );

    if (dadosFinais.uid) {

        localStorage.setItem(
            "uid",
            dadosFinais.uid
        );

    }

    if (dadosFinais.apiKey) {

        localStorage.setItem(
            "apiKey",
            dadosFinais.apiKey
        );

    }

    console.log(
        "[FIREBASE] Dados salvos no localStorage."
    );

    console.log(
        "[FIREBASE] UID:",
        dadosFinais.uid
    );

    console.log(
        "[FIREBASE] API KEY:",
        dadosFinais.apiKey
    );

}

// =====================================================
// CRIAR DADOS DO USUÁRIO
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

    const uid = user.uid;

    const usuarioRef =
        ref(
            database,
            "users/" + uid
        );

    console.log(
        "[FIREBASE] Verificando:",
        "users/" + uid
    );

    const snapshot =
        await get(usuarioRef);

    // =================================================
    // USUÁRIO JÁ EXISTE
    // =================================================

    if (snapshot.exists()) {

        const dados =
            snapshot.val() || {};

        console.log(
            "[FIREBASE] Usuário já existe."
        );

        let apiKey =
            dados.apiKey || "";

        // =============================================
        // API KEY NÃO EXISTE
        // =============================================

        if (!apiKey) {

            apiKey =
                gerarApiKey();

            await update(
                usuarioRef,
                {
                    apiKey:
                        apiKey
                }
            );

            console.log(
                "[FIREBASE] API Key criada."
            );

        }

        // =============================================
        // RETORNAR TUDO
        // =============================================

        return {

            ...dados,

            uid:
                uid,

            email:
                user.email ||
                dados.email ||
                "",

            fullName:
                dados.fullName ||
                name ||
                user.displayName ||
                "",

            apiKey:
                apiKey

        };

    }

    // =================================================
    // USUÁRIO NOVO
    // =================================================

    const apiKey =
        gerarApiKey();

    const dadosUsuario = {

        uid:
            uid,

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
        "[FIREBASE] Usuário criado em:",
        "users/" + uid
    );

    console.log(
        "[FIREBASE] UID:",
        uid
    );

    console.log(
        "[FIREBASE] API Key:",
        apiKey
    );

    return dadosUsuario;
}

// =====================================================
// OBTER DADOS DO USUÁRIO AUTENTICADO
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

    const uid =
        user.uid;

    console.log(
        "[FIREBASE] UID AUTH:",
        uid
    );

    const usuarioRef =
        ref(
            database,
            "users/" + uid
        );

    console.log(
        "[FIREBASE] Buscando:",
        "users/" + uid
    );

    const snapshot =
        await get(usuarioRef);

    // =================================================
    // USUÁRIO NÃO EXISTE
    // =================================================

    if (!snapshot.exists()) {

        console.log(
            "[FIREBASE] Dados não existem. Criando..."
        );

        const dados =
            await criarDadosUsuario(
                user,
                user.displayName || ""
            );

        salvarDadosLocais(
            dados
        );

        return dados;
    }

    // =================================================
    // DADOS EXISTENTES
    // =================================================

    const dados =
        snapshot.val() || {};

    let apiKey =
        dados.apiKey || "";

    // =================================================
    // CRIAR API KEY SE NÃO EXISTIR
    // =================================================

    if (!apiKey) {

        apiKey =
            gerarApiKey();

        await update(
            usuarioRef,
            {
                apiKey:
                    apiKey
            }
        );

        console.log(
            "[FIREBASE] API Key criada para usuário existente."
        );

    }

    // =================================================
    // DADOS COMPLETOS
    // =================================================

    const dadosFinais = {

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

    // =================================================
    // SALVAR LOCALMENTE
    // =================================================

    salvarDadosLocais(
        dadosFinais
    );

    console.log(
        "[FIREBASE] DADOS COMPLETOS OBTIDOS."
    );

    console.log(
        "[FIREBASE] UID:",
        dadosFinais.uid
    );

    console.log(
        "[FIREBASE] API KEY:",
        dadosFinais.apiKey
    );

    return dadosFinais;
}

// =====================================================
// REGISTAR USUÁRIO
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

        const credential =
            await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );

        const user =
            credential.user;

        console.log(
            "[FIREBASE] Auth criado."
        );

        console.log(
            "[FIREBASE] UID:",
            user.uid
        );

        // =================================================
        // NOME
        // =================================================

        try {

            await updateProfile(
                user,
                {
                    displayName:
                        name
                }
            );

        }
        catch (erro) {

            console.warn(
                "[FIREBASE] Erro ao salvar nome:",
                erro
            );

        }

        // =================================================
        // REALTIME DATABASE
        // =================================================

        let dadosUsuario;

        try {

            dadosUsuario =
                await criarDadosUsuario(
                    user,
                    name
                );

        }
        catch (erroDatabase) {

            console.error(
                "[FIREBASE] ERRO DATABASE:",
                erroDatabase
            );

            return {

                success: false,

                message:
                    "Conta criada no Authentication, mas não foi possível criar os dados no Realtime Database."

            };

        }

        // =================================================
        // EMAIL
        // =================================================

        try {

            await sendEmailVerification(
                user
            );

        }
        catch (erro) {

            console.warn(
                "[FIREBASE] Erro verificação:",
                erro
            );

        }

        // =================================================
        // SALVAR LOCAL
        // =================================================

        salvarDadosLocais(
            dadosUsuario
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

        // =================================================
        // AUTH
        // =================================================

        const credential =
            await signInWithEmailAndPassword(
                auth,
                email,
                password
            );

        const user =
            credential.user;

        console.log(
            "[FIREBASE] Login Auth OK."
        );

        console.log(
            "[FIREBASE] UID:",
            user.uid
        );

        // =================================================
        // VERIFICAR EMAIL
        // =================================================

        if (
            !user.emailVerified
        ) {

            await signOut(
                auth
            );

            return {

                success: false,

                message:
                    "Seu email ainda não foi verificado. Verifique sua caixa de entrada."

            };

        }

        // =================================================
        // BUSCAR REALTIME DATABASE
        // =================================================

        let dados;

        try {

            dados =
                await obterDadosUsuario();

        }
        catch (erroDatabase) {

            console.error(
                "[FIREBASE] ERRO REALTIME DATABASE:",
                erroDatabase
            );

            await signOut(
                auth
            );

            return {

                success: false,

                message:
                    "Login realizado, mas não foi possível acessar o Realtime Database. Verifique as regras de segurança."

            };

        }

        if (!dados) {

            await signOut(
                auth
            );

            return {

                success: false,

                message:
                    "Não foi possível obter os dados do usuário."

            };

        }

        // =================================================
        // API KEY
        // =================================================

        if (!dados.apiKey) {

            await signOut(
                auth
            );

            return {

                success: false,

                message:
                    "A conta não possui API Key."

            };

        }

        // =================================================
        // DADOS FINAIS
        // =================================================

        const dadosUsuario = {

            ...dados,

            uid:
                user.uid,

            email:
                user.email ||
                email,

            name:
                dados.fullName ||
                user.displayName ||
                "",

            fullName:
                dados.fullName ||
                user.displayName ||
                "",

            apiKey:
                dados.apiKey

        };

        salvarDadosLocais(
            dadosUsuario
        );

        console.log(
            "[FIREBASE] LOGIN CONCLUÍDO."
        );

        console.log(
            "[FIREBASE] UID:",
            dadosUsuario.uid
        );

        console.log(
            "[FIREBASE] API KEY:",
            dadosUsuario.apiKey
        );

        return {

            success: true,

            message:
                "Login realizado com sucesso.",

            user:
                dadosUsuario

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
// LOGIN GOOGLE
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
            "[FIREBASE] Google Auth OK."
        );

        console.log(
            "[FIREBASE] UID:",
            user.uid
        );

        // =================================================
        // CRIAR/BUSCAR DADOS
        // =================================================

        const dados =
            await criarDadosUsuario(
                user,
                user.displayName || ""
            );

        // =================================================
        // SALVAR
        // =================================================

        salvarDadosLocais(
            dados
        );

        return {

            success: true,

            message:
                "Login Google realizado com sucesso.",

            user:
                dados

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
                "Enviamos um link para redefinir sua palavra-passe no email."

        };

    }
    catch (error) {

        console.error(
            "[FIREBASE] Erro senha:",
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

        console.error(
            "[FIREBASE] Erro verificação:",
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
            "apiKey"
        );

        localStorage.removeItem(
            "uid"
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
// FUNÇÃO PARA O DASHBOARD
// =====================================================

async function carregarDadosDashboard() {

    try {

        const user =
            auth.currentUser;

        if (!user) {

            console.warn(
                "[FIREBASE] Dashboard: usuário não autenticado."
            );

            return null;

        }

        const dados =
            await obterDadosUsuario();

        if (!dados) {

            return null;

        }

        // =================================================
        // GARANTIR UID
        // =================================================

        const resultado = {

            ...dados,

            uid:
                user.uid,

            apiKey:
                dados.apiKey || ""

        };

        // =================================================
        // DISPONIBILIZAR GLOBALMENTE
        // =================================================

        window.usuarioFirebase =
            resultado;

        window.firebaseUID =
            resultado.uid;

        window.firebaseApiKey =
            resultado.apiKey;

        console.log(
            "[FIREBASE] Dashboard carregado."
        );

        console.log(
            "[FIREBASE] UID:",
            window.firebaseUID
        );

        console.log(
            "[FIREBASE] API KEY:",
            window.firebaseApiKey
        );

        return resultado;

    }
    catch (error) {

        console.error(
            "[FIREBASE] Erro Dashboard:",
            error
        );

        return null;

    }

}

// =====================================================
// COMPATIBILIDADE
// =====================================================

window.criarConta =
    async function (
        name,
        email,
        senha
    ) {

        return await registerUser(
            name,
            email,
            senha
        );

    };

window.entrar =
    async function (
        email,
        senha
    ) {

        return await loginUser(
            email,
            senha
        );

    };

window.googleLogin =
    googleLogin;

window.sair =
    sair;

window.obterDadosUsuario =
    obterDadosUsuario;

window.carregarDadosDashboard =
    carregarDadosDashboard;

window.recuperarSenha =
    recuperarSenha;

window.resendVerification =
    resendVerification;

window.onAuthState =
    onAuthState;

window.gerarApiKey =
    gerarApiKey;

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

    carregarDadosDashboard

};
