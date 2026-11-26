# Nginx

Nginx actúa como proxy inverso para acceder a n8n desde el dominio configurado.

## Archivo de configuración

La configuración vigente se encuentra en [`../../nginx/n8n.megiddo20.me.conf`](../../nginx/n8n.megiddo20.me.conf).

## Dominio y destino

- Dominio: `n8n.megiddo20.me`.
- Destino: `http://127.0.0.1:5678/`.
- Puerto de escucha de Nginx: 80.

Docker Compose mantiene n8n vinculado a `127.0.0.1:5678`, por lo que el destino corresponde al host.

## Proxy

El bloque conserva el protocolo HTTP 1.1 y admite actualización de conexión mediante las cabeceras `Upgrade` y `Connection`. También configura:

- `Host`;
- `X-Real-IP`;
- `X-Forwarded-For`;
- `X-Forwarded-Proto`;
- proxy sin buffering;
- timeout de lectura y envío de 300 segundos;
- tamaño máximo de cuerpo de 50 MB.

## Cabeceras de seguridad

- `X-Content-Type-Options: nosniff`.
- `Referrer-Policy: strict-origin-when-cross-origin`.

## TLS

La configuración disponible escucha únicamente HTTP en el puerto 80 y no contiene un bloque TLS ni rutas a certificados privados HTTPS. El destino interno usa HTTP: `http://127.0.0.1:5678/`.

Existe una diferencia entre tres configuraciones distintas:

- El archivo Nginx publicado aquí termina o escucha inicialmente en HTTP sobre el puerto 80.
- Docker Compose publica n8n en `127.0.0.1:5678` y el archivo proxy lo alcanza mediante HTTP local.
- Docker Compose define `N8N_WEBHOOK_URL=https://${N8N_HOST}/`, aunque el archivo de entorno de ejemplo establece `N8N_HOST=localhost` y `N8N_PROTOCOL=http`.
- El bot puede comunicarse directamente con n8n por HTTP dentro de `web-net`, usando `http://n8n:5678/webhook/...`.

Los archivos no permiten determinar dónde termina TLS en el despliegue real ni si existe una configuración HTTPS externa no incluida en el repositorio. Por ello, no se puede afirmar que el acceso público actual use HTTPS ni que el bot reciba o envíe tráfico HTTPS hacia n8n a través de Docker. Esta discrepancia debe resolverse en el despliegue real antes de considerar que las tres configuraciones son equivalentes.

## Instalación y mantenimiento

En Ubuntu/Debian, un despliegue puede seguir el flujo habitual de copiar el archivo a `sites-available`, habilitarlo con un enlace simbólico en `sites-enabled`, validar y recargar Nginx:

```bash
sudo cp nginx/n8n.megiddo20.me.conf /etc/nginx/sites-available/n8n.megiddo20.me
sudo ln -s /etc/nginx/sites-available/n8n.megiddo20.me /etc/nginx/sites-enabled/n8n.megiddo20.me
sudo nginx -t
sudo systemctl reload nginx
```

Antes de habilitarlo, confirma que el DNS apunta al servidor y que n8n escucha en `127.0.0.1:5678`.
