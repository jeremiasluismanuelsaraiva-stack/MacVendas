const express = require("express");
const router = express.Router();
const db = require("../database/database");

router.get("/", (req, res) => {
    try {

        const vendas = db.ler("vendas");
        const clientes = db.ler("clientes");
        const pedidos = db.ler("pedidos");
        const dispositivos = db.ler("dispositivos");

        let faturamento = 0;
        let custo = 0;
        let lucro = 0;
        let totalGB = 0;

        const hoje = new Date().toISOString().slice(0, 10);

        let vendasHoje = 0;

        vendas.forEach(venda => {

            faturamento += Number(venda.valor_venda || venda.valor || 0);
            custo += Number(venda.custo || 0);
            lucro += Number(venda.lucro || 0);
            totalGB += Number(venda.gb || 0);

            if (venda.createdAt) {
                const data = venda.createdAt.slice(0, 10);

                if (data === hoje) {
                    vendasHoje++;
                }
            }

        });

        res.json({

            success: true,

            dashboard: {

                faturamento,

                custo,

                lucro,

                totalGB,

                vendas: vendas.length,

                vendasHoje,

                clientes: clientes.length,

                pedidos: pedidos.length,

                dispositivos: dispositivos.length

            }

        });

    } catch (err) {

        res.status(500).json({

            success: false,

            error: err.message

        });

    }

});

module.exports = router;
