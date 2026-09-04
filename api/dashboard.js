"use strict";

const express = require("express");

const router = express.Router();

const { db } =
    require("./firebase-admin");

const autenticarAPI =
    require("./auth");


// =====================================================
// MOZ TECH
// API DO DASHBOARD
// GET /api/dashboard
// =====================================================


// =====================================================
// FUNÇÃO AUXILIAR
// =====================================================

function numero(valor) {

    if (
        valor === undefined ||
        valor === null ||
        valor === ""
    ) {

        return 0;

    }

    const n =
        Number(valor);

    return Number.isFinite(n)
        ? n
        : 0;

}


// =====================================================
// TRANSFORMAR DADOS EM ARRAY
// =====================================================

function paraArray(dados) {

    if (!dados) {

        return [];

    }


    if (
        Array.isArray(dados)
    ) {

        return dados.filter(
            item => item !== null
        );

    }


    if (
        typeof dados === "object"
    ) {

        return Object.values(
            dados
        ).filter(
            item => item !== null
        );

    }


    return [];

}


// =====================================================
// OBTER DATA DA VENDA
// =====================================================

function obterData(venda) {

    return (
        venda?.createdAt ||
        venda?.criadoEm ||
        venda?.data ||
        venda?.dataVenda ||
        null
    );

}


// =====================================================
// VERIFICAR SE É HOJE
// =====================================================

function vendaEhHoje(venda) {

    const dataVenda =
        obterData(venda);


    if (!dataVenda) {

        return false;

    }


    const data =
        String(
            dataVenda
        ).slice(
            0,
            10
        );


    const hoje =
        new Date()
            .toISOString()
            .slice(
                0,
                10
            );


    return data === hoje;

}


// =====================================================
// GET /api/dashboard
// =====================================================

router.get(
    "/",
    autenticarAPI,
    async (req, res) => {

        try {

            // =================================================
            // UID
            // =================================================

            const uid =
                req.usuario?.uid;


            if (!uid) {

                return res.status(401).json({

                    success: false,

                    error:
                        "Usuário não autenticado."

                });

            }


            console.log(
                "[DASHBOARD] Carregando dados para:",
                uid
            );


            // =================================================
            // REFERÊNCIAS
            // =================================================

            const vendasRef =
                db.ref(
                    "vendas/" +
                    uid
                );


            const clientesRef =
                db.ref(
                    "clientes/" +
                    uid
                );


            const pedidosRef =
                db.ref(
                    "pedidos/" +
                    uid
                );


            const dispositivosRef =
                db.ref(
                    "dispositivos/" +
                    uid
                );


            // =================================================
            // BUSCAR DADOS
            // =================================================

            const resultado =
                await Promise.allSettled([

                    vendasRef
                        .once("value"),

                    clientesRef
                        .once("value"),

                    pedidosRef
                        .once("value"),

                    dispositivosRef
                        .once("value")

                ]);


            // =================================================
            // VERIFICAR VENDAS
            // =================================================

            let vendasDados = {};

            if (
                resultado[0].status ===
                "fulfilled"
            ) {

                vendasDados =
                    resultado[0]
                        .value
                        .val() || {};

            }
            else {

                console.error(
                    "[DASHBOARD] Erro vendas:",
                    resultado[0].reason
                );

            }


            // =================================================
            // CLIENTES
            // =================================================

            let clientesDados = {};

            if (
                resultado[1].status ===
                "fulfilled"
            ) {

                clientesDados =
                    resultado[1]
                        .value
                        .val() || {};

            }
            else {

                console.error(
                    "[DASHBOARD] Erro clientes:",
                    resultado[1].reason
                );

            }


            // =================================================
            // PEDIDOS
            // =================================================

            let pedidosDados = {};

            if (
                resultado[2].status ===
                "fulfilled"
            ) {

                pedidosDados =
                    resultado[2]
                        .value
                        .val() || {};

            }
            else {

                console.error(
                    "[DASHBOARD] Erro pedidos:",
                    resultado[2].reason
                );

            }


            // =================================================
            // DISPOSITIVOS
            // =================================================

            let dispositivosDados = {};

            if (
                resultado[3].status ===
                "fulfilled"
            ) {

                dispositivosDados =
                    resultado[3]
                        .value
                        .val() || {};

            }
            else {

                console.error(
                    "[DASHBOARD] Erro dispositivos:",
                    resultado[3].reason
                );

            }


            // =================================================
            // ARRAYS
            // =================================================

            const listaVendas =
                paraArray(
                    vendasDados
                );


            const listaClientes =
                paraArray(
                    clientesDados
                );


            const listaPedidos =
                paraArray(
                    pedidosDados
                );


            const listaDispositivos =
                paraArray(
                    dispositivosDados
                );


            // =================================================
            // TOTAIS
            // =================================================

            let faturamento =
                0;


            let custo =
                0;


            let lucro =
                0;


            let totalGB =
                0;


            let totalMB =
                0;


            let vendasHoje =
                0;


            // =================================================
            // PROCESSAR VENDAS
            // =================================================

            for (
                const venda
                of listaVendas
            ) {

                if (
                    !venda ||
                    typeof venda !== "object"
                ) {

                    continue;

                }


                // =============================================
                // VALOR
                // =============================================

                const valor =
                    numero(
                        venda.valor_venda ??
                        venda.valorVenda ??
                        venda.valor_pacote ??
                        venda.valorPacote ??
                        venda.valor
                    );


                // =============================================
                // CUSTO
                // =============================================

                const valorCusto =
                    numero(
                        venda.custo
                    );


                // =============================================
                // FATURAMENTO
                // =============================================

                faturamento +=
                    valor;


                // =============================================
                // CUSTO
                // =============================================

                custo +=
                    valorCusto;


                // =============================================
                // LUCRO
                // =============================================

                if (
                    venda.lucro !==
                        undefined &&
                    venda.lucro !==
                        null &&
                    venda.lucro !==
                        ""
                ) {

                    const lucroVenda =
                        numero(
                            venda.lucro
                        );


                    lucro +=
                        lucroVenda;

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
                    numero(
                        venda.mb
                    );


                totalMB +=
                    mb;


                // =============================================
                // GB
                // =============================================

                let gb =
                    numero(
                        venda.gb
                    );


                if (
                    gb <= 0
                ) {

                    gb =
                        numero(
                            venda.gbPacote ??
                            venda.gb_pacote
                        );

                }


                if (
                    gb <= 0 &&
                    mb > 0
                ) {

                    gb =
                        mb /
                        1024;

                }


                totalGB +=
                    gb;


                // =============================================
                // VENDAS DE HOJE
                // =============================================

                if (
                    vendaEhHoje(
                        venda
                    )
                ) {

                    vendasHoje++;

                }

            }


            // =================================================
            // ARREDONDAR
            // =================================================

            faturamento =
                Number(
                    faturamento.toFixed(2)
                );


            custo =
                Number(
                    custo.toFixed(2)
                );


            lucro =
                Number(
                    lucro.toFixed(2)
                );


            totalGB =
                Number(
                    totalGB.toFixed(2)
                );


            totalMB =
                Number(
                    totalMB.toFixed(2)
                );


            // =================================================
            // RESPOSTA
            // =================================================

            const resposta = {

                success: true,

                dashboard: {

                    // =========================================
                    // FINANCEIRO
                    // =========================================

                    faturamento,

                    custo,

                    lucro,


                    // =========================================
                    // INTERNET
                    // =========================================

                    totalGB,

                    totalMB,


                    // =========================================
                    // VENDAS
                    // =========================================

                    vendas:
                        listaVendas.length,

                    vendasHoje,


                    // =========================================
                    // CLIENTES
                    // =========================================

                    clientes:
                        listaClientes.length,


                    // =========================================
                    // PEDIDOS
                    // =========================================

                    pedidos:
                        listaPedidos.length,


                    // =========================================
                    // DISPOSITIVOS
                    // =========================================

                    dispositivos:
                        listaDispositivos.length

                }

            };


            console.log(
                "[DASHBOARD] Dados enviados:",
                resposta.dashboard
            );


            return res.json(
                resposta
            );

        }
        catch (err) {

            console.error(
                "========================================"
            );

            console.error(
                "[DASHBOARD] ERRO FATAL"
            );

            console.error(
                err
            );

            console.error(
                "========================================"
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

module.exports =
    router;
