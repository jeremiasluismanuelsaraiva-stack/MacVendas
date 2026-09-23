"use strict";

const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

const autenticarAPI = require("./auth");

/*
|--------------------------------------------------------------------------
| ARQUIVO DE DADOS
|--------------------------------------------------------------------------
*/

const DATA_DIR = path.join(__dirname, "data");
const ARQUIVO = path.join(DATA_DIR, "pacotes.json");

/*
|--------------------------------------------------------------------------
| GARANTIR ARMAZENAMENTO
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
| LER PACOTES
|--------------------------------------------------------------------------
*/

function lerPacotes() {
    garantirArquivo();

    try {
        const conteudo = fs.readFileSync(
            ARQUIVO,
            "utf8"
        ).trim();

        if (!conteudo) {
            return [];
        }

        const dados = JSON.parse(conteudo);

        return Array.isArray(dados)
            ? dados
            : [];

    } catch (erro) {

        console.error(
            "[API PACOTES] Erro ao ler pacotes.json:",
            erro
        );

        return [];
    }
}

/*
|--------------------------------------------------------------------------
| SALVAR PACOTES
|--------------------------------------------------------------------------
*/

function salvarPacotes(pacotes) {
    garantirArquivo();

    fs.writeFileSync(
        ARQUIVO,
        JSON.stringify(
            pacotes,
            null,
            4
        ),
        "utf8"
    );
}

/*
|--------------------------------------------------------------------------
| GERAR ID
|--------------------------------------------------------------------------
*/

function gerarId() {

    return (
        Date.now().toString(36) +
        "-" +
        Math.random()
            .toString(36)
            .substring(2, 10)
    ).toUpperCase();
}

/*
|--------------------------------------------------------------------------
| CONVERTER NÚMERO
|--------------------------------------------------------------------------
*/

function numeroValor(valor) {

    if (
        valor === undefined ||
        valor === null ||
        valor === ""
    ) {
        return 0;
    }

    const n = Number(valor);

    return Number.isFinite(n)
        ? n
        : 0;
}

/*
|--------------------------------------------------------------------------
| CONVERTER BOOLEAN
|--------------------------------------------------------------------------
*/

function booleanValor(
    valor,
    padrao = true
) {

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

        const texto =
            valor
                .trim()
                .toLowerCase();

        return (
            texto === "true" ||
            texto === "1" ||
            texto === "sim" ||
            texto === "yes" ||
            texto === "on"
        );
    }

    return Boolean(valor);
}

/*
|--------------------------------------------------------------------------
| DATA ATUAL
|--------------------------------------------------------------------------
*/

function agora() {

    return new Date()
        .toISOString();
}

/*
|--------------------------------------------------------------------------
| VERIFICAR SE O PACOTE PERTENCE AO USUÁRIO
|--------------------------------------------------------------------------
*/

function pacoteDoUsuario(
    pacote,
    uid
) {

    return (
        pacote &&
        String(pacote.uid) === String(uid)
    );
}

/*
|--------------------------------------------------------------------------
| LISTAR PACOTES
|--------------------------------------------------------------------------
| GET /api/pacotes
|--------------------------------------------------------------------------
*/

router.get(
    "/",
    autenticarAPI,
    async (req, res) => {

        try {

            const uid =
                req.usuario.uid;

            const dados =
                lerPacotes();

            /*
             * Somente pacotes deste usuário.
             */

            const pacotes =
                dados
                    .filter(
                        pacote =>
                            pacoteDoUsuario(
                                pacote,
                                uid
                            )
                    )
                    .map(
                        pacote => ({
                            ...pacote
                        })
                    )
                    .reverse();

            return res.json({

                success: true,

                total:
                    pacotes.length,

                pacotes

            });

        } catch (err) {

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

/*
|--------------------------------------------------------------------------
| BUSCAR PACOTE
|--------------------------------------------------------------------------
| GET /api/pacotes/:id
|--------------------------------------------------------------------------
*/

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

            const dados =
                lerPacotes();

            const pacote =
                dados.find(
                    item =>
                        String(item.id) === id &&
                        pacoteDoUsuario(
                            item,
                            uid
                        )
                );

            if (!pacote) {

                return res.status(404).json({

                    success: false,

                    error:
                        "Pacote não encontrado."

                });
            }

            return res.json({

                success: true,

                pacote: {
                    ...pacote
                }

            });

        } catch (err) {

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

/*
|--------------------------------------------------------------------------
| ADICIONAR PACOTE
|--------------------------------------------------------------------------
| POST /api/pacotes
|--------------------------------------------------------------------------
*/

router.post(
    "/",
    autenticarAPI,
    async (req, res) => {

        try {

            const uid =
                req.usuario.uid;

            /*
             * DADOS RECEBIDOS
             */

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

            /*
             * CALCULAR GB / MB
             */

            let gb =
                gbRecebido;

            let mb =
                mbRecebido;

            if (gb > 0) {

                mb =
                    gb * 1024;

            } else if (mb > 0) {

                gb =
                    mb / 1024;
            }

            /*
             * VALIDAR NOME
             */

            if (!nome) {

                return res.status(400).json({

                    success: false,

                    error:
                        "Nome do pacote é obrigatório."

                });
            }

            /*
             * VALIDAR GB / MB
             */

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

            /*
             * GERAR ID
             */

            const id =
                gerarId();

            const data =
                agora();

            /*
             * CRIAR PACOTE
             */

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
                    data,

                criadoEm:
                    data

            };

            /*
             * LER DADOS
             */

            const pacotes =
                lerPacotes();

            /*
             * ADICIONAR
             */

            pacotes.push(
                pacote
            );

            /*
             * GUARDAR
             */

            salvarPacotes(
                pacotes
            );

            /*
             * RESPOSTA
             */

            return res.status(201).json({

                success: true,

                message:
                    "Pacote adicionado com sucesso.",

                pacote

            });

        } catch (err) {

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

/*
|--------------------------------------------------------------------------
| EDITAR PACOTE
|--------------------------------------------------------------------------
| PUT /api/pacotes/:id
|--------------------------------------------------------------------------
*/

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

            const pacotes =
                lerPacotes();

            const indice =
                pacotes.findIndex(
                    pacote =>
                        String(pacote.id) === id &&
                        pacoteDoUsuario(
                            pacote,
                            uid
                        )
                );

            /*
             * VERIFICAR
             */

            if (indice === -1) {

                return res.status(404).json({

                    success: false,

                    error:
                        "Pacote não encontrado."

                });
            }

            /*
             * PACOTE ATUAL
             */

            const atual =
                pacotes[indice];

            /*
             * DADOS RECEBIDOS
             *
             * Mantemos id e uid protegidos.
             */

            const atualizado = {

                ...atual,

                ...req.body,

                id,

                uid

            };

            /*
             * GB / MB
             */

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

            } else if (
                req.body.mb !== undefined
            ) {

                atualizado.mb =
                    numeroValor(
                        req.body.mb
                    );

                atualizado.gb =
                    atualizado.mb /
                    1024;

            } else {

                atualizado.gb =
                    numeroValor(
                        atualizado.gb
                    );

                atualizado.mb =
                    numeroValor(
                        atualizado.mb
                    );
            }

            /*
             * VALOR
             */

            if (
                req.body.valor !== undefined
            ) {

                atualizado.valor =
                    numeroValor(
                        req.body.valor
                    );

            } else {

                atualizado.valor =
                    numeroValor(
                        atualizado.valor
                    );
            }

            /*
             * ATIVO
             */

            if (
                req.body.ativo !== undefined
            ) {

                atualizado.ativo =
                    booleanValor(
                        req.body.ativo,
                        true
                    );
            }

            /*
             * DATA
             */

            atualizado.atualizado =
                agora();

            /*
             * GARANTIR QUE CREATEDAT NÃO DESAPAREÇA
             */

            if (!atualizado.createdAt) {

                atualizado.createdAt =
                    atual.createdAt ||
                    agora();
            }

            /*
             * GUARDAR
             */

            pacotes[indice] =
                atualizado;

            salvarPacotes(
                pacotes
            );

            /*
             * RESPOSTA
             */

            return res.json({

                success: true,

                message:
                    "Pacote atualizado com sucesso.",

                pacote:
                    atualizado

            });

        } catch (err) {

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

/*
|--------------------------------------------------------------------------
| ATIVAR / DESATIVAR PACOTE
|--------------------------------------------------------------------------
| PATCH /api/pacotes/:id/status
|--------------------------------------------------------------------------
*/

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

            const pacotes =
                lerPacotes();

            const indice =
                pacotes.findIndex(
                    pacote =>
                        String(pacote.id) === id &&
                        pacoteDoUsuario(
                            pacote,
                            uid
                        )
                );

            /*
             * VERIFICAR
             */

            if (indice === -1) {

                return res.status(404).json({

                    success: false,

                    error:
                        "Pacote não encontrado."

                });
            }

            /*
             * ATUALIZAR
             */

            pacotes[indice] = {

                ...pacotes[indice],

                ativo,

                atualizado:
                    agora()

            };

            /*
             * GUARDAR
             */

            salvarPacotes(
                pacotes
            );

            /*
             * RESPOSTA
             */

            return res.json({

                success: true,

                message:
                    ativo
                        ? "Pacote ativado."
                        : "Pacote desativado.",

                id,

                ativo

            });

        } catch (err) {

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

/*
|--------------------------------------------------------------------------
| REMOVER PACOTE
|--------------------------------------------------------------------------
| DELETE /api/pacotes/:id
|--------------------------------------------------------------------------
*/

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

            const pacotes =
                lerPacotes();

            const indice =
                pacotes.findIndex(
                    pacote =>
                        String(pacote.id) === id &&
                        pacoteDoUsuario(
                            pacote,
                            uid
                        )
                );

            /*
             * VERIFICAR
             */

            if (indice === -1) {

                return res.status(404).json({

                    success: false,

                    error:
                        "Pacote não encontrado."

                });
            }

            /*
             * REMOVER
             */

            pacotes.splice(
                indice,
                1
            );

            /*
             * GUARDAR
             */

            salvarPacotes(
                pacotes
            );

            /*
             * RESPOSTA
             */

            return res.json({

                success: true,

                message:
                    "Pacote removido.",

                id

            });

        } catch (err) {

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

/*
|--------------------------------------------------------------------------
| EXPORTAR
|--------------------------------------------------------------------------
*/

module.exports =
    router;

