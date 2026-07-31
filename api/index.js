

const express = require("express");
const cors = require("cors");
const db = require("./database");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("./"));

app.get("/dashboard", (req, res) => {
    res.json(db.dashboard());
});

app.get("/vendas", (req, res) => {
    res.json(db.vendas());
});

const PORT = 3000;

app.listen(PORT, () => {
    console.log("Painel iniciado");
});
