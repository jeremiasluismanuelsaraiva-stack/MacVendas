"use strict";

const express = require("express");
const router = express.Router();

const admin = require("./firebase-admin");


// =====================================================
// FIREBASE DATABASE
// =====================================================

const db =
    admin.database();


// =====================================================
// OBTER CONFIGURAÇÃO DO TERMINAL
// =====================================================

async function obterConfiguracaoTerminal(uid) {

    if (!uid) {
        throw new Error(
            "Utilizador não autenticado."
        );
    }

    const snapshot =
        await db
            .ref(`configuracoes/${uid}/terminal`)
            .once("value");

    const terminal =
        snapshot.val() || {};

    return {

        ativo:
            terminal.ativo === true,

        api:
            String(
                terminal.api || ""
            ).trim(),

        endpoint:
            String(
                terminal.endpoint || ""
            ).trim(),

        metodo:
            String(
                terminal.metodo || "POST"
            )
                .trim()
                .toUpperCase(),

        token:
            String(
                terminal.token || ""
            ).trim()

    };
}


// =====================================================
// VALIDAR CONFIGURAÇÃO
// =====================================================

function validarURL(api) {

    if (!api) {
        throw new Error(
            "API do terminal não configurada."
        );
    }

    let url;

    try {

        url =
            new URL(api);

    } catch {

        throw new Error(
            "URL da API do terminal inválida."
        );

    }

    if (
        url.protocol !== "http:" &&
        url.protocol !== "https:"
    ) {

        throw new Error(
            "A API deve utilizar HTTP ou HTTPS."
        );

    }

    return url;
}


// =====================================================
// MONTAR URL
// =====================================================

function montarURL(api, endpoint) {

    const base =
        validarURL(api);

    const caminho =
        String(
            endpoint || ""
        ).trim();

    if (!caminho) {
        return base.toString();
    }

    /*
     * O endpoint pode ser:
     *
     * /exec
     * /api/exec
     * exec
     *
     */

    if (caminho.startsWith("http://") ||
        caminho.startsWith("https://")) {

        throw new Error(
            "O endpoint deve ser uma rota, não uma URL completa."
        );

    }

    const basePath =
        base.pathname.endsWith("/")
            ? base.pathname.slice(0, -1)
            : base.pathname;

    const endpointPath =
        caminho.startsWith("/")
            ? caminho
            : "/" + caminho;

    base.pathname =
        basePath + endpointPath;

    return base.toString();
}


// =====================================================
// HEADERS
// =====================================================

function criarHeaders(config, req) {

    const headers = {

        "Content-Type":
            "application/json",

        "Accept":
            "application/json"

    };


    // =================================================
    // TOKEN OPCIONAL
    // =================================================

    if (config.token) {

        headers.Authorization =
            `Bearer ${config.token}`;

    }


    // =================================================
    // IDENTIFICAÇÃO DO UTILIZADOR
    // =================================================

    if (req.usuario?.uid) {

        headers["x-uid"] =
            req.usuario.uid;

    }


    return headers;
}


// =====================================================
// STATUS
// =====================================================

router.get(
    "/status",
    async (req, res) => {

        try {

            const uid =
                req.usuario?.uid;

            const config =
                await obterConfiguracaoTerminal(uid);


            if (!config.ativo) {

                return res.status(400).json({

                    success: false,

                    erro:
                        "Terminal está desativado nas Configurações."

                });

            }


            const url =
                montarURL(
                    config.api,
                    config.endpoint
                );


            const headers =
                criarHeaders(
                    config,
                    req
                );


            console.log(
                "[TERMINAL] Testando:",
                url
            );


            const resposta =
                await fetch(
                    url,
                    {

                        method:
                            config.metodo || "POST",

                        headers,

                        body:
                            config.metodo === "GET" ||
                            config.metodo === "HEAD"
                                ? undefined
                                : JSON.stringify({
                                    action:
                                        "status"
                                })

                    }
                );


            const texto =
                await resposta.text();


            let resultado;

            try {

                resultado =
                    JSON.parse(texto);

            } catch {

                resultado =
                    texto;

            }


            return res.json({

                success:
                    resposta.ok,

                status:
                    resposta.status,

                resultado

            });

        } catch (erro) {

            console.error(
                "[TERMINAL STATUS] Erro:",
                erro
            );


            return res.status(500).json({

                success: false,

                erro:
                    erro.message ||
                    "Erro ao testar a API do terminal."

            });

        }

    }
);


// =====================================================
// EXECUTAR COMANDO
// =====================================================

router.post(
    "/exec",
    async (req, res) => {

        try {

            const uid =
                req.usuario?.uid;


            if (!uid) {

                return res.status(401).json({

                    success: false,

                    erro:
                        "Utilizador não autenticado."

                });

            }


            const config =
                await obterConfiguracaoTerminal(uid);


            // =========================================
            // TERMINAL ATIVO?
            // =========================================

            if (!config.ativo) {

                return res.status(403).json({

                    success: false,

                    erro:
                        "Terminal está desativado nas Configurações."

                });

            }


            // =========================================
            // API CONFIGURADA?
            // =========================================

            if (!config.api) {

                return res.status(400).json({

                    success: false,

                    erro:
                        "Configure a API do terminal antes de executar comandos."

                });

            }


            // =========================================
            // COMANDO
            // =========================================

            const command =
                String(
                    req.body?.command || ""
                ).trim();


            if (!command) {

                return res.status(400).json({

                    success: false,

                    erro:
                        "Nenhum comando foi informado."

                });

            }


            // =========================================
            // URL
            // =========================================

            const url =
                montarURL(
                    config.api,
                    config.endpoint
                );


            // =========================================
            // MÉTODO
            // =========================================

            const metodo =
                config.metodo || "POST";


            // =========================================
            // HEADERS
            // =========================================

            const headers =
                criarHeaders(
                    config,
                    req
                );


            // =========================================
            // CORPO
            // =========================================

            const body = {

                command

            };


            console.log(
                "[TERMINAL] Executando comando:",
                command
            );


            console.log(
                "[TERMINAL] URL:",
                url
            );


            // =========================================
            // REQUEST
            // =========================================

            const resposta =
                await fetch(
                    url,
                    {

                        method:
                            metodo,

                        headers,

                        body:
                            metodo === "GET" ||
                            metodo === "HEAD"
                                ? undefined
                                : JSON.stringify(body)

                    }
                );


            // =========================================
            // RESPOSTA
            // =========================================

            const texto =
                await resposta.text();


            let resultado;

            try {

                resultado =
                    JSON.parse(texto);

            } catch {

                resultado =
                    texto;

            }


            console.log(
                "[TERMINAL] HTTP:",
                resposta.status
            );


            return res.json({

                success:
                    resposta.ok,

                status:
                    resposta.status,

                resultado

            });

        } catch (erro) {

            console.error(
                "[TERMINAL EXEC] Erro:",
                erro
            );


            return res.status(500).json({

                success: false,

                erro:
                    erro.message ||
                    "Erro ao executar comando."

            });

        }

    }
);


// =====================================================
// EXPORTAR
// =====================================================

module.exports =
    router;
