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
            await fetch(
                API + "/relatorios",
                {
                    cache: "no-store"
                }
            );

        if (!resposta.ok) {

            throw new Error(
                "HTTP " + resposta.status
            );

        }

        const dados =
            await resposta.json();

        if (!dados.success) {

            console.error(
                "API /relatorios retornou erro:",
                dados
            );

            return;

        }


        const resumo =
            dados.resumo || {};


        // ==========================================
        // ELEMENTOS
        // ==========================================

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


        // ==========================================
        // ATUALIZAR
        // ==========================================

        if (vendas) {

            vendas.textContent =
                numero(
                    resumo.totalVendas
                );

        }


        if (valor) {

            valor.textContent =
                numero(
                    resumo.faturamento
                ) + " MT";

        }


        if (clientes) {

            clientes.textContent =
                numero(
                    resumo.totalClientes
                );

        }


        if (disp) {

            disp.textContent =
                numero(
                    resumo.totalDispositivos
                );

        }


        if (totalGB) {

            totalGB.textContent =
                numero(
                    resumo.totalGB
                );

        }


        if (lucro) {

            lucro.textContent =
                numero(
                    resumo.lucro
                ) + " MT";

        }


        if (custo) {

            custo.textContent =
                numero(
                    resumo.custo
                ) + " MT";

        }


        if (pedidos) {

            pedidos.textContent =
                numero(
                    resumo.totalPedidos
                );

        }

    }

    catch (erro) {

        console.error(
            "Erro no dashboard:",
            erro
        );

    }

}


// =====================================================
// TABELA DE VENDAS
// =====================================================

async function carregarTabela() {

    try {

        const resposta =
            await fetch(
                API + "/vendas",
                {
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


        if (!vendas.length) {

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


        vendas.forEach(v => {

            const tr =
                document.createElement("tr");


            const numeroVenda =
                v.numero ||
                "-";


            const quantidade =
                v.mb ??
                v.gb ??
                0;


            const valorVenda =
                v.valor_venda ??
                v.valor ??
                0;


            const status =
                v.status ||
                "Concluído";


            tr.innerHTML = `

                <td>
                    ${numeroVenda}
                </td>

                <td>
                    ${quantidade}
                </td>

                <td>
                    ${valorVenda} MT
                </td>

                <td>

                    <span class="status ok">
                        ${status}
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

            console.warn(
                "Chart.js ainda não foi carregado."
            );

            return;

        }


        const resposta =
            await fetch(
                API + "/relatorios",
                {
                    cache: "no-store"
                }
            );


        if (!resposta.ok) {

            throw new Error(
                "HTTP " + resposta.status
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


        // =================================================
        // GRÁFICO DIÁRIO
        // =================================================

        const canvasDias =
            document.getElementById(
                "graficoDias"
            );


        if (canvasDias) {

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
                                        true

                                }

                            }

                        }

                    }
                );

        }


        // =================================================
        // GRÁFICO MENSAL
        // =================================================

        const canvasMeses =
            document.getElementById(
                "graficoMeses"
            );


        if (canvasMeses) {

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
                                        true

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
        "Carregando credenciais da API..."
    );


    try {

        // ==========================================
        // PEGAR USUÁRIO ATUAL
        // ==========================================

        let usuario =
            auth.currentUser;


        // ==========================================
        // SE AINDA NÃO CARREGOU, ESPERAR FIREBASE
        // ==========================================

        if (!usuario) {

            usuario =
                await new Promise(
                    resolve => {

                        let finalizado =
                            false;


                        let cancelar =
                            null;


                        const terminar =
                            user => {

                                if (finalizado) {

                                    return;

                                }


                                finalizado =
                                    true;


                                if (cancelar) {

                                    cancelar();

                                }


                                resolve(user);

                            };


                        cancelar =
                            onAuthState(
                                user => {

                                    terminar(
                                        user
                                    );

                                }
                            );


                        // ==================================
                        // SEGURANÇA:
                        // NÃO FICAR ETERNAMENTE CARREGANDO
                        // ==================================

                        setTimeout(
                            () => {

                                terminar(
                                    auth.currentUser
                                );

                            },
                            10000
                        );

                    }
                );

        }


        // ==========================================
        // SEM LOGIN
        // ==========================================

        if (!usuario) {

            console.error(
                "Usuário não autenticado."
            );


            mostrarCredenciais(
                "-",
                "Faça login novamente."
            );


            return;

        }


        console.log(
            "Usuário autenticado:",
            usuario.uid
        );


        // ==========================================
        // BUSCAR DADOS DO USUÁRIO
        // ==========================================

        let dados = null;


        try {

            dados =
                await obterDadosUsuario();

        }

        catch (erro) {

            console.error(
                "Erro ao obter dados do usuário:",
                erro
            );

        }


        // ==========================================
        // SE NÃO EXISTIR DADOS
        // ==========================================

        if (!dados) {

            console.warn(
                "Dados do usuário não encontrados."
            );


            // Pelo menos mostrar o UID do Firebase

            mostrarCredenciais(
                usuario.uid,
                "API Key não encontrada"
            );


            return;

        }


        console.log(
            "Dados encontrados:",
            dados
        );


        // ==========================================
        // UID
        // ==========================================

        const uid =
            dados.uid ||
            usuario.uid;


        // ==========================================
        // API KEY
        // ==========================================

        const apiKey =
            dados.apiKey ||
            dados.api_key ||
            dados.APIKey ||
            "";


        // ==========================================
        // MOSTRAR NA TELA
        // ==========================================

        mostrarCredenciais(
            uid,
            apiKey || "API Key não encontrada"
        );


        // ==========================================
        // ATUALIZAR SIDEBAR
        // ==========================================

        const sidebarUID =
            document.getElementById(
                "sidebarUserUid"
            );


        const sidebarAPI =
            document.getElementById(
                "sidebarApiKey"
            );


        const sidebarNome =
            document.getElementById(
                "sidebarUserName"
            );


        const sidebarEmail =
            document.getElementById(
                "sidebarUserEmail"
            );


        if (sidebarUID) {

            sidebarUID.textContent =
                "UID: " + uid;

        }


        if (sidebarAPI) {

            sidebarAPI.textContent =
                "API Key: " +
                (
                    apiKey ||
                    "Não encontrada"
                );

        }


        if (sidebarNome) {

            sidebarNome.textContent =
                dados.nome ||
                dados.name ||
                usuario.displayName ||
                "Usuário";

        }


        if (sidebarEmail) {

            sidebarEmail.textContent =
                dados.email ||
                usuario.email ||
                "-";

        }


        // ==========================================
        // BOTÕES DE COPIAR
        // ==========================================

        configurarBotaoCopiar(
            "copyTutorialUidBtn",
            uid,
            "Copiar UID"
        );


        configurarBotaoCopiar(
            "copyTutorialApiKeyBtn",
            apiKey,
            "Copiar API Key"
        );


        configurarBotaoCopiar(
            "copyUidBtn",
            uid,
            "Copiar UID"
        );


        configurarBotaoCopiar(
            "copyApiKeyBtn",
            apiKey,
            "Copiar API Key"
        );

    }

    catch (erro) {

        console.error(
            "ERRO NAS CREDENCIAIS:",
            erro
        );


        mostrarCredenciais(
            "-",
            "Erro ao carregar"
        );

    }

}


// =====================================================
// MOSTRAR CREDENCIAIS
// =====================================================

function mostrarCredenciais(
    uid,
    apiKey
) {

    // ==========================================
    // TUTORIAL
    // ==========================================

    const elementoUID =
        document.getElementById(
            "tutorialUid"
        );


    const elementoAPI =
        document.getElementById(
            "tutorialApiKey"
        );


    if (elementoUID) {

        elementoUID.textContent =
            uid || "-";

    }


    if (elementoAPI) {

        elementoAPI.textContent =
            apiKey || "-";

    }


    // ==========================================
    // SIDEBAR
    // ==========================================

    const sidebarUID =
        document.getElementById(
            "sidebarUserUid"
        );


    const sidebarAPI =
        document.getElementById(
            "sidebarApiKey"
        );


    if (sidebarUID) {

        sidebarUID.textContent =
            "UID: " +
            (uid || "-");

    }


    if (sidebarAPI) {

        sidebarAPI.textContent =
            "API Key: " +
            (apiKey || "-");

    }

}


// =====================================================
// CONFIGURAR BOTÃO COPIAR
// =====================================================

function configurarBotaoCopiar(
    id,
    valor,
    textoOriginal
) {

    const botao =
        document.getElementById(id);


    if (!botao) {

        return;

    }


    // ==========================================
    // EVITAR DUPLICAR EVENTOS
    // ==========================================

    if (
        botao.dataset.copiaConfigurada ===
        "true"
    ) {

        return;

    }


    botao.dataset.copiaConfigurada =
        "true";


    botao.addEventListener(
        "click",
        async () => {

            if (
                !valor ||
                valor ===
                    "API Key não encontrada"
            ) {

                alert(
                    "Informação não disponível."
                );

                return;

            }


            try {

                await navigator.clipboard
                    .writeText(
                        String(valor)
                    );


                botao.textContent =
                    "Copiado!";


                setTimeout(
                    () => {

                        botao.textContent =
                            textoOriginal;

                    },
                    1500
                );

            }

            catch (erro) {

                console.error(
                    "Erro ao copiar:",
                    erro
                );


                alert(
                    "Não foi possível copiar."
                );

            }

        }
    );

}


// =====================================================
// ATUALIZAR TUDO
// =====================================================

async function atualizarTudo() {

    console.log(
        "Atualizando dashboard..."
    );


    const botao =
        document.getElementById(
            "btnAtualizar"
        );


    const textoOriginal =
        botao
            ? botao.innerHTML
            : "";


    if (botao) {

        botao.disabled =
            true;

        botao.innerHTML =
            '<i class="fas fa-sync-alt fa-spin"></i> Atualizando...';

    }


    try {

        await Promise.all([

            carregarDashboard(),

            carregarTabela(),

            carregarGraficos(),

            carregarCredenciaisAPI()

        ]);


        atualizarData();

    }

    catch (erro) {

        console.error(
            "Erro ao atualizar:",
            erro
        );

    }

    finally {

        if (botao) {

            botao.disabled =
                false;

            botao.innerHTML =
                textoOriginal ||
                '<i class="fas fa-sync-alt"></i> Atualizar';

        }

    }

}


// =====================================================
// DATA
// =====================================================

function atualizarData() {

    const elemento =
        document.getElementById(
            "data"
        );


    if (elemento) {

        elemento.textContent =
            new Date()
                .toLocaleString(
                    "pt-PT"
                );

    }

}


// =====================================================
// BOTÃO ATUALIZAR
// =====================================================

function inicializarBotaoAtualizar() {

    // Aceita o ID principal
    let botao =
        document.getElementById(
            "btnAtualizar"
        );


    // Compatibilidade com outros IDs
    if (!botao) {

        botao =
            document.getElementById(
                "atualizarBtn"
            );

    }


    if (!botao) {

        botao =
            document.getElementById(
                "btnRefresh"
            );

    }


    if (!botao) {

        console.warn(
            "Botão Atualizar não encontrado."
        );

        return;

    }


    // Evitar evento duplicado
    if (
        botao.dataset.atualizarConfigurado ===
        "true"
    ) {

        return;

    }


    botao.dataset.atualizarConfigurado =
        "true";


    botao.addEventListener(
        "click",
        function(e) {

            e.preventDefault();
            e.stopPropagation();

            atualizarTudo();

        }
    );

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


window.atualizarTudo =
    atualizarTudo;


// =====================================================
// INICIALIZAÇÃO
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        atualizarData();

        inicializarBotaoAtualizar();

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
