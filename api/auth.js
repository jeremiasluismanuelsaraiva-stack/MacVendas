"use strict";

const { db } = require("./firebase-admin");


// =====================================================
// AUTENTICAR API
// =====================================================

async function autenticarAPI(req, res, next) {

    try {

        const uid =
            req.body?.uid ||
            req.query?.uid ||
            req.headers["x-uid"];


        const apiKey =
            req.body?.apiKey ||
            req.query?.apiKey ||
            req.headers["x-api-key"];


        // =================================================
        // VERIFICAR SE RECEBEU
        // =================================================

        if (!uid || !apiKey) {

            return res.status(401).json({

                success: false,

                error:
                    "UID e API Key são obrigatórios."

            });

        }


        // =================================================
        // BUSCAR USUÁRIO
        // =================================================

        const snapshot =
            await db
                .ref(
                    "users/" + uid
                )
                .once("value");


        if (!snapshot.exists()) {

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
        // VALIDAR API KEY
        // =================================================

        if (
            usuario.apiKey !== apiKey
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
                uid,

            ...usuario

        };


        // =================================================
        // CONTINUAR
        // =================================================

        next();

    }
    catch (erro) {

        console.error(
            "[API AUTH]",
            erro
        );


        return res.status(500).json({

            success: false,

            error:
                "Erro ao autenticar API."

        });

    }

}


module.exports =
    autenticarAPI;
