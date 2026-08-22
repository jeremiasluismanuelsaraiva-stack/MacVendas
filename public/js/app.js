// =====================================================
// MOZ TECH - APP.JS
// AUTENTICAÇÃO + DADOS DO USUÁRIO
// =====================================================

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
    auth,
    obterDadosUsuario
} from "/firebase.js";


// =====================================================
// MOSTRAR DADOS DO USUÁRIO
// =====================================================

async function carregarUsuario() {

    try {

        const user = auth.currentUser;

        if (!user) {

            console.warn("Nenhum usuário autenticado.");

            return;

        }

        console.log("Usuário autenticado:", user.uid);


        // Buscar dados do usuário
        const resultado =
            await obterDadosUsuario(user);


        if (!resultado || !resultado.success) {

            console.error(
                "Não foi possível carregar os dados:",
                resultado
            );

            return;

        }


        const dados = resultado.data || {};

        const uid =
            dados.uid ||
            user.uid;

        const apiKey =
            dados.apiKey ||
            "Não disponível";

        const nome =
            dados.name ||
            user.displayName ||
            "Usuário";

        const email =
            dados.email ||
            user.email ||
            "-";


        // =================================================
        // SIDEBAR
        // =================================================

        const nomeElemento =
            document.getElementById(
                "sidebarUserName"
            );

        const emailElemento =
            document.getElementById(
                "sidebarUserEmail"
            );

        const uidElemento =
            document.getElementById(
                "sidebarUserUid"
            );

        const apiElemento =
            document.getElementById(
                "sidebarApiKey"
            );


        if (nomeElemento) {

            nomeElemento.textContent =
                nome;

        }


        if (emailElemento) {

            emailElemento.textContent =
                email;

        }


        if (uidElemento) {

            uidElemento.textContent =
                "UID: " + uid;

        }


        if (apiElemento) {

            apiElemento.textContent =
                "API Key: " + apiKey;

        }


        // =================================================
        // TUTORIAL
        // =================================================

        const tutorialUid =
            document.getElementById(
                "tutorialUid"
            );

        const tutorialApiKey =
            document.getElementById(
                "tutorialApiKey"
            );


        if (tutorialUid) {

            tutorialUid.textContent =
                uid;

        }


        if (tutorialApiKey) {

            tutorialApiKey.textContent =
                apiKey;

        }


        // =================================================
        // GUARDAR LOCALMENTE
        // =================================================

        localStorage.setItem(
            "userData",
            JSON.stringify({

                uid: uid,

                email: email,

                name: nome,

                apiKey: apiKey

            })
        );


        console.log(
            "Credenciais carregadas:",
            {
                uid,
                apiKey
            }
        );

    }

    catch (erro) {

        console.error(
            "Erro ao carregar usuário:",
            erro
        );

    }

}


// =====================================================
// COPIAR TEXTO
// =====================================================

async function copiarTexto(texto) {

    if (!texto) return;

    try {

        await navigator.clipboard.writeText(
            texto
        );

        alert("Copiado com sucesso!");

    }

    catch (erro) {

        console.error(
            "Erro ao copiar:",
            erro
        );

    }

}


// =====================================================
// BOTÕES DE COPIAR
// =====================================================

function inicializarCopias() {

    const copyUidBtn =
        document.getElementById(
            "copyUidBtn"
        );

    const copyApiKeyBtn =
        document.getElementById(
            "copyApiKeyBtn"
        );

    const copyTutorialUidBtn =
        document.getElementById(
            "copyTutorialUidBtn"
        );

    const copyTutorialApiKeyBtn =
        document.getElementById(
            "copyTutorialApiKeyBtn"
        );


    if (copyUidBtn) {

        copyUidBtn.addEventListener(
            "click",
            () => {

                const texto =
                    document
                        .getElementById(
                            "sidebarUserUid"
                        )
                        ?.textContent
                        ?.replace(
                            "UID:",
                            ""
                        )
                        .trim();

                copiarTexto(texto);

            }
        );

    }


    if (copyApiKeyBtn) {

        copyApiKeyBtn.addEventListener(
            "click",
            () => {

                const texto =
                    document
                        .getElementById(
                            "sidebarApiKey"
                        )
                        ?.textContent
                        ?.replace(
                            "API Key:",
                            ""
                        )
                        .trim();

                copiarTexto(texto);

            }
        );

    }


    if (copyTutorialUidBtn) {

        copyTutorialUidBtn.addEventListener(
            "click",
            () => {

                const texto =
                    document.getElementById(
                        "tutorialUid"
                    )?.textContent;

                copiarTexto(texto);

            }
        );

    }


    if (copyTutorialApiKeyBtn) {

        copyTutorialApiKeyBtn.addEventListener(
            "click",
            () => {

                const texto =
                    document.getElementById(
                        "tutorialApiKey"
                    )?.textContent;

                copiarTexto(texto);

            }
        );

    }

}


// =====================================================
// LOGOUT
// =====================================================

function inicializarLogout() {

    const botao =
        document.getElementById(
            "logoutBtn"
        );


    if (!botao) return;


    botao.addEventListener(
        "click",
        async () => {

            try {

                await signOut(auth);

                localStorage.removeItem(
                    "userData"
                );

                window.location.href =
                    "/";

            }

            catch (erro) {

                console.error(
                    "Erro ao sair:",
                    erro
                );

            }

        }
    );

}


// =====================================================
// FIREBASE
// =====================================================

onAuthStateChanged(
    auth,
    async (user) => {

        if (!user) {

            console.warn(
                "Usuário não autenticado."
            );

            return;

        }

        console.log(
            "Sessão iniciada:",
            user.email
        );


        await carregarUsuario();

    }
);


// =====================================================
// INICIALIZAÇÃO
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        inicializarCopias();

        inicializarLogout();

    }
);
