
const express = require("express");
const router = express.Router();
const db = require("../database/database");

// LISTAR CONFIGURAÇÕES
router.get("/", (req, res) => {

    try {

        const configuracoes = db.ler("configuracoes");

        res.json({
            success: true,
            configuracoes
        });

    } catch (err) {

        res.status(500).json({
            success: false,
            error: err.message
        });

    }

});

// BUSCAR CONFIGURAÇÃO
router.get("/:id", (req, res) => {

    try {

        const configuracoes = db.ler("configuracoes");

        const configuracao = configuracoes.find(c => c.id == req.params.id);

        if (!configuracao) {

            return res.status(404).json({
                success: false,
                error: "Configuração não encontrada."
            });

        }

        res.json({
            success: true,
            configuracao
        });

    } catch (err) {

        res.status(500).json({
            success: false,
            error: err.message
        });

    }

});

// SALVAR CONFIGURAÇÃO
router.post("/", (req, res) => {

    try {

        const configuracoes = db.ler("configuracoes");

        const configuracao = {

            id: Date.now().toString(),

            nomeEmpresa: req.body.nomeEmpresa || "Sistema SSD",

            telefone: req.body.telefone || "",

            email: req.body.email || "",

            moeda: req.body.moeda || "MT",

            vendaGB: Number(req.body.vendaGB || 28),

            custoGB: Number(req.body.custoGB || 21),

            tema: req.body.tema || "dark",

            idioma: req.body.idioma || "pt",

            ussd: req.body.ussd || "*162#",

            atualizado: new Date().toISOString()

        };

        configuracoes.length = 0;
        configuracoes.push(configuracao);

        db.salvar("configuracoes", configuracoes);

        res.json({

            success: true,

            configuracao

        });

    } catch (err) {

        res.status(500).json({

            success: false,

            error: err.message

        });

    }

});

// ATUALIZAR CONFIGURAÇÃO
router.put("/:id", (req, res) => {

    try {

        const configuracoes = db.ler("configuracoes");

        const index = configuracoes.findIndex(c => c.id == req.params.id);

        if (index === -1) {

            return res.status(404).json({
                success: false,
                error: "Configuração não encontrada."
            });

        }

        configuracoes[index] = {

            ...configuracoes[index],

            ...req.body,

            atualizado: new Date().toISOString()

        };

        db.salvar("configuracoes", configuracoes);

        res.json({
            success: true,
            configuracao: configuracoes[index]
        });

    } catch (err) {

        res.status(500).json({
            success: false,
            error: err.message
        });

    }

});

module.exports = router;
