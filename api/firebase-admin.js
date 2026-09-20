"use strict";

const admin = require("firebase-admin");

let app;

function inicializarFirebase() {
    if (app) {
        return app;
    }

    if (admin.apps.length > 0) {
        app = admin.app();
        return app;
    }

    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;

    if (!projectId || !clientEmail || !privateKey) {
        throw new Error(
            "Credenciais do Firebase não configuradas. " +
            "Configure FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL e " +
            "FIREBASE_PRIVATE_KEY na Vercel."
        );
    }

    const privateKeyFormatada = privateKey.replace(/\\n/g, "\n");

    app = admin.initializeApp({
        credential: admin.credential.cert({
            projectId,
            clientEmail,
            privateKey: privateKeyFormatada
        }),
        databaseURL: "https://macvendas-default-rtdb.firebaseio.com"
    });

    return app;
}

const firebaseApp = inicializarFirebase();

const db = admin.database(firebaseApp);

module.exports = {
    admin,
    app: firebaseApp,
    db
};
