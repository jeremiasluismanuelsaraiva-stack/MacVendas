const express = require("express");
const router = express.Router();

const db = require("../database/database");


// =====================================================
// LISTAR VENDAS
// GET /vendas
// =====================================================

router.get("/", (req, res) => {

    try {

        const vendas =
            db.ler("vendas") || [];


        res.json(vendas);

    }
    catch (err) {

        console.error(
            "Erro ao listar vendas:",
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
// BUSCAR VENDA
// GET /vendas/:id
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
                err.message

        });

    }

});


// =====================================================
// ADICIONAR VENDA
// POST /vendas
// =====================================================

router.post("/", (req, res) => {

    try {

        const vendas =
            db.ler("vendas") || [];


        const numero =
            req.body.numero ||
            "";


        const mb =
            Number(
                req.body.mb ||
                0
            );


        const gbPacote =
            Number(
                req.body.gbPacote ||
                0
            );


        // Se vier GB, usa GB.
        // Caso contrário, calcula através dos MB.

        const gb =
            gbPacote > 0
                ? gbPacote
                : mb / 1024;


        const valorPacote =
            Number(
                req.body.valorPacote ||
                req.body.valor ||
                0
            );


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


        vendas.unshift(
            venda
        );


        db.salvar(
            "vendas",
            vendas
        );


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
                err.message

        });

    }

});


// =====================================================
// APAGAR VENDA
// DELETE /vendas/:id
// =====================================================

router.delete("/:id", (req, res) => {

    try {

        const vendas =
            db.ler("vendas") || [];


        const id =
            String(
                req.params.id
            );


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
                err.message

        });

    }

});


module.exports = router;
