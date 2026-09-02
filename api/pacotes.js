const express = require("express");
const router = express.Router();

const { db } = require("../firebase-admin");

// =====================================================
// LISTAR PACOTES
// GET /pacotes
// =====================================================

router.get("/", (req, res) => {

    try {

        const pacotes =
            db.ler("pacotes") || [];

        res.json({
            success: true,
            total: pacotes.length,
            pacotes
        });

    } catch (err) {

        console.error(
            "Erro ao listar pacotes:",
            err
        );

        res.status(500).json({
            success: false,
            error: err.message
        });

    }

});


// =====================================================
// BUSCAR PACOTE
// GET /pacotes/:id
// =====================================================

router.get("/:id", (req, res) => {

    try {

        const pacotes =
            db.ler("pacotes") || [];

        const pacote =
            pacotes.find(
                p =>
                    String(p.id) ===
                    String(req.params.id)
            );

        if (!pacote) {

            return res.status(404).json({
                success: false,
                error: "Pacote não encontrado."
            });

        }

        res.json({
            success: true,
            pacote
        });

    } catch (err) {

        console.error(
            "Erro ao buscar pacote:",
            err
        );

        res.status(500).json({
            success: false,
            error: err.message
        });

    }

});


// =====================================================
// ADICIONAR PACOTE
// POST /pacotes
// =====================================================

router.post("/", (req, res) => {

    try {

        const pacotes =
            db.ler("pacotes") || [];


        const gb =
            Number(
                req.body.gb || 0
            );


        const pacote = {

            id:
                Date.now().toString(),

            nome:
                req.body.nome || "",

            tipo:
                req.body.tipo || "NORMAL",

            gb,

            mb:
                gb * 1024,

            valor:
                Number(
                    req.body.valor || 0
                ),

            vantagem:
                req.body.vantagem || "",

            descricao:
                req.body.descricao || "",

            ativo:
                req.body.ativo !== undefined
                    ? Boolean(req.body.ativo)
                    : true,

            createdAt:
                new Date().toISOString()

        };


        pacotes.unshift(
            pacote
        );


        db.salvar(
            "pacotes",
            pacotes
        );


        res.json({
            success: true,
            pacote
        });

    } catch (err) {

        console.error(
            "Erro ao adicionar pacote:",
            err
        );

        res.status(500).json({
            success: false,
            error: err.message
        });

    }

});


// =====================================================
// EDITAR PACOTE
// PUT /pacotes/:id
// =====================================================

router.put("/:id", (req, res) => {

    try {

        const pacotes =
            db.ler("pacotes") || [];


        const index =
            pacotes.findIndex(
                p =>
                    String(p.id) ===
                    String(req.params.id)
            );


        if (index === -1) {

            return res.status(404).json({
                success: false,
                error: "Pacote não encontrado."
            });

        }


        const atual =
            pacotes[index];


        const atualizado = {

            ...atual,

            ...req.body

        };


        // ==========================================
        // SINCRONIZAR GB / MB
        // ==========================================

        if (
            req.body.gb !== undefined
        ) {

            atualizado.gb =
                Number(
                    req.body.gb
                );

            atualizado.mb =
                atualizado.gb * 1024;

        }
        else if (
            req.body.mb !== undefined
        ) {

            atualizado.mb =
                Number(
                    req.body.mb
                );

            atualizado.gb =
                atualizado.mb / 1024;

        }


        // ==========================================
        // GARANTIR VALOR NUMÉRICO
        // ==========================================

        if (
            req.body.valor !== undefined
        ) {

            atualizado.valor =
                Number(
                    req.body.valor
                );

        }


        atualizado.atualizado =
            new Date().toISOString();


        pacotes[index] =
            atualizado;


        db.salvar(
            "pacotes",
            pacotes
        );


        res.json({
            success: true,
            pacote: atualizado
        });

    } catch (err) {

        console.error(
            "Erro ao editar pacote:",
            err
        );

        res.status(500).json({
            success: false,
            error: err.message
        });

    }

});


// =====================================================
// REMOVER PACOTE
// DELETE /pacotes/:id
// =====================================================

router.delete("/:id", (req, res) => {

    try {

        const pacotes =
            db.ler("pacotes") || [];


        const id =
            String(
                req.params.id
            );


        const existe =
            pacotes.some(
                pacote =>
                    String(pacote.id) === id
            );


        if (!existe) {

            return res.status(404).json({
                success: false,
                error: "Pacote não encontrado."
            });

        }


        const novosPacotes =
            pacotes.filter(
                pacote =>
                    String(pacote.id) !== id
            );


        db.salvar(
            "pacotes",
            novosPacotes
        );


        res.json({
            success: true,
            mensagem: "Pacote removido.",
            id
        });

    } catch (err) {

        console.error(
            "Erro ao remover pacote:",
            err
        );

        res.status(500).json({
            success: false,
            error: err.message
        });

    }

});


module.exports = router;
