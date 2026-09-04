"use strict";

const {
    initializeApp,
    getApps
} = require("firebase-admin/app");

const {
    getDatabase
} = require("firebase-admin/database");


// =====================================================
// FIREBASE ADMIN
// =====================================================

let firebaseApp;

if (getApps().length === 0) {

    firebaseApp =
        initializeApp({

            databaseURL:
                "https://macvendas-default-rtdb.firebaseio.com"

        });

}
else {

    firebaseApp =
        getApps()[0];

}

const database =
    getDatabase(firebaseApp);


// =====================================================
// AUTENTICAÇÃO DA API
// =====================================================

async function autenticarAPI(
    req,
    res,
    next
) {

    try {

        // =================================================
        // RECEBER HEADERS
        // =================================================

        const uid =
            String(
                req.headers["x-uid"] || ""
            ).trim();

        const apiKey =
            String(
                req.headers["x-api-key"] || ""
            ).trim();


        // =================================================
        // VERIFICAR PRESENÇA
        // =================================================

        if (!uid) {

            return res.status(401).json({

                success: false,

                error:
                    "UID não informado."

            });

        }


        if (!apiKey) {

            return res.status(401).json({

                success: false,

                error:
                    "API Key não informada."

            });

        }


        // =================================================
        // BUSCAR USUÁRIO
        // users/{UID}
        // =================================================

        const snapshot =
            await database
                .ref("users/" + uid)
                .once("value");


        if (!snapshot.exists()) {

            return res.status(401).json({

                success: false,

                error:
                    "Usuário não encontrado."

            });

        }


        const dados =
            snapshot.val() || {};


        // =================================================
        // API KEY DO FIREBASE
        // =================================================

        const apiKeyFirebase =
            String(
                dados.apiKey || ""
            ).trim();


        // =================================================
        // COMPARAR
        // =================================================

        if (
            !apiKeyFirebase ||
            apiKeyFirebase !== apiKey
        ) {

            return res.status(401).json({

                success: false,

                error:
                    "API Key inválida."

            });

        }


        // =================================================
        // USUÁRIO AUTENTICADO
        // =================================================

        req.usuario = {

            uid:
                uid,

            apiKey:
                apiKey

        };


        // =================================================
        // CONTINUAR
        // =================================================

        next();

    }
    catch (erro) {

        console.error(
            "[AUTH API] Erro:",
            erro
        );

        return res.status(500).json({

            success: false,

            error:
                "Erro ao autenticar a requisição."

        });

    }

}


module.exports =
    autenticarAPI;
