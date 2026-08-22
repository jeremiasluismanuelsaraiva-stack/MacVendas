// =====================================================
// MACVENDAS - DASHBOARD
// =====================================================

const API = window.location.origin;


// =====================================================
// VARIÁVEIS DOS GRÁFICOS
// =====================================================

let graficoHoje = null;
let graficoDias = null;
let graficoMeses = null;


// =====================================================
// FORMATAR NÚMEROS
// =====================================================

function numero(valor) {

    return Number(valor || 0)
        .toLocaleString("pt-PT");

}


// =====================================================
// CARREGAR DADOS DO DASHBOARD
// =====================================================

async function carregarDashboard() {

    try {

        const resposta =
            await fetch(API + "/relatorios");


        if (!resposta.ok) {

            throw new Error(
                "Erro HTTP: " +
                resposta.status
            );

        }


        const dados =
            await resposta.json();


        if (!dados.success) {

            return;

        }


        const resumo =
            dados.resumo || {};


        // ==========================================
        // VENDAS
        // ==========================================

        const vendas =
            document.getElementById("vendas");


        if (vendas) {

            vendas.textContent =
                numero(
                    resumo.totalVendas
                );

        }


        // ==========================================
        // FATURAMENTO
        // ==========================================

        const valor =
            document.getElementById("valor");


        if (valor) {

            valor.textContent =
                numero(
                    resumo.faturamento
                ) + " MT";

        }


        // ==========================================
        // CLIENTES
        // ==========================================

        const clientes =
            document.getElementById("clientes");


        if (clientes) {

            clientes.textContent =
                numero(
                    resumo.totalClientes
                );

        }


        // ==========================================
        // DISPOSITIVOS
        // ==========================================

        const dispositivos =
            document.getElementById("disp");


        if (dispositivos) {

            dispositivos.textContent =
                numero(
                    resumo.totalDispositivos
                );

        }


        // ==========================================
        // TOTAL GB
        // ==========================================

        const totalGB =
            document.getElementById("totalGB");


        if (totalGB) {

            totalGB.textContent =
                numero(
                    resumo.totalGB
                );

        }


        // ==========================================
        // LUCRO
        // ==========================================

        const lucro =
            document.getElementById("lucro");


        if (lucro) {

            lucro.textContent =
                numero(
                    resumo.lucro
                ) + " MT";

        }


        // ==========================================
        // CUSTO
        // ==========================================

        const custo =
            document.getElementById("custo");


        if (custo) {

            custo.textContent =
                numero(
                    resumo.custo
                ) + " MT";

        }


        // ==========================================
        // PEDIDOS
        // ==========================================

        const pedidos =
            document.getElementById("pedidos");


        if (pedidos) {

            pedidos.textContent =
                numero(
                    resumo.totalPedidos
                );

        }


    }
    catch (erro) {

        console.error(
            "Erro ao carregar dashboard:",
            erro
        );

    }

}


// =====================================================
// CARREGAR TABELA DE VENDAS
// =====================================================

async function carregarTabela() {

    try {

        const resposta =
            await fetch(
                API + "/vendas"
            );


        if (!resposta.ok) {

            throw new Error(
                "Erro HTTP: " +
                resposta.status
            );

        }


        const json =
            await resposta.json();


        const vendas =
            Array.isArray(json)
                ? json
                : (
                    Array.isArray(json.vendas)
                        ? json.vendas
                        : []
                );


        const lista =
            document.getElementById(
                "lista"
            );


        if (!lista) {

            return;

        }


        lista.innerHTML = "";


        if (vendas.length === 0) {

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


        vendas.forEach(
            venda => {

                const tr =
                    document.createElement(
                        "tr"
                    );


                tr.innerHTML = `

                    <td>
                        ${venda.numero || "-"}
                    </td>

                    <td>
                        ${
                            venda.mb ||
                            venda.gb ||
                            0
                        }
                    </td>

                    <td>
                        ${
                            venda.valor_venda ??
                            venda.valor ??
                            0
                        } MT
                    </td>

                    <td>

                        <span class="status ok">

                            ${
                                venda.status ||
                                "Concluído"
                            }

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
            "Erro ao carregar tabela:",
            erro
        );

    }

}


// =====================================================
// CARREGAR GRÁFICOS
// =====================================================

async function carregarGraficos() {

    try {

        const resposta =
            await fetch(
                API + "/relatorios"
            );


        if (!resposta.ok) {

            throw new Error(
                "Erro HTTP: " +
                resposta.status
            );

        }


        const dados =
            await resposta.json();


        if (!dados.success) {

            return;

        }


        const vendasPorDia =
            dados.vendasPorDia || {};


        const vendasPorMes =
            dados.vendasPorMes || {};


        // ==========================================
        // GRÁFICO DE HOJE
        // ==========================================

        const canvasHoje =
            document.getElementById(
                "graficoHoje"
            );


        if (
            canvasHoje &&
            typeof Chart !== "undefined"
        ) {

            if (graficoHoje) {

                graficoHoje.destroy();

            }


            const hoje =
                new Date()
                    .toISOString()
                    .substring(
                        0,
                        10
                    );


            const vendasHoje =
                vendasPorDia[hoje] || 0;


            graficoHoje =
                new Chart(
                    canvasHoje,
                    {

                        type: "bar",

                        data: {

                            labels: [
                                "Hoje"
                            ],

                            datasets: [

                                {

                                    label:
                                        "Vendas",

                                    data: [
                                        vendasHoje
                                    ],

                                    borderWidth:
                                        0,

                                    borderRadius:
                                        8

                                }

                            ]

                        },

                        options: {

                            responsive:
                                true,

                            maintainAspectRatio:
                                false,

                            plugins: {

                                legend: {

                                    display:
                                        false

                                }

                            },

                            scales: {

                                y: {

                                    beginAtZero:
                                        true,

                                    ticks: {

                                        precision:
                                            0

                                    }

                                }

                            }

                        }

                    }
                );

        }


        // ==========================================
        // GRÁFICO POR DIA
        // ==========================================

        const canvasDias =
            document.getElementById(
                "graficoDias"
            );


        if (
            canvasDias &&
            typeof Chart !== "undefined"
        ) {

            if (graficoDias) {

                graficoDias.destroy();

            }


            graficoDias =
                new Chart(
                    canvasDias,
                    {

                        type: "line",

                        data: {

                            labels:
                                Object.keys(
                                    vendasPorDia
                                ),

                            datasets: [

                                {

                                    label:
                                        "Vendas",

                                    data:
                                        Object.values(
                                            vendasPorDia
                                        ),

                                    borderWidth:
                                        3,

                                    tension:
                                        0.4,

                                    fill:
                                        false

                                }

                            ]

                        },

                        options: {

                            responsive:
                                true,

                            maintainAspectRatio:
                                false,

                            plugins: {

                                legend: {

                                    display:
                                        false

                                }

                            },

                            scales: {

                                y: {

                                    beginAtZero:
                                        true,

                                    ticks: {

                                        precision:
                                            0

                                    }

                                }

                            }

                        }

                    }
                );

        }


        // ==========================================
        // GRÁFICO POR MÊS
        // ==========================================

        const canvasMeses =
            document.getElementById(
                "graficoMeses"
            );


        if (
            canvasMeses &&
            typeof Chart !== "undefined"
        ) {

            if (graficoMeses) {

                graficoMeses.destroy();

            }


            graficoMeses =
                new Chart(
                    canvasMeses,
                    {

                        type: "bar",

                        data: {

                            labels:
                                Object.keys(
                                    vendasPorMes
                                ),

                            datasets: [

                                {

                                    label:
                                        "Vendas",

                                    data:
                                        Object.values(
                                            vendasPorMes
                                        ),

                                    borderWidth:
                                        0,

                                    borderRadius:
                                        8

                                }

                            ]

                        },

                        options: {

                            responsive:
                                true,

                            maintainAspectRatio:
                                false,

                            plugins: {

                                legend: {

                                    display:
                                        false

                                }

                            },

                            scales: {

                                y: {

                                    beginAtZero:
                                        true,

                                    ticks: {

                                        precision:
                                            0

                                    }

                                }

                            }

                        }

                    }
                );

        }


    }
    catch (erro) {

        console.error(
            "Erro ao carregar gráficos:",
            erro
        );

    }

}


// =====================================================
// CARREGAR CREDENCIAIS DA API
// =====================================================

async function carregarCredenciaisAPI() {

    try {

        console.log(
            "Carregando credenciais da API..."
        );


        // ==========================================
        // VERIFICAR SE A FUNÇÃO EXISTE
        // ==========================================

        if (
            typeof window.obterDadosUsuario !==
            "function"
        ) {

            console.error(
                "obterDadosUsuario não está disponível."
            );

            return;

        }


        // ==========================================
        // BUSCAR USUÁRIO
        // ==========================================

        const dados =
            await window.obterDadosUsuario();


        if (!dados) {

            console.warn(
                "Usuário não autenticado."
            );

            return;

        }


        console.log(
            "Dados do usuário:",
            dados
        );


        // ==========================================
        // UID
        // ==========================================

        const elementoUID =
            document.getElementById(
                "tutorialUid"
            );


        if (elementoUID) {

            elementoUID.textContent =
                dados.uid ||
                "Não disponível";

        }


        // ==========================================
        // API KEY
        // ==========================================

        const elementoAPI =
            document.getElementById(
                "tutorialApiKey"
            );


        if (elementoAPI) {

            elementoAPI.textContent =
                dados.apiKey ||
                "Não disponível";

        }


        // ==========================================
        // BOTÃO COPIAR UID
        // ==========================================

        const copiarUID =
            document.getElementById(
                "copiarUid"
            );


        if (copiarUID) {

            copiarUID.onclick =
                async function () {

                    if (!dados.uid) {

                        return;

                    }


                    try {

                        await navigator
                            .clipboard
                            .writeText(
                                dados.uid
                            );


                        const textoOriginal =
                            "Copiar UID";


                        copiarUID.textContent =
                            "Copiado!";


                        setTimeout(
                            () => {

                                copiarUID.textContent =
                                    textoOriginal;

                            },
                            1500
                        );

                    }
                    catch (erro) {

                        console.error(
                            "Erro ao copiar UID:",
                            erro
                        );

                    }

                };

        }


        // ==========================================
        // BOTÃO COPIAR API KEY
        // ==========================================

        const copiarAPI =
            document.getElementById(
                "copiarApiKey"
            );


        if (copiarAPI) {

            copiarAPI.onclick =
                async function () {

                    if (!dados.apiKey) {

                        return;

                    }


                    try {

                        await navigator
                            .clipboard
                            .writeText(
                                dados.apiKey
                            );


                        const textoOriginal =
                            "Copiar API Key";


                        copiarAPI.textContent =
                            "Copiado!";


                        setTimeout(
                            () => {

                                copiarAPI.textContent =
                                    textoOriginal;

                            },
                            1500
                        );

                    }
                    catch (erro) {

                        console.error(
                            "Erro ao copiar API Key:",
                            erro
                        );

                    }

                };

        }


    }
    catch (erro) {

        console.error(
            "Erro ao carregar credenciais:",
            erro
        );

    }

}


// =====================================================
// DATA ATUAL
// =====================================================

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


// =====================================================
// DISPONIBILIZAR FUNÇÕES PARA app.js
// =====================================================

window.carregarDashboard =
    carregarDashboard;


window.carregarTabela =
    carregarTabela;


window.carregarGraficos =
    carregarGraficos;


window.carregarCredenciaisAPI =
    carregarCredenciaisAPI;


// =====================================================
// INICIALIZAÇÃO
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        atualizarData();

        carregarDashboard();

        carregarTabela();

        carregarGraficos();

        carregarCredenciaisAPI();

    }
);


// =====================================================
// ATUALIZAÇÃO AUTOMÁTICA
// =====================================================

setInterval(
    carregarDashboard,
    5000
);


setInterval(
    carregarTabela,
    5000
);


setInterval(
    carregarGraficos,
    10000
);


// =====================================================
// FIM
// =====================================================
