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
    signInWithPopup,
    updateProfile
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

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
    getDatabase(app);


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


    console.log(
        "[FIREBASE] Verificando usuário no Database:",
        user.uid
    );


    const snapshot =
        await get(usuarioRef);


    // =================================================
    // JÁ EXISTE
    // =================================================

    if (
        snapshot.exists()
    ) {

        const dados =
            snapshot.val() || {};


        // Já possui API Key
        if (
            dados.apiKey
        ) {

            return dados.apiKey;

        }


        // Não possui API Key
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
        "[FIREBASE] Dados do usuário criados:",
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

    name =
        String(name || "").trim();

    email =
        String(email || "").trim();

    password =
        String(password || "");


    // =================================================
    // VALIDAÇÃO
    // =================================================

    if (!name) {

        return {

            success:
                false,

            message:
                "Informe seu nome."

        };

    }


    if (!email) {

        return {

            success:
                false,

            message:
                "Informe o email."

        };

    }


    if (!password) {

        return {

            success:
                false,

            message:
                "Informe a palavra-passe."

        };

    }


    if (password.length < 6) {

        return {

            success:
                false,

            message:
                "A palavra-passe deve ter pelo menos 6 caracteres."

        };

    }


    try {

        console.log(
            "[FIREBASE] 1. Criando conta Auth..."
        );


        // =================================================
        // CRIAR CONTA AUTH
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
            "[FIREBASE] 2. Auth criado:",
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


                console.log(
                    "[FIREBASE] 3. Nome atualizado."
                );

            }
            catch (erroNome) {

                console.warn(
                    "[FIREBASE] Não foi possível atualizar nome:",
                    erroNome
                );

            }

        }


        // =================================================
        // API KEY
        // =================================================

        let apiKey =
            "";


        try {

            console.log(
                "[FIREBASE] 4. Criando dados no Realtime Database..."
            );


            apiKey =
                await criarDadosUsuario(
                    user,
                    name
                );


            console.log(
                "[FIREBASE] 5. Database OK."
            );

        }
        catch (erroDatabase) {

            console.error(
                "[FIREBASE] Erro no Realtime Database:",
                erroDatabase
            );


            /*
             * IMPORTANTE:
             *
             * A conta AUTH já foi criada.
             *
             * Não vamos considerar o cadastro
             * totalmente perdido só porque o
             * Database falhou.
             */

            apiKey =
                gerarApiKey();


            console.warn(
                "[FIREBASE] API Key temporária gerada."
            );

        }


        // =================================================
        // EMAIL DE VERIFICAÇÃO
        // =================================================

        try {

            console.log(
                "[FIREBASE] 6. Enviando verificação..."
            );


            await sendEmailVerification(
                user
            );


            console.log(
                "[FIREBASE] 7. Email de verificação enviado."
            );

        }
        catch (erroEmail) {

            console.warn(
                "[FIREBASE] Falha ao enviar email:",
                erroEmail
            );

        }


        // =================================================
        // DADOS LOCAIS
        // =================================================

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


        if (apiKey) {

            localStorage.setItem(
                "apiKey",
                apiKey
            );

        }


        // =================================================
        // FINAL
        // =================================================

        console.log(
            "[FIREBASE] 8. Cadastro concluído."
        );


        return {

            success:
                true,

            message:
                "Conta criada com sucesso! Verifique seu email.",

            user:
                dadosUsuario

        };

    }
    catch (error) {

        console.error(
            "[FIREBASE] ERRO NO CADASTRO:",
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

        email =
            String(email || "").trim();

        password =
            String(password || "");


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


        console.log(
            "[FIREBASE] Fazendo login..."
        );


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
        // DADOS
        // =================================================

        const dados =
            await obterDadosUsuario();


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
                dados?.apiKey ||
                ""

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


        if (
            dadosUsuario.apiKey
        ) {

            localStorage.setItem(
                "apiKey",
                dadosUsuario.apiKey
            );

        }


        console.log(
            "[FIREBASE] Login concluído."
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
            "[FIREBASE] Erro login:",
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

                success:
                    false,

                message:
                    "Informe seu email."

            };

        }


        await sendPasswordResetEmail(
            auth,
            email
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
            "[FIREBASE] Erro recuperar senha:",
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
            "[FIREBASE] Erro verificação:",
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


        let apiKey =
            "";


        try {

            apiKey =
                await criarDadosUsuario(
                    user,
                    user.displayName || ""
                );

        }
        catch (erroDatabase) {

            console.error(
                "[FIREBASE] Erro Google Database:",
                erroDatabase
            );

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


        if (apiKey) {

            localStorage.setItem(
                "apiKey",
                apiKey
            );

        }


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
            "[FIREBASE] Erro Google:",
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


        if (!user) {

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
        // NÃO EXISTE
        // =================================================

        if (
            !snapshot.exists()
        ) {

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


            try {

                await set(
                    usuarioRef,
                    dadosUsuario
                );

            }
            catch (erroSet) {

                console.error(
                    "[FIREBASE] Erro ao criar dados:",
                    erroSet
                );

            }


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
        // API KEY
        // =================================================

        if (
            !dados.apiKey
        ) {

            dados.apiKey =
                gerarApiKey();


            try {

                await update(
                    usuarioRef,
                    {

                        apiKey:
                            dados.apiKey

                    }
                );

            }
            catch (erroApiKey) {

                console.error(
                    "[FIREBASE] Erro ao salvar API Key:",
                    erroApiKey
                );

            }

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
        // LOCAL
        // =================================================

        localStorage.setItem(
            "userData",
            JSON.stringify(
                resultado
            )
        );


        if (
            resultado.apiKey
        ) {

            localStorage.setItem(
                "apiKey",
                resultado.apiKey
            );

        }


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
