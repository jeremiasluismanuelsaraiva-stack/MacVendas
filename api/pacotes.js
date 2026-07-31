
const express = require("express");
const router = express.Router();
const db = require("../database/database");

// LISTAR PACOTES
router.get("/", (req, res) => {

    try {

        const pacotes = db.ler("pacotes");

        res.json({
            success: true,
            total: pacotes.length,
            pacotes
        });

    } catch (err) {

        res.status(500).json({
            success: false,
            error: err.message
        });

    }

});

// BUSCAR PACOTE
router.get("/:id", (req, res) => {

    try {

        const pacotes = db.ler("pacotes");

        const pacote = pacotes.find(p => p.id == req.params.id);

        if (!pacote) {

            return res.status(404).json({
                success: false,
                error: "Pacote não encontrado."
            });

        }

        res.json({
            success: true,
            pacote
        });

    } catch (err) {

        res.status(500).json({
            success: false,
            error: err.message
        });

    }

});

// ADICIONAR PACOTE
router.post("/", (req, res) => {

    try {

        const pacotes = db.ler("pacotes");

        const pacote = {

            id: Date.now().toString(),

            nome: req.body.nome || "",

            tipo: req.body.tipo || "NORMAL",

            gb: Number(req.body.gb || 0),

            mb: Number(req.body.gb || 0) * 1024,

            valor: Number(req.body.valor || 0),

            vantagem: req.body.vantagem || "",

            descricao: req.body.descricao || "",

            ativo: true,

            createdAt: new Date().toISOString()

        };

        pacotes.unshift(pacote);

        db.salvar("pacotes", pacotes);

        res.json({

            success: true,

            pacote

        });

    } catch (err) {

        res.status(500).json({

            success: false,

            error: err.message

        });

    }

});

// EDITAR PACOTE
router.put("/:id", (req, res) => {

    try {

        const pacotes = db.ler("pacotes");

        const index = pacotes.findIndex(p => p.id == req.params.id);

        if (index === -1) {

            return res.status(404).json({

                success: false,

                error: "Pacote não encontrado."

            });

        }

        pacotes[index] = {

            ...pacotes[index],

            ...req.body,

            atualizado: new Date().toISOString()

        };

        db.salvar("pacotes", pacotes);

        res.json({

            success: true,

            pacote: pacotes[index]

        });

    } catch (err) {

        res.status(500).json({

            success: false,

            error: err.message

        });

    }

});

// REMOVER PACOTE
router.delete("/:id", (req, res) => {

    try {

        let pacotes = db.ler("pacotes");

        pacotes = pacotes.filter(p => p.id != req.params.id);

        db.salvar("pacotes", pacotes);

        res.json({

            success: true,

            mensagem: "Pacote removido."

        });

    } catch (err) {

        res.status(500).json({

            success: false,

            error: err.message

        });

    }

});

module.exports = router;
