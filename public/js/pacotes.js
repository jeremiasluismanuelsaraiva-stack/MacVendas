"use strict";

/*
 * MACVENDAS - PACOTES
 * Suporta:
 * - Internet por GB/MB
 * - Ilimitado
 * - Diário
 * - Semanal
 * - Mensal
 * - Social
 * - Personalizado
 */

const PACOTES_API = "http://br1.bronxyshost.com:4234";
let pacotesData = [];
let pacoteEditando = null;
let filtroPacoteAtual = "todos";

function escapar(valor) {
    return String(valor ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

async function garantirPacotesAPI() {
    if (typeof window.garantirCredenciaisAPI === "function") {
        try {
            await window.garantirCredenciaisAPI();
        } catch (_) {}
    }

    if (window.MOZ_API && typeof window.MOZ_API.get === "function") {
        return true;
    }

    const apiKey = localStorage.getItem("apiKey") || "";
    if (apiKey) return true;

    throw new Error("API do sistema ainda não está disponível.");
}

async function chamarPacotesAPI(endpoint, options = {}) {
    await garantirPacotesAPI();

    const metodo = String(options.method || "GET").toUpperCase();

    if (window.MOZ_API) {
        if (metodo === "GET" && typeof window.MOZ_API.get === "function") {
            return window.MOZ_API.get(endpoint);
        }

        if (metodo === "POST" && typeof window.MOZ_API.post === "function") {
            return window.MOZ_API.post(endpoint, options.body || {});
        }

        if (metodo === "PUT" && typeof window.MOZ_API.put === "function") {
            return window.MOZ_API.put(endpoint, options.body || {});
        }

        if (metodo === "DELETE" && typeof window.MOZ_API.delete === "function") {
            return window.MOZ_API.delete(endpoint);
        }
    }

    const apiKey = localStorage.getItem("apiKey") || "";
    const resposta = await fetch(PACOTES_API + endpoint, {
        method: metodo,
        headers: {
            "Content-Type": "application/json",
            ...(apiKey ? { "x-api-key": apiKey } : {})
        },
        body: metodo === "GET"
            ? undefined
            : JSON.stringify(options.body || {})
    });

    let json = {};
    try {
        json = await resposta.json();
    } catch (_) {}

    if (!resposta.ok) {
        throw new Error(
            json.error ||
            json.message ||
            `HTTP ${resposta.status}`
        );
    }

    return json;
}

function normalizarPacote(p) {
    const ilimitado =
        String(p.tipo || "").toLowerCase() === "ilimitado" ||
        String(p.unidade || "").toLowerCase() === "ilimitado";

    const quantidade =
        p.quantidade !== undefined
            ? Number(p.quantidade || 0)
            : Number(p.gb || 0);

    const gb = ilimitado ? 0 : Number(p.gb || quantidade || 0);
    const mb = ilimitado ? 0 : Number(p.mb || (gb * 1000));

    return {
        ...p,
        nome: p.nome || p.pacote || "Pacote",
        tipo: p.tipo || "internet",
        validade: p.validade || "",
        unidade: p.unidade || (ilimitado ? "ilimitado" : "GB"),
        quantidade,
        gb,
        mb,
        preco: Number(p.preco ?? p.valor ?? 0),
        custo: Number(p.custo || 0),
        vantagem: p.vantagem || "",
        grupoId: p.grupoId || p.grupo_id || "",
        ativo: p.ativo !== false
    };
}

function iconeTipo(tipo) {
    return {
        internet: "🌐",
        ilimitado: "♾️",
        diario: "☀️",
        semanal: "📅",
        mensal: "📆",
        social: "📱",
        personalizado: "⚙️"
    }[tipo] || "📦";
}

function nomeTipo(tipo) {
    return {
        internet: "Internet",
        ilimitado: "Ilimitado",
        diario: "Diário",
        semanal: "Semanal",
        mensal: "Mensal",
        social: "Social",
        personalizado: "Personalizado"
    }[tipo] || tipo;
}

function mostrarToastPacote(mensagem, erro = false) {
    if (typeof window.mostrarToast === "function") {
        window.mostrarToast(mensagem, erro);
        return;
    }

    const toast = document.getElementById("toastMessage");
    const box = document.getElementById("toast");

    if (toast && box) {
        toast.textContent = mensagem;
        box.style.display = "flex";
        setTimeout(() => box.style.display = "none", 2500);
    } else {
        alert(mensagem);
    }
}

function criarInterfacePacotes() {
    const container = document.getElementById("pacotesConteudo");

    if (!container) {
        return null;
    }

    container.innerHTML = `
        <div class="pacotes-macvendas">
            <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:20px;">
                <div>
                    <h3 style="margin:0;">📦 Gestão de Pacotes</h3>
                    <small style="opacity:.7;">Crie pacotes de Internet, ilimitados, diários, semanais, mensais e personalizados.</small>
                </div>
                <button type="button" class="btn btn-primary" id="novoPacoteMacBtn">
                    <i class="fas fa-plus"></i> Novo Pacote
                </button>
            </div>

            <div id="pacoteFiltrosMac" style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:18px;">
                ${[
                    ["todos", "Todos"],
                    ["internet", "🌐 Internet"],
                    ["ilimitado", "♾️ Ilimitado"],
                    ["diario", "☀️ Diário"],
                    ["semanal", "📅 Semanal"],
                    ["mensal", "📆 Mensal"],
                    ["social", "📱 Social"],
                    ["personalizado", "⚙️ Personalizado"]
                ].map(([v, t]) => `
                    <button type="button"
                        class="rank-filter-btn ${v === "todos" ? "active" : ""}"
                        data-pacote-filtro-mac="${v}">
                        ${t}
                    </button>
                `).join("")}
            </div>

            <div id="listaPacotesMac">
                <div class="empty-state">Carregando pacotes...</div>
            </div>
        </div>

        <div id="modalPacoteMac" class="modal" style="display:none;">
            <div class="modal-content" style="max-width:620px;">
                <h3 id="modalPacoteMacTitulo">📦 Novo Pacote</h3>

                <div class="form-group">
                    <label>Nome do pacote</label>
                    <input id="macPacoteNome" type="text" placeholder="Ex: 10 GB Mensal">
                </div>

                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                    <div class="form-group">
                        <label>Tipo</label>
                        <select id="macPacoteTipo">
                            <option value="internet">🌐 Internet</option>
                            <option value="ilimitado">♾️ Ilimitado</option>
                            <option value="diario">☀️ Diário</option>
                            <option value="semanal">📅 Semanal</option>
                            <option value="mensal">📆 Mensal</option>
                            <option value="social">📱 Social</option>
                            <option value="personalizado">⚙️ Personalizado</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label>Validade</label>
                        <input id="macPacoteValidade" type="text" placeholder="Ex: 7 dias / 30 dias">
                    </div>
                </div>

                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                    <div class="form-group">
                        <label>Quantidade</label>
                        <input id="macPacoteQuantidade" type="number" min="0" step="0.01" placeholder="Ex: 10">
                    </div>

                    <div class="form-group">
                        <label>Unidade</label>
                        <select id="macPacoteUnidade">
                            <option value="GB">GB</option>
                            <option value="MB">MB</option>
                            <option value="ilimitado">Ilimitado</option>
                            <option value="unidade">Unidade</option>
                        </select>
                    </div>
                </div>

                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                    <div class="form-group">
                        <label>Preço (MT)</label>
                        <input id="macPacotePreco" type="number" min="0" step="0.01" placeholder="Ex: 250">
                    </div>

                    <div class="form-group">
                        <label>Custo (MT)</label>
                        <input id="macPacoteCusto" type="number" min="0" step="0.01" placeholder="Ex: 200">
                    </div>
                </div>

                <div class="form-group">
                    <label>Vantagem / descrição</label>
                    <input id="macPacoteVantagem" type="text" placeholder="Ex: WhatsApp + Facebook">
                </div>

                <div class="form-group">
                    <label>Grupo</label>
                    <input id="macPacoteGrupo" type="text" placeholder="ID ou nome do grupo (opcional)">
                </div>

                <div class="form-group" style="display:flex;align-items:center;gap:8px;">
                    <input id="macPacoteAtivo" type="checkbox" checked>
                    <label for="macPacoteAtivo" style="margin:0;">Pacote ativo</label>
                </div>

                <div class="modal-buttons">
                    <button type="button" class="btn btn-outline" id="cancelarPacoteMacBtn">Cancelar</button>
                    <button type="button" class="btn btn-primary" id="salvarPacoteMacBtn">Salvar Pacote</button>
                </div>
            </div>
        </div>
    `;

    document.getElementById("novoPacoteMacBtn")
        ?.addEventListener("click", () => abrirModalPacoteMac());

    document.getElementById("cancelarPacoteMacBtn")
        ?.addEventListener("click", fecharModalPacoteMac);

    document.getElementById("salvarPacoteMacBtn")
        ?.addEventListener("click", salvarPacoteMac);

    document.querySelectorAll("[data-pacote-filtro-mac]")
        .forEach(btn => {
            btn.addEventListener("click", () => {
                filtroPacoteAtual = btn.dataset.pacoteFiltroMac;

                document.querySelectorAll("[data-pacote-filtro-mac]")
                    .forEach(b => b.classList.remove("active"));

                btn.classList.add("active");
                renderizarPacotesMac();
            });
        });

    document.getElementById("macPacoteTipo")
        ?.addEventListener("change", atualizarCampoIlimitado);

    atualizarCampoIlimitado();

    return container;
}

function atualizarCampoIlimitado() {
    const tipo = document.getElementById("macPacoteTipo");
    const unidade = document.getElementById("macPacoteUnidade");
    const quantidade = document.getElementById("macPacoteQuantidade");
    const validade = document.getElementById("macPacoteValidade");

    if (!tipo || !unidade || !quantidade) return;

    const ilimitado = tipo.value === "ilimitado";

    if (ilimitado) {
        unidade.value = "ilimitado";
        quantidade.value = "";
        quantidade.disabled = true;

        if (validade && !validade.value) {
            validade.value = "30 dias";
        }
    } else {
        quantidade.disabled = false;

        if (unidade.value === "ilimitado") {
            unidade.value = "GB";
        }
    }
}

function abrirModalPacoteMac(id = null) {
    pacoteEditando = id;

    const modal = document.getElementById("modalPacoteMac");
    if (!modal) return;

    const titulo = document.getElementById("modalPacoteMacTitulo");

    if (id) {
        const p = pacotesData.find(item => item.id === id);

        if (!p) return;

        titulo.textContent = "✏️ Editar Pacote";
        document.getElementById("macPacoteNome").value = p.nome;
        document.getElementById("macPacoteTipo").value = p.tipo;
        document.getElementById("macPacoteValidade").value = p.validade;
        document.getElementById("macPacoteQuantidade").value = p.quantidade || "";
        document.getElementById("macPacoteUnidade").value = p.unidade;
        document.getElementById("macPacotePreco").value = p.preco;
        document.getElementById("macPacoteCusto").value = p.custo;
        document.getElementById("macPacoteVantagem").value = p.vantagem;
        document.getElementById("macPacoteGrupo").value = p.grupoId;
        document.getElementById("macPacoteAtivo").checked = p.ativo;
    } else {
        titulo.textContent = "📦 Novo Pacote";

        document.getElementById("macPacoteNome").value = "";
        document.getElementById("macPacoteTipo").value = "internet";
        document.getElementById("macPacoteValidade").value = "";
        document.getElementById("macPacoteQuantidade").value = "";
        document.getElementById("macPacoteUnidade").value = "GB";
        document.getElementById("macPacotePreco").value = "";
        document.getElementById("macPacoteCusto").value = "";
        document.getElementById("macPacoteVantagem").value = "";
        document.getElementById("macPacoteGrupo").value = "";
        document.getElementById("macPacoteAtivo").checked = true;
    }

    atualizarCampoIlimitado();
    modal.style.display = "flex";
}

function fecharModalPacoteMac() {
    const modal = document.getElementById("modalPacoteMac");
    if (modal) modal.style.display = "none";
    pacoteEditando = null;
}

async function salvarPacoteMac() {
    try {
        const nome = document.getElementById("macPacoteNome").value.trim();
        const tipo = document.getElementById("macPacoteTipo").value;
        const validade = document.getElementById("macPacoteValidade").value.trim();
        const quantidade = Number(document.getElementById("macPacoteQuantidade").value || 0);
        const unidade = document.getElementById("macPacoteUnidade").value;
        const preco = Number(document.getElementById("macPacotePreco").value || 0);
        const custo = Number(document.getElementById("macPacoteCusto").value || 0);
        const vantagem = document.getElementById("macPacoteVantagem").value.trim();
        const grupoId = document.getElementById("macPacoteGrupo").value.trim();
        const ativo = document.getElementById("macPacoteAtivo").checked;

        if (!nome) {
            mostrarToastPacote("Digite o nome do pacote.", true);
            return;
        }

        if (tipo !== "ilimitado" && quantidade <= 0) {
            mostrarToastPacote("Digite uma quantidade válida.", true);
            return;
        }

        if (preco <= 0) {
            mostrarToastPacote("Digite um preço válido.", true);
            return;
        }

        let gb = 0;
        let mb = 0;

        if (unidade === "GB") {
            gb = quantidade;
            mb = quantidade * 1000;
        } else if (unidade === "MB") {
            mb = quantidade;
            gb = quantidade / 1000;
        }

        const body = {
            nome,
            tipo,
            validade,
            unidade,
            quantidade,
            gb,
            mb,
            preco,
            valor: preco,
            custo,
            vantagem,
            descricao: vantagem,
            grupoId,
            ativo
        };

        if (pacoteEditando) {
            await chamarPacotesAPI(`/pacotes/${encodeURIComponent(pacoteEditando)}`, {
                method: "PUT",
                body
            });

            mostrarToastPacote("Pacote atualizado!");
        } else {
            await chamarPacotesAPI("/pacotes", {
                method: "POST",
                body
            });

            mostrarToastPacote("Pacote adicionado!");
        }

        fecharModalPacoteMac();
        await carregarPacotes();

    } catch (erro) {
        console.error("[PACOTES] Erro ao salvar:", erro);
        mostrarToastPacote(
            "Não foi possível salvar o pacote: " + erro.message,
            true
        );
    }
}

function formatarQuantidade(p) {
    if (p.tipo === "ilimitado" || p.unidade === "ilimitado") {
        return "∞ Ilimitado";
    }

    const q = Number(p.quantidade || p.gb || 0);

    if (p.unidade === "MB") {
        return `${q.toLocaleString("pt-MZ")} MB`;
    }

    if (p.unidade === "unidade") {
        return `${q.toLocaleString("pt-MZ")} unidades`;
    }

    return `${q.toLocaleString("pt-MZ")} GB`;
}

function formatarLucro(p) {
    const lucro = Number(p.preco || 0) - Number(p.custo || 0);
    return `${lucro.toLocaleString("pt-MZ")} MT`;
}

function renderizarPacotesMac() {
    const container = document.getElementById("listaPacotesMac");
    if (!container) return;

    let lista = [...pacotesData];

    if (filtroPacoteAtual !== "todos") {
        lista = lista.filter(
            p => String(p.tipo).toLowerCase() === filtroPacoteAtual
        );
    }

    if (!lista.length) {
        container.innerHTML = `
            <div class="empty-state">
                Nenhum pacote cadastrado neste filtro.
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:15px;">
            ${lista.map(p => `
                <div class="pacote-item" style="padding:18px;border:1px solid rgba(128,128,128,.2);border-radius:14px;">
                    <div style="display:flex;justify-content:space-between;gap:10px;align-items:flex-start;">
                        <div>
                            <div style="font-size:18px;font-weight:700;">
                                ${iconeTipo(p.tipo)} ${escapar(p.nome)}
                            </div>
                            <div style="font-size:12px;opacity:.65;margin-top:4px;">
                                ${escapar(nomeTipo(p.tipo))}
                            </div>
                        </div>

                        <span class="pacote-badge ${escapar(p.tipo)}">
                            ${p.ativo ? "Ativo" : "Inativo"}
                        </span>
                    </div>

                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:16px 0;">
                        <div>
                            <small style="opacity:.6;">Quantidade</small>
                            <div><strong>${formatarQuantidade(p)}</strong></div>
                        </div>

                        <div>
                            <small style="opacity:.6;">Validade</small>
                            <div><strong>${escapar(p.validade || "Não definida")}</strong></div>
                        </div>

                        <div>
                            <small style="opacity:.6;">Preço</small>
                            <div><strong>${Number(p.preco).toLocaleString("pt-MZ")} MT</strong></div>
                        </div>

                        <div>
                            <small style="opacity:.6;">Lucro</small>
                            <div><strong>${formatarLucro(p)}</strong></div>
                        </div>
                    </div>

                    ${p.vantagem ? `
                        <div style="font-size:13px;margin-bottom:12px;">
                            ⭐ ${escapar(p.vantagem)}
                        </div>
                    ` : ""}

                    ${p.grupoId ? `
                        <div style="font-size:12px;opacity:.7;margin-bottom:12px;">
                            👥 ${escapar(p.grupoId)}
                        </div>
                    ` : ""}

                    <div style="display:flex;justify-content:flex-end;gap:8px;">
                        <button type="button"
                            class="btn btn-outline"
                            data-editar-pacote="${escapar(p.id)}">
                            <i class="fas fa-edit"></i> Editar
                        </button>

                        <button type="button"
                            class="btn btn-danger"
                            data-excluir-pacote="${escapar(p.id)}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `).join("")}
        </div>
    `;

    container.querySelectorAll("[data-editar-pacote]").forEach(btn => {
        btn.addEventListener("click", () => {
            abrirModalPacoteMac(btn.dataset.editarPacote);
        });
    });

    container.querySelectorAll("[data-excluir-pacote]").forEach(btn => {
        btn.addEventListener("click", () => {
            excluirPacoteMac(btn.dataset.excluirPacote);
        });
    });
}

async function excluirPacoteMac(id) {
    const pacote = pacotesData.find(p => p.id === id);

    if (!pacote) return;

    if (!confirm(`Excluir o pacote "${pacote.nome}"?`)) {
        return;
    }

    try {
        await chamarPacotesAPI(`/pacotes/${encodeURIComponent(id)}`, {
            method: "DELETE"
        });

        mostrarToastPacote("Pacote excluído!");
        await carregarPacotes();

    } catch (erro) {
        console.error("[PACOTES] Erro ao excluir:", erro);
        mostrarToastPacote(
            "Não foi possível excluir: " + erro.message,
            true
        );
    }
}

async function carregarPacotes() {
    try {
        const container = criarInterfacePacotes();

        if (!container) {
            console.warn("[PACOTES] #pacotesConteudo não encontrado.");
            return;
        }

        container.querySelector("#listaPacotesMac").innerHTML =
            `<div class="empty-state">Carregando pacotes...</div>`;

        const resposta = await chamarPacotesAPI("/pacotes");

        const lista =
            Array.isArray(resposta)
                ? resposta
                : Array.isArray(resposta.pacotes)
                    ? resposta.pacotes
                    : Array.isArray(resposta.data)
                        ? resposta.data
                        : [];

        pacotesData = lista.map(normalizarPacote);

        renderizarPacotesMac();

        console.log("[PACOTES] Pacotes carregados:", pacotesData.length);

    } catch (erro) {
        console.error("[PACOTES] Erro ao carregar pacotes:", erro);

        const container = document.getElementById("listaPacotesMac");

        if (container) {
            container.innerHTML = `
                <div class="empty-state" style="color:#ef4444;">
                    Não foi possível carregar os pacotes.<br>
                    <small>${escapar(erro.message)}</small>
                </div>
            `;
        }
    }
}

window.carregarPacotes = carregarPacotes;
window.abrirModalPacote = abrirModalPacoteMac;
window.salvarPacote = salvarPacoteMac;
window.excluirPacote = excluirPacoteMac;

console.log("[MACVENDAS] pacotes.js iniciado.");
