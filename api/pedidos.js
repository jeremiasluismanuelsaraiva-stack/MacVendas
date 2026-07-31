
const express = require("express");
const router = express.Router();
const db = require("../database/database");

// LISTAR PEDIDOS
router.get("/", (req, res) => {

    try {

        const pedidos = db.ler("pedidos");

        res.json({
            success: true,
            total: pedidos.length,
            pedidos
        });

    } catch (err) {

        res.status(500).json({
            success: false,
            error: err.message
        });

    }

});

// BUSCAR PEDIDO
router.get("/:id", (req, res) => {

    try {

        const pedidos = db.ler("pedidos");

        const pedido = pedidos.find(p => p.id == req.params.id);

        if (!pedido) {

            return res.status(404).json({
                success: false,
                error: "Pedido não encontrado."
            });

        }

        res.json({
            success: true,
            pedido
        });

    } catch (err) {

        res.status(500).json({
            success: false,
            error: err.message
        });

    }

});

// NOVO PEDIDO
router.post("/", (req, res) => {

    try {

        const pedidos = db.ler("pedidos");

        const pedido = {

            id: Date.now().toString(),

            numero: req.body.numero || "",

            mb: Number(req.body.mb || 0),

            grupo: req.body.grupo || "GERAL",

            status: req.body.status || "PENDENTE",

            dispositivo: req.body.dispositivo || "",

            observacao: req.body.observacao || "",

            createdAt: new Date().toISOString()

        };

        pedidos.unshift(pedido);

        db.salvar("pedidos", pedidos);

        res.json({
            success: true,
            pedido
        });

    } catch (err) {

        res.status(500).json({
            success: false,
            error: err.message
        });

    }

});

// ALTERAR STATUS
router.put("/:id", (req, res) => {

    try {

        const pedidos = db.ler("pedidos");

        const indice = pedidos.findIndex(p => p.id == req.params.id);

        if (indice === -1) {

            return res.status(404).json({
                success: false,
                error: "Pedido não encontrado."
            });

        }

        pedidos[indice] = {

            ...pedidos[indice],

            ...req.body,

            atualizado: new Date().toISOString()

        };

        db.salvar("pedidos", pedidos);

        res.json({
            success: true,
            pedido: pedidos[indice]
        });

    } catch (err) {

        res.status(500).json({
            success: false,
            error: err.message
        });

    }

});

// REMOVER PEDIDO
router.delete("/:id", (req, res) => {

    try {

        let pedidos = db.ler("pedidos");

        pedidos = pedidos.filter(p => p.id != req.params.id);

        db.salvar("pedidos", pedidos);

        res.json({
            success: true,
            message: "Pedido removido."
        });

    } catch (err) {

        res.status(500).json({
            success: false,
            error: err.message
        });

    }

});

module.exports = router;
