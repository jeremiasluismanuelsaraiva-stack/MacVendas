// =====================================================
// DASHBOARD.JS
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


        const n = Number(valor);


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


        const n = Number(valor);


        if (!Number.isFinite(n)) {

            return "0,00 MT";

        }


        return n.toLocaleString("pt-MZ", {

            minimumFractionDigits: 2,

            maximumFractionDigits: 2

        }) + " MT";

    }


    // =====================================================
    // PRIMEIRO VALOR EXISTENTE
    // =====================================================

    function primeiroValor(objeto, campos) {

        if (!objeto) {

            return null;

        }


        for (
            let i = 0;
            i < campos.length;
            i++
        ) {

            const campo = campos[i];


            if (
                objeto[campo] !== undefined &&
                objeto[campo] !== null &&
                objeto[campo] !== ""
            ) {

                return objeto[campo];

            }

        }


        return null;

    }


    // =====================================================
    // ATUALIZAR ELEMENTO
    // =====================================================

    function atualizar(id, valor) {

        const el =
            elemento(id);


        if (el) {

            el.textContent =
                valor;

        }

    }


    // =====================================================
    // ESCAPAR HTML
    // =====================================================

    function escapar(valor) {

        return String(
            valor ?? ""
        )

            .replace(
                /&/g,
                "&amp;"
            )

            .replace(
                /</g,
                "&lt;"
            )

            .replace(
                />/g,
                "&gt;"
            )

            .replace(
                /"/g,
                "&quot;"
            )

            .replace(
                /'/g,
                "&#039;"
            );

    }


    // =====================================================
    // MOSTRAR CARREGANDO
    // =====================================================

    function mostrarCarregando() {

        atualizar(
            "vendas",
            "..."
        );

        atualizar(
            "valor",
            "..."
        );

        atualizar(
            "clientes",
            "..."
        );

        atualizar(
            "disp",
            "..."
        );

        atualizar(
            "totalGB",
            "..."
        );

        atualizar(
            "lucro",
            "..."
        );

        atualizar(
            "custo",
            "..."
        );

        atualizar(
            "pedidos",
            "..."
        );


        const data =
            elemento("data");


        if (data) {

            data.textContent =
                "Carregando...";

        }

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
                "[MOZ TECH] Carregando dashboard..."
            );


            const resposta =
                await fetch(
                    API + "/dashboard",
                    {

                        method: "GET",

                        headers: {

                            "Accept":
                                "application/json"

                        },

                        cache: "no-store"

                    }
                );


            console.log(
                "[MOZ TECH] Dashboard HTTP:",
                resposta.status
            );


            if (!resposta.ok) {

                throw new Error(
                    "HTTP " +
                    resposta.status
                );

            }


            const json =
                await resposta.json();


            console.log(
                "[MOZ TECH] Dashboard:",
                json
            );


            if (
                !json ||
                json.success !== true
            ) {

                throw new Error(

                    json?.error ||
                    "Resposta inválida da API."

                );

            }


            const d =
                json.dashboard || {};


            // =================================================
            // VENDAS
            // =================================================

            atualizar(
                "vendas",
                numero(d.vendas)
            );


            // =================================================
            // FATURAMENTO
            // =================================================

            atualizar(
                "valor",
                dinheiro(d.faturamento)
            );


            // =================================================
            // CLIENTES
            // =================================================

            atualizar(
                "clientes",
                numero(d.clientes)
            );


            // =================================================
            // DISPOSITIVOS
            // =================================================

            atualizar(
                "disp",
                numero(d.dispositivos)
            );


            // =================================================
            // TOTAL GB
            // =================================================

            atualizar(
                "totalGB",
                numero(d.totalGB) +
                " GB"
            );


            // =================================================
            // LUCRO
            // =================================================

            atualizar(
                "lucro",
                dinheiro(d.lucro)
            );


            // =================================================
            // CUSTO
            // =================================================

            atualizar(
                "custo",
                dinheiro(d.custo)
            );


            // =================================================
            // PEDIDOS
            // =================================================

            atualizar(
                "pedidos",
                numero(d.pedidos)
            );


            // =================================================
            // DATA
            // =================================================

            const data =
                elemento("data");


            if (data) {

                data.textContent =
                    "Atualizado em " +
                    new Date()
                        .toLocaleString(
                            "pt-MZ"
                        );

            }


            console.log(
                "[MOZ TECH] Dashboard OK."
            );


            return json;

        }
        catch (erro) {

            console.error(
                "[MOZ TECH] Erro dashboard:",
                erro
            );


            /*
             * IMPORTANTE:
             * Não substituir os valores por "Erro".
             *
             * Se uma atualização falhar temporariamente,
             * mantemos os últimos valores apresentados.
             */


            const data =
                elemento("data");


            if (data) {

                data.textContent =
                    "Não foi possível atualizar agora";

            }


            return null;

        }
        finally {

            carregandoDashboard =
                false;

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
                "[MOZ TECH] Carregando vendas..."
            );


            const resposta =
                await fetch(
                    API + "/vendas",
                    {

                        method: "GET",

                        headers: {

                            "Accept":
                                "application/json"

                        },

                        cache: "no-store"

                    }
                );


            console.log(
                "[MOZ TECH] Vendas HTTP:",
                resposta.status
            );


            if (!resposta.ok) {

                throw new Error(
                    "HTTP " +
                    resposta.status
                );

            }


            const json =
                await resposta.json();


            console.log(
                "[MOZ TECH] Vendas:",
                json
            );


            let vendas = [];


            // =================================================
            // API RETORNOU ARRAY
            // =================================================

            if (
                Array.isArray(json)
            ) {

                vendas =
                    json;

            }


            // =================================================
            // { vendas: [] }
            // =================================================

            else if (
                json &&
                Array.isArray(
                    json.vendas
                )
            ) {

                vendas =
                    json.vendas;

            }


            // =================================================
            // { data: [] }
            // =================================================

            else if (
                json &&
                Array.isArray(
                    json.data
                )
            ) {

                vendas =
                    json.data;

            }


            // =================================================
            // { data: { vendas: [] } }
            // =================================================

            else if (
                json &&
                json.data &&
                Array.isArray(
                    json.data.vendas
                )
            ) {

                vendas =
                    json.data.vendas;

            }


            renderizarVendas(
                vendas
            );


            console.log(
                "[MOZ TECH] Vendas OK:",
                vendas.length
            );


            return vendas;

        }
        catch (erro) {

            console.error(
                "[MOZ TECH] Erro vendas:",
                erro
            );


            /*
             * Não apagar uma tabela que já
             * contém dados por causa de uma
             * falha temporária.
             */


            return [];

        }
        finally {

            carregandoVendas =
                false;

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

                .map(
                    function (venda) {


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

                        let quantidade =
                            "-";


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
                            ) ||
                            "Concluído";


                        // =========================================
                        // HTML
                        // =========================================

                        return `

                            <tr>

                                <td>

                                    ${escapar(
                                        numeroVenda
                                    )}

                                </td>


                                <td>

                                    ${escapar(
                                        quantidade
                                    )}

                                </td>


                                <td>

                                    ${escapar(
                                        dinheiro(valor)
                                    )}

                                </td>


                                <td>

                                    <span
                                        class="status ok"
                                    >

                                        ${escapar(
                                            status
                                        )}

                                    </span>

                                </td>

                            </tr>

                        `;

                    }
                )

                .join("");

    }


    // =====================================================
    // CARREGAR TUDO
    // =====================================================

    async function carregarTudo() {

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


        botaoConfigurado =
            true;


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


                botao.disabled =
                    true;


                botao.innerHTML = `

                    <i
                        class="fas fa-spinner fa-spin"
                    ></i>

                    Atualizando...

                `;


                try {

                    await carregarTudo();

                }
                finally {

                    botao.disabled =
                        false;


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

            sidebar.classList.add(
                "open"
            );


            if (overlay) {

                overlay.classList.add(
                    "active"
                );

            }


            menuToggle.setAttribute(
                "aria-expanded",
                "true"
            );

        }


        function fecharMenu() {

            sidebar.classList.remove(
                "open"
            );


            if (overlay) {

                overlay.classList.remove(
                    "active"
                );

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


                if (
                    sidebar.classList.contains(
                        "open"
                    )
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

                if (
                    event.key ===
                    "Escape"
                ) {

                    fecharMenu();

                }

            }
        );

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
        async function () {

            console.log(
                "[MOZ TECH] Dashboard iniciado."
            );


            mostrarCarregando();


            configurarBotaoAtualizar();


            configurarMenuMobile();


            await carregarTudo();

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
