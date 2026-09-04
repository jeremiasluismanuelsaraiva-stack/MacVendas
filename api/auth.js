"use strict";

// =====================================================
// MOZ TECH
// AUTH.JS
// AUTENTICAÇÃO DA API
// UID + API KEY
// =====================================================

const { db } =
    require("./firebase-admin");


// =====================================================
// AUTENTICAR API
// =====================================================

async function autenticarAPI(req, res, next) {

    try {

        // =================================================
        // OBTER CREDENCIAIS
        // =================================================

        const uid =
            String(
                req.headers["x-uid"] ||
                req.body?.uid ||
                req.query?.uid ||
                ""
            ).trim();


        const apiKey =
            String(
                req.headers["x-api-key"] ||
                req.body?.apiKey ||
                req.query?.apiKey ||
                ""
            ).trim();


        // =================================================
        // VERIFICAR UID
        // =================================================

        if (!uid) {

            return res.status(401).json({

                success: false,

                error:
                    "UID não fornecido."

            });

        }


        // =================================================
        // VERIFICAR API KEY
        // =================================================

        if (!apiKey) {

            return res.status(401).json({

                success: false,

                error:
                    "API Key não fornecida."

            });

        }


        // =================================================
        // BUSCAR USUÁRIO
        // =================================================

        const snapshot =
            await db
                .ref("usuarios/" + uid)
                .once("value");


        if (!snapshot.exists()) {

            return res.status(401).json({

                success: false,

                error:
                    "Usuário não encontrado."

            });

        }


        const usuario =
            snapshot.val() || {};


        // =================================================
        // API KEY DO USUÁRIO
        // =================================================

        const apiKeyUsuario =
            String(
                usuario.apiKey || ""
            ).trim();


        // =================================================
        // VALIDAR API KEY
        // =================================================

        if (
            !apiKeyUsuario ||
            apiKeyUsuario !== apiKey
        ) {

            return res.status(401).json({

                success: false,

                error:
                    "UID ou API Key inválidos."

            });

        }


        // =================================================
        // USUÁRIO AUTENTICADO
        // =================================================

        req.usuario = {

            ...usuario,

            uid:
                uid,

            apiKey:
                apiKeyUsuario

        };


        // =================================================
        // CONTINUAR
        // =================================================

        return next();

    }
    catch (erro) {

        console.error(
            "[AUTH API] Erro na autenticação:",
            erro
        );


        return res.status(500).json({

            success: false,

            error:
                "Erro interno ao autenticar API."

        });

    }

}


// =====================================================
// EXPORTAR
// =====================================================

module.exports =
    autenticarAPI;
