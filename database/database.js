const fs = require("fs");
const path = require("path");


// ==========================================
// LER DADOS
// ==========================================

function ler(nome) {

    const arquivo =
        path.join(
            __dirname,
            `${nome}.json`
        );


    // Criar arquivo caso não exista

    if (!fs.existsSync(arquivo)) {

        fs.writeFileSync(
            arquivo,
            "[]",
            "utf8"
        );

    }


    try {

        return JSON.parse(
            fs.readFileSync(
                arquivo,
                "utf8"
            )
        );

    }
    catch (erro) {

        console.error(
            `Erro ao ler ${nome}.json:`,
            erro
        );

        return [];

    }

}


// ==========================================
// SALVAR DADOS
// ==========================================

function salvar(nome, dados) {

    const arquivo =
        path.join(
            __dirname,
            `${nome}.json`
        );


    try {

        fs.writeFileSync(

            arquivo,

            JSON.stringify(
                dados,
                null,
                4
            ),

            "utf8"

        );

    }
    catch (erro) {

        console.error(
            `Erro ao salvar ${nome}.json:`,
            erro
        );

        throw erro;

    }

}


// ==========================================
// EXPORTAR
// ==========================================

module.exports = {

    ler,

    salvar

};
