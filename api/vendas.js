"use strict";

// =====================================================
// MACVENDAS
// API DE VENDAS
// ARMAZENAMENTO JSON
// =====================================================

const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

const autenticarAPI =
    require("./auth");

// =====================================================
// DIRETÓRIO DE DADOS
// =====================================================

const DATA_DIR =
    path.join(
        __dirname,
        "data"
    );

const ARQUIVO_COMPRAS =
    path.join(
        DATA_DIR,
        "compras.json"
    );

const ARQUIVO_CLIENTES =
    path.join(
        DATA_DIR,
        "clientes.json"
    );

// =====================================================
// GARANTIR DIRETÓRIO E ARQUIVOS
// =====================================================

function garantirArquivos() {

    if (
        !fs.existsSync(
            DATA_DIR
        )
    ) {

        fs.mkdirSync(
            DATA_DIR,
            {
                recursive: true
            }
        );
    }

    if (
        !fs.existsSync(
            ARQUIVO_COMPRAS
        )
    ) {

        fs.writeFileSync(
            ARQUIVO_COMPRAS,
            "[]",
            "utf8"
        );
    }

    if (
        !fs.existsSync(
            ARQUIVO_CLIENTES
        )
    ) {

        fs.writeFileSync(
            ARQUIVO_CLIENTES,
            "[]",
            "utf8"
        );
    }
}

// =====================================================
// LER JSON
// =====================================================

function lerJSON(arquivo) {

    garantirArquivos();

    try {

        const conteudo =
            fs.readFileSync(
                arquivo,
                "utf8"
            ).trim();

        if (!conteudo) {
            return [];
        }

        const dados =
            JSON.parse(
                conteudo
            );

        return Array.isArray(dados)
            ? dados
            : [];

    } catch (erro) {

        console.error(
            "[API VENDAS] Erro ao ler:",
            arquivo,
            erro
        );

        return [];
    }
}

// =====================================================
// SALVAR JSON
// =====================================================

function salvarJSON(
    arquivo,
    dados
) {

    garantirArquivos();

    fs.writeFileSync(
        arquivo,
        JSON.stringify(
            dados,
            null,
            4
        ),
        "utf8"
    );
}

// =====================================================
// FUNÇÕES AUXILIARES
// =====================================================

function numeroValor(valor) {

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

function limparNumero(numero) {

    return String(numero)
        .replace(
            /\D/g,
            ""
        );
}

function agora() {

    return new Date()
        .toISOString();
}

function gerarId() {

    return (
        Date.now().toString() +
        "-" +
        Math.random()
            .toString(36)
            .substring(2, 8)
    );
}

// =====================================================
// LISTAR VENDAS
// GET /api/vendas
// =====================================================

router.get(
    "/",
    autenticarAPI,
    async (req, res) => {

        try {

            const uid =
                req.usuario.uid;

            const dados =
                lerJSON(
                    ARQUIVO_COMPRAS
                );

            /*
             * Somente vendas do usuário.
             */

            const vendas =
                dados
                    .filter(
                        venda =>
                            String(
                                venda.uid
                            ) ===
                            String(uid)
                    )
                    .reverse();

            return res.json({

                success: true,

                vendas

            });

        } catch (err) {

            console.error(
                "[API VENDAS] Erro ao listar:",
                err
            );

            return res.status(500).json({

                success: false,

                error:
                    err.message ||
                    "Erro ao listar vendas."

            });
        }
    }
);

// =====================================================
// BUSCAR VENDA
// GET /api/vendas/:id
// =====================================================

router.get(
    "/:id",
    autenticarAPI,
    async (req, res) => {

        try {

            const uid =
                req.usuario.uid;

            const id =
                String(
                    req.params.id
                );

            const vendas =
                lerJSON(
                    ARQUIVO_COMPRAS
                );

            const venda =
                vendas.find(
                    item =>
                        String(
                            item.id
                        ) === id &&
                        String(
                            item.uid
                        ) ===
                        String(uid)
                );

            if (!venda) {

                return res.status(404).json({

                    success: false,

                    error:
                        "Venda não encontrada."

                });
            }

            return res.json({

                success: true,

                venda

            });

        } catch (err) {

            console.error(
                "[API VENDAS] Erro ao buscar:",
                err
            );

            return res.status(500).json({

                success: false,

                error:
                    err.message ||
                    "Erro ao buscar venda."

            });
        }
    }
);

// =====================================================
// ADICIONAR VENDA
// POST /api/vendas
// =====================================================

router.post(
    "/",
    autenticarAPI,
    async (req, res) => {

        try {

            const uid =
                req.usuario.uid;

            // =============================================
            // DADOS RECEBIDOS
            // =============================================

            const numero =
                req.body.numero ||
                "";

            const mb =
                numeroValor(
                    req.body.mb
                );

            const gbPacote =
                numeroValor(
                    req.body.gbPacote ??
                    req.body.gb_pacote
                );

            const valorPacote =
                numeroValor(
                    req.body.valorPacote ??
                    req.body.valor_pacote ??
                    req.body.valor
                );

            const custo =
                numeroValor(
                    req.body.custo
                );

            const grupo =
                req.body.grupo ||
                "GRUPO_PADRAO";

            const tipo =
                req.body.tipo ||
                "normal";

            const vantagem =
                req.body.vantagem ||
                "";

            const status =
                req.body.status ||
                "Concluído";

            // =============================================
            // VALIDAR NÚMERO
            // =============================================

            if (!numero) {

                return res.status(400).json({

                    success: false,

                    error:
                        "Número do cliente é obrigatório."

                });
            }

            // =============================================
            // CALCULAR GB
            // =============================================

            const gb =
                gbPacote > 0
                    ? gbPacote
                    : mb / 1024;

            // =============================================
            // CALCULAR LUCRO
            // =============================================

            const lucro =
                valorPacote -
                custo;

            // =============================================
            // GERAR ID
            // =============================================

            const id =
                gerarId();

            const data =
                agora();

            // =============================================
            // CRIAR VENDA
            // =============================================

            const venda = {

                id,

                uid,

                numero:
                    String(numero),

                mb,

                gb,

                gbPacote,

                gb_pacote:
                    gbPacote,

                grupo,

                tipo,

                valorPacote,

                valor_pacote:
                    valorPacote,

                valorVenda:
                    valorPacote,

                valor_venda:
                    valorPacote,

                custo,

                lucro,

                vantagem,

                status,

                createdAt:
                    data,

                criadoEm:
                    data

            };

            // =============================================
            // LER COMPRAS
            // =============================================

            const vendas =
                lerJSON(
                    ARQUIVO_COMPRAS
                );

            // =============================================
            // GUARDAR VENDA
            // =============================================

            vendas.unshift(
                venda
            );

            salvarJSON(
                ARQUIVO_COMPRAS,
                vendas
            );

            // =============================================
            // ATUALIZAR CLIENTE
            // =============================================

            const numeroLimpo =
                limparNumero(
                    numero
                );

            if (
                numeroLimpo
            ) {

                const clientes =
                    lerJSON(
                        ARQUIVO_CLIENTES
                    );

                const indiceCliente =
                    clientes.findIndex(
                        cliente =>
                            String(
                                cliente.uid
                            ) ===
                            String(uid) &&
                            limparNumero(
                                cliente.numero ||
                                cliente.telefone ||
                                cliente.id ||
                                ""
                            ) ===
                            numeroLimpo
                    );

                /*
                 * Se o cliente já existir,
                 * atualizar os dados da compra.
                 */

                if (
                    indiceCliente !== -1
                ) {

                    clientes[
                        indiceCliente
                    ] = {

                        ...clientes[
                            indiceCliente
                        ],

                        numero:
                            String(numero),

                        ultimaCompra:
                            agora(),

                        ultimaVenda:
                            id

                    };

                }
                /*
                 * Se ainda não existir,
                 * criar automaticamente.
                 */

                else {

                    clientes.unshift({

                        id:
                            numeroLimpo,

                        uid,

                        numero:
                            String(numero),

                        ultimaCompra:
                            agora(),

                        ultimaVenda:
                            id,

                        createdAt:
                            agora()

                    });
                }

                salvarJSON(
                    ARQUIVO_CLIENTES,
                    clientes
                );
            }

            // =============================================
            // RESPOSTA
            // =============================================

            return res.status(201).json({

                success: true,

                message:
                    "Venda adicionada com sucesso.",

                venda

            });

        } catch (err) {

            console.error(
                "[API VENDAS] Erro ao adicionar:",
                err
            );

            return res.status(500).json({

                success: false,

                error:
                    err.message ||
                    "Erro ao adicionar venda."

            });
        }
    }
);

// =====================================================
// APAGAR VENDA
// DELETE /api/vendas/:id
// =====================================================

router.delete(
    "/:id",
    autenticarAPI,
    async (req, res) => {

        try {

            const uid =
                req.usuario.uid;

            const id =
                String(
                    req.params.id
                );

            const vendas =
                lerJSON(
                    ARQUIVO_COMPRAS
                );

            const indice =
                vendas.findIndex(
                    venda =>
                        String(
                            venda.id
                        ) === id &&
                        String(
                            venda.uid
                        ) ===
                        String(uid)
                );

            if (
                indice === -1
            ) {

                return res.status(404).json({

                    success: false,

                    error:
                        "Venda não encontrada."

                });
            }

            /*
             * Remover somente
             * a venda do usuário.
             */

            vendas.splice(
                indice,
                1
            );

            salvarJSON(
                ARQUIVO_COMPRAS,
                vendas
            );

            return res.json({

                success: true,

                message:
                    "Venda removida.",

                id

            });

        } catch (err) {

            console.error(
                "[API VENDAS] Erro ao apagar:",
                err
            );

            return res.status(500).json({

                success: false,

                error:
                    err.message ||
                    "Erro ao apagar venda."

            });
        }
    }
);

// =====================================================
// EXPORTAR
// =====================================================

module.exports =
    router;

