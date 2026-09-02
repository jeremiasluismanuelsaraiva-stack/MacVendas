// =====================================================
// MACVENDAS
// API DE CLIENTES
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
// FUNÇÃO PARA LIMPAR NÚMERO
// =====================================================

function limparNumero(numero) {

    return String(numero || "")
        .replace(/\D/g, "");

}


// =====================================================
// LISTAR CLIENTES
// GET /api/clientes
// =====================================================

router.get(
    "/",
    autenticarAPI,
    async (req, res) => {

        try {

            const uid =
                req.usuario.uid;


            // =================================================
            // BUSCAR CLIENTES DO USUÁRIO
            // =================================================

            const snapshot =
                await db
                    .ref(
                        "clientes/" + uid
                    )
                    .once("value");


            const dados =
                snapshot.val() || {};


            // =================================================
            // TRANSFORMAR OBJETO EM ARRAY
            // =================================================

            const clientes =
                Object.entries(dados)
                    .map(
                        ([id, cliente]) => ({

                            id,

                            ...cliente

                        })
                    )
                    .reverse();


            // =================================================
            // RESPOSTA
            // =================================================

            return res.json({

                success: true,

                total:
                    clientes.length,

                clientes

            });

        }
        catch (err) {

            console.error(
                "[API CLIENTES]",
                err
            );


            return res.status(500).json({

                success: false,

                error:
                    "Erro ao listar clientes."

            });

        }

    }
);


// =====================================================
// BUSCAR CLIENTE
// GET /api/clientes/:id
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


            // =================================================
            // BUSCAR
            // =================================================

            const snapshot =
                await db
                    .ref(
                        "clientes/" +
                        uid +
                        "/" +
                        id
                    )
                    .once("value");


            // =================================================
            // NÃO ENCONTRADO
            // =================================================

            if (!snapshot.exists()) {

                return res.status(404).json({

                    success: false,

                    error:
                        "Cliente não encontrado."

                });

            }


            const cliente =
                snapshot.val();


            // =================================================
            // RESPOSTA
            // =================================================

            return res.json({

                success: true,

                cliente: {

                    id,

                    ...cliente

                }

            });

        }
        catch (err) {

            console.error(
                "[API CLIENTE]",
                err
            );


            return res.status(500).json({

                success: false,

                error:
                    "Erro ao buscar cliente."

            });

        }

    }
);


// =====================================================
// ADICIONAR CLIENTE
// POST /api/clientes
// =====================================================

router.post(
    "/",
    autenticarAPI,
    async (req, res) => {

        try {

            const uid =
                req.usuario.uid;


            // =================================================
            // DADOS
            // =================================================

            const nome =
                req.body.nome || "";


            const telefone =
                req.body.telefone ||
                req.body.numero ||
                "";


            const email =
                req.body.email ||
                "";


            const grupo =
                req.body.grupo ||
                "GERAL";


            const saldo =
                Number(
                    req.body.saldo || 0
                );


            const observacao =
                req.body.observacao ||
                "";


            // =================================================
            // VALIDAR TELEFONE
            // =================================================

            if (!telefone) {

                return res.status(400).json({

                    success: false,

                    error:
                        "Número do cliente é obrigatório."

                });

            }


            // =================================================
            // ID BASEADO NO NÚMERO
            // =================================================

            const id =
                limparNumero(
                    telefone
                );


            // =================================================
            // REFERÊNCIA
            // =================================================

            const clienteRef =
                db
                    .ref(
                        "clientes/" +
                        uid +
                        "/" +
                        id
                    );


            // =================================================
            // VERIFICAR SE JÁ EXISTE
            // =================================================

            const existente =
                await clienteRef
                    .once("value");


            if (
                existente.exists()
            ) {

                return res.status(409).json({

                    success: false,

                    error:
                        "Cliente já está cadastrado.",

                    cliente: {

                        id,

                        ...existente.val()

                    }

                });

            }


            // =================================================
            // CRIAR CLIENTE
            // =================================================

            const cliente = {

                id,

                uid,

                nome,

                telefone:
                    String(telefone),

                email,

                grupo,

                saldo,

                observacao,

                createdAt:
                    new Date().toISOString()

            };


            // =================================================
            // GUARDAR FIREBASE
            // =================================================

            await clienteRef.set(
                cliente
            );


            // =================================================
            // RESPOSTA
            // =================================================

            return res.status(201).json({

                success: true,

                message:
                    "Cliente adicionado com sucesso.",

                cliente

            });

        }
        catch (err) {

            console.error(
                "[API POST CLIENTE]",
                err
            );


            return res.status(500).json({

                success: false,

                error:
                    "Erro ao adicionar cliente."

            });

        }

    }
);


// =====================================================
// EDITAR CLIENTE
// PUT /api/clientes/:id
// =====================================================

router.put(
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


            const clienteRef =
                db
                    .ref(
                        "clientes/" +
                        uid +
                        "/" +
                        id
                    );


            // =================================================
            // BUSCAR CLIENTE
            // =================================================

            const snapshot =
                await clienteRef
                    .once("value");


            if (
                !snapshot.exists()
            ) {

                return res.status(404).json({

                    success: false,

                    error:
                        "Cliente não encontrado."

                });

            }


            const clienteAtual =
                snapshot.val();


            // =================================================
            // ATUALIZAR
            // =================================================

            const clienteAtualizado = {

                ...clienteAtual,

                ...req.body,

                id,

                uid,

                saldo:
                    req.body.saldo !== undefined
                        ? Number(
                            req.body.saldo
                        )
                        : Number(
                            clienteAtual.saldo || 0
                        ),

                atualizado:
                    new Date().toISOString()

            };


            // =================================================
            // NÃO PERMITIR ALTERAR ID
            // =================================================

            clienteAtualizado.id =
                id;


            // =================================================
            // NÃO PERMITIR ALTERAR UID
            // =================================================

            clienteAtualizado.uid =
                uid;


            // =================================================
            // GUARDAR
            // =================================================

            await clienteRef.set(
                clienteAtualizado
            );


            // =================================================
            // RESPOSTA
            // =================================================

            return res.json({

                success: true,

                message:
                    "Cliente atualizado com sucesso.",

                cliente:
                    clienteAtualizado

            });

        }
        catch (err) {

            console.error(
                "[API PUT CLIENTE]",
                err
            );


            return res.status(500).json({

                success: false,

                error:
                    "Erro ao editar cliente."

            });

        }

    }
);


// =====================================================
// REMOVER CLIENTE
// DELETE /api/clientes/:id
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


            const clienteRef =
                db
                    .ref(
                        "clientes/" +
                        uid +
                        "/" +
                        id
                    );


            // =================================================
            // VERIFICAR
            // =================================================

            const snapshot =
                await clienteRef
                    .once("value");


            if (
                !snapshot.exists()
            ) {

                return res.status(404).json({

                    success: false,

                    error:
                        "Cliente não encontrado."

                });

            }


            // =================================================
            // REMOVER
            // =================================================

            await clienteRef.remove();


            // =================================================
            // RESPOSTA
            // =================================================

            return res.json({

                success: true,

                message:
                    "Cliente removido com sucesso.",

                id

            });

        }
        catch (err) {

            console.error(
                "[API DELETE CLIENTE]",
                err
            );


            return res.status(500).json({

                success: false,

                error:
                    "Erro ao remover cliente."

            });

        }

    }
);


// =====================================================
// EXPORTAR
// =====================================================

module.exports = router;
