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
// Realtime Database
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
    initializeApp(
        firebaseConfig
    );


const auth =
    getAuth(
        app
    );


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
                .replace(
                    /-/g,
                    ""
                );


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
                .substring(
                    2,
                    18
                );


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

function traduzirErroFirebase(
    error
) {

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

    // =================================================
    // VALIDAR USUÁRIO
    // =================================================

    if (
        !user ||
        !user.uid
    ) {

        throw new Error(
            "Usuário Firebase inválido."
        );

    }


    // =================================================
    // REFERÊNCIA DO USUÁRIO
    // =================================================

    const usuarioRef =
        ref(
            database,
            "users/" +
            user.uid
        );


    // =================================================
    // VERIFICAR SE JÁ EXISTE
    // =================================================

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


        // =============================================
        // JÁ POSSUI API KEY
        // =============================================

        if (
            dados.apiKey
        ) {

            return dados.apiKey;

        }


        // =============================================
        // CRIAR NOVA API KEY
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
                new Date()
                    .toISOString()

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

        console.log(
            "[FIREBASE] Criando conta..."
        );


        // =================================================
        // VALIDAR
        // =================================================

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


        // =================================================
        // CRIAR USUÁRIO NO AUTH
        // =================================================

        const credential =
            await createUserWithEmailAndPassword(
                auth,
                email.trim(),
                password
            );


        const user =
            credential.user;


        console.log(
            "[FIREBASE] Usuário criado:",
            user.uid
        );


        // =================================================
        // ENVIAR EMAIL DE VERIFICAÇÃO
        // =================================================

        try {

            await sendEmailVerification(
                user
            );

        }
        catch (erroEmail) {

            console.warn(
                "[FIREBASE] Não foi possível enviar email de verificação:",
                erroEmail
            );

        }


        // =================================================
        // CRIAR DADOS DO USUÁRIO
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


        // =================================================
        // RETORNAR
        // =================================================

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

        console.log(
            "[FIREBASE] Iniciando login..."
        );


        // =================================================
        // VALIDAR
        // =================================================

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


        // =================================================
        // AUTENTICAR NO FIREBASE AUTH
        // =================================================

        const credential =
            await signInWithEmailAndPassword(
                auth,
                email.trim(),
                password
            );


        const user =
            credential.user;


        console.log(
            "[FIREBASE] Authentication OK:",
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

                success:
                    false,

                message:
                    "Seu email ainda não foi verificado. Verifique sua caixa de entrada."

            };

        }


        // =================================================
        // DADOS BÁSICOS
        // =================================================
        //
        // IMPORTANTE:
        // NÃO ESPERAMOS O DATABASE PARA LIBERAR O LOGIN.
        //
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
        // GUARDAR LOGIN LOCALMENTE
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
                "[FIREBASE] Erro ao guardar userData:",
                erroLocal
            );

        }


        // =================================================
        // CRIAR / OBTER API KEY EM SEGUNDO PLANO
        // =================================================
        //
        // NÃO BLOQUEIA O LOGIN.
        //
        // =================================================

        criarDadosUsuario(
            user,
            user.displayName || ""
        )
        .then(
            apiKey => {

                console.log(
                    "[FIREBASE] API Key:",
                    apiKey
                );


                try {

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
                catch (erroLocal) {

                    console.warn(
                        "[FIREBASE] Erro ao guardar API Key:",
                        erroLocal
                    );

                }

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


        // =================================================
        // LOGIN CONCLUÍDO
        // =================================================

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
// REENVIAR EMAIL DE VERIFICAÇÃO
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

        console.log(
            "[FIREBASE] Iniciando Google Login..."
        );


        // =================================================
        // PROVIDER
        // =================================================

        const provider =
            new GoogleAuthProvider();


        // =================================================
        // LOGIN
        // =================================================

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
                "[FIREBASE] Erro ao guardar Google userData:",
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

                console.log(
                    "[FIREBASE] Google API Key:",
                    apiKey
                );


                try {

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
                catch (erroLocal) {

                    console.warn(
                        "[FIREBASE] Erro ao guardar Google API Key:",
                        erroLocal
                    );

                }

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


        // =================================================
        // RETORNAR
        // =================================================

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


        // =================================================
        // LIMPAR DADOS LOCAIS
        // =================================================

        localStorage.removeItem(
            "userData"
        );

        localStorage.removeItem(
            "apiKey"
        );


        // =================================================
        // VOLTAR PARA LOGIN
        // =================================================

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


        // =================================================
        // NÃO AUTENTICADO
        // =================================================

        if (
            !user
        ) {

            return null;

        }


        // =================================================
        // REFERÊNCIA
        // =================================================

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
        // NÃO EXISTE NO DATABASE
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


            // Guardar localmente

            try {

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

            }
            catch (erroLocal) {

                console.warn(
                    "[FIREBASE] Erro local:",
                    erroLocal
                );

            }


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
        // DADOS FINAIS
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
// COMPATIBILIDADE - CRIAR CONTA
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


// =====================================================
// COMPATIBILIDADE - ENTRAR
// =====================================================

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


// =====================================================
// COMPATIBILIDADE - GOOGLE
// =====================================================

window.googleLogin =
    googleLogin;


// =====================================================
// COMPATIBILIDADE - SAIR
// =====================================================

window.sair =
    sair;


// =====================================================
// COMPATIBILIDADE - DADOS USUÁRIO
// =====================================================

window.obterDadosUsuario =
    obterDadosUsuario;


// =====================================================
// COMPATIBILIDADE - RECUPERAR SENHA
// =====================================================

window.recuperarSenha =
    recuperarSenha;


// =====================================================
// COMPATIBILIDADE - REENVIAR VERIFICAÇÃO
// =====================================================

window.resendVerification =
    resendVerification;


// =====================================================
// COMPATIBILIDADE - ESTADO AUTH
// =====================================================

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
