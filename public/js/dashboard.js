// =====================================================
// MOZ TECH
// DASHBOARD
// =====================================================

const API = window.location.origin;


// =====================================================
// FORMATAR NÚMEROS
// =====================================================

function numero(valor = 0) {

    const n = Number(valor);

    if (!Number.isFinite(n)) {
        return "0";
    }

    return n.toLocaleString("pt-PT", {
        maximumFractionDigits: 2
    });

}


// =====================================================
// CARREGAR DASHBOARD
// =====================================================

async function carregarDashboard() {

    console.log("Carregando dashboard...");

    try {

        // A rota correta é /dashboard
        const resposta =
            await fetch(API + "/dashboard", {
                method: "GET",
                headers: {
                    "Accept": "application/json"
                },
                cache: "no-cache"
            });


        if (!resposta.ok) {

            throw new Error(
                "Erro HTTP " +
                resposta.status +
                " ao carregar /dashboard"
            );

        }


        const json =
            await resposta.json();


        console.log(
            "Resposta do dashboard:",
            json
        );


        if (!json.success) {

            throw new Error(
                json.error ||
                "A API retornou erro."
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

        const disp =
            document.getElementById("disp");

        if (disp) {

            disp.textContent =
                numero(d.dispositivos);

        }


        // =================================================
        // TOTAL GB
        // =================================================

        const totalGB =
            document.getElementById("totalGB");

        if (totalGB) {

            totalGB.textContent =
                numero(d.totalGB) +
                " GB";

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
            "Erro ao carregar dashboard:",
            erro
        );


        // Não deixar "Carregando..." preso
        const elementos = [
            "vendas",
            "valor",
            "clientes",
            "disp",
            "totalGB",
            "lucro",
            "custo",
            "pedidos"
        ];


        elementos.forEach(id => {

            const elemento =
                document.getElementById(id);

            if (!elemento) {
                return;
            }


            if (id === "valor" ||
                id === "lucro" ||
                id === "custo") {

                elemento.textContent =
                    "0 MT";

            }
            else if (id === "totalGB") {

                elemento.textContent =
                    "0 GB";

            }
            else {

                elemento.textContent =
                    "0";

            }

        });


        return false;

    }

}


// =====================================================
// CARREGAR TABELA DE VENDAS
// =====================================================

async function carregarTabela() {

    console.log("Carregando vendas...");

    const lista =
        document.getElementById("lista");


    if (!lista) {

        console.warn(
            "Elemento #lista não encontrado."
        );

        return false;

    }


    try {

        const resposta =
            await fetch(
                API + "/vendas",
                {
                    method: "GET",
                    headers: {
                        "Accept":
                            "application/json"
                    },
                    cache: "no-cache"
                }
            );


        if (!resposta.ok) {

            throw new Error(
                "Erro HTTP " +
                resposta.status +
                " ao carregar /vendas"
            );

        }


        const json =
            await resposta.json();


        console.log(
            "Resposta de vendas:",
            json
        );


        let vendas = [];


        // A API atual retorna diretamente um array
        if (Array.isArray(json)) {

            vendas = json;

        }

        // Compatibilidade caso a API retorne { vendas: [] }
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


        // Mostrar primeiro as vendas mais recentes
        vendas.forEach(venda => {

            const tr =
                document.createElement("tr");


            // =================================================
            // NÚMERO
            // =================================================

            const tdNumero =
                document.createElement("td");

            tdNumero.textContent =
                venda.numero || "-";


            // =================================================
            // MB / GB
            // =================================================

            const tdMB =
                document.createElement("td");


            if (
                venda.gb_pacote !== undefined &&
                Number(venda.gb_pacote) > 0
            ) {

                tdMB.textContent =
                    numero(venda.gb_pacote) +
                    " GB";

            }
            else if (
                venda.gbPacote !== undefined &&
                Number(venda.gbPacote) > 0
            ) {

                tdMB.textContent =
                    numero(venda.gbPacote) +
                    " GB";

            }
            else if (
                venda.gb !== undefined &&
                Number(venda.gb) > 0
            ) {

                tdMB.textContent =
                    numero(venda.gb) +
                    " GB";

            }
            else {

                tdMB.textContent =
                    numero(venda.mb) +
                    " MB";

            }


            // =================================================
            // VALOR
            // =================================================

            const tdValor =
                document.createElement("td");


            const valorVenda =
                venda.valor_venda ??
                venda.valor_pacote ??
                venda.valorPacote ??
                venda.valor ??
                0;


            tdValor.textContent =
                numero(valorVenda) +
                " MT";


            // =================================================
            // STATUS
            // =================================================

            const tdStatus =
                document.createElement("td");


            const status =
                document.createElement("span");


            status.className =
                "status ok";


            status.textContent =
                venda.status ||
                "Concluído";


            tdStatus.appendChild(status);


            // =================================================
            // ADICIONAR LINHA
            // =================================================

            tr.appendChild(tdNumero);

            tr.appendChild(tdMB);

            tr.appendChild(tdValor);

            tr.appendChild(tdStatus);


            lista.appendChild(tr);

        });


        console.log(
            "Vendas carregadas:",
            vendas.length
        );


        return true;

    }
    catch (erro) {

        console.error(
            "Erro ao carregar vendas:",
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
// ATUALIZAR DATA
// =====================================================

function atualizarData() {

    const elemento =
        document.getElementById("data");


    if (!elemento) {
        return;
    }


    elemento.textContent =
        new Date().toLocaleString(
            "pt-MZ",
            {
                dateStyle: "short",
                timeStyle: "medium"
            }
        );

}


// =====================================================
// DISPONIBILIZAR PARA OUTROS ARQUIVOS
// =====================================================

window.carregarDashboard =
    carregarDashboard;


window.carregarTabela =
    carregarTabela;


window.atualizarData =
    atualizarData;


// =====================================================
// INICIALIZAÇÃO
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        console.log(
            "Dashboard.js iniciado."
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
    function () {

        carregarDashboard();

    },
    5000
);


setInterval(
    function () {

        carregarTabela();

    },
    5000
);
