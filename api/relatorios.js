const express = require("express");
const router = express.Router();

const db = require("../database/database");


// =====================================================
// RELATÓRIOS
// GET /relatorios
// =====================================================

router.get("/", (req, res) => {

    try {

        // ==============================================
        // CARREGAR DADOS
        // ==============================================

        const vendas =
            db.ler("vendas") || [];

        const clientes =
            db.ler("clientes") || [];

        const pedidos =
            db.ler("pedidos") || [];

        const dispositivos =
            db.ler("dispositivos") || [];

        const pacotes =
            db.ler("pacotes") || [];

        const grupos =
            db.ler("grupos") || [];


        // ==============================================
        // TOTAIS
        // ==============================================

        let faturamento = 0;

        let custo = 0;

        let lucro = 0;

        let totalGB = 0;

        let totalMB = 0;


        // ==============================================
        // RELATÓRIOS
        // ==============================================

        const vendasPorMes = {};

        const vendasPorDia = {};

        const gruposResumo = {};


        // ==============================================
        // PROCESSAR VENDAS
        // ==============================================

        vendas.forEach(venda => {

            // ------------------------------------------
            // VALOR DA VENDA
            // ------------------------------------------

            const valor =
                Number(
                    venda.valor_venda ||
                    venda.valor ||
                    venda.valorPacote ||
                    0
                );


            // ------------------------------------------
            // CUSTO
            // ------------------------------------------

            const valorCusto =
                Number(
                    venda.custo ||
                    0
                );


            // ------------------------------------------
            // LUCRO
            // ------------------------------------------

            const valorLucro =
                venda.lucro !== undefined
                    ? Number(
                        venda.lucro
                    )
                    : valor - valorCusto;


            // ------------------------------------------
            // GB
            // ------------------------------------------

            const gb =
                Number(
                    venda.gb ||
                    venda.gbPacote ||
                    0
                );


            // ------------------------------------------
            // MB
            // ------------------------------------------

            const mb =
                Number(
                    venda.mb ||
                    0
                );


            faturamento += valor;

            custo += valorCusto;

            lucro += valorLucro;

            totalGB += gb;

            totalMB += mb;


            // ==========================================
            // DATA DA VENDA
            // ==========================================

            const data =
                new Date(
                    venda.createdAt ||
                    Date.now()
                );


            const dia =
                data
                    .toISOString()
                    .substring(
                        0,
                        10
                    );


            const mes =
                data
                    .toISOString()
                    .substring(
                        0,
                        7
                    );


            // ==========================================
            // VENDAS POR DIA
            // ==========================================

            vendasPorDia[dia] =
                (
                    vendasPorDia[dia] ||
                    0
                ) + 1;


            // ==========================================
            // VENDAS POR MÊS
            // ==========================================

            vendasPorMes[mes] =
                (
                    vendasPorMes[mes] ||
                    0
                ) + 1;


            // ==========================================
            // GRUPO
            // ==========================================

            const grupo =
                venda.grupo ||
                "GERAL";


            if (
                !gruposResumo[grupo]
            ) {

                gruposResumo[grupo] = {

                    vendas: 0,

                    faturamento: 0,

                    gb: 0,

                    mb: 0

                };

            }


            gruposResumo[grupo].vendas++;

            gruposResumo[grupo].faturamento +=
                valor;

            gruposResumo[grupo].gb +=
                gb;

            gruposResumo[grupo].mb +=
                mb;

        });


        // ==============================================
        // DATA DE HOJE
        // ==============================================

        const hoje =
            new Date()
                .toISOString()
                .substring(
                    0,
                    10
                );


        const vendasHoje =
            vendas.filter(
                venda => {

                    if (
                        !venda.createdAt
                    ) {

                        return false;

                    }


                    return String(
                        venda.createdAt
                    ).substring(
                        0,
                        10
                    ) === hoje;

                }
            ).length;


        // ==============================================
        // RESPOSTA
        // ==============================================

        res.json({

            success: true,


            resumo: {

                faturamento,

                custo,

                lucro,

                totalGB,

                totalMB,

                totalVendas:
                    vendas.length,

                vendasHoje,

                totalClientes:
                    clientes.length,

                totalPedidos:
                    pedidos.length,

                totalDispositivos:
                    dispositivos.length,

                totalPacotes:
                    pacotes.length,

                totalGrupos:
                    grupos.length

            },


            vendasPorDia,

            vendasPorMes,

            grupos:
                gruposResumo

        });

    }
    catch (err) {

        console.error(
            "Erro nos relatórios:",
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
