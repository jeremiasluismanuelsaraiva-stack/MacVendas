
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

        const resposta = await fetch(API + "/dashboard-data");

        const json = await resposta.json();

        if (!json.success) return;

        const d = json.dashboard;

        document.getElementById("totalVendas").textContent =
            numero(d.vendas);

        document.getElementById("totalClientes").textContent =
            numero(d.clientes);

        document.getElementById("totalPedidos").textContent =
            numero(d.pedidos);

        document.getElementById("totalDispositivos").textContent =
            numero(d.dispositivos);

        document.getElementById("totalGB").textContent =
            numero(d.totalGB);

        document.getElementById("faturamento").textContent =
            numero(d.faturamento) + " MT";

        document.getElementById("lucro").textContent =
            numero(d.lucro) + " MT";

        document.getElementById("custo").textContent =
            numero(d.custo) + " MT";

        document.getElementById("vendasHoje").textContent =
            numero(d.vendasHoje);

    }

    catch (e) {

        console.error(e);

    }

}

// ================================
// AUTO ATUALIZAÇÃO
// ================================
carregarDashboard();

setInterval(carregarDashboard,5000);
