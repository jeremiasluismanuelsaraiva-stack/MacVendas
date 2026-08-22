const express = require("express");
const router = express.Router();

const db = require("../database/database");


// =====================================================
// LISTAR CONFIGURAÇÕES
// GET /configuracoes
// =====================================================

router.get("/", (req, res) => {

    try {

        const configuracoes =
            db.ler("configuracoes") || [];


        res.json({

            success: true,

            configuracoes

        });

    }
    catch (err) {

        console.error(
            "Erro ao listar configurações:",
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
// BUSCAR CONFIGURAÇÃO
// GET /configuracoes/:id
// =====================================================

router.get("/:id", (req, res) => {

    try {

        const configuracoes =
            db.ler("configuracoes") || [];


        const configuracao =
            configuracoes.find(
                c =>
                    String(c.id) ===
                    String(req.params.id)
            );


        if (!configuracao) {

            return res.status(404).json({

                success: false,

                error:
                    "Configuração não encontrada."

            });

        }


        res.json({

            success: true,

            configuracao

        });

    }
    catch (err) {

        console.error(
            "Erro ao buscar configuração:",
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
// CRIAR CONFIGURAÇÃO
// POST /configuracoes
// =====================================================

router.post("/", (req, res) => {

    try {

        const configuracoes =
            db.ler("configuracoes") || [];


        const configuracao = {

            id:
                Date.now().toString(),


            nomeEmpresa:
                req.body.nomeEmpresa ||
                "Sistema SSD",


            telefone:
                req.body.telefone ||
                "",


            email:
                req.body.email ||
                "",


            moeda:
                req.body.moeda ||
                "MT",


            vendaGB:
                Number(
                    req.body.vendaGB ||
                    28
                ),


            custoGB:
                Number(
                    req.body.custoGB ||
                    21
                ),


            tema:
                req.body.tema ||
                "dark",


            idioma:
                req.body.idioma ||
                "pt",


            ussd:
                req.body.ussd ||
                "*162#",


            atualizado:
                new Date().toISOString()

        };


        // Mantém apenas uma configuração
        configuracoes.length = 0;

        configuracoes.push(
            configuracao
        );


        db.salvar(
            "configuracoes",
            configuracoes
        );


        res.json({

            success: true,

            configuracao

        });

    }
    catch (err) {

        console.error(
            "Erro ao criar configuração:",
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
// ATUALIZAR CONFIGURAÇÃO
// PUT /configuracoes/:id
// =====================================================

router.put("/:id", (req, res) => {

    try {

        const configuracoes =
            db.ler("configuracoes") || [];


        const index =
            configuracoes.findIndex(
                c =>
                    String(c.id) ===
                    String(req.params.id)
            );


        if (index === -1) {

            return res.status(404).json({

                success: false,

                error:
                    "Configuração não encontrada."

            });

        }


        const atual =
            configuracoes[index];


        const atualizada = {

            ...atual,

            ...req.body,


            vendaGB:
                req.body.vendaGB !== undefined
                    ? Number(req.body.vendaGB)
                    : atual.vendaGB,


            custoGB:
                req.body.custoGB !== undefined
                    ? Number(req.body.custoGB)
                    : atual.custoGB,


            atualizado:
                new Date().toISOString()

        };


        configuracoes[index] =
            atualizada;


        db.salvar(
            "configuracoes",
            configuracoes
        );


        res.json({

            success: true,

            configuracao:
                atualizada

        });

    }
    catch (err) {

        console.error(
            "Erro ao atualizar configuração:",
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
