// =====================================================
// MOZ TECH - TERMINAL VIA API
// =====================================================
(function () {
    "use strict";

    let config = {};
    const el = id => document.getElementById(id);

    function linha(texto, tipo="normal") {
        const out = el("terminalOutput");
        if (!out) return;
        const div = document.createElement("div");
        div.className = "terminal-line terminal-" + tipo;
        div.textContent = String(texto ?? "");
        out.appendChild(div);
        out.scrollTop = out.scrollHeight;
    }

    function atualizarInfo() {
        const n = el("terminalHostInfo");
        if (!n) return;
        n.textContent = config.api
            ? `${config.api}${config.endpoint || ""}`
            : "API não configurada.";
    }

    function atualizarConfiguracao(c) {
        config = {
            ativo: c?.ativo === true,
            api: String(c?.api || "").trim(),
            endpoint: String(c?.endpoint || "").trim(),
            metodo: String(c?.metodo || "POST").toUpperCase(),
            token: String(c?.token || "").trim()
        };
        atualizarInfo();
    }

    async function conectar() {
        try {
            const r = await window.MOZ_API.get("/configuracoes");
            if (r?.success) {
                atualizarConfiguracao(r.configuracao?.terminal || {});
            }
        } catch (e) {
            linha("Não foi possível carregar a configuração do terminal.", "error");
            return;
        }

        if (!config.ativo) return linha("Terminal está desativado nas Configurações.", "error");
        if (!config.api) return linha("Configure a API do terminal.", "error");

        linha(`Testando API: ${config.api}${config.endpoint || ""}`, "info");

        try {
            const r = await window.MOZ_API.get("/terminal/status");
            if (r?.success) {
                linha(`Conectado. HTTP ${r.status}`, "success");
                linha(typeof r.resultado === "string" ? r.resultado : JSON.stringify(r.resultado, null, 2));
            } else {
                linha(r?.erro || `Resposta HTTP ${r?.status || "desconhecida"}`, "error");
            }
        } catch (e) {
            linha("Erro: " + (e.message || e), "error");
        }
    }

    async function executar() {
        const input = el("terminalCommand");
        const command = input?.value?.trim();
        if (!command) return;

        if (!config.ativo || !config.api) {
            await conectar();
            if (!config.ativo || !config.api) return;
        }

        linha("$ " + command, "command");

        try {
            const r = await window.MOZ_API.post("/terminal/exec", {
                path: config.endpoint || "",
                method: config.metodo || "POST",
                body: { command }
            });

            if (r?.success) {
                linha(
                    typeof r.resultado === "string"
                        ? r.resultado
                        : JSON.stringify(r.resultado, null, 2),
                    "normal"
                );
            } else {
                linha(r?.erro || JSON.stringify(r), "error");
            }
        } catch (e) {
            linha("Erro: " + (e.message || e), "error");
        }

        if (input) {
            input.value = "";
            input.focus();
        }
    }

    function limpar() {
        if (el("terminalOutput")) el("terminalOutput").innerHTML = "";
    }

    window.terminalAtualizarConfiguracao = atualizarConfiguracao;
    window.terminalConectar = conectar;

    function init() {
        el("btnTerminalConectar")?.addEventListener("click", conectar);
        el("btnTerminalExecutar")?.addEventListener("click", executar);
        el("btnTerminalLimpar")?.addEventListener("click", limpar);
        el("terminalCommand")?.addEventListener("keydown", e => {
            if (e.key === "Enter") {
                e.preventDefault();
                executar();
            }
        });
    }

    if (document.readyState === "loading")
        document.addEventListener("DOMContentLoaded", init, { once: true });
    else init();
})();
