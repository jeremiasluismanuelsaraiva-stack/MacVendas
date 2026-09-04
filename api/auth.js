"use strict";

const { db } = require("./firebase-admin");

// =====================================================
// MOZ TECH
// AUTENTICAÇÃO DA API
// =====================================================
//
// Aceita:
//
// 1. Header:
//    x-uid
//    x-api-key
//
// 2. Query:
//    ?uid=XXX&apiKey=XXX
//
// 3. Body:
//    {
//      "uid": "XXX",
//      "apiKey": "XXX"
//    }
//
// =====================================================


async function autenticarAPI(req, res, next) {

    try {

        console.log("");
        console.log("========================================");
        console.log("[API AUTH] INICIANDO AUTENTICAÇÃO");
        console.log("========================================");


        // =================================================
        // OBTER UID
        // =================================================

        const uid =
            req.headers["x-uid"] ||
            req.headers["X-UID"] ||
            req.body?.uid ||
            req.query?.uid ||
            "";


        // =================================================
        // OBTER API KEY
        // =================================================

        const apiKey =
            req.headers["x-api-key"] ||
            req.headers["X-API-KEY"] ||
            req.body?.apiKey ||
            req.query?.apiKey ||
            "";


        // =================================================
        // NORMALIZAR
        // =================================================

        const uidFinal =
            String(uid).trim();

        const apiKeyFinal =
            String(apiKey).trim();


        console.log(
            "[API AUTH] UID:",
            uidFinal || "(não informado)"
        );

        console.log(
            "[API AUTH] API KEY:",
            apiKeyFinal
                ? "informada"
                : "(não informada)"
        );


        // =================================================
        // VERIFICAR CREDENCIAIS
        // =================================================

        if (
            !uidFinal ||
            !apiKeyFinal
        ) {

            console.warn(
                "[API AUTH] UID ou API KEY ausente."
            );


            return res.status(401).json({

                success: false,

                error:
                    "UID e API Key são obrigatórios."

            });

        }


        // =================================================
        // VALIDAR UID
        // =================================================

        // Evita caminhos inesperados no Firebase
        if (
            uidFinal.includes("/") ||
            uidFinal.includes("\\") ||
            uidFinal === "." ||
            uidFinal === ".."
        ) {

            console.warn(
                "[API AUTH] UID inválido:",
                uidFinal
            );


            return res.status(401).json({

                success: false,

                error:
                    "UID inválido."

            });

        }


        // =================================================
        // BUSCAR USUÁRIO
        // =================================================

        const userRef =
            db.ref(
                "users/" +
                uidFinal
            );


        const snapshot =
            await userRef.once("value");


        // =================================================
        // USUÁRIO NÃO EXISTE
        // =================================================

        if (
            !snapshot.exists()
        ) {

            console.warn(
                "[API AUTH] Usuário não encontrado:",
                uidFinal
            );


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
        // VERIFICAR API KEY CADASTRADA
        // =================================================

        if (
            !usuario.apiKey
        ) {

            console.warn(
                "[API AUTH] Usuário não possui API Key:",
                uidFinal
            );


            return res.status(401).json({

                success: false,

                error:
                    "API Key não configurada para este usuário."

            });

        }


        // =================================================
        // COMPARAR API KEY
        // =================================================

        const chaveBanco =
            String(
                usuario.apiKey
            ).trim();


        if (
            chaveBanco !== apiKeyFinal
        ) {

            console.warn(
                "[API AUTH] API Key inválida para:",
                uidFinal
            );


            return res.status(401).json({

                success: false,

                error:
                    "API Key inválida."

            });

        }


        // =================================================
        // AUTENTICAÇÃO APROVADA
        // =================================================

        req.usuario = {

            uid:
                uidFinal,

            ...usuario

        };


        // =================================================
        // GUARDAR CREDENCIAIS NORMALIZADAS
        // =================================================

        req.apiAuth = {

            uid:
                uidFinal,

            apiKey:
                apiKeyFinal

        };


        console.log(
            "[API AUTH] Autenticação aprovada:",
            uidFinal
        );


        console.log(
            "========================================"
        );


        // =================================================
        // CONTINUAR
        // =================================================

        return next();

    }
    catch (erro) {

        console.error("");
        console.error(
            "========================================"
        );
        console.error(
            "[API AUTH] ERRO"
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
                "Erro ao autenticar API.",

            detalhe:
                process.env.NODE_ENV === "production"
                    ? undefined
                    : erro.message

        });

    }

}


// =====================================================
// EXPORTAR
// =====================================================

module.exports =
    autenticarAPI;
