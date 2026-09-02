// =====================================================
// MACVENDAS
// API DE VENDAS - FIREBASE
// =====================================================

"use strict";

const express = require("express");

const router = express.Router();

const { db } =
    require("./firebase-admin");

const autenticarAPI =
    require("./auth");


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
        .replace(/\D/g, "");

}


function agora() {

    return new Date()
        .toISOString();

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


            // =============================================
            // BUSCAR VENDAS DO USUÁRIO
            // =============================================

            const snapshot =
                await db
                    .ref(
                        "vendas/" + uid
                    )
                    .once("value");


            const dados =
                snapshot.val() || {};


            // =============================================
            // TRANSFORMAR EM ARRAY
            // =============================================

            const vendas =
                Object.entries(dados)
                    .map(
                        ([id, venda]) => ({

                            id,

                            ...venda

                        })
                    )
                    .reverse();


            // =============================================
            // RESPOSTA
            // =============================================

            return res.json({

                success: true,

                vendas

            });

        }
        catch (err) {

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


            // =============================================
            // REFERÊNCIA
            // =============================================

            const vendaRef =
                db
                    .ref(
                        "vendas/" +
                        uid +
                        "/" +
                        id
                    );


            const snapshot =
                await vendaRef
                    .once("value");


            // =============================================
            // NÃO ENCONTRADA
            // =============================================

            if (
                !snapshot.exists()
            ) {

                return res.status(404).json({

                    success: false,

                    error:
                        "Venda não encontrada."

                });

            }


            // =============================================
            // VENDA
            // =============================================

            const venda =
                snapshot.val();


            return res.json({

                success: true,

                venda: {

                    id,

                    ...venda

                }

            });

        }
        catch (err) {

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

            if (
                !numero
            ) {

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
            // CRIAR REFERÊNCIA FIREBASE
            // =============================================

            const vendaRef =
                db
                    .ref(
                        "vendas/" +
                        uid
                    )
                    .push();


            const id =
                vendaRef.key;


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
                    agora(),

                criadoEm:
                    agora()

            };


            // =============================================
            // GUARDAR VENDA
            // =============================================

            await vendaRef.set(
                venda
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

                const clienteRef =
                    db
                        .ref(
                            "clientes/" +
                            uid +
                            "/" +
                            numeroLimpo
                        );


                await clienteRef.update({

                    numero:
                        String(numero),

                    ultimaCompra:
                        agora(),

                    ultimaVenda:
                        id

                });

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

        }
        catch (err) {

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


            // =============================================
            // REFERÊNCIA
            // =============================================

            const vendaRef =
                db
                    .ref(
                        "vendas/" +
                        uid +
                        "/" +
                        id
                    );


            const snapshot =
                await vendaRef
                    .once("value");


            // =============================================
            // VERIFICAR
            // =============================================

            if (
                !snapshot.exists()
            ) {

                return res.status(404).json({

                    success: false,

                    error:
                        "Venda não encontrada."

                });

            }


            // =============================================
            // APAGAR
            // =============================================

            await vendaRef.remove();


            // =============================================
            // RESPOSTA
            // =============================================

            return res.json({

                success: true,

                message:
                    "Venda removida.",

                id

            });

        }
        catch (err) {

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
