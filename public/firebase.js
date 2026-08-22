
// =====================================================
// MACVENDAS - FIREBASE
// Autenticação de usuários
// =====================================================

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


// =====================================================
// CONFIGURAÇÃO FIREBASE
// =====================================================

const firebaseConfig = {

    apiKey: "AIzaSyA7-uHk2pY578l8ICXmjhDWXTuo0Id-Umc",

    authDomain: "playstar-74339.firebaseapp.com",

    projectId: "playstar-74339",

    storageBucket: "playstar-74339.firebasestorage.app",

    messagingSenderId: "516836103698",

    appId: "1:516836103698:web:6f26dca949653a877a6acb"

};


// =====================================================
// INICIALIZAÇÃO
// =====================================================

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);


// =====================================================
// CRIAR CONTA
// =====================================================

async function registerUser(name, email, password) {

    try {

        const credential =
            await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );

        await sendEmailVerification(
            credential.user
        );

        return {

            success: true,

            message:
                "Conta criada com sucesso! Verifique seu email.",

            user: {

                uid: credential.user.uid,

                email: credential.user.email,

                name: name

            }

        };

    } catch (error) {

        console.error(
            "Erro ao criar conta:",
            error
        );

        return {

            success: false,

            message: traduzirErroFirebase(error)

        };

    }

}


// =====================================================
// LOGIN
// =====================================================

async function loginUser(email, password) {

    try {

        const credential =
            await signInWithEmailAndPassword(
                auth,
                email,
                password
            );

        const user =
            credential.user;


        if (!user.emailVerified) {

            return {

                success: false,

                message:
                    "Seu email ainda não foi verificado. Verifique sua caixa de entrada."

            };

        }


        return {

            success: true,

            message:
                "Login realizado com sucesso.",

            user: {

                uid: user.uid,

                email: user.email,

                name:
                    user.displayName || ""

            }

        };

    } catch (error) {

        console.error(
            "Erro ao fazer login:",
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
// ESQUECI A PALAVRA-PASSE
// =====================================================

async function recuperarSenha(email) {

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

    } catch (error) {

        console.error(
            "Erro ao recuperar palavra-passe:",
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
// REENVIAR EMAIL DE VERIFICAÇÃO
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

    } catch (error) {

        console.error(
            "Erro ao reenviar verificação:",
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
// ESTADO DE AUTENTICAÇÃO
// =====================================================

function onAuthState(callback) {

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


        return {

            success: true,

            user: {

                uid: result.user.uid,

                email: result.user.email,

                name:
                    result.user.displayName || ""

            }

        };

    } catch (error) {

        console.error(
            "Erro no login Google:",
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

        window.location.href = "/";

    } catch (error) {

        console.error(
            "Erro ao sair:",
            error
        );

    }

}


// =====================================================
// TRADUZIR ERROS FIREBASE
// =====================================================

function traduzirErroFirebase(error) {

    const codigo =
        error?.code || "";


    const mensagens = {

        "auth/email-already-in-use":
            "Este email já está cadastrado.",

        "auth/invalid-email":
            "O email informado não é válido.",

        "auth/weak-password":
            "A senha deve ter pelo menos 6 caracteres.",

        "auth/invalid-credential":
            "Email ou senha incorretos.",

        "auth/user-not-found":
            "Usuário não encontrado.",

        "auth/wrong-password":
            "Senha incorreta.",

        "auth/too-many-requests":
            "Muitas tentativas. Aguarde alguns minutos.",

        "auth/network-request-failed":
            "Erro de conexão. Verifique sua internet.",

        "auth/popup-closed-by-user":
            "A janela de login foi fechada."

    };


    return mensagens[codigo]
        || error?.message
        || "Ocorreu um erro. Tente novamente.";

}


// =====================================================
// COMPATIBILIDADE
// =====================================================

window.criarConta = async function (
    email,
    senha
) {

    return await registerUser(
        "",
        email,
        senha
    );

};


window.entrar = async function (
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


// =====================================================
// EXPORTAÇÕES
// =====================================================

export {

    app,

    auth,

    registerUser,

    loginUser,

    recuperarSenha,

    resendVerification,

    onAuthState,

    googleLogin,

    sair

};

