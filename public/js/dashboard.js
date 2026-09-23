// =====================================================
// DASHBOARD.JS
// Local: public/js/dashboard.js
// =====================================================

(function () {

    "use strict";

    let carregandoDashboard = false;
    let carregandoVendas = false;
    let botaoConfigurado = false;

    function elemento(id) {
        return document.getElementById(id);
    }

    function numero(valor) {
        if (valor === null || valor === undefined || valor === "") {
            return "0";
        }

        const n = Number(valor);

        if (!Number.isFinite(n)) {
            return "0";
        }

        return n.toLocaleString("pt-MZ", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        });
    }

    function dinheiro(valor) {
        if (valor === null || valor === undefined || valor === "") {
            return "0,00 MT";
        }

        const n = Number(valor);

        if (!Number.isFinite(n)) {
            return "0,00 MT";
        }

        return n.toLocaleString("pt-MZ", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }) + " MT";
    }

    function primeiroValor(objeto, campos) {
        if (!objeto) {
            return null;
        }

        for (let i = 0; i < campos.length; i++) {
            const campo = campos[i];

            if (
                objeto[campo] !== undefined &&
                objeto[campo] !== null &&
                objeto[campo] !== ""
            ) {
                return objeto[campo];
            }
        }

        return null;
    }

    function atualizar(id, valor) {
        const el = elemento(id);

        if (el) {
            el.textContent = valor;
        }
    }

    function escapar(valor) {
        return String(valor ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function mostrarCarregando() {
        atualizar("vendas", "...");
        atualizar("valor", "...");
        atualizar("clientes", "...");
        atualizar("disp", "...");
        atualizar("totalGB", "...");
        atualizar("lucro", "...");
        atualizar("custo", "...");
        atualizar("pedidos", "...");

        const data = elemento("data");

        if (data) {
            data.textContent = "Carregando...";
        }
    }

    function obterCredenciais() {
        const credenciais = window.MOZ_CREDENCIAIS_API;

        if (
            credenciais &&
            credenciais.uid &&
            credenciais.apiKey
        ) {
            return {
                uid: String(credenciais.uid).trim(),
                apiKey: String(credenciais.apiKey).trim()
            };
        }

        const uid =
            localStorage.getItem("uid") ||
            localStorage.getItem("moz_uid");

        const apiKey =
            localStorage.getItem("apiKey") ||
            localStorage.getItem("moz_api_key");

        if (uid && apiKey) {
            return {
                uid: String(uid).trim(),
                apiKey: String(apiKey).trim()
            };
        }

        return null;
    }

    function headersAPI() {
        const credenciais = obterCredenciais();

        const headers = {
            "Accept": "application/json"
        };

        if (
            credenciais &&
            credenciais.uid &&
            credenciais.apiKey
        ) {
            headers.uid = credenciais.uid;
            headers["x-api-key"] = credenciais.apiKey;
            headers.apiKey = credenciais.apiKey;
        }

        return headers;
    }

    function verificarCredenciais() {
        const credenciais = obterCredenciais();

        if (
            !credenciais ||
            !credenciais.uid ||
            !credenciais.apiKey
        ) {
            console.warn(
                "[MOZ TECH] Credenciais da API ainda não disponíveis."
            );

            return false;
        }

        return true;
    }

    async function carregarDashboard() {

        if (carregandoDashboard) {
            console.log(
                "[MOZ TECH] Dashboard já está carregando."
            );
            return null;
        }

        if (!verificarCredenciais()) {
            return null;
        }

        carregandoDashboard = true;

        try {

            console.log(
                "[MOZ TECH] GET /api/dashboard"
            );

            if (typeof window.garantirCredenciaisAPI === "function") {
                const autenticado =
                    await window.garantirCredenciaisAPI();

                if (!autenticado) {
                    throw new Error(
                        "Credenciais da API não encontradas."
                    );
                }
            }

            if (
                !window.MOZ_API ||
                typeof window.MOZ_API.get !== "function"
            ) {
                throw new Error(
                    "API do sistema ainda não está disponível."
                );
            }

            const json =
                await window.MOZ_API.get("/dashboard");

            console.log(
                "[MOZ TECH] Resposta dashboard:",
                json
            );

            if (!json || json.success === false) {
                throw new Error(
                    json?.message ||
                    json?.error ||
                    "Erro ao carregar dashboard."
                );
            }

            // =================================================
            // DADOS DO DASHBOARD
            // A API atual retorna os indicadores dentro de:
            // json.vendas
            // =================================================

            const d =
                json.dashboard ||
                json.data ||
                json.vendas ||
                json;

            console.log(
                "[MOZ TECH] Dados usados nos indicadores:",
                d
            );

            if (
                !d ||
                typeof d !== "object"
            ) {
                throw new Error(
                    "Dados do dashboard inválidos."
                );
            }

            // =================================================
            // VENDAS
            // =================================================

            atualizar(
                "vendas",
                numero(
                    primeiroValor(
                        d,
                        [
                            "vendas",
                            "totalVendas",
                            "total_vendas"
                        ]
                    )
                )
            );

            // =================================================
            // FATURAMENTO
            // =================================================

            atualizar(
                "valor",
                dinheiro(
                    primeiroValor(
                        d,
                        [
                            "faturamento",
                            "totalFaturamento",
                            "total_faturamento"
                        ]
                    )
                )
            );

            // =================================================
            // CLIENTES
            // =================================================

            atualizar(
                "clientes",
                numero(
                    primeiroValor(
                        d,
                        [
                            "clientes",
                            "totalClientes",
                            "total_clientes"
                        ]
                    )
                )
            );

            // =================================================
            // DISPOSITIVOS
            // =================================================

            atualizar(
                "disp",
                numero(
                    primeiroValor(
                        d,
                        [
                            "dispositivos",
                            "totalDispositivos",
                            "total_dispositivos"
                        ]
                    )
                )
            );

            // =================================================
            // TOTAL GB
            // =================================================

            atualizar(
                "totalGB",
                numero(
                    primeiroValor(
                        d,
                        [
                            "totalGB",
                            "totalGb",
                            "total_gb",
                            "gb"
                        ]
                    )
                ) + " GB"
            );

            // =================================================
            // LUCRO
            // =================================================

            atualizar(
                "lucro",
                dinheiro(
                    primeiroValor(
                        d,
                        [
                            "lucro",
                            "totalLucro",
                            "total_lucro"
                        ]
                    )
                )
            );

            // =================================================
            // CUSTO
            // =================================================

            atualizar(
                "custo",
                dinheiro(
                    primeiroValor(
                        d,
                        [
                            "custo",
                            "totalCusto",
                            "total_custo"
                        ]
                    )
                )
            );

            // =================================================
            // PEDIDOS
            // =================================================

            atualizar(
                "pedidos",
                numero(
                    primeiroValor(
                        d,
                        [
                            "pedidos",
                            "totalPedidos",
                            "total_pedidos"
                        ]
                    )
                )
            );

            // =================================================
            // DATA
            // =================================================

            const data = elemento("data");

            if (data) {
                data.textContent =
                    "Atualizado em " +
                    new Date().toLocaleString("pt-MZ");
            }

            console.log(
                "[MOZ TECH] Dashboard carregado com sucesso."
            );

            return json;

        }
        catch (erro) {

            console.error(
                "[MOZ TECH] Erro ao carregar dashboard:",
                erro
            );

            const data = elemento("data");

            if (data) {
                data.textContent =
                    "Não foi possível atualizar agora";
            }

            return null;

        }
        finally {
            carregandoDashboard = false;
        }
    }

    async function carregarVendas() {

        if (carregandoVendas) {
            console.log(
                "[MOZ TECH] Vendas já estão carregando."
            );
            return [];
        }

        if (!verificarCredenciais()) {
            return [];
        }

        carregandoVendas = true;

        try {

            console.log(
                "[MOZ TECH] GET /api/compras"
            );

            if (typeof window.garantirCredenciaisAPI === "function") {
                const autenticado =
                    await window.garantirCredenciaisAPI();

                if (!autenticado) {
                    throw new Error(
                        "Credenciais da API não encontradas."
                    );
                }
            }

            if (
                !window.MOZ_API ||
                typeof window.MOZ_API.get !== "function"
            ) {
                throw new Error(
                    "API do sistema ainda não está disponível."
                );
            }

            const json =
                await window.MOZ_API.get("/compras");

            console.log(
                "[MOZ TECH] Resposta vendas:",
                json
            );

            let vendas = [];

            if (Array.isArray(json)) {
                vendas = json;
            }
            else if (
                json &&
                Array.isArray(json.vendas)
            ) {
                vendas = json.vendas;
            }
            else if (
                json &&
                Array.isArray(json.compras)
            ) {
                vendas = json.compras;
            }
            else if (
                json &&
                Array.isArray(json.data)
            ) {
                vendas = json.data;
            }
            else if (
                json &&
                json.data &&
                Array.isArray(json.data.vendas)
            ) {
                vendas = json.data.vendas;
            }

            renderizarVendas(vendas);

            console.log(
                "[MOZ TECH] Total de vendas:",
                vendas.length
            );

            return vendas;

        }
        catch (erro) {

            console.error(
                "[MOZ TECH] Erro ao carregar vendas:",
                erro
            );

            return [];

        }
        finally {
            carregandoVendas = false;
        }
    }

    function renderizarVendas(vendas) {

        const lista = elemento("lista");

        if (!lista) {
            console.warn(
                "[MOZ TECH] #lista não encontrado."
            );
            return;
        }

        if (
            !Array.isArray(vendas) ||
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

        lista.innerHTML =
            vendas
                .slice(0, 20)
                .map(function (venda) {

                    const numeroVenda =
                        primeiroValor(
                            venda,
                            [
                                "numero",
                                "telefone",
                                "phone",
                                "msisdn",
                                "numeroCliente",
                                "numero_cliente"
                            ]
                        ) || "-";

                    const mb =
                        Number(
                            primeiroValor(
                                venda,
                                [
                                    "mb",
                                    "MB",
                                    "megabytes",
                                    "quantidadeMB",
                                    "quantidade_mb"
                                ]
                            )
                        ) || 0;

                    const gb =
                        Number(
                            primeiroValor(
                                venda,
                                [
                                    "gb",
                                    "GB",
                                    "gbPacote",
                                    "gb_pacote",
                                    "gbpacote",
                                    "quantidadeGB",
                                    "quantidade_gb"
                                ]
                            )
                        ) || 0;

                    let quantidade = "-";

                    if (gb > 0) {
                        quantidade =
                            numero(gb) + " GB";
                    }
                    else if (mb > 0) {
                        quantidade =
                            numero(mb) + " MB";
                    }

                    const valor =
                        primeiroValor(
                            venda,
                            [
                                "valor_venda",
                                "valorVenda",
                                "valor_pacote",
                                "valorPacote",
                                "valor",
                                "preco",
                                "preço"
                            ]
                        );

                    const status =
                        primeiroValor(
                            venda,
                            [
                                "status",
                                "estado"
                            ]
                        ) || "Concluído";

                    return `
                        <tr>
                            <td>
                                ${escapar(numeroVenda)}
                            </td>
                            <td>
                                ${escapar(quantidade)}
                            </td>
                            <td>
                                ${escapar(dinheiro(valor))}
                            </td>
                            <td>
                                <span class="status ok">
                                    ${escapar(status)}
                                </span>
                            </td>
                        </tr>
                    `;

                })
                .join("");
    }

    async function carregarTudo() {

        console.log(
            "[MOZ TECH] Atualizando dashboard completo..."
        );

        if (!verificarCredenciais()) {

            console.warn(
                "[MOZ TECH] Atualização aguardando autenticação."
            );

            return;
        }

        await Promise.allSettled([
            carregarDashboard(),
            carregarVendas()
        ]);

        console.log(
            "[MOZ TECH] Atualização concluída."
        );
    }

    function configurarBotaoAtualizar() {

        if (botaoConfigurado) {
            return;
        }

        const botao =
            elemento("btnAtualizar");

        if (!botao) {
            console.warn(
                "[MOZ TECH] #btnAtualizar não encontrado."
            );
            return;
        }

        botaoConfigurado = true;

        botao.addEventListener(
            "click",
            async function (event) {

                event.preventDefault();
                event.stopPropagation();

                if (botao.disabled) {
                    return;
                }

                console.log(
                    "[MOZ TECH] Atualizar clicado."
                );

                const original =
                    botao.innerHTML;

                botao.disabled = true;

                botao.innerHTML = `
                    <i class="fas fa-spinner fa-spin"></i>
                    Atualizando...
                `;

                try {
                    await carregarTudo();
                }
                catch (erro) {
                    console.error(
                        "[MOZ TECH] Erro no botão:",
                        erro
                    );
                }
                finally {
                    botao.disabled = false;
                    botao.innerHTML = original;
                }
            }
        );
    }

    window.carregarDashboard =
        carregarDashboard;

    window.carregarVendas =
        carregarVendas;

    window.carregarTabela =
        carregarVendas;

    window.carregarTudo =
        carregarTudo;

    function iniciarDashboard() {

        console.log(
            "========================================"
        );

        console.log(
            "MOZ TECH - DASHBOARD.JS"
        );

        console.log(
            "========================================"
        );

        configurarBotaoAtualizar();
        mostrarCarregando();
    }

    if (document.readyState === "loading") {

        document.addEventListener(
            "DOMContentLoaded",
            iniciarDashboard,
            {
                once: true
            }
        );

    }
    else {
        iniciarDashboard();
    }

})();
