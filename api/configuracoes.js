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
// REFERÊNCIA FIREBASE
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

        uid: uid,

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

        idioma:
            "pt",


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
// GET /api/configuracoes
// =====================================================

router.get(
    "/",
    autenticarAPI,
    async function (req, res) {

        try {

            const uid =
                req.usuario.uid;


            if (!uid) {

                return res.status(401).json({

                    success: false,

                    error:
                        "Usuário não autenticado."

                });

            }


            console.log(
                "[CONFIGURAÇÕES] GET para:",
                uid
            );


            const referencia =
                configuracaoRef(uid);


            const snapshot =
                await referencia.once("value");


            // =================================================
            // NÃO EXISTE
            // =================================================

            if (!snapshot.exists()) {

                const configuracao =
                    configuracaoPadrao(
                        uid,
                        req.usuario
                    );


                await referencia.set(
                    configuracao
                );


                console.log(
                    "[CONFIGURAÇÕES] Configuração padrão criada."
                );


                return res.json({

                    success: true,

                    configuracao:

                        configuracao

                });

            }


            // =================================================
            // EXISTENTE
            // =================================================

            const configuracao =
                snapshot.val() || {};


            // =================================================
            // GARANTIR UID
            // =================================================

            configuracao.uid =
                uid;


            // =================================================
            // API KEY
            // =================================================

            configuracao.apiKey =
                req.usuario.apiKey ||
                configuracao.apiKey ||
                "";


            // =================================================
            // EMPRESA
            // =================================================

            if (!configuracao.nomeEmpresa) {

                configuracao.nomeEmpresa =
                    req.usuario.fullName ||
                    "MACVENDAS";

            }


            // =================================================
            // TELEFONE
            // =================================================

            if (
                configuracao.telefone ===
                undefined
            ) {

                configuracao.telefone =
                    "";

            }


            // =================================================
            // EMAIL
            // =================================================

            if (!configuracao.email) {

                configuracao.email =
                    req.usuario.email ||
                    "";

            }


            // =================================================
            // MOEDA
            // =================================================

            if (
                configuracao.moeda ===
                undefined
            ) {

                configuracao.moeda =
                    "MT";

            }


            // =================================================
            // VENDA POR GB
            // =================================================

            if (
                configuracao.vendaGB ===
                undefined
            ) {

                configuracao.vendaGB =
                    28;

            }


            // =================================================
            // CUSTO POR GB
            // =================================================

            if (
                configuracao.custoGB ===
                undefined
            ) {

                configuracao.custoGB =
                    21;

            }


            // =================================================
            // TEMA
            // =================================================

            if (!configuracao.tema) {

                configuracao.tema =
                    "dark";

            }


            // =================================================
            // IDIOMA
            // =================================================

            if (!configuracao.idioma) {

                configuracao.idioma =
                    "pt";

            }


            // =================================================
            // DATA DE CRIAÇÃO
            // =================================================

            if (!configuracao.criadoEm) {

                configuracao.criadoEm =
                    agora();

            }


            // =================================================
            // ATUALIZAÇÃO
            // =================================================

            configuracao.atualizado =
                agora();


            // =================================================
            // REMOVER USSD ANTIGO
            // =================================================

            delete configuracao.ussd;


            // =================================================
            // ATUALIZAR FIREBASE
            // =================================================

            await referencia.update(
                configuracao
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

            const uid =
                req.usuario.uid;


            const referencia =
                configuracaoRef(uid);


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
                // VALORES
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
                // DATAS
                // =================================================

                criadoEm:
                    atual.criadoEm ||
                    agora(),

                atualizado:
                    agora()

            };


            // =================================================
            // NÃO USAR USSD ANTIGO
            // =================================================

            delete configuracao.ussd;


            // =================================================
            // SALVAR
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

router.get(
    "/:id",
    autenticarAPI,
    async function (req, res) {

        try {

            const uid =
                req.usuario.uid;


            const snapshot =
                await configuracaoRef(uid)
                    .once("value");


            if (!snapshot.exists()) {

                return res.status(404).json({

                    success: false,

                    error:
                        "Configuração não encontrada."

                });

            }


            const configuracao =
                snapshot.val() || {};


            configuracao.uid =
                uid;


            configuracao.apiKey =
                req.usuario.apiKey ||
                configuracao.apiKey ||
                "";


            delete configuracao.ussd;


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
