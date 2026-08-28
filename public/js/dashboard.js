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
// CARREGAR DASHBOARD
// ==========================================

async function carregarDashboard() {

    try {

        const resposta = await fetch(
            API + "/dashboard",
            {
                method: "GET",
                headers: {
                    "Accept": "application/json"
                },
                cache: "no-store"
            }
        );


        if (!resposta.ok) {

            throw new Error(
                "Erro HTTP: " + resposta.status
            );

        }


        const json = await resposta.json();


        if (!json || !json.success) {

            console.error(
                "API retornou erro:",
                json
            );

            return;

        }


        const d = json.dashboard || {};


        // ==========================================
        // VENDAS
        // ==========================================

        const vendas =
            document.getElementById("vendas");

        if (vendas) {

            vendas.textContent =
                numero(d.vendas);

        }


        // ==========================================
        // FATURAMENTO
        // ==========================================

        const valor =
            document.getElementById("valor");

        if (valor) {

            valor.textContent =
                numero(d.faturamento) + " MT";

        }


        // ==========================================
        // CLIENTES
        // ==========================================

        const clientes =
            document.getElementById("clientes");

        if (clientes) {

            clientes.textContent =
                numero(d.clientes);

        }


        // ==========================================
        // DISPOSITIVOS
        // ==========================================

        const disp =
            document.getElementById("disp");

        if (disp) {

            disp.textContent =
                numero(d.dispositivos);

        }


        // ==========================================
        // TOTAL GB
        // ==========================================

        const totalGB =
            document.getElementById("totalGB");

        if (totalGB) {

            totalGB.textContent =
                numero(d.totalGB) + " GB";

        }


        // ==========================================
        // LUCRO
        // ==========================================

        const lucro =
            document.getElementById("lucro");

        if (lucro) {

            lucro.textContent =
                numero(d.lucro) + " MT";

        }


        // ==========================================
        // CUSTO
        // ==========================================

        const custo =
            document.getElementById("custo");

        if (custo) {

            custo.textContent =
                numero(d.custo) + " MT";

        }


        // ==========================================
        // PEDIDOS
        // ==========================================

        const pedidos =
            document.getElementById("pedidos");

        if (pedidos) {

            pedidos.textContent =
                numero(d.pedidos);

        }


        // ==========================================
        // VENDAS HOJE
        // ==========================================

        const vendasHoje =
            document.getElementById("vendasHoje");

        if (vendasHoje) {

            vendasHoje.textContent =
                numero(d.vendasHoje);

        }


        console.log(
            "Dashboard atualizado:",
            d
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

        const resposta = await fetch(
            API + "/vendas",
            {
                method: "GET",
                headers: {
                    "Accept": "application/json"
                },
                cache: "no-store"
            }
        );


        if (!resposta.ok) {

            throw new Error(
                "Erro HTTP: " + resposta.status
            );

        }


        const json =
            await resposta.json();


        // ==========================================
        // ACEITAR OS DOIS FORMATOS
        // ==========================================

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


        const lista =
            document.getElementById("lista");


        if (!lista) {

            return;

        }


        lista.innerHTML = "";


        // ==========================================
        // NENHUMA VENDA
        // ==========================================

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


        // ==========================================
        // MOSTRAR VENDAS
        // ==========================================

        vendas.forEach(venda => {

            const tr =
                document.createElement("tr");


            const numeroVenda =
                venda.numero ||
                "-";


            const quantidade =
                venda.mb
                    ? numero(venda.mb) + " MB"
                    : venda.gb
                        ? numero(venda.gb) + " GB"
                        : venda.gb_pacote
                            ? numero(venda.gb_pacote) + " GB"
                            : "0";


            const valorVenda =
                venda.valor_venda ??
                venda.valor_pacote ??
                venda.valorPacote ??
                venda.valor ??
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


        console.log(
            "Tabela de vendas atualizada:",
            vendas.length
        );

    }
    catch (erro) {

        console.error(
            "Erro ao carregar vendas:",
            erro
        );


        const lista =
            document.getElementById("lista");


        if (lista) {

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

        }

    }

}


// ==========================================
// DATA ATUAL
// ==========================================

function atualizarData() {

    const elemento =
        document.getElementById("data");


    if (!elemento) {

        return;

    }


    const agora =
        new Date();


    elemento.textContent =
        agora.toLocaleString(
            "pt-MZ",
            {
                dateStyle: "short",
                timeStyle: "medium"
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


window.atualizarData =
    atualizarData;


// ==========================================
// INICIALIZAÇÃO
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log(
            "Dashboard iniciado."
        );


        atualizarData();

        carregarDashboard();

        carregarTabela();

    }
);


// ==========================================
// ATUALIZAR DATA AUTOMATICAMENTE
// ==========================================

setInterval(
    atualizarData,
    1000
);


// ==========================================
// ATUALIZAR DADOS AUTOMATICAMENTE
// ==========================================

setInterval(
    carregarDashboard,
    5000
);


setInterval(
    carregarTabela,
    5000
);
