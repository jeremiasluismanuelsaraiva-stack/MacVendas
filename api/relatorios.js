// =====================================================
// MACVENDAS
// API DE RELATÓRIOS
// FIREBASE REALTIME DATABASE
// =====================================================

"use strict";

const express = require("express");

const router = express.Router();

const { db } =
    require("./firebase-admin");

const autenticarAPI =
    require("./auth");


// =====================================================
// FUNÇÃO NÚMERO
// =====================================================

function numero(valor) {

    const n =
        Number(valor);

    return Number.isFinite(n)
        ? n
        : 0;

}


// =====================================================
// RELATÓRIOS
// GET /api/relatorios
// =====================================================

router.get(
    "/",
    autenticarAPI,
    async (req, res) => {

        try {

            const uid =
                req.usuario.uid;


            // =================================================
            // CARREGAR DADOS DO USUÁRIO
            // =================================================

            const [

                vendasSnapshot,

                clientesSnapshot,

                pedidosSnapshot,

                dispositivosSnapshot,

                pacotesSnapshot,

                gruposSnapshot

            ] = await Promise.all([

                db
                    .ref(
                        "vendas/" + uid
                    )
                    .once("value"),

                db
                    .ref(
                        "clientes/" + uid
                    )
                    .once("value"),

                db
                    .ref(
                        "pedidos/" + uid
                    )
                    .once("value"),

                db
                    .ref(
                        "dispositivos/" + uid
                    )
                    .once("value"),

                db
                    .ref(
                        "pacotes/" + uid
                    )
                    .once("value"),

                db
                    .ref(
                        "grupos/" + uid
                    )
                    .once("value")

            ]);


            // =================================================
            // TRANSFORMAR DADOS EM ARRAYS
            // =================================================

            const vendasDados =
                vendasSnapshot.val() || {};

            const clientesDados =
                clientesSnapshot.val() || {};

            const pedidosDados =
                pedidosSnapshot.val() || {};

            const dispositivosDados =
                dispositivosSnapshot.val() || {};

            const pacotesDados =
                pacotesSnapshot.val() || {};

            const gruposDados =
                gruposSnapshot.val() || {};


            const vendas =
                Object.entries(
                    vendasDados
                )
                .map(
                    ([id, venda]) => ({

                        id,

                        ...venda

                    })
                );


            const clientes =
                Object.entries(
                    clientesDados
                );


            const pedidos =
                Object.entries(
                    pedidosDados
                );


            const dispositivos =
                Object.entries(
                    dispositivosDados
                );


            const pacotes =
                Object.entries(
                    pacotesDados
                );


            const grupos =
                Object.entries(
                    gruposDados
                );


            // =================================================
            // TOTAIS
            // =================================================

            let faturamento = 0;

            let custo = 0;

            let lucro = 0;

            let totalGB = 0;

            let totalMB = 0;


            // =================================================
            // RELATÓRIOS
            // =================================================

            const vendasPorMes = {};

            const vendasPorDia = {};

            const gruposResumo = {};


            // =================================================
            // PROCESSAR VENDAS
            // =================================================

            vendas.forEach(
                venda => {

                    if (!venda) {

                        return;

                    }


                    // =========================================
                    // VALOR DA VENDA
                    // =========================================

                    const valor =
                        numero(
                            venda.valorVenda ??
                            venda.valor_venda ??
                            venda.valorPacote ??
                            venda.valor_pacote ??
                            venda.valor
                        );


                    // =========================================
                    // CUSTO
                    // =========================================

                    const valorCusto =
                        numero(
                            venda.custo
                        );


                    // =========================================
                    // LUCRO
                    // =========================================

                    let valorLucro;


                    if (
                        venda.lucro !== undefined &&
                        venda.lucro !== null &&
                        venda.lucro !== ""
                    ) {

                        valorLucro =
                            numero(
                                venda.lucro
                            );

                    }
                    else {

                        valorLucro =
                            valor -
                            valorCusto;

                    }


                    // =========================================
                    // MB
                    // =========================================

                    const mb =
                        numero(
                            venda.mb
                        );


                    // =========================================
                    // GB
                    // =========================================

                    let gb =
                        numero(
                            venda.gb ??
                            venda.gbPacote ??
                            venda.gb_pacote
                        );


                    if (
                        gb === 0 &&
                        mb > 0
                    ) {

                        gb =
                            mb / 1024;

                    }


                    // =========================================
                    // SOMAR TOTAIS
                    // =========================================

                    faturamento +=
                        valor;

                    custo +=
                        valorCusto;

                    lucro +=
                        valorLucro;

                    totalGB +=
                        gb;

                    totalMB +=
                        mb;


                    // =========================================
                    // DATA
                    // =========================================

                    const dataVenda =
                        venda.createdAt ||
                        venda.criadoEm ||
                        venda.data ||
                        null;


                    let data;


                    if (dataVenda) {

                        data =
                            new Date(
                                dataVenda
                            );

                    }
                    else {

                        data =
                            new Date();

                    }


                    // =========================================
                    // VALIDAR DATA
                    // =========================================

                    if (
                        Number.isNaN(
                            data.getTime()
                        )
                    ) {

                        data =
                            new Date();

                    }


                    const dataISO =
                        data
                            .toISOString();


                    const dia =
                        dataISO.substring(
                            0,
                            10
                        );


                    const mes =
                        dataISO.substring(
                            0,
                            7
                        );


                    // =========================================
                    // VENDAS POR DIA
                    // =========================================

                    vendasPorDia[dia] =
                        (
                            vendasPorDia[dia] ||
                            0
                        ) + 1;


                    // =========================================
                    // VENDAS POR MÊS
                    // =========================================

                    vendasPorMes[mes] =
                        (
                            vendasPorMes[mes] ||
                            0
                        ) + 1;


                    // =========================================
                    // GRUPO
                    // =========================================

                    const grupo =
                        venda.grupo ||
                        "GERAL";


                    if (
                        !gruposResumo[grupo]
                    ) {

                        gruposResumo[grupo] = {

                            vendas: 0,

                            faturamento: 0,

                            custo: 0,

                            lucro: 0,

                            gb: 0,

                            mb: 0

                        };

                    }


                    gruposResumo[grupo].vendas++;

                    gruposResumo[grupo].faturamento +=
                        valor;

                    gruposResumo[grupo].custo +=
                        valorCusto;

                    gruposResumo[grupo].lucro +=
                        valorLucro;

                    gruposResumo[grupo].gb +=
                        gb;

                    gruposResumo[grupo].mb +=
                        mb;

                }
            );


            // =================================================
            // DATA DE HOJE
            // =================================================

            const hoje =
                new Date()
                    .toISOString()
                    .substring(
                        0,
                        10
                    );


            // =================================================
            // VENDAS DE HOJE
            // =================================================

            const vendasHoje =
                vendas.filter(
                    venda => {

                        const dataVenda =
                            venda.createdAt ||
                            venda.criadoEm ||
                            venda.data;


                        if (!dataVenda) {

                            return false;

                        }


                        return String(
                            dataVenda
                        )
                        .substring(
                            0,
                            10
                        ) === hoje;

                    }
                )
                .length;


            // =================================================
            // ARREDONDAR GRUPOS
            // =================================================

            Object.keys(
                gruposResumo
            )
            .forEach(
                grupo => {

                    gruposResumo[grupo].faturamento =
                        Number(
                            gruposResumo[grupo]
                                .faturamento
                                .toFixed(2)
                        );

                    gruposResumo[grupo].custo =
                        Number(
                            gruposResumo[grupo]
                                .custo
                                .toFixed(2)
                        );

                    gruposResumo[grupo].lucro =
                        Number(
                            gruposResumo[grupo]
                                .lucro
                                .toFixed(2)
                        );

                    gruposResumo[grupo].gb =
                        Number(
                            gruposResumo[grupo]
                                .gb
                                .toFixed(2)
                        );

                    gruposResumo[grupo].mb =
                        Number(
                            gruposResumo[grupo]
                                .mb
                                .toFixed(2)
                        );

                }
            );


            // =================================================
            // RESPOSTA
            // =================================================

            return res.json({

                success: true,

                resumo: {

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
                "[API RELATÓRIOS]",
                err
            );


            return res.status(500).json({

                success: false,

                error:
                    "Erro ao carregar relatórios."

            });

        }

    }
);


// =====================================================
// EXPORTAR
// =====================================================

module.exports = router;
