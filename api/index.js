const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());

app.use(express.json({
    limit: "50mb"
}));

app.use(express.urlencoded({
    extended: true
}));

// ROTAS
app.use("/dashboard", require("./dashboard"));
app.use("/vendas", require("./vendas"));
app.use("/clientes", require("./clientes"));
app.use("/pedidos", require("./pedidos"));
app.use("/dispositivos", require("./dispositivos"));

// STATUS
app.get("/", (req, res) => {

    res.json({

        success: true,

        nome: "Sistema SSD API",

        versao: "1.0.0",

        status: "Online"

    });

});

// ROTA NÃO ENCONTRADA
app.use((req, res) => {

    res.status(404).json({

        success: false,

        error: "Rota não encontrada."

    });

});

module.exports = app;
