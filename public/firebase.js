// =====================================================
// MACVENDAS - FIREBASE
// FIREBASE CLIENT
// =====================================================

"use strict";

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

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

import {
    getDatabase,
    ref,
    get,
    set,
    update
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";


// =====================================================
// CONFIGURAÇÃO
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
// FIREBASE
// =====================================================

const app =
    initializeApp(firebaseConfig);

const auth =
    getAuth(app);

const database =
    getDatabase(app);


// =====================================================
// GERAR API KEY
// =====================================================

function gerarApiKey() {

    try {

        const id =
            crypto
                .randomUUID()
                .replace(/-/g, "");

        return "mk_" + id;

    }
    catch (erro) {

        console.warn(
            "[FIREBASE] crypto.randomUUID indisponível:",
            erro
        );

        return (
            "mk_" +
            Date.now() +
            "_" +
            Math.random()
                .toString(36)
                .substring(2, 18)
        );

    }

}


// =====================================================
// TRADUZIR ERROS
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


    const snapshot =
        await get(usuarioRef);


    // =================================================
    // JÁ EXISTE
    // =================================================

    if (snapshot.exists()) {

        const dados =
            snapshot.val() || {};


        if (dados.apiKey) {

            return dados.apiKey;

        }


        const apiKey =
            gerarApiKey();


        await update(
            usuarioRef,
            {
                apiKey: apiKey
            }
        );


        return apiKey;

    }


    // =================================================
    // NOVO USUÁRIO
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
        "[FIREBASE] Usuário criado:",
        user.uid
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

        name =
            String(name || "").trim();

        email =
            String(email || "").trim();

        password =
            String(password || "");


        // =================================================
        // VALIDAÇÃO
        // =================================================

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


        console.log(
            "[FIREBASE] Criando conta..."
        );


        // =================================================
        // FIREBASE AUTH
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
            "[FIREBASE] Auth criado:",
            user.uid
        );


        // =================================================
        // ATUALIZAR DISPLAY NAME
        // =================================================

        if (
            name &&
            !user.displayName
        ) {

            try {

                const { updateProfile } =
                    await import(
                        "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js"
                    );

                await updateProfile(
                    user,
                    {
                        displayName: name
                    }
                );

            }
            catch (erroNome) {

                console.warn(
                    "[FIREBASE] Não foi possível salvar nome:",
                    erroNome
                );

            }

        }


        // =================================================
        // CRIAR DADOS NO DATABASE
        // =================================================

        console.log(
            "[FIREBASE] Criando dados no Realtime Database..."
        );


        const apiKey =
            await criarDadosUsuario(
                user,
                name
            );


        console.log(
            "[FIREBASE] Dados criados com sucesso."
        );


        // =================================================
        // EMAIL DE VERIFICAÇÃO
        // =================================================

        try {

            await sendEmailVerification(
                user
            );

            console.log(
                "[FIREBASE] Email de verificação enviado."
            );

        }
        catch (erroEmail) {

            console.warn(
                "[FIREBASE] Falha ao enviar verificação:",
                erroEmail
            );

        }


        // =================================================
        // GUARDAR LOCAL
        // =================================================

        const dadosUsuario = {

            uid:
                user.uid,

            email:
                user.email || email,

            name:
                name,

            fullName:
                name,

            apiKey:
                apiKey

        };


        localStorage.setItem(
            "userData",
            JSON.stringify(dadosUsuario)
        );


        localStorage.setItem(
            "apiKey",
            apiKey
        );


        // =================================================
        // RETORNO
        // =================================================

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
            "[FIREBASE] Erro ao criar conta:",
            error
        );


        return {

            success: false,

            message:
                traduzirErroFirebase(error)

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


        const credential =
            await signInWithEmailAndPassword(
                auth,
                email,
                password
            );


        const user =
            credential.user;


        // =================================================
        // VERIFICAR EMAIL
        // =================================================

        if (!user.emailVerified) {

            await signOut(auth);

            return {

                success: false,

                message:
                    "Seu email ainda não foi verificado. Verifique sua caixa de entrada."

            };

        }


        // =================================================
        // OBTER DADOS
        // =================================================

        const dados =
            await obterDadosUsuario();


        const dadosUsuario = {

            ...(dados || {}),

            uid:
                user.uid,

            email:
                user.email || email,

            name:
                dados?.fullName ||
                user.displayName ||
                "",

            apiKey:
                dados?.apiKey || ""

        };


        // =================================================
        // LOCAL STORAGE
        // =================================================

        localStorage.setItem(
            "userData",
            JSON.stringify(dadosUsuario)
        );


        if (dadosUsuario.apiKey) {

            localStorage.setItem(
                "apiKey",
                dadosUsuario.apiKey
            );

        }


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
            "[FIREBASE] Erro ao fazer login:",
            error
        );


        return {

            success: false,

            message:
                traduzirErroFirebase(error)

        };

    }

}


// =====================================================
// RECUPERAR SENHA
// =====================================================

async function recuperarSenha(
    email
) {

    try {

        email =
            String(email || "").trim();


        if (!email) {

            return {

                success: false,

                message:
                    "Informe seu email."

            };

        }


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
            "[FIREBASE] Erro ao recuperar senha:",
            error
        );


        return {

            success: false,

            message:
                traduzirErroFirebase(error)

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


        await sendEmailVerification(user);


        return {

            success: true,

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

            success: false,

            message:
                traduzirErroFirebase(error)

        };

    }

}


// =====================================================
// GOOGLE
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

            name:
                user.displayName || "",

            fullName:
                user.displayName || "",

            apiKey:
                apiKey

        };


        localStorage.setItem(
            "userData",
            JSON.stringify(dadosUsuario)
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
                traduzirErroFirebase(error)

        };

    }

}


// =====================================================
// SAIR
// =====================================================

async function sair() {

    try {

        await signOut(auth);


        localStorage.removeItem(
            "userData"
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
// OBTER DADOS
// =====================================================

async function obterDadosUsuario() {

    try {

        const user =
            auth.currentUser;


        if (!user) {

            return null;

        }


        const usuarioRef =
            ref(
                database,
                "users/" + user.uid
            );


        const snapshot =
            await get(usuarioRef);


        // =================================================
        // NÃO EXISTE
        // =================================================

        if (!snapshot.exists()) {

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
                JSON.stringify(dadosUsuario)
            );


            localStorage.setItem(
                "apiKey",
                apiKey
            );


            return dadosUsuario;

        }


        // =================================================
        // EXISTE
        // =================================================

        const dados =
            snapshot.val() || {};


        if (!dados.apiKey) {

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


        localStorage.setItem(
            "userData",
            JSON.stringify(resultado)
        );


        localStorage.setItem(
            "apiKey",
            resultado.apiKey
        );


        return resultado;

    }
    catch (erro) {

        console.error(
            "[FIREBASE] Erro ao obter dados:",
            erro
        );

        return null;

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
