
const express = require("express");
const router = express.Router();

const db = require("../database/database");

router.get("/", (req, res) => {

    const vendas = db.ler("vendas");
    const clientes = db.ler("clientes");
    const dispositivos = db.ler("dispositivos");

    let faturamento = 0;
    let gb = 0;

    vendas.forEach(v => {
        faturamento += Number(v.valor || 0);
        gb += Number(v.gb || 0);
    });

    res.json({

        vendas: vendas.length,
        clientes: clientes.length,
        dispositivos: dispositivos.length,
        faturamento,
        gb

    });

});

module.exports = router;
