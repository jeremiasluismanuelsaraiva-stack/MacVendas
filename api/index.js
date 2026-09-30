"use strict";

const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const http = require("http");
const WebSocket = require("ws");

// =====================================================
// CONFIGURAÇÃO
// =====================================================

const app = express();

const PORT = 4234;

const API_URL =
    "http://br1.bronxyshost.com:4234";

// =====================================================
// WEBSOCKET — ATUALIZAÇÃO DE VENDAS EM TEMPO REAL
// =====================================================
//
// O navegador envia a API Key na query string porque a API nativa
// WebSocket não permite definir headers HTTP personalizados durante
// o handshake.
//
// Endpoint:
//   ws://br1.bronxyshost.com:4234/vendas/ws?apiKey=...
//
// Se o servidor estiver atrás de HTTPS/TLS, use:
//   wss://br1.bronxyshost.com:4234/vendas/ws?apiKey=...
//

const clientesWebSocketVendas = new Map();

function obterApiKeyWebSocket(request) {
    try {
        const url = new URL(
            request.url || "",
            `http://${request.headers.host || "localhost"}`
        );

        return String(
            url.searchParams.get("apiKey") ||
            url.searchParams.get("api_key") ||
            ""
        ).trim();
    } catch (_) {
        return "";
    }
}

function registrarClienteWebSocketVendas(uid, socket) {
    const chave = String(uid);

    if (!clientesWebSocketVendas.has(chave)) {
        clientesWebSocketVendas.set(chave, new Set());
    }

    const clientes = clientesWebSocketVendas.get(chave);
    clientes.add(socket);

    const remover = () => {
        clientes.delete(socket);

        if (clientes.size === 0) {
            clientesWebSocketVendas.delete(chave);
        }
    };

    socket.once("close", remover);
    socket.once("error", remover);

    return remover;
}

function enviarEventoVendas(uid, dados = {}) {
    const clientes =
        clientesWebSocketVendas.get(String(uid));

    if (!clientes || clientes.size === 0) {
        return;
    }

    const payload = JSON.stringify({
        tipo: "vendas",
        ...dados,
        enviadoEm: agora()
    });

    for (const socket of clientes) {
        try {
            if (socket.readyState === WebSocket.OPEN) {
                socket.send(payload);
            } else {
                clientes.delete(socket);
            }
        } catch (_) {
            clientes.delete(socket);
        }
    }
}

function enviarEventoTodos(uid, tipo, dados = {}) {
    const clientes =
        clientesWebSocketVendas.get(String(uid));

    if (!clientes || clientes.size === 0) {
        return;
    }

    const payload = JSON.stringify({
        tipo,
        ...dados,
        enviadoEm: agora()
    });

    for (const socket of clientes) {
        try {
            if (socket.readyState === WebSocket.OPEN) {
                socket.send(payload);
            }
        } catch (_) {
            clientes.delete(socket);
        }
    }
}

// =====================================================
// MIDDLEWARE
// =====================================================

app.use(
    cors({
        origin: "*",
        methods: [
            "GET",
            "POST",
            "PUT",
            "PATCH",
            "DELETE",
            "OPTIONS"
        ],
        allowedHeaders: [
            "Content-Type",
            "Authorization",
            "x-api-key"
        ]
    })
);

app.use(
    express.json({
        limit: "10mb"
    })
);

app.use(
    express.urlencoded({
        extended: true
    })
);

/*
 * =====================================================
 * LOGS DE PEDIDOS / ALTERAÇÕES
 * =====================================================
 */

app.use((req, res, next) => {
    const inicio = Date.now();

    res.on("finish", () => {
        if (
            req.path === "/pedidos" ||
            req.path.startsWith("/pedidos/")
        ) {
            const metodo = req.method;

            if (metodo === "POST") {
                const body = req.body || {};

                console.log("");
                console.log("════════════════════════════════════════");
                console.log("📥 [API PEDIDO RECEBIDO]");
                console.log("🆕 NOVO PEDIDO");
                console.log("ID:", body.id || "(será gerado pela API)");
                console.log("Estado:", body.status || "pendente");
                console.log("Número:", body.numero || "");
                console.log("Pacote:", body.pacote || "");
                console.log("Valor:", body.valor || 0);
                console.log("HTTP:", res.statusCode);
                console.log("════════════════════════════════════════");
            }

            if (metodo === "PUT") {
                const body = req.body || {};

                console.log("");
                console.log("════════════════════════════════════════");
                console.log("📝 [API ALTERAÇÃO DE PEDIDO]");
                console.log("ID:", req.params.id);
                console.log("Novo estado:", body.status || "(não alterado)");
                console.log("HTTP:", res.statusCode);
                console.log("════════════════════════════════════════");
            }

            if (metodo === "GET") {
                console.log(
                    "🔎 [API PEDIDOS] Consulta realizada | HTTP:",
                    res.statusCode,
                    "| Tempo:",
                    Date.now() - inicio + "ms"
                );
            }

            if (metodo === "DELETE") {
                console.log(
                    "🗑️ [API PEDIDO] Pedido removido:",
                    req.params.id,
                    "| HTTP:",
                    res.statusCode
                );
            }
        }
    });

    next();
});

// =====================================================
// PASTA DE DADOS
// =====================================================

const DATA_DIR =
    path.join(__dirname, "data");

if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, {
        recursive: true
    });
}

// =====================================================
// ARQUIVOS
// =====================================================

const arquivos = {
    usuarios: path.join(
        DATA_DIR,
        "usuarios.json"
    ),

    compras: path.join(
        DATA_DIR,
        "compras.json"
    ),

    clientes: path.join(
        DATA_DIR,
        "clientes.json"
    ),

    grupos: path.join(
        DATA_DIR,
        "grupos.json"
    ),

    pacotes: path.join(
        DATA_DIR,
        "pacotes.json"
    ),

    configuracoes: path.join(
        DATA_DIR,
        "configuracoes.json"
    ),

    dispositivos: path.join(
        DATA_DIR,
        "dispositivos.json"
    ),

    pedidos: path.join(
        DATA_DIR,
        "pedidos.json"
    )
};

// =====================================================
// CRIAR ARQUIVOS
// =====================================================

function garantirArquivo(
    arquivo
) {

    if (!fs.existsSync(arquivo)) {

        fs.writeFileSync(
            arquivo,
            "[]",
            "utf8"
        );

    }
}

Object.values(arquivos).forEach(
    garantirArquivo
);

// =====================================================
// BANCO JSON
// =====================================================

function ler(nome) {

    const arquivo =
        arquivos[nome];

    try {

        const conteudo =
            fs.readFileSync(
                arquivo,
                "utf8"
            );

        if (!conteudo.trim()) {
            return [];
        }

        return JSON.parse(
            conteudo
        );

    }
    catch (erro) {

        console.error(
            `[DB] Erro ao ler ${nome}:`,
            erro
        );

        return [];
    }
}

function salvar(
    nome,
    dados
) {

    const arquivo =
        arquivos[nome];

    fs.writeFileSync(
        arquivo,
        JSON.stringify(
            dados,
            null,
            2
        ),
        "utf8"
    );
}

// =====================================================
// IDs
// =====================================================

function gerarUID() {

    return (
        "USR-" +
        crypto
            .randomBytes(8)
            .toString("hex")
            .toUpperCase()
    );
}

function gerarApiKey() {

    return (
        "mk_" +
        crypto
            .randomBytes(24)
            .toString("hex")
    );
}

function gerarID(prefixo) {

    return (
        prefixo +
        "-" +
        Date.now() +
        "-" +
        crypto
            .randomBytes(4)
            .toString("hex")
    );
}

function agora() {

    return new Date()
        .toISOString();
}

// =====================================================
// RESPOSTA DE ERRO
// =====================================================

function erro(
    res,
    status,
    message
) {

    return res
        .status(status)
        .json({
            success: false,
            message
        });
}

// =====================================================
// USUÁRIO
// =====================================================

function usuarioPublico(
    usuario
) {

    if (!usuario) {
        return null;
    }

    return {

        uid:
            usuario.uid,

        name:
            usuario.nome,

        fullName:
            usuario.nome,

        email:
            usuario.email,

        apiKey:
            usuario.apiKey,

        criadoEm:
            usuario.criadoEm

    };
}

// =====================================================
// AUTENTICAÇÃO
// =====================================================

function autenticar(
    req,
    res,
    next
) {

    const apiKey =
        req.headers["x-api-key"] ||
        (
            req.headers.authorization || ""
        )
            .replace(
                "Bearer ",
                ""
            )
            .trim();

    if (!apiKey) {

        return erro(
            res,
            401,
            "API Key não informada."
        );

    }

    const usuarios =
        ler("usuarios");

    const usuario =
        usuarios.find(
            item =>
                item.apiKey === apiKey
        );

    if (!usuario) {

        return erro(
            res,
            401,
            "API Key inválida."
        );

    }

    req.usuario =
        usuario;

    next();
}

// =====================================================
// TESTE
// =====================================================

app.get(
    "/",
    (req, res) => {

        res.json({

            success: true,

            message:
                "API MacVendas funcionando.",

            server:
                "br1.bronxyshost.com",

            port:
                PORT,

            version:
                "1.0.0",

            database:
                "JSON"

        });

    }
);

// =====================================================
// STATUS
// =====================================================

app.get(
    "/status",
    (req, res) => {

        res.json({

            success: true,

            online: true,

            database: true,

            storage:
                "JSON",

            timestamp:
                agora()

        });

    }
);

// =====================================================
// REGISTRO
// =====================================================

app.post(
    "/auth/register",
    async (req, res) => {

        try {

            let {

                name,
                nome,
                email,
                password,
                senha

            } = req.body;

            name =
                String(
                    name ||
                    nome ||
                    ""
                ).trim();

            email =
                String(
                    email ||
                    ""
                )
                    .trim()
                    .toLowerCase();

            password =
                String(
                    password ||
                    senha ||
                    ""
                );

            if (!name) {

                return erro(
                    res,
                    400,
                    "Informe seu nome."
                );

            }

            if (!email) {

                return erro(
                    res,
                    400,
                    "Informe seu email."
                );

            }

            if (!password) {

                return erro(
                    res,
                    400,
                    "Informe a palavra-passe."
                );

            }

            if (
                password.length < 6
            ) {

                return erro(
                    res,
                    400,
                    "A palavra-passe deve ter pelo menos 6 caracteres."
                );

            }

            const usuarios =
                ler("usuarios");

            const existente =
                usuarios.find(
                    usuario =>
                        usuario.email === email
                );

            if (existente) {

                return erro(
                    res,
                    409,
                    "Este email já está registado."
                );

            }

            const usuario = {

                uid:
                    gerarUID(),

                nome:
                    name,

                email:
                    email,

                senha:
                    await bcrypt.hash(
                        password,
                        12
                    ),

                apiKey:
                    gerarApiKey(),

                criadoEm:
                    agora()

            };

            usuarios.push(
                usuario
            );

            salvar(
                "usuarios",
                usuarios
            );

            return res
                .status(201)
                .json({

                    success: true,

                    message:
                        "Conta criada com sucesso!",

                    user:
                        usuarioPublico(
                            usuario
                        )

                });

        }
        catch (error) {

            console.error(
                "[REGISTER]",
                error
            );

            return erro(
                res,
                500,
                "Erro ao criar a conta."
            );

        }

    }
);

// =====================================================
// LOGIN
// =====================================================

app.post(
    "/auth/login",
    async (req, res) => {

        try {

            const email =
                String(
                    req.body.email ||
                    ""
                )
                    .trim()
                    .toLowerCase();

            const password =
                String(
                    req.body.password ||
                    req.body.senha ||
                    ""
                );

            if (
                !email ||
                !password
            ) {

                return erro(
                    res,
                    400,
                    "Informe o email e a palavra-passe."
                );

            }

            const usuarios =
                ler("usuarios");

            const usuario =
                usuarios.find(
                    item =>
                        item.email === email
                );

            if (!usuario) {

                return erro(
                    res,
                    401,
                    "Email ou palavra-passe incorretos."
                );

            }

            const correto =
                await bcrypt.compare(
                    password,
                    usuario.senha
                );

            if (!correto) {

                return erro(
                    res,
                    401,
                    "Email ou palavra-passe incorretos."
                );

            }

            return res.json({

                success: true,

                message:
                    "Login realizado com sucesso.",

                user:
                    usuarioPublico(
                        usuario
                    )

            });

        }
        catch (error) {

            console.error(
                "[LOGIN]",
                error
            );

            return erro(
                res,
                500,
                "Erro ao realizar login."
            );

        }

    }
);

// =====================================================
// USUÁRIO ATUAL
// =====================================================

app.get(
    "/auth/me",
    autenticar,
    (req, res) => {

        res.json({

            success: true,

            user:
                usuarioPublico(
                    req.usuario
                )

        });

    }
);

app.get(
    "/usuarios/me",
    autenticar,
    (req, res) => {

        res.json({

            success: true,

            user:
                usuarioPublico(
                    req.usuario
                )

        });

    }
);

// =====================================================
// EVENTOS DE VENDAS — SSE
// EventSource não permite headers personalizados, por isso
// a apiKey é enviada na query string.
// =====================================================

app.get(
    "/vendas/events",
    (req, res) => {

        const apiKey = obterApiKeySSE(req);
        const usuario = autenticarApiKey(apiKey);

        if (!usuario) {
            return res.status(401).json({
                success: false,
                message: "API key inválida."
            });
        }

        res.status(200);
        res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
        res.setHeader("Cache-Control", "no-cache, no-transform");
        res.setHeader("Connection", "keep-alive");
        res.setHeader("X-Accel-Buffering", "no");
        res.flushHeaders?.();

        res.write(`retry: 10000\n\n`);
        res.write(`event: connected\ndata: ${JSON.stringify({
            tipo: "connected",
            uid: usuario.uid,
            enviadoEm: agora()
        })}\n\n`);

        registrarClienteSSEVendas(usuario.uid, res);
    }
);

// =====================================================
// COMPRAS
// =====================================================

app.get(
    "/compras",
    autenticar,
    (req, res) => {

        const compras =
            ler("compras");

        const minhasCompras =
            compras.filter(
                compra =>
                    compra.uid ===
                    req.usuario.uid
            );

        res.json({

            success: true,

            compras:
                minhasCompras

        });

    }
);

app.post(
    "/compras",
    autenticar,
    (req, res) => {

        try {

            const body =
                req.body || {};

            const compra = {

                id:
                    gerarID("COMPRA"),

                uid:
                    req.usuario.uid,

                numero:
                    body.numero || "",

                pacote:
                    body.pacote || "",

                gb:
                    Number(
                        body.gb || 0
                    ),

                mb:
                    Number(
                        body.mb || 0
                    ),

                valor:
                    Number(
                        body.valor || 0
                    ),

                custo:
                    Number(
                        body.custo || 0
                    ),

                lucro:
                    Number(
                        body.lucro || 0
                    ),

                grupo:
                    body.grupo || "",

                metodoPagamento:
                    body.metodoPagamento ||
                    body.metodo_pagamento ||
                    "",

                comprovativo:
                    body.comprovativo ||
                    "",

                status:
                    body.status ||
                    "concluida",

                criadoEm:
                    agora()

            };

            const compras =
                ler("compras");

            compras.push(
                compra
            );

            salvar(
                "compras",
                compras
            );

            enviarEventoVendas(req.usuario.uid, {
                acao: "criada",
                compra
            });

            res.status(201)
                .json({

                    success: true,

                    message:
                        "Compra registada.",

                    compra

                });

        }
        catch (error) {

            console.error(
                "[COMPRA]",
                error
            );

            erro(
                res,
                500,
                "Erro ao registrar compra."
            );

        }

    }
);

// =====================================================
// CLIENTES
// =====================================================

app.get(
    "/clientes",
    autenticar,
    (req, res) => {

        const clientes =
            ler("clientes");

        const meusClientes =
            clientes.filter(
                cliente =>
                    cliente.uid ===
                    req.usuario.uid
            );

        res.json({

            success: true,

            clientes:
                meusClientes

        });

    }
);

app.post(
    "/clientes",
    autenticar,
    (req, res) => {

        const {

            numero,
            nome,
            grupo

        } = req.body;

        if (!numero) {

            return erro(
                res,
                400,
                "Número é obrigatório."
            );

        }

        const clientes =
            ler("clientes");

        const existente =
            clientes.find(
                cliente =>
                    cliente.uid ===
                        req.usuario.uid &&
                    cliente.numero ===
                        numero
            );

        if (existente) {

            return res.json({

                success: true,

                message:
                    "Cliente já existe.",

                cliente:
                    existente

            });

        }

        const cliente = {

            id:
                gerarID("CLIENTE"),

            uid:
                req.usuario.uid,

            numero:
                String(numero),

            nome:
                nome || "",

            grupo:
                grupo || "",

            totalCompras:
                0,

            totalGB:
                0,

            totalGasto:
                0,

            criadoEm:
                agora(),

            atualizadoEm:
                agora()

        };

        clientes.push(
            cliente
        );

        salvar(
            "clientes",
            clientes
        );

        res.status(201)
            .json({

                success: true,

                message:
                    "Cliente criado.",

                cliente

            });

    }
);

// =====================================================
// GRUPOS
// =====================================================

app.get(
    "/grupos",
    autenticar,
    (req, res) => {

        const grupos =
            ler("grupos");

        const meusGrupos =
            grupos.filter(
                grupo =>
                    grupo.uid ===
                    req.usuario.uid
            );

        res.json({

            success: true,

            grupos:
                meusGrupos

        });

    }
);

app.post(
    "/grupos",
    autenticar,
    (req, res) => {

        const {

            grupoId,
            grupo_id,
            nome

        } = req.body;

        const idGrupo =
            grupoId ||
            grupo_id ||
            "";

        if (!idGrupo) {

            return erro(
                res,
                400,
                "grupoId é obrigatório."
            );

        }

        const grupos =
            ler("grupos");

        const grupo = {

            id:
                gerarID("GRUPO"),

            uid:
                req.usuario.uid,

            grupoId:
                idGrupo,

            nome:
                nome || "",

            criadoEm:
                agora()

        };

        grupos.push(
            grupo
        );

        salvar(
            "grupos",
            grupos
        );

        res.status(201)
            .json({

                success: true,

                message:
                    "Grupo criado.",

                grupo

            });

    }
);

// =====================================================
// PACOTES
// =====================================================

app.get(
    "/pacotes",
    autenticar,
    (req, res) => {

        const pacotes =
            ler("pacotes");

        const meusPacotes =
            pacotes.filter(
                pacote =>
                    pacote.uid ===
                    req.usuario.uid
            );

        res.json({

            success: true,

            pacotes:
                meusPacotes

        });

    }
);

app.post(
    "/pacotes",
    autenticar,
    (req, res) => {

        const {

            grupoId,
            grupo_id,
            nome,
            gb,
            mb,
            preco,
            custo,
            vantagem,
            ativo

        } = req.body;

        const pacotes =
            ler("pacotes");

        const pacote = {

            id:
                gerarID("PACOTE"),

            uid:
                req.usuario.uid,

            grupoId:
                grupoId ||
                grupo_id ||
                "",

            nome:
                nome || "",

            gb:
                Number(
                    gb || 0
                ),

            mb:
                Number(
                    mb || 0
                ),

            preco:
                Number(
                    preco || 0
                ),

            custo:
                Number(
                    custo || 0
                ),

            vantagem:
                vantagem || "",

            ativo:
                ativo === false
                    ? false
                    : true,

            criadoEm:
                agora()

        };

        pacotes.push(
            pacote
        );

        salvar(
            "pacotes",
            pacotes
        );

        res.status(201)
            .json({

                success: true,

                message:
                    "Pacote criado.",

                pacote

            });

    }
);


// =====================================================
// CONFIGURAÇÕES
// =====================================================

app.get(
    "/configuracoes",
    autenticar,
    (req, res) => {

        const configuracoes = ler("configuracoes");

        const configuracao =
            configuracoes.find(
                item =>
                    item.uid === req.usuario.uid
            ) || {
                uid: req.usuario.uid
            };

        res.json({
            success: true,
            configuracao
        });
    }
);

app.post(
    "/configuracoes",
    autenticar,
    (req, res) => {

        const configuracoes = ler("configuracoes");

        const index =
            configuracoes.findIndex(
                item =>
                    item.uid === req.usuario.uid
            );

        const atual = {
            ...(index >= 0 ? configuracoes[index] : {}),
            ...(req.body || {}),
            uid: req.usuario.uid,
            atualizadoEm: agora()
        };

        if (index >= 0) {
            configuracoes[index] = atual;
        } else {
            atual.criadoEm = agora();
            configuracoes.push(atual);
        }

        salvar("configuracoes", configuracoes);

        res.json({
            success: true,
            message: "Configurações salvas.",
            configuracao: atual
        });
    }
);

app.put(
    "/configuracoes",
    autenticar,
    (req, res) => {

        const configuracoes = ler("configuracoes");

        const index =
            configuracoes.findIndex(
                item =>
                    item.uid === req.usuario.uid
            );

        const atual = {
            ...(index >= 0 ? configuracoes[index] : {}),
            ...(req.body || {}),
            uid: req.usuario.uid,
            atualizadoEm: agora()
        };

        if (index >= 0) {
            configuracoes[index] = atual;
        } else {
            atual.criadoEm = agora();
            configuracoes.push(atual);
        }

        salvar("configuracoes", configuracoes);

        res.json({
            success: true,
            message: "Configurações atualizadas.",
            configuracao: atual
        });
    }
);


// =====================================================
// DISPOSITIVOS
// =====================================================

app.get(
    "/dispositivos",
    autenticar,
    (req, res) => {

        const dispositivos =
            ler("dispositivos")
                .filter(
                    item =>
                        item.uid === req.usuario.uid
                );

        res.json({
            success: true,
            dispositivos
        });
    }
);

app.post(
    "/dispositivos",
    autenticar,
    (req, res) => {

        const dispositivos = ler("dispositivos");

        const body = req.body || {};

        const dispositivo = {
            id: body.id || gerarID("DISP"),
            uid: req.usuario.uid,
            ...body,
            uid: req.usuario.uid,
            criadoEm: body.criadoEm || agora(),
            atualizadoEm: agora()
        };

        dispositivos.push(dispositivo);
        salvar("dispositivos", dispositivos);

        res.status(201).json({
            success: true,
            message: "Dispositivo criado.",
            dispositivo
        });
    }
);

app.put(
    "/dispositivos/:id",
    autenticar,
    (req, res) => {

        const dispositivos = ler("dispositivos");

        const index =
            dispositivos.findIndex(
                item =>
                    item.uid === req.usuario.uid &&
                    String(item.id) === String(req.params.id)
            );

        if (index < 0) {
            return erro(
                res,
                404,
                "Dispositivo não encontrado."
            );
        }

        dispositivos[index] = {
            ...dispositivos[index],
            ...(req.body || {}),
            id: dispositivos[index].id,
            uid: req.usuario.uid,
            atualizadoEm: agora()
        };

        salvar("dispositivos", dispositivos);

        res.json({
            success: true,
            message: "Dispositivo atualizado.",
            dispositivo: dispositivos[index]
        });
    }
);

app.delete(
    "/dispositivos/:id",
    autenticar,
    (req, res) => {

        const dispositivos = ler("dispositivos");

        const index =
            dispositivos.findIndex(
                item =>
                    item.uid === req.usuario.uid &&
                    String(item.id) === String(req.params.id)
            );

        if (index < 0) {
            return erro(
                res,
                404,
                "Dispositivo não encontrado."
            );
        }

        const removido = dispositivos.splice(index, 1)[0];

        salvar("dispositivos", dispositivos);

        res.json({
            success: true,
            message: "Dispositivo removido.",
            dispositivo: removido
        });
    }
);


// =====================================================
// PEDIDOS
// =====================================================

app.get(
    "/pedidos",
    autenticar,
    (req, res) => {

        const pedidos =
            ler("pedidos")
                .filter(
                    item =>
                        item.uid === req.usuario.uid
                )
                .sort((a, b) => {
                    const dataA = new Date(
                        a.criadoEm ||
                        a.dataCriacao ||
                        a.createdAt ||
                        a.data ||
                        0
                    ).getTime();

                    const dataB = new Date(
                        b.criadoEm ||
                        b.dataCriacao ||
                        b.createdAt ||
                        b.data ||
                        0
                    ).getTime();

                    return dataB - dataA;
                });

        res.json({
            success: true,
            pedidos
        });
    }
);

app.post(
    "/pedidos",
    autenticar,
    (req, res) => {

        const pedidos = ler("pedidos");

        const body = req.body || {};

        const pedido = {
            id: body.id || gerarID("PEDIDO"),
            uid: req.usuario.uid,
            ...body,
            uid: req.usuario.uid,
            criadoEm: body.criadoEm || agora(),
            atualizadoEm: agora()
        };

        pedidos.push(pedido);
        salvar("pedidos", pedidos);

        console.log("💾 [API PEDIDO] Pedido salvo em data/pedidos.json");
        console.log("   ID:", pedido.id);
        console.log("   Estado:", pedido.status);
        console.log("   UID:", pedido.uid);

        res.status(201).json({
            success: true,
            message: "Pedido criado.",
            pedido
        });
    }
);

app.put(
    "/pedidos/:id",
    autenticar,
    (req, res) => {

        const pedidos = ler("pedidos");

        const index =
            pedidos.findIndex(
                item =>
                    item.uid === req.usuario.uid &&
                    String(item.id) === String(req.params.id)
            );

        if (index < 0) {
            return erro(
                res,
                404,
                "Pedido não encontrado."
            );
        }

        const estadoAnterior = pedidos[index].status;

        pedidos[index] = {
            ...pedidos[index],
            ...(req.body || {}),
            id: pedidos[index].id,
            uid: req.usuario.uid,
            atualizadoEm: agora()
        };

        salvar("pedidos", pedidos);

        console.log("💾 [API PEDIDO] Alteração salva em data/pedidos.json");
        console.log("   ID:", pedidos[index].id);
        console.log("   Estado anterior:", estadoAnterior || "pendente");
        console.log("   Estado novo:", pedidos[index].status || "pendente");

        res.json({
            success: true,
            message: "Pedido atualizado.",
            pedido: pedidos[index]
        });
    }
);

app.delete(
    "/pedidos/:id",
    autenticar,
    (req, res) => {

        const pedidos = ler("pedidos");

        const index =
            pedidos.findIndex(
                item =>
                    item.uid === req.usuario.uid &&
                    String(item.id) === String(req.params.id)
            );

        if (index < 0) {
            return erro(
                res,
                404,
                "Pedido não encontrado."
            );
        }

        const removido = pedidos.splice(index, 1)[0];

        salvar("pedidos", pedidos);

        res.json({
            success: true,
            message: "Pedido removido.",
            pedido: removido
        });
    }
);


// =====================================================
// RELATÓRIOS
// =====================================================

app.get(
    "/relatorios",
    autenticar,
    (req, res) => {

        const compras =
            ler("compras")
                .filter(
                    item =>
                        item.uid === req.usuario.uid
                );

        const totalVendas = compras.length;

        const faturamento =
            compras.reduce(
                (total, item) =>
                    total + Number(item.valor || 0),
                0
            );

        const custo =
            compras.reduce(
                (total, item) =>
                    total + Number(item.custo || 0),
                0
            );

        const lucro =
            compras.reduce(
                (total, item) =>
                    total + Number(item.lucro || 0),
                0
            );

        const totalGB =
            compras.reduce(
                (total, item) =>
                    total + Number(item.gb || 0),
                0
            );

        const totalMB =
            compras.reduce(
                (total, item) =>
                    total + Number(item.mb || 0),
                0
            );

        const porDia = {};

        for (const compra of compras) {

            const data =
                String(
                    compra.criadoEm ||
                    compra.data ||
                    agora()
                ).slice(0, 10);

            if (!porDia[data]) {
                porDia[data] = {
                    data,
                    vendas: 0,
                    faturamento: 0,
                    custo: 0,
                    lucro: 0,
                    gb: 0,
                    mb: 0
                };
            }

            porDia[data].vendas += 1;
            porDia[data].faturamento += Number(compra.valor || 0);
            porDia[data].custo += Number(compra.custo || 0);
            porDia[data].lucro += Number(compra.lucro || 0);
            porDia[data].gb += Number(compra.gb || 0);
            porDia[data].mb += Number(compra.mb || 0);
        }

        res.json({
            success: true,

            resumo: {
                totalVendas,
                faturamento,
                custo,
                lucro,
                totalGB,
                totalMB
            },

            vendas: {
                totalVendas,
                faturamento,
                custo,
                lucro,
                totalGB,
                totalMB
            },

            porDia: Object.values(porDia),

            compras
        });
    }
);


// =====================================================
// DASHBOARD
// =====================================================

app.get(
    "/dashboard",
    autenticar,
    (req, res) => {

        const compras =
            ler("compras")
                .filter(
                    compra =>
                        compra.uid ===
                        req.usuario.uid
                );

        const clientes =
            ler("clientes")
                .filter(
                    cliente =>
                        cliente.uid ===
                        req.usuario.uid
                );

        const grupos =
            ler("grupos")
                .filter(
                    grupo =>
                        grupo.uid ===
                        req.usuario.uid
                );

        let faturamento = 0;
        let custo = 0;
        let lucro = 0;
        let totalGB = 0;
        let totalMB = 0;

        for (
            const compra
            of compras
        ) {

            faturamento +=
                Number(
                    compra.valor || 0
                );

            custo +=
                Number(
                    compra.custo || 0
                );

            lucro +=
                Number(
                    compra.lucro || 0
                );

            totalGB +=
                Number(
                    compra.gb || 0
                );

            totalMB +=
                Number(
                    compra.mb || 0
                );

        }

        res.json({

            success: true,

            vendas: {

                totalVendas:
                    compras.length,

                faturamento,

                custo,

                lucro,

                totalGB,

                totalMB

            },

            clientes:
                clientes.length,

            grupos:
                grupos.length

        });

    }
);

// =====================================================
// 404
// =====================================================

app.use(
    (req, res) => {

        res.status(404)
            .json({

                success: false,

                message:
                    "Rota não encontrada.",

                path:
                    req.originalUrl

            });

    }
);

// =====================================================
// ERRO GLOBAL
// =====================================================

app.use(
    (error, req, res, next) => {

        console.error(
            "[SERVER ERROR]",
            error
        );

        res.status(500)
            .json({

                success: false,

                message:
                    "Erro interno do servidor."

            });

    }
);

// =====================================================
// INICIAR SERVIDOR
// =====================================================

// =====================================================
// SERVIDOR HTTP + WEBSOCKET
// =====================================================

const servidor = http.createServer(app);

const wssVendas = new WebSocket.Server({
    server: servidor,
    path: "/vendas/ws"
});

wssVendas.on("connection", (socket, request) => {
    const apiKey = obterApiKeyWebSocket(request);
    const usuario = autenticarApiKey(apiKey);

    if (!usuario) {
        socket.close(1008, "API key inválida.");
        return;
    }

    registrarClienteWebSocketVendas(
        usuario.uid,
        socket
    );

    socket.send(
        JSON.stringify({
            tipo: "connected",
            uid: usuario.uid,
            enviadoEm: agora()
        })
    );

    socket.on("message", (mensagem) => {
        // Mantemos a conexão simples: o dashboard apenas recebe eventos.
        // "ping" pode ser usado pelo frontend para manter a sessão ativa.
        try {
            const dados = JSON.parse(String(mensagem || "{}"));

            if (dados.tipo === "ping") {
                socket.send(
                    JSON.stringify({
                        tipo: "pong",
                        enviadoEm: agora()
                    })
                );
            }
        } catch (_) {
            // Mensagem inválida é ignorada.
        }
    });
});

wssVendas.on("error", (erro) => {
    console.error(
        "[WEBSOCKET VENDAS] Erro:",
        erro.message
    );
});

servidor.listen(
    PORT,
    "0.0.0.0",
    () => {

        console.log("");
        console.log(
            "======================================"
        );

        console.log(
            "          MACVENDAS API"
        );

        console.log(
            "======================================"
        );

        console.log(
            `Servidor HTTP: http://0.0.0.0:${PORT}`
        );

        console.log(
            `API: ${API_URL}`
        );

        console.log(
            `WebSocket: ws://0.0.0.0:${PORT}/vendas/ws`
        );

        console.log(
            "Armazenamento: JSON"
        );

        console.log(
            "Status: ONLINE"
        );

        console.log(
            "======================================"
        );

        console.log("");

    }
);
