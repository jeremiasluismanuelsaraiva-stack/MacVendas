
const API = window.location.origin;

// =====================================
// CARREGAR DISPOSITIVOS
// =====================================

async function carregarDispositivos() {

    try {

        const resposta = await fetch(API + "/dispositivos");

        const json = await resposta.json();

        if (!json.success) return;

        const tabela = document.getElementById("tabelaDispositivos");

        if (!tabela) return;

        tabela.innerHTML = "";

        json.dispositivos.forEach(dispositivo => {

            tabela.innerHTML += `
                <tr>

                    <td>${dispositivo.id}</td>

                    <td>${dispositivo.nome || "-"}</td>

                    <td>${dispositivo.modelo || "-"}</td>

                    <td>${dispositivo.numero || "-"}</td>

                    <td>${dispositivo.status || "Offline"}</td>

                    <td>${dispositivo.ultimaAtividade || "-"}</td>

                    <td>

                        <button onclick="editarDispositivo('${dispositivo.id}')">
                            Editar
                        </button>

                        <button onclick="removerDispositivo('${dispositivo.id}')">
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

// =====================================
// ADICIONAR DISPOSITIVO
// =====================================

async function adicionarDispositivo(dados) {

    try {

        await fetch(API + "/dispositivos", {

            method: "POST",

            headers: {

                "Content-Type": "application/json"

            },

            body: JSON.stringify(dados)

        });

        carregarDispositivos();

    }

    catch (erro) {

        console.error(erro);

    }

}

// =====================================
// EDITAR DISPOSITIVO
// =====================================

async function editarDispositivo(id) {

    const nome = prompt("Nome do dispositivo:");

    if (!nome) return;

    try {

        await fetch(API + "/dispositivos/" + id, {

            method: "PUT",

            headers: {

                "Content-Type": "application/json"

            },

            body: JSON.stringify({

                nome

            })

        });

        carregarDispositivos();

    }

    catch (erro) {

        console.error(erro);

    }

}

// =====================================
// REMOVER DISPOSITIVO
// =====================================

async function removerDispositivo(id) {

    if (!confirm("Deseja remover este dispositivo?")) return;

    try {

        await fetch(API + "/dispositivos/" + id, {

            method: "DELETE"

        });

        carregarDispositivos();

    }

    catch (erro) {

        console.error(erro);

    }

}

// =====================================

carregarDispositivos();

setInterval(carregarDispositivos, 5000);
