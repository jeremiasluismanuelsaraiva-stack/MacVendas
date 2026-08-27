// ==========================================
// DASHBOARD
// ==========================================

const API = window.location.origin;


// ==========================================
// FORMATAR NÚMEROS
// ==========================================

function numero(valor) {

    return Number(valor || 0)
        .toLocaleString("pt-PT");

}


// ==========================================
// FORMATAR DINHEIRO
// ==========================================

function dinheiro(valor) {

    return Number(valor || 0)
        .toLocaleString("pt-PT", {

            minimumFractionDigits: 2,

            maximumFractionDigits: 2

        }) + " MT";

}


// ==========================================
// CARREGAR ESTATÍSTICAS
// ==========================================

async function carregarDashboard() {

    try {

        console.log(
            "Carregando estatísticas do Dashboard..."
        );


        const resposta =
            await fetch(
                API + "/relatorios",
                {
                    method: "GET",
                    cache: "no-store"
                }
            );


        if (!resposta.ok) {

            throw new Error(
                "Erro HTTP: " +
                resposta.status
            );

        }


        const dados =
            await resposta.json();


        console.log(
            "Resposta /relatorios:",
            dados
        );


        if (!dados.success) {

            console.error(
                "API retornou erro:",
                dados
            );

            return;

        }


        const resumo =
            dados.resumo || {};


        // ==========================================
        // TOTAL DE VENDAS
        // ==========================================

        const elementoVendas =
            document.getElementById(
                "vendas"
            );


        if (elementoVendas) {

            elementoVendas.textContent =
                numero(
                    resumo.totalVendas
                );

        }


        // ==========================================
        // FATURAMENTO
        // ==========================================

        const elementoValor =
            document.getElementById(
                "valor"
            );


        if (elementoValor) {

            elementoValor.textContent =
                dinheiro(
                    resumo.faturamento
                );

        }


        // ==========================================
        // CLIENTES
        // ==========================================

        const elementoClientes =
            document.getElementById(
                "clientes"
            );


        if (elementoClientes) {

            elementoClientes.textContent =
                numero(
                    resumo.totalClientes
                );

        }


        // ==========================================
        // DISPOSITIVOS
        // ==========================================

        const elementoDispositivos =
            document.getElementById(
                "disp"
            );


        if (elementoDispositivos) {

            elementoDispositivos.textContent =
                numero(
                    resumo.totalDispositivos
                );

        }


        // ==========================================
        // TOTAL GB
        // ==========================================

        const elementoGB =
            document.getElementById(
                "totalGB"
            );


        if (elementoGB) {

            elementoGB.textContent =
                numero(
                    resumo.totalGB
                );

        }


        // ==========================================
        // LUCRO
        // ==========================================

        const elementoLucro =
            document.getElementById(
                "lucro"
            );


        if (elementoLucro) {

            elementoLucro.textContent =
                dinheiro(
                    resumo.lucro
                );

        }


        // ==========================================
        // CUSTO
        // ==========================================

        const elementoCusto =
            document.getElementById(
                "custo"
            );


        if (elementoCusto) {

            elementoCusto.textContent =
                dinheiro(
                    resumo.custo
                );

        }


        // ==========================================
        // PEDIDOS
        // ==========================================

        const elementoPedidos =
            document.getElementById(
                "pedidos"
            );


        if (elementoPedidos) {

            elementoPedidos.textContent =
                numero(
                    resumo.totalPedidos
                );

        }


        // ==========================================
        // ATUALIZAR GRÁFICOS
        // ==========================================

        if (
            typeof window.atualizarGraficos ===
            "function"
        ) {

            try {

                window.atualizarGraficos(
                    dados
                );

            }
            catch (erroGrafico) {

                console.error(
                    "Erro ao atualizar gráficos:",
                    erroGrafico
                );

            }

        }


        atualizarData();


    }
    catch (erro) {

        console.error(
            "ERRO AO CARREGAR DASHBOARD:",
            erro
        );

    }

}


// ==========================================
// CARREGAR TABELA DE VENDAS
// ==========================================

async function carregarTabela() {

    try {

        console.log(
            "Carregando vendas..."
        );


        const resposta =
            await fetch(
                API + "/vendas",
                {
                    method: "GET",
                    cache: "no-store"
                }
            );


        if (!resposta.ok) {

            throw new Error(
                "Erro HTTP: " +
                resposta.status
            );

        }


        const respostaJSON =
            await resposta.json();


        let vendas = [];


        // ==========================================
        // API PODE RETORNAR ARRAY DIRETO
        // ==========================================

        if (
            Array.isArray(
                respostaJSON
            )
        ) {

            vendas =
                respostaJSON;

        }


        // ==========================================
        // OU { vendas: [] }
        // ==========================================

        else if (
            Array.isArray(
                respostaJSON.vendas
            )
        ) {

            vendas =
                respostaJSON.vendas;

        }


        const lista =
            document.getElementById(
                "lista"
            );


        if (!lista) {

            console.warn(
                "Elemento #lista não encontrado."
            );

            return;

        }


        lista.innerHTML = "";


        // ==========================================
        // SEM VENDAS
        // ==========================================

        if (
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


        // ==========================================
        // MOSTRAR VENDAS
        // ==========================================

        vendas.forEach(
            venda => {

                const tr =
                    document.createElement(
                        "tr"
                    );


                // ==========================================
                // NÚMERO
                // ==========================================

                const numeroCliente =
                    venda.numero ||
                    "-";


                // ==========================================
                // MB
                // ==========================================

                let mb =
                    Number(
                        venda.mb || 0
                    );


                // Se não tiver MB mas tiver GB
                if (
                    mb === 0 &&
                    venda.gb
                ) {

                    mb =
                        Number(
                            venda.gb
                        ) * 1024;

                }


                // ==========================================
                // VALOR
                // ==========================================

                const valor =
                    venda.valor_venda ??
                    venda.valor_pacote ??
                    venda.valor ??
                    0;


                // ==========================================
                // STATUS
                // ==========================================

                const status =
                    venda.status ||
                    "Concluído";


                tr.innerHTML = `

                    <td>
                        ${numeroCliente}
                    </td>

                    <td>
                        ${numero(mb)} MB
                    </td>

                    <td>
                        ${dinheiro(valor)}
                    </td>

                    <td>

                        <span class="status ok">

                            ${status}

                        </span>

                    </td>

                `;


                lista.appendChild(
                    tr
                );

            }
        );


    }
    catch (erro) {

        console.error(
            "ERRO AO CARREGAR VENDAS:",
            erro
        );

    }

}


// ==========================================
// ATUALIZAR DATA
// ==========================================

function atualizarData() {

    const elemento =
        document.getElementById(
            "data"
        );


    if (!elemento) {

        return;

    }


    elemento.textContent =
        new Date()
            .toLocaleString(
                "pt-PT"
            );

}


// ==========================================
// ATUALIZAR TUDO
// ==========================================

async function atualizarDashboard() {

    console.log(
        "================================="
    );

    console.log(
        "ATUALIZANDO DASHBOARD"
    );

    console.log(
        "================================="
    );


    const botao =
        document.getElementById(
            "atualizarBtn"
        );


    const botaoRefresh =
        document.getElementById(
            "refreshBtn"
        );


    const botoes = [
        botao,
        botaoRefresh
    ];


    // ==========================================
    // DESATIVAR BOTÃO
    // ==========================================

    botoes.forEach(
        elemento => {

            if (!elemento) {
                return;
            }

            elemento.disabled = true;

            elemento.classList.add(
                "loading"
            );

        }
    );


    try {

        await Promise.all([

            carregarDashboard(),

            carregarTabela()

        ]);


        console.log(
            "Dashboard atualizado com sucesso."
        );


    }
    catch (erro) {

        console.error(
            "Erro ao atualizar:",
            erro
        );

    }
    finally {

        // ==========================================
        // REATIVAR BOTÃO
        // ==========================================

        botoes.forEach(
            elemento => {

                if (!elemento) {
                    return;
                }

                elemento.disabled =
                    false;

                elemento.classList.remove(
                    "loading"
                );

            }
        );

    }

}


// ==========================================
// INICIALIZAR BOTÃO ATUALIZAR
// ==========================================

function inicializarBotaoAtualizar() {

    const seletores = [

        "#atualizarBtn",

        "#refreshBtn",

        ".btn-atualizar",

        ".refresh-btn",

        "[data-action='atualizar']"

    ];


    const botoes =
        document.querySelectorAll(
            seletores.join(",")
        );


    console.log(
        "Botões de atualizar encontrados:",
        botoes.length
    );


    botoes.forEach(
        botao => {

            // Evitar adicionar evento duas vezes
            if (
                botao.dataset.dashboardEvento ===
                "true"
            ) {

                return;

            }


            botao.dataset.dashboardEvento =
                "true";


            botao.addEventListener(
                "click",
                async function(e) {

                    e.preventDefault();

                    e.stopPropagation();


                    await atualizarDashboard();

                }
            );

        }
    );

}


// ==========================================
// DISPONIBILIZAR FUNÇÕES GLOBALMENTE
// ==========================================

window.carregarDashboard =
    carregarDashboard;


window.carregarTabela =
    carregarTabela;


window.atualizarDashboard =
    atualizarDashboard;


window.atualizarData =
    atualizarData;


// ==========================================
// INICIALIZAÇÃO
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    function() {

        console.log(
            "================================="
        );

        console.log(
            "DASHBOARD.JS INICIADO"
        );

        console.log(
            "================================="
        );


        atualizarData();


        carregarDashboard();


        carregarTabela();


        inicializarBotaoAtualizar();

    }
);


// ==========================================
// ATUALIZAÇÃO AUTOMÁTICA
// ==========================================

setInterval(
    function() {

        carregarDashboard();

    },
    5000
);


setInterval(
    function() {

        carregarTabela();

    },
    5000
);
