// =====================================================
// MACVENDAS
// API DE GRUPOS
// FIREBASE REALTIME DATABASE
// =====================================================

"use strict";

const express = require("express");

const router = express.Router();

const { db } = require("../firebase-admin");

// =====================================================
// FUNÇÃO AUXILIAR
// LER GRUPOS
// =====================================================

async function lerGrupos() {

    const snapshot =
        await db
            .ref("grupos")
            .once("value");

    const dados =
        snapshot.val();

    if (!dados) {
        return [];
    }

    // Firebase pode retornar objeto ou array
    if (Array.isArray(dados)) {
        return dados;
    }

    return Object.values(dados);

}


// =====================================================
// SALVAR GRUPOS
// =====================================================

async function salvarGrupos(grupos) {

    await db
        .ref("grupos")
        .set(grupos);

}


// =====================================================
// LISTAR GRUPOS
// GET /api/grupos
// =====================================================

router.get("/", async (req, res) => {

    try {

        const grupos =
            await lerGrupos();


        res.json({

            success: true,

            total:
                grupos.length,

            grupos

        });

    }
    catch (err) {

        console.error(
            "Erro ao listar grupos:",
            err
        );


        res.status(500).json({

            success: false,

            error:
                err.message ||
                "Erro ao listar grupos."

        });

    }

});


// =====================================================
// BUSCAR GRUPO
// GET /api/grupos/:id
// =====================================================

router.get("/:id", async (req, res) => {

    try {

        const grupos =
            await lerGrupos();


        const grupo =
            grupos.find(
                g =>
                    String(g.id) ===
                    String(req.params.id)
            );


        if (!grupo) {

            return res.status(404).json({

                success: false,

                error:
                    "Grupo não encontrado."

            });

        }


        res.json({

            success: true,

            grupo

        });

    }
    catch (err) {

        console.error(
            "Erro ao buscar grupo:",
            err
        );


        res.status(500).json({

            success: false,

            error:
                err.message ||
                "Erro ao buscar grupo."

        });

    }

});


// =====================================================
// NOVO GRUPO
// POST /api/grupos
// =====================================================

router.post("/", async (req, res) => {

    try {

        const grupos =
            await lerGrupos();


        const grupo = {

            id:
                Date.now().toString(),


            nome:
                req.body.nome ||
                "",


            descricao:
                req.body.descricao ||
                "",


            venda:
                Number(
                    req.body.venda ??
                    0
                ),


            custo:
                Number(
                    req.body.custo ??
                    0
                ),


            ativo:
                req.body.ativo !== undefined
                    ? Boolean(
                        req.body.ativo
                    )
                    : true,


            createdAt:
                new Date().toISOString()

        };


        grupos.unshift(
            grupo
        );


        await salvarGrupos(
            grupos
        );


        res.json({

            success: true,

            grupo

        });

    }
    catch (err) {

        console.error(
            "Erro ao criar grupo:",
            err
        );


        res.status(500).json({

            success: false,

            error:
                err.message ||
                "Erro ao criar grupo."

        });

    }

});


// =====================================================
// EDITAR GRUPO
// PUT /api/grupos/:id
// =====================================================

router.put("/:id", async (req, res) => {

    try {

        const grupos =
            await lerGrupos();


        const index =
            grupos.findIndex(
                g =>
                    String(g.id) ===
                    String(req.params.id)
            );


        if (index === -1) {

            return res.status(404).json({

                success: false,

                error:
                    "Grupo não encontrado."

            });

        }


        const atual =
            grupos[index];


        const atualizado = {

            ...atual,

            ...req.body,


            id:
                atual.id,


            venda:
                req.body.venda !== undefined
                    ? Number(
                        req.body.venda
                    )
                    : atual.venda,


            custo:
                req.body.custo !== undefined
                    ? Number(
                        req.body.custo
                    )
                    : atual.custo,


            atualizado:
                new Date().toISOString()

        };


        grupos[index] =
            atualizado;


        await salvarGrupos(
            grupos
        );


        res.json({

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


        res.status(500).json({

            success: false,

            error:
                err.message ||
                "Erro ao editar grupo."

        });

    }

});


// =====================================================
// REMOVER GRUPO
// DELETE /api/grupos/:id
// =====================================================

router.delete("/:id", async (req, res) => {

    try {

        const grupos =
            await lerGrupos();


        const id =
            String(
                req.params.id
            );


        const existe =
            grupos.some(
                grupo =>
                    String(grupo.id) ===
                    id
            );


        if (!existe) {

            return res.status(404).json({

                success: false,

                error:
                    "Grupo não encontrado."

            });

        }


        const novosGrupos =
            grupos.filter(
                grupo =>
                    String(grupo.id) !==
                    id
            );


        await salvarGrupos(
            novosGrupos
        );


        res.json({

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


        res.status(500).json({

            success: false,

            error:
                err.message ||
                "Erro ao remover grupo."

        });

    }

});


// =====================================================
// EXPORTAR
// =====================================================

module.exports = router;
