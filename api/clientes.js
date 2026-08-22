const express = require("express");
const router = express.Router();

const db = require("../database/database");


// =====================================================
// LISTAR CLIENTES
// GET /clientes
// =====================================================

router.get("/", (req, res) => {

    try {

        const clientes =
            db.ler("clientes") || [];


        res.json({

            success: true,

            total:
                clientes.length,

            clientes

        });

    }
    catch (err) {

        console.error(
            "Erro ao listar clientes:",
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
// BUSCAR CLIENTE
// GET /clientes/:id
// =====================================================

router.get("/:id", (req, res) => {

    try {

        const clientes =
            db.ler("clientes") || [];


        const cliente =
            clientes.find(
                c =>
                    String(c.id) ===
                    String(req.params.id)
            );


        if (!cliente) {

            return res.status(404).json({

                success: false,

                error:
                    "Cliente não encontrado."

            });

        }


        res.json({

            success: true,

            cliente

        });

    }
    catch (err) {

        console.error(
            "Erro ao buscar cliente:",
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
// ADICIONAR CLIENTE
// POST /clientes
// =====================================================

router.post("/", (req, res) => {

    try {

        const clientes =
            db.ler("clientes") || [];


        const cliente = {

            id:
                Date.now().toString(),


            nome:
                req.body.nome ||
                "",


            telefone:
                req.body.telefone ||
                req.body.numero ||
                "",


            email:
                req.body.email ||
                "",


            grupo:
                req.body.grupo ||
                "GERAL",


            saldo:
                Number(
                    req.body.saldo ||
                    0
                ),


            observacao:
                req.body.observacao ||
                "",


            createdAt:
                new Date().toISOString()

        };


        clientes.unshift(
            cliente
        );


        db.salvar(
            "clientes",
            clientes
        );


        res.json({

            success: true,

            cliente

        });

    }
    catch (err) {

        console.error(
            "Erro ao adicionar cliente:",
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
// EDITAR CLIENTE
// PUT /clientes/:id
// =====================================================

router.put("/:id", (req, res) => {

    try {

        const clientes =
            db.ler("clientes") || [];


        const indice =
            clientes.findIndex(
                c =>
                    String(c.id) ===
                    String(req.params.id)
            );


        if (indice === -1) {

            return res.status(404).json({

                success: false,

                error:
                    "Cliente não encontrado."

            });

        }


        const clienteAtual =
            clientes[indice];


        const clienteAtualizado = {

            ...clienteAtual,

            ...req.body,


            // Garantir número
            saldo:
                req.body.saldo !== undefined
                    ? Number(
                        req.body.saldo
                    )
                    : clienteAtual.saldo,


            atualizado:
                new Date().toISOString()

        };


        clientes[indice] =
            clienteAtualizado;


        db.salvar(
            "clientes",
            clientes
        );


        res.json({

            success: true,

            cliente:
                clienteAtualizado

        });

    }
    catch (err) {

        console.error(
            "Erro ao editar cliente:",
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
// REMOVER CLIENTE
// DELETE /clientes/:id
// =====================================================

router.delete("/:id", (req, res) => {

    try {

        const clientes =
            db.ler("clientes") || [];


        const id =
            String(
                req.params.id
            );


        const existe =
            clientes.some(
                cliente =>
                    String(cliente.id) ===
                    id
            );


        if (!existe) {

            return res.status(404).json({

                success: false,

                error:
                    "Cliente não encontrado."

            });

        }


        const novosClientes =
            clientes.filter(
                cliente =>
                    String(cliente.id) !==
                    id
            );


        db.salvar(
            "clientes",
            novosClientes
        );


        res.json({

            success: true,

            message:
                "Cliente removido.",

            id

        });

    }
    catch (err) {

        console.error(
            "Erro ao remover cliente:",
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
