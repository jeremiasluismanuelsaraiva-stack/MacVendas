
const express = require("express");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

// ==============================
// MIDDLEWARES
// ==============================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==============================
// ARQUIVOS ESTÁTICOS
// ==============================
app.use(express.static(path.join(__dirname, "public")));

// ==============================
// PÁGINAS
// ==============================
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/dashboard", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "dashboard.html"));
});

// ==============================
// API
// ==============================
app.use("/dashboard-data", require("./api/dashboard"));
app.use("/vendas", require("./api/vendas"));
app.use("/clientes", require("./api/clientes"));
app.use("/pedidos", require("./api/pedidos"));
app.use("/dispositivos", require("./api/dispositivos"));

// ==============================
// 404
// ==============================
app.use((req, res) => {
    res.status(404).json({
        success: false,
        mensagem: "Página não encontrada."
    });
});

// ==============================
// ERRO
// ==============================
app.use((err, req, res, next) => {
    console.error(err);

    res.status(500).json({
        success: false,
        erro: err.message
    });
});

// ==============================
// INICIAR
// ==============================
app.listen(PORT, () => {

    console.log("==================================");
    console.log("🚀 SISTEMA SSD");
    console.log("==================================");
    console.log(`Página Inicial : http://localhost:${PORT}`);
    console.log(`Dashboard      : http://localhost:${PORT}/dashboard`);
    console.log(`Dashboard API  : http://localhost:${PORT}/dashboard-data`);
    console.log(`Vendas         : http://localhost:${PORT}/vendas`);
    console.log(`Clientes       : http://localhost:${PORT}/clientes`);
    console.log(`Pedidos        : http://localhost:${PORT}/pedidos`);
    console.log(`Dispositivos   : http://localhost:${PORT}/dispositivos`);
    console.log("==================================");

});
