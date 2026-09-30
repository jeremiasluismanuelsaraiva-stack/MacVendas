// dashboard_sync.js
"use strict";

const fs = require("fs");
const path = require("path");
const axios = require("axios");

const CONFIG_FILE = path.join(__dirname, "data", "dashboard_sync.json");
const PEDIDO_DB = path.join(__dirname, "pedido.json");
const FILE_DISPOSITIVOS = path.join(__dirname, "data", "dispositivos.json");
const FILE_TRIGGERS = path.join(__dirname, "data", "triggers.json");

let sincronizando = false;
let sincronizacaoPendente = false;
let ultimoResultado = null;

function lerJson(caminho, padrao) {
    try {
        if (!fs.existsSync(caminho)) return padrao;
        const texto = fs.readFileSync(caminho, "utf8");
        if (!texto.trim()) return padrao;
        return JSON.parse(texto);
    } catch (erro) {
        console.log("[SYNC DASHBOARD] Erro ao ler", caminho, erro.message);
        return padrao;
    }
}

function carregarConfig() {
    const config = lerJson(CONFIG_FILE, {});

    return {
        ativo: config.ativo !== false,
        url: String(
            config.url || "http://br1.bronxyshost.com:4234"
        ).replace(/\/$/, ""),
        uid: String(config.uid || "").trim(),
        apiKey: String(config.apiKey || "").trim(),

        // Mínimo de 2 segundos para atualização praticamente em tempo real.
        intervaloMs: Math.max(
            2000,
            Number(config.intervaloMs || 2000)
        )
    };
}

function normalizarAparelho(valor) {
    return String(valor || "")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");
}

function normalizarStatus(valor) {
    const status = String(valor || "pendente")
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

    if (status === "processando") return "processando";
    if (status === "finalizado") return "finalizado";
    if (status === "falhado") return "falhado";
    if (status === "cancelado") return "cancelado";

    return "pendente";
}

function lerPedidos() {
    const lista = lerJson(PEDIDO_DB, []);
    return Array.isArray(lista) ? lista : [];
}

/*
 * DATA ORIGINAL DO PEDIDO
 *
 * Para pedidos vindos do bot, dataCriacao é a fonte principal.
 * Nunca usar dataSMS, dataFinalizacao, atualizadoEm ou a hora
 * da sincronização como data de criação.
 */
function obterDataCriacaoOriginal(pedido) {
    const candidatos = [
        pedido?.dataCriacao,
        pedido?.criadoEm,
        pedido?.createdAt,
        pedido?.data
    ];

    for (const valor of candidatos) {
        if (valor === null || valor === undefined) continue;

        const texto = String(valor).trim();
        if (!texto) continue;

        const data = new Date(texto);

        if (!Number.isNaN(data.getTime())) {
            return data.toISOString();
        }
    }

    return null;
}

function lerDispositivos() {
    const lista = lerJson(FILE_DISPOSITIVOS, []);
    return Array.isArray(lista) ? lista : [];
}

function lerTriggers() {
    const valor = lerJson(FILE_TRIGGERS, []);

    if (Array.isArray(valor)) return valor;

    return valor && typeof valor === "object"
        ? [valor]
        : [];
}

function headers(config) {
    return {
        Accept: "application/json",
        "Content-Type": "application/json",
        "x-api-key": config.apiKey,
        "x-uid": config.uid
    };
}

function calcularEstadoDispositivo(
    dispositivo,
    trigger,
    pedidos
) {
    const aparelho = normalizarAparelho(
        dispositivo?.aparelho ||
        trigger?.aparelho ||
        dispositivo?.nome ||
        dispositivo?.id
    );

    const pedidoProcessando = pedidos.find(p =>
        normalizarStatus(p?.status) === "processando" &&
        normalizarAparelho(
            p?.aparelho ||
            p?.dispositivo ||
            p?.device ||
            p?.deviceId
        ) === aparelho
    );

    const ativo =
        trigger
            ? trigger.ativo !== false
            : dispositivo?.ativo !== false;

    const sim1 = Number(dispositivo?.sim1 || 0);
    const sim2 = Number(dispositivo?.sim2 || 0);

    const limiteSim1 = Number(
        dispositivo?.limiteSim1 || 0
    );

    const limiteSim2 = Number(
        dispositivo?.limiteSim2 || 0
    );

    const saldoSim1 =
        limiteSim1 < 10 ? sim1 : 0;

    const saldoSim2 =
        limiteSim2 < 10 ? sim2 : 0;

    const saldoTotal =
        saldoSim1 + saldoSim2;

    let status = "LIVRE";

    if (!ativo) {
        status = "OFFLINE";
    } else if (pedidoProcessando) {
        status = "OCUPADO";
    } else if (saldoTotal <= 0) {
        status = "SEM_SALDO";
    }

    return {
        status,
        ativo,
        ocupado: Boolean(pedidoProcessando),
        pedidoAtual:
            pedidoProcessando?.id ||
            pedidoProcessando?.pedidoId ||
            null,
        sim1,
        sim2,
        limiteSim1,
        limiteSim2,
        saldoSim1,
        saldoSim2,
        saldoTotal
    };
}

async function post(config, endpoint, dados) {
    return axios.post(
        config.url + endpoint,
        dados,
        {
            headers: headers(config),
            timeout: 15000,
            validateStatus: () => true
        }
    );
}

async function put(config, endpoint, dados) {
    return axios.put(
        config.url + endpoint,
        dados,
        {
            headers: headers(config),
            timeout: 15000,
            validateStatus: () => true
        }
    );
}

async function get(config, endpoint) {
    return axios.get(
        config.url + endpoint,
        {
            headers: headers(config),
            timeout: 15000,
            validateStatus: () => true
        }
    );
}

async function sincronizarDispositivos(
    config,
    pedidos
) {
    const dispositivos = lerDispositivos();
    const triggers = lerTriggers();

    let enviados = 0;

    for (const dispositivo of dispositivos) {
        const aparelho = normalizarAparelho(
            dispositivo.aparelho ||
            dispositivo.nome ||
            dispositivo.id
        );

        const trigger = triggers.find(
            t =>
                normalizarAparelho(t.aparelho) ===
                aparelho
        );

        const estado =
            calcularEstadoDispositivo(
                dispositivo,
                trigger,
                pedidos
            );

        const deviceId = String(
            dispositivo.deviceId ||
            dispositivo.id ||
            dispositivo.aparelho ||
            trigger?.deviceId ||
            trigger?.id ||
            ""
        ).trim();

        if (!deviceId) continue;

        const dados = {
            uid: config.uid,
            deviceId,
            id: dispositivo.id || deviceId,
            nome:
                dispositivo.nome ||
                dispositivo.aparelho ||
                deviceId,
            aparelho:
                dispositivo.aparelho ||
                trigger?.aparelho ||
                "",
            modelo: dispositivo.modelo || "",
            numero:
                dispositivo.numero ||
                dispositivo.numeroTelefone ||
                "",
            tipo:
                dispositivo.tipo ||
                "TRANSFERENCIAS",
            ativo: estado.ativo,
            desativado:
                dispositivo.desativado === true,
            estado:
                estado.status === "OFFLINE"
                    ? "OFFLINE"
                    : "ONLINE",
            status: estado.status,
            internet:
                dispositivo.internet !== false,
            ocupado: estado.ocupado,
            pedidoAtual:
                estado.pedidoAtual,
            sim1: estado.sim1,
            sim2: estado.sim2,
            limiteSim1:
                estado.limiteSim1,
            limiteSim2:
                estado.limiteSim2,
            saldoSim1:
                estado.saldoSim1,
            saldoSim2:
                estado.saldoSim2,
            saldoTotal:
                estado.saldoTotal,
            ultimaAtividade:
                new Date().toISOString(),
            atualizadoEm:
                new Date().toISOString(),
            origem: "BOT"
        };

        const resposta =
            await post(
                config,
                "/dispositivos",
                dados
            );

        if (
            resposta.status >= 200 &&
            resposta.status < 300
        ) {
            enviados++;
        } else {
            console.log(
                "[SYNC DASHBOARD] Dispositivo HTTP",
                resposta.status,
                deviceId,
                resposta.data
            );
        }
    }

    return enviados;
}

/*
 * SINCRONIZAÇÃO DOS PEDIDOS
 *
 * REGRA:
 * 1. Lê o pedido.json do bot.
 * 2. Busca os pedidos existentes no servidor.
 * 3. Se o ID já existe -> PUT.
 * 4. Se o ID não existe -> POST.
 * 5. O status original do bot é preservado:
 *      pendente
 *      processando
 *      finalizado
 *      falhado
 *      cancelado
 *
 * Assim uma mudança:
 *
 *      pendente -> processando -> finalizado
 *
 * chega ao servidor na próxima sincronização.
 *
 * IMPORTANTE:
 * Não usamos o nome, valor ou número como identificador.
 * O ID do pedido é a chave principal.
 */
async function sincronizarPedidos(
    config,
    pedidos
) {
    let criados = 0;
    let atualizados = 0;
    let ignorados = 0;
    let erros = 0;

    const respostaLista =
        await get(
            config,
            "/pedidos"
        );

    if (
        respostaLista.status < 200 ||
        respostaLista.status >= 300
    ) {
        console.log(
            "❌ [SYNC PEDIDOS] Erro GET /pedidos:",
            respostaLista.status
        );

        return {
            criados,
            atualizados,
            ignorados,
            erros: erros + 1
        };
    }

    const remotos =
        Array.isArray(
            respostaLista?.data?.pedidos
        )
            ? respostaLista.data.pedidos
            : Array.isArray(
                respostaLista?.data
            )
                ? respostaLista.data
                : [];

    const mapa = new Map();

    for (const remoto of remotos) {
        const remotoId = String(
            remoto?.id ||
            remoto?.pedidoId ||
            ""
        ).trim();

        if (!remotoId) continue;

        mapa.set(
            remotoId,
            remoto
        );
    }

    /*
     * Campos que representam dados reais do pedido.
     *
     * Não comparamos campos de controle/sincronização:
     * - atualizadoEm
     * - origem
     * - uid
     *
     * Também não usamos criadoEm/dataCriacao para decidir
     * alteração depois que o pedido já existe, porque a data
     * original pode estar representada de forma diferente no
     * servidor e no pedido.json.
     */
    const camposComparacao = [
        "status",
        "pedidoId",
        "codigo",
        "quantidadeMB",
        "numero",
        "numeroCliente",
        "numeroRecebeu",
        "pacote",
        "gb",
        "mb",
        "valor",
        "custo",
        "lucro",
        "grupo",
        "grupoId",
        "metodoPagamento",
        "comprovativo",
        "dispositivo",
        "aparelho",
        "macroUrl",
        "erro",
        "tentativas",
        "maxTentativas",
        "iniciadoEm",
        "enviadoEm",
        "concluidoEm",
        "dataFinalizacao",
        "dataSMS",
        "smsEnviado"
    ];

    /*
     * Normalização profunda.
     *
     * Isto evita PUT repetido por diferenças como:
     * undefined / null / ""
     * 5 / "5"
     * true / "true"
     * ordem diferente de propriedades de objetos.
     */
    function valorVazio(valor) {
        return (
            valor === undefined ||
            valor === null ||
            (
                typeof valor === "string" &&
                valor.trim() === ""
            )
        );
    }

    function normalizarValor(valor) {
        if (valorVazio(valor)) {
            return "";
        }

        if (typeof valor === "boolean") {
            return valor
                ? "true"
                : "false";
        }

        if (typeof valor === "number") {
            if (Number.isNaN(valor)) {
                return "";
            }

            return String(valor);
        }

        if (Array.isArray(valor)) {
            return JSON.stringify(
                valor.map(item =>
                    normalizarEstrutura(item)
                )
            );
        }

        if (typeof valor === "object") {
            return JSON.stringify(
                normalizarEstrutura(valor)
            );
        }

        return String(valor).trim();
    }

    function normalizarEstrutura(valor) {
        if (valor === null || valor === undefined) {
            return "";
        }

        if (Array.isArray(valor)) {
            return valor.map(item =>
                normalizarEstrutura(item)
            );
        }

        if (typeof valor === "object") {
            const resultado = {};

            for (const chave of Object.keys(valor).sort()) {
                resultado[chave] =
                    normalizarEstrutura(valor[chave]);
            }

            return resultado;
        }

        if (typeof valor === "boolean") {
            return valor
                ? true
                : false;
        }

        if (typeof valor === "number") {
            return Number.isNaN(valor)
                ? ""
                : valor;
        }

        return String(valor).trim();
    }

    function valoresIguais(local, remoto) {
        /*
         * Se o campo local não existe ou está vazio,
         * não usamos esse campo para provocar um PUT.
         *
         * Isso evita o problema:
         *
         * local: undefined
         * remoto: false
         *
         * causando PUT em todos os ciclos.
         */
        if (valorVazio(local)) {
            return true;
        }

        return (
            normalizarValor(local) ===
            normalizarValor(remoto)
        );
    }

    for (const pedido of pedidos) {
        const id = String(
            pedido?.id ||
            pedido?.pedidoId ||
            ""
        ).trim();

        if (!id) {
            ignorados++;
            continue;
        }

        const status =
            normalizarStatus(
                pedido?.status
            );

        const criadoEmOriginal =
            obterDataCriacaoOriginal(pedido);

        const dados = {
            ...pedido,

            id,

            uid: config.uid,

            origem: "BOT",

            status,

            ...(criadoEmOriginal
                ? {
                    criadoEm:
                        criadoEmOriginal
                }
                : {}),

            atualizadoEm:
                new Date().toISOString()
        };

        const remoto = mapa.get(id);

        /*
         * =========================================================
         * PEDIDO JÁ EXISTENTE
         * =========================================================
         *
         * Não imprime logs.
         *
         * Se houver alteração real, faz PUT silenciosamente.
         * Se não houver alteração, não faz nada.
         */
        if (remoto) {
            let mudou = false;

            for (const campo of camposComparacao) {
                const localValor =
                    campo === "status"
                        ? status
                        : pedido?.[campo];

                // Campo ausente no pedido local não provoca PUT.
                if (localValor === undefined || localValor === null) {
                    continue;
                }

                const remotoValor = remoto?.[campo];

                if (
                    normalizarValor(localValor) !==
                    normalizarValor(remotoValor)
                ) {
                    mudou = true;
                    break;
                }
            }

            if (!mudou) {
                ignorados++;
                continue;
            }

            const resposta =
                await put(
                    config,
                    "/pedidos/" +
                    encodeURIComponent(id),
                    dados
                );

            if (
                resposta.status >= 200 &&
                resposta.status < 300
            ) {
                atualizados++;

                mapa.set(
                    id,
                    resposta.data?.pedido ||
                    dados
                );
            } else if (
                resposta.status === 404
            ) {
                /*
                 * O pedido deixou de existir no servidor.
                 * Recria silenciosamente.
                 */
                const respostaPost =
                    await post(
                        config,
                        "/pedidos",
                        dados
                    );

                if (
                    respostaPost.status >= 200 &&
                    respostaPost.status < 300
                ) {
                    criados++;

                    mapa.set(
                        id,
                        respostaPost.data?.pedido ||
                        dados
                    );

                    console.log("");
                    console.log(
                        "🆕 [PEDIDO NOVO] Pedido recriado no dashboard"
                    );
                    console.log(
                        "   ID:",
                        id
                    );
                    console.log(
                        "   Estado:",
                        status
                    );
                    console.log("");
                } else {
                    erros++;

                    console.log(
                        "❌ [SYNC PEDIDOS] Erro ao recriar pedido:",
                        id,
                        "HTTP:",
                        respostaPost.status
                    );
                }
            } else {
                erros++;

                console.log(
                    "❌ [SYNC PEDIDOS] Erro PUT:",
                    id,
                    "HTTP:",
                    resposta.status
                );
            }

            continue;
        }

        /*
         * =========================================================
         * PEDIDO NOVO
         * =========================================================
         *
         * ESTE É O ÚNICO MOMENTO NORMAL EM QUE MOSTRAMOS LOG
         * DE PEDIDO.
         */
        const resposta =
            await post(
                config,
                "/pedidos",
                dados
            );

        if (
            resposta.status >= 200 &&
            resposta.status < 300
        ) {
            criados++;

            mapa.set(
                id,
                resposta.data?.pedido ||
                dados
            );

            console.log("");
            console.log(
                "🆕 [PEDIDO NOVO] Entrou 1 pedido"
            );
            console.log(
                "   ID:",
                id
            );
            console.log(
                "   Estado:",
                status
            );
            console.log("");
        } else {
            erros++;

            console.log(
                "❌ [SYNC PEDIDOS] Erro POST:",
                id,
                "HTTP:",
                resposta.status
            );
        }
    }

    return {
        criados,
        atualizados,
        ignorados,
        erros
    };
}

async function sincronizarDashboard() {
    if (sincronizando) {
        sincronizacaoPendente = true;
        return;
    }

    sincronizando = true;
    sincronizacaoPendente = false;

    const config =
        carregarConfig();

    if (!config.ativo) return;

    if (
        !config.uid ||
        !config.apiKey
    ) {
        console.log(
            "[SYNC DASHBOARD] Configure uid e apiKey em data/dashboard_sync.json"
        );

        return;
    }

    try {
        const pedidos =
            lerPedidos();

        /*
         * Primeiro sincroniza os pedidos.
         * Assim o estado dos pedidos é enviado
         * ao servidor imediatamente.
         */
        const pedidosResultado =
            await sincronizarPedidos(
                config,
                pedidos
            );

        /*
         * Depois atualiza os dispositivos,
         * usando o estado atual do pedido.json.
         */
        const dispositivosEnviados =
            await sincronizarDispositivos(
                config,
                pedidos
            );

        ultimoResultado = {
            sucesso: true,
            data:
                new Date().toISOString(),
            dispositivos:
                dispositivosEnviados,
            pedidos:
                pedidos.length,
            pedidosCriados:
                pedidosResultado.criados,
            pedidosAtualizados:
                pedidosResultado.atualizados,
            pedidosIgnorados:
                pedidosResultado.ignorados,
            erros:
                pedidosResultado.erros
        };

        /*
         * Não imprimir o resultado completo de cada ciclo.
         *
         * Os pedidos existentes são processados silenciosamente.
         * O log normal de pedido aparece somente quando um novo
         * pedido entra no dashboard.
         */
        if (pedidosResultado.erros > 0) {
            console.log(
                "⚠️ [SYNC DASHBOARD] Ciclo concluído com",
                pedidosResultado.erros,
                "erro(s)"
            );
        }
    } catch (erro) {
        ultimoResultado = {
            sucesso: false,
            data:
                new Date().toISOString(),
            erro:
                erro.message
        };

        console.log(
            "[SYNC DASHBOARD] ERRO:",
            erro.message
        );
    } finally {
        sincronizando = false;

        if (sincronizacaoPendente) {
            sincronizacaoPendente = false;
            setTimeout(() => {
                sincronizarDashboard().catch(() => {});
            }, 0);
        }
    }
}

function iniciarSincronizacaoDashboard() {
    const config =
        carregarConfig();

    if (!config.ativo) return;

    setTimeout(() => {
        sincronizarDashboard()
            .catch(() => {});
    }, 1000);

    setInterval(() => {
        sincronizarDashboard()
            .catch(() => {});
    }, config.intervaloMs);

    // Sincronização iniciada silenciosamente.
}

module.exports = {
    sincronizarDashboard,
    iniciarSincronizacaoDashboard
};