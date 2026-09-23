"use strict";

const express = require("express");

const app = express();

const PORT = process.env.PORT || 4234;

// =====================================================
// MIDDLEWARE
// =====================================================

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));


// =====================================================
// TESTE
// =====================================================

app.get("/", (req, res) => {

    res.json({
        success: true,
        nome: "MOZ TECH TERMINAL SERVER",
        versao: "1.0.0",
        status: "Online",
        porta: PORT
    });

});


// =====================================================
// STATUS
// =====================================================

app.get("/status", (req, res) => {

    res.json({
        success: true,
        status: "Online",
        servidor: "MOZ TECH TERMINAL SERVER",
        timestamp: new Date().toISOString()
    });

});


// =====================================================
// EXECUTAR COMANDO
// =====================================================

app.post("/exec", async (req, res) => {

    try {

        const command =
            String(
                req.body?.command || ""
            ).trim();


        if (!command) {

            return res.status(400).json({

                success: false,

                erro:
                    "Nenhum comando foi informado."

            });

        }


        console.log(
            "[TERMINAL]",
            command
        );


        // =================================================
        // SEGURANÇA
        // =================================================
        //
        // NÃO executamos comandos do sistema diretamente
        // neste exemplo.
        //
        // O servidor devolve o comando recebido para teste.
        //
        // =================================================

        return res.json({

            success: true,

            comando:
                command,

            resultado:
                `Comando recebido: ${command}`,

            timestamp:
                new Date().toISOString()

        });

    } catch (erro) {

        console.error(
            "[TERMINAL SERVER] Erro:",
            erro
        );


        return res.status(500).json({

            success: false,

            erro:
                erro.message ||
                "Erro interno do servidor."

        });

    }

});


// =====================================================
// 404
// =====================================================

app.use((req, res) => {

    res.status(404).json({

        success: false,

        erro:
            "Rota não encontrada.",

        rota:
            req.originalUrl

    });

});


// =====================================================
// ERROS
// =====================================================

app.use((erro, req, res, next) => {

    console.error(
        "[TERMINAL SERVER] Erro:",
        erro
    );


    res.status(500).json({

        success: false,

        erro:
            erro.message ||
            "Erro interno do servidor."

    });

});


// =====================================================
// INICIAR
// =====================================================

app.listen(
    PORT,
    "0.0.0.0",
    () => {

        console.log(
            "=========================================="
        );

        console.log(
            " MOZ TECH TERMINAL SERVER"
        );

        console.log(
            "=========================================="
        );

        console.log(
            `Servidor: http://0.0.0.0:${PORT}`
        );

        console.log(
            `Status:   http://0.0.0.0:${PORT}/status`
        );

        console.log(
            `Exec:     POST http://0.0.0.0:${PORT}/exec`
        );

        console.log(
            "=========================================="
        );

    }
);
