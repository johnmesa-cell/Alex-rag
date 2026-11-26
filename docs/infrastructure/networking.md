# Redes Docker

Docker Compose define dos redes puente:

| Red | Tipo | Propósito |
|---|---|---|
| `web-net` | Bridge con acceso normal de Docker | Comunicación entre n8n y el bot de Discord. |
| `ia-net` | Bridge interna | Aislar los componentes de IA y las integraciones internas. |

## Conectividad

- `n8n` está conectado a `web-net` e `ia-net`.
- `discord-bot` está conectado a `web-net` e `ia-net`.
- `ollama` está conectado únicamente a `ia-net`.
- `qdrant` está conectado únicamente a `ia-net`.

De esta forma, n8n puede alcanzar los servicios internos y el bot puede alcanzar n8n. Ollama y Qdrant no deben ser accesibles mediante una publicación de puertos en Docker Compose.

## Comunicación entre Discord, el bot y n8n

La comunicación tiene tres partes distintas:

1. **Discord con el bot:** el bot establece la conexión con Discord mediante discord.js y recibe eventos de mensajes. No es necesario abrir un puerto publicado por Docker para esta conexión.
2. **El bot con n8n:** el bot realiza solicitudes HTTP `POST` a las URLs de los webhooks configuradas en `DISCORD_CHANNEL_ROUTES`.
3. **Comunicación interna:** el bot y n8n comparten `web-net`. El bot puede referirse a n8n mediante el nombre del servicio Docker `n8n` y el puerto interno `5678`, sin depender del proxy Nginx.

Las rutas de ejemplo de [`.env.example`](../../.env.example) utilizan direcciones internas como `http://n8n:5678/webhook/...`. Por lo tanto, el bot usa HTTP dentro de la red Docker para comunicarse con n8n.

Nginx proporciona una ruta independiente de acceso desde el exterior hacia n8n mediante el puerto local `127.0.0.1:5678` publicado por Docker Compose. El bot no necesita pasar por Nginx ni por una URL HTTPS para alcanzar n8n dentro de Compose.

Las URLs exactas de los webhooks no deben publicarse con identificadores sensibles.

## Consideraciones

- `ia-net` es interna y ayuda a reducir la exposición directa de Ollama y Qdrant.
- n8n sirve como punto de coordinación entre las redes.
- Los usuarios no deben acceder directamente a Ollama o Qdrant.
- Los nombres DNS de Docker Compose permiten referenciar los contenedores dentro de las redes mediante sus nombres de servicio.
