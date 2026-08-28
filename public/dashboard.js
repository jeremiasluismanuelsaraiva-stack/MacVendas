// =====================================================
// DASHBOARD
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
// CARREGAR DASHBOARD
// =====================================================

async function carregarDashboard() {

    console.log(
        "Carregando dashboard..."
    );

    try {

        const resposta =
            await fetch(
                API + "/dashboard",
                {
                    method: "GET",
                    cache: "no-store",
                    headers: {
                        "Accept": "application/json"
                    }
                }
            );


        console.log(
            "Status /api/dashboard:",
            resposta.status
        );


        if (!resposta.ok) {

            throw new Error(
                "HTTP " +
                resposta.status
            );

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

            throw new Error(
                json?.error ||
                "API retornou erro."
            );

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

        const disp =
            document.getElementById(
                "disp"
            );

        if (disp) {

            disp.textContent =
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
        // VENDAS HOJE
        // =================================================

        const vendasHoje =
            document.getElementById(
                "vendasHoje"
            );

        if (vendasHoje) {

            vendasHoje.textContent =
                numero(
                    d.vendasHoje
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

        return json;

    }
    catch (erro) {

        console.error(
            "ERRO DASHBOARD:",
            erro
        );


        // Mostrar erro somente se realmente falhar

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


            if (
                id === "valor" ||
                id === "lucro" ||
                id === "custo"
            ) {

                elemento.textContent =
                    "Erro";

            }
            else {

                elemento.textContent =
                    "Erro";

            }

        });


        const data =
            document.getElementById(
                "data"
            );

        if (data) {

            data.textContent =
                "Erro ao carregar";

        }


        throw erro;

    }

}


// =====================================================
// CARREGAR TABELA DE VENDAS
// =====================================================

async function carregarTabela() {

    console.log(
        "Carregando vendas..."
    );


    const lista =
        document.getElementById(
            "lista"
        );


    if (!lista) {

        console.warn(
            "Elemento #lista não encontrado."
        );

        return;

    }


    try {

        const resposta =
            await fetch(
                API + "/vendas",
                {
                    method: "GET",
                    cache: "no-store",
                    headers: {
                        "Accept": "application/json"
                    }
                }
            );


        console.log(
            "Status /api/vendas:",
            resposta.status
        );


        if (!resposta.ok) {

            throw new Error(
                "HTTP " +
                resposta.status
            );

        }


        const json =
            await resposta.json();


        console.log(
            "Resposta vendas:",
            json
        );


        let vendas = [];


        if (Array.isArray(json)) {

            vendas = json;

        }
        else if (
            Array.isArray(
                json.vendas
            )
        ) {

            vendas =
                json.vendas;

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


        // =================================================
        // MOSTRAR ÚLTIMAS VENDAS
        // =================================================

        vendas
            .slice(0, 20)
            .forEach(venda => {

                const tr =
                    document.createElement(
                        "tr"
                    );


                const numeroVenda =
                    venda.numero ||
                    venda.telefone ||
                    "-";


                const mb =
                    Number(
                        venda.mb || 0
                    );


                const gb =
                    Number(
                        venda.gb ||
                        venda.gb_pacote ||
                        venda.gbPacote ||
                        0
                    );


                let quantidade = "-";


                if (mb > 0) {

                    quantidade =
                        numero(mb) +
                        " MB";

                }
                else if (gb > 0) {

                    quantidade =
                        numero(gb) +
                        " GB";

                }


                const valor =
                    Number(
                        venda.valor_venda ??
                        venda.valor_pacote ??
                        venda.valor ??
                        venda.valorPacote ??
                        0
                    );


                const status =
                    venda.status ||
                    "Concluído";


                tr.innerHTML = `

                    <td>
                        ${numeroSeguro(numeroVenda)}
                    </td>

                    <td>
                        ${quantidade}
                    </td>

                    <td>
                        ${numero(valor)} MT
                    </td>

                    <td>

                        <span class="status ok">

                            ${numeroSeguro(status)}

                        </span>

                    </td>

                `;


                lista.appendChild(
                    tr
                );

            });


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

    }

}


// =====================================================
// SEGURANÇA PARA TEXTO
// =====================================================

function numeroSeguro(valor) {

    if (
        valor === null ||
        valor === undefined
    ) {

        return "-";

    }


    return String(valor)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

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
    async () => {

        console.log(
            "Dashboard iniciado."
        );


        try {

            await carregarDashboard();

        }
        catch (erro) {

            console.error(
                "Falha inicial dashboard:",
                erro
            );

        }


        await carregarTabela();

    }
);


// =====================================================
// ATUALIZAÇÃO AUTOMÁTICA
// =====================================================

setInterval(
    () => {

        carregarDashboard()
            .catch(() => {});

    },
    5000
);


setInterval(
    () => {

        carregarTabela();

    },
    5000
);
