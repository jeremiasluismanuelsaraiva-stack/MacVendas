// =====================================================
// CREDENCIAIS DA API
// =====================================================

async function carregarCredenciaisTutorial() {

    const uidElemento =
        el("tutorialUid");


    const apiKeyElemento =
        el("tutorialApiKey");


    if (
        !uidElemento &&
        !apiKeyElemento
    ) {

        return;

    }


    // =================================================
    // CARREGANDO
    // =================================================

    if (uidElemento) {

        uidElemento.textContent =
            "Carregando...";

    }


    if (apiKeyElemento) {

        apiKeyElemento.textContent =
            "Carregando...";

    }


    try {

        // =================================================
        // VERIFICAR MOZ API
        // =================================================

        if (
            !window.MOZ_API ||
            typeof window.MOZ_API.get !==
            "function"
        ) {

            throw new Error(
                "MOZ_API não disponível."
            );

        }


        // =================================================
        // CREDENCIAIS JÁ SALVAS?
        // =================================================

        let credenciais = {

            uid:
                "",

            apiKey:
                ""

        };


        if (
            typeof window.MOZ_API.obterCredenciais ===
            "function"
        ) {

            credenciais =
                window.MOZ_API.obterCredenciais();

        }


        // =================================================
        // SE JÁ TEMOS AS DUAS
        // =================================================

        if (
            credenciais.uid &&
            credenciais.apiKey
        ) {

            if (uidElemento) {

                uidElemento.textContent =
                    credenciais.uid;

            }


            if (apiKeyElemento) {

                apiKeyElemento.textContent =
                    credenciais.apiKey;

            }


            console.log(
                "[MOZ TECH] Credenciais carregadas do navegador."
            );


            return;

        }


        // =================================================
        // BUSCAR CONFIGURAÇÃO
        // =================================================

        const json =
            await window.MOZ_API.get(
                "/configuracoes"
            );


        console.log(
            "[MOZ TECH] Configurações recebidas:",
            json
        );


        if (
            !json ||
            json.success !== true
        ) {

            throw new Error(
                json?.error ||
                "A API não retornou uma configuração válida."
            );

        }


        // =================================================
        // CONFIGURAÇÃO
        // =================================================

        const configuracao =
            json.configuracao ||
            json.config ||
            json.data;


        if (!configuracao) {

            throw new Error(
                "Nenhuma configuração encontrada."
            );

        }


        // =================================================
        // UID
        // =================================================

        const uid =
            configuracao.uid ||
            configuracao.UID ||
            configuracao.userId ||
            configuracao.user_id ||
            "";


        // =================================================
        // API KEY
        // =================================================

        const apiKey =
            configuracao.apiKey ||
            configuracao.apikey ||
            configuracao.api_key ||
            configuracao.API_KEY ||
            "";


        // =================================================
        // VERIFICAR
        // =================================================

        if (!uid) {

            throw new Error(
                "UID não encontrado."
            );

        }


        if (!apiKey) {

            throw new Error(
                "API Key não encontrada."
            );

        }


        // =================================================
        // GUARDAR
        // =================================================

        if (
            typeof window.MOZ_API.definirCredenciais ===
            "function"
        ) {

            window.MOZ_API.definirCredenciais(
                uid,
                apiKey
            );

        }


        // =================================================
        // MOSTRAR UID
        // =================================================

        if (uidElemento) {

            uidElemento.textContent =
                uid;

        }


        // =================================================
        // MOSTRAR API KEY
        // =================================================

        if (apiKeyElemento) {

            apiKeyElemento.textContent =
                apiKey;

        }


        console.log(
            "[MOZ TECH] Credenciais carregadas com sucesso."
        );

    }
    catch (erro) {

        console.error(
            "[MOZ TECH] Erro ao carregar credenciais:",
            erro
        );


        if (uidElemento) {

            uidElemento.textContent =
                "Erro ao carregar";

        }


        if (apiKeyElemento) {

            apiKeyElemento.textContent =
                "Erro ao carregar";

        }

    }

}
