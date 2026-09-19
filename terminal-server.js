"use strict";

// =====================================================
// MOZ TECH - SERVIDOR DE TERMINAL
// =====================================================
// Execute este arquivo no servidor que pretende controlar:
//
//   TERMINAL_TOKEN="um-token-forte" PORT=8080 node terminal-server.js
//
// Windows PowerShell:
//   $env:TERMINAL_TOKEN="um-token-forte"; $env:PORT="8080"; node terminal-server.js
//
// O mesmo token deve ser colocado no painel:
// Configurações -> Terminal -> Token.
// =====================================================

const os = require("os");
const { spawn } = require("child_process");
const WebSocket = require("ws");

const PORT = Number(process.env.PORT || 8080);
const TOKEN = String(process.env.TERMINAL_TOKEN || "").trim();

if (!TOKEN) {
    console.error("[TERMINAL] Defina TERMINAL_TOKEN antes de iniciar o servidor.");
    process.exit(1);
}

const wss = new WebSocket.Server({ port: PORT });

function memoriaMB() {
    const total = os.totalmem() / 1024 / 1024;
    const livre = os.freemem() / 1024 / 1024;
    return {
        total: Math.round(total),
        usada: Math.round(total - livre)
    };
}

function cpuPercent() {
    const loads = os.loadavg();
    const cores = os.cpus().length || 1;
    // Em Windows loadavg não é útil; retorna uma indicação neutra.
    if (process.platform === "win32") return null;
    return Math.min(100, Math.round((loads[0] / cores) * 100));
}

function formatarUptime(segundos) {
    segundos = Math.max(0, Math.floor(segundos));
    const dias = Math.floor(segundos / 86400);
    segundos %= 86400;
    const horas = Math.floor(segundos / 3600);
    segundos %= 3600;
    const minutos = Math.floor(segundos / 60);
    return `${dias}d ${horas}h ${minutos}m`;
}

function status() {
    const mem = memoriaMB();
    return {
        hostname: os.hostname(),
        platform: process.platform,
        node: process.version,
        cpuPercent: cpuPercent(),
        memoryUsedMB: mem.usada,
        memoryTotalMB: mem.total,
        uptime: formatarUptime(os.uptime())
    };
}

wss.on("connection", function (ws) {
    let autenticado = false;
    let shell = null;
    const timerAuth = setTimeout(() => {
        if (!autenticado) {
            try { ws.send(JSON.stringify({ type: "auth", ok: false, message: "Tempo de autenticação expirado." })); } catch (_) {}
            try { ws.close(); } catch (_) {}
        }
    }, 10000);

    function enviar(obj) {
        if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(obj));
    }

    function iniciarShell() {
        if (shell) return;

        const comandoShell = process.platform === "win32" ? (process.env.ComSpec || "cmd.exe") : (process.env.SHELL || "/bin/bash");
        shell = spawn(comandoShell, [], {
            cwd: process.cwd(),
            env: process.env,
            stdio: ["pipe", "pipe", "pipe"]
        });

        shell.stdout.on("data", data => enviar({ type: "output", stream: "stdout", data: data.toString() }));
        shell.stderr.on("data", data => enviar({ type: "output", stream: "stderr", data: data.toString() }));
        shell.on("exit", (code, signal) => {
            enviar({ type: "exit", code, signal });
            shell = null;
            if (autenticado && ws.readyState === WebSocket.OPEN) {
                enviar({ type: "system", level: "info", message: "Shell encerrado. Reconecte para abrir outro." });
            }
        });
        shell.on("error", err => enviar({ type: "error", message: err.message }));
    }

    ws.on("message", function (raw) {
        let msg;
        try { msg = JSON.parse(raw.toString()); } catch (_) {
            enviar({ type: "error", message: "Mensagem inválida." });
            return;
        }

        if (!autenticado) {
            if (msg.type !== "auth" || String(msg.token || "") !== TOKEN) {
                enviar({ type: "auth", ok: false, message: "Token inválido." });
                try { ws.close(); } catch (_) {}
                return;
            }

            autenticado = true;
            clearTimeout(timerAuth);
            enviar({ type: "auth", ok: true });
            enviar({ type: "status", online: true, data: status() });
            enviar({ type: "system", level: "success", message: "Terminal autenticado." });
            iniciarShell();
            return;
        }

        if (msg.type === "status") {
            enviar({ type: "status", online: true, data: status() });
            return;
        }

        if (msg.type === "interrupt") {
            if (shell && shell.stdin.writable) shell.stdin.write("\u0003");
            return;
        }

        if (msg.type === "command") {
            const command = String(msg.command || "");
            if (!command.trim()) return;
            if (!shell) iniciarShell();
            if (shell && shell.stdin.writable) shell.stdin.write(command + "\n");
            return;
        }
    });

    const timerStatus = setInterval(() => {
        if (autenticado) enviar({ type: "status", online: true, data: status() });
    }, 3000);

    ws.on("close", () => {
        clearTimeout(timerAuth);
        clearInterval(timerStatus);
        if (shell) {
            try { shell.kill(); } catch (_) {}
            shell = null;
        }
    });
});

console.log(`[TERMINAL] WebSocket ativo na porta ${PORT}`);
console.log(`[TERMINAL] Host: ${os.hostname()}`);
