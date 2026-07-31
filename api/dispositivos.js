
const express = require("express");
const router = express.Router();
const db = require("../database/database");

// LISTAR DISPOSITIVOS
router.get("/", (req, res) => {

    try {

        const dispositivos = db.ler("dispositivos");

        res.json({
            success: true,
            total: dispositivos.length,
            dispositivos
        });

    } catch (err) {

        res.status(500).json({
            success: false,
            error: err.message
        });

    }

});

// BUSCAR DISPOSITIVO
router.get("/:id", (req, res) => {

    try {

        const dispositivos = db.ler("dispositivos");

        const dispositivo = dispositivos.find(d => d.id == req.params.id);

        if (!dispositivo) {

            return res.status(404).json({
                success: false,
                error: "Dispositivo não encontrado."
            });

        }

        res.json({
            success: true,
            dispositivo
        });

    } catch (err) {

        res.status(500).json({
            success: false,
            error: err.message
        });

    }

});

// CADASTRAR DISPOSITIVO
router.post("/", (req, res) => {

    try {

        const dispositivos = db.ler("dispositivos");

        const dispositivo = {

            id: Date.now().toString(),

            nome: req.body.nome || "",

            modelo: req.body.modelo || "",

            imei: req.body.imei || "",

            android: req.body.android || "",

            versao: req.body.versao || "",

            status: req.body.status || "OFFLINE",

            bateria: Number(req.body.bateria || 0),

            ip: req.body.ip || "",

            ultimaConexao: new Date().toISOString(),

            createdAt: new Date().toISOString()

        };

        dispositivos.unshift(dispositivo);

        db.salvar("dispositivos", dispositivos);

        res.json({
            success: true,
            dispositivo
        });

    } catch (err) {

        res.status(500).json({
            success: false,
            error: err.message
        });

    }

});

// ATUALIZAR DISPOSITIVO
router.put("/:id", (req, res) => {

    try {

        const dispositivos = db.ler("dispositivos");

        const indice = dispositivos.findIndex(d => d.id == req.params.id);

        if (indice === -1) {

            return res.status(404).json({
                success: false,
                error: "Dispositivo não encontrado."
            });

        }

        dispositivos[indice] = {

            ...dispositivos[indice],

            ...req.body,

            ultimaConexao: new Date().toISOString()

        };

        db.salvar("dispositivos", dispositivos);

        res.json({
            success: true,
            dispositivo: dispositivos[indice]
        });

    } catch (err) {

        res.status(500).json({
            success: false,
            error: err.message
        });

    }

});

// REMOVER DISPOSITIVO
router.delete("/:id", (req, res) => {

    try {

        let dispositivos = db.ler("dispositivos");

        dispositivos = dispositivos.filter(d => d.id != req.params.id);

        db.salvar("dispositivos", dispositivos);

        res.json({
            success: true,
            message: "Dispositivo removido."
        });

    } catch (err) {

        res.status(500).json({
            success: false,
            error: err.message
        });

    }

});

module.exports = router;
