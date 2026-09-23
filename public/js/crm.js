// =====================================================
// MOZ TECH
// CRM - CONTROLADOR
// Local: public/js/crm.js
// =====================================================

(function () {
    "use strict";

    function elemento(id) {
        return document.getElementById(id);
    }

    async function abrirCRM() {
        try {
            const painel =
                elemento("panelCRM") ||
                elemento("painelCRM") ||
                elemento("crm");

            if (painel) {
                painel.style.display = "";
                painel.classList.add("active");
            }

            if (typeof window.carregarClientes === "function") {
                await window.carregarClientes();
                return true;
            }

            if (typeof window.iniciarCRM === "function") {
                return window.iniciarCRM();
            }

            console.error(
                "[MOZ TECH] clientes.js não foi carregado antes do crm.js."
            );

            return false;
        } catch (erro) {
            console.error("[MOZ TECH] Erro ao abrir CRM:", erro);
            return false;
        }
    }

    function configurarBotaoCRM() {
        const seletores = [
            "[data-painel='crm']",
            "[data-panel='crm']",
            "[data-menu='crm']",
            "#menuCRM",
            "#btnCRM",
            ".menu-crm"
        ];

        seletores.forEach(seletor => {
            document.querySelectorAll(seletor).forEach(botao => {
                if (botao.dataset.crmConfigurado === "1") return;

                botao.dataset.crmConfigurado = "1";

                botao.addEventListener("click", function (evento) {
                    evento.preventDefault();
                    abrirCRM();
                });
            });
        });
    }

    window.abrirCRM = abrirCRM;
    window.iniciarCRM = abrirCRM;

    document.addEventListener("DOMContentLoaded", function () {
        setTimeout(configurarBotaoCRM, 300);

        setTimeout(function () {
            if (
                elemento("tabelaClientes") &&
                typeof window.carregarClientes === "function"
            ) {
                window.carregarClientes();
            }
        }, 500);
    });

})();
