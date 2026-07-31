
const fs = require("fs");
const path = require("path");

function ler(nome) {
    const arquivo = path.join(__dirname, `${nome}.json`);

    if (!fs.existsSync(arquivo)) {
        fs.writeFileSync(arquivo, "[]");
    }

    return JSON.parse(fs.readFileSync(arquivo, "utf8"));
}

function salvar(nome, dados) {
    const arquivo = path.join(__dirname, `${nome}.json`);

    fs.writeFileSync(
        arquivo,
        JSON.stringify(dados, null, 4),
        "utf8"
    );
}

module.exports = {
    ler,
    salvar
};
