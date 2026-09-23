"use strict";

const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

const autenticarAPI = require("../auth");

/*
|--------------------------------------------------------------------------
| ARQUIVO DE DADOS
|--------------------------------------------------------------------------
*/

const DATA_DIR = path.join(__dirname, "../data");
const ARQUIVO = path.join(
    DATA_DIR,
    "pedidos.json"
);

/*
|--------------------------------------------------------------------------
| GARANTIR ARQUIVO
|--------------------------------------------------------------------------
*/

function garantirArquivo() {

    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, {
            recursive: true
        });
    }

    if (!fs.existsSync(ARQUIVO)) {
        fs.writeFileSync(
            ARQUIVO,
            "[]",
            "utf8"
        );
    }
}

/*
|--------------------------------------------------------------------------
| LER PEDIDOS
|--------------------------------------------------------------------------
*/

function lerPedidos() {

    garantirArquivo();

    try {

        const conteudo =
            fs.readFileSync(
                ARQUIVO,
                "utf8"
            ).trim();

        if (!conteudo) {
            return [];
        }

        const dados =
            JSON.parse(conteudo);

        return Array.isArray(dados)
            ? dados
            : [];

    } catch (err) {

        console.error(
            "Erro ao ler pedidos.json:",
            err
        );

        return [];
    }
}

/*
|--------------------------------------------------------------------------
| SALVAR PEDIDOS
|--------------------------------------------------------------------------
*/

function salvarPedidos(pedidos) {

    garantirArquivo();

    fs.writeFileSync(
        ARQUIVO,
        JSON.stringify(
            pedidos,
            null,
            4
        ),
        "utf8"
    );
}

/*
|--------------------------------------------------------------------------
| CONVERTER NÚMERO
|--------------------------------------------------------------------------
*/

function numero(valor) {

    if (
        valor === undefined ||
        valor === null ||
        valor === ""
    ) {
        return 0;
    }

    const numeroConvertido =
        Number(valor);

    return Number.isFinite(
        numeroConvertido
    )
        ? numeroConvertido
        : 0;
}

/*
|--------------------------------------------------------------------------
| GERAR ID
|--------------------------------------------------------------------------
*/

function gerarId() {

    return (
        Date.now().toString() +
        "-" +
        Math.random()
            .toString(36)
            .substring(2, 8)
    );
}

/*
|--------------------------------------------------------------------------
| VERIFICAR PROPRIEDADE DO PEDIDO
|--------------------------------------------------------------------------
*/

function pertenceAoUsuario(
    pedido,
    uid
) {

    return (
        pedido &&
        String(pedido.uid) ===
            String(uid)
    );
}

/*
|--------------------------------------------------------------------------
| LISTAR PEDIDOS
|--------------------------------------------------------------------------
| GET /api/pedidos
|--------------------------------------------------------------------------
*/

router.get(
    "/",
    autenticarAPI,
    (req, res) => {

        try {

            const uid =
                req.usuario.uid;

            const pedidos =
                lerPedidos();

            const pedidosUsuario =
                pedidos.filter(
                    pedido =>
                        pertenceAoUsuario(
                            pedido,
                            uid
                        )
                );

            res.json({

                success: true,

                total:
                    pedidosUsuario.length,

                pedidos:
                    pedidosUsuario

            });

        } catch (err) {

            console.error(
                "Erro ao listar pedidos:",
                err
            );

            res.status(500).json({

                success: false,

                error:
                    err.message

            });
        }
    }
);

/*
|--------------------------------------------------------------------------
| BUSCAR PEDIDO
|--------------------------------------------------------------------------
| GET /api/pedidos/:id
|--------------------------------------------------------------------------
*/

router.get(
    "/:id",
    autenticarAPI,
    (req, res) => {

        try {

            const uid =
                req.usuario.uid;

            const id =
                String(
                    req.params.id
                );

            const pedidos =
                lerPedidos();

            const pedido =
                pedidos.find(
                    p =>
                        String(p.id) === id &&
                        pertenceAoUsuario(
                            p,
                            uid
                        )
                );

            if (!pedido) {

                return res.status(404).json({

                    success: false,

                    error:
                        "Pedido não encontrado."

                });
            }

            res.json({

                success: true,

                pedido

            });

        } catch (err) {

            console.error(
                "Erro ao buscar pedido:",
                err
            );

            res.status(500).json({

                success: false,

                error:
                    err.message

            });
        }
    }
);

/*
|--------------------------------------------------------------------------
| CRIAR PEDIDO
|--------------------------------------------------------------------------
| POST /api/pedidos
|--------------------------------------------------------------------------
*/

router.post(
    "/",
    autenticarAPI,
    (req, res) => {

        try {

            const uid =
                req.usuario.uid;

            const pedido = {

                id:
                    gerarId(),

                uid,

                cliente:
                    req.body.cliente ||
                    "",

                numero:
                    req.body.numero ||
                    "",

                pacote:
                    req.body.pacote ||
                    "",

                mb:
                    numero(
                        req.body.mb
                    ),

                gb:
                    numero(
                        req.body.gb
                    ),

                valor:
                    numero(
                        req.body.valor
                    ),

                grupo:
                    req.body.grupo ||
                    "GERAL",

                status:
                    req.body.status ||
                    req.body.estado ||
                    "PENDENTE",

                dispositivo:
                    req.body.dispositivo ||
                    "",

                observacao:
                    req.body.observacao ||
                    "",

                createdAt:
                    new Date()
                        .toISOString()

            };

            const pedidos =
                lerPedidos();

            /*
             * Novo pedido no início.
             */

            pedidos.unshift(
                pedido
            );

            salvarPedidos(
                pedidos
            );

            res.status(201).json({

                success: true,

                pedido

            });

        } catch (err) {

            console.error(
                "Erro ao criar pedido:",
                err
            );

            res.status(500).json({

                success: false,

                error:
                    err.message

            });
        }
    }
);

/*
|--------------------------------------------------------------------------
| ATUALIZAR PEDIDO
|--------------------------------------------------------------------------
| PUT /api/pedidos/:id
|--------------------------------------------------------------------------
*/

router.put(
    "/:id",
    autenticarAPI,
    (req, res) => {

        try {

            const uid =
                req.usuario.uid;

            const id =
                String(
                    req.params.id
                );

            const pedidos =
                lerPedidos();

            const indice =
                pedidos.findIndex(
                    p =>
                        String(p.id) === id &&
                        pertenceAoUsuario(
                            p,
                            uid
                        )
                );

            if (indice === -1) {

                return res.status(404).json({

                    success: false,

                    error:
                        "Pedido não encontrado."

                });
            }

            /*
             * Atualizar mantendo
             * ID e UID protegidos.
             */

            const atual =
                pedidos[indice];

            const atualizado = {

                ...atual,

                ...req.body,

                id,

                uid

            };

            /*
             * MB
             */

            if (
                req.body.mb !== undefined
            ) {

                atualizado.mb =
                    numero(
                        req.body.mb
                    );
            }

            /*
             * GB
             */

            if (
                req.body.gb !== undefined
            ) {

                atualizado.gb =
                    numero(
                        req.body.gb
                    );
            }

            /*
             * VALOR
             */

            if (
                req.body.valor !== undefined
            ) {

                atualizado.valor =
                    numero(
                        req.body.valor
                    );
            }

            /*
             * Compatibilidade:
             * estado -> status
             */

            if (
                req.body.estado !== undefined &&
                req.body.status === undefined
            ) {

                atualizado.status =
                    req.body.estado;
            }

            /*
             * DATA DE ATUALIZAÇÃO
             */

            atualizado.atualizado =
                new Date()
                    .toISOString();

            pedidos[indice] =
                atualizado;

            salvarPedidos(
                pedidos
            );

            res.json({

                success: true,

                pedido:
                    atualizado

            });

        } catch (err) {

            console.error(
                "Erro ao atualizar pedido:",
                err
            );

            res.status(500).json({

                success: false,

                error:
                    err.message

            });
        }
    }
);

/*
|--------------------------------------------------------------------------
| REMOVER PEDIDO
|--------------------------------------------------------------------------
| DELETE /api/pedidos/:id
|--------------------------------------------------------------------------
*/

router.delete(
    "/:id",
    autenticarAPI,
    (req, res) => {

        try {

            const uid =
                req.usuario.uid;

            const id =
                String(
                    req.params.id
                );

            const pedidos =
                lerPedidos();

            const indice =
                pedidos.findIndex(
                    pedido =>
                        String(pedido.id) === id &&
                        pertenceAoUsuario(
                            pedido,
                            uid
                        )
                );

            if (indice === -1) {

                return res.status(404).json({

                    success: false,

                    error:
                        "Pedido não encontrado."

                });
            }

            /*
             * Remover somente
             * o pedido deste usuário.
             */

            pedidos.splice(
                indice,
                1
            );

            salvarPedidos(
                pedidos
            );

            res.json({

                success: true,

                message:
                    "Pedido removido.",

                id

            });

        } catch (err) {

            console.error(
                "Erro ao remover pedido:",
                err
            );

            res.status(500).json({

                success: false,

                error:
                    err.message

            });
        }
    }
);

/*
|--------------------------------------------------------------------------
| EXPORTAR
|--------------------------------------------------------------------------
*/

module.exports =
    router;
