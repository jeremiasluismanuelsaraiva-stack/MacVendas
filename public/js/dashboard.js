// =====================================================
// DASHBOARD
// =====================================================

const API = window.location.origin;


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
// CARREGAR DASHBOARD
// =====================================================

async function carregarDashboard() {

    console.log("====================================");
    console.log("CARREGANDO DASHBOARD");
    console.log("URL:", API + "/dashboard");
    console.log("====================================");


    try {

        const resposta = await fetch(
            API + "/dashboard",
            {
                method: "GET",
                cache: "no-cache",
                headers: {
                    "Accept": "application/json"
                }
            }
        );


        console.log(
            "Status dashboard:",
            resposta.status
        );


        if (!resposta.ok) {

            const texto =
                await resposta.text();

            console.error(
                "Erro HTTP dashboard:",
                resposta.status,
                texto
            );

            mostrarErroDashboard();

            return;

        }


        const json =
            await resposta.json();


        console.log(
            "Resposta dashboard:",
            json
        );


        if (
            !json ||
            json.success !== true
        ) {

            console.error(
                "Dashboard retornou erro:",
                json
            );

            mostrarErroDashboard();

            return;

        }


        const d =
            json.dashboard || {};


        // =================================================
        // VENDAS
        // =================================================

        const vendas =
            document.getElementById(
                "vendas"
            );

        if (vendas) {

            vendas.textContent =
                numero(
                    d.vendas
                );

        }


        // =================================================
        // FATURAMENTO
        // =================================================

        const valor =
            document.getElementById(
                "valor"
            );

        if (valor) {

            valor.textContent =
                numero(
                    d.faturamento
                ) + " MT";

        }


        // =================================================
        // CLIENTES
        // =================================================

        const clientes =
            document.getElementById(
                "clientes"
            );

        if (clientes) {

            clientes.textContent =
                numero(
                    d.clientes
                );

        }


        // =================================================
        // DISPOSITIVOS
        // =================================================

        const dispositivos =
            document.getElementById(
                "disp"
            );

        if (dispositivos) {

            dispositivos.textContent =
                numero(
                    d.dispositivos
                );

        }


        // =================================================
        // TOTAL GB
        // =================================================

        const totalGB =
            document.getElementById(
                "totalGB"
            );

        if (totalGB) {

            totalGB.textContent =
                numero(
                    d.totalGB
                );

        }


        // =================================================
        // LUCRO
        // =================================================

        const lucro =
            document.getElementById(
                "lucro"
            );

        if (lucro) {

            lucro.textContent =
                numero(
                    d.lucro
                ) + " MT";

        }


        // =================================================
        // CUSTO
        // =================================================

        const custo =
            document.getElementById(
                "custo"
            );

        if (custo) {

            custo.textContent =
                numero(
                    d.custo
                ) + " MT";

        }


        // =================================================
        // PEDIDOS
        // =================================================

        const pedidos =
            document.getElementById(
                "pedidos"
            );

        if (pedidos) {

            pedidos.textContent =
                numero(
                    d.pedidos
                );

        }


        // =================================================
        // DATA
        // =================================================

        const data =
            document.getElementById(
                "data"
            );

        if (data) {

            data.textContent =
                new Date()
                    .toLocaleString(
                        "pt-MZ"
                    );

        }


        console.log(
            "Dashboard carregado com sucesso."
        );

    }
    catch (erro) {

        console.error(
            "ERRO AO CARREGAR DASHBOARD:",
            erro
        );

        mostrarErroDashboard();

    }

}


// =====================================================
// MOSTRAR ERRO
// =====================================================

function mostrarErroDashboard() {

    const ids = [
        "vendas",
        "clientes",
        "disp",
        "totalGB",
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


    const valor =
        document.getElementById(
            "valor"
        );

    if (valor) {

        valor.textContent =
            "Erro";

    }


    const lucro =
        document.getElementById(
            "lucro"
        );

    if (lucro) {

        lucro.textContent =
            "Erro";

    }


    const custo =
        document.getElementById(
            "custo"
        );

    if (custo) {

        custo.textContent =
            "Erro";

    }


    const data =
        document.getElementById(
            "data"
        );

    if (data) {

        data.textContent =
            "Erro ao carregar";

    }

}


// =====================================================
// DISPONIBILIZAR PARA OUTROS JS
// =====================================================

window.carregarDashboard =
    carregarDashboard;


// =====================================================
// INICIAR
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        carregarDashboard();

    }
);


// =====================================================
// ATUALIZAÇÃO AUTOMÁTICA
// =====================================================

setInterval(
    carregarDashboard,
    5000
);
