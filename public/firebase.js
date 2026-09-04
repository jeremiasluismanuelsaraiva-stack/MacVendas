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
// CONFIGURAÇÃO DO PROJETO FIREBASE
// =====================================================
//
// ATENÇÃO:
//
// Este apiKey NÃO é a API KEY do usuário.
//
// É apenas a chave pública de configuração
// necessária para conectar o site ao projeto Firebase.
//
// A API KEY INDIVIDUAL do usuário será buscada em:
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

const app =
    initializeApp(firebaseConfig);


// =====================================================
// AUTH
// =====================================================

const auth =
    getAuth(app);


// =====================================================
// REALTIME DATABASE
// =====================================================

const database =
    getDatabase(app);


// =====================================================
// LOG
// =====================================================

console.log(
    "[FIREBASE] Firebase inicializado."
);

console.log(
    "[FIREBASE] Projeto:",
    firebaseConfig.projectId
);

console.log(
    "[FIREBASE] Realtime Database:",
    firebaseConfig.databaseURL
);


// =====================================================
// GERAR API KEY DO USUÁRIO
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
            "[FIREBASE] randomUUID indisponível:",
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
// TRADUZIR ERROS FIREBASE
// =====================================================

function traduzirErroFirebase(error) {

    const codigo =
        error?.code || "";


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
// CRIAR API KEY DO USUÁRIO
// =====================================================

async function garantirApiKey(
    usuarioRef,
    dados
) {

    // =================================================
    // JÁ POSSUI API KEY
    // =================================================

    if (
        dados &&
        dados.apiKey &&
        String(dados.apiKey).trim()
    ) {

        console.log(
            "[FIREBASE] API Key encontrada no Database."
        );

        return dados.apiKey;

    }


    // =================================================
    // NÃO POSSUI
    // =================================================

    console.log(
        "[FIREBASE] Usuário sem API Key."
    );

    console.log(
        "[FIREBASE] Gerando nova API Key..."
    );


    const apiKey =
        gerarApiKey();


    await update(
        usuarioRef,
        {
            apiKey:
                apiKey
        }
    );


    console.log(
        "[FIREBASE] Nova API Key salva no Database."
    );


    return apiKey;

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


    // =================================================
    // UID VEM DO AUTH
    // =================================================

    const uid =
        user.uid;


    console.log(
        "[FIREBASE] UID do usuário:",
        uid
    );


    // =================================================
    // CAMINHO DO USUÁRIO
    // =================================================

    const usuarioRef =
        ref(
            database,
            "users/" + uid
        );


    // =================================================
    // BUSCAR USUÁRIO
    // =================================================

    const snapshot =
        await get(
            usuarioRef
        );


    // =================================================
    // USUÁRIO JÁ EXISTE
    // =================================================

    if (snapshot.exists()) {

        const dados =
            snapshot.val() || {};


        console.log(
            "[FIREBASE] Usuário encontrado em:",
            "users/" + uid
        );


        // =============================================
        // GARANTIR API KEY
        // =============================================

        const apiKey =
            await garantirApiKey(
                usuarioRef,
                dados
            );


        // =============================================
        // GARANTIR UID
        // =============================================

        if (
            dados.uid !== uid
        ) {

            await update(
                usuarioRef,
                {
                    uid:
                        uid
                }
            );

        }


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
                user.displayName ||
                "",

            apiKey:
                apiKey

        };

    }


    // =================================================
    // USUÁRIO NOVO
    // =================================================

    console.log(
        "[FIREBASE] Usuário não encontrado."
    );

    console.log(
        "[FIREBASE] Criando users/" + uid
    );


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
        "[FIREBASE] Usuário criado no Realtime Database."
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


    try {

        console.log(
            "[FIREBASE] Criando conta..."
        );


        // =================================================
        // AUTH
        // =================================================

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

        if (name) {

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
                    "[FIREBASE] Não foi possível salvar displayName:",
                    erro
                );

            }

        }


        // =================================================
        // DATABASE
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


            console.log(
                "[FIREBASE] Email de verificação enviado."
            );

        }
        catch (erro) {

            console.warn(
                "[FIREBASE] Erro ao enviar verificação:",
                erro
            );

        }


        // =================================================
        // DADOS LOCAIS
        // =================================================

        localStorage.setItem(
            "userData",
            JSON.stringify(
                dadosUsuario
            )
        );


        localStorage.setItem(
            "apiKey",
            dadosUsuario.apiKey
        );


        localStorage.setItem(
            "uid",
            dadosUsuario.uid
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
        // BUSCAR DADOS DO FIREBASE
        // =================================================

        console.log(
            "[FIREBASE] Buscando users/" +
            user.uid
        );


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


        // =================================================
        // API KEY
        // =================================================

        const apiKey =
            dados?.apiKey || "";


        if (!apiKey) {

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

            ...(dados || {}),

            uid:
                user.uid,

            email:
                user.email ||
                email,

            name:
                dados?.fullName ||
                user.displayName ||
                "",

            fullName:
                dados?.fullName ||
                user.displayName ||
                "",

            apiKey:
                apiKey

        };


        // =================================================
        // LOCAL STORAGE
        // =================================================

        localStorage.setItem(
            "userData",
            JSON.stringify(
                dadosUsuario
            )
        );


        localStorage.setItem(
            "apiKey",
            apiKey
        );


        localStorage.setItem(
            "uid",
            user.uid
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
            "[FIREBASE] Erro recuperar senha:",
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
// LOGIN GOOGLE
// =====================================================

async function googleLogin() {

    try {

        console.log(
            "[FIREBASE] Iniciando login Google..."
        );


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

        const dadosUsuario =
            await criarDadosUsuario(
                user,
                user.displayName || ""
            );


        // =================================================
        // LOCAL STORAGE
        // =================================================

        localStorage.setItem(
            "userData",
            JSON.stringify(
                dadosUsuario
            )
        );


        localStorage.setItem(
            "apiKey",
            dadosUsuario.apiKey
        );


        localStorage.setItem(
            "uid",
            dadosUsuario.uid
        );


        console.log(
            "[FIREBASE] LOGIN GOOGLE CONCLUÍDO."
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
            "[FIREBASE] Erro Google:",
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


        window.location.href =
            "/";

    }
    catch (error) {

        console.error(
            "[FIREBASE] Erro ao sair:",
            error
        );

    }

}


// =====================================================
// OBTER DADOS DO USUÁRIO
// =====================================================
//
// ESTA É A FUNÇÃO PRINCIPAL.
//
// Ela NÃO recebe UID.
//
// Ela NÃO recebe API KEY.
//
// Ela descobre automaticamente o usuário autenticado.
//
// Depois busca:
//
// users/{UID}
//
// e dentro dele:
//
// apiKey
//
// =====================================================

async function obterDadosUsuario() {

    const user =
        auth.currentUser;


    // =================================================
    // SEM LOGIN
    // =================================================

    if (!user) {

        console.warn(
            "[FIREBASE] Nenhum usuário autenticado."
        );


        return null;

    }


    // =================================================
    // UID AUTOMÁTICO
    // =================================================

    const uid =
        user.uid;


    console.log(
        "[FIREBASE] UID atual:",
        uid
    );


    // =================================================
    // REFERÊNCIA
    // =================================================

    const usuarioRef =
        ref(
            database,
            "users/" + uid
        );


    // =================================================
    // BUSCAR
    // =================================================

    const snapshot =
        await get(
            usuarioRef
        );


    // =================================================
    // USUÁRIO NÃO EXISTE
    // =================================================

    if (!snapshot.exists()) {

        console.log(
            "[FIREBASE] users/" +
            uid +
            " não existe."
        );


        // =============================================
        // CRIAR AUTOMATICAMENTE
        // =============================================

        const dadosCriados =
            await criarDadosUsuario(
                user,
                user.displayName || ""
            );


        return dadosCriados;

    }


    // =================================================
    // DADOS ENCONTRADOS
    // =================================================

    const dados =
        snapshot.val() || {};


    console.log(
        "[FIREBASE] Dados encontrados."
    );


    // =================================================
    // API KEY
    // =================================================

    const apiKey =
        await garantirApiKey(
            usuarioRef,
            dados
        );


    // =================================================
    // RETORNAR TUDO
    // =================================================

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


    // =================================================
    // ATUALIZAR LOCAL STORAGE
    // =================================================

    localStorage.setItem(
        "userData",
        JSON.stringify(
            resultado
        )
    );


    localStorage.setItem(
        "apiKey",
        apiKey
    );


    localStorage.setItem(
        "uid",
        uid
    );


    console.log(
        "[FIREBASE] UID carregado:",
        resultado.uid
    );


    console.log(
        "[FIREBASE] API Key carregada do Database."
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
// ESTADO AUTH
// =====================================================

function onAuthState(callback) {

    return onAuthStateChanged(
        auth,
        callback
    );

}


// =====================================================
// COMPATIBILIDADE COM OUTROS JS
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
