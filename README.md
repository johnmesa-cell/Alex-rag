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
