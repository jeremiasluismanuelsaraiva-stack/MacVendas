const express = require("express");
const router = express.Router();

const { db } = require("../firebase-admin");

// =====================================================
// LISTAR DISPOSITIVOS
// GET /dispositivos
// =====================================================

router.get("/", (req, res) => {

    try {

        const dispositivos =
            db.ler("dispositivos") || [];


        res.json({

            success: true,

            total:
                dispositivos.length,

            dispositivos

        });

    }
    catch (err) {

        console.error(
            "Erro ao listar dispositivos:",
            err
        );


        res.status(500).json({

            success: false,

            error:
                err.message

        });

    }

});


// =====================================================
// BUSCAR DISPOSITIVO
// GET /dispositivos/:id
// =====================================================

router.get("/:id", (req, res) => {

    try {

        const dispositivos =
            db.ler("dispositivos") || [];


        const dispositivo =
            dispositivos.find(
                d =>
                    String(d.id) ===
                    String(req.params.id)
            );


        if (!dispositivo) {

            return res.status(404).json({

                success: false,

                error:
                    "Dispositivo não encontrado."

            });

        }


        res.json({

            success: true,

            dispositivo

        });

    }
    catch (err) {

        console.error(
            "Erro ao buscar dispositivo:",
            err
        );


        res.status(500).json({

            success: false,

            error:
                err.message

        });

    }

});


// =====================================================
// CADASTRAR DISPOSITIVO
// POST /dispositivos
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
                    req.body.bateria ||
                    0
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


        res.json({

            success: true,

            dispositivo

        });

    }
    catch (err) {

        console.error(
            "Erro ao cadastrar dispositivo:",
            err
        );


        res.status(500).json({

            success: false,

            error:
                err.message

        });

    }

});


// =====================================================
// ATUALIZAR DISPOSITIVO
// PUT /dispositivos/:id
// =====================================================

router.put("/:id", (req, res) => {

    try {

        const dispositivos =
            db.ler("dispositivos") || [];


        const indice =
            dispositivos.findIndex(
                d =>
                    String(d.id) ===
                    String(req.params.id)
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


        const atualizado = {

            ...atual,

            ...req.body,


            bateria:
                req.body.bateria !== undefined
                    ? Number(
                        req.body.bateria
                    )
                    : atual.bateria,


            ultimaConexao:
                new Date().toISOString(),


            ultimaAtividade:
                new Date().toISOString()

        };


        dispositivos[indice] =
            atualizado;


        db.salvar(
            "dispositivos",
            dispositivos
        );


        res.json({

            success: true,

            dispositivo:
                atualizado

        });

    }
    catch (err) {

        console.error(
            "Erro ao atualizar dispositivo:",
            err
        );


        res.status(500).json({

            success: false,

            error:
                err.message

        });

    }

});


// =====================================================
// REMOVER DISPOSITIVO
// DELETE /dispositivos/:id
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
                    String(d.id) ===
                    id
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
                    String(d.id) !==
                    id
            );


        db.salvar(
            "dispositivos",
            novosDispositivos
        );


        res.json({

            success: true,

            message:
                "Dispositivo removido.",

            id

        });

    }
    catch (err) {

        console.error(
            "Erro ao remover dispositivo:",
            err
        );


        res.status(500).json({

            success: false,

            error:
                err.message

        });

    }

});


module.exports = router;
