
const express = require("express");
const router = express.Router();
const db = require("../database/database");

// LISTAR VENDAS
router.get("/", (req, res) => {
    try {
        const vendas = db.ler("vendas");
        res.json(vendas);
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

// ADICIONAR VENDA
router.post("/", (req, res) => {
    try {

        const {
            numero,
            mb,
            grupo,
            tipo,
            valorPacote,
            gbPacote,
            vantagem
        } = req.body;

        const vendas = db.ler("vendas");

        const venda = {
            id: Date.now().toString(),
            numero: numero || "",
            mb: Number(mb || 0),
            gb: Number(gbPacote || mb / 1024 || 0),
            grupo: grupo || "GRUPO_PADRAO",
            tipo: tipo || "normal",
            valor_venda: Number(valorPacote || 0),
            valor_pacote: Number(valorPacote || 0),
            gb_pacote: Number(gbPacote || 0),
            vantagem: vantagem || "",
            createdAt: new Date().toISOString()
        };

        vendas.unshift(venda);

        db.salvar("vendas", vendas);

        res.json({
            success: true,
            venda
        });

    } catch (err) {

        res.status(500).json({
            success: false,
            error: err.message
        });

    }
});

// APAGAR VENDA
router.delete("/:id", (req, res) => {

    try {

        let vendas = db.ler("vendas");

        vendas = vendas.filter(v => v.id !== req.params.id);

        db.salvar("vendas", vendas);

        res.json({
            success: true
        });

    } catch (err) {

        res.status(500).json({
            success: false,
            error: err.message
        });

    }

});

module.exports = router;
