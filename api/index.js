"use strict";

const express = require("express");
const cors = require("cors");

const autenticarAPI =
    require("./auth");

const app =
    express();


// =====================================================
// MIDDLEWARES
// =====================================================

app.use(
    cors()
);


app.use(
    express.json({
        limit: "50mb"
    })
);


app.use(
    express.urlencoded({
        extended: true
    })
);


// =====================================================
// TESTE DA API
// =====================================================

app.get(
    "/",
    (req, res) => {

        res.json({

            success: true,

            nome:
                "MOZ TECH API",

            versao:
                "1.0.0",

            status:
                "Online"

        });

    }
);


// =====================================================
// AUTENTICAÇÃO
// =====================================================
//
// Todas as rotas /api precisam de:
//
// x-uid
// x-api-key
//
// =====================================================

app.use(
    "/api",
    autenticarAPI
);


// =====================================================
// ROTAS
// =====================================================

app.use(
    "/api/dashboard",
    require("./dashboard")
);


app.use(
    "/api/vendas",
    require("./vendas")
);


app.use(
    "/api/clientes",
    require("./clientes")
);


app.use(
    "/api/pedidos",
    require("./pedidos")
);


app.use(
    "/api/dispositivos",
    require("./dispositivos")
);


app.use(
    "/api/pacotes",
    require("./pacotes")
);


app.use(
    "/api/grupos",
    require("./grupos")
);


app.use(
    "/api/configuracoes",
    require("./configuracoes")
);


app.use(
    "/api/relatorios",
    require("./relatorios")
);


// =====================================================
// 404
// =====================================================

app.use(
    (req, res) => {

        res.status(404).json({

            success: false,

            error:
                "Rota não encontrada.",

            rota:
                req.originalUrl

        });

    }
);


// =====================================================
// TRATAMENTO DE ERROS
// =====================================================

app.use(
    (err, req, res, next) => {

        console.error(
            "[API] Erro:",
            err
        );


        res.status(
            err.status || 500
        ).json({

            success: false,

            error:
                err.message ||
                "Erro interno do servidor."

        });

    }
);


// =====================================================
// EXPORTAR
// =====================================================

module.exports =
    app;
