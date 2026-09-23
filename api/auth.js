"use strict";

const fs = require("fs");
const path = require("path");

// =====================================================
// ARQUIVO DE USUÁRIOS
// =====================================================

const usuariosFile =
    path.join(
        __dirname,
        "..",
        "data",
        "usuarios.json"
    );


// =====================================================
// LER USUÁRIOS
// =====================================================

function lerUsuarios() {

    try {

        if (
            !fs.existsSync(
                usuariosFile
            )
        ) {

            return [];

        }

        const conteudo =
            fs.readFileSync(
                usuariosFile,
                "utf8"
            );

        if (
            !conteudo.trim()
        ) {

            return [];

        }

        return JSON.parse(
            conteudo
        );

    }
    catch (erro) {

        console.error(
            "[AUTH API] Erro ao ler usuarios.json:",
            erro
        );

        return [];

    }

}


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

                req.headers[
                    "x-uid"
                ] ||

                req.headers[
                    "uid"
                ] ||

                req.body?.uid ||

                req.query?.uid ||

                ""

            ).trim();


        // =================================================
        // API KEY
        // =================================================

        const apiKey =
            String(

                req.headers[
                    "x-api-key"
                ] ||

                req.headers[
                    "apikey"
                ] ||

                req.body?.apiKey ||

                req.query?.apiKey ||

                req.headers.authorization
                    ?.replace(
                        "Bearer ",
                        ""
                    ) ||

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
        // VERIFICAR API KEY
        // =================================================

        if (!apiKey) {

            return res
                .status(401)
                .json({

                    success:
                        false,

                    error:
                        "API Key não informada."

                });

        }


        // =================================================
        // LER USUÁRIOS
        // =================================================

        const usuarios =
            lerUsuarios();


        // =================================================
        // BUSCAR USUÁRIO
        // =================================================

        let usuario = null;


        // -------------------------------------------------
        // SE UID FOI INFORMADO
        // -------------------------------------------------

        if (uid) {

            usuario =
                usuarios.find(
                    item =>
                        String(
                            item.uid || ""
                        ).trim() ===
                        uid
                );

        }


        // -------------------------------------------------
        // SE NÃO ENCONTROU PELO UID,
        // PROCURAR PELA API KEY
        // -------------------------------------------------

        if (!usuario) {

            usuario =
                usuarios.find(
                    item =>
                        String(
                            item.apiKey || ""
                        ).trim() ===
                        apiKey
                );

        }


        // =================================================
        // USUÁRIO NÃO EXISTE
        // =================================================

        if (!usuario) {

            console.warn(
                "[AUTH API] Usuário não encontrado."
            );

            return res
                .status(401)
                .json({

                    success:
                        false,

                    error:
                        "Usuário não encontrado."

                });

        }


        // =================================================
        // VERIFICAR API KEY
        // =================================================

        const apiKeyUsuario =
            String(
                usuario.apiKey || ""
            ).trim();


        if (
            !apiKeyUsuario ||
            apiKeyUsuario !== apiKey
        ) {

            console.warn(
                "[AUTH API] API Key inválida para:",
                usuario.uid
            );

            return res
                .status(401)
                .json({

                    success:
                        false,

                    error:
                        "API Key inválida."

                });

        }


        // =================================================
        // USUÁRIO AUTENTICADO
        // =================================================

        req.usuario = {

            uid:
                usuario.uid,

            apiKey:
                usuario.apiKey,

            nome:
                usuario.nome,

            email:
                usuario.email

        };


        console.log(
            "[AUTH API] Autenticado:",
            usuario.uid
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


        return res
            .status(500)
            .json({

                success:
                    false,

                error:
                    "Erro ao autenticar a requisição."

            });

    }

}


module.exports =
    autenticarAPI;

