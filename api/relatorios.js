"use strict";

// =====================================================
// MACVENDAS
// API DE RELATÓRIOS
// ARMAZENAMENTO JSON
// =====================================================

const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

const autenticarAPI = require("./auth");

// =====================================================
// DIRETÓRIO DE DADOS
// =====================================================

const DATA_DIR = path.join(
    __dirname,
    "data"
);

// =====================================================
// FUNÇÃO PARA LER JSON
// =====================================================

function lerJSON(nome) {

    const arquivo =
        path.join(
            DATA_DIR,
            `${nome}.json`
        );

    try {

        if (!fs.existsSync(arquivo)) {
            return [];
        }

        const conteudo =
            fs.readFileSync(
                arquivo,
                "utf8"
            ).trim();

        if (!conteudo) {
            return [];
        }

        const dados =
            JSON.parse(conteudo);

        return dados;

    } catch (err) {

        console.error(
            `[API RELATÓRIOS] Erro ao ler ${nome}.json:`,
            err
        );

        return [];
    }
}

// =====================================================
// TRANSFORMAR QUALQUER FORMATO EM ARRAY
// =====================================================

function paraArray(dados) {

    if (!dados) {
        return [];
    }

    if (Array.isArray(dados)) {
        return dados;
    }

    if (
        typeof dados === "object"
    ) {

        return Object.entries(
            dados
        ).map(
            ([id, item]) => {

                if (
                    item &&
                    typeof item === "object"
                ) {

                    return {
                        id,
                        ...item
                    };
                }

                return {
                    id,
                    valor: item
                };
            }
        );
    }

    return [];
}

// =====================================================
// FUNÇÃO NÚMERO
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
// VERIFICAR UID
// =====================================================

function pertenceAoUsuario(
    item,
    uid
) {

    if (!item) {
        return false;
    }

    /*
     * Dados novos possuem uid.
     */

    if (
        item.uid !== undefined &&
        item.uid !== null
    ) {

        return (
            String(item.uid) ===
            String(uid)
        );
    }

    /*
     * Dados antigos sem UID não
     * são incluídos no relatório.
     *
     * Isso evita misturar dados
     * de utilizadores diferentes.
     */

    return false;
}

// =====================================================
// DATA DO REGISTRO
// =====================================================

function obterData(item) {

    if (!item) {
        return null;
    }

    return (
        item.createdAt ||
        item.criadoEm ||
        item.data ||
        item.dataVenda ||
        item.dataCompra ||
        item.timestamp ||
        null
    );
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
            // CARREGAR DADOS JSON
            // =================================================

            const vendasDados =
                lerJSON("compras");

            const clientesDados =
                lerJSON("clientes");

            const pedidosDados =
                lerJSON("pedidos");

            const dispositivosDados =
                lerJSON("dispositivos");

            const pacotesDados =
                lerJSON("pacotes");

            const gruposDados =
                lerJSON("grupos");

            // =================================================
            // TRANSFORMAR EM ARRAYS
            // =================================================

            const vendas =
                paraArray(
                    vendasDados
                )
                .filter(
                    venda =>
                        pertenceAoUsuario(
                            venda,
                            uid
                        )
                );

            const clientes =
                paraArray(
                    clientesDados
                )
                .filter(
                    cliente =>
                        pertenceAoUsuario(
                            cliente,
                            uid
                        )
                );

            const pedidos =
                paraArray(
                    pedidosDados
                )
                .filter(
                    pedido =>
                        pertenceAoUsuario(
                            pedido,
                            uid
                        )
                );

            const dispositivos =
                paraArray(
                    dispositivosDados
                )
                .filter(
                    dispositivo =>
                        pertenceAoUsuario(
                            dispositivo,
                            uid
                        )
                );

            const pacotes =
                paraArray(
                    pacotesDados
                )
                .filter(
                    pacote =>
                        pertenceAoUsuario(
                            pacote,
                            uid
                        )
                );

            const grupos =
                paraArray(
                    gruposDados
                )
                .filter(
                    grupo =>
                        pertenceAoUsuario(
                            grupo,
                            uid
                        )
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
                            venda.valor ??
                            venda.preco ??
                            venda.total
                        );

                    // =========================================
                    // CUSTO
                    // =========================================

                    const valorCusto =
                        numero(
                            venda.custo ??
                            venda.valorCusto ??
                            venda.valor_custo
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

                    } else {

                        valorLucro =
                            valor -
                            valorCusto;
                    }

                    // =========================================
                    // MB
                    // =========================================

                    let mb =
                        numero(
                            venda.mb ??
                            venda.megabytes ??
                            venda.quantidadeMB ??
                            venda.quantidadeMb
                        );

                    // =========================================
                    // GB
                    // =========================================

                    let gb =
                        numero(
                            venda.gb ??
                            venda.gigabytes ??
                            venda.quantidadeGB ??
                            venda.quantidadeGb ??
                            venda.gbPacote ??
                            venda.gb_pacote ??
                            venda.pacoteGB ??
                            venda.pacoteGb
                        );

                    // =========================================
                    // CONVERTER MB PARA GB
                    // =========================================

                    if (
                        gb === 0 &&
                        mb > 0
                    ) {

                        gb =
                            mb / 1024;
                    }

                    // =========================================
                    // CONVERTER GB PARA MB
                    // =========================================

                    if (
                        mb === 0 &&
                        gb > 0
                    ) {

                        mb =
                            gb * 1024;
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
                        obterData(
                            venda
                        );

                    let data;

                    if (dataVenda) {

                        data =
                            new Date(
                                dataVenda
                            );

                    } else {

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
                        data.toISOString();

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
                        venda.grupoNome ||
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

                    gruposResumo[grupo]
                        .vendas++;

                    gruposResumo[grupo]
                        .faturamento +=
                        valor;

                    gruposResumo[grupo]
                        .custo +=
                        valorCusto;

                    gruposResumo[grupo]
                        .lucro +=
                        valorLucro;

                    gruposResumo[grupo]
                        .gb +=
                        gb;

                    gruposResumo[grupo]
                        .mb +=
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
                            obterData(
                                venda
                            );

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
                ).length;

            // =================================================
            // ARREDONDAR GRUPOS
            // =================================================

            Object.keys(
                gruposResumo
            )
            .forEach(
                grupo => {

                    gruposResumo[grupo]
                        .faturamento =
                        Number(
                            gruposResumo[grupo]
                                .faturamento
                                .toFixed(2)
                        );

                    gruposResumo[grupo]
                        .custo =
                        Number(
                            gruposResumo[grupo]
                                .custo
                                .toFixed(2)
                        );

                    gruposResumo[grupo]
                        .lucro =
                        Number(
                            gruposResumo[grupo]
                                .lucro
                                .toFixed(2)
                        );

                    gruposResumo[grupo]
                        .gb =
                        Number(
                            gruposResumo[grupo]
                                .gb
                                .toFixed(2)
                        );

                    gruposResumo[grupo]
                        .mb =
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
                            faturamento
                                .toFixed(2)
                        ),

                    custo:
                        Number(
                            custo
                                .toFixed(2)
                        ),

                    lucro:
                        Number(
                            lucro
                                .toFixed(2)
                        ),

                    totalGB:
                        Number(
                            totalGB
                                .toFixed(2)
                        ),

                    totalMB:
                        Number(
                            totalMB
                                .toFixed(2)
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

        } catch (err) {

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

module.exports =
    router;

