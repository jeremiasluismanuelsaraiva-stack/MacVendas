const API = window.location.origin;

// ================================
// FORMATAR NÚMEROS
// ================================
function numero(valor) {

    return Number(valor || 0).toLocaleString("pt-PT");

}


// ================================
// CARREGAR DASHBOARD
// ================================
async function carregarDashboard() {

    try {

        const resposta =
            await fetch(API + "/dashboard-data");

        if (!resposta.ok) {

            console.error(
                "Erro HTTP:",
                resposta.status
            );

            return;

        }

        const json =
            await resposta.json();


        if (!json.success) {

            console.error(
                "API retornou erro:",
                json
            );

            return;

        }


        const d =
            json.dashboard;


        // ================================
        // VENDAS
        // ================================

        const totalVendas =
            document.getElementById("totalVendas");

        if (totalVendas) {

            totalVendas.textContent =
                numero(d.vendas);

        }


        // ================================
        // CLIENTES
        // ================================

        const totalClientes =
            document.getElementById("totalClientes");

        if (totalClientes) {

            totalClientes.textContent =
                numero(d.clientes);

        }


        // ================================
        // PEDIDOS
        // ================================

        const totalPedidos =
            document.getElementById("totalPedidos");

        if (totalPedidos) {

            totalPedidos.textContent =
                numero(d.pedidos);

        }


        // ================================
        // DISPOSITIVOS
        // ================================

        const totalDispositivos =
            document.getElementById("totalDispositivos");

        if (totalDispositivos) {

            totalDispositivos.textContent =
                numero(d.dispositivos);

        }


        // ================================
        // TOTAL GB
        // ================================

        const totalGB =
            document.getElementById("totalGB");

        if (totalGB) {

            totalGB.textContent =
                numero(d.totalGB) + " GB";

        }


        // ================================
        // FATURAMENTO
        // ================================

        const faturamento =
            document.getElementById("faturamento");

        if (faturamento) {

            faturamento.textContent =
                numero(d.faturamento) + " MT";

        }


        // ================================
        // LUCRO
        // ================================

        const lucro =
            document.getElementById("lucro");

        if (lucro) {

            lucro.textContent =
                numero(d.lucro) + " MT";

        }


        // ================================
        // CUSTO
        // ================================

        const custo =
            document.getElementById("custo");

        if (custo) {

            custo.textContent =
                numero(d.custo) + " MT";

        }


        // ================================
        // VENDAS HOJE
        // ================================

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

    catch (e) {

        console.error(
            "Erro ao carregar dashboard:",
            e
        );

    }

}


// ================================
// CARREGAR AO ABRIR
// ================================

carregarDashboard();


// ================================
// ATUALIZAR A CADA 5 SEGUNDOS
// ================================

setInterval(
    carregarDashboard,
    5000
);
