const express = require("express");
const cors = require("cors");

const app = express();


// =====================================================
// MIDDLEWARES
// =====================================================

app.use(cors());

app.use(express.json({
    limit: "50mb"
}));

app.use(express.urlencoded({
    extended: true
}));


// =====================================================
// ROTAS DA API
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
// TESTE DA API
// GET /
// =====================================================

app.get("/", (req, res) => {

    res.json({

        success: true,

        nome: "MOZ TECH API",

        versao: "1.0.0",

        status: "Online"

    });

});


// =====================================================
// TESTE DA API
// GET /api
// =====================================================

app.get("/api", (req, res) => {

    res.json({

        success: true,

        nome: "MOZ TECH API",

        versao: "1.0.0",

        status: "Online",

        rotas: {

            dashboard:
                "/api/dashboard",

            vendas:
                "/api/vendas",

            clientes:
                "/api/clientes",

            pedidos:
                "/api/pedidos",

            dispositivos:
                "/api/dispositivos",

            pacotes:
                "/api/pacotes",

            grupos:
                "/api/grupos",

            configuracoes:
                "/api/configuracoes",

            relatorios:
                "/api/relatorios"

        }

    });

});


// =====================================================
// 404
// =====================================================

app.use((req, res) => {

    res.status(404).json({

        success: false,

        error:
            "Rota não encontrada.",

        rota:
            req.originalUrl

    });

});


// =====================================================
// ERROS
// =====================================================

app.use((err, req, res, next) => {

    console.error(
        "Erro na API:",
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

});


// =====================================================
// EXPORTAR
// =====================================================

module.exports = app;
