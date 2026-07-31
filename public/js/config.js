
const API = window.location.origin;

// =====================================
// CARREGAR CONFIGURAÇÕES
// =====================================

async function carregarConfiguracoes() {

    try {

        const resposta = await fetch(API + "/configuracoes");

        const json = await resposta.json();

        if (!json.success) return;

        if (!json.configuracoes.length) return;

        const cfg = json.configuracoes[0];

        if (document.getElementById("nomeEmpresa"))
            document.getElementById("nomeEmpresa").value = cfg.nomeEmpresa || "";

        if (document.getElementById("telefone"))
            document.getElementById("telefone").value = cfg.telefone || "";

        if (document.getElementById("email"))
            document.getElementById("email").value = cfg.email || "";

        if (document.getElementById("moeda"))
            document.getElementById("moeda").value = cfg.moeda || "MT";

        if (document.getElementById("vendaGB"))
            document.getElementById("vendaGB").value = cfg.vendaGB || 0;

        if (document.getElementById("custoGB"))
            document.getElementById("custoGB").value = cfg.custoGB || 0;

        if (document.getElementById("ussd"))
            document.getElementById("ussd").value = cfg.ussd || "*162#";

        if (document.getElementById("tema"))
            document.getElementById("tema").value = cfg.tema || "dark";

        if (document.getElementById("idioma"))
            document.getElementById("idioma").value = cfg.idioma || "pt";

    }

    catch (erro) {

        console.error(erro);

    }

}

// =====================================
// SALVAR CONFIGURAÇÕES
// =====================================

async function salvarConfiguracoes() {

    try {

        const resposta = await fetch(API + "/configuracoes");

        const json = await resposta.json();

        let id = "";

        if (json.success && json.configuracoes.length) {

            id = json.configuracoes[0].id;

        }

        const dados = {

            nomeEmpresa: document.getElementById("nomeEmpresa")?.value,

            telefone: document.getElementById("telefone")?.value,

            email: document.getElementById("email")?.value,

            moeda: document.getElementById("moeda")?.value,

            vendaGB: Number(document.getElementById("vendaGB")?.value || 0),

            custoGB: Number(document.getElementById("custoGB")?.value || 0),

            ussd: document.getElementById("ussd")?.value,

            tema: document.getElementById("tema")?.value,

            idioma: document.getElementById("idioma")?.value

        };

        if (id) {

            await fetch(API + "/configuracoes/" + id, {

                method: "PUT",

                headers: {

                    "Content-Type": "application/json"

                },

                body: JSON.stringify(dados)

            });

        } else {

            await fetch(API + "/configuracoes", {

                method: "POST",

                headers: {

                    "Content-Type": "application/json"

                },

                body: JSON.stringify(dados)

            });

        }

        alert("Configurações guardadas com sucesso.");

        carregarConfiguracoes();

    }

    catch (erro) {

        console.error(erro);

        alert("Erro ao guardar as configurações.");

    }

}

// =====================================

document.addEventListener("DOMContentLoaded", () => {

    carregarConfiguracoes();

    const btn = document.getElementById("btnSalvarConfiguracoes");

    if (btn) {

        btn.addEventListener("click", salvarConfiguracoes);

    }

});
