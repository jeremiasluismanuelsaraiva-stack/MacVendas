
const express = require("express");
const router = express.Router();
const db = require("../database/database");

// LISTAR GRUPOS
router.get("/", (req, res) => {

    try {

        const grupos = db.ler("grupos");

        res.json({
            success: true,
            total: grupos.length,
            grupos
        });

    } catch (err) {

        res.status(500).json({
            success: false,
            error: err.message
        });

    }

});

// BUSCAR GRUPO
router.get("/:id", (req, res) => {

    try {

        const grupos = db.ler("grupos");

        const grupo = grupos.find(g => g.id == req.params.id);

        if (!grupo) {

            return res.status(404).json({
                success: false,
                error: "Grupo não encontrado."
            });

        }

        res.json({
            success: true,
            grupo
        });

    } catch (err) {

        res.status(500).json({
            success: false,
            error: err.message
        });

    }

});

// NOVO GRUPO
router.post("/", (req, res) => {

    try {

        const grupos = db.ler("grupos");

        const grupo = {

            id: Date.now().toString(),

            nome: req.body.nome || "",

            descricao: req.body.descricao || "",

            venda: Number(req.body.venda || 0),

            custo: Number(req.body.custo || 0),

            ativo: true,

            createdAt: new Date().toISOString()

        };

        grupos.unshift(grupo);

        db.salvar("grupos", grupos);

        res.json({
            success: true,
            grupo
        });

    } catch (err) {

        res.status(500).json({
            success: false,
            error: err.message
        });

    }

});

// EDITAR
router.put("/:id", (req, res) => {

    try {

        const grupos = db.ler("grupos");

        const index = grupos.findIndex(g => g.id == req.params.id);

        if (index === -1) {

            return res.status(404).json({
                success: false,
                error: "Grupo não encontrado."
            });

        }

        grupos[index] = {

            ...grupos[index],

            ...req.body,

            atualizado: new Date().toISOString()

        };

        db.salvar("grupos", grupos);

        res.json({
            success: true,
            grupo: grupos[index]
        });

    } catch (err) {

        res.status(500).json({
            success: false,
            error: err.message
        });

    }

});

// REMOVER
router.delete("/:id", (req, res) => {

    try {

        let grupos = db.ler("grupos");

        grupos = grupos.filter(g => g.id != req.params.id);

        db.salvar("grupos", grupos);

        res.json({
            success: true,
            mensagem: "Grupo removido."
        });

    } catch (err) {

        res.status(500).json({
            success: false,
            error: err.message
        });

    }

});

module.exports = router;
