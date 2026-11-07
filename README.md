# Alex-rag
micro serviso de Alex creado usando rag

## Configuración de Nginx para n8n

El archivo [`nginx/n8n.megiddo20.me.conf`](./nginx/n8n.megiddo20.me.conf) contiene un bloque de servidor de Nginx que reenvía las solicitudes de `n8n.megiddo20.me` a n8n en `127.0.0.1:5678`.

En un servidor Ubuntu/Debian con Nginx instalado, copia el archivo a `sites-available`, habilítalo y valida la configuración:

```bash
sudo cp nginx/n8n.megiddo20.me.conf /etc/nginx/sites-available/n8n.megiddo20.me
sudo ln -s /etc/nginx/sites-available/n8n.megiddo20.me /etc/nginx/sites-enabled/n8n.megiddo20.me
sudo nginx -t
sudo systemctl reload nginx
```

Antes de habilitarlo, confirma que el DNS del dominio apunta al servidor y que n8n está escuchando en `127.0.0.1:5678`. Esta configuración escucha solo en HTTP (puerto 80); para producción, configura HTTPS/TLS en Nginx.

## Bot de Discord

El bot se encuentra en [`bot-discord/`](./bot-discord/) y se ejecuta como el servicio
`discord-bot` de Docker Compose. No publica puertos y se conecta a `web-net` e
`ia-net`; Ollama y Qdrant continúan únicamente en `ia-net`.

Configura en el `.env` de la raíz:

- `DISCORD_TOKEN`: token del bot, nunca lo incluyas en Git.
- `DISCORD_ALLOWED_CHANNEL_IDS`: los dos IDs de canales permitidos, separados por comas.
- `N8N_DISCORD_WEBHOOK_URL`: normalmente `http://n8n:5678/webhook/discord-chat`.
- `N8N_WEBHOOK_SECRET`: secreto compartido con el webhook de n8n.
- `DISCORD_REQUEST_TIMEOUT_MS`: timeout de la petición a n8n.

En Discord, habilita el intent privilegiado **Message Content Intent** y concede al
bot únicamente permisos para ver canales, leer historial y enviar mensajes.

El bot envía a n8n `message`, `sessionId`, `messageId`, `guildId` y `channelId`.
La sesión tiene el formato `discord:<guildId>:<userId>`. Configura un segundo
workflow en n8n con un Webhook autenticado, el agente RAG existente y
`Respond to Webhook`; conserva sin cambios el workflow del Chat Trigger web.

Para validar localmente:

```bash
npm --prefix bot-discord test
docker compose build discord-bot
```
