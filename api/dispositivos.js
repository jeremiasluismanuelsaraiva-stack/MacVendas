// =====================================================
// MOZ TECH
// API DE DISPOSITIVOS
// =====================================================

"use strict";

const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

const autenticarAPI =
    require("./auth");

// =====================================================
// ARQUIVO DE DADOS
// =====================================================

const DATA_DIR =
    path.join(
        __dirname,
        "data"
    );

const ARQUIVO =
    path.join(
        DATA_DIR,
        "dispositivos.json"
    );

// =====================================================
// GARANTIR DIRETÓRIO E ARQUIVO
// =====================================================

function garantirArquivo() {

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
            ARQUIVO
        )
    ) {

        fs.writeFileSync(
            ARQUIVO,
            "[]",
            "utf8"
        );
    }
}

// =====================================================
// LER DISPOSITIVOS
// =====================================================

function lerDispositivos() {

    garantirArquivo();

    try {

        const conteudo =
            fs.readFileSync(
                ARQUIVO,
                "utf8"
            );

        if (
            !conteudo.trim()
        ) {

            return [];
        }

        const dados =
            JSON.parse(
                conteudo
            );

        return Array.isArray(dados)
            ? dados
            : [];

    }
    catch (err) {

        console.error(
            "[DISPOSITIVOS] Erro ao ler JSON:",
            err
        );

        return [];
    }
}

// =====================================================
// SALVAR DISPOSITIVOS
// =====================================================

function salvarDispositivos(
    dispositivos
) {

    garantirArquivo();

    fs.writeFileSync(
        ARQUIVO,
        JSON.stringify(
            dispositivos,
            null,
            2
        ),
        "utf8"
    );
}

// =====================================================
// UID DO USUÁRIO
// =====================================================

function obterUID(req) {

    return req.usuario?.uid || null;
}

// =====================================================
// VERIFICAR AUTENTICAÇÃO
// =====================================================

function verificarUsuario(
    req,
    res
) {

    const uid =
        obterUID(req);

    if (!uid) {

        res.status(401).json({

            success: false,

            error:
                "Usuário não autenticado."

        });

        return null;
    }

    return uid;
}

// =====================================================
// LISTAR DISPOSITIVOS
// GET /api/dispositivos
// =====================================================

router.get(
    "/",
    autenticarAPI,
    (req, res) => {

        try {

            const uid =
                verificarUsuario(
                    req,
                    res
                );

            if (!uid) {
                return;
            }

            const dispositivos =
                lerDispositivos();

            // =================================================
            // SOMENTE DISPOSITIVOS DO USUÁRIO
            // =================================================

            const meusDispositivos =
                dispositivos.filter(
                    dispositivo =>
                        String(
                            dispositivo.uid
                        ) === String(uid)
                );

            return res.json({

                success: true,

                total:
                    meusDispositivos.length,

                dispositivos:
                    meusDispositivos

            });

        }
        catch (err) {

            console.error(
                "[API DISPOSITIVOS] Erro ao listar:",
                err
            );

            return res.status(500).json({

                success: false,

                error:
                    err.message ||
                    "Erro ao listar dispositivos."

            });

        }

    }
);

// =====================================================
// BUSCAR DISPOSITIVO
// GET /api/dispositivos/:id
// =====================================================

router.get(
    "/:id",
    autenticarAPI,
    (req, res) => {

        try {

            const uid =
                verificarUsuario(
                    req,
                    res
                );

            if (!uid) {
                return;
            }

            const dispositivos =
                lerDispositivos();

            const id =
                String(
                    req.params.id
                );

            // =================================================
            // BUSCAR SOMENTE ENTRE OS DISPOSITIVOS DO USUÁRIO
            // =================================================

            const dispositivo =
                dispositivos.find(
                    d =>
                        String(d.id) === id &&
                        String(d.uid) ===
                            String(uid)
                );

            if (!dispositivo) {

                return res.status(404).json({

                    success: false,

                    error:
                        "Dispositivo não encontrado."

                });

            }

            return res.json({

                success: true,

                dispositivo

            });

        }
        catch (err) {

            console.error(
                "[API DISPOSITIVOS] Erro ao buscar:",
                err
            );

            return res.status(500).json({

                success: false,

                error:
                    err.message ||
                    "Erro ao buscar dispositivo."

            });

        }

    }
);

// =====================================================
// CADASTRAR DISPOSITIVO
// POST /api/dispositivos
// =====================================================

router.post(
    "/",
    autenticarAPI,
    (req, res) => {

        try {

            const uid =
                verificarUsuario(
                    req,
                    res
                );

            if (!uid) {
                return;
            }

            const dispositivos =
                lerDispositivos();

            const agora =
                new Date()
                    .toISOString();

            const bateria =
                Number(
                    req.body.bateria || 0
                );

            const dispositivo = {

                // =================================================
                // IDENTIFICAÇÃO
                // =================================================

                id:
                    Date.now().toString(),

                uid:
                    uid,

                // =================================================
                // DADOS DO DISPOSITIVO
                // =================================================

                nome:
                    req.body.nome ||
                    "",

                modelo:
                    req.body.modelo ||
                    "",

                numero:
                    req.body.numero ||
                    "",

                imei:
                    req.body.imei ||
                    "",

                android:
                    req.body.android ||
                    "",

                versao:
                    req.body.versao ||
                    "",

                status:
                    req.body.status ||
                    "OFFLINE",

                bateria:
                    Number.isFinite(
                        bateria
                    )
                        ? bateria
                        : 0,

                ip:
                    req.body.ip ||
                    "",

                // =================================================
                // DATAS
                // =================================================

                ultimaConexao:
                    agora,

                ultimaAtividade:
                    agora,

                createdAt:
                    agora

            };

            // =================================================
            // ADICIONAR NO INÍCIO
            // =================================================

            dispositivos.unshift(
                dispositivo
            );

            salvarDispositivos(
                dispositivos
            );

            console.log(
                "[API DISPOSITIVOS] Dispositivo cadastrado:",
                dispositivo.id,
                "UID:",
                uid
            );

            return res.status(201).json({

                success: true,

                message:
                    "Dispositivo cadastrado com sucesso.",

                dispositivo

            });

        }
        catch (err) {

            console.error(
                "[API DISPOSITIVOS] Erro ao cadastrar:",
                err
            );

            return res.status(500).json({

                success: false,

                error:
                    err.message ||
                    "Erro ao cadastrar dispositivo."

            });

        }

    }
);

// =====================================================
// ATUALIZAR DISPOSITIVO
// PUT /api/dispositivos/:id
// =====================================================

router.put(
    "/:id",
    autenticarAPI,
    (req, res) => {

        try {

            const uid =
                verificarUsuario(
                    req,
                    res
                );

            if (!uid) {
                return;
            }

            const dispositivos =
                lerDispositivos();

            const id =
                String(
                    req.params.id
                );

            // =================================================
            // PROCURAR SOMENTE DO USUÁRIO
            // =================================================

            const indice =
                dispositivos.findIndex(
                    d =>
                        String(d.id) === id &&
                        String(d.uid) ===
                            String(uid)
                );

            if (
                indice === -1
            ) {

                return res.status(404).json({

                    success: false,

                    error:
                        "Dispositivo não encontrado."

                });

            }

            const atual =
                dispositivos[indice];

            const agora =
                new Date()
                    .toISOString();

            // =================================================
            // NÃO PERMITIR ALTERAR UID
            // =================================================

            const dadosRecebidos = {
                ...req.body
            };

            delete dadosRecebidos.uid;
            delete dadosRecebidos.id;

            // =================================================
            // BATERIA
            // =================================================

            let bateria =
                atual.bateria;

            if (
                req.body.bateria !==
                undefined
            ) {

                bateria =
                    Number(
                        req.body.bateria
                    );

                if (
                    !Number.isFinite(
                        bateria
                    )
                ) {

                    bateria =
                        atual.bateria;
                }
            }

            const atualizado = {

                ...atual,

                ...dadosRecebidos,

                // =================================================
                // CAMPOS PROTEGIDOS
                // =================================================

                id:
                    atual.id,

                uid:
                    atual.uid,

                bateria:
                    bateria,

                // =================================================
                // DATAS
                // =================================================

                ultimaConexao:
                    agora,

                ultimaAtividade:
                    agora,

                createdAt:
                    atual.createdAt ||
                    agora

            };

            dispositivos[indice] =
                atualizado;

            salvarDispositivos(
                dispositivos
            );

            console.log(
                "[API DISPOSITIVOS] Dispositivo atualizado:",
                id
            );

            return res.json({

                success: true,

                message:
                    "Dispositivo atualizado com sucesso.",

                dispositivo:
                    atualizado

            });

        }
        catch (err) {

            console.error(
                "[API DISPOSITIVOS] Erro ao atualizar:",
                err
            );

            return res.status(500).json({

                success: false,

                error:
                    err.message ||
                    "Erro ao atualizar dispositivo."

            });

        }

    }
);

// =====================================================
// ATUALIZAR STATUS
// PUT /api/dispositivos/:id/status
// =====================================================

router.put(
    "/:id/status",
    autenticarAPI,
    (req, res) => {

        try {

            const uid =
                verificarUsuario(
                    req,
                    res
                );

            if (!uid) {
                return;
            }

            const dispositivos =
                lerDispositivos();

            const id =
                String(
                    req.params.id
                );

            // =================================================
            // PROCURAR DISPOSITIVO DO USUÁRIO
            // =================================================

            const indice =
                dispositivos.findIndex(
                    d =>
                        String(d.id) === id &&
                        String(d.uid) ===
                            String(uid)
                );

            if (
                indice === -1
            ) {

                return res.status(404).json({

                    success: false,

                    error:
                        "Dispositivo não encontrado."

                });

            }

            const agora =
                new Date()
                    .toISOString();

            const atual =
                dispositivos[indice];

            // =================================================
            // BATERIA
            // =================================================

            let bateria =
                atual.bateria;

            if (
                req.body.bateria !==
                undefined
            ) {

                bateria =
                    Number(
                        req.body.bateria
                    );

                if (
                    !Number.isFinite(
                        bateria
                    )
                ) {

                    bateria =
                        atual.bateria;
                }
            }

            // =================================================
            // ATUALIZAR
            // =================================================

            const atualizado = {

                ...atual,

                status:
                    req.body.status ||
                    atual.status,

                bateria:
                    bateria,

                ip:
                    req.body.ip !==
                    undefined
                        ? req.body.ip
                        : atual.ip,

                ultimaConexao:
                    agora,

                ultimaAtividade:
                    agora

            };

            dispositivos[indice] =
                atualizado;

            salvarDispositivos(
                dispositivos
            );

            return res.json({

                success: true,

                message:
                    "Status atualizado com sucesso.",

                dispositivo:
                    atualizado

            });

        }
        catch (err) {

            console.error(
                "[API DISPOSITIVOS] Erro ao atualizar status:",
                err
            );

            return res.status(500).json({

                success: false,

                error:
                    err.message ||
                    "Erro ao atualizar status."

            });

        }

    }
);

// =====================================================
// REMOVER DISPOSITIVO
// DELETE /api/dispositivos/:id
// =====================================================

router.delete(
    "/:id",
    autenticarAPI,
    (req, res) => {

        try {

            const uid =
                verificarUsuario(
                    req,
                    res
                );

            if (!uid) {
                return;
            }

            const dispositivos =
                lerDispositivos();

            const id =
                String(
                    req.params.id
                );

            // =================================================
            // VERIFICAR SE EXISTE E PERTENCE AO USUÁRIO
            // =================================================

            const existe =
                dispositivos.some(
                    d =>
                        String(d.id) === id &&
                        String(d.uid) ===
                            String(uid)
                );

            if (!existe) {

                return res.status(404).json({

                    success: false,

                    error:
                        "Dispositivo não encontrado."

                });

            }

            // =================================================
            // REMOVER
            // =================================================

            const novosDispositivos =
                dispositivos.filter(
                    d =>
                        !(
                            String(d.id) === id &&
                            String(d.uid) ===
                                String(uid)
                        )
                );

            salvarDispositivos(
                novosDispositivos
            );

            console.log(
                "[API DISPOSITIVOS] Dispositivo removido:",
                id
            );

            return res.json({

                success: true,

                message:
                    "Dispositivo removido.",

                id

            });

        }
        catch (err) {

            console.error(
                "[API DISPOSITIVOS] Erro ao remover:",
                err
            );

            return res.status(500).json({

                success: false,

                error:
                    err.message ||
                    "Erro ao remover dispositivo."

            });

        }

    }
);

// =====================================================
// EXPORTAR
// =====================================================

module.exports =
    router;

