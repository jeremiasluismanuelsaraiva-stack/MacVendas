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
// CARREGAR ESTATÍSTICAS
// ==========================================

async function carregarDashboard() {

    try {

        const resposta =
            await fetch(API + "/relatorios");


        if (!resposta.ok) {

            throw new Error(
                "Erro HTTP: " + resposta.status
            );

        }


        const dados =
            await resposta.json();


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


// ==========================================
// CARREGAR TABELA DE VENDAS
// ==========================================

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


        vendas.forEach(venda => {

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


            lista.appendChild(tr);

        });


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
// DISPONIBILIZAR FUNÇÕES PARA O app.js
// ==========================================

window.carregarDashboard =
    carregarDashboard;


window.carregarTabela =
    carregarTabela;


// ==========================================
// INICIALIZAÇÃO
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        atualizarData();

        carregarDashboard();

        carregarTabela();

    }
);


// ==========================================
// ATUALIZAÇÃO AUTOMÁTICA
// ==========================================

setInterval(
    carregarDashboard,
    5000
);


setInterval(
    carregarTabela,
    5000
);
