// =====================================================
// MACVENDAS
// API DE GRUPOS
// ARMAZENAMENTO JSON
// =====================================================

"use strict";

const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

const autenticarAPI =
    require("./auth");

// =====================================================
// ARQUIVO DE DADOS
// =====================================================

const DATA_DIR =
    path.join(
        __dirname,
        "data"
    );

const ARQUIVO =
    path.join(
        DATA_DIR,
        "grupos.json"
    );

// =====================================================
// GARANTIR DIRETÓRIO E ARQUIVO
// =====================================================

function garantirArquivo() {

    if (
        !fs.existsSync(
            DATA_DIR
        )
    ) {

        fs.mkdirSync(
            DATA_DIR,
            {
                recursive: true
            }
        );
    }

    if (
        !fs.existsSync(
            ARQUIVO
        )
    ) {

        fs.writeFileSync(
            ARQUIVO,
            "[]",
            "utf8"
        );
    }
}

// =====================================================
// LER GRUPOS
// =====================================================

function lerGrupos() {

    garantirArquivo();

    try {

        const conteudo =
            fs.readFileSync(
                ARQUIVO,
                "utf8"
            );

        if (
            !conteudo.trim()
        ) {

            return [];
        }

        const dados =
            JSON.parse(
                conteudo
            );

        if (
            Array.isArray(dados)
        ) {

            return dados;
        }

        if (
            dados &&
            typeof dados === "object"
        ) {

            return Object.values(
                dados
            );
        }

        return [];

    }
    catch (err) {

        console.error(
            "[API GRUPOS] Erro ao ler:",
            err
        );

        return [];
    }
}

// =====================================================
// SALVAR GRUPOS
// =====================================================

function salvarGrupos(
    grupos
) {

    garantirArquivo();

    fs.writeFileSync(
        ARQUIVO,
        JSON.stringify(
            grupos,
            null,
            2
        ),
        "utf8"
    );
}

// =====================================================
// OBTER UID
// =====================================================

function obterUID(req) {

    return req.usuario?.uid || null;
}

// =====================================================
// VERIFICAR AUTENTICAÇÃO
// =====================================================

function verificarUsuario(
    req,
    res
) {

    const uid =
        obterUID(req);

    if (!uid) {

        res.status(401).json({

            success: false,

            error:
                "Usuário não autenticado."

        });

        return null;
    }

    return uid;
}

// =====================================================
// LISTAR GRUPOS
// GET /api/grupos
// =====================================================

router.get(
    "/",
    autenticarAPI,
    (req, res) => {

        try {

            const uid =
                verificarUsuario(
                    req,
                    res
                );

            if (!uid) {
                return;
            }

            const grupos =
                lerGrupos();

            // =================================================
            // SOMENTE GRUPOS DO USUÁRIO
            // =================================================

            const meusGrupos =
                grupos.filter(
                    grupo =>
                        String(
                            grupo.uid
                        ) === String(uid)
                );

            return res.json({

                success: true,

                total:
                    meusGrupos.length,

                grupos:
                    meusGrupos

            });

        }
        catch (err) {

            console.error(
                "Erro ao listar grupos:",
                err
            );

            return res.status(500).json({

                success: false,

                error:
                    err.message ||
                    "Erro ao listar grupos."

            });

        }

    }
);

// =====================================================
// BUSCAR GRUPO
// GET /api/grupos/:id
// =====================================================

router.get(
    "/:id",
    autenticarAPI,
    (req, res) => {

        try {

            const uid =
                verificarUsuario(
                    req,
                    res
                );

            if (!uid) {
                return;
            }

            const grupos =
                lerGrupos();

            const id =
                String(
                    req.params.id
                );

            const grupo =
                grupos.find(
                    g =>
                        String(g.id) === id &&
                        String(g.uid) ===
                            String(uid)
                );

            if (!grupo) {

                return res.status(404).json({

                    success: false,

                    error:
                        "Grupo não encontrado."

                });

            }

            return res.json({

                success: true,

                grupo

            });

        }
        catch (err) {

            console.error(
                "Erro ao buscar grupo:",
                err
            );

            return res.status(500).json({

                success: false,

                error:
                    err.message ||
                    "Erro ao buscar grupo."

            });

        }

    }
);

// =====================================================
// NOVO GRUPO
// POST /api/grupos
// =====================================================

router.post(
    "/",
    autenticarAPI,
    (req, res) => {

        try {

            const uid =
                verificarUsuario(
                    req,
                    res
                );

            if (!uid) {
                return;
            }

            const grupos =
                lerGrupos();

            const agora =
                new Date()
                    .toISOString();

            // =================================================
            // VALORES
            // =================================================

            let venda =
                Number(
                    req.body.venda ??
                    0
                );

            let custo =
                Number(
                    req.body.custo ??
                    0
                );

            if (
                !Number.isFinite(
                    venda
                )
            ) {

                venda = 0;
            }

            if (
                !Number.isFinite(
                    custo
                )
            ) {

                custo = 0;
            }

            // =================================================
            // NOVO GRUPO
            // =================================================

            const grupo = {

                id:
                    Date.now().toString(),

                uid:
                    uid,

                nome:
                    req.body.nome ||
                    "",

                descricao:
                    req.body.descricao ||
                    "",

                venda:
                    venda,

                custo:
                    custo,

                ativo:
                    req.body.ativo !== undefined
                        ? Boolean(
                            req.body.ativo
                        )
                        : true,

                createdAt:
                    agora,

                atualizado:
                    agora

            };

            grupos.unshift(
                grupo
            );

            salvarGrupos(
                grupos
            );

            console.log(
                "[API GRUPOS] Grupo criado:",
                grupo.id,
                "UID:",
                uid
            );

            return res.status(201).json({

                success: true,

                grupo

            });

        }
        catch (err) {

            console.error(
                "Erro ao criar grupo:",
                err
            );

            return res.status(500).json({

                success: false,

                error:
                    err.message ||
                    "Erro ao criar grupo."

            });

        }

    }
);

// =====================================================
// EDITAR GRUPO
// PUT /api/grupos/:id
// =====================================================

router.put(
    "/:id",
    autenticarAPI,
    (req, res) => {

        try {

            const uid =
                verificarUsuario(
                    req,
                    res
                );

            if (!uid) {
                return;
            }

            const grupos =
                lerGrupos();

            const id =
                String(
                    req.params.id
                );

            // =================================================
            // PROCURAR SOMENTE GRUPO DO USUÁRIO
            // =================================================

            const index =
                grupos.findIndex(
                    g =>
                        String(g.id) === id &&
                        String(g.uid) ===
                            String(uid)
                );

            if (
                index === -1
            ) {

                return res.status(404).json({

                    success: false,

                    error:
                        "Grupo não encontrado."

                });

            }

            const atual =
                grupos[index];

            // =================================================
            // NÃO PERMITIR ALTERAR UID E ID
            // =================================================

            const dadosRecebidos = {
                ...req.body
            };

            delete dadosRecebidos.uid;
            delete dadosRecebidos.id;
            delete dadosRecebidos.createdAt;

            // =================================================
            // VENDA
            // =================================================

            let venda =
                atual.venda;

            if (
                req.body.venda !==
                undefined
            ) {

                venda =
                    Number(
                        req.body.venda
                    );

                if (
                    !Number.isFinite(
                        venda
                    )
                ) {

                    venda =
                        atual.venda;
                }
            }

            // =================================================
            // CUSTO
            // =================================================

            let custo =
                atual.custo;

            if (
                req.body.custo !==
                undefined
            ) {

                custo =
                    Number(
                        req.body.custo
                    );

                if (
                    !Number.isFinite(
                        custo
                    )
                ) {

                    custo =
                        atual.custo;
                }
            }

            // =================================================
            // GRUPO ATUALIZADO
            // =================================================

            const atualizado = {

                ...atual,

                ...dadosRecebidos,

                id:
                    atual.id,

                uid:
                    atual.uid,

                venda:
                    venda,

                custo:
                    custo,

                createdAt:
                    atual.createdAt ||
                    new Date()
                        .toISOString(),

                atualizado:
                    new Date()
                        .toISOString()

            };

            grupos[index] =
                atualizado;

            salvarGrupos(
                grupos
            );

            console.log(
                "[API GRUPOS] Grupo atualizado:",
                id
            );

            return res.json({

                success: true,

                grupo:
                    atualizado

            });

        }
        catch (err) {

            console.error(
                "Erro ao editar grupo:",
                err
            );

            return res.status(500).json({

                success: false,

                error:
                    err.message ||
                    "Erro ao editar grupo."

            });

        }

    }
);

// =====================================================
// REMOVER GRUPO
// DELETE /api/grupos/:id
// =====================================================

router.delete(
    "/:id",
    autenticarAPI,
    (req, res) => {

        try {

            const uid =
                verificarUsuario(
                    req,
                    res
                );

            if (!uid) {
                return;
            }

            const grupos =
                lerGrupos();

            const id =
                String(
                    req.params.id
                );

            // =================================================
            // VERIFICAR SE PERTENCE AO USUÁRIO
            // =================================================

            const existe =
                grupos.some(
                    grupo =>
                        String(grupo.id) === id &&
                        String(grupo.uid) ===
                            String(uid)
                );

            if (!existe) {

                return res.status(404).json({

                    success: false,

                    error:
                        "Grupo não encontrado."

                });

            }

            // =================================================
            // REMOVER
            // =================================================

            const novosGrupos =
                grupos.filter(
                    grupo =>
                        !(
                            String(grupo.id) === id &&
                            String(grupo.uid) ===
                                String(uid)
                        )
                );

            salvarGrupos(
                novosGrupos
            );

            console.log(
                "[API GRUPOS] Grupo removido:",
                id
            );

            return res.json({

                success: true,

                mensagem:
                    "Grupo removido.",

                id

            });

        }
        catch (err) {

            console.error(
                "Erro ao remover grupo:",
                err
            );

            return res.status(500).json({

                success: false,

                error:
                    err.message ||
                    "Erro ao remover grupo."

            });

        }

    }
);

// =====================================================
// EXPORTAR
// =====================================================

module.exports =
    router;

