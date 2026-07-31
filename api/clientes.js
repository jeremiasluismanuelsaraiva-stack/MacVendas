
const express = require("express");
const router = express.Router();
const db = require("../database/database");

// LISTAR CLIENTES
router.get("/", (req, res) => {

    try {

        const clientes = db.ler("clientes");

        res.json({
            success: true,
            total: clientes.length,
            clientes
        });

    } catch (err) {

        res.status(500).json({
            success: false,
            error: err.message
        });

    }

});

// BUSCAR CLIENTE
router.get("/:id", (req, res) => {

    try {

        const clientes = db.ler("clientes");

        const cliente = clientes.find(c => c.id == req.params.id);

        if (!cliente) {

            return res.status(404).json({
                success: false,
                error: "Cliente não encontrado"
            });

        }

        res.json(cliente);

    } catch (err) {

        res.status(500).json({
            success: false,
            error: err.message
        });

    }

});

// ADICIONAR CLIENTE
router.post("/", (req, res) => {

    try {

        const clientes = db.ler("clientes");

        const cliente = {

            id: Date.now().toString(),

            nome: req.body.nome || "",

            telefone: req.body.telefone || "",

            grupo: req.body.grupo || "GERAL",

            saldo: Number(req.body.saldo || 0),

            observacao: req.body.observacao || "",

            createdAt: new Date().toISOString()

        };

        clientes.unshift(cliente);

        db.salvar("clientes", clientes);

        res.json({

            success: true,

            cliente

        });

    } catch (err) {

        res.status(500).json({

            success: false,

            error: err.message

        });

    }

});

// EDITAR CLIENTE
router.put("/:id", (req, res) => {

    try {

        const clientes = db.ler("clientes");

        const indice = clientes.findIndex(c => c.id == req.params.id);

        if (indice === -1) {

            return res.status(404).json({
                success: false,
                error: "Cliente não encontrado"
            });

        }

        clientes[indice] = {

            ...clientes[indice],

            ...req.body,

            atualizado: new Date().toISOString()

        };

        db.salvar("clientes", clientes);

        res.json({

            success: true,

            cliente: clientes[indice]

        });

    } catch (err) {

        res.status(500).json({

            success: false,

            error: err.message

        });

    }

});

// REMOVER CLIENTE
router.delete("/:id", (req, res) => {

    try {

        let clientes = db.ler("clientes");

        clientes = clientes.filter(c => c.id != req.params.id);

        db.salvar("clientes", clientes);

        res.json({

            success: true,

            message: "Cliente removido."

        });

    } catch (err) {

        res.status(500).json({

            success: false,

            error: err.message

        });

    }

});

module.exports = router;
