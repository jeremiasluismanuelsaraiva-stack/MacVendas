// =====================================================
// DASHBOARD.JS
// Local: public/js/dashboard.js
// =====================================================

(function () {

    "use strict";


    // =================================================
    // API
    // =================================================

    const API = "/api";


    // =================================================
    // FORMATAR NÚMEROS
    // =================================================

    function numero(valor) {

        const n = Number(valor);

        if (!Number.isFinite(n)) {
            return "0";
        }

        return n.toLocaleString("pt-MZ", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        });

    }


    // =================================================
    // FORMATAR MT
    // =================================================

    function dinheiro(valor) {

        const n = Number(valor);

        if (!Number.isFinite(n)) {
            return "0 MT";
        }

        return n.toLocaleString("pt-MZ", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }) + " MT";

    }


    // =================================================
    // ELEMENTO
    // =================================================

    function elemento(id) {

        return document.getElementById(id);

    }


    // =================================================
    // ATUALIZAR ELEMENTO
    // =================================================

    function atualizar(id, valor) {

        const el = elemento(id);

        if (el) {

            el.textContent = valor;

        }

    }


    // =================================================
    // CARREGAR DASHBOARD
    // GET /api/dashboard
    // =================================================

    async function carregarDashboard() {

        try {

            console.log(
                "Carregando dashboard..."
            );


            const resposta =
                await fetch(
                    API + "/dashboard",
                    {
                        method: "GET",
                        headers: {
                            "Accept": "application/json"
                        },
                        cache: "no-store"
                    }
                );


            console.log(
                "Dashboard HTTP:",
                resposta.status
            );


            if (!resposta.ok) {

                throw new Error(
                    "Erro HTTP " +
                    resposta.status
                );

            }


            const json =
                await resposta.json();


            console.log(
                "Dashboard API:",
                json
            );


            if (
                !json ||
                json.success !== true
            ) {

                throw new Error(
                    json?.error ||
                    "API retornou erro."
                );

            }


            const d =
                json.dashboard || {};


            // =========================================
            // ESTATÍSTICAS
            // =========================================

            atualizar(
                "vendas",
                numero(d.vendas)
            );


            atualizar(
                "valor",
                dinheiro(d.faturamento)
            );


            atualizar(
                "clientes",
                numero(d.clientes)
            );


            atualizar(
                "disp",
                numero(d.dispositivos)
            );


            atualizar(
                "totalGB",
                numero(d.totalGB) + " GB"
            );


            atualizar(
                "lucro",
                dinheiro(d.lucro)
            );


            atualizar(
                "custo",
                dinheiro(d.custo)
            );


            atualizar(
                "pedidos",
                numero(d.pedidos)
            );


            // =========================================
            // DATA
            // =========================================

            const data =
                elemento("data");

            if (data) {

                data.textContent =
                    "Atualizado em " +
                    new Date()
                        .toLocaleString("pt-MZ");

            }


            // =========================================
            // CARREGAR ÚLTIMAS VENDAS
            // =========================================

            await carregarVendas();


            console.log(
                "Dashboard carregado com sucesso."
            );


            return json;


        }
        catch (erro) {

            console.error(
                "Erro ao carregar dashboard:",
                erro
            );


            atualizar(
                "vendas",
                "Erro"
            );

            atualizar(
                "valor",
                "Erro"
            );

            atualizar(
                "clientes",
                "Erro"
            );

            atualizar(
                "disp",
                "Erro"
            );

            atualizar(
                "totalGB",
                "Erro"
            );

            atualizar(
                "lucro",
                "Erro"
            );

            atualizar(
                "custo",
                "Erro"
            );

            atualizar(
                "pedidos",
                "Erro"
            );


            const data =
                elemento("data");

            if (data) {

                data.textContent =
                    "Erro ao carregar";

            }


            const lista =
                elemento("lista");

            if (lista) {

                lista.innerHTML = `
                    <tr>
                        <td
                            colspan="4"
                            style="text-align:center;padding:20px"
                        >
                            Erro ao carregar vendas.
                        </td>
                    </tr>
                `;

            }


            throw erro;

        }

    }


    // =================================================
    // CARREGAR VENDAS
    // GET /api/vendas
    // =================================================

    async function carregarVendas() {

        try {

            console.log(
                "Carregando vendas..."
            );


            const resposta =
                await fetch(
                    API + "/vendas",
                    {
                        method: "GET",
                        headers: {
                            "Accept": "application/json"
                        },
                        cache: "no-store"
                    }
                );


            console.log(
                "Vendas HTTP:",
                resposta.status
            );


            if (!resposta.ok) {

                throw new Error(
                    "Erro HTTP vendas: " +
                    resposta.status
                );

            }


            const json =
                await resposta.json();


            console.log(
                "Vendas API:",
                json
            );


            let vendas;


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
            else {

                vendas = [];

            }


            renderizarVendas(
                vendas
            );


            return vendas;


        }
        catch (erro) {

            console.error(
                "Erro ao carregar vendas:",
                erro
            );


            const lista =
                elemento("lista");

            if (lista) {

                lista.innerHTML = `
                    <tr>
                        <td
                            colspan="4"
                            style="text-align:center;padding:20px"
                        >
                            Erro ao carregar vendas.
                        </td>
                    </tr>
                `;

            }


            throw erro;

        }

    }


    // =================================================
    // MOSTRAR VENDAS
    // =================================================

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
                        style="text-align:center;padding:20px"
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


                    const numeroVenda =
                        venda.numero ||
                        venda.telefone ||
                        "-";


                    const mb =
                        Number(
                            venda.mb || 0
                        );


                    let gb =
                        Number(
                            venda.gb ||
                            venda.gbPacote ||
                            venda.gb_pacote ||
                            0
                        );


                    let quantidade;


                    if (
                        gb > 0
                    ) {

                        quantidade =
                            numero(gb) +
                            " GB";

                    }
                    else if (
                        mb > 0
                    ) {

                        quantidade =
                            numero(mb) +
                            " MB";

                    }
                    else {

                        quantidade =
                            "-";

                    }


                    const valor =
                        Number(
                            venda.valor_venda ??
                            venda.valor_pacote ??
                            venda.valorPacote ??
                            venda.valor ??
                            0
                        );


                    const status =
                        venda.status ||
                        "Concluído";


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
                                <span class="status ok">
                                    ${escapar(
                                        status
                                    )}
                                </span>
                            </td>

                        </tr>
                    `;

                })
                .join("");

    }


    // =================================================
    // PROTEGER HTML
    // =================================================

    function escapar(valor) {

        return String(valor ?? "")
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


    // =================================================
    // BOTÃO ATUALIZAR
    // =================================================

    function configurarBotaoAtualizar() {

        const botao =
            elemento("btnAtualizar");


        if (!botao) {

            return;

        }


        botao.addEventListener(
            "click",
            async function () {

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

                    await carregarDashboard();

                }
                catch (erro) {

                    console.error(
                        erro
                    );

                }
                finally {

                    botao.disabled = false;

                    botao.innerHTML =
                        original;

                }

            }
        );

    }


    // =================================================
    // EXPORTAR PARA WINDOW
    // =================================================

    window.carregarDashboard =
        carregarDashboard;


    window.carregarVendas =
        carregarVendas;


    window.carregarTabela =
        carregarVendas;


    // =================================================
    // INICIALIZAÇÃO
    // =================================================

    document.addEventListener(
        "DOMContentLoaded",
        function () {

            configurarBotaoAtualizar();

            carregarDashboard()
                .catch(function (erro) {

                    console.error(
                        "Falha inicial:",
                        erro
                    );

                });

        }
    );


})();
