// ==========================================
// DASHBOARD - public/js/dashboard.js
// ==========================================

const API = window.location.origin;


// ==========================================
// FORMATAR NÚMEROS
// ==========================================

function numero(valor) {

    return Number(valor || 0).toLocaleString("pt-PT");

}


// ==========================================
// FORMATAR DATA
// ==========================================

function atualizarData() {

    const elemento = document.getElementById("data");

    if (!elemento) {
        return;
    }

    elemento.textContent =
        new Date().toLocaleString("pt-PT");

}


// ==========================================
// CARREGAR ESTATÍSTICAS DO DASHBOARD
// ==========================================

async function carregarDashboard() {

    try {

        const resposta =
            await fetch(API + "/relatorios", {
                method: "GET",
                cache: "no-store"
            });


        if (!resposta.ok) {

            throw new Error(
                "Erro HTTP: " + resposta.status
            );

        }


        const dados =
            await resposta.json();


        if (!dados || !dados.success) {

            console.error(
                "Resposta inválida da API:",
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
            document.getElementById("vendas");

        if (vendas) {

            vendas.textContent =
                numero(resumo.totalVendas);

        }


        // ==========================================
        // FATURAMENTO
        // ==========================================

        const valor =
            document.getElementById("valor");

        if (valor) {

            valor.textContent =
                numero(resumo.faturamento) + " MT";

        }


        // ==========================================
        // CLIENTES
        // ==========================================

        const clientes =
            document.getElementById("clientes");

        if (clientes) {

            clientes.textContent =
                numero(resumo.totalClientes);

        }


        // ==========================================
        // DISPOSITIVOS
        // ==========================================

        const dispositivos =
            document.getElementById("disp");

        if (dispositivos) {

            dispositivos.textContent =
                numero(resumo.totalDispositivos);

        }


        // ==========================================
        // TOTAL GB
        // ==========================================

        const totalGB =
            document.getElementById("totalGB");

        if (totalGB) {

            totalGB.textContent =
                numero(resumo.totalGB);

        }


        // ==========================================
        // LUCRO
        // ==========================================

        const lucro =
            document.getElementById("lucro");

        if (lucro) {

            lucro.textContent =
                numero(resumo.lucro) + " MT";

        }


        // ==========================================
        // CUSTO
        // ==========================================

        const custo =
            document.getElementById("custo");

        if (custo) {

            custo.textContent =
                numero(resumo.custo) + " MT";

        }


        // ==========================================
        // PEDIDOS
        // ==========================================

        const pedidos =
            document.getElementById("pedidos");

        if (pedidos) {

            pedidos.textContent =
                numero(resumo.totalPedidos);

        }


        console.log(
            "Dashboard atualizado:",
            resumo
        );


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


        // A API /vendas atualmente pode
        // retornar diretamente um array.

        const vendas =
            Array.isArray(json)
                ? json
                : (
                    Array.isArray(json.vendas)
                        ? json.vendas
                        : []
                );


        const lista =
            document.getElementById("lista");


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
                document.createElement("tr");


            const quantidade =
                venda.mb !== undefined &&
                venda.mb !== null
                    ? numero(venda.mb) + " MB"
                    : (
                        venda.gb !== undefined
                            ? numero(venda.gb) + " GB"
                            : "-"
                    );


            const valorVenda =
                venda.valor_venda !== undefined
                    ? venda.valor_venda
                    : (
                        venda.valor !== undefined
                            ? venda.valor
                            : 0
                    );


            const status =
                venda.status ||
                "Concluído";


            tr.innerHTML = `

                <td>
                    ${venda.numero || "-"}
                </td>

                <td>
                    ${quantidade}
                </td>

                <td>
                    ${numero(valorVenda)} MT
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
            "Erro ao carregar vendas:",
            erro
        );

    }

}


// ==========================================
// ATUALIZAR TUDO
// ==========================================

async function atualizarDashboard() {

    console.log(
        "Atualizando dashboard..."
    );

    atualizarData();

    await carregarDashboard();

    await carregarTabela();

}


// ==========================================
// DISPONIBILIZAR PARA O APP.JS
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
    function () {

        atualizarData();

        carregarDashboard();

        carregarTabela();

    }
);


// ==========================================
// ATUALIZAÇÃO AUTOMÁTICA
// ==========================================

// Atualiza os números a cada 5 segundos.

setInterval(
    carregarDashboard,
    5000
);


// Atualiza a tabela a cada 5 segundos.

setInterval(
    carregarTabela,
    5000
);
