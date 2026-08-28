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
        // GARANTIR ARRAYS
        // =================================================

        const listaVendas =
            Array.isArray(vendas)
                ? vendas
                : [];

        const listaClientes =
            Array.isArray(clientes)
                ? clientes
                : [];

        const listaPedidos =
            Array.isArray(pedidos)
                ? pedidos
                : [];

        const listaDispositivos =
            Array.isArray(dispositivos)
                ? dispositivos
                : [];


        // =================================================
        // TOTAIS
        // =================================================

        let faturamento = 0;

        let custo = 0;

        let lucro = 0;

        let totalGB = 0;

        let totalMB = 0;

        let vendasHoje = 0;


        // =================================================
        // DATA ATUAL
        // =================================================

        const hoje =
            new Date()
                .toISOString()
                .slice(0, 10);


        // =================================================
        // PROCESSAR VENDAS
        // =================================================

        listaVendas.forEach(venda => {

            if (!venda) {
                return;
            }


            // =============================================
            // VALOR DA VENDA
            // =============================================

            const valor =
                Number(
                    venda.valor_venda ??
                    venda.valor_pacote ??
                    venda.valor ??
                    venda.valorPacote ??
                    0
                );


            // =============================================
            // CUSTO
            // =============================================

            const valorCusto =
                Number(
                    venda.custo ??
                    0
                );


            // =============================================
            // FATURAMENTO
            // =============================================

            faturamento += valor;


            // =============================================
            // CUSTO
            // =============================================

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
                    Number(
                        venda.lucro
                    );

            }
            else {

                lucro +=
                    valor -
                    valorCusto;

            }


            // =============================================
            // MB
            // =============================================

            const mb =
                Number(
                    venda.mb ??
                    0
                );

            totalMB += mb;


            // =============================================
            // GB
            // =============================================

            let gb =
                Number(
                    venda.gb ??
                    0
                );


            // Se não tiver GB, calcula através dos MB

            if (
                gb === 0 &&
                mb > 0
            ) {

                gb =
                    mb / 1024;

            }


            totalGB += gb;


            // =============================================
            // VENDAS DE HOJE
            // =============================================

            if (venda.createdAt) {

                const dataVenda =
                    String(
                        venda.createdAt
                    ).slice(
                        0,
                        10
                    );


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

                // -----------------------------------------
                // FINANCEIRO
                // -----------------------------------------

                faturamento:
                    Number(
                        faturamento.toFixed(2)
                    ),

                custo:
                    Number(
                        custo.toFixed(2)
                    ),

                lucro:
                    Number(
                        lucro.toFixed(2)
                    ),


                // -----------------------------------------
                // INTERNET
                // -----------------------------------------

                totalGB:
                    Number(
                        totalGB.toFixed(2)
                    ),

                totalMB:
                    Number(
                        totalMB.toFixed(2)
                    ),


                // -----------------------------------------
                // VENDAS
                // -----------------------------------------

                vendas:
                    listaVendas.length,

                vendasHoje,


                // -----------------------------------------
                // CLIENTES
                // -----------------------------------------

                clientes:
                    listaClientes.length,


                // -----------------------------------------
                // PEDIDOS
                // -----------------------------------------

                pedidos:
                    listaPedidos.length,


                // -----------------------------------------
                // DISPOSITIVOS
                // -----------------------------------------

                dispositivos:
                    listaDispositivos.length

            }

        });

    }
    catch (err) {

        console.error(
            "Erro ao carregar dashboard:",
            err
        );


        res.status(500).json({

            success: false,

            error:
                err.message ||
                "Erro interno ao carregar dashboard."

        });

    }

});


// =====================================================
// EXPORTAR
// =====================================================

module.exports = router;
