// =====================================================
// MOZ TECH
// API DE VENDAS
// =====================================================

const express = require("express");

const router = express.Router();

const db = require("../database/database");


// =====================================================
// LISTAR VENDAS
// GET /api/vendas
// =====================================================

router.get("/", (req, res) => {

    try {

        const vendas =
            db.ler("vendas") || [];


        res.json({

            success: true,

            vendas

        });

    }
    catch (err) {

        console.error(
            "Erro ao listar vendas:",
            err
        );


        res.status(500).json({

            success: false,

            error:
                err.message ||
                "Erro ao listar vendas."

        });

    }

});


// =====================================================
// BUSCAR VENDA
// GET /api/vendas/:id
// =====================================================

router.get("/:id", (req, res) => {

    try {

        const vendas =
            db.ler("vendas") || [];


        const venda =
            vendas.find(
                v =>
                    String(v.id) ===
                    String(req.params.id)
            );


        if (!venda) {

            return res.status(404).json({

                success: false,

                error:
                    "Venda não encontrada."

            });

        }


        res.json({

            success: true,

            venda

        });

    }
    catch (err) {

        console.error(
            "Erro ao buscar venda:",
            err
        );


        res.status(500).json({

            success: false,

            error:
                err.message ||
                "Erro ao buscar venda."

        });

    }

});


// =====================================================
// ADICIONAR VENDA
// POST /api/vendas
// =====================================================

router.post("/", (req, res) => {

    try {

        const vendas =
            db.ler("vendas") || [];


        // =================================================
        // DADOS RECEBIDOS
        // =================================================

        const numero =
            req.body.numero ||
            "";


        const mb =
            Number(
                req.body.mb || 0
            );


        const gbPacote =
            Number(
                req.body.gbPacote || 0
            );


        // =================================================
        // CALCULAR GB
        // =================================================

        const gb =
            gbPacote > 0
                ? gbPacote
                : mb / 1024;


        // =================================================
        // VALOR
        // =================================================

        const valorPacote =
            Number(
                req.body.valorPacote ??
                req.body.valor ??
                0
            );


        // =================================================
        // CRIAR VENDA
        // =================================================

        const venda = {

            id:
                Date.now().toString(),


            numero,


            mb,


            gb,


            grupo:
                req.body.grupo ||
                "GRUPO_PADRAO",


            tipo:
                req.body.tipo ||
                "normal",


            valor_venda:
                valorPacote,


            valor_pacote:
                valorPacote,


            gb_pacote:
                gbPacote,


            vantagem:
                req.body.vantagem ||
                "",


            status:
                req.body.status ||
                "Concluído",


            createdAt:
                new Date().toISOString()

        };


        // =================================================
        // GUARDAR
        // =================================================

        vendas.unshift(
            venda
        );


        db.salvar(
            "vendas",
            vendas
        );


        // =================================================
        // RESPOSTA
        // =================================================

        res.json({

            success: true,

            venda

        });

    }
    catch (err) {

        console.error(
            "Erro ao adicionar venda:",
            err
        );


        res.status(500).json({

            success: false,

            error:
                err.message ||
                "Erro ao adicionar venda."

        });

    }

});


// =====================================================
// APAGAR VENDA
// DELETE /api/vendas/:id
// =====================================================

router.delete("/:id", (req, res) => {

    try {

        const vendas =
            db.ler("vendas") || [];


        const id =
            String(
                req.params.id
            );


        // =================================================
        // VERIFICAR
        // =================================================

        const existe =
            vendas.some(
                venda =>
                    String(venda.id) ===
                    id
            );


        if (!existe) {

            return res.status(404).json({

                success: false,

                error:
                    "Venda não encontrada."

            });

        }


        // =================================================
        // REMOVER
        // =================================================

        const novasVendas =
            vendas.filter(
                venda =>
                    String(venda.id) !==
                    id
            );


        db.salvar(
            "vendas",
            novasVendas
        );


        // =================================================
        // RESPOSTA
        // =================================================

        res.json({

            success: true,

            message:
                "Venda removida.",

            id

        });

    }
    catch (err) {

        console.error(
            "Erro ao apagar venda:",
            err
        );


        res.status(500).json({

            success: false,

            error:
                err.message ||
                "Erro ao apagar venda."

        });

    }

});


// =====================================================
// EXPORTAR
// =====================================================

module.exports = router;
