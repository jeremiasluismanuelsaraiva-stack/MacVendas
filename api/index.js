"use strict";

const fs = require("fs");
const path = require("path");

/*
|--------------------------------------------------------------------------
| CONFIGURAÇÃO DO ARMAZENAMENTO
|--------------------------------------------------------------------------
| Todos os dados ficam na pasta:
|
| backend/
| └── data/
|     ├── usuarios.json
|     ├── compras.json
|     ├── clientes.json
|     ├── grupos.json
|     ├── pacotes.json
|     ├── pedidos.json
|     ├── dispositivos.json
|     └── configuracoes.json
|
| Este arquivo substitui completamente o Firebase Admin.
|--------------------------------------------------------------------------
*/

const DATA_DIR = path.join(__dirname, "data");

/**
 * Garante que a pasta data exista.
 */
function garantirPasta() {
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, {
            recursive: true
        });
    }
}

/**
 * Retorna o caminho de um arquivo JSON.
 */
function caminhoArquivo(nome) {
    garantirPasta();

    return path.join(
        DATA_DIR,
        `${nome}.json`
    );
}

/**
 * Lê um arquivo JSON.
 *
 * Se o arquivo não existir:
 * - cria o arquivo
 * - retorna []
 */
function ler(nome) {
    const arquivo = caminhoArquivo(nome);

    try {
        if (!fs.existsSync(arquivo)) {
            fs.writeFileSync(
                arquivo,
                "[]",
                "utf8"
            );

            return [];
        }

        const conteudo = fs.readFileSync(
            arquivo,
            "utf8"
        ).trim();

        if (!conteudo) {
            return [];
        }

        return JSON.parse(conteudo);

    } catch (erro) {
        console.error(
            `Erro ao ler ${nome}.json:`,
            erro
        );

        return [];
    }
}

/**
 * Salva dados no arquivo JSON.
 */
function salvar(nome, dados) {
    const arquivo = caminhoArquivo(nome);

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

        return true;

    } catch (erro) {
        console.error(
            `Erro ao salvar ${nome}.json:`,
            erro
        );

        throw erro;
    }
}

/**
 * Adiciona um registro.
 */
function adicionar(nome, registro) {
    const dados = ler(nome);

    dados.push(registro);

    salvar(
        nome,
        dados
    );

    return registro;
}

/**
 * Atualiza um registro pelo ID.
 */
function atualizar(nome, id, novosDados) {
    const dados = ler(nome);

    const indice = dados.findIndex(
        item => String(item.id) === String(id)
    );

    if (indice === -1) {
        return null;
    }

    dados[indice] = {
        ...dados[indice],
        ...novosDados
    };

    salvar(
        nome,
        dados
    );

    return dados[indice];
}

/**
 * Remove um registro pelo ID.
 */
function remover(nome, id) {
    const dados = ler(nome);

    const novosDados = dados.filter(
        item => String(item.id) !== String(id)
    );

    if (novosDados.length === dados.length) {
        return false;
    }

    salvar(
        nome,
        novosDados
    );

    return true;
}

/**
 * Verifica se um arquivo existe.
 */
function existe(nome) {
    return fs.existsSync(
        caminhoArquivo(nome)
    );
}

/**
 * Retorna o caminho completo do arquivo.
 */
function caminho(nome) {
    return caminhoArquivo(nome);
}

/*
|--------------------------------------------------------------------------
| COMPATIBILIDADE
|--------------------------------------------------------------------------
| Mantemos os nomes "admin", "app" e "db" para que outros arquivos
| antigos do projeto não quebrem imediatamente.
|
| IMPORTANTE:
| Isto NÃO é Firebase.
| É apenas uma camada de compatibilidade usando JSON.
|--------------------------------------------------------------------------
*/

const admin = {
    version: "JSON DATABASE"
};

const app = {
    name: "macvendas-json",
    storage: DATA_DIR
};

const db = {
    ler,
    salvar,
    adicionar,
    atualizar,
    remover,
    existe,
    caminho
};

/*
|--------------------------------------------------------------------------
| EXPORTAÇÃO
|--------------------------------------------------------------------------
*/

module.exports = {
    admin,
    app,
    db,

    // Também exportamos diretamente as funções
    // para arquivos novos.
    ler,
    salvar,
    adicionar,
    atualizar,
    remover,
    existe,
    caminho
};
