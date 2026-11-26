# Guía de despliegue y mantenimiento

Esta guía incluye únicamente operaciones comprobables mediante los archivos actuales.

## Requisitos

- Docker con Docker Compose.
- Archivo `.env` basado en `.env.example`.
- Acceso a Nginx si se usa el proxy inverso incluido.
- Bot registrado en Discord con permisos e intent configurados.
- Servicios de n8n y Ollama disponibles.

## Preparación

1. Copia la plantilla de variables:

```bash
cp .env.example .env
```

2. Completa las variables sin publicar los valores reales.
3. Configura las rutas de canales y los webhooks de n8n en `DISCORD_CHANNEL_ROUTES`.
4. Añade el secreto compartido en `N8N_WEBHOOK_SECRET`.
5. Confirma que n8n y el certificado montado están disponibles.

## Inicio de servicios según perfiles

`n8n` y `discord-bot` no tienen perfil asignado, por lo que pueden iniciarse directamente:

```bash
docker compose up -d n8n discord-bot
```

Para iniciar Ollama junto con n8n y Discord, sin iniciar Qdrant innecesariamente:

```bash
docker compose --profile ia up -d n8n ollama discord-bot
```

`ollama` y `qdrant` pertenecen al perfil `ia`. Para iniciar todos los servicios, incluidos Ollama y Qdrant:

```bash
docker compose --profile ia up -d
```

La segunda opción inicia solamente los servicios indicados y activa el perfil necesario para Ollama. No inicia Qdrant. La tercera opción activa el perfil `ia` y puede iniciar tanto Ollama como Qdrant; no se presenta Qdrant como obligatorio para la configuración RAG actual.

## Bot de Discord

Construye y valida el bot:

```bash
npm --prefix bot-discord test
docker compose build discord-bot
docker compose up -d discord-bot
```

No se consideran confirmados otros scripts o procesos de administración del bot si no existen en el repositorio.

## Nginx

Consulta la configuración disponible en [`../infrastructure/nginx.md`](../infrastructure/nginx.md). Antes de habilitarla, valida DNS, escucha local de n8n y sintaxis de Nginx.

```bash
sudo nginx -t
sudo systemctl reload nginx
```

El bloque actual ofrece HTTP en el puerto 80 y no incluye TLS.

## Persistencia

Los volúmenes Docker persisten:

- datos de n8n;
- modelos y datos de Ollama;
- datos de Qdrant.

Conviene mantener copias de seguridad de los volúmenes y de la configuración, siguiendo las políticas del servidor.

## Actualización

Las imágenes de n8n, Ollama y Qdrant usan la etiqueta `latest`. Antes de actualizar:

- revisa cambios de compatibilidad;
- realiza copia de seguridad;
- valida variables y volúmenes;
- prueba los workflows vigentes;
- verifica Discord y Nginx.

## Diagnóstico básico

```bash
docker compose ps
docker compose logs n8n
docker compose logs discord-bot
```

Para Ollama o Qdrant con el perfil activo:

```bash
docker compose --profile ia logs ollama
docker compose --profile ia logs qdrant
```
