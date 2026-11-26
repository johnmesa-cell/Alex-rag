# Integración con Discord

El componente `bot-discord` actúa como puente de comunicación entre Discord y n8n. No realiza recuperación RAG ni ejecución de modelos.

## Comunicación

1. Discord entrega un evento `messageCreate`.
2. El bot acepta mensajes de usuarios pertenecientes a un servidor y presentes en canales configurados.
3. Ignora mensajes enviados por bots y canales sin ruta.
4. El bot envía el mensaje y metadatos al webhook correspondiente de n8n.
5. n8n responde con texto.
6. El bot divide respuestas mayores a 2000 caracteres y las envía a Discord.

El bot procesa mensajes por usuario mediante una cola secuencial y conserva mensajes procesados durante diez minutos para evitar duplicados.

## Variables de entorno

La plantilla y los nombres están en [`.env.example`](../../.env.example):

- `DISCORD_TOKEN`: token de autenticación del bot.
- `DISCORD_CHANNEL_ROUTES`: objeto JSON que asigna IDs de canales a URLs de webhooks HTTP(S).
- `DISCORD_LEGACY_SQL_SESSION_CHANNEL_IDS`: canales con formato histórico de sesión SQL.
- `N8N_WEBHOOK_SECRET`: secreto compartido enviado en la cabecera `X-N8N-WEBHOOK-SECRET`.
- `DISCORD_REQUEST_TIMEOUT_MS`: timeout positivo de la solicitud a n8n.

Los valores reales no deben registrarse en Git.

## Rutas y sesiones

Cada canal debe aparecer en `DISCORD_CHANNEL_ROUTES`. Dos canales pueden compartir el mismo webhook.

El bot construye:

- sesión simple: `discord:<guildId>:<userId>`;
- sesión histórica SQL: `discord:postgres:<guildId>:<channelId>:<userId>`.

Los IDs históricos solo se aplican a canales incluidos en `DISCORD_LEGACY_SQL_SESSION_CHANNEL_IDS`; no cambian la selección del webhook.

## Payload enviado a n8n

El bot usa `POST` con JSON y envía:

- `message`;
- `sessionId`;
- `messageId`;
- `guildId`;
- `channelId`.

No se han documentado detalles internos de los workflows que reciben este payload.

## Permisos de Discord

El bot requiere las intents de servidor y mensajes de servidor, además de `Message Content Intent`, que debe habilitarse en el portal de Discord. Se recomienda conceder solo permisos para ver canales, leer historial y enviar mensajes.

## Despliegue

El servicio se construye con [`../../bot-discord/Dockerfile`](../../bot-discord/Dockerfile), que usa Node.js 22 Alpine, instala dependencias de producción y ejecuta `src/index.js` como usuario `node`.

Comandos comprobados por los scripts del proyecto:

```bash
npm --prefix bot-discord test
docker compose build discord-bot
```

## Seguridad

- No publiques `DISCORD_TOKEN` ni `N8N_WEBHOOK_SECRET`.
- Autentica los webhooks configurados en n8n.
- No uses canales o rutas no controlados.
- Limita permisos de Discord a los necesarios.
- Mantén actualizadas las dependencias del contenedor.
