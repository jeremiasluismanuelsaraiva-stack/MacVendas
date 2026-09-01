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

        const aleatorio =
            Math.random()
                .toString(36)
                .substring(2, 18);

        return "mk_" + Date.now() + aleatorio;

    }

}


// =====================================================
// CRIAR / GARANTIR DADOS DO USUÁRIO
// =====================================================

async function criarDadosUsuario(
    user,
    name = ""
) {

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
            snapshot.val();


        // =============================================
        // JÁ POSSUI API KEY
        // =============================================

        if (dados.apiKey) {

            return dados.apiKey;

        }


        // =============================================
        // USUÁRIO ANTIGO SEM API KEY
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

        const credential =
            await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );


        const user =
            credential.user;


        // =============================================
        // EMAIL DE VERIFICAÇÃO
        // =============================================

        await sendEmailVerification(
            user
        );


        // =============================================
        // CRIAR DADOS DO USUÁRIO
        // =============================================

        const apiKey =
            await criarDadosUsuario(
                user,
                name
            );


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
                    name,

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
            "Iniciando login..."
        );


        const credential =
            await signInWithEmailAndPassword(
                auth,
                email,
                password
            );


        const user =
            credential.user;


        console.log(
            "Firebase Authentication OK:",
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
        // GARANTIR DADOS E API KEY
        // =============================================

        const apiKey =
            await criarDadosUsuario(
                user,
                user.displayName || ""
            );


        // =============================================
        // LOGIN CONCLUÍDO
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
            "Login Google OK:",
            user.uid
        );


        // =============================================
        // GARANTIR DADOS E API KEY
        // =============================================

        const apiKey =
            await criarDadosUsuario(
                user,
                user.displayName || ""
            );


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
// OBTER DADOS DO USUÁRIO
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


        // =============================================
        // NÃO EXISTE NO DATABASE
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
            snapshot.val();


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
        // RETORNAR DADOS COMPLETOS
        // =============================================

        return {

            ...dados,

            uid:
                user.uid,

            email:
                user.email ||
                dados.email ||
                ""

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


// =====================================================
// EXPORTAÇÕES
// =====================================================

export {

    app,

    auth,

    database,

    registerUser,

    loginUser,

    recuperarSenha,

    resendVerification,

    onAuthState,

    googleLogin,

    sair,

    obterDadosUsuario

};

};
