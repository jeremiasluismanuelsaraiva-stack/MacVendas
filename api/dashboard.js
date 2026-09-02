"use strict";

const express = require("express");

const router = express.Router();

const { db } =
    require("./firebase-admin");

const autenticarAPI =
    require("./auth");


// =====================================================
// DASHBOARD
// GET /api/dashboard
// =====================================================

router.get(
    "/",
    autenticarAPI,
    async (req, res) => {

        try {

            // =================================================
            // UID DO USUÁRIO AUTENTICADO
            // =================================================

            const uid =
                req.usuario.uid;


            // =================================================
            // BUSCAR DADOS DO USUÁRIO
            // =================================================

            const [
                vendasSnapshot,
                clientesSnapshot,
                pedidosSnapshot,
                dispositivosSnapshot
            ] = await Promise.all([

                db
                    .ref("vendas/" + uid)
                    .once("value"),

                db
                    .ref("clientes/" + uid)
                    .once("value"),

                db
                    .ref("pedidos/" + uid)
                    .once("value"),

                db
                    .ref("dispositivos/" + uid)
                    .once("value")

            ]);


            // =================================================
            // DADOS
            // =================================================

            const vendasDados =
                vendasSnapshot.val() || {};

            const clientesDados =
                clientesSnapshot.val() || {};

            const pedidosDados =
                pedidosSnapshot.val() || {};

            const dispositivosDados =
                dispositivosSnapshot.val() || {};


            // =================================================
            // TRANSFORMAR EM ARRAYS
            // =================================================

            const listaVendas =
                Array.isArray(vendasDados)
                    ? vendasDados
                    : Object.values(vendasDados);

            const listaClientes =
                Array.isArray(clientesDados)
                    ? clientesDados
                    : Object.values(clientesDados);

            const listaPedidos =
                Array.isArray(pedidosDados)
                    ? pedidosDados
                    : Object.values(pedidosDados);

            const listaDispositivos =
                Array.isArray(dispositivosDados)
                    ? dispositivosDados
                    : Object.values(dispositivosDados);


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
            // DATA DE HOJE
            // =================================================

            const hoje =
                new Date()
                    .toISOString()
                    .slice(0, 10);


            // =================================================
            // PROCESSAR VENDAS
            // =================================================

            listaVendas.forEach(
                venda => {

                    if (!venda) {

                        return;

                    }


                    // =========================================
                    // VALOR
                    // =========================================

                    const valor =
                        Number(
                            venda.valor_venda ??
                            venda.valor_pacote ??
                            venda.valor ??
                            venda.valorPacote ??
                            venda.valorVenda ??
                            0
                        );


                    // =========================================
                    // CUSTO
                    // =========================================

                    const valorCusto =
                        Number(
                            venda.custo ??
                            0
                        );


                    // =========================================
                    // FATURAMENTO
                    // =========================================

                    if (
                        Number.isFinite(valor)
                    ) {

                        faturamento +=
                            valor;

                    }


                    // =========================================
                    // CUSTO
                    // =========================================

                    if (
                        Number.isFinite(valorCusto)
                    ) {

                        custo +=
                            valorCusto;

                    }


                    // =========================================
                    // LUCRO
                    // =========================================

                    if (
                        venda.lucro !== undefined &&
                        venda.lucro !== null &&
                        venda.lucro !== ""
                    ) {

                        const lucroVenda =
                            Number(
                                venda.lucro
                            );


                        if (
                            Number.isFinite(
                                lucroVenda
                            )
                        ) {

                            lucro +=
                                lucroVenda;

                        }

                    }
                    else {

                        lucro +=
                            valor -
                            valorCusto;

                    }


                    // =========================================
                    // MB
                    // =========================================

                    const mb =
                        Number(
                            venda.mb ??
                            0
                        );


                    if (
                        Number.isFinite(mb)
                    ) {

                        totalMB +=
                            mb;

                    }


                    // =========================================
                    // GB
                    // =========================================

                    let gb =
                        Number(
                            venda.gb ??
                            venda.gb_pacote ??
                            venda.gbPacote ??
                            0
                        );


                    if (
                        gb === 0 &&
                        mb > 0
                    ) {

                        gb =
                            mb / 1024;

                    }


                    if (
                        Number.isFinite(gb)
                    ) {

                        totalGB +=
                            gb;

                    }


                    // =========================================
                    // DATA DA VENDA
                    // =========================================

                    const dataVenda =
                        venda.createdAt ||
                        venda.criadoEm;


                    if (dataVenda) {

                        const data =
                            String(
                                dataVenda
                            )
                            .slice(
                                0,
                                10
                            );


                        if (
                            data === hoje
                        ) {

                            vendasHoje++;

                        }

                    }

                }
            );


            // =================================================
            // RESPOSTA
            // =================================================

            return res.json({

                success: true,

                dashboard: {

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

                    totalGB:
                        Number(
                            totalGB.toFixed(2)
                        ),

                    totalMB:
                        Number(
                            totalMB.toFixed(2)
                        ),

                    vendas:
                        listaVendas.length,

                    vendasHoje,

                    clientes:
                        listaClientes.length,

                    pedidos:
                        listaPedidos.length,

                    dispositivos:
                        listaDispositivos.length

                }

            });

        }
        catch (err) {

            console.error(
                "[DASHBOARD] Erro:",
                err
            );


            return res.status(500).json({

                success: false,

                error:
                    err.message ||
                    "Erro interno ao carregar dashboard."

            });

        }

    }
);


// =====================================================
// EXPORTAR
// =====================================================

module.exports = router;
