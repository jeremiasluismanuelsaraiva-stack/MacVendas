// =====================================================
// MOZ TECH - CONFIGURAÇÕES
// =====================================================
(function () {
    "use strict";

    function el(id) { return document.getElementById(id); }

    function aplicarTema(tema) {
        const finalTema = tema === "light" ? "light" : "dark";
        document.documentElement.setAttribute("data-theme", finalTema);
        if (document.body) {
            document.body.classList.remove("theme-dark", "theme-light");
            document.body.classList.add("theme-" + finalTema);
        }
        localStorage.setItem("tema", finalTema);
    }

    function carregarTema() {
        aplicarTema(localStorage.getItem("tema") || "dark");
    }

    async function obterConfiguracao() {
        if (window.MOZ_API && typeof window.MOZ_API.get === "function") {
            return await window.MOZ_API.get("/configuracoes");
        }

        throw new Error("API do sistema ainda não está disponível.");
    }

    async function carregarConfiguracoes() {
        try {
            const json = await obterConfiguracao();
            if (!json || !json.success) {
                throw new Error(json?.error || "Não foi possível carregar as configurações.");
            }

            const cfg = json.configuracao || {};
            const terminal = cfg.terminal || {};

            if (el("nomeEmpresa")) el("nomeEmpresa").value = cfg.nomeEmpresa || "";
            if (el("telefone")) el("telefone").value = cfg.telefone || "";
            if (el("email")) el("email").value = cfg.email || "";
            if (el("moeda")) el("moeda").value = cfg.moeda || "MT";
            if (el("vendaGB")) el("vendaGB").value = cfg.vendaGB ?? 28;
            if (el("custoGB")) el("custoGB").value = cfg.custoGB ?? 21;
            if (el("tema")) el("tema").value = cfg.tema === "light" ? "light" : "dark";
            if (el("idioma")) el("idioma").value = cfg.idioma || "pt";

            if (el("terminalAtivo")) el("terminalAtivo").checked = terminal.ativo === true;
            if (el("terminalHost")) el("terminalHost").value = terminal.host || "";
            if (el("terminalPorta")) el("terminalPorta").value = terminal.porta || 8080;
            if (el("terminalProtocolo")) el("terminalProtocolo").value = terminal.protocolo === "ws" ? "ws" : "wss";
            if (el("terminalToken")) el("terminalToken").value = terminal.token || "";

            aplicarTema(cfg.tema);
            window.MOZ_TERMINAL_CONFIG = terminal;

            if (typeof window.terminalAtualizarConfiguracao === "function") {
                window.terminalAtualizarConfiguracao(terminal);
            }

            console.log("[CONFIG] Configurações carregadas.");
            return cfg;
        } catch (erro) {
            console.error("[CONFIG] Erro ao carregar:", erro);
            const area = el("configConteudo");
            if (area && !area.querySelector(".config-grid")) {
                area.innerHTML = `<div class="message error">${String(erro.message || "Erro ao carregar configurações.")}</div>`;
            }
            return null;
        }
    }

    function obterDadosConfiguracoes() {
        return {
            nomeEmpresa: el("nomeEmpresa")?.value?.trim() || "",
            telefone: el("telefone")?.value?.trim() || "",
            email: el("email")?.value?.trim() || "",
            moeda: el("moeda")?.value || "MT",
            vendaGB: Number(el("vendaGB")?.value || 0),
            custoGB: Number(el("custoGB")?.value || 0),
            tema: el("tema")?.value || "dark",
            idioma: el("idioma")?.value || "pt",
            terminal: {
                ativo: el("terminalAtivo")?.checked === true,
                host: el("terminalHost")?.value?.trim() || "",
                porta: Number(el("terminalPorta")?.value || 8080),
                protocolo: el("terminalProtocolo")?.value === "ws" ? "ws" : "wss",
                token: el("terminalToken")?.value?.trim() || ""
            }
        };
    }

    async function salvarConfiguracoes() {
        const dados = obterDadosConfiguracoes();

        if (dados.terminal.ativo && !dados.terminal.host) {
            alert("Defina o Host do servidor antes de ativar o terminal.");
            return;
        }

        if (dados.terminal.ativo && !dados.terminal.token) {
            alert("Defina o Token do Terminal antes de ativá-lo.");
            return;
        }

        try {
            aplicarTema(dados.tema);

            if (!window.MOZ_API || typeof window.MOZ_API.put !== "function") {
                throw new Error("API do sistema ainda não está disponível.");
            }

            const json = await window.MOZ_API.put("/configuracoes", dados);
            if (!json || !json.success) {
                throw new Error(json?.error || "Erro ao guardar configurações.");
            }

            window.MOZ_TERMINAL_CONFIG = json.configuracao?.terminal || dados.terminal;

            if (typeof window.terminalAtualizarConfiguracao === "function") {
                window.terminalAtualizarConfiguracao(window.MOZ_TERMINAL_CONFIG);
            }

            alert("Configurações guardadas com sucesso!");
        } catch (erro) {
            console.error("[CONFIG] Erro ao guardar:", erro);
            alert(erro.message || "Erro ao guardar as configurações.");
        }
    }

    function inicializarConfiguracoes() {
        carregarTema();

        el("tema")?.addEventListener("change", function () {
            aplicarTema(this.value);
        });

        const btn = el("btnSalvarConfiguracoes");
        if (btn && btn.dataset.configInicializado !== "true") {
            btn.dataset.configInicializado = "true";
            btn.addEventListener("click", function (event) {
                event.preventDefault();
                salvarConfiguracoes();
            });
        }

        carregarConfiguracoes();
    }

    window.carregarConfiguracoes = carregarConfiguracoes;
    window.salvarConfiguracoes = salvarConfiguracoes;
    window.aplicarTema = aplicarTema;
    window.alterarTema = aplicarTema;
    window.carregarTema = carregarTema;

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", inicializarConfiguracoes, { once: true });
    } else {
        inicializarConfiguracoes();
    }
})();
