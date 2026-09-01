// =====================================================
// MOZ TECH - DASHBOARD
// Local: public/js/dashboard.js
// =====================================================

(function () {

    "use strict";

    // =====================================================
    // CONFIGURAÇÃO
    // =====================================================

    const API = "/api";

    let carregandoDashboard = false;
    let carregandoVendas = false;
    let botaoConfigurado = false;


    // =====================================================
    // ELEMENTO
    // =====================================================

    function elemento(id) {

        return document.getElementById(id);

    }


    // =====================================================
    // NÚMERO
    // =====================================================

    function numero(valor) {

        if (
            valor === null ||
            valor === undefined ||
            valor === ""
        ) {
            return "0";
        }

        const n = Number(
            String(valor)
                .replace(",", ".")
                .replace(/[^\d.-]/g, "")
        );

        if (!Number.isFinite(n)) {
            return "0";
        }

        return n.toLocaleString("pt-MZ", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        });

    }


    // =====================================================
    // DINHEIRO
    // =====================================================

    function dinheiro(valor) {

        if (
            valor === null ||
            valor === undefined ||
            valor === ""
        ) {
            return "0,00 MT";
        }

        const n = Number(
            String(valor)
                .replace(",", ".")
                .replace(/[^\d.-]/g, "")
        );

        if (!Number.isFinite(n)) {
            return "0,00 MT";
        }

        return n.toLocaleString("pt-MZ", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }) + " MT";

    }


    // =====================================================
    // ATUALIZAR ELEMENTO
    // =====================================================

    function atualizar(id, valor) {

        const el = elemento(id);

        if (el) {
            el.textContent = valor;
        }

    }


    // =====================================================
    // DATA
    // =====================================================

    function atualizarData() {

        const data = elemento("data");

        if (!data) {
            return;
        }

        data.textContent =
            "Atualizado em " +
            new Date().toLocaleString("pt-MZ");

    }


    // =====================================================
    // ESCAPAR HTML
    // =====================================================

    function escapar(valor) {

        return String(valor ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    }


    // =====================================================
    // OBTER VALOR DE UM CAMPO
    // =====================================================

    function primeiroValor(obj, campos) {

        for (const campo of campos) {

            if (
                obj &&
                obj[campo] !== undefined &&
                obj[campo] !== null &&
                obj[campo] !== ""
            ) {

                return obj[campo];

            }

        }

        return 0;

    }


    // =====================================================
    // CARREGAR DASHBOARD
    // GET /api/dashboard
    // =====================================================

    async function carregarDashboard() {

        if (carregandoDashboard) {
            return null;
        }

        carregandoDashboard = true;

        try {

            console.log(
                "[MOZ TECH] A carregar /api/dashboard..."
            );


            const resposta = await fetch(
                API + "/dashboard",
                {
                    method: "GET",
                    headers: {
                        "Accept": "application/json"
                    },
                    cache: "no-store"
                }
            );


            if (!resposta.ok) {

                throw new Error(
                    "HTTP " + resposta.status
                );

            }


            const json =
                await resposta.json();


            console.log(
                "[MOZ TECH] Resposta dashboard:",
                json
            );


            /*
             * Aceita os formatos:
             *
             * {
             *   success: true,
             *   dashboard: {...}
             * }
             *
             * ou:
             *
             * {
             *   dashboard: {...}
             * }
             *
             * ou diretamente:
             *
             * {
             *   vendas: 10,
             *   faturamento: 500
             * }
             */

            let d = {};


            if (
                json &&
                json.dashboard &&
                typeof json.dashboard === "object"
            ) {

                d = json.dashboard;

            }
            else if (
                json &&
                typeof json === "object"
            ) {

                d = json;

            }


            // =================================================
            // VENDAS
            // =================================================

            atualizar(
                "vendas",
                numero(
                    primeiroValor(
                        d,
                        [
                            "vendas",
                            "totalVendas",
                            "total_vendas"
                        ]
                    )
                )
            );


            // =================================================
            // FATURAMENTO
            // =================================================

            atualizar(
                "valor",
                dinheiro(
                    primeiroValor(
                        d,
                        [
                            "faturamento",
                            "valor",
                            "total",
                            "receita",
                            "totalFaturamento"
                        ]
                    )
                )
            );


            // =================================================
            // CLIENTES
            // =================================================

            atualizar(
                "clientes",
                numero(
                    primeiroValor(
                        d,
                        [
                            "clientes",
                            "totalClientes",
                            "total_clientes"
                        ]
                    )
                )
            );


            // =================================================
            // DISPOSITIVOS
            // =================================================

            atualizar(
                "disp",
                numero(
                    primeiroValor(
                        d,
                        [
                            "dispositivos",
                            "totalDispositivos",
                            "total_dispositivos"
                        ]
                    )
                )
            );


            // =================================================
            // TOTAL GB
            // =================================================

            const totalGB = primeiroValor(
                d,
                [
                    "totalGB",
                    "totalGb",
                    "total_gb",
                    "gb",
                    "totalGbVendido"
                ]
            );


            atualizar(
                "totalGB",
                numero(totalGB) + " GB"
            );


            // =================================================
            // LUCRO
            // =================================================

            atualizar(
                "lucro",
                dinheiro(
                    primeiroValor(
                        d,
                        [
                            "lucro",
                            "lucroTotal",
                            "totalLucro"
                        ]
                    )
                )
            );


            // =================================================
            // CUSTO
            // =================================================

            atualizar(
                "custo",
                dinheiro(
                    primeiroValor(
                        d,
                        [
                            "custo",
                            "custoTotal",
                            "totalCusto"
                        ]
                    )
                )
            );


            // =================================================
            // PEDIDOS
            // =================================================

            atualizar(
                "pedidos",
                numero(
                    primeiroValor(
                        d,
                        [
                            "pedidos",
                            "totalPedidos",
                            "total_pedidos"
                        ]
                    )
                )
            );


            // =================================================
            // DATA
            // =================================================

            atualizarData();


            console.log(
                "[MOZ TECH] Dashboard carregado."
            );


            return json;

        }
        catch (erro) {

            console.error(
                "[MOZ TECH] Erro dashboard:",
                erro
            );


            /*
             * NÃO colocar "Erro" nos cards.
             *
             * Mantemos os valores anteriores.
             * Assim uma falha temporária da API
             * não destrói os valores que já estavam
             * apresentados.
             */

            const data = elemento("data");

            if (data) {

                data.textContent =
                    "Não foi possível atualizar agora";

            }


            return null;

        }
        finally {

            carregandoDashboard = false;

        }

    }


    // =====================================================
    // CARREGAR VENDAS
    // GET /api/vendas
    // =====================================================

    async function carregarVendas() {

        if (carregandoVendas) {
            return [];
        }

        carregandoVendas = true;

        try {

            console.log(
                "[MOZ TECH] A carregar /api/vendas..."
            );


            const resposta = await fetch(
                API + "/vendas",
                {
                    method: "GET",
                    headers: {
                        "Accept": "application/json"
                    },
                    cache: "no-store"
                }
            );


            if (!resposta.ok) {

                throw new Error(
                    "HTTP " + resposta.status
                );

            }


            const json =
                await resposta.json();


            console.log(
                "[MOZ TECH] Resposta vendas:",
                json
            );


            let vendas = [];


            if (Array.isArray(json)) {

                vendas = json;

            }
            else if (
                json &&
                Array.isArray(json.vendas)
            ) {

                vendas = json.vendas;

            }
            else if (
                json &&
                Array.isArray(json.data)
            ) {

                vendas = json.data;

            }
            else if (
                json &&
                json.data &&
                Array.isArray(json.data.vendas)
            ) {

                vendas = json.data.vendas;

            }


            renderizarVendas(vendas);


            return vendas;

        }
        catch (erro) {

            console.error(
                "[MOZ TECH] Erro vendas:",
                erro
            );


            /*
             * Não apagar uma tabela que já contém
             * dados por causa de uma falha temporária.
             */

            return [];

        }
        finally {

            carregandoVendas = false;

        }

    }


    // =====================================================
    // RENDERIZAR VENDAS
    // =====================================================

    function renderizarVendas(vendas) {

        const lista =
            elemento("lista");


        if (!lista) {
            return;
        }


        if (
            !Array.isArray(vendas) ||
            vendas.length === 0
        ) {

            /*
             * Só mostrar vazio se realmente
             * a API respondeu normalmente.
             */

            lista.innerHTML = `
                <tr>
                    <td
                        colspan="4"
                        style="
                            text-align:center;
                            padding:20px;
                        "
                    >
                        Nenhuma venda encontrada.
                    </td>
                </tr>
            `;

            return;

        }


        lista.innerHTML =
            vendas
                .slice(0, 20)
                .map(function (venda) {


                    // =========================================
                    // NÚMERO
                    // =========================================

                    const numeroVenda =
                        primeiroValor(
                            venda,
                            [
                                "numero",
                                "telefone",
                                "phone",
                                "msisdn"
                            ]
                        ) || "-";


                    // =========================================
                    // MB
                    // =========================================

                    const mb =
                        Number(
                            primeiroValor(
                                venda,
                                [
                                    "mb",
                                    "MB",
                                    "megabytes",
                                    "quantidadeMB"
                                ]
                            )
                        ) || 0;


                    // =========================================
                    // GB
                    // =========================================

                    const gb =
                        Number(
                            primeiroValor(
                                venda,
                                [
                                    "gb",
                                    "GB",
                                    "gbPacote",
                                    "gb_pacote",
                                    "gbpacote",
                                    "quantidadeGB"
                                ]
                            )
                        ) || 0;


                    // =========================================
                    // QUANTIDADE
                    // =========================================

                    let quantidade = "-";


                    if (gb > 0) {

                        quantidade =
                            numero(gb) +
                            " GB";

                    }
                    else if (mb > 0) {

                        quantidade =
                            numero(mb) +
                            " MB";

                    }


                    // =========================================
                    // VALOR
                    // =========================================

                    const valor =
                        primeiroValor(
                            venda,
                            [
                                "valor_venda",
                                "valorVenda",
                                "valor_pacote",
                                "valorPacote",
                                "valor",
                                "preco",
                                "preço"
                            ]
                        );


                    // =========================================
                    // STATUS
                    // =========================================

                    const status =
                        primeiroValor(
                            venda,
                            [
                                "status",
                                "estado"
                            ]
                        ) || "Concluído";


                    return `
                        <tr>

                            <td>
                                ${escapar(numeroVenda)}
                            </td>

                            <td>
                                ${escapar(quantidade)}
                            </td>

                            <td>
                                ${escapar(
                                    dinheiro(valor)
                                )}
                            </td>

                            <td>
                                <span class="status ok">
                                    ${escapar(status)}
                                </span>
                            </td>

                        </tr>
                    `;

                })
                .join("");

    }


    // =====================================================
    // CARREGAR TUDO
    // =====================================================

    async function carregarTudo() {

        /*
         * As duas chamadas são independentes.
         *
         * Se vendas falhar, dashboard continua funcionando.
         * Se dashboard falhar, vendas continuam funcionando.
         */

        await Promise.allSettled([
            carregarDashboard(),
            carregarVendas()
        ]);

    }


    // =====================================================
    // BOTÃO ATUALIZAR
    // =====================================================

    function configurarBotaoAtualizar() {

        if (botaoConfigurado) {
            return;
        }


        const botao =
            elemento("btnAtualizar");


        if (!botao) {

            console.warn(
                "[MOZ TECH] #btnAtualizar não encontrado."
            );

            return;

        }


        botaoConfigurado = true;


        botao.addEventListener(
            "click",
            async function (event) {

                event.preventDefault();
                event.stopPropagation();


                if (botao.disabled) {
                    return;
                }


                const original =
                    botao.innerHTML;


                botao.disabled = true;


                botao.innerHTML = `
                    <i class="fas fa-spinner fa-spin"></i>
                    Atualizando...
                `;


                try {

                    await carregarTudo();

                }
                finally {

                    botao.disabled = false;

                    botao.innerHTML =
                        original;

                }

            }
        );

    }


    // =====================================================
    // MENU MOBILE
    // =====================================================

    function configurarMenuMobile() {

        const menuToggle =
            elemento("menuToggle");

        const sidebar =
            elemento("sidebar");

        const overlay =
            elemento("menuOverlay");


        if (
            !menuToggle ||
            !sidebar
        ) {

            return;

        }


        function abrirMenu() {

            sidebar.classList.add("open");

            if (overlay) {
                overlay.classList.add("active");
            }

            menuToggle.setAttribute(
                "aria-expanded",
                "true"
            );

        }


        function fecharMenu() {

            sidebar.classList.remove("open");

            if (overlay) {
                overlay.classList.remove("active");
            }

            menuToggle.setAttribute(
                "aria-expanded",
                "false"
            );

        }


        menuToggle.addEventListener(
            "click",
            function (event) {

                event.preventDefault();
                event.stopPropagation();


                if (
                    sidebar.classList.contains("open")
                ) {

                    fecharMenu();

                }
                else {

                    abrirMenu();

                }

            }
        );


        if (overlay) {

            overlay.addEventListener(
                "click",
                fecharMenu
            );

        }


        document.addEventListener(
            "keydown",
            function (event) {

                if (event.key === "Escape") {
                    fecharMenu();
                }

            }
        );

    }


    // =====================================================
    // MENU DO DASHBOARD
    // =====================================================

    function configurarMenuPaineis() {

        const botoes =
            document.querySelectorAll(
                ".menu-item[data-panel]"
            );


        if (!botoes.length) {
            return;
        }


        botoes.forEach(function (botao) {

            botao.addEventListener(
                "click",
                function () {

                    const painel =
                        botao.dataset.panel;


                    if (!painel) {
                        return;
                    }


                    const mapa = {

                        dashboard:
                            "panelDashboard",

                        crm:
                            "panelCRM",

                        pacotes:
                            "panelPacotes",

                        pedidos:
                            "panelPedidos",

                        dispositivos:
                            "panelDispositivos",

                        tutorial:
                            "panelTutorial",

                        config:
                            "panelConfig"

                    };


                    Object.values(mapa)
                        .forEach(function (id) {

                            const el =
                                elemento(id);

                            if (el) {
                                el.style.display =
                                    "none";
                            }

                        });


                    const alvo =
                        elemento(
                            mapa[painel]
                        );


                    if (alvo) {

                        alvo.style.display =
                            "block";

                    }


                    botoes.forEach(function (b) {

                        b.classList.remove(
                            "active"
                        );

                    });


                    botao.classList.add(
                        "active"
                    );


                    /*
                     * Fechar menu no celular.
                     */

                    const sidebar =
                        elemento("sidebar");

                    const overlay =
                        elemento("menuOverlay");

                    if (sidebar) {
                        sidebar.classList.remove(
                            "open"
                        );
                    }

                    if (overlay) {
                        overlay.classList.remove(
                            "active"
                        );
                    }

                }
            );

        });

    }


    // =====================================================
    // EXPORTAR
    // =====================================================

    window.carregarDashboard =
        carregarDashboard;


    window.carregarVendas =
        carregarVendas;


    window.carregarTabela =
        carregarVendas;


    window.carregarTudo =
        carregarTudo;


    // =====================================================
    // INICIALIZAÇÃO
    // =====================================================

    document.addEventListener(
        "DOMContentLoaded",
        function () {

            console.log(
                "[MOZ TECH] Dashboard iniciado."
            );


            configurarBotaoAtualizar();

            configurarMenuMobile();

            configurarMenuPaineis();


            /*
             * Uma única inicialização.
             */

            carregarTudo();

        }
    );


    // =====================================================
    // ATUALIZAÇÃO AUTOMÁTICA
    // =====================================================

    setInterval(
        function () {

            carregarDashboard();

        },
        5000
    );


    setInterval(
        function () {

            carregarVendas();

        },
        5000
    );


})();
