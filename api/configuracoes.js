"use strict";

const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();
const autenticarAPI = require("./auth");

// =====================================================
// ARQUIVO DE CONFIGURAÇÕES
// =====================================================

const DATA_DIR = path.join(__dirname, "data");
const ARQUIVO = path.join(DATA_DIR, "configuracoes.json");

// =====================================================
// GARANTIR DIRETÓRIO E ARQUIVO
// =====================================================

function garantirArquivo() {

    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, {
            recursive: true
        });
    }

    if (!fs.existsSync(ARQUIVO)) {
        fs.writeFileSync(
            ARQUIVO,
            JSON.stringify([], null, 2),
            "utf8"
        );
    }
}

// =====================================================
// LER CONFIGURAÇÕES
// =====================================================

function lerConfiguracoes() {

    garantirArquivo();

    try {

        const conteudo =
            fs.readFileSync(
                ARQUIVO,
                "utf8"
            );

        if (!conteudo.trim()) {
            return [];
        }

        const dados =
            JSON.parse(conteudo);

        return Array.isArray(dados)
            ? dados
            : [];

    } catch (erro) {

        console.error(
            "[CONFIGURAÇÕES] Erro ao ler arquivo:",
            erro
        );

        return [];
    }
}

// =====================================================
// SALVAR CONFIGURAÇÕES
// =====================================================

function salvarConfiguracoes(configuracoes) {

    garantirArquivo();

    fs.writeFileSync(
        ARQUIVO,
        JSON.stringify(
            configuracoes,
            null,
            2
        ),
        "utf8"
    );
}

// =====================================================
// VALOR NUMÉRICO
// =====================================================

function numero(valor) {

    const n = Number(valor);

    return Number.isFinite(n)
        ? n
        : 0;
}

// =====================================================
// DATA ATUAL
// =====================================================

function agora() {

    return new Date().toISOString();
}

// =====================================================
// CONFIGURAÇÃO PADRÃO
// =====================================================

function configuracaoPadrao(uid, usuario) {

    const data = agora();

    return {

        // =================================================
        // IDENTIFICAÇÃO
        // =================================================

        uid: uid,

        apiKey:
            usuario.apiKey || "",

        // =================================================
        // EMPRESA
        // =================================================

        nomeEmpresa:
            usuario.fullName ||
            usuario.nome ||
            "MACVENDAS",

        telefone:
            "",

        email:
            usuario.email ||
            "",

        // =================================================
        // MOEDA
        // =================================================

        moeda:
            "MT",

        // =================================================
        // VALORES
        // =================================================

        vendaGB:
            28,

        custoGB:
            21,

        // =================================================
        // TEMA
        // =================================================

        tema:
            "dark",

        // =================================================
        // IDIOMA
        // =================================================

        idioma:
            "pt",

        // =================================================
        // TERMINAL / SERVIDOR
        // =================================================

        terminal: {

            ativo:
                false,

            api:
                "",

            endpoint:
                "",

            metodo:
                "POST",

            token:
                ""
        },

        // =================================================
        // DATAS
        // =================================================

        criadoEm:
            data,

        atualizado:
            data
    };
}

// =====================================================
// NORMALIZAR CONFIGURAÇÃO DO TERMINAL
// =====================================================

function normalizarTerminal(terminal) {

    terminal =
        terminal &&
        typeof terminal === "object"
            ? terminal
            : {};

    const metodosPermitidos = [
        "GET",
        "POST",
        "PUT",
        "PATCH",
        "DELETE"
    ];

    let metodo =
        String(
            terminal.metodo ||
            "POST"
        )
            .trim()
            .toUpperCase();

    if (!metodosPermitidos.includes(metodo)) {
        metodo = "POST";
    }

    return {

        ativo:
            terminal.ativo === true,

        api:
            String(
                terminal.api || ""
            ).trim(),

        endpoint:
            String(
                terminal.endpoint || ""
            ).trim(),

        metodo:
            metodo,

        token:
            String(
                terminal.token || ""
            ).trim()
    };
}

// =====================================================
// NORMALIZAR CONFIGURAÇÃO COMPLETA
// =====================================================

function normalizarConfiguracao(
    configuracao,
    uid,
    usuario
) {

    configuracao =
        configuracao &&
        typeof configuracao === "object"
            ? configuracao
            : {};

    const resultado = {

        ...configuracao,

        // =================================================
        // IDENTIFICAÇÃO
        // =================================================

        uid:
            uid,

        apiKey:
            usuario.apiKey ||
            configuracao.apiKey ||
            "",

        // =================================================
        // EMPRESA
        // =================================================

        nomeEmpresa:
            configuracao.nomeEmpresa !== undefined
                ? configuracao.nomeEmpresa
                : (
                    usuario.fullName ||
                    usuario.nome ||
                    "MACVENDAS"
                ),

        telefone:
            configuracao.telefone !== undefined
                ? configuracao.telefone
                : "",

        email:
            configuracao.email !== undefined
                ? configuracao.email
                : (
                    usuario.email ||
                    ""
                ),

        // =================================================
        // MOEDA
        // =================================================

        moeda:
            configuracao.moeda !== undefined
                ? configuracao.moeda
                : "MT",

        // =================================================
        // VENDA POR GB
        // =================================================

        vendaGB:
            configuracao.vendaGB !== undefined
                ? numero(configuracao.vendaGB)
                : 28,

        // =================================================
        // CUSTO POR GB
        // =================================================

        custoGB:
            configuracao.custoGB !== undefined
                ? numero(configuracao.custoGB)
                : 21,

        // =================================================
        // TEMA
        // =================================================

        tema:
            configuracao.tema ||
            "dark",

        // =================================================
        // IDIOMA
        // =================================================

        idioma:
            configuracao.idioma ||
            "pt",

        // =================================================
        // TERMINAL
        // =================================================

        terminal:
            normalizarTerminal(
                configuracao.terminal
            ),

        // =================================================
        // DATAS
        // =================================================

        criadoEm:
            configuracao.criadoEm ||
            agora(),

        atualizado:
            agora()
    };

    // =================================================
    // REMOVER CONFIGURAÇÃO USSD ANTIGA
    // =================================================

    delete resultado.ussd;

    // =================================================
    // REMOVER CAMPOS ANTIGOS DO TERMINAL
    // =================================================

    if (resultado.terminal) {

        delete resultado.terminal.host;

        delete resultado.terminal.porta;

        delete resultado.terminal.protocolo;
    }

    return resultado;
}

// =====================================================
// ENCONTRAR CONFIGURAÇÃO DO USUÁRIO
// =====================================================

function encontrarConfiguracao(
    configuracoes,
    uid
) {

    return configuracoes.find(
        item =>
            item &&
            String(item.uid) === String(uid)
    );
}

// =====================================================
// GET /api/configuracoes
// =====================================================

router.get(
    "/",
    autenticarAPI,
    async function (req, res) {

        try {

            const uid =
                req.usuario?.uid;

            if (!uid) {

                return res.status(401).json({

                    success: false,

                    error:
                        "Usuário não autenticado."
                });
            }

            console.log(
                "[CONFIGURAÇÕES] GET:",
                uid
            );

            const configuracoes =
                lerConfiguracoes();

            let configuracao =
                encontrarConfiguracao(
                    configuracoes,
                    uid
                );

            // =================================================
            // SE NÃO EXISTIR, CRIAR PADRÃO
            // =================================================

            if (!configuracao) {

                configuracao =
                    configuracaoPadrao(
                        uid,
                        req.usuario
                    );

                configuracoes.push(
                    configuracao
                );

                salvarConfiguracoes(
                    configuracoes
                );

                console.log(
                    "[CONFIGURAÇÕES] Configuração padrão criada:",
                    uid
                );

                return res.json({

                    success: true,

                    configuracao:
                        configuracao
                });
            }

            // =================================================
            // NORMALIZAR
            // =================================================

            configuracao =
                normalizarConfiguracao(
                    configuracao,
                    uid,
                    req.usuario
                );

            // =================================================
            // ATUALIZAR NO ARRAY
            // =================================================

            const indice =
                configuracoes.findIndex(
                    item =>
                        item &&
                        String(item.uid) ===
                            String(uid)
                );

            if (indice !== -1) {

                configuracoes[indice] =
                    configuracao;

                salvarConfiguracoes(
                    configuracoes
                );
            }

            console.log(
                "[CONFIGURAÇÕES] Configuração carregada:",
                uid
            );

            return res.json({

                success: true,

                configuracao:
                    configuracao
            });

        } catch (erro) {

            console.error(
                "[CONFIGURAÇÕES GET] Erro:",
                erro
            );

            return res.status(500).json({

                success: false,

                error:
                    "Erro ao carregar configurações."
            });
        }
    }
);

// =====================================================
// PUT /api/configuracoes
// =====================================================

router.put(
    "/",
    autenticarAPI,
    async function (req, res) {

        try {

            const uid =
                req.usuario?.uid;

            if (!uid) {

                return res.status(401).json({

                    success: false,

                    error:
                        "Usuário não autenticado."
                });
            }

            console.log(
                "[CONFIGURAÇÕES] PUT:",
                uid
            );

            const configuracoes =
                lerConfiguracoes();

            // =================================================
            // BUSCAR CONFIGURAÇÃO ATUAL
            // =================================================

            let atual =
                encontrarConfiguracao(
                    configuracoes,
                    uid
                );

            if (!atual) {

                atual =
                    configuracaoPadrao(
                        uid,
                        req.usuario
                    );
            }

            // =================================================
            // CONFIGURAÇÃO RECEBIDA
            // =================================================

            const terminalRecebido =
                req.body?.terminal || {};

            // =================================================
            // CONFIGURAÇÃO ATUAL DO TERMINAL
            // =================================================

            const terminalAtual =
                normalizarTerminal(
                    atual.terminal
                );

            // =================================================
            // NOVO TERMINAL
            // =================================================

            const terminal = {

                ativo:
                    terminalRecebido.ativo === true,

                api:
                    String(
                        terminalRecebido.api ??
                        terminalAtual.api ??
                        ""
                    ).trim(),

                endpoint:
                    String(
                        terminalRecebido.endpoint ??
                        terminalAtual.endpoint ??
                        ""
                    ).trim(),

                metodo:
                    String(
                        terminalRecebido.metodo ??
                        terminalAtual.metodo ??
                        "POST"
                    )
                        .trim()
                        .toUpperCase(),

                token:
                    String(
                        terminalRecebido.token ??
                        terminalAtual.token ??
                        ""
                    ).trim()
            };

            // =================================================
            // VALIDAR MÉTODO
            // =================================================

            const metodosPermitidos = [
                "GET",
                "POST",
                "PUT",
                "PATCH",
                "DELETE"
            ];

            if (
                !metodosPermitidos.includes(
                    terminal.metodo
                )
            ) {

                terminal.metodo =
                    "POST";
            }

            // =================================================
            // NOVA CONFIGURAÇÃO
            // =================================================

            const configuracao = {

                ...atual,

                // =================================================
                // IDENTIFICAÇÃO
                // =================================================

                uid:
                    uid,

                apiKey:
                    req.usuario.apiKey ||
                    atual.apiKey ||
                    "",

                // =================================================
                // EMPRESA
                // =================================================

                nomeEmpresa:
                    req.body.nomeEmpresa ??
                    atual.nomeEmpresa ??
                    req.usuario.fullName ??
                    req.usuario.nome ??
                    "MACVENDAS",

                telefone:
                    req.body.telefone ??
                    atual.telefone ??
                    "",

                email:
                    req.body.email ??
                    atual.email ??
                    req.usuario.email ??
                    "",

                // =================================================
                // MOEDA
                // =================================================

                moeda:
                    req.body.moeda ??
                    atual.moeda ??
                    "MT",

                // =================================================
                // VENDA POR GB
                // =================================================

                vendaGB:
                    req.body.vendaGB !== undefined
                        ? numero(
                            req.body.vendaGB
                        )
                        : numero(
                            atual.vendaGB ??
                            28
                        ),

                // =================================================
                // CUSTO POR GB
                // =================================================

                custoGB:
                    req.body.custoGB !== undefined
                        ? numero(
                            req.body.custoGB
                        )
                        : numero(
                            atual.custoGB ??
                            21
                        ),

                // =================================================
                // TEMA
                // =================================================

                tema:
                    req.body.tema ??
                    atual.tema ??
                    "dark",

                // =================================================
                // IDIOMA
                // =================================================

                idioma:
                    req.body.idioma ??
                    atual.idioma ??
                    "pt",

                // =================================================
                // TERMINAL
                // =================================================

                terminal:
                    terminal,

                // =================================================
                // DATAS
                // =================================================

                criadoEm:
                    atual.criadoEm ||
                    agora(),

                atualizado:
                    agora()
            };

            // =================================================
            // REMOVER USSD ANTIGO
            // =================================================

            delete configuracao.ussd;

            // =================================================
            // REMOVER CAMPOS ANTIGOS DO TERMINAL
            // =================================================

            delete configuracao.terminal.host;

            delete configuracao.terminal.porta;

            delete configuracao.terminal.protocolo;

            // =================================================
            // SALVAR NO JSON
            // =================================================

            const indice =
                configuracoes.findIndex(
                    item =>
                        item &&
                        String(item.uid) ===
                            String(uid)
                );

            if (indice === -1) {

                configuracoes.push(
                    configuracao
                );

            } else {

                configuracoes[indice] =
                    configuracao;
            }

            salvarConfiguracoes(
                configuracoes
            );

            console.log(
                "[CONFIGURAÇÕES] Configuração atualizada:",
                uid
            );

            // =================================================
            // RESPOSTA
            // =================================================

            return res.json({

                success: true,

                message:
                    "Configurações atualizadas com sucesso.",

                configuracao:
                    configuracao
            });

        } catch (erro) {

            console.error(
                "[CONFIGURAÇÕES PUT] Erro:",
                erro
            );

            return res.status(500).json({

                success: false,

                error:
                    "Erro ao atualizar configurações."
            });
        }
    }
);

// =====================================================
// GET /api/configuracoes/:id
// =====================================================
//
// Mantido para compatibilidade.
//
// O ID recebido na URL NÃO é utilizado para acessar
// outro usuário.
//
// A configuração pertence sempre ao usuário autenticado.
//
// =====================================================

router.get(
    "/:id",
    autenticarAPI,
    async function (req, res) {

        try {

            const uid =
                req.usuario?.uid;

            if (!uid) {

                return res.status(401).json({

                    success: false,

                    error:
                        "Usuário não autenticado."
                });
            }

            // =================================================
            // BUSCAR CONFIGURAÇÃO
            // =================================================

            const configuracoes =
                lerConfiguracoes();

            const configuracaoAtual =
                encontrarConfiguracao(
                    configuracoes,
                    uid
                );

            // =================================================
            // NÃO ENCONTRADA
            // =================================================

            if (!configuracaoAtual) {

                return res.status(404).json({

                    success: false,

                    error:
                        "Configuração não encontrada."
                });
            }

            // =================================================
            // NORMALIZAR
            // =================================================

            const configuracao =
                normalizarConfiguracao(
                    configuracaoAtual,
                    uid,
                    req.usuario
                );

            // =================================================
            // SALVAR CORREÇÕES
            // =================================================

            const indice =
                configuracoes.findIndex(
                    item =>
                        item &&
                        String(item.uid) ===
                            String(uid)
                );

            if (indice !== -1) {

                configuracoes[indice] =
                    configuracao;

                salvarConfiguracoes(
                    configuracoes
                );
            }

            // =================================================
            // RESPOSTA
            // =================================================

            return res.json({

                success: true,

                configuracao:
                    configuracao
            });

        } catch (erro) {

            console.error(
                "[CONFIGURAÇÃO ID] Erro:",
                erro
            );

            return res.status(500).json({

                success: false,

                error:
                    "Erro ao buscar configuração."
            });
        }
    }
);

// =====================================================
// REGENERAR API KEY
// =====================================================

router.post(
    "/regenerar-api-key",
    autenticarAPI,
    async function (req, res) {

        return res.status(403).json({

            success: false,

            error:
                "A regeneração da API Key deve ser feita pelo sistema de autenticação do usuário."
        });
    }
);

// =====================================================
// EXPORTAR
// =====================================================

module.exports =
    router;

