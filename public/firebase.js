// =====================================================
// MACVENDAS - FIREBASE
// =====================================================
// Firebase Client
//
// FUNÇÕES:
// - Registro
// - Login
// - Recuperação de palavra-passe
// - Verificação de email
// - Login Google
// - API Key do usuário
// - Realtime Database
// =====================================================


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
    signInWithPopup
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

// =====================================================
// CONFIGURAÇÃO FIREBASE - MACVENDAS
// =====================================================

const firebaseConfig = {

    apiKey:
        "AIzaSyBwRDNVI8bwr65s_FaVgwEtKhrorLD6VUI",

    authDomain:
        "macvendas.firebaseapp.com",

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
    initializeApp(
        firebaseConfig
    );


// =====================================================
// AUTH
// =====================================================

const auth =
    getAuth(
        app
    );


// =====================================================
// REALTIME DATABASE
// =====================================================

const database =
    getDatabase(
        app
    );


// =====================================================
// GERAR API KEY
// =====================================================

function gerarApiKey() {

    try {

        const id =
            crypto
                .randomUUID()
                .replace(/-/g, "");

        return (
            "mk_" +
            id
        );

    }
    catch (erro) {

        console.warn(
            "[FIREBASE] crypto.randomUUID indisponível."
        );

        const aleatorio =
            Math.random()
                .toString(36)
                .substring(2, 18);

        return (
            "mk_" +
            Date.now() +
            "_" +
            aleatorio
        );

    }

}


// =====================================================
// TRADUZIR ERROS DO FIREBASE
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
            "A palavra-passe é muito fraca.",

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
            "Este método de login não está ativado no Firebase."

    };

    return (
        mensagens[codigo] ||
        error?.message ||
        "Ocorreu um erro. Tente novamente."
    );

}


// =====================================================
// CRIAR / GARANTIR DADOS DO USUÁRIO
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


    const snapshot =
        await get(
            usuarioRef
        );


    // =================================================
    // USUÁRIO JÁ EXISTE
    // =================================================

    if (
        snapshot.exists()
    ) {

        const dados =
            snapshot.val() || {};


        // ---------------------------------------------
        // GARANTIR API KEY
        // ---------------------------------------------

        if (
            dados.apiKey
        ) {

            return dados.apiKey;

        }


        const apiKey =
            gerarApiKey();


        await update(
            usuarioRef,
            {
                apiKey
            }
        );


        return apiKey;

    }


    // =================================================
    // NOVO USUÁRIO
    // =================================================

    const apiKey =
        gerarApiKey();


    await set(
        usuarioRef,
        {

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

        }
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

    try {

        if (
            !email ||
            !password
        ) {

            return {

                success:
                    false,

                message:
                    "Informe o email e a palavra-passe."

            };

        }


        const credential =
            await createUserWithEmailAndPassword(
                auth,
                email.trim(),
                password
            );


        const user =
            credential.user;


        // =================================================
        // EMAIL DE VERIFICAÇÃO
        // =================================================

        try {

            await sendEmailVerification(
                user
            );

        }
        catch (erroEmail) {

            console.warn(
                "[FIREBASE] Erro ao enviar verificação:",
                erroEmail
            );

        }


        // =================================================
        // CRIAR DADOS NO REALTIME DATABASE
        // =================================================

        let apiKey = "";

        try {

            apiKey =
                await criarDadosUsuario(
                    user,
                    name || ""
                );

        }
        catch (erroDatabase) {

            console.error(
                "[FIREBASE] Erro ao criar dados:",
                erroDatabase
            );

        }


        return {

            success:
                true,

            message:
                "Conta criada com sucesso! Verifique seu email.",

            user: {

                uid:
                    user.uid,

                email:
                    user.email || "",

                name:
                    name || "",

                apiKey:
                    apiKey

            }

        };

    }
    catch (error) {

        console.error(
            "[FIREBASE] Erro ao criar conta:",
            error
        );

        return {

            success:
                false,

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

    try {

        if (
            !email ||
            !password
        ) {

            return {

                success:
                    false,

                message:
                    "Informe o email e a palavra-passe."

            };

        }


        const credential =
            await signInWithEmailAndPassword(
                auth,
                email.trim(),
                password
            );


        const user =
            credential.user;


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

                success:
                    false,

                message:
                    "Seu email ainda não foi verificado. Verifique sua caixa de entrada."

            };

        }


        // =================================================
        // DADOS BÁSICOS
        // =================================================

        const dadosUsuario = {

            uid:
                user.uid,

            email:
                user.email || "",

            name:
                user.displayName || "",

            apiKey:
                ""

        };


        // =================================================
        // GUARDAR LOGIN
        // =================================================

        try {

            localStorage.setItem(
                "userData",
                JSON.stringify(
                    dadosUsuario
                )
            );

        }
        catch (erroLocal) {

            console.warn(
                "[FIREBASE] Erro local:",
                erroLocal
            );

        }


        // =================================================
        // API KEY EM SEGUNDO PLANO
        // =================================================

        criarDadosUsuario(
            user,
            user.displayName || ""
        )
        .then(
            apiKey => {

                const dadosAtualizados = {

                    uid:
                        user.uid,

                    email:
                        user.email || "",

                    name:
                        user.displayName || "",

                    apiKey:
                        apiKey

                };


                localStorage.setItem(
                    "userData",
                    JSON.stringify(
                        dadosAtualizados
                    )
                );


                localStorage.setItem(
                    "apiKey",
                    apiKey
                );

            }
        )
        .catch(
            erro => {

                console.error(
                    "[FIREBASE] Erro ao criar API Key:",
                    erro
                );

            }
        );


        return {

            success:
                true,

            message:
                "Login realizado com sucesso.",

            user:
                dadosUsuario

        };

    }
    catch (error) {

        console.error(
            "[FIREBASE] Erro ao fazer login:",
            error
        );

        return {

            success:
                false,

            message:
                traduzirErroFirebase(
                    error
                )

        };

    }

}


// =====================================================
// RECUPERAR PALAVRA-PASSE
// =====================================================

async function recuperarSenha(
    email
) {

    try {

        if (
            !email
        ) {

            return {

                success:
                    false,

                message:
                    "Informe seu email."

            };

        }


        await sendPasswordResetEmail(
            auth,
            email.trim()
        );


        return {

            success:
                true,

            message:
                "Enviamos um link para redefinir sua palavra-passe no email."

        };

    }
    catch (error) {

        console.error(
            "[FIREBASE] Erro ao recuperar palavra-passe:",
            error
        );

        return {

            success:
                false,

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


        if (
            !user
        ) {

            return {

                success:
                    false,

                message:
                    "Nenhum usuário está conectado."

            };

        }


        await sendEmailVerification(
            user
        );


        return {

            success:
                true,

            message:
                "Email de verificação reenviado."

        };

    }
    catch (error) {

        console.error(
            "[FIREBASE] Erro ao reenviar verificação:",
            error
        );

        return {

            success:
                false,

            message:
                traduzirErroFirebase(
                    error
                )

        };

    }

}


// =====================================================
// ESTADO DE AUTENTICAÇÃO
// =====================================================

function onAuthState(
    callback
) {

    return onAuthStateChanged(
        auth,
        callback
    );

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


        const dadosUsuario = {

            uid:
                user.uid,

            email:
                user.email || "",

            name:
                user.displayName || "",

            apiKey:
                ""

        };


        // =================================================
        // GUARDAR LOCALMENTE
        // =================================================

        try {

            localStorage.setItem(
                "userData",
                JSON.stringify(
                    dadosUsuario
                )
            );

        }
        catch (erroLocal) {

            console.warn(
                "[FIREBASE] Erro local:",
                erroLocal
            );

        }


        // =================================================
        // API KEY
        // =================================================

        criarDadosUsuario(
            user,
            user.displayName || ""
        )
        .then(
            apiKey => {

                const dadosAtualizados = {

                    uid:
                        user.uid,

                    email:
                        user.email || "",

                    name:
                        user.displayName || "",

                    apiKey:
                        apiKey

                };


                localStorage.setItem(
                    "userData",
                    JSON.stringify(
                        dadosAtualizados
                    )
                );


                localStorage.setItem(
                    "apiKey",
                    apiKey
                );

            }
        )
        .catch(
            erro => {

                console.error(
                    "[FIREBASE] Erro Google API Key:",
                    erro
                );

            }
        );


        return {

            success:
                true,

            message:
                "Login Google realizado com sucesso.",

            user:
                dadosUsuario

        };

    }
    catch (error) {

        console.error(
            "[FIREBASE] Erro no login Google:",
            error
        );

        return {

            success:
                false,

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

    try {

        const user =
            auth.currentUser;


        if (
            !user
        ) {

            return null;

        }


        const usuarioRef =
            ref(
                database,
                "users/" +
                user.uid
            );


        const snapshot =
            await get(
                usuarioRef
            );


        // =================================================
        // USUÁRIO NÃO EXISTE
        // =================================================

        if (
            !snapshot.exists()
        ) {

            const apiKey =
                await criarDadosUsuario(
                    user,
                    user.displayName || ""
                );


            const dadosUsuario = {

                uid:
                    user.uid,

                email:
                    user.email || "",

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


            return dadosUsuario;

        }


        // =================================================
        // DADOS EXISTENTES
        // =================================================

        const dados =
            snapshot.val() || {};


        // =================================================
        // GARANTIR API KEY
        // =================================================

        if (
            !dados.apiKey
        ) {

            dados.apiKey =
                gerarApiKey();


            await update(
                usuarioRef,
                {

                    apiKey:
                        dados.apiKey

                }
            );

        }


        // =================================================
        // RESULTADO
        // =================================================

        const resultado = {

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


        // =================================================
        // GUARDAR LOCALMENTE
        // =================================================

        try {

            localStorage.setItem(
                "userData",
                JSON.stringify(
                    resultado
                )
            );


            localStorage.setItem(
                "apiKey",
                resultado.apiKey
            );

        }
        catch (erroLocal) {

            console.warn(
                "[FIREBASE] Erro ao guardar dados:",
                erroLocal
            );

        }


        return resultado;

    }
    catch (erro) {

        console.error(
            "[FIREBASE] Erro ao obter dados do usuário:",
            erro
        );

        return null;

    }

}


// =====================================================
// COMPATIBILIDADE
// =====================================================

window.criarConta =
    async function (
        email,
        senha
    ) {

        return await registerUser(
            "",
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
