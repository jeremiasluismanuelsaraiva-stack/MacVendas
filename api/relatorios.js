
const express = require("express");
const router = express.Router();
const db = require("../database/database");

router.get("/", (req, res) => {

    try {

        const vendas = db.ler("vendas");
        const clientes = db.ler("clientes");
        const pedidos = db.ler("pedidos");
        const dispositivos = db.ler("dispositivos");
        const pacotes = db.ler("pacotes");
        const grupos = db.ler("grupos");

        let faturamento = 0;
        let custo = 0;
        let lucro = 0;
        let totalGB = 0;

        const vendasPorMes = {};
        const vendasPorDia = {};
        const gruposResumo = {};

        vendas.forEach(venda => {

            faturamento += Number(venda.valor_venda || venda.valor || 0);
            custo += Number(venda.custo || 0);
            lucro += Number(venda.lucro || 0);
            totalGB += Number(venda.gb || 0);

            const data = new Date(venda.createdAt || Date.now());

            const dia = data.toISOString().substring(0, 10);
            const mes = data.toISOString().substring(0, 7);

            vendasPorDia[dia] = (vendasPorDia[dia] || 0) + 1;
            vendasPorMes[mes] = (vendasPorMes[mes] || 0) + 1;

            const grupo = venda.grupo || "GERAL";

            if (!gruposResumo[grupo]) {

                gruposResumo[grupo] = {

                    vendas: 0,

                    faturamento: 0,

                    gb: 0

                };

            }

            gruposResumo[grupo].vendas++;

            gruposResumo[grupo].faturamento += Number(venda.valor_venda || venda.valor || 0);

            gruposResumo[grupo].gb += Number(venda.gb || 0);

        });

        res.json({

            success: true,

            resumo: {

                faturamento,

                custo,

                lucro,

                totalGB,

                totalVendas: vendas.length,

                totalClientes: clientes.length,

                totalPedidos: pedidos.length,

                totalDispositivos: dispositivos.length,

                totalPacotes: pacotes.length,

                totalGrupos: grupos.length

            },

            vendasPorDia,

            vendasPorMes,

            grupos: gruposResumo

        });

    } catch (err) {

        res.status(500).json({

            success: false,

            error: err.message

        });

    }

});

module.exports = router;
