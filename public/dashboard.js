// ==========================================
// DASHBOARD
// ==========================================

const API = window.location.origin;


// ==========================================
// FORMATAR NÚMEROS
// ==========================================

function numero(valor) {

    return Number(valor || 0).toLocaleString("pt-PT");

}


// ==========================================
// CARREGAR DASHBOARD
// ==========================================

async function carregarDashboard() {

    try {

        console.log("A carregar dashboard...");

        const resposta = await fetch(
            API + "/dashboard",
            {
                method: "GET",
                cache: "no-store"
            }
        );


        if (!resposta.ok) {

            throw new Error(
                "Erro HTTP: " + resposta.status
            );

        }


        const json = await resposta.json();


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


        // ==========================================
        // VENDAS
        // ==========================================

        const totalVendas =
            document.getElementById(
                "totalVendas"
            );

        if (totalVendas) {

            totalVendas.textContent =
                numero(d.vendas);

        }


        // ==========================================
        // CLIENTES
        // ==========================================

        const totalClientes =
            document.getElementById(
                "totalClientes"
            );

        if (totalClientes) {

            totalClientes.textContent =
                numero(d.clientes);

        }


        // ==========================================
        // PEDIDOS
        // ==========================================

        const totalPedidos =
            document.getElementById(
                "totalPedidos"
            );

        if (totalPedidos) {

            totalPedidos.textContent =
                numero(d.pedidos);

        }


        // ==========================================
        // DISPOSITIVOS
        // ==========================================

        const totalDispositivos =
            document.getElementById(
                "totalDispositivos"
            );

        if (totalDispositivos) {

            totalDispositivos.textContent =
                numero(d.dispositivos);

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
                numero(d.totalGB) + " GB";

        }


        // ==========================================
        // FATURAMENTO
        // ==========================================

        const faturamento =
            document.getElementById(
                "faturamento"
            );

        if (faturamento) {

            faturamento.textContent =
                numero(d.faturamento) + " MT";

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
                numero(d.lucro) + " MT";

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
                numero(d.custo) + " MT";

        }


        // ==========================================
        // VENDAS HOJE
        // ==========================================

        const vendasHoje =
            document.getElementById(
                "vendasHoje"
            );

        if (vendasHoje) {

            vendasHoje.textContent =
                numero(d.vendasHoje);

        }


        // ==========================================
        // REMOVER CARREGANDO
        // ==========================================

        document
            .querySelectorAll(
                ".carregando"
            )
            .forEach(elemento => {

                if (
                    elemento.textContent
                        .trim()
                        .toLowerCase()
                        .includes("carregando")
                ) {

                    elemento.textContent = "0";

                }

            });


        console.log(
            "Dashboard atualizado com sucesso."
        );

    }
    catch (erro) {

        console.error(
            "Erro ao carregar dashboard:",
            erro
        );


        // Mostrar 0 em vez de ficar eternamente
        // em "Carregando..."

        const ids = [

            "totalVendas",
            "totalClientes",
            "totalPedidos",
            "totalDispositivos",
            "totalGB",
            "faturamento",
            "lucro",
            "custo",
            "vendasHoje"

        ];


        ids.forEach(id => {

            const elemento =
                document.getElementById(id);

            if (
                elemento &&
                elemento.textContent
                    .trim()
                    .toLowerCase()
                    .includes("carregando")
            ) {

                elemento.textContent = "0";

            }

        });

    }

}


// ==========================================
// DISPONIBILIZAR PARA O APP
// ==========================================

window.carregarDashboard =
    carregarDashboard;


// ==========================================
// CARREGAR QUANDO A PÁGINA ABRIR
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        carregarDashboard();

    }
);


// ==========================================
// ATUALIZAÇÃO AUTOMÁTICA
// ==========================================

setInterval(
    carregarDashboard,
    5000
);
