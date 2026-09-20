Comparando mudanças
Escolha dois ramos para ver o que mudou ou para iniciar um novo pull request. Se precisar, pode fazer isso também  Ou aprenda mais sobre comparações de diferenças.
...
 1 commit
 1 arquivo alterado
 1 colaborador
Commits em 20 de setembro de 2026
Atualização firebase-admin.js

@jeremiasluismanuelsaraiva-stack
jeremiasluismanuelsaraiva-stack escrito há 3 minutos
 Exibição  com 0 adições e 4 deleções.
  4 mudanças: 0 adições e 4 eliminações4  
API/firebase-admin.js
Número original da linha do arquivo	Número da linha diferencial	Mudança de linha diferencial
@@ -9,7 +9,6 @@ function inicializarFirebase() {
        Aplicativo de Retorno ;
    }

    Se o Firebase Admin já estiver inicializado
    if (admin.aplicativos.Comprimento > 0) {
        app = admin.Aplicativo();
        Aplicativo de Retorno ;
@@ -19,7 +18,6 @@ função inicializarFirebase() {
    const clientEmail = processo.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = processo.env.FIREBASE_PRIVATE_KEY;

    Verificar credenciais
    se (!projectId ||  !clienteEmail ||  !privateKey) {
        lançar um novo erro(
            "Credenciais do Firebase não configuradas." +
@@ -28,7 +26,6 @@ função inicializarFirebase() {
        );
    }

    Converter \n armazenado como texto em quebras de linha reais
    const privateKeyFormatada = privateKey.substituir(/\\n/g, "\n");

    app = admin.inicializeApp({
@@ -37,7 +34,6 @@ função inicializarFirebase() {
 E-mail do cliente,
            privateKey: privateKeyFormatada
        }),

        banco de dadosURL: "https://macvendas-default-rtdb.firebaseio.com"
    });

Footer
© 2026 GitHub, Inc.
Footer navigation
Terms
Privacy
Security
S
