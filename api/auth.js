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

try {

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

}
catch (erro) {

    console.error(
        "[FIREBASE] Erro ao inicializar Firebase Admin:",
        erro
    );

    throw erro;

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
        // UID
        // =================================================

        const uid =
            String(
                req.headers["x-uid"] ||
                req.headers["uid"] ||
                ""
            ).trim();


        // =================================================
        // API KEY
        // =================================================

        const apiKey =
            String(
                req.headers["x-api-key"] ||
                req.headers["apikey"] ||
                ""
            ).trim();


        console.log(
            "[AUTH API] Tentativa:",
            {
                uid:
                    uid
                        ? "OK"
                        : "AUSENTE",

                apiKey:
                    apiKey
                        ? "OK"
                        : "AUSENTE"
            }
        );


        // =================================================
        // VERIFICAR UID
        // =================================================

        if (!uid) {

            return res.status(401).json({

                success: false,

                error:
                    "UID não informado."

            });

        }


        // =================================================
        // VERIFICAR API KEY
        // =================================================

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
                .ref(
                    "users/" +
                    uid
                )
                .once("value");


        // =================================================
        // USUÁRIO NÃO EXISTE
        // =================================================

        if (!snapshot.exists()) {

            console.warn(
                "[AUTH API] Usuário não encontrado:",
                uid
            );

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
                dados.apiKey ||
                ""
            ).trim();


        // =================================================
        // COMPARAR API KEY
        // =================================================

        if (
            !apiKeyFirebase ||
            apiKeyFirebase !== apiKey
        ) {

            console.warn(
                "[AUTH API] API Key inválida para:",
                uid
            );

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


        console.log(
            "[AUTH API] Autenticado:",
            uid
        );


        // =================================================
        // CONTINUAR
        // =================================================

        return next();

    }
    catch (erro) {

        console.error(
            "========================================"
        );

        console.error(
            "[AUTH API] ERRO"
        );

        console.error(
            erro
        );

        console.error(
            "========================================"
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
