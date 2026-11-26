# Infraestructura Docker

La infraestructura se declara en [`../../docker-compose.yml`](../../docker-compose.yml). Los siguientes datos corresponden al archivo vigente.

## Servicios

| Servicio | Contenedor | Imagen | Puertos | Función |
|---|---|---|---|---|
| `n8n` | `alex-n8n` | `docker.n8n.io/n8nio/n8n:latest` | `127.0.0.1:5678:5678` | Orquestación y ejecución de workflows. |
| `ollama` | `alex-ollama` | `ollama/ollama:latest` | Sin puertos publicados | Ejecución local de modelos con perfil `ia`. |
| `qdrant` | `alex-qdrant` | `qdrant/qdrant:latest` | Sin puertos publicados | Base de datos vectorial opcional con perfil `ia`. |
| `discord-bot` | `alex-discord-bot` | Construida desde `bot-discord/Dockerfile` | Sin puertos publicados | Puente entre Discord y los webhooks de n8n. |

Todos los servicios tienen `restart: unless-stopped`.

## Volúmenes

- `n8n_data`: persistencia de n8n en `/home/node/.n8n`.
- `ollama_data`: modelos y datos de Ollama en `/root/.ollama`.
- `qdrant_data`: almacenamiento de Qdrant en `/qdrant/storage`.

## Perfiles

Ollama y Qdrant pertenecen al perfil `ia`. Docker Compose no inicia estos servicios en una ejecución normal sin activar dicho perfil. La participación de Qdrant en el procesamiento vigente debe confirmarse en n8n.

## Configuración de n8n

n8n recibe mediante variables de entorno el host, puerto, protocolo, uso de cookies seguras, clave de cifrado, zona horaria y número de saltos de proxy. También monta el certificado local `certificates/prod-ca-2021.crt` en modo lectura dentro del contenedor.

El webhook público se construye con `N8N_WEBHOOK_URL=https://${N8N_HOST}/`.

## Recursos de Ollama

Ollama se limita a:

- un máximo de un modelo paralelo;
- un máximo de un modelo cargado;
- mantenimiento del modelo cargado durante 5 minutos;
- 7 GB de memoria;
- 1.5 CPU.

## Variables de entorno

La plantilla segura está en [`.env.example`](../../.env.example). Los valores reales deben quedar en `.env`, que está excluido de Git. Las variables declaradas cubren n8n, Discord y los secretos compartidos con los webhooks.

No copies claves reales a esta documentación ni a `.env.example`.

## Seguridad

- n8n escucha únicamente en la interfaz loopback del host.
- El bot no publica puertos.
- Ollama y Qdrant no publican puertos.
- `ia-net` es una red Docker interna.
- El certificado montado es de lectura.
- Se debe proteger `.env` y el acceso al servidor.
