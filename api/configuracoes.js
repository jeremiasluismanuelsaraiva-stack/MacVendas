// =====================================================
// MOZ TECH
// CONFIGURAÇÕES + CREDENCIAIS DA API
// =====================================================

const express = require("express");
const crypto = require("crypto");

const router = express.Router();

const db = require("../database/database");


// =====================================================
// GERAR UID
// =====================================================

function gerarUID() {

    return (
        "MOZ-" +
        Date.now().toString(36).toUpperCase() +
        "-" +
        crypto
            .randomBytes(4)
            .toString("hex")
            .toUpperCase()
    );

}


// =====================================================
// GERAR API KEY
// =====================================================

function gerarApiKey() {

    return (
        "moz_" +
        crypto
            .randomBytes(32)
            .toString("hex")
    );

}


// =====================================================
// OBTER OU CRIAR CONFIGURAÇÃO
// =====================================================

function obterConfiguracao() {

    let configuracoes =
        db.ler("configuracoes") || [];


    // -------------------------------------------------
    // Garantir que seja um array
    // -------------------------------------------------

    if (!Array.isArray(configuracoes)) {

        configuracoes = [];

    }


    // =================================================
    // CONFIGURAÇÃO JÁ EXISTE
    // =================================================

    if (configuracoes.length > 0) {

        const configuracao =
            configuracoes[0];

        let alterou = false;


        // -------------------------------------------------
        // Garantir UID
        // -------------------------------------------------

        if (!configuracao.uid) {

            configuracao.uid =
                gerarUID();

            alterou = true;

        }


        // -------------------------------------------------
        // Garantir API KEY
        // -------------------------------------------------

        if (!configuracao.apiKey) {

            configuracao.apiKey =
                gerarApiKey();

            alterou = true;

        }


        // -------------------------------------------------
        // Corrigir nome antigo, caso exista
        // -------------------------------------------------

        if (
            !configuracao.nomeEmpresa ||
            configuracao.nomeEmpresa === "Sistema SSD"
        ) {

            configuracao.nomeEmpresa =
                "MOZ TECH";

            alterou = true;

        }


        // -------------------------------------------------
        // Remover USSD antigo
        // -------------------------------------------------

        if (
            Object.prototype.hasOwnProperty.call(
                configuracao,
                "ussd"
            )
        ) {

            delete configuracao.ussd;

            alterou = true;

        }


        // -------------------------------------------------
        // Valores padrão
        // -------------------------------------------------

        if (
            configuracao.moeda === undefined
        ) {

            configuracao.moeda =
                "MT";

            alterou = true;

        }


        if (
            configuracao.vendaGB === undefined
        ) {

            configuracao.vendaGB =
                28;

            alterou = true;

        }


        if (
            configuracao.custoGB === undefined
        ) {

            configuracao.custoGB =
                21;

            alterou = true;

        }


        if (
            configuracao.tema === undefined
        ) {

            configuracao.tema =
                "dark";

            alterou = true;

        }


        if (
            configuracao.idioma === undefined
        ) {

            configuracao.idioma =
                "pt";

            alterou = true;

        }


        // -------------------------------------------------
        // Salvar alterações
        // -------------------------------------------------

        if (alterou) {

            configuracao.atualizado =
                new Date().toISOString();


            db.salvar(
                "configuracoes",
                configuracoes
            );

        }


        return configuracao;

    }


    // =================================================
    // CRIAR PRIMEIRA CONFIGURAÇÃO
    // =================================================

    const configuracao = {

        id:
            Date.now().toString(),


        // -------------------------------------------------
        // CREDENCIAIS API
        // -------------------------------------------------

        uid:
            gerarUID(),

        apiKey:
            gerarApiKey(),


        // -------------------------------------------------
        // EMPRESA
        // -------------------------------------------------

        nomeEmpresa:
            "MOZ TECH",

        telefone:
            "",

        email:
            "",


        // -------------------------------------------------
        // MOEDA
        // -------------------------------------------------

        moeda:
            "MT",


        // -------------------------------------------------
        // VALORES
        // -------------------------------------------------

        vendaGB:
            28,

        custoGB:
            21,


        // -------------------------------------------------
        // TEMA
        // -------------------------------------------------

        tema:
            "dark",

        idioma:
            "pt",


        // -------------------------------------------------
        // DATA
        // -------------------------------------------------

        atualizado:
            new Date().toISOString()

    };


    configuracoes.push(
        configuracao
    );


    db.salvar(
        "configuracoes",
        configuracoes
    );


    return configuracao;

}


// =====================================================
// GET /configuracoes
// =====================================================
//
// Retorna:
// - UID
// - API Key
// - Dados da empresa
// - Valores
// - Configurações gerais
//
// =====================================================

router.get("/", (req, res) => {

    try {

        const configuracao =
            obterConfiguracao();


        res.json({

            success: true,

            configuracoes: [
                configuracao
            ]

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
                err.message ||
                "Erro ao carregar configurações."

        });

    }

});


// =====================================================
// GET /configuracoes/:id
// =====================================================

router.get("/:id", (req, res) => {

    try {

        const configuracoes =
            db.ler("configuracoes") || [];


        if (!Array.isArray(configuracoes)) {

            return res.status(404).json({

                success: false,

                error:
                    "Configurações não encontradas."

            });

        }


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


        let alterou = false;


        // -------------------------------------------------
        // Garantir UID
        // -------------------------------------------------

        if (!configuracao.uid) {

            configuracao.uid =
                gerarUID();

            alterou = true;

        }


        // -------------------------------------------------
        // Garantir API KEY
        // -------------------------------------------------

        if (!configuracao.apiKey) {

            configuracao.apiKey =
                gerarApiKey();

            alterou = true;

        }


        // -------------------------------------------------
        // Remover USSD antigo
        // -------------------------------------------------

        if (
            Object.prototype.hasOwnProperty.call(
                configuracao,
                "ussd"
            )
        ) {

            delete configuracao.ussd;

            alterou = true;

        }


        // -------------------------------------------------
        // Corrigir nome antigo
        // -------------------------------------------------

        if (
            configuracao.nomeEmpresa ===
            "Sistema SSD"
        ) {

            configuracao.nomeEmpresa =
                "MOZ TECH";

            alterou = true;

        }


        // -------------------------------------------------
        // Salvar se necessário
        // -------------------------------------------------

        if (alterou) {

            configuracao.atualizado =
                new Date().toISOString();


            db.salvar(
                "configuracoes",
                configuracoes
            );

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
                err.message ||
                "Erro ao buscar configuração."

        });

    }

});


// =====================================================
// POST /configuracoes
// =====================================================
//
// Criar/substituir configuração
//
// =====================================================

router.post("/", (req, res) => {

    try {

        let configuracoes =
            db.ler("configuracoes") || [];


        if (!Array.isArray(configuracoes)) {

            configuracoes = [];

        }


        // -------------------------------------------------
        // CREDENCIAIS
        // -------------------------------------------------

        const uid =
            req.body.uid ||
            gerarUID();


        const apiKey =
            req.body.apiKey ||
            gerarApiKey();


        // -------------------------------------------------
        // NOVA CONFIGURAÇÃO
        // -------------------------------------------------

        const configuracao = {

            id:
                Date.now().toString(),


            // =================================================
            // CREDENCIAIS API
            // =================================================

            uid:
                uid,

            apiKey:
                apiKey,


            // =================================================
            // EMPRESA
            // =================================================

            nomeEmpresa:
                req.body.nomeEmpresa ||
                "MOZ TECH",

            telefone:
                req.body.telefone ||
                "",

            email:
                req.body.email ||
                "",


            // =================================================
            // MOEDA
            // =================================================

            moeda:
                req.body.moeda ||
                "MT",


            // =================================================
            // VALORES
            // =================================================

            vendaGB:
                Number(
                    req.body.vendaGB !== undefined
                        ? req.body.vendaGB
                        : 28
                ),

            custoGB:
                Number(
                    req.body.custoGB !== undefined
                        ? req.body.custoGB
                        : 21
                ),


            // =================================================
            // TEMA
            // =================================================

            tema:
                req.body.tema ||
                "dark",

            idioma:
                req.body.idioma ||
                "pt",


            // =================================================
            // DATA
            // =================================================

            atualizado:
                new Date().toISOString()

        };


        // -------------------------------------------------
        // MANTER APENAS UMA CONFIGURAÇÃO
        // -------------------------------------------------

        configuracoes.length = 0;

        configuracoes.push(
            configuracao
        );


        // -------------------------------------------------
        // SALVAR
        // -------------------------------------------------

        db.salvar(
            "configuracoes",
            configuracoes
        );


        // -------------------------------------------------
        // RESPOSTA
        // -------------------------------------------------

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
                err.message ||
                "Erro ao criar configuração."

        });

    }

});


// =====================================================
// PUT /configuracoes/:id
// =====================================================
//
// Atualizar configuração
//
// =====================================================

router.put("/:id", (req, res) => {

    try {

        let configuracoes =
            db.ler("configuracoes") || [];


        if (!Array.isArray(configuracoes)) {

            configuracoes = [];

        }


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


        // -------------------------------------------------
        // Atualizar
        // -------------------------------------------------

        const atualizada = {

            ...atual,

            ...req.body,


            // -------------------------------------------------
            // Nunca perder UID
            // -------------------------------------------------

            uid:
                atual.uid ||
                gerarUID(),


            // -------------------------------------------------
            // Nunca perder API KEY
            // -------------------------------------------------

            apiKey:
                atual.apiKey ||
                gerarApiKey(),


            // -------------------------------------------------
            // Nome da empresa
            // -------------------------------------------------

            nomeEmpresa:
                req.body.nomeEmpresa ||
                atual.nomeEmpresa ||
                "MOZ TECH",


            // -------------------------------------------------
            // Venda por GB
            // -------------------------------------------------

            vendaGB:
                req.body.vendaGB !== undefined
                    ? Number(
                        req.body.vendaGB
                    )
                    : atual.vendaGB,


            // -------------------------------------------------
            // Custo por GB
            // -------------------------------------------------

            custoGB:
                req.body.custoGB !== undefined
                    ? Number(
                        req.body.custoGB
                    )
                    : atual.custoGB,


            // -------------------------------------------------
            // Data
            // -------------------------------------------------

            atualizado:
                new Date().toISOString()

        };


        // -------------------------------------------------
        // Remover USSD caso venha no body
        // -------------------------------------------------

        delete atualizada.ussd;


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
                err.message ||
                "Erro ao atualizar configuração."

        });

    }

});


// =====================================================
// POST /configuracoes/regenerar-api-key
// =====================================================
//
// Gera uma nova API Key.
//
// A API Key anterior deixa de funcionar.
//
// =====================================================

router.post(
    "/regenerar-api-key",
    (req, res) => {

        try {

            const configuracao =
                obterConfiguracao();


            const configuracoes =
                db.ler("configuracoes") || [];


            configuracao.apiKey =
                gerarApiKey();


            configuracao.atualizado =
                new Date().toISOString();


            // -------------------------------------------------
            // Procurar configuração
            // -------------------------------------------------

            const index =
                configuracoes.findIndex(
                    c =>
                        String(c.id) ===
                        String(configuracao.id)
                );


            if (index >= 0) {

                configuracoes[index] =
                    configuracao;

            }
            else {

                configuracoes.length = 0;

                configuracoes.push(
                    configuracao
                );

            }


            // -------------------------------------------------
            // Salvar
            // -------------------------------------------------

            db.salvar(
                "configuracoes",
                configuracoes
            );


            // -------------------------------------------------
            // Resposta
            // -------------------------------------------------

            res.json({

                success: true,

                message:
                    "API Key regenerada com sucesso.",

                uid:
                    configuracao.uid,

                apiKey:
                    configuracao.apiKey

            });

        }
        catch (err) {

            console.error(
                "Erro ao regenerar API Key:",
                err
            );


            res.status(500).json({

                success: false,

                error:
                    err.message ||
                    "Erro ao regenerar API Key."

            });

        }

    }
);


// =====================================================
// EXPORTAR
// =====================================================

module.exports = router;
