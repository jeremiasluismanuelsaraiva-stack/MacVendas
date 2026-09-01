// =====================================================
// MACVENDAS - FIREBASE
// =====================================================
// Autenticação
// Registro
// Login
// Recuperação de palavra-passe
// Verificação de email
// Login Google
// API Key do usuário
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

const firebaseConfig = {

    apiKey:
        "AIzaSyA7-uHk2pY578l8ICXmjhDWXTuo0Id-Umc",

    authDomain:
        "playstar-74339.firebaseapp.com",

    projectId:
        "playstar-74339",

    storageBucket:
        "playstar-74339.firebasestorage.app",

    messagingSenderId:
        "516836103698",

    appId:
        "1:516836103698:web:6f26dca949653a877a6acb"

};


// =====================================================
// INICIALIZAR FIREBASE
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
            crypto.randomUUID()
                .replace(/-/g, "");

        return "mk_" + id;

    }
    catch (erro) {

        console.warn(
            "crypto.randomUUID não disponível. Usando alternativa."
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
            "A janela de login foi fechada.",

        "auth/popup-blocked":
            "O navegador bloqueou a janela de login.",

        "auth/network-request-failed":
            "Erro de conexão com a internet."

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

    if (!user || !user.uid) {

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
    // USUÁRIO JÁ EXISTE
    // =================================================

    if (snapshot.exists()) {

        const dados =
            snapshot.val() || {};


        // =============================================
        // JÁ POSSUI API KEY
        // =============================================

        if (dados.apiKey) {

            return dados.apiKey;

        }


        // =============================================
        // GERAR API KEY
        // =============================================

        const apiKey =
            gerarApiKey();


        await update(
            usuarioRef,
            {

                apiKey:
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
// CRIAR CONTA
// =====================================================

async function registerUser(
    name,
    email,
    password
) {

    try {

        // =============================================
        // VALIDAR
        // =============================================

        if (!email || !password) {

            return {

                success:
                    false,

                message:
                    "Informe o email e a palavra-passe."

            };

        }


        // =============================================
        // CRIAR USUÁRIO NO FIREBASE AUTH
        // =============================================

        const credential =
            await createUserWithEmailAndPassword(
                auth,
                email.trim(),
                password
            );


        const user =
            credential.user;


        // =============================================
        // ENVIAR EMAIL DE VERIFICAÇÃO
        // =============================================

        await sendEmailVerification(
            user
        );


        // =============================================
        // CRIAR DADOS NO REALTIME DATABASE
        // =============================================

        const apiKey =
            await criarDadosUsuario(
                user,
                name || ""
            );


        // =============================================
        // RETORNAR RESULTADO
        // =============================================

        return {

            success:
                true,

            message:
                "Conta criada com sucesso! Verifique seu email.",

            user: {

                uid:
                    user.uid,

                email:
                    user.email,

                name:
                    name || "",

                apiKey:
                    apiKey

            }

        };

    }
    catch (error) {

        console.error(
            "Erro ao criar conta:",
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

        console.log(
            "[FIREBASE] Iniciando login..."
        );


        // =============================================
        // AUTENTICAÇÃO
        // =============================================

        const credential =
            await signInWithEmailAndPassword(
                auth,
                email.trim(),
                password
            );


        const user =
            credential.user;


        console.log(
            "[FIREBASE] Login Auth OK:",
            user.uid
        );


        // =============================================
        // VERIFICAR EMAIL
        // =============================================

        if (!user.emailVerified) {

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


        // =============================================
        // GARANTIR DADOS DO USUÁRIO
        // =============================================

        const apiKey =
            await criarDadosUsuario(
                user,
                user.displayName || ""
            );


        // =============================================
        // RETORNAR USUÁRIO
        // =============================================

        return {

            success:
                true,

            message:
                "Login realizado com sucesso.",

            user: {

                uid:
                    user.uid,

                email:
                    user.email,

                name:
                    user.displayName || "",

                apiKey:
                    apiKey

            }

        };

    }
    catch (error) {

        console.error(
            "Erro ao fazer login:",
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

        if (!email) {

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
            "Erro ao recuperar palavra-passe:",
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
// REENVIAR EMAIL DE VERIFICAÇÃO
// =====================================================

async function resendVerification() {

    try {

        const user =
            auth.currentUser;


        if (!user) {

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
            "Erro ao reenviar verificação:",
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

        console.log(
            "[FIREBASE] Iniciando login Google..."
        );


        // =============================================
        // PROVIDER
        // =============================================

        const provider =
            new GoogleAuthProvider();


        // =============================================
        // LOGIN
        // =============================================

        const result =
            await signInWithPopup(
                auth,
                provider
            );


        const user =
            result.user;


        console.log(
            "[FIREBASE] Google Login OK:",
            user.uid
        );


        // =============================================
        // GARANTIR DADOS / API KEY
        // =============================================

        const apiKey =
            await criarDadosUsuario(
                user,
                user.displayName || ""
            );


        // =============================================
        // RETORNAR RESULTADO
        // =============================================

        return {

            success:
                true,

            message:
                "Login Google realizado com sucesso.",

            user: {

                uid:
                    user.uid,

                email:
                    user.email,

                name:
                    user.displayName || "",

                apiKey:
                    apiKey

            }

        };

    }
    catch (error) {

        console.error(
            "Erro no login Google:",
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


        // =============================================
        // LIMPAR DADOS LOCAIS
        // =============================================

        localStorage.removeItem(
            "userData"
        );

        localStorage.removeItem(
            "apiKey"
        );


        // =============================================
        // VOLTAR PARA LOGIN
        // =============================================

        window.location.href =
            "/";

    }
    catch (error) {

        console.error(
            "Erro ao sair:",
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


        // =============================================
        // NÃO AUTENTICADO
        // =============================================

        if (!user) {

            return null;

        }


        // =============================================
        // REFERÊNCIA
        // =============================================

        const usuarioRef =
            ref(
                database,
                "users/" + user.uid
            );


        const snapshot =
            await get(usuarioRef);


        // =============================================
        // USUÁRIO NÃO EXISTE NO DATABASE
        // =============================================

        if (!snapshot.exists()) {

            const apiKey =
                await criarDadosUsuario(
                    user,
                    user.displayName || ""
                );


            return {

                uid:
                    user.uid,

                email:
                    user.email || "",

                fullName:
                    user.displayName || "",

                apiKey:
                    apiKey

            };

        }


        // =============================================
        // DADOS EXISTENTES
        // =============================================

        const dados =
            snapshot.val() || {};


        // =============================================
        // GARANTIR API KEY
        // =============================================

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


        // =============================================
        // RETORNAR DADOS
        // =============================================

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
    catch (erro) {

        console.error(
            "Erro ao obter dados do usuário:",
            erro
        );


        return null;

    }

}


// =====================================================
// COMPATIBILIDADE COM SISTEMA ANTIGO
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
