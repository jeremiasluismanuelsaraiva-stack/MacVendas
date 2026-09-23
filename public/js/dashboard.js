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

    async function prepararAPI() {
        try {
            if (typeof window.garantirCredenciaisAPI === "function") {
                const autenticado =
                    await window.garantirCredenciaisAPI();

                if (!autenticado) {
                    console.warn(
                        "[MOZ TECH] Não foi possível preparar as credenciais da API."
                    );
                    return false;
                }
            }

            if (!verificarCredenciais()) {
                return false;
            }

            if (
                !window.MOZ_API ||
                typeof window.MOZ_API.get !== "function"
            ) {
                console.warn(
                    "[MOZ TECH] MOZ_API ainda não está disponível."
                );
                return false;
            }

            return true;

        } catch (erro) {
            console.error(
                "[MOZ TECH] Erro ao preparar API:",
                erro
            );

            return false;
        }
    }

    async function carregarDashboard() {

        if (carregandoDashboard) {
            return null;
        }

        carregandoDashboard = true;

        try {

            if (!(await prepararAPI())) {
                return null;
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

            const d =
                json.dashboard ||
                json.data ||
                json.vendas ||
                json;

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

            const data = elemento("data");

            if (data) {
                data.textContent =
                    "Atualizado em " +
                    new Date().toLocaleString("pt-MZ");
            }

            return json;

        }
        catch (erro) {

            console.error(
                "[MOZ TECH] Erro ao carregar dashboard:",
                erro
            );

            return null;

        }
        finally {
            carregandoDashboard = false;
        }
    }

    function textoStatus(status) {

        const valor =
            String(status || "pendente")
                .trim()
                .toLowerCase();

        const mapa = {
            concluida: {
                texto: "Concluído",
                classe: "concluido"
            },
            concluido: {
                texto: "Concluído",
                classe: "concluido"
            },
            processando: {
                texto: "Processando",
                classe: "processando"
            },
            processamento: {
                texto: "Processando",
                classe: "processando"
            },
            pendente: {
                texto: "Pendente",
                classe: "pendente"
            },
            falhou: {
                texto: "Falhou",
                classe: "falhou"
            },
            erro: {
                texto: "Falhou",
                classe: "falhou"
            },
            cancelado: {
                texto: "Cancelado",
                classe: "cancelado"
            },
            cancelada: {
                texto: "Cancelado",
                classe: "cancelado"
            }
        };

        return mapa[valor] || {
            texto:
                status
                    ? String(status)
                    : "Pendente",
            classe: "pendente"
        };
    }

    async function carregarVendas() {

        if (carregandoVendas) {
            return [];
        }

        carregandoVendas = true;

        try {

            if (!(await prepararAPI())) {
                return [];
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

        const lista =
            elemento("lista");

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
                        colspan="10"
                        style="text-align:center; padding:20px;"
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

                    const nomeCliente =
                        primeiroValor(
                            venda,
                            [
                                "nomeCliente",
                                "nome_cliente",
                                "clienteNome",
                                "cliente_nome",
                                "nome"
                            ]
                        ) || "-";

                    const numeroCliente =
                        primeiroValor(
                            venda,
                            [
                                "numeroCliente",
                                "numero_cliente",
                                "numero",
                                "telefone",
                                "phone",
                                "msisdn"
                            ]
                        ) || "-";

                    const numeroRecebeu =
                        primeiroValor(
                            venda,
                            [
                                "numeroRecebeu",
                                "numero_recebeu",
                                "numeroDestino",
                                "numero_destino",
                                "destino"
                            ]
                        ) ||
                        numeroCliente ||
                        "-";

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
                        textoStatus(
                            primeiroValor(
                                venda,
                                [
                                    "status",
                                    "estado"
                                ]
                            )
                        );

                    const pacote =
                        primeiroValor(
                            venda,
                            [
                                "pacote",
                                "nomePacote",
                                "nome_pacote",
                                "tipoPacote",
                                "tipo_pacote"
                            ]
                        ) || "-";

                    const metodoPagamento =
                        primeiroValor(
                            venda,
                            [
                                "metodoPagamento",
                                "metodo_pagamento",
                                "metodo",
                                "formaPagamento",
                                "forma_pagamento"
                            ]
                        ) || "-";

                    const dispositivo =
                        primeiroValor(
                            venda,
                            [
                                "dispositivoUsado",
                                "dispositivo_usado",
                                "dispositivo",
                                "aparelho",
                                "nomeDispositivo",
                                "nome_dispositivo",
                                "device"
                            ]
                        ) || "-";

                    const grupo =
                        primeiroValor(
                            venda,
                            [
                                "grupo",
                                "nomeGrupo",
                                "nome_grupo",
                                "grupoNome",
                                "grupo_nome"
                            ]
                        ) || "-";

                    return `
                        <tr>
                            <td>
                                ${escapar(nomeCliente)}
                            </td>

                            <td>
                                ${escapar(numeroCliente)}
                            </td>

                            <td>
                                ${escapar(numeroRecebeu)}
                            </td>

                            <td>
                                ${escapar(quantidade)}
                            </td>

                            <td>
                                ${escapar(pacote)}
                            </td>

                            <td>
                                ${escapar(dinheiro(valor))}
                            </td>

                            <td>
                                ${escapar(metodoPagamento)}
                            </td>

                            <td>
                                ${escapar(dispositivo)}
                            </td>

                            <td>
                                ${escapar(grupo)}
                            </td>

                            <td>
                                <span class="status ${escapar(status.classe)}">
                                    ${escapar(status.texto)}
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

        if (!(await prepararAPI())) {
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
        configurarBotaoAtualizar();
        mostrarCarregando();

        setTimeout(function () {
            carregarTudo();
        }, 300);
    }

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            iniciarDashboard,
            { once: true }
        );
    }
    else {
        iniciarDashboard();
    }

})();
