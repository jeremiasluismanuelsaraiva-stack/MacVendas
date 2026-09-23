"use strict";

const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

const autenticarAPI =
    require("./auth");

// =====================================================
// ARQUIVO DE CLIENTES
// =====================================================

const clientesFile =
    path.join(
        __dirname,
        "..",
        "data",
        "clientes.json"
    );


// =====================================================
// GARANTIR PASTA E ARQUIVO
// =====================================================

function garantirArquivo() {

    const pasta =
        path.dirname(
            clientesFile
        );

    if (
        !fs.existsSync(
            pasta
        )
    ) {

        fs.mkdirSync(
            pasta,
            {
                recursive: true
            }
        );

    }

    if (
        !fs.existsSync(
            clientesFile
        )
    ) {

        fs.writeFileSync(
            clientesFile,
            "[]",
            "utf8"
        );

    }

}


// =====================================================
// LER CLIENTES
// =====================================================

function lerClientes() {

    garantirArquivo();

    try {

        const conteudo =
            fs.readFileSync(
                clientesFile,
                "utf8"
            );

        if (
            !conteudo.trim()
        ) {

            return [];

        }

        return JSON.parse(
            conteudo
        );

    }
    catch (erro) {

        console.error(
            "[CLIENTES] Erro ao ler arquivo:",
            erro
        );

        return [];

    }

}


// =====================================================
// SALVAR CLIENTES
// =====================================================

function salvarClientes(
    clientes
) {

    garantirArquivo();

    fs.writeFileSync(
        clientesFile,
        JSON.stringify(
            clientes,
            null,
            2
        ),
        "utf8"
    );

}


// =====================================================
// FUNÇÃO PARA LIMPAR NÚMERO
// =====================================================

function limparNumero(
    numero
) {

    return String(
        numero || ""
    )
        .replace(
            /\D/g,
            ""
        );

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

            const clientes =
                lerClientes();

            const meusClientes =
                clientes
                    .filter(
                        cliente =>
                            cliente.uid ===
                            uid
                    )
                    .reverse();

            return res.json({

                success:
                    true,

                total:
                    meusClientes.length,

                clientes:
                    meusClientes

            });

        }
        catch (err) {

            console.error(
                "[API CLIENTES]",
                err
            );

            return res
                .status(500)
                .json({

                    success:
                        false,

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

            const clientes =
                lerClientes();

            const cliente =
                clientes.find(
                    item =>
                        item.uid === uid &&
                        String(
                            item.id
                        ) === id
                );

            if (!cliente) {

                return res
                    .status(404)
                    .json({

                        success:
                            false,

                        error:
                            "Cliente não encontrado."

                    });

            }

            return res.json({

                success:
                    true,

                cliente

            });

        }
        catch (err) {

            console.error(
                "[API CLIENTE]",
                err
            );

            return res
                .status(500)
                .json({

                    success:
                        false,

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

                return res
                    .status(400)
                    .json({

                        success:
                            false,

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


            if (!id) {

                return res
                    .status(400)
                    .json({

                        success:
                            false,

                        error:
                            "Número do cliente inválido."

                    });

            }


            // =================================================
            // LER CLIENTES
            // =================================================

            const clientes =
                lerClientes();


            // =================================================
            // VERIFICAR SE JÁ EXISTE
            // =================================================

            const existente =
                clientes.find(
                    cliente =>
                        cliente.uid === uid &&
                        String(
                            cliente.id
                        ) === id
                );


            if (existente) {

                return res
                    .status(409)
                    .json({

                        success:
                            false,

                        error:
                            "Cliente já está cadastrado.",

                        cliente:
                            existente

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
                    String(
                        telefone
                    ),

                email,

                grupo,

                saldo,

                observacao,

                createdAt:
                    new Date()
                        .toISOString()

            };


            // =================================================
            // GUARDAR JSON
            // =================================================

            clientes.push(
                cliente
            );

            salvarClientes(
                clientes
            );


            // =================================================
            // RESPOSTA
            // =================================================

            return res
                .status(201)
                .json({

                    success:
                        true,

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

            return res
                .status(500)
                .json({

                    success:
                        false,

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

            const clientes =
                lerClientes();


            // =================================================
            // ÍNDICE DO CLIENTE
            // =================================================

            const indice =
                clientes.findIndex(
                    cliente =>
                        cliente.uid === uid &&
                        String(
                            cliente.id
                        ) === id
                );


            // =================================================
            // NÃO ENCONTRADO
            // =================================================

            if (
                indice === -1
            ) {

                return res
                    .status(404)
                    .json({

                        success:
                            false,

                        error:
                            "Cliente não encontrado."

                    });

            }


            // =================================================
            // CLIENTE ATUAL
            // =================================================

            const clienteAtual =
                clientes[indice];


            // =================================================
            // ATUALIZAR
            // =================================================

            const clienteAtualizado = {

                ...clienteAtual,

                ...req.body,

                id,

                uid,

                saldo:
                    req.body.saldo !==
                    undefined

                        ? Number(
                            req.body.saldo
                        )

                        : Number(
                            clienteAtual.saldo ||
                            0
                        ),

                atualizado:
                    new Date()
                        .toISOString()

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
            // NÃO PERMITIR ALTERAR
            // CRIADO EM
            // =================================================

            clienteAtualizado.createdAt =
                clienteAtual.createdAt ||
                new Date()
                    .toISOString();


            // =================================================
            // ATUALIZAR ARRAY
            // =================================================

            clientes[indice] =
                clienteAtualizado;


            // =================================================
            // GUARDAR
            // =================================================

            salvarClientes(
                clientes
            );


            // =================================================
            // RESPOSTA
            // =================================================

            return res.json({

                success:
                    true,

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

            return res
                .status(500)
                .json({

                    success:
                        false,

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

            const clientes =
                lerClientes();


            // =================================================
            // ENCONTRAR CLIENTE
            // =================================================

            const indice =
                clientes.findIndex(
                    cliente =>
                        cliente.uid === uid &&
                        String(
                            cliente.id
                        ) === id
                );


            // =================================================
            // NÃO ENCONTRADO
            // =================================================

            if (
                indice === -1
            ) {

                return res
                    .status(404)
                    .json({

                        success:
                            false,

                        error:
                            "Cliente não encontrado."

                    });

            }


            // =================================================
            // REMOVER
            // =================================================

            clientes.splice(
                indice,
                1
            );


            // =================================================
            // GUARDAR
            // =================================================

            salvarClientes(
                clientes
            );


            // =================================================
            // RESPOSTA
            // =================================================

            return res.json({

                success:
                    true,

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

            return res
                .status(500)
                .json({

                    success:
                        false,

                    error:
                        "Erro ao remover cliente."

                });

        }

    }
);


// =====================================================
// EXPORTAR
// =====================================================

module.exports =
    router;
