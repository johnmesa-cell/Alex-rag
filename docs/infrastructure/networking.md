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

## Comunicación externa

El único puerto publicado por la configuración Compose es el puerto loopback `127.0.0.1:5678` de n8n. Nginx, ejecutado fuera o independientemente de los contenedores definidos en este Compose, puede acceder a ese puerto en el host.

Discord y n8n se comunican mediante tráfico HTTPS desde Discord hacia el puerto público protegido por Nginx y por las rutas internas configuradas. Las URLs exactas de los webhooks no deben publicarse con identificadores sensibles.

## Consideraciones

- `ia-net` es interna y ayuda a reducir la exposición directa de Ollama y Qdrant.
- n8n sirve como punto de coordinación entre las redes.
- Los usuarios no deben acceder directamente a Ollama o Qdrant.
- Los nombres DNS de Docker Compose permiten referenciar los contenedores dentro de las redes mediante sus nombres de servicio.
