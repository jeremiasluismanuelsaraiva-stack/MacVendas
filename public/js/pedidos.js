(function () {
    "use strict";

    async function carregarPedidos() {
        const container = document.getElementById("pedidosConteudo");

        if (!window.MOZ_API || typeof window.MOZ_API.get !== "function") {
            if (container) {
                container.textContent = "API do sistema ainda não está disponível.";
            }
            return [];
        }

        try {
            const resposta = await window.MOZ_API.get("/pedidos");
            const pedidos =
                Array.isArray(resposta) ? resposta :
                Array.isArray(resposta?.pedidos) ? resposta.pedidos :
                Array.isArray(resposta?.data) ? resposta.data :
                [];

            if (container) {
                if (!pedidos.length) {
                    container.textContent = "Nenhum pedido encontrado.";
                } else {
                    container.innerHTML = pedidos.map((pedido) => {
                        const id = pedido.id || "";
                        const numero = pedido.numero || "";
                        const status = pedido.status || "";
                        return `<div class="pedido-item">
                            <strong>${id}</strong>
                            <span>${numero}</span>
                            <span>${status}</span>
                        </div>`;
                    }).join("");
                }
            }

            return pedidos;
        } catch (erro) {
            console.error("[PEDIDOS] Erro ao carregar pedidos:", erro);
            if (container) {
                container.textContent = "Não foi possível carregar os pedidos.";
            }
            return [];
        }
    }

    window.carregarPedidos = carregarPedidos;

    document.addEventListener("DOMContentLoaded", function () {
        carregarPedidos();
    });
})();
