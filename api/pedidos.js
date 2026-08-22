const express = require("express");
const router = express.Router();

const db = require("../database/database");


// =====================================================
// LISTAR PEDIDOS
// GET /pedidos
// =====================================================

router.get("/", (req, res) => {

    try {

        const pedidos =
            db.ler("pedidos") || [];


        res.json({

            success: true,

            total:
                pedidos.length,

            pedidos

        });

    }
    catch (err) {

        console.error(
            "Erro ao listar pedidos:",
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
// BUSCAR PEDIDO
// GET /pedidos/:id
// =====================================================

router.get("/:id", (req, res) => {

    try {

        const pedidos =
            db.ler("pedidos") || [];


        const pedido =
            pedidos.find(
                p =>
                    String(p.id) ===
                    String(req.params.id)
            );


        if (!pedido) {

            return res.status(404).json({

                success: false,

                error:
                    "Pedido não encontrado."

            });

        }


        res.json({

            success: true,

            pedido

        });

    }
    catch (err) {

        console.error(
            "Erro ao buscar pedido:",
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
// NOVO PEDIDO
// POST /pedidos
// =====================================================

router.post("/", (req, res) => {

    try {

        const pedidos =
            db.ler("pedidos") || [];


        const pedido = {

            id:
                Date.now().toString(),


            cliente:
                req.body.cliente ||
                "",


            numero:
                req.body.numero ||
                "",


            pacote:
                req.body.pacote ||
                "",


            mb:
                Number(
                    req.body.mb ||
                    0
                ),


            gb:
                Number(
                    req.body.gb ||
                    0
                ),


            valor:
                Number(
                    req.body.valor ||
                    0
                ),


            grupo:
                req.body.grupo ||
                "GERAL",


            status:
                req.body.status ||
                req.body.estado ||
                "PENDENTE",


            dispositivo:
                req.body.dispositivo ||
                "",


            observacao:
                req.body.observacao ||
                "",


            createdAt:
                new Date().toISOString()

        };


        pedidos.unshift(
            pedido
        );


        db.salvar(
            "pedidos",
            pedidos
        );


        res.json({

            success: true,

            pedido

        });

    }
    catch (err) {

        console.error(
            "Erro ao criar pedido:",
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
// ALTERAR PEDIDO
// PUT /pedidos/:id
// =====================================================

router.put("/:id", (req, res) => {

    try {

        const pedidos =
            db.ler("pedidos") || [];


        const indice =
            pedidos.findIndex(
                p =>
                    String(p.id) ===
                    String(req.params.id)
            );


        if (indice === -1) {

            return res.status(404).json({

                success: false,

                error:
                    "Pedido não encontrado."

            });

        }


        const atual =
            pedidos[indice];


        const atualizado = {

            ...atual,

            ...req.body

        };


        // ==========================================
        // GARANTIR MB NUMÉRICO
        // ==========================================

        if (
            req.body.mb !== undefined
        ) {

            atualizado.mb =
                Number(
                    req.body.mb
                );

        }


        // ==========================================
        // GARANTIR GB NUMÉRICO
        // ==========================================

        if (
            req.body.gb !== undefined
        ) {

            atualizado.gb =
                Number(
                    req.body.gb
                );

        }


        // ==========================================
        // GARANTIR VALOR NUMÉRICO
        // ==========================================

        if (
            req.body.valor !== undefined
        ) {

            atualizado.valor =
                Number(
                    req.body.valor
                );

        }


        // ==========================================
        // ESTADO / STATUS
        // ==========================================

        if (
            req.body.estado !== undefined &&
            req.body.status === undefined
        ) {

            atualizado.status =
                req.body.estado;

        }


        atualizado.atualizado =
            new Date().toISOString();


        pedidos[indice] =
            atualizado;


        db.salvar(
            "pedidos",
            pedidos
        );


        res.json({

            success: true,

            pedido:
                atualizado

        });

    }
    catch (err) {

        console.error(
            "Erro ao atualizar pedido:",
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
// REMOVER PEDIDO
// DELETE /pedidos/:id
// =====================================================

router.delete("/:id", (req, res) => {

    try {

        const pedidos =
            db.ler("pedidos") || [];


        const id =
            String(
                req.params.id
            );


        const existe =
            pedidos.some(
                pedido =>
                    String(pedido.id) ===
                    id
            );


        if (!existe) {

            return res.status(404).json({

                success: false,

                error:
                    "Pedido não encontrado."

            });

        }


        const novosPedidos =
            pedidos.filter(
                pedido =>
                    String(pedido.id) !==
                    id
            );


        db.salvar(
            "pedidos",
            novosPedidos
        );


        res.json({

            success: true,

            message:
                "Pedido removido.",

            id

        });

    }
    catch (err) {

        console.error(
            "Erro ao remover pedido:",
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
