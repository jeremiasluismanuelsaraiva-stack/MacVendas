const express = require("express");
const router = express.Router();

const db = require("../database/database");


// =====================================================
// DASHBOARD DA API
// GET /dashboard
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


        // ==============================================
        // TOTAIS
        // ==============================================

        let faturamento = 0;

        let custo = 0;

        let lucro = 0;

        let totalGB = 0;

        let totalMB = 0;

        let vendasHoje = 0;


        // ==============================================
        // DATA DE HOJE
        // ==============================================

        const hoje =
            new Date()
                .toISOString()
                .slice(0, 10);


        // ==============================================
        // PROCESSAR VENDAS
        // ==============================================

        vendas.forEach(venda => {

            // ------------------------------------------
            // VALOR
            // ------------------------------------------

            faturamento +=
                Number(
                    venda.valor_venda ||
                    venda.valor ||
                    venda.valorPacote ||
                    0
                );


            // ------------------------------------------
            // CUSTO
            // ------------------------------------------

            custo +=
                Number(
                    venda.custo ||
                    0
                );


            // ------------------------------------------
            // LUCRO
            // ------------------------------------------

            if (
                venda.lucro !== undefined &&
                venda.lucro !== null
            ) {

                lucro +=
                    Number(
                        venda.lucro
                    );

            }
            else {

                lucro +=
                    Number(
                        venda.valor_venda ||
                        venda.valor ||
                        venda.valorPacote ||
                        0
                    ) -
                    Number(
                        venda.custo ||
                        0
                    );

            }


            // ------------------------------------------
            // GB
            // ------------------------------------------

            totalGB +=
                Number(
                    venda.gb ||
                    venda.gbPacote ||
                    0
                );


            // ------------------------------------------
            // MB
            // ------------------------------------------

            totalMB +=
                Number(
                    venda.mb ||
                    0
                );


            // ------------------------------------------
            // VENDAS DE HOJE
            // ------------------------------------------

            if (venda.createdAt) {

                const data =
                    String(
                        venda.createdAt
                    ).slice(
                        0,
                        10
                    );


                if (
                    data === hoje
                ) {

                    vendasHoje++;

                }

            }

        });


        // ==============================================
        // RESPOSTA
        // ==============================================

        res.json({

            success: true,

            dashboard: {

                // --------------------------------------
                // FINANCEIRO
                // --------------------------------------

                faturamento,

                custo,

                lucro,


                // --------------------------------------
                // INTERNET
                // --------------------------------------

                totalGB,

                totalMB,


                // --------------------------------------
                // VENDAS
                // --------------------------------------

                vendas:
                    vendas.length,

                vendasHoje,


                // --------------------------------------
                // CLIENTES
                // --------------------------------------

                clientes:
                    clientes.length,


                // --------------------------------------
                // PEDIDOS
                // --------------------------------------

                pedidos:
                    pedidos.length,


                // --------------------------------------
                // DISPOSITIVOS
                // --------------------------------------

                dispositivos:
                    dispositivos.length

            }

        });

    }
    catch (err) {

        console.error(
            "Erro no dashboard da API:",
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
