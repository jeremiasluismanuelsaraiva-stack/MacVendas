
// =====================================================
// DASHBOARD - public/dashboard.js
// =====================================================

const API = "/api";


// =====================================================
// FORMATAR NÚMEROS
// =====================================================

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


// =====================================================
// ATUALIZAR DATA
// =====================================================

function atualizarData() {

    const elemento =
        document.getElementById("data");

    if (!elemento) {
        return;
    }

    elemento.textContent =
        new Date().toLocaleString("pt-MZ");

}


// =====================================================
// CARREGAR DASHBOARD
// GET /api/dashboard
// =====================================================

async function carregarDashboard() {

    try {

        console.log(
            "A carregar:",
            API + "/dashboard"
        );


        const resposta =
            await fetch(
                API + "/dashboard",
                {
                    method: "GET",
                    cache: "no-store"
                }
            );


        if (!resposta.ok) {

            throw new Error(
                "Erro HTTP " +
                resposta.status +
                " ao acessar /api/dashboard"
            );

        }


        const json =
            await resposta.json();


        console.log(
            "Resposta /api/dashboard:",
            json
        );


        if (
            !json ||
            json.success !== true
        ) {

            throw new Error(
                json?.error ||
                "A API do dashboard retornou erro."
            );

        }


        const d =
            json.dashboard || {};


        // =================================================
        // VENDAS
        // =================================================

        const vendas =
            document.getElementById("vendas");

        if (vendas) {

            vendas.textContent =
                numero(d.vendas);

        }


        // =================================================
        // FATURAMENTO
        // =================================================

        const valor =
            document.getElementById("valor");

        if (valor) {

            valor.textContent =
                numero(d.faturamento) +
                " MT";

        }


        // =================================================
        // CLIENTES
        // =================================================

        const clientes =
            document.getElementById("clientes");

        if (clientes) {

            clientes.textContent =
                numero(d.clientes);

        }


        // =================================================
        // DISPOSITIVOS
        // =================================================

        const dispositivos =
            document.getElementById("disp");

        if (dispositivos) {

            dispositivos.textContent =
                numero(d.dispositivos);

        }


        // =================================================
        // TOTAL GB
        // =================================================

        const totalGB =
            document.getElementById("totalGB");

        if (totalGB) {

            totalGB.textContent =
                numero(d.totalGB);

        }


        // =================================================
        // LUCRO
        // =================================================

        const lucro =
            document.getElementById("lucro");

        if (lucro) {

            lucro.textContent =
                numero(d.lucro) +
                " MT";

        }


        // =================================================
        // CUSTO
        // =================================================

        const custo =
            document.getElementById("custo");

        if (custo) {

            custo.textContent =
                numero(d.custo) +
                " MT";

        }


        // =================================================
        // PEDIDOS
        // =================================================

        const pedidos =
            document.getElementById("pedidos");

        if (pedidos) {

            pedidos.textContent =
                numero(d.pedidos);

        }


        // =================================================
        // DATA
        // =================================================

        atualizarData();


        console.log(
            "Dashboard carregado com sucesso."
        );


        return true;

    }
    catch (erro) {

        console.error(
            "ERRO AO CARREGAR DASHBOARD:",
            erro
        );


        // Mostrar Erro nos cards

        const ids = [
            "vendas",
            "valor",
            "clientes",
            "disp",
            "totalGB",
            "lucro",
            "custo",
            "pedidos"
        ];


        ids.forEach(id => {

            const elemento =
                document.getElementById(id);

            if (elemento) {

                elemento.textContent =
                    "Erro";

            }

        });


        const data =
            document.getElementById("data");

        if (data) {

            data.textContent =
                "Erro ao carregar";

        }


        return false;

    }

}


// =====================================================
// CARREGAR ÚLTIMAS VENDAS
// GET /api/vendas
// =====================================================

async function carregarTabela() {

    const lista =
        document.getElementById("lista");


    if (!lista) {

        console.warn(
            "Elemento #lista não encontrado."
        );

        return false;

    }


    try {

        console.log(
            "A carregar:",
            API + "/vendas"
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
                "Erro HTTP " +
                resposta.status +
                " ao acessar /api/vendas"
            );

        }


        const json =
            await resposta.json();


        console.log(
            "Resposta /api/vendas:",
            json
        );


        let vendas = [];


        if (Array.isArray(json)) {

            vendas = json;

        }
        else if (
            json &&
            Array.isArray(json.vendas)
        ) {

            vendas = json.vendas;

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

            return true;

        }


        // Mostrar apenas as últimas 10

        vendas
            .slice(0, 10)
            .forEach(venda => {

                const tr =
                    document.createElement("tr");


                const numeroVenda =
                    venda.numero ||
                    "-";


                const quantidade =
                    venda.mb !== undefined &&
                    venda.mb !== null &&
                    venda.mb !== ""
                        ? numero(venda.mb) + " MB"
                        : (
                            venda.gb !== undefined &&
                            venda.gb !== null
                                ? numero(venda.gb) + " GB"
                                : "-"
                        );


                const valor =
                    venda.valor_venda ??
                    venda.valor_pacote ??
                    venda.valor ??
                    venda.valorPacote ??
                    0;


                const status =
                    venda.status ||
                    "Concluído";


                tr.innerHTML = `

                    <td>
                        ${numeroVenda}
                    </td>

                    <td>
                        ${quantidade}
                    </td>

                    <td>
                        ${numero(valor)} MT
                    </td>

                    <td>
                        <span class="status ok">
                            ${status}
                        </span>
                    </td>

                `;


                lista.appendChild(tr);

            });


        console.log(
            "Tabela de vendas carregada."
        );


        return true;

    }
    catch (erro) {

        console.error(
            "ERRO AO CARREGAR VENDAS:",
            erro
        );


        lista.innerHTML = `
            <tr>
                <td
                    colspan="4"
                    style="
                        text-align:center;
                        padding:20px;
                    "
                >
                    Erro ao carregar vendas.
                </td>
            </tr>
        `;


        return false;

    }

}


// =====================================================
// DISPONIBILIZAR PARA OUTROS ARQUIVOS
// =====================================================

window.carregarDashboard =
    carregarDashboard;


window.carregarTabela =
    carregarTabela;


// =====================================================
// INICIALIZAÇÃO
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        console.log(
            "Dashboard iniciado."
        );


        atualizarData();


        await carregarDashboard();


        await carregarTabela();

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
