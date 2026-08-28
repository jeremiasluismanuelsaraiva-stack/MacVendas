const express = require("express");
const router = express.Router();

const db = require("../database/database");


// =====================================================
// DASHBOARD
// GET /dashboard
// =====================================================

router.get("/", (req, res) => {

    try {

        // =================================================
        // CARREGAR DADOS
        // =================================================

        const vendas =
            db.ler("vendas") || [];

        const clientes =
            db.ler("clientes") || [];

        const pedidos =
            db.ler("pedidos") || [];

        const dispositivos =
            db.ler("dispositivos") || [];


        // =================================================
        // VARIÁVEIS
        // =================================================

        let faturamento = 0;

        let custo = 0;

        let lucro = 0;

        let totalGB = 0;

        let totalMB = 0;

        let vendasHoje = 0;


        // =================================================
        // DATA DE HOJE
        // =================================================

        const hoje =
            new Date()
                .toISOString()
                .slice(0, 10);


        // =================================================
        // PROCESSAR VENDAS
        // =================================================

        vendas.forEach(venda => {

            // =============================================
            // VALOR DA VENDA
            // =============================================

            const valorVenda =
                Number(
                    venda.valor_venda ??
                    venda.valor_pacote ??
                    venda.valorPacote ??
                    venda.valor ??
                    0
                );


            faturamento += valorVenda;


            // =============================================
            // CUSTO
            // =============================================

            const valorCusto =
                Number(
                    venda.custo ??
                    0
                );


            custo += valorCusto;


            // =============================================
            // LUCRO
            // =============================================

            if (
                venda.lucro !== undefined &&
                venda.lucro !== null &&
                venda.lucro !== ""
            ) {

                lucro +=
                    Number(venda.lucro);

            }
            else {

                lucro +=
                    valorVenda -
                    valorCusto;

            }


            // =============================================
            // GB
            // =============================================

            if (
                venda.gb !== undefined &&
                venda.gb !== null &&
                venda.gb !== ""
            ) {

                totalGB +=
                    Number(venda.gb);

            }
            else if (
                venda.gb_pacote !== undefined &&
                venda.gb_pacote !== null
            ) {

                totalGB +=
                    Number(venda.gb_pacote);

            }


            // =============================================
            // MB
            // =============================================

            if (
                venda.mb !== undefined &&
                venda.mb !== null &&
                venda.mb !== ""
            ) {

                totalMB +=
                    Number(venda.mb);

            }


            // =============================================
            // VENDAS DE HOJE
            // =============================================

            if (venda.createdAt) {

                const dataVenda =
                    String(
                        venda.createdAt
                    ).slice(0, 10);


                if (
                    dataVenda === hoje
                ) {

                    vendasHoje++;

                }

            }

        });


        // =================================================
        // RESPOSTA
        // =================================================

        res.json({

            success: true,

            dashboard: {

                // =========================================
                // FINANCEIRO
                // =========================================

                faturamento:
                    faturamento,

                custo:
                    custo,

                lucro:
                    lucro,


                // =========================================
                // INTERNET
                // =========================================

                totalGB:
                    totalGB,

                totalMB:
                    totalMB,


                // =========================================
                // VENDAS
                // =========================================

                vendas:
                    vendas.length,

                vendasHoje:
                    vendasHoje,


                // =========================================
                // CLIENTES
                // =========================================

                clientes:
                    clientes.length,


                // =========================================
                // PEDIDOS
                // =========================================

                pedidos:
                    pedidos.length,


                // =========================================
                // DISPOSITIVOS
                // =========================================

                dispositivos:
                    dispositivos.length

            }

        });

    }
    catch (erro) {

        console.error(
            "Erro ao carregar dashboard:",
            erro
        );


        res.status(500).json({

            success: false,

            error:
                erro.message ||
                "Erro interno ao carregar dashboard."

        });

    }

});


// =====================================================
// EXPORTAR
// =====================================================

module.exports = router;
