"use strict";

const express = require("express");
const router = express.Router();

const { db } = require("./firebase-admin");
const autenticarAPI = require("./auth");


// =====================================================
// VALOR NUMÉRICO
// =====================================================

function numero(valor) {

    const n = Number(valor);

    return Number.isFinite(n)
        ? n
        : 0;

}


// =====================================================
// DATA ATUAL
// =====================================================

function agora() {

    return new Date().toISOString();

}


// =====================================================
// REFERÊNCIA DA CONFIGURAÇÃO
// =====================================================
//
// Cada usuário possui apenas uma configuração:
//
// configuracoes/{uid}
//
// =====================================================

function configuracaoRef(uid) {

    return db.ref(
        "configuracoes/" + uid
    );

}


// =====================================================
// CONFIGURAÇÃO PADRÃO
// =====================================================

function configuracaoPadrao(uid, usuario) {

    return {

        // =================================================
        // IDENTIFICAÇÃO
        // =================================================

        uid:
            uid,

        apiKey:
            usuario.apiKey || "",


        // =================================================
        // EMPRESA
        // =================================================

        nomeEmpresa:
            usuario.fullName ||
            "MACVENDAS",

        telefone:
            "",

        email:
            usuario.email ||
            "",


        // =================================================
        // MOEDA
        // =================================================

        moeda:
            "MT",


        // =================================================
        // VALORES
        // =================================================

        vendaGB:
            28,

        custoGB:
            21,


        // =================================================
        // TEMA
        // =================================================

        tema:
            "dark",


        // =================================================
        // IDIOMA
        // =================================================

        idioma:
            "pt",


        // =================================================
        // TERMINAL / SERVIDOR
        // =================================================

        terminal: {

            ativo:
                false,

            api:
                "",

            endpoint:
                "",

            metodo:
                "POST",

            token:
                ""

        },


        // =================================================
        // DATAS
        // =================================================

        criadoEm:
            agora(),

        atualizado:
            agora()

    };

}


// =====================================================
// NORMALIZAR CONFIGURAÇÃO DO TERMINAL
// =====================================================

function normalizarTerminal(terminal) {

    terminal =
        terminal &&
        typeof terminal === "object"
            ? terminal
            : {};


    const metodosPermitidos = [
        "GET",
        "POST",
        "PUT",
        "PATCH",
        "DELETE"
    ];


    let metodo =
        String(
            terminal.metodo || "POST"
        )
        .trim()
        .toUpperCase();


    if (!metodosPermitidos.includes(metodo)) {

        metodo = "POST";

    }


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
            metodo,

        token:
            String(
                terminal.token || ""
            ).trim()

    };

}


// =====================================================
// NORMALIZAR CONFIGURAÇÃO COMPLETA
// =====================================================

function normalizarConfiguracao(configuracao, uid, usuario) {

    const resultado = {

        ...configuracao,

        uid:
            uid,

        apiKey:
            usuario.apiKey ||
            configuracao.apiKey ||
            "",

        nomeEmpresa:
            configuracao.nomeEmpresa !== undefined
                ? configuracao.nomeEmpresa
                : (
                    usuario.fullName ||
                    "MACVENDAS"
                ),

        telefone:
            configuracao.telefone !== undefined
                ? configuracao.telefone
                : "",

        email:
            configuracao.email !== undefined
                ? configuracao.email
                : (
                    usuario.email ||
                    ""
                ),

        moeda:
            configuracao.moeda !== undefined
                ? configuracao.moeda
                : "MT",

        vendaGB:
            configuracao.vendaGB !== undefined
                ? numero(configuracao.vendaGB)
                : 28,

        custoGB:
            configuracao.custoGB !== undefined
                ? numero(configuracao.custoGB)
                : 21,

        tema:
            configuracao.tema ||
            "dark",

        idioma:
            configuracao.idioma ||
            "pt",

        terminal:
            normalizarTerminal(
                configuracao.terminal
            ),

        criadoEm:
            configuracao.criadoEm ||
            agora(),

        atualizado:
            agora()

    };


    // =================================================
    // REMOVER CONFIGURAÇÃO USSD ANTIGA
    // =================================================

    delete resultado.ussd;


    // =================================================
    // REMOVER CAMPOS ANTIGOS DO TERMINAL
    // =================================================

    if (resultado.terminal) {

        delete resultado.terminal.host;

        delete resultado.terminal.porta;

        delete resultado.terminal.protocolo;

    }


    return resultado;

}


// =====================================================
// GET /api/configuracoes
// =====================================================

router.get(
    "/",
    autenticarAPI,
    async function (req, res) {

        try {

            // =================================================
            // UID DO USUÁRIO
            // =================================================

            const uid =
                req.usuario?.uid;


            if (!uid) {

                return res.status(401).json({

                    success: false,

                    error:
                        "Usuário não autenticado."

                });

            }


            console.log(
                "[CONFIGURAÇÕES] GET:",
                uid
            );


            // =================================================
            // REFERÊNCIA FIREBASE
            // =================================================

            const referencia =
                configuracaoRef(uid);


            // =================================================
            // BUSCAR CONFIGURAÇÃO
            // =================================================

            const snapshot =
                await referencia.once(
                    "value"
                );


            // =================================================
            // SE NÃO EXISTIR
            // =================================================

            if (!snapshot.exists()) {

                const configuracao =
                    configuracaoPadrao(
                        uid,
                        req.usuario
                    );


                // =================================================
                // CRIAR CONFIGURAÇÃO PADRÃO
                // =================================================

                await referencia.set(
                    configuracao
                );


                console.log(
                    "[CONFIGURAÇÕES] Configuração padrão criada:",
                    uid
                );


                return res.json({

                    success: true,

                    configuracao:
                        configuracao

                });

            }


            // =================================================
            // CONFIGURAÇÃO EXISTENTE
            // =================================================

            const configuracaoAtual =
                snapshot.val() || {};


            // =================================================
            // NORMALIZAR
            // =================================================

            const configuracao =
                normalizarConfiguracao(
                    configuracaoAtual,
                    uid,
                    req.usuario
                );


            // =================================================
            // SALVAR CORREÇÕES
            // =================================================

            await referencia.set(
                configuracao
            );


            console.log(
                "[CONFIGURAÇÕES] Configuração carregada:",
                uid
            );


            // =================================================
            // RESPOSTA
            // =================================================

            return res.json({

                success: true,

                configuracao:
                    configuracao

            });

        }
        catch (erro) {

            console.error(
                "[CONFIGURAÇÕES GET] Erro:",
                erro
            );


            return res.status(500).json({

                success: false,

                error:
                    "Erro ao carregar configurações."

            });

        }

    }
);


// =====================================================
// PUT /api/configuracoes
// =====================================================

router.put(
    "/",
    autenticarAPI,
    async function (req, res) {

        try {

            // =================================================
            // UID DO USUÁRIO
            // =================================================

            const uid =
                req.usuario?.uid;


            if (!uid) {

                return res.status(401).json({

                    success: false,

                    error:
                        "Usuário não autenticado."

                });

            }


            console.log(
                "[CONFIGURAÇÕES] PUT:",
                uid
            );


            // =================================================
            // REFERÊNCIA FIREBASE
            // =================================================

            const referencia =
                configuracaoRef(uid);


            // =================================================
            // BUSCAR CONFIGURAÇÃO ATUAL
            // =================================================

            const snapshot =
                await referencia.once(
                    "value"
                );


            let atual = {};


            if (snapshot.exists()) {

                atual =
                    snapshot.val() || {};

            }


            // =================================================
            // CONFIGURAÇÃO RECEBIDA
            // =================================================

            const terminalRecebido =
                req.body?.terminal || {};


            // =================================================
            // CONFIGURAÇÃO DO TERMINAL
            // =================================================

            const terminalAtual =
                normalizarTerminal(
                    atual.terminal
                );


            const terminal = {

                ativo:
                    terminalRecebido.ativo === true,

                api:
                    String(
                        terminalRecebido.api ??
                        terminalAtual.api ??
                        ""
                    ).trim(),

                endpoint:
                    String(
                        terminalRecebido.endpoint ??
                        terminalAtual.endpoint ??
                        ""
                    ).trim(),

                metodo:
                    String(
                        terminalRecebido.metodo ??
                        terminalAtual.metodo ??
                        "POST"
                    )
                    .trim()
                    .toUpperCase(),

                token:
                    String(
                        terminalRecebido.token ??
                        terminalAtual.token ??
                        ""
                    ).trim()

            };


            // =================================================
            // VALIDAR MÉTODO
            // =================================================

            const metodosPermitidos = [
                "GET",
                "POST",
                "PUT",
                "PATCH",
                "DELETE"
            ];


            if (
                !metodosPermitidos.includes(
                    terminal.metodo
                )
            ) {

                terminal.metodo =
                    "POST";

            }


            // =================================================
            // NOVA CONFIGURAÇÃO
            // =================================================

            const configuracao = {

                ...atual,


                // =================================================
                // IDENTIFICAÇÃO
                // =================================================

                uid:
                    uid,

                apiKey:
                    req.usuario.apiKey ||
                    atual.apiKey ||
                    "",


                // =================================================
                // EMPRESA
                // =================================================

                nomeEmpresa:
                    req.body.nomeEmpresa ??
                    atual.nomeEmpresa ??
                    req.usuario.fullName ??
                    "MACVENDAS",

                telefone:
                    req.body.telefone ??
                    atual.telefone ??
                    "",

                email:
                    req.body.email ??
                    atual.email ??
                    req.usuario.email ??
                    "",


                // =================================================
                // MOEDA
                // =================================================

                moeda:
                    req.body.moeda ??
                    atual.moeda ??
                    "MT",


                // =================================================
                // VENDA POR GB
                // =================================================

                vendaGB:
                    req.body.vendaGB !== undefined

                        ? numero(
                            req.body.vendaGB
                        )

                        : numero(
                            atual.vendaGB ??
                            28
                        ),


                // =================================================
                // CUSTO POR GB
                // =================================================

                custoGB:
                    req.body.custoGB !== undefined

                        ? numero(
                            req.body.custoGB
                        )

                        : numero(
                            atual.custoGB ??
                            21
                        ),


                // =================================================
                // TEMA
                // =================================================

                tema:
                    req.body.tema ??
                    atual.tema ??
                    "dark",


                // =================================================
                // IDIOMA
                // =================================================

                idioma:
                    req.body.idioma ??
                    atual.idioma ??
                    "pt",


                // =================================================
                // TERMINAL / SERVIDOR
                // =================================================

                terminal:
                    terminal,


                // =================================================
                // DATAS
                // =================================================

                criadoEm:
                    atual.criadoEm ||
                    agora(),

                atualizado:
                    agora()

            };


            // =================================================
            // REMOVER USSD ANTIGO
            // =================================================

            delete configuracao.ussd;


            // =================================================
            // REMOVER CAMPOS ANTIGOS DO TERMINAL
            // =================================================

            delete configuracao.terminal.host;

            delete configuracao.terminal.porta;

            delete configuracao.terminal.protocolo;


            // =================================================
            // SALVAR NO FIREBASE
            // =================================================

            await referencia.set(
                configuracao
            );


            console.log(
                "[CONFIGURAÇÕES] Configuração atualizada:",
                uid
            );


            // =================================================
            // RESPOSTA
            // =================================================

            return res.json({

                success: true,

                message:
                    "Configurações atualizadas com sucesso.",

                configuracao:
                    configuracao

            });

        }
        catch (erro) {

            console.error(
                "[CONFIGURAÇÕES PUT] Erro:",
                erro
            );


            return res.status(500).json({

                success: false,

                error:
                    "Erro ao atualizar configurações."

            });

        }

    }
);


// =====================================================
// GET /api/configuracoes/:id
// =====================================================
//
// Mantido para compatibilidade.
//
// O ID recebido na URL não é utilizado para acessar
// outro usuário. A configuração pertence sempre ao
// usuário autenticado.
//
// =====================================================

router.get(
    "/:id",
    autenticarAPI,
    async function (req, res) {

        try {

            // =================================================
            // UID DO USUÁRIO
            // =================================================

            const uid =
                req.usuario?.uid;


            if (!uid) {

                return res.status(401).json({

                    success: false,

                    error:
                        "Usuário não autenticado."

                });

            }


            // =================================================
            // BUSCAR CONFIGURAÇÃO
            // =================================================

            const snapshot =
                await configuracaoRef(uid)
                    .once("value");


            // =================================================
            // NÃO ENCONTRADA
            // =================================================

            if (!snapshot.exists()) {

                return res.status(404).json({

                    success: false,

                    error:
                        "Configuração não encontrada."

                });

            }


            // =================================================
            // CONFIGURAÇÃO ATUAL
            // =================================================

            const configuracaoAtual =
                snapshot.val() || {};


            // =================================================
            // NORMALIZAR
            // =================================================

            const configuracao =
                normalizarConfiguracao(
                    configuracaoAtual,
                    uid,
                    req.usuario
                );


            // =================================================
            // SALVAR CORREÇÕES
            // =================================================

            await configuracaoRef(uid)
                .set(configuracao);


            // =================================================
            // RESPOSTA
            // =================================================

            return res.json({

                success: true,

                configuracao:
                    configuracao

            });

        }
        catch (erro) {

            console.error(
                "[CONFIGURAÇÃO ID] Erro:",
                erro
            );


            return res.status(500).json({

                success: false,

                error:
                    "Erro ao buscar configuração."

            });

        }

    }
);


// =====================================================
// REGENERAR API KEY
// =====================================================

router.post(
    "/regenerar-api-key",
    autenticarAPI,
    async function (req, res) {

        return res.status(403).json({

            success: false,

            error:
                "A regeneração da API Key deve ser feita pelo sistema de autenticação do usuário."

        });

    }
);


// =====================================================
// EXPORTAR
// =====================================================

module.exports =
    router;
