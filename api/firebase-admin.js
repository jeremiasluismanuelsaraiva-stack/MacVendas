"use strict";

const fs = require("fs");
const path = require("path");

// =====================================================
// DIRETÓRIO DE DADOS
// =====================================================

const DATA_DIR =
    path.join(
        __dirname,
        "data"
    );

// =====================================================
// GARANTIR DIRETÓRIO
// =====================================================

function garantirDiretorio() {

    if (
        !fs.existsSync(
            DATA_DIR
        )
    ) {

        fs.mkdirSync(
            DATA_DIR,
            {
                recursive: true
            }
        );
    }
}

// =====================================================
// LER JSON
// =====================================================

function ler(nome) {

    garantirDiretorio();

    const arquivo =
        path.join(
            DATA_DIR,
            `${nome}.json`
        );

    // =================================================
    // CRIAR ARQUIVO SE NÃO EXISTIR
    // =================================================

    if (
        !fs.existsSync(
            arquivo
        )
    ) {

        fs.writeFileSync(
            arquivo,
            "[]",
            "utf8"
        );
    }

    try {

        const conteudo =
            fs.readFileSync(
                arquivo,
                "utf8"
            );

        if (
            !conteudo.trim()
        ) {

            return [];
        }

        return JSON.parse(
            conteudo
        );

    }
    catch (erro) {

        console.error(
            `[DB] Erro ao ler ${nome}.json:`,
            erro
        );

        return [];
    }
}

// =====================================================
// SALVAR JSON
// =====================================================

function salvar(
    nome,
    dados
) {

    garantirDiretorio();

    const arquivo =
        path.join(
            DATA_DIR,
            `${nome}.json`
        );

    fs.writeFileSync(
        arquivo,
        JSON.stringify(
            dados,
            null,
            2
        ),
        "utf8"
    );

    return true;
}

// =====================================================
// ADICIONAR REGISTRO
// =====================================================

function adicionar(
    nome,
    registro
) {

    const dados =
        ler(nome);

    const lista =
        Array.isArray(dados)
            ? dados
            : [];

    lista.push(
        registro
    );

    salvar(
        nome,
        lista
    );

    return registro;
}

// =====================================================
// ATUALIZAR REGISTRO
// =====================================================

function atualizar(
    nome,
    id,
    dadosAtualizados
) {

    const dados =
        ler(nome);

    if (
        !Array.isArray(dados)
    ) {

        return null;
    }

    const indice =
        dados.findIndex(
            item =>
                String(item.id) ===
                String(id)
        );

    if (
        indice === -1
    ) {

        return null;
    }

    dados[indice] = {

        ...dados[indice],

        ...dadosAtualizados,

        id:
            dados[indice].id
    };

    salvar(
        nome,
        dados
    );

    return dados[indice];
}

// =====================================================
// REMOVER REGISTRO
// =====================================================

function remover(
    nome,
    id
) {

    const dados =
        ler(nome);

    if (
        !Array.isArray(dados)
    ) {

        return false;
    }

    const novosDados =
        dados.filter(
            item =>
                String(item.id) !==
                String(id)
        );

    if (
        novosDados.length ===
        dados.length
    ) {

        return false;
    }

    salvar(
        nome,
        novosDados
    );

    return true;
}

// =====================================================
// EXPORTAR
// =====================================================
//
// Mantemos "db" para compatibilidade com arquivos antigos
// que ainda possam utilizar:
//
// const { db } = require("./firebase-admin");
//
// Porém agora "db" NÃO é Firebase.
// É apenas o banco JSON local.
//
// =====================================================

const db = {

    ler,

    salvar,

    adicionar,

    atualizar,

    remover
};

// =====================================================
// ADMIN COMPATIBILIDADE
// =====================================================
//
// Mantido somente para evitar erros em arquivos antigos
// que ainda façam:
//
// const { admin } = require("./firebase-admin");
//
// Não é Firebase Admin.
//
// =====================================================

const admin = {

    version:
        "JSON DATABASE"
};

// =====================================================
// APP COMPATIBILIDADE
// =====================================================

const app = {

    name:
        "macvendas-json"
};

// =====================================================
// EXPORTAR
// =====================================================

module.exports = {

    admin,

    app,

    db,

    ler,

    salvar,

    adicionar,

    atualizar,

    remover
};

