// =====================================================
// MACVENDAS - FIREBASE
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

const app =
    initializeApp(firebaseConfig);


// =====================================================
// AUTH
// =====================================================

const auth =
    getAuth(app);


// =====================================================
// DATABASE
// =====================================================

const database =
    getDatabase(
        app,
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
            "Este domínio não está autorizado no Firebase."

    };


    return (
        mensagens[codigo] ||
        error?.message ||
        "Ocorreu um erro. Tente novamente."
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


    const usuarioRef =
        ref(
            database,
            "users/" + user.uid
        );


    console.log(
        "[FIREBASE] Verificando usuário:",
        user.uid
    );


    const snapshot =
        await get(usuarioRef);


    // =================================================
    // USUÁRIO JÁ EXISTE
    // =================================================

    if (snapshot.exists()) {

        const dados =
            snapshot.val() || {};


        if (dados.apiKey) {

            console.log(
                "[FIREBASE] API Key existente encontrada."
            );

            return dados.apiKey;

        }


        // =============================================
        // CRIAR API KEY
        // =============================================

        const apiKey =
            gerarApiKey();


        await update(
            usuarioRef,
            {
                apiKey: apiKey
            }
        );


        console.log(
            "[FIREBASE] API Key criada."
        );


        return apiKey;

    }


    // =================================================
    // USUÁRIO NOVO
    // =================================================

    const apiKey =
        gerarApiKey();


    const dadosUsuario = {

        uid:
            user.uid,

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
        "[FIREBASE] Usuário criado no Database."
    );


    return apiKey;

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


        // =============================================
        // CRIAR CONTA AUTH
        // =============================================

        const credential =
            await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );


        const user =
            credential.user;


        console.log(
            "[FIREBASE] Auth criado:",
            user.uid
        );


        // =============================================
        // NOME
        // =============================================

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


        // =============================================
        // DATABASE
        // =============================================

        let apiKey;


        try {

            apiKey =
                await criarDadosUsuario(
                    user,
                    name
                );

        }
        catch (erroDatabase) {

            console.error(
                "[FIREBASE] ERRO DATABASE NO REGISTRO:",
                erroDatabase
            );


            return {

                success: false,

                message:
                    "Conta criada no Firebase Authentication, mas não foi possível criar os dados no Realtime Database. Verifique a configuração do Database."

            };

        }


        // =============================================
        // EMAIL
        // =============================================

        try {

            await sendEmailVerification(
                user
            );


            console.log(
                "[FIREBASE] Verificação enviada."
            );

        }
        catch (erro) {

            console.warn(
                "[FIREBASE] Erro ao enviar verificação:",
                erro
            );

        }


        // =============================================
        // DADOS LOCAIS
        // =============================================

        const dadosUsuario = {

            uid:
                user.uid,

            email:
                user.email ||
                email,

            name:
                name,

            fullName:
                name,

            apiKey:
                apiKey

        };


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


    if (!email || !password) {

        return {

            success: false,

            message:
                "Informe o email e a palavra-passe."

        };

    }


    try {

        console.log(
            "[FIREBASE] 1. Iniciando login..."
        );


        // =============================================
        // LOGIN AUTH
        // =============================================

        const credential =
            await signInWithEmailAndPassword(
                auth,
                email,
                password
            );


        const user =
            credential.user;


        console.log(
            "[FIREBASE] 2. Login Auth OK:",
            user.uid
        );


        // =============================================
        // VERIFICAR EMAIL
        // =============================================

        if (!user.emailVerified) {

            await signOut(auth);


            return {

                success: false,

                message:
                    "Seu email ainda não foi verificado. Verifique sua caixa de entrada."

            };

        }


        // =============================================
        // BUSCAR DADOS
        // =============================================

        console.log(
            "[FIREBASE] 3. Buscando dados..."
        );


        let dados;


        try {

            dados =
                await obterDadosUsuario();


            console.log(
                "[FIREBASE] 4. Dados obtidos:",
                dados
            );

        }
        catch (erroDatabase) {

            console.error(
                "[FIREBASE] ERRO REALTIME DATABASE:",
                erroDatabase
            );


            await signOut(auth);


            return {

                success: false,

                message:
                    "Login Auth realizado, mas não foi possível acessar os dados do usuário no Realtime Database. Verifique se o Realtime Database está criado e se a URL está correta."

            };

        }


        // =============================================
        // API KEY
        // =============================================

        const apiKey =
            dados?.apiKey || "";


        if (!apiKey) {

            await signOut(auth);


            return {

                success: false,

                message:
                    "A conta não possui API Key."

            };

        }


        // =============================================
        // DADOS FINAIS
        // =============================================

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


        // =============================================
        // LOCAL STORAGE
        // =============================================

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


        console.log(
            "[FIREBASE] 5. LOGIN CONCLUÍDO."
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
            "[FIREBASE] Google Auth OK:",
            user.uid
        );


        let apiKey;


        try {

            apiKey =
                await criarDadosUsuario(
                    user,
                    user.displayName || ""
                );

        }
        catch (erroDatabase) {

            console.error(
                "[FIREBASE] Google Database:",
                erroDatabase
            );


            await signOut(auth);


            return {

                success: false,

                message:
                    "Login Google realizado, mas não foi possível acessar o Realtime Database."

            };

        }


        const dadosUsuario = {

            uid:
                user.uid,

            email:
                user.email || "",

            name:
                user.displayName || "",

            fullName:
                user.displayName || "",

            apiKey:
                apiKey

        };


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

async function obterDadosUsuario() {

    const user =
        auth.currentUser;


    if (!user) {

        return null;

    }


    console.log(
        "[FIREBASE] UID:",
        user.uid
    );


    const usuarioRef =
        ref(
            database,
            "users/" + user.uid
        );


    const snapshot =
        await get(
            usuarioRef
        );


    // =================================================
    // NÃO EXISTE
    // =================================================

    if (!snapshot.exists()) {

        console.log(
            "[FIREBASE] Usuário não existe no Database. Criando..."
        );


        const apiKey =
            gerarApiKey();


        const dadosUsuario = {

            uid:
                user.uid,

            email:
                user.email || "",

            fullName:
                user.displayName || "",

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
            "[FIREBASE] Dados criados."
        );


        return dadosUsuario;

    }


    // =================================================
    // EXISTE
    // =================================================

    const dados =
        snapshot.val() || {};


    console.log(
        "[FIREBASE] Dados encontrados:",
        dados
    );


    // =================================================
    // API KEY
    // =================================================

    if (!dados.apiKey) {

        console.log(
            "[FIREBASE] Usuário sem API Key. Criando..."
        );


        dados.apiKey =
            gerarApiKey();


        await update(
            usuarioRef,
            {
                apiKey:
                    dados.apiKey
            }
        );


        console.log(
            "[FIREBASE] API Key criada."
        );

    }


    // =================================================
    // RETORNAR
    // =================================================

    return {

        ...dados,

        uid:
            user.uid,

        email:
            user.email ||
            dados.email ||
            "",

        fullName:
            dados.fullName ||
            user.displayName ||
            "",

        apiKey:
            dados.apiKey

    };

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

    obterDadosUsuario

};
