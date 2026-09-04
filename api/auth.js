"use strict";

const { db } = require("./firebase-admin");


// =====================================================
// AUTENTICAR API
// =====================================================

async function autenticarAPI(req, res, next) {

    try {

        // =================================================
        // OBTER UID
        // =================================================

        const uid =
            req.body?.uid ||
            req.query?.uid ||
            req.headers["x-uid"];


        // =================================================
        // OBTER API KEY
        // =================================================

        const apiKey =
            req.body?.apiKey ||
            req.query?.apiKey ||
            req.headers["x-api-key"];


        // =================================================
        // VERIFICAR CREDENCIAIS
        // =================================================

        if (!uid || !apiKey) {

            return res.status(401).json({

                success: false,

                error:
                    "UID e API Key são obrigatórios."

            });

        }


        // =================================================
        // LIMPAR VALORES
        // =================================================

        const uidLimpo =
            String(uid).trim();

        const apiKeyLimpa =
            String(apiKey).trim();


        if (
            !uidLimpo ||
            !apiKeyLimpa
        ) {

            return res.status(401).json({

                success: false,

                error:
                    "UID e API Key são obrigatórios."

            });

        }


        // =================================================
        // BUSCAR USUÁRIO NO FIREBASE
        // =================================================

        const snapshot =
            await db
                .ref(
                    "users/" +
                    uidLimpo
                )
                .once("value");


        // =================================================
        // USUÁRIO NÃO EXISTE
        // =================================================

        if (
            !snapshot.exists()
        ) {

            return res.status(401).json({

                success: false,

                error:
                    "Usuário não encontrado."

            });

        }


        // =================================================
        // DADOS DO USUÁRIO
        // =================================================

        const usuario =
            snapshot.val() || {};


        // =================================================
        // API KEY DO FIREBASE
        // =================================================

        const apiKeyFirebase =
            String(
                usuario.apiKey ||
                ""
            ).trim();


        // =================================================
        // VERIFICAR API KEY
        // =================================================

        if (
            !apiKeyFirebase
        ) {

            return res.status(401).json({

                success: false,

                error:
                    "Este usuário não possui uma API Key configurada."

            });

        }


        if (
            apiKeyFirebase !==
            apiKeyLimpa
        ) {

            return res.status(401).json({

                success: false,

                error:
                    "API Key inválida."

            });

        }


        // =================================================
        // GUARDAR USUÁRIO NA REQUEST
        // =================================================

        req.usuario = {

            uid:
                uidLimpo,

            ...usuario

        };


        // =================================================
        // CONTINUAR
        // =================================================

        return next();

    }
    catch (erro) {

        console.error(
            "[API AUTH] Erro:",
            erro
        );


        return res.status(500).json({

            success: false,

            error:
                "Erro ao autenticar API."

        });

    }

}


// =====================================================
// EXPORTAR
// =====================================================

module.exports =
    autenticarAPI;
