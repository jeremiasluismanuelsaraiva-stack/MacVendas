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
    "/dashboard",
    require("./dashboard")
);

app.use(
    "/vendas",
    require("./vendas")
);

app.use(
    "/clientes",
    require("./clientes")
);

app.use(
    "/grupos",
    require("./grupos")
);

app.use(
    "/pacotes",
    require("./pacotes")
);

app.use(
    "/pedidos",
    require("./pedidos")
);

app.use(
    "/dispositivos",
    require("./dispositivos")
);

app.use(
    "/configuracoes",
    require("./configuracoes")
);


// =====================================================
// STATUS DA API
// GET /
// =====================================================

app.get("/", (req, res) => {

    res.json({

        success: true,

        nome:
            "Sistema SSD API",

        versao:
            "1.0.0",

        status:
            "Online"

    });

});


// =====================================================
// ROTA NÃO ENCONTRADA
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
// ERRO GLOBAL
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


module.exports = app;
