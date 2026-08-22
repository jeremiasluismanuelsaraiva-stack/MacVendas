const express = require("express");
const router = express.Router();

const db = require("../database/database");


// =====================================================
// LISTAR GRUPOS
// GET /grupos
// =====================================================

router.get("/", (req, res) => {

    try {

        const grupos =
            db.ler("grupos") || [];


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
                err.message

        });

    }

});


// =====================================================
// BUSCAR GRUPO
// GET /grupos/:id
// =====================================================

router.get("/:id", (req, res) => {

    try {

        const grupos =
            db.ler("grupos") || [];


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
                err.message

        });

    }

});


// =====================================================
// NOVO GRUPO
// POST /grupos
// =====================================================

router.post("/", (req, res) => {

    try {

        const grupos =
            db.ler("grupos") || [];


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
                    req.body.venda ||
                    0
                ),


            custo:
                Number(
                    req.body.custo ||
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


        db.salvar(
            "grupos",
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
                err.message

        });

    }

});


// =====================================================
// EDITAR GRUPO
// PUT /grupos/:id
// =====================================================

router.put("/:id", (req, res) => {

    try {

        const grupos =
            db.ler("grupos") || [];


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


        db.salvar(
            "grupos",
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
                err.message

        });

    }

});


// =====================================================
// REMOVER GRUPO
// DELETE /grupos/:id
// =====================================================

router.delete("/:id", (req, res) => {

    try {

        const grupos =
            db.ler("grupos") || [];


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


        db.salvar(
            "grupos",
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
                err.message

        });

    }

});


module.exports = router;
