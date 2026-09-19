# MOZ TECH - Terminal WebSocket

## 1. Configurar o painel
Em Configurações > Terminal, ative o terminal e informe Host, Porta, Protocolo e Token.

## 2. Iniciar o serviço no servidor
Instale dependências:

    npm install

Linux/macOS:

    TERMINAL_TOKEN="SEU_TOKEN_FORTE" PORT=8080 node terminal-server.js

Windows PowerShell:

    $env:TERMINAL_TOKEN="SEU_TOKEN_FORTE"; $env:PORT="8080"; node terminal-server.js

O token precisa ser igual ao token salvo no painel.

## 3. Segurança
Use WSS atrás de HTTPS/reverse proxy em produção. Não exponha a porta do terminal sem firewall/autenticação. O terminal executa comandos com as permissões do usuário que inicia o serviço.
