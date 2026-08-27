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
// FORMATAR MT
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

        console.log("A carregar Dashboard...");


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
            "Dados do relatório:",
            dados
        );


        if (!dados.success) {

            console.error(
                "Erro nos relatórios:",
                dados
            );

            return;

        }


        const resumo =
            dados.resumo || {};


        // ==========================================
        // TOTAL DE VENDAS
        // ==========================================

        const vendas =
            document.getElementById(
                "vendas"
            );


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
            document.getElementById(
                "valor"
            );


        if (valor) {

            valor.textContent =
                dinheiro(
                    resumo.faturamento
                );

        }


        // ==========================================
        // CLIENTES
        // ==========================================

        const clientes =
            document.getElementById(
                "clientes"
            );


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
            document.getElementById(
                "disp"
            );


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
            document.getElementById(
                "totalGB"
            );


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
            document.getElementById(
                "lucro"
            );


        if (lucro) {

            lucro.textContent =
                dinheiro(
                    resumo.lucro
                );

        }


        // ==========================================
        // CUSTO
        // ==========================================

        const custo =
            document.getElementById(
                "custo"
            );


        if (custo) {

            custo.textContent =
                dinheiro(
                    resumo.custo
                );

        }


        // ==========================================
        // PEDIDOS
        // ==========================================

        const pedidos =
            document.getElementById(
                "pedidos"
            );


        if (pedidos) {

            pedidos.textContent =
                numero(
                    resumo.totalPedidos
                );

        }


        // ==========================================
        // DATA
        // ==========================================

        atualizarData();


    }
    catch (erro) {

        console.error(
            "Erro ao carregar dashboard:",
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
            "A carregar tabela de vendas..."
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


        const json =
            await resposta.json();


        const vendas =
            Array.isArray(json)
                ? json
                : (
                    Array.isArray(
                        json.vendas
                    )
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


        vendas.forEach(
            venda => {

                const tr =
                    document.createElement(
                        "tr"
                    );


                const quantidade =
                    venda.mb ||
                    (
                        Number(
                            venda.gb || 0
                        ) * 1024
                    ) ||
                    0;


                const valor =
                    venda.valor_venda ??
                    venda.valor_pacote ??
                    venda.valor ??
                    0;


                tr.innerHTML = `

                    <td>
                        ${venda.numero || "-"}
                    </td>

                    <td>
                        ${numero(quantidade)} MB
                    </td>

                    <td>
                        ${dinheiro(valor)}
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
            "Erro ao carregar vendas:",
            erro
        );

    }

}


// ==========================================
// DATA ATUAL
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
// ATUALIZAR DASHBOARD COMPLETO
// ==========================================

async function atualizarDashboard() {

    console.log(
        "Atualizando Dashboard..."
    );


    try {

        await Promise.all([
            carregarDashboard(),
            carregarTabela()
        ]);

        console.log(
            "Dashboard atualizado."
        );

    }
    catch (erro) {

        console.error(
            "Erro ao atualizar Dashboard:",
            erro
        );

    }

}


// ==========================================
// BOTÃO ATUALIZAR
// ==========================================

function inicializarBotaoAtualizar() {

    const botoes =
        document.querySelectorAll(
            "#atualizarBtn, #refreshBtn, .btn-atualizar, .refresh-btn"
        );


    botoes.forEach(
        botao => {

            botao.addEventListener(
                "click",
                async function(e) {

                    e.preventDefault();
                    e.stopPropagation();


                    const textoOriginal =
                        this.innerHTML;


                    this.disabled = true;


                    this.innerHTML =
                        '<i class="fas fa-sync-alt fa-spin"></i> Atualizando...';


                    try {

                        await atualizarDashboard();

                    }
                    finally {

                        this.disabled =
                            false;


                        this.innerHTML =
                            textoOriginal;

                    }

                }
            );

        }
    );

}


// ==========================================
// DISPONIBILIZAR FUNÇÕES
// ==========================================

window.carregarDashboard =
    carregarDashboard;


window.carregarTabela =
    carregarTabela;


window.atualizarDashboard =
    atualizarDashboard;


// ==========================================
// INICIALIZAÇÃO
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    function() {

        console.log(
            "Dashboard.js iniciado."
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
    atualizarDashboard,
    5000
);
