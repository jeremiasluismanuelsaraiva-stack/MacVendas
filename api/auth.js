"use strict";

const { db } = require("./firebase-admin");

// =====================================================
// AUTENTICAÇÃO DA API
// =====================================================

async function autenticarAPI(req, res, next) {

    try {

        // =================================================
        // UID
        // =================================================

        const uid = String(
            req.headers["x-uid"] ||
            req.headers["uid"] ||
            req.body?.uid ||
            req.query?.uid ||
            ""
        ).trim();


        // =================================================
        // API KEY
        // =================================================

        const apiKey = String(
            req.headers["x-api-key"] ||
            req.headers["apikey"] ||
            req.body?.apiKey ||
            req.query?.apiKey ||
            ""
        ).trim();


        console.log(
            "[AUTH API] Tentativa:",
            {
                uid: uid ? "OK" : "AUSENTE",
                apiKey: apiKey ? "OK" : "AUSENTE"
            }
        );


        // =================================================
        // VERIFICAR UID
        // =================================================

        if (!uid) {

            return res.status(401).json({
                success: false,
                error: "UID não informado."
            });

        }


        // =================================================
        // VERIFICAR API KEY
        // =================================================

        if (!apiKey) {

            return res.status(401).json({
                success: false,
                error: "API Key não informada."
            });

        }


        // =================================================
        // BUSCAR USUÁRIO
        // users/{uid}
        // =================================================

        const snapshot = await db
            .ref("users/" + uid)
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
                error: "Usuário não encontrado."
            });

        }


        // =================================================
        // DADOS DO USUÁRIO
        // =================================================

        const dados = snapshot.val() || {};


        // =================================================
        // API KEY DO FIREBASE
        // =================================================

        const apiKeyFirebase = String(
            dados.apiKey || ""
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
                error: "API Key inválida."
            });

        }


        // =================================================
        // USUÁRIO AUTENTICADO
        // =================================================

        req.usuario = {
            uid,
            apiKey
        };


        console.log(
            "[AUTH API] Autenticado:",
            uid
        );


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
            error: "Erro ao autenticar a requisição."
        });

    }

}


module.exports = autenticarAPI;
