// =====================================================
// MOZ TECH
// API DE DISPOSITIVOS
// =====================================================

"use strict";

const express = require("express");

const router = express.Router();

const { db } = require("./firebase-admin");


// =====================================================
// LISTAR DISPOSITIVOS
// GET /api/dispositivos
// =====================================================

router.get("/", (req, res) => {

    try {

        const dispositivos =
            db.ler("dispositivos") || [];


        return res.json({

            success: true,

            total:
                dispositivos.length,

            dispositivos

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

});


// =====================================================
// BUSCAR DISPOSITIVO
// GET /api/dispositivos/:id
// =====================================================

router.get("/:id", (req, res) => {

    try {

        const dispositivos =
            db.ler("dispositivos") || [];


        const id =
            String(
                req.params.id
            );


        const dispositivo =
            dispositivos.find(
                d =>
                    String(d.id) === id
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

});


// =====================================================
// CADASTRAR DISPOSITIVO
// POST /api/dispositivos
// =====================================================

router.post("/", (req, res) => {

    try {

        const dispositivos =
            db.ler("dispositivos") || [];


        const agora =
            new Date().toISOString();


        const dispositivo = {

            id:
                Date.now().toString(),

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
                Number(
                    req.body.bateria || 0
                ),

            ip:
                req.body.ip ||
                "",

            ultimaConexao:
                agora,

            ultimaAtividade:
                agora,

            createdAt:
                agora

        };


        dispositivos.unshift(
            dispositivo
        );


        db.salvar(
            "dispositivos",
            dispositivos
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

});


// =====================================================
// ATUALIZAR DISPOSITIVO
// PUT /api/dispositivos/:id
// =====================================================

router.put("/:id", (req, res) => {

    try {

        const dispositivos =
            db.ler("dispositivos") || [];


        const id =
            String(
                req.params.id
            );


        const indice =
            dispositivos.findIndex(
                d =>
                    String(d.id) === id
            );


        if (indice === -1) {

            return res.status(404).json({

                success: false,

                error:
                    "Dispositivo não encontrado."

            });

        }


        const atual =
            dispositivos[indice];


        const agora =
            new Date().toISOString();


        const atualizado = {

            ...atual,

            ...req.body,


            id:
                atual.id,


            bateria:
                req.body.bateria !== undefined
                    ? Number(
                        req.body.bateria
                    )
                    : atual.bateria,


            ultimaConexao:
                agora,


            ultimaAtividade:
                agora

        };


        dispositivos[indice] =
            atualizado;


        db.salvar(
            "dispositivos",
            dispositivos
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

});


// =====================================================
// ATUALIZAR STATUS
// PUT /api/dispositivos/:id/status
// =====================================================

router.put("/:id/status", (req, res) => {

    try {

        const dispositivos =
            db.ler("dispositivos") || [];


        const id =
            String(
                req.params.id
            );


        const indice =
            dispositivos.findIndex(
                d =>
                    String(d.id) === id
            );


        if (indice === -1) {

            return res.status(404).json({

                success: false,

                error:
                    "Dispositivo não encontrado."

            });

        }


        const agora =
            new Date().toISOString();


        const atual =
            dispositivos[indice];


        const atualizado = {

            ...atual,

            status:
                req.body.status ||
                atual.status,

            bateria:
                req.body.bateria !== undefined
                    ? Number(
                        req.body.bateria
                    )
                    : atual.bateria,

            ip:
                req.body.ip !== undefined
                    ? req.body.ip
                    : atual.ip,

            ultimaConexao:
                agora,

            ultimaAtividade:
                agora

        };


        dispositivos[indice] =
            atualizado;


        db.salvar(
            "dispositivos",
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

});


// =====================================================
// REMOVER DISPOSITIVO
// DELETE /api/dispositivos/:id
// =====================================================

router.delete("/:id", (req, res) => {

    try {

        const dispositivos =
            db.ler("dispositivos") || [];


        const id =
            String(
                req.params.id
            );


        const existe =
            dispositivos.some(
                d =>
                    String(d.id) === id
            );


        if (!existe) {

            return res.status(404).json({

                success: false,

                error:
                    "Dispositivo não encontrado."

            });

        }


        const novosDispositivos =
            dispositivos.filter(
                d =>
                    String(d.id) !== id
            );


        db.salvar(
            "dispositivos",
            novosDispositivos
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

});


// =====================================================
// EXPORTAR
// =====================================================

module.exports = router;
