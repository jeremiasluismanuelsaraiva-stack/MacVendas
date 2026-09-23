"use strict";

const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();
const autenticarAPI = require("./auth");

// =====================================================
// DIRETÓRIO DE DADOS
// =====================================================

const DATA_DIR = path.join(__dirname, "data");

// =====================================================
// ARQUIVOS
// =====================================================
//
// compras.json       -> vendas
// clientes.json      -> clientes
// pedidos.json       -> pedidos
// dispositivos.json  -> dispositivos
//
// =====================================================

const ARQUIVOS = {

    vendas:
        path.join(
            DATA_DIR,
            "compras.json"
        ),

    clientes:
        path.join(
            DATA_DIR,
            "clientes.json"
        ),

    pedidos:
        path.join(
            DATA_DIR,
            "pedidos.json"
        ),

    dispositivos:
        path.join(
            DATA_DIR,
            "dispositivos.json"
        )
};

// =====================================================
// GARANTIR DIRETÓRIO
// =====================================================

function garantirDiretorio() {

    if (!fs.existsSync(DATA_DIR)) {

        fs.mkdirSync(
            DATA_DIR,
            {
                recursive: true
            }
        );
    }
}

// =====================================================
// GARANTIR ARQUIVO
// =====================================================

function garantirArquivo(arquivo) {

    garantirDiretorio();

    if (!fs.existsSync(arquivo)) {

        fs.writeFileSync(
            arquivo,
            "[]",
            "utf8"
        );
    }
}

// =====================================================
// LER JSON
// =====================================================

function lerJSON(arquivo) {

    try {

        garantirArquivo(arquivo);

        const conteudo =
            fs.readFileSync(
                arquivo,
                "utf8"
            );

        if (!conteudo.trim()) {

            return [];
        }

        const dados =
            JSON.parse(conteudo);

        return dados;

    } catch (erro) {

        console.error(
            "[DASHBOARD] Erro ao ler:",
            arquivo,
            erro
        );

        return [];
    }
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
            item =>
                item !== null
        );
    }

    if (
        typeof dados === "object"
    ) {

        return Object.values(
            dados
        ).filter(
            item =>
                item !== null
        );
    }

    return [];
}

// =====================================================
// VALOR NUMÉRICO
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
// DATA DA VENDA
// =====================================================

function obterData(venda) {

    return (
        venda?.createdAt ||
        venda?.criadoEm ||
        venda?.data ||
        venda?.dataVenda ||
        venda?.dataCompra ||
        venda?.timestamp ||
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

    let data;

    // =================================================
    // DATA EM MILISSEGUNDOS
    // =================================================

    if (
        typeof dataVenda === "number"
    ) {

        data =
            new Date(
                dataVenda
            )
                .toISOString()
                .slice(
                    0,
                    10
                );

    }

    // =================================================
    // DATA EM STRING
    // =================================================

    else {

        const texto =
            String(
                dataVenda
            );

        // Se começar diretamente com YYYY-MM-DD
        if (
            /^\d{4}-\d{2}-\d{2}/.test(
                texto
            )
        ) {

            data =
                texto.slice(
                    0,
                    10
                );

        }

        else {

            const convertido =
                new Date(
                    texto
                );

            if (
                Number.isNaN(
                    convertido.getTime()
                )
            ) {

                return false;
            }

            data =
                convertido
                    .toISOString()
                    .slice(
                        0,
                        10
                    );
        }
    }

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
// FILTRAR DADOS PELO USUÁRIO
// =====================================================
//
// Cada registro pertence a um UID.
//
// Aceita:
// uid
// userId
// usuarioId
// usuario
// ownerId
//
// Se o arquivo tiver registros sem UID, eles não serão
// atribuídos automaticamente ao usuário.
//
// =====================================================

function pertenceAoUsuario(
    item,
    uid
) {

    if (
        !item ||
        typeof item !== "object"
    ) {

        return false;
    }

    const uidItem =
        item.uid ??
        item.userId ??
        item.usuarioId ??
        item.ownerId;

    if (
        uidItem === undefined ||
        uidItem === null ||
        uidItem === ""
    ) {

        return false;
    }

    return String(uidItem) ===
        String(uid);
}

// =====================================================
// CARREGAR DADOS DO USUÁRIO
// =====================================================

function carregarDadosUsuario(
    arquivo,
    uid
) {

    const dados =
        lerJSON(arquivo);

    const lista =
        paraArray(dados);

    return lista.filter(
        item =>
            pertenceAoUsuario(
                item,
                uid
            )
    );
}

// =====================================================
// GET /api/dashboard
// =====================================================

router.get(
    "/",
    autenticarAPI,
    async (
        req,
        res
    ) => {

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
            // CARREGAR DADOS
            // =================================================

            const listaVendas =
                carregarDadosUsuario(
                    ARQUIVOS.vendas,
                    uid
                );

            const listaClientes =
                carregarDadosUsuario(
                    ARQUIVOS.clientes,
                    uid
                );

            const listaPedidos =
                carregarDadosUsuario(
                    ARQUIVOS.pedidos,
                    uid
                );

            const listaDispositivos =
                carregarDadosUsuario(
                    ARQUIVOS.dispositivos,
                    uid
                );

            console.log(
                "[DASHBOARD] Vendas:",
                listaVendas.length
            );

            console.log(
                "[DASHBOARD] Clientes:",
                listaClientes.length
            );

            console.log(
                "[DASHBOARD] Pedidos:",
                listaPedidos.length
            );

            console.log(
                "[DASHBOARD] Dispositivos:",
                listaDispositivos.length
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
                // VALOR DA VENDA
                // =============================================

                const valor =
                    numero(
                        venda.valor_venda ??
                        venda.valorVenda ??
                        venda.valor_pacote ??
                        venda.valorPacote ??
                        venda.valor ??
                        venda.preco ??
                        venda.total
                    );

                // =============================================
                // CUSTO
                // =============================================

                const valorCusto =
                    numero(
                        venda.custo ??
                        venda.valor_custo ??
                        venda.valorCusto
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
                    venda.lucro !== undefined &&
                    venda.lucro !== null &&
                    venda.lucro !== ""
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
                        venda.mb ??
                        venda.megabytes ??
                        venda.quantidadeMB ??
                        venda.quantidadeMb
                    );

                totalMB +=
                    mb;

                // =============================================
                // GB
                // =============================================

                let gb =
                    numero(
                        venda.gb ??
                        venda.gigabytes ??
                        venda.quantidadeGB ??
                        venda.quantidadeGb
                    );

                // =============================================
                // OUTROS CAMPOS DE PACOTE
                // =============================================

                if (
                    gb <= 0
                ) {

                    gb =
                        numero(
                            venda.gbPacote ??
                            venda.gb_pacote ??
                            venda.pacoteGB ??
                            venda.pacoteGb
                        );
                }

                // =============================================
                // CONVERTER MB -> GB
                // =============================================

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

