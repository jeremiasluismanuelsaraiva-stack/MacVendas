"use strict";

// =====================================================
// MACVENDAS
// API DE PACOTES - FIREBASE
// =====================================================

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


function booleanValor(valor, padrao = true) {

    if (
        valor === undefined ||
        valor === null ||
        valor === ""
    ) {

        return padrao;

    }


    if (
        typeof valor === "boolean"
    ) {

        return valor;

    }


    if (
        typeof valor === "string"
    ) {

        return (
            valor.toLowerCase() === "true" ||
            valor === "1" ||
            valor.toLowerCase() === "sim"
        );

    }


    return Boolean(valor);

}


function agora() {

    return new Date()
        .toISOString();

}


// =====================================================
// LISTAR PACOTES
// GET /api/pacotes
// =====================================================

router.get(
    "/",
    autenticarAPI,
    async (req, res) => {

        try {

            const uid =
                req.usuario.uid;


            // =============================================
            // BUSCAR PACOTES DO USUÁRIO
            // =============================================

            const snapshot =
                await db
                    .ref(
                        "pacotes/" + uid
                    )
                    .once("value");


            const dados =
                snapshot.val() || {};


            // =============================================
            // TRANSFORMAR EM ARRAY
            // =============================================

            const pacotes =
                Object.entries(dados)
                    .map(
                        ([id, pacote]) => ({

                            id,

                            ...pacote

                        })
                    )
                    .reverse();


            // =============================================
            // RESPOSTA
            // =============================================

            return res.json({

                success: true,

                total:
                    pacotes.length,

                pacotes

            });

        }
        catch (err) {

            console.error(
                "[API PACOTES] Erro ao listar:",
                err
            );


            return res.status(500).json({

                success: false,

                error:
                    err.message ||
                    "Erro ao listar pacotes."

            });

        }

    }
);


// =====================================================
// BUSCAR PACOTE
// GET /api/pacotes/:id
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

            const pacoteRef =
                db
                    .ref(
                        "pacotes/" +
                        uid +
                        "/" +
                        id
                    );


            const snapshot =
                await pacoteRef
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
                        "Pacote não encontrado."

                });

            }


            // =============================================
            // DADOS
            // =============================================

            const pacote =
                snapshot.val();


            return res.json({

                success: true,

                pacote: {

                    id,

                    ...pacote

                }

            });

        }
        catch (err) {

            console.error(
                "[API PACOTES] Erro ao buscar:",
                err
            );


            return res.status(500).json({

                success: false,

                error:
                    err.message ||
                    "Erro ao buscar pacote."

            });

        }

    }
);


// =====================================================
// ADICIONAR PACOTE
// POST /api/pacotes
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

            const nome =
                req.body.nome ||
                "";


            const tipo =
                req.body.tipo ||
                "NORMAL";


            const gbRecebido =
                numeroValor(
                    req.body.gb
                );


            const mbRecebido =
                numeroValor(
                    req.body.mb
                );


            const valor =
                numeroValor(
                    req.body.valor
                );


            const vantagem =
                req.body.vantagem ||
                "";


            const descricao =
                req.body.descricao ||
                "";


            const ativo =
                booleanValor(
                    req.body.ativo,
                    true
                );


            // =============================================
            // CALCULAR GB / MB
            // =============================================

            let gb =
                gbRecebido;


            let mb =
                mbRecebido;


            if (
                gb > 0
            ) {

                mb =
                    gb * 1024;

            }
            else if (
                mb > 0
            ) {

                gb =
                    mb / 1024;

            }


            // =============================================
            // VALIDAR
            // =============================================

            if (
                !nome
            ) {

                return res.status(400).json({

                    success: false,

                    error:
                        "Nome do pacote é obrigatório."

                });

            }


            if (
                gb <= 0 &&
                mb <= 0
            ) {

                return res.status(400).json({

                    success: false,

                    error:
                        "GB ou MB do pacote é obrigatório."

                });

            }


            // =============================================
            // CRIAR REFERÊNCIA
            // =============================================

            const pacoteRef =
                db
                    .ref(
                        "pacotes/" +
                        uid
                    )
                    .push();


            const id =
                pacoteRef.key;


            // =============================================
            // CRIAR PACOTE
            // =============================================

            const pacote = {

                id,

                uid,

                nome,

                tipo,

                gb,

                mb,

                valor,

                vantagem,

                descricao,

                ativo,

                createdAt:
                    agora(),

                criadoEm:
                    agora()

            };


            // =============================================
            // GUARDAR
            // =============================================

            await pacoteRef.set(
                pacote
            );


            // =============================================
            // RESPOSTA
            // =============================================

            return res.status(201).json({

                success: true,

                message:
                    "Pacote adicionado com sucesso.",

                pacote

            });

        }
        catch (err) {

            console.error(
                "[API PACOTES] Erro ao adicionar:",
                err
            );


            return res.status(500).json({

                success: false,

                error:
                    err.message ||
                    "Erro ao adicionar pacote."

            });

        }

    }
);


// =====================================================
// EDITAR PACOTE
// PUT /api/pacotes/:id
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


            // =============================================
            // REFERÊNCIA
            // =============================================

            const pacoteRef =
                db
                    .ref(
                        "pacotes/" +
                        uid +
                        "/" +
                        id
                    );


            const snapshot =
                await pacoteRef
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
                        "Pacote não encontrado."

                });

            }


            // =============================================
            // PACOTE ATUAL
            // =============================================

            const atual =
                snapshot.val() || {};


            // =============================================
            // DADOS RECEBIDOS
            // =============================================

            const atualizado = {

                ...atual,

                ...req.body,

                id,

                uid

            };


            // =============================================
            // SINCRONIZAR GB / MB
            // =============================================

            if (
                req.body.gb !== undefined
            ) {

                atualizado.gb =
                    numeroValor(
                        req.body.gb
                    );


                atualizado.mb =
                    atualizado.gb *
                    1024;

            }
            else if (
                req.body.mb !== undefined
            ) {

                atualizado.mb =
                    numeroValor(
                        req.body.mb
                    );


                atualizado.gb =
                    atualizado.mb /
                    1024;

            }
            else {

                atualizado.gb =
                    numeroValor(
                        atualizado.gb
                    );


                atualizado.mb =
                    numeroValor(
                        atualizado.mb
                    );

            }


            // =============================================
            // VALOR
            // =============================================

            if (
                req.body.valor !== undefined
            ) {

                atualizado.valor =
                    numeroValor(
                        req.body.valor
                    );

            }
            else {

                atualizado.valor =
                    numeroValor(
                        atualizado.valor
                    );

            }


            // =============================================
            // ATIVO
            // =============================================

            if (
                req.body.ativo !== undefined
            ) {

                atualizado.ativo =
                    booleanValor(
                        req.body.ativo,
                        true
                    );

            }


            // =============================================
            // DATA
            // =============================================

            atualizado.atualizado =
                agora();


            // =============================================
            // GUARDAR
            // =============================================

            await pacoteRef.update(
                atualizado
            );


            // =============================================
            // RESPOSTA
            // =============================================

            return res.json({

                success: true,

                message:
                    "Pacote atualizado com sucesso.",

                pacote:
                    atualizado

            });

        }
        catch (err) {

            console.error(
                "[API PACOTES] Erro ao editar:",
                err
            );


            return res.status(500).json({

                success: false,

                error:
                    err.message ||
                    "Erro ao editar pacote."

            });

        }

    }
);


// =====================================================
// ATIVAR / DESATIVAR PACOTE
// PATCH /api/pacotes/:id/status
// =====================================================

router.patch(
    "/:id/status",
    autenticarAPI,
    async (req, res) => {

        try {

            const uid =
                req.usuario.uid;


            const id =
                String(
                    req.params.id
                );


            const ativo =
                booleanValor(
                    req.body.ativo,
                    true
                );


            const pacoteRef =
                db
                    .ref(
                        "pacotes/" +
                        uid +
                        "/" +
                        id
                    );


            const snapshot =
                await pacoteRef
                    .once("value");


            if (
                !snapshot.exists()
            ) {

                return res.status(404).json({

                    success: false,

                    error:
                        "Pacote não encontrado."

                });

            }


            await pacoteRef.update({

                ativo,

                atualizado:
                    agora()

            });


            return res.json({

                success: true,

                message:
                    ativo
                        ? "Pacote ativado."
                        : "Pacote desativado.",

                id,

                ativo

            });

        }
        catch (err) {

            console.error(
                "[API PACOTES] Erro ao alterar status:",
                err
            );


            return res.status(500).json({

                success: false,

                error:
                    err.message ||
                    "Erro ao alterar status do pacote."

            });

        }

    }
);


// =====================================================
// REMOVER PACOTE
// DELETE /api/pacotes/:id
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

            const pacoteRef =
                db
                    .ref(
                        "pacotes/" +
                        uid +
                        "/" +
                        id
                    );


            const snapshot =
                await pacoteRef
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
                        "Pacote não encontrado."

                });

            }


            // =============================================
            // APAGAR
            // =============================================

            await pacoteRef.remove();


            // =============================================
            // RESPOSTA
            // =============================================

            return res.json({

                success: true,

                message:
                    "Pacote removido.",

                id

            });

        }
        catch (err) {

            console.error(
                "[API PACOTES] Erro ao remover:",
                err
            );


            return res.status(500).json({

                success: false,

                error:
                    err.message ||
                    "Erro ao remover pacote."

            });

        }

    }
);


// =====================================================
// EXPORTAR
// =====================================================

module.exports =
    router;
