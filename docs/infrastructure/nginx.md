# Nginx

Nginx actúa como proxy inverso para acceder a n8n desde el dominio configurado.

## Archivo de configuración

La configuración vigente se encuentra en [`../../nginx/n8n.megiddo20.me.conf`](../../nginx/n8n.megiddo20.me.conf).

## Dominio y destino

- Dominio: `n8n.megiddo20.me`.
- Destino: `http://127.0.0.1:5678/`.
- Puerto publicado por Nginx: 80.

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

La configuración disponible escucha únicamente HTTP en el puerto 80. No se confirmó un bloque TLS ni rutas a certificados privados dentro del repositorio. HTTPS debe configurarse antes de exponer el servicio a producción sin atribuirlo a la configuración actual.

## Instalación y mantenimiento

En Ubuntu/Debian, un despliegue puede seguir el flujo habitual de copiar el archivo a `sites-available`, habilitarlo con un enlace simbólico en `sites-enabled`, validar y recargar Nginx:

```bash
sudo cp nginx/n8n.megiddo20.me.conf /etc/nginx/sites-available/n8n.megiddo20.me
sudo ln -s /etc/nginx/sites-available/n8n.megiddo20.me /etc/nginx/sites-enabled/n8n.megiddo20.me
sudo nginx -t
sudo systemctl reload nginx
```

Antes de habilitarlo, confirma que el DNS apunta al servidor y que n8n escucha en `127.0.0.1:5678`.
