"use strict";

const express = require("express");
const router = express.Router();
const { db } = require("./firebase-admin");

function uid(req) {
  return req.usuario?.uid || null;
}

async function getTerminalConfig(userId) {
  if (!userId) throw new Error("Usuário não autenticado.");

  const snap = await db.ref(`configuracoes/${userId}/terminal`).once("value");
  return snap.val() || {
    ativo: false,
    api: "",
    endpoint: "",
    metodo: "POST",
    token: ""
  };
}

function buildUrl(api, endpoint = "") {
  let base = String(api || "").trim();
  if (!base) throw new Error("API do terminal não configurada.");
  if (!/^https?:\/\//i.test(base)) base = "http://" + base;
  base = base.replace(/\/+$/, "");

  const path = String(endpoint || "").trim();
  if (!path) return base;

  if (/^https?:\/\//i.test(path) || path.includes("\\"))
    throw new Error("Endpoint inválido.");

  return `${base}/${path.replace(/^\/+/, "")}`;
}

function tokenHeader(config) {
  return config.token
    ? { Authorization: `Bearer ${String(config.token)}` }
    : {};
}

router.get("/config", async (req, res) => {
  try {
    const config = await getTerminalConfig(uid(req));
    res.json({
      success: true,
      terminal: {
        ativo: config.ativo === true,
        api: config.api || "",
        endpoint: config.endpoint || "",
        metodo: config.metodo || "POST",
        tokenConfigurado: !!config.token
      }
    });
  } catch (e) {
    res.status(500).json({ success: false, erro: e.message });
  }
});

router.get("/status", async (req, res) => {
  try {
    const config = await getTerminalConfig(uid(req));
    if (!config.ativo)
      return res.status(403).json({ success:false, erro:"Terminal desativado nas Configurações." });

    const url = buildUrl(config.api, config.endpoint);
    const response = await fetch(url, {
      method: config.metodo || "GET",
      headers: { Accept:"application/json, text/plain, */*", ...tokenHeader(config) }
    });

    const contentType = response.headers.get("content-type") || "";
    const result = contentType.includes("application/json")
      ? await response.json()
      : await response.text();

    res.status(response.ok ? 200 : response.status).json({
      success: response.ok, status: response.status, endpoint: url, resultado: result
    });
  } catch (e) {
    res.status(500).json({ success:false, erro:e.message });
  }
});

router.post("/exec", async (req, res) => {
  try {
    const config = await getTerminalConfig(uid(req));
    if (!config.ativo)
      return res.status(403).json({ success:false, erro:"Terminal desativado nas Configurações." });

    const url = buildUrl(config.api, req.body?.path ?? config.endpoint ?? "");
    const method = String(req.body?.method || config.metodo || "POST").toUpperCase();
    const headers = {
      Accept:"application/json, text/plain, */*",
      ...tokenHeader(config),
      ...(req.body?.headers && typeof req.body.headers === "object" ? req.body.headers : {})
    };

    const options = { method, headers };
    if (req.body?.body !== undefined && method !== "GET" && method !== "HEAD") {
      headers["Content-Type"] = headers["Content-Type"] || "application/json";
      options.body = typeof req.body.body === "string"
        ? req.body.body
        : JSON.stringify(req.body.body);
    }

    const response = await fetch(url, options);
    const contentType = response.headers.get("content-type") || "";
    const result = contentType.includes("application/json")
      ? await response.json()
      : await response.text();

    res.status(response.ok ? 200 : response.status).json({
      success: response.ok, status: response.status,
      endpoint: url, method, resultado: result
    });
  } catch (e) {
    res.status(500).json({ success:false, erro:e.message });
  }
});

module.exports = router;
