"use strict";

const admin = require("firebase-admin");
const path = require("path");


// =====================================================
// SERVICE ACCOUNT
// =====================================================

const serviceAccount =
    require(
        path.join(
            __dirname,
            "..",
            "serviceAccountKey.json"
        )
    );


// =====================================================
// INICIALIZAR FIREBASE ADMIN
// =====================================================

if (!admin.apps.length) {

    admin.initializeApp({

        credential:
            admin.credential.cert(
                serviceAccount
            ),

        databaseURL:
            "https://macvendas-default-rtdb.firebaseio.com"

    });

}


// =====================================================
// DATABASE
// =====================================================

const db =
    admin.database();


// =====================================================
// EXPORTAR
// =====================================================

module.exports = {
    admin,
    db
};
