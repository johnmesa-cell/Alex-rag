# Documentación de Alex-rag

Esta carpeta reúne la documentación técnica organizada por responsabilidades. Evita las configuraciones internas de los workflows de n8n, que se documentarán cuando exista una versión estable.

## Contenido

- [Arquitectura general](architecture/overview.md)
- [Infraestructura Docker](infrastructure/docker.md)
- [Proxy inverso con Nginx](infrastructure/nginx.md)
- [Redes Docker](infrastructure/networking.md)
- [Modelos Ollama](ai/ollama-models.md)
- [Bot de Discord](integrations/discord-bot.md)
- [Guía de despliegue y mantenimiento](deployment/deployment-guide.md)

## Convenciones

- **Implementado**: existe una configuración o componente verificable en el repositorio.
- **En desarrollo o planificado**: es una intención futura y no debe interpretarse como funcionalidad disponible.
- Los secretos deben permanecer fuera de los documentos y del control de versiones.

