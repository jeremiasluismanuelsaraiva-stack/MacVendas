
const API = window.location.origin;

// ======================================
// CARREGAR PACOTES
// ======================================

async function carregarPacotes() {

    try {

        const resposta = await fetch(API + "/pacotes");

        const json = await resposta.json();

        if (!json.success) return;

        const tabela = document.getElementById("tabelaPacotes");

        if (!tabela) return;

        tabela.innerHTML = "";

        json.pacotes.forEach(pacote => {

            tabela.innerHTML += `
                <tr>

                    <td>${pacote.nome}</td>

                    <td>${pacote.tipo}</td>

                    <td>${pacote.gb} GB</td>

                    <td>${pacote.valor} MT</td>

                    <td>${pacote.vantagem || "-"}</td>

                    <td>${pacote.ativo ? "Ativo" : "Desativado"}</td>

                    <td>

                        <button onclick="editarPacote('${pacote.id}')">
                            Editar
                        </button>

                        <button onclick="removerPacote('${pacote.id}')">
                            Remover
                        </button>

                    </td>

                </tr>
            `;

        });

    }

    catch (erro) {

        console.error(erro);

    }

}

// ======================================
// NOVO PACOTE
// ======================================

async function adicionarPacote(dados) {

    try {

        await fetch(API + "/pacotes", {

            method: "POST",

            headers: {

                "Content-Type": "application/json"

            },

            body: JSON.stringify(dados)

        });

        carregarPacotes();

    }

    catch (erro) {

        console.error(erro);

    }

}

// ======================================
// EDITAR
// ======================================

async function editarPacote(id) {

    const nome = prompt("Nome do pacote:");

    if (!nome) return;

    try {

        await fetch(API + "/pacotes/" + id, {

            method: "PUT",

            headers: {

                "Content-Type": "application/json"

            },

            body: JSON.stringify({

                nome

            })

        });

        carregarPacotes();

    }

    catch (erro) {

        console.error(erro);

    }

}

// ======================================
// REMOVER
// ======================================

async function removerPacote(id) {

    if (!confirm("Deseja remover este pacote?")) return;

    try {

        await fetch(API + "/pacotes/" + id, {

            method: "DELETE"

        });

        carregarPacotes();

    }

    catch (erro) {

        console.error(erro);

    }

}

// ======================================

carregarPacotes();

setInterval(carregarPacotes, 10000);
