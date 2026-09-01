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


        return n.toLocaleString(
            "pt-MZ",
            {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2
            }
        );

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


        return n.toLocaleString(
            "pt-MZ",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        ) + " MT";

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

            const campo =
                campos[i];


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

            console.log(
                "[MOZ TECH] Dashboard já está carregando."
            );

            return null;

        }


        carregandoDashboard =
            true;


        try {

            console.log(
                "[MOZ TECH] GET /api/dashboard"
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
                "[MOZ TECH] Resposta dashboard:",
                json
            );


            /*
             * Aceita:
             *
             * {
             *     success: true,
             *     dashboard: {...}
             * }
             */


            if (
                !json
            ) {

                throw new Error(
                    "Resposta vazia da API."
                );

            }


            if (
                json.success === false
            ) {

                throw new Error(
                    json.error ||
                    "API retornou erro."
                );

            }


            const d =
                json.dashboard ||
                json.data ||
                json;


            if (
                !d ||
                typeof d !== "object"
            ) {

                throw new Error(
                    "Dados do dashboard inválidos."
                );

            }


            // =================================================
            // VENDAS
            // =================================================

            const vendas =
                primeiroValor(
                    d,
                    [
                        "vendas",
                        "totalVendas",
                        "total_vendas"
                    ]
                );


            atualizar(
                "vendas",
                numero(vendas)
            );


            // =================================================
            // FATURAMENTO
            // =================================================

            const faturamento =
                primeiroValor(
                    d,
                    [
                        "faturamento",
                        "totalFaturamento",
                        "total_faturamento"
                    ]
                );


            atualizar(
                "valor",
                dinheiro(faturamento)
            );


            // =================================================
            // CLIENTES
            // =================================================

            const clientes =
                primeiroValor(
                    d,
                    [
                        "clientes",
                        "totalClientes",
                        "total_clientes"
                    ]
                );


            atualizar(
                "clientes",
                numero(clientes)
            );


            // =================================================
            // DISPOSITIVOS
            // =================================================

            const dispositivos =
                primeiroValor(
                    d,
                    [
                        "dispositivos",
                        "totalDispositivos",
                        "total_dispositivos"
                    ]
                );


            atualizar(
                "disp",
                numero(dispositivos)
            );


            // =================================================
            // TOTAL GB
            // =================================================

            const totalGB =
                primeiroValor(
                    d,
                    [
                        "totalGB",
                        "totalGb",
                        "total_gb",
                        "gb"
                    ]
                );


            atualizar(
                "totalGB",
                numero(totalGB) +
                " GB"
            );


            // =================================================
            // LUCRO
            // =================================================

            const lucro =
                primeiroValor(
                    d,
                    [
                        "lucro",
                        "totalLucro",
                        "total_lucro"
                    ]
                );


            atualizar(
                "lucro",
                dinheiro(lucro)
            );


            // =================================================
            // CUSTO
            // =================================================

            const custo =
                primeiroValor(
                    d,
                    [
                        "custo",
                        "totalCusto",
                        "total_custo"
                    ]
                );


            atualizar(
                "custo",
                dinheiro(custo)
            );


            // =================================================
            // PEDIDOS
            // =================================================

            const pedidos =
                primeiroValor(
                    d,
                    [
                        "pedidos",
                        "totalPedidos",
                        "total_pedidos"
                    ]
                );


            atualizar(
                "pedidos",
                numero(pedidos)
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
                "[MOZ TECH] Dashboard carregado com sucesso."
            );


            return json;

        }
        catch (erro) {

            console.error(
                "[MOZ TECH] Erro ao carregar dashboard:",
                erro
            );


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

            console.log(
                "[MOZ TECH] Vendas já estão carregando."
            );

            return [];

        }


        carregandoVendas =
            true;


        try {

            console.log(
                "[MOZ TECH] GET /api/vendas"
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
                "[MOZ TECH] Resposta vendas:",
                json
            );


            let vendas = [];


            // =================================================
            // ARRAY DIRETO
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
                "[MOZ TECH] Total de vendas:",
                vendas.length
            );


            return vendas;

        }
        catch (erro) {

            console.error(
                "[MOZ TECH] Erro ao carregar vendas:",
                erro
            );


            /*
             * Não apaga os dados existentes
             * se a atualização falhar.
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

            console.warn(
                "[MOZ TECH] #lista não encontrado."
            );

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

                        // =================================
                        // NÚMERO
                        // =================================

                        const numeroVenda =
                            primeiroValor(
                                venda,
                                [
                                    "numero",
                                    "telefone",
                                    "phone",
                                    "msisdn",
                                    "numeroCliente",
                                    "numero_cliente"
                                ]
                            ) ||
                            "-";


                        // =================================
                        // MB
                        // =================================

                        const mb =
                            Number(
                                primeiroValor(
                                    venda,
                                    [
                                        "mb",
                                        "MB",
                                        "megabytes",
                                        "quantidadeMB",
                                        "quantidade_mb"
                                    ]
                                )
                            ) || 0;


                        // =================================
                        // GB
                        // =================================

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
                                        "quantidadeGB",
                                        "quantidade_gb"
                                    ]
                                )
                            ) || 0;


                        // =================================
                        // QUANTIDADE
                        // =================================

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


                        // =================================
                        // VALOR
                        // =================================

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


                        // =================================
                        // STATUS
                        // =================================

                        const status =
                            primeiroValor(
                                venda,
                                [
                                    "status",
                                    "estado"
                                ]
                            ) ||
                            "Concluído";


                        // =================================
                        // HTML
                        // =================================

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

        console.log(
            "[MOZ TECH] Atualizando dashboard completo..."
        );


        await Promise.allSettled([

            carregarDashboard(),

            carregarVendas()

        ]);


        console.log(
            "[MOZ TECH] Atualização concluída."
        );

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


                console.log(
                    "[MOZ TECH] Atualizar clicado."
                );


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
                catch (erro) {

                    console.error(
                        "[MOZ TECH] Erro no botão:",
                        erro
                    );

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
    // EXPORTAR PARA WINDOW
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

    function iniciarDashboard() {

        console.log(
            "========================================"
        );

        console.log(
            "MOZ TECH - DASHBOARD.JS"
        );

        console.log(
            "========================================"
        );


        configurarBotaoAtualizar();


        mostrarCarregando();


        /*
         * O primeiro carregamento é feito aqui.
         */

        carregarTudo()
            .catch(
                function (erro) {

                    console.error(
                        "[MOZ TECH] Erro inicial:",
                        erro
                    );

                }
            );

    }


    // =====================================================
    // DOM READY
    // =====================================================

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            iniciarDashboard,
            {
                once: true
            }
        );

    }
    else {

        iniciarDashboard();

    }


    // =====================================================
    // ATUALIZAÇÃO AUTOMÁTICA
    // =====================================================

    setInterval(
        function () {

            /*
             * Atualiza os dados sem
             * interferir no menu.
             */

            carregarDashboard();

            carregarVendas();

        },
        5000
    );


})();
