"use strict";

// =====================================================
// MOZ TECH - TERMINAL VIA API CONFIGURÁVEL
// =====================================================
// A API é definida pelo usuário em:
// Configurações -> Terminal
//
// Exemplo:
// API: http://br1.bronxyshost.com:4234
//
// Não usamos SSH nem WebSocket direto do navegador.
// O backend faz a requisição para a API configurada.
// =====================================================

const express = require("express");
const router = express.Router();

const { db } = require("./firebase-admin");

const METODOS = ["GET", "POST", "PUT", "PATCH", "DELETE"];

function obterUID(req) {
    return req.usuario?.uid || null;
}

async function obterTerminal(uid) {
    if (!uid) {
        throw new Error("Usuário não autenticado.");
    }

    const snapshot = await db
        .ref(`configuracoes/${uid}/terminal`)
        .once("value");

    const terminal = snapshot.val();

    if (!terminal || typeof terminal !== "object") {
        throw new Error(
            "Terminal ainda não foi configurado em Configurações."
        );
    }

    return {
        ativo: terminal.ativo === true,
        api: String(terminal.api || "").trim(),
        endpoint: String(terminal.endpoint || "").trim(),
        metodo: String(terminal.metodo || "POST").toUpperCase(),
        token: String(terminal.token || "").trim()
    };
}

function validarAPI(api) {
    if (!api) {
        throw new Error(
            "Defina a API do terminal em Configurações."
        );
    }

    let url;

    try {
        url = new URL(api);
    } catch (_) {
        throw new Error("A URL da API do terminal é inválida.");
    }

    if (!["http:", "https:"].includes(url.protocol)) {
        throw new Error(
            "A API deve usar HTTP ou HTTPS."
        );
    }

    return url.toString().replace(/\/+$/, "");
}

function validarEndpoint(endpoint) {
    endpoint = String(endpoint || "").trim();

    if (!endpoint) return "";

    if (
        endpoint.includes("://") ||
        endpoint.includes("\\")
    ) {
        throw new Error("Endpoint inválido.");
    }

    return endpoint.replace(/^\/+/, "");
}

function criarURL(api, endpoint) {
    const base = validarAPI(api);
    const rota = validarEndpoint(endpoint);

    return rota
        ? `${base}/${rota}`
        : base;
}

function criarHeaders(terminal, headersExtras = {}) {
    const headers = {
        Accept: "application/json, text/plain, */*"
    };

    // Token é opcional.
    if (terminal.token) {
        headers.Authorization = `Bearer ${terminal.token}`;
    }

    if (
        headersExtras &&
        typeof headersExtras === "object" &&
        !Array.isArray(headersExtras)
    ) {
        for (const [nome, valor] of Object.entries(headersExtras)) {
            if (
                nome.toLowerCase() === "host" ||
                nome.toLowerCase() === "content-length"
            ) {
                continue;
            }

            headers[nome] = String(valor);
        }
    }

    return headers;
}

async function lerResposta(resposta) {
    const contentType =
        resposta.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
        try {
            return await resposta.json();
        } catch (_) {
            return await resposta.text();
        }
    }

    return await resposta.text();
}

// =====================================================
// GET /api/terminal/config
// =====================================================

router.get("/config", async (req, res) => {
    try {
        const terminal = await obterTerminal(
            obterUID(req)
        );

        res.json({
            success: true,
            terminal: {
                ativo: terminal.ativo,
                api: terminal.api,
                endpoint: terminal.endpoint,
                metodo: terminal.metodo,
                tokenConfigurado: Boolean(terminal.token)
            }
        });
    } catch (erro) {
        console.error("[TERMINAL CONFIG]", erro);

        res.status(500).json({
            success: false,
            error: erro.message
        });
    }
});

// =====================================================
// GET /api/terminal/status
// =====================================================
//
// Verifica apenas a configuração.
// A API externa só é chamada quando o usuário executa
// um comando. Isso permite APIs que aceitam apenas POST.
// =====================================================

router.get("/status", async (req, res) => {
    try {
        const terminal = await obterTerminal(
            obterUID(req)
        );

        if (!terminal.ativo) {
            return res.status(403).json({
                success: false,
                error: "O terminal está desativado."
            });
        }

        const url = criarURL(
            terminal.api,
            terminal.endpoint
        );

        res.json({
            success: true,
            status: "ready",
            endpoint: url,
            metodo: terminal.metodo,
            tokenConfigurado: Boolean(terminal.token)
        });
    } catch (erro) {
        console.error("[TERMINAL STATUS]", erro);

        res.status(500).json({
            success: false,
            error: erro.message
        });
    }
});

// =====================================================
// POST /api/terminal/exec
// =====================================================
//
// O terminal envia:
//
// {
//   "command": "ls"
// }
//
// A configuração define:
//
// api
// endpoint
// metodo
// token
//
// Para GET:
//   ?command=ls
//
// Para POST/PUT/PATCH:
//   { "command": "ls" }
//
// Para DELETE:
//   também envia JSON com command.
// =====================================================

router.post("/exec", async (req, res) => {
    try {
        const terminal = await obterTerminal(
            obterUID(req)
        );

        if (!terminal.ativo) {
            return res.status(403).json({
                success: false,
                error: "O terminal está desativado."
            });
        }

        const urlBase = criarURL(
            terminal.api,
            terminal.endpoint
        );

        const metodo = METODOS.includes(
            terminal.metodo
        )
            ? terminal.metodo
            : "POST";

        const command = String(
            req.body?.command ?? ""
        );

        if (!command.trim()) {
            return res.status(400).json({
                success: false,
                error: "Digite um comando."
            });
        }

        let url = urlBase;

        const headers = criarHeaders(
            terminal,
            req.body?.headers
        );

        const opcoes = {
            method: metodo,
            headers
        };

        if (metodo === "GET") {
            const separador =
                url.includes("?") ? "&" : "?";

            url =
                `${url}${separador}command=${encodeURIComponent(command)}`;
        } else {
            headers["Content-Type"] =
                headers["Content-Type"] ||
                "application/json";

            opcoes.body = JSON.stringify({
                command
            });
        }

        console.log(
            `[TERMINAL] ${metodo} ${url}`
        );

        const resposta =
            await fetch(url, opcoes);

        const resultado =
            await lerResposta(resposta);

        res.status(
            resposta.ok ? 200 : resposta.status
        ).json({
            success: resposta.ok,
            status: resposta.status,
            endpoint: url,
            metodo,
            resultado
        });
    } catch (erro) {
        console.error("[TERMINAL EXEC]", erro);

        res.status(500).json({
            success: false,
            error: erro.message
        });
    }
});

module.exports = router;
