// =====================================================
// MACVENDAS - DASHBOARD
// =====================================================

import {
    auth,
    onAuthState,
    obterDadosUsuario
} from "../firebase.js";


// =====================================================
// API
// =====================================================

const API = window.location.origin;


// =====================================================
// GRÁFICOS
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
// DASHBOARD
// =====================================================

async function carregarDashboard() {

    try {

        const resposta =
            await fetch(API + "/relatorios");

        if (!resposta.ok) {

            throw new Error(
                "HTTP " + resposta.status
            );

        }

        const dados =
            await resposta.json();

        if (!dados.success) return;

        const resumo =
            dados.resumo || {};


        const vendas =
            document.getElementById("vendas");

        const valor =
            document.getElementById("valor");

        const clientes =
            document.getElementById("clientes");

        const disp =
            document.getElementById("disp");

        const totalGB =
            document.getElementById("totalGB");

        const lucro =
            document.getElementById("lucro");

        const custo =
            document.getElementById("custo");

        const pedidos =
            document.getElementById("pedidos");


        if (vendas)
            vendas.textContent =
                numero(resumo.totalVendas);


        if (valor)
            valor.textContent =
                numero(resumo.faturamento) + " MT";


        if (clientes)
            clientes.textContent =
                numero(resumo.totalClientes);


        if (disp)
            disp.textContent =
                numero(resumo.totalDispositivos);


        if (totalGB)
            totalGB.textContent =
                numero(resumo.totalGB);


        if (lucro)
            lucro.textContent =
                numero(resumo.lucro) + " MT";


        if (custo)
            custo.textContent =
                numero(resumo.custo) + " MT";


        if (pedidos)
            pedidos.textContent =
                numero(resumo.totalPedidos);

    }
    catch (erro) {

        console.error(
            "Erro no dashboard:",
            erro
        );

    }

}


// =====================================================
// TABELA
// =====================================================

async function carregarTabela() {

    try {

        const resposta =
            await fetch(API + "/vendas");

        if (!resposta.ok) return;

        const json =
            await resposta.json();

        const vendas =
            Array.isArray(json)
                ? json
                : (json.vendas || []);

        const lista =
            document.getElementById("lista");

        if (!lista) return;

        lista.innerHTML = "";


        if (!vendas.length) {

            lista.innerHTML = `
                <tr>
                    <td colspan="4"
                        style="text-align:center;padding:20px;">
                        Nenhuma venda encontrada.
                    </td>
                </tr>
            `;

            return;

        }


        vendas.forEach(v => {

            const tr =
                document.createElement("tr");


            tr.innerHTML = `

                <td>
                    ${v.numero || "-"}
                </td>

                <td>
                    ${v.mb || v.gb || 0}
                </td>

                <td>
                    ${
                        v.valor_venda ??
                        v.valor ??
                        0
                    } MT
                </td>

                <td>
                    <span class="status ok">
                        ${
                            v.status ||
                            "Concluído"
                        }
                    </span>
                </td>

            `;


            lista.appendChild(tr);

        });

    }
    catch (erro) {

        console.error(
            "Erro na tabela:",
            erro
        );

    }

}


// =====================================================
// GRÁFICOS
// =====================================================

async function carregarGraficos() {

    try {

        if (
            typeof Chart ===
            "undefined"
        ) {

            return;

        }


        const resposta =
            await fetch(
                API + "/relatorios"
            );

        if (!resposta.ok) return;

        const dados =
            await resposta.json();

        if (!dados.success) return;


        const vendasPorDia =
            dados.vendasPorDia || {};

        const vendasPorMes =
            dados.vendasPorMes || {};


        // ==============================
        // DIA
        // ==============================

        const canvasDias =
            document.getElementById(
                "graficoDias"
            );


        if (canvasDias) {

            if (graficoDias)
                graficoDias.destroy();


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

                                    borderWidth: 3,

                                    tension: 0.4,

                                    fill: false

                                }

                            ]

                        },

                        options: {

                            responsive: true,

                            maintainAspectRatio:
                                false,

                            plugins: {

                                legend: {
                                    display: false
                                }

                            },

                            scales: {

                                y: {
                                    beginAtZero: true
                                }

                            }

                        }

                    }
                );

        }


        // ==============================
        // MÊS
        // ==============================

        const canvasMeses =
            document.getElementById(
                "graficoMeses"
            );


        if (canvasMeses) {

            if (graficoMeses)
                graficoMeses.destroy();


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

                                    borderWidth: 0,

                                    borderRadius: 8

                                }

                            ]

                        },

                        options: {

                            responsive: true,

                            maintainAspectRatio:
                                false,

                            plugins: {

                                legend: {
                                    display: false
                                }

                            },

                            scales: {

                                y: {
                                    beginAtZero: true
                                }

                            }

                        }

                    }
                );

        }

    }
    catch (erro) {

        console.error(
            "Erro nos gráficos:",
            erro
        );

    }

}


// =====================================================
// CREDENCIAIS DA API
// =====================================================

async function carregarCredenciaisAPI() {

    console.log(
        "Carregando credenciais..."
    );


    try {

        // ==============================================
        // ESPERAR FIREBASE
        // ==============================================

        let usuario =
            auth.currentUser;


        if (!usuario) {

            usuario =
                await new Promise(resolve => {

                    const cancelar =
                        onAuthState(
                            user => {

                                cancelar();

                                resolve(user);

                            }
                        );

                });

        }


        // ==============================================
        // SEM LOGIN
        // ==============================================

        if (!usuario) {

            console.error(
                "Usuário não autenticado."
            );

            return;

        }


        console.log(
            "Usuário:",
            usuario.uid
        );


        // ==============================================
        // BUSCAR USERS/UID
        // ==============================================

        const dados =
            await obterDadosUsuario();


        if (!dados) {

            console.error(
                "Dados do usuário não encontrados."
            );

            return;

        }


        console.log(
            "Dados encontrados:",
            dados
        );


        // ==============================================
        // UID
        // ==============================================

        const elementoUID =
            document.getElementById(
                "tutorialUid"
            );


        if (elementoUID) {

            elementoUID.textContent =
                dados.uid ||
                usuario.uid;

        }


        // ==============================================
        // API KEY
        // ==============================================

        const elementoAPI =
            document.getElementById(
                "tutorialApiKey"
            );


        if (elementoAPI) {

            elementoAPI.textContent =
                dados.apiKey ||
                "API Key não encontrada";

        }


        // ==============================================
// COPIAR UID
// ==============================================

const botaoUID =
    document.getElementById(
        "copyTutorialUidBtn"
    );


if (botaoUID) {

    botaoUID.onclick =
        async () => {

            const uid =
                dados.uid ||
                usuario.uid;


            await navigator.clipboard
                .writeText(uid);


            botaoUID.textContent =
                "Copiado!";


            setTimeout(
                () => {

                    botaoUID.textContent =
                        "Copiar UID";

                },
                1500
            );

        };

}


// ==============================================
// COPIAR API KEY
// ==============================================

const botaoAPI =
    document.getElementById(
        "copyTutorialApiKeyBtn"
    );


if (botaoAPI) {

    botaoAPI.onclick =
        async () => {

            const apiKey =
                dados.apiKey;


            if (!apiKey) {

                alert(
                    "API Key não encontrada."
                );

                return;

            }


            await navigator.clipboard
                .writeText(
                    apiKey
                );


            botaoAPI.textContent =
                "Copiado!";


            setTimeout(
                () => {

                    botaoAPI.textContent =
                        "Copiar API Key";

                },
                1500
            );

        };

}

// =====================================================
// DATA
// =====================================================

function atualizarData() {

    const elemento =
        document.getElementById("data");


    if (elemento) {

        elemento.textContent =
            new Date()
                .toLocaleString("pt-PT");

    }

}


// =====================================================
// DISPONIBILIZAR PARA app.js
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
    () => {

        atualizarData();

        carregarDashboard();

        carregarTabela();

        carregarGraficos();

        carregarCredenciaisAPI();

    }
);


// =====================================================
// ATUALIZAÇÃO
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
