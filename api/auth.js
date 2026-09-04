"use strict";

const { db } = require("./firebase-admin");


// =====================================================
// MOZ TECH
// AUTENTICAÇÃO DA API
// =====================================================
//
// Existem 2 formas de autenticação:
//
// 1. API externa:
//    uid + apiKey
//
// 2. Painel:
//    uid + apiKey enviados pelo frontend
//
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
        // BUSCAR USUÁRIO
        // =================================================

        const snapshot =
            await db
                .ref("users/" + uid)
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
            !usuario.apiKey ||
            usuario.apiKey !== apiKey
        ) {

            return res.status(401).json({

                success: false,

                error:
                    "API Key inválida."

            });

        }


        // =================================================
        // GUARDAR USUÁRIO
        // =================================================

        req.usuario = {

            uid:
                uid,

            ...usuario

        };


        // =================================================
        // CONTINUAR
        // =================================================

        return next();

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


// =====================================================
// EXPORTAR
// =====================================================

module.exports =
    autenticarAPI;
