# MACVENDAS — WEBSOCKET

## O que foi alterado

- Backend `api/index.js` agora cria um servidor HTTP e WebSocket usando `ws`.
- Endpoint WebSocket de vendas:
  `/vendas/ws?apiKey=SUA_API_KEY`
- Quando uma compra é criada em `POST /compras`, o backend envia um evento
  `tipo: "vendas"` para os dashboards conectados daquele usuário.
- Foi criado `public/js/websocket.js`, com reconexão automática e ping.
- `dashboard.js`, `charts.js` e `crm.js` recebem o mesmo evento global
  `moz:vendas`, evitando três conexões WebSocket independentes.
- O carregamento inicial continua sendo feito por HTTP (`/compras` e
  `/dashboard`).

## IMPORTANTE — HTTPS

Se o dashboard estiver em HTTPS (por exemplo, Vercel), o navegador exige
`wss://` para WebSocket. O backend atual está servido em HTTP na porta 4234.

Portanto, para produção em HTTPS, o servidor `br1.bronxyshost.com:4234`
precisa estar disponível via TLS/WSS, normalmente através de um domínio
com SSL e proxy reverso. Sem isso, o navegador bloqueará `ws://` por
mixed content.

## Dependência

O `package.json` já contém:

`"ws": "^8.18.3"`

Portanto não é necessário adicionar outra biblioteca ao projeto.

## Arquivos principais

- `api/index.js`
- `public/js/websocket.js`
- `public/js/dashboard.js`
- `public/js/charts.js`
- `public/js/crm.js`
- `public/dashboard.html`
- `dashboard_sync.js`

O `dashboard_sync.js` foi mantido para a sincronização Bot -> API; ele não
precisa abrir WebSocket porque o WebSocket é usado pelo navegador para receber
as alterações em tempo real.
