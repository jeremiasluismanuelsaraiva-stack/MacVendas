
const API = window.location.origin;

let clientes = [];

// ==============================
// CARREGAR CLIENTES
// ==============================

async function carregarClientes() {

    try {

        const resposta = await fetch(API + "/clientes");

        const json = await resposta.json();

        if (!json.success) return;

        clientes = json.clientes || [];

        atualizarTabela(clientes);

        atualizarResumo(clientes);

    } catch (e) {

        console.error(e);

    }

}

// ==============================
// TABELA
// ==============================

function atualizarTabela(lista) {

    const tbody = document.getElementById("tabelaClientes");

    if (!tbody) return;

    tbody.innerHTML = "";

    lista.forEach(cliente => {

        tbody.innerHTML += `
        <tr>

            <td>${cliente.id}</td>

            <td>${cliente.nome || ""}</td>

            <td>${cliente.numero || ""}</td>

            <td>${cliente.grupo || ""}</td>

            <td>${cliente.totalCompras || 0}</td>

            <td>${cliente.totalGB || 0} GB</td>

            <td>${cliente.totalGasto || 0} MT</td>

            <td>

                <button onclick="editarCliente('${cliente.id}')">
                    Editar
                </button>

                <button onclick="removerCliente('${cliente.id}')">
                    Remover
                </button>

            </td>

        </tr>
        `;

    });

}

// ==============================
// RESUMO
// ==============================

function atualizarResumo(lista) {

    let compras = 0;
    let gb = 0;
    let valor = 0;

    lista.forEach(c => {

        compras += Number(c.totalCompras || 0);

        gb += Number(c.totalGB || 0);

        valor += Number(c.totalGasto || 0);

    });

    if (document.getElementById("crmClientes"))
        document.getElementById("crmClientes").textContent = lista.length;

    if (document.getElementById("crmCompras"))
        document.getElementById("crmCompras").textContent = compras;

    if (document.getElementById("crmGB"))
        document.getElementById("crmGB").textContent = gb + " GB";

    if (document.getElementById("crmValor"))
        document.getElementById("crmValor").textContent = valor + " MT";

}

// ==============================
// PESQUISA
// ==============================

function pesquisarCliente() {

    const texto = document
        .getElementById("pesquisaCliente")
        .value
        .toLowerCase();

    atualizarTabela(

        clientes.filter(c =>

            (c.nome || "").toLowerCase().includes(texto) ||

            (c.numero || "").toLowerCase().includes(texto) ||

            (c.grupo || "").toLowerCase().includes(texto)

        )

    );

}

// ==============================
// EDITAR
// ==============================

async function editarCliente(id) {

    const nome = prompt("Novo nome:");

    if (!nome) return;

    await fetch(API + "/clientes/" + id, {

        method: "PUT",

        headers: {

            "Content-Type": "application/json"

        },

        body: JSON.stringify({

            nome

        })

    });

    carregarClientes();

}

// ==============================
// REMOVER
// ==============================

async function removerCliente(id) {

    if (!confirm("Deseja remover este cliente?")) return;

    await fetch(API + "/clientes/" + id, {

        method: "DELETE"

    });

    carregarClientes();

}

// ==============================
// NOVO CLIENTE
// ==============================

async function adicionarCliente() {

    const nome = document.getElementById("novoNome").value;

    const numero = document.getElementById("novoNumero").value;

    const grupo = document.getElementById("novoGrupo").value;

    if (!nome || !numero) return;

    await fetch(API + "/clientes", {

        method: "POST",

        headers: {

            "Content-Type": "application/json"

        },

        body: JSON.stringify({

            nome,

            numero,

            grupo,

            totalCompras: 0,

            totalGB: 0,

            totalGasto: 0

        })

    });

    document.getElementById("novoNome").value = "";

    document.getElementById("novoNumero").value = "";

    carregarClientes();

}

// ==============================

carregarClientes();

setInterval(carregarClientes,5000);
