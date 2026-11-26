# Arquitectura general

## Qué es Alex-rag

Alex-rag es una implementación independiente de recuperación aumentada por generación (**RAG**) para consultas médicas e informativas de emergencias. El proyecto utiliza n8n para orquestar el flujo, Ollama para ejecutar modelos localmente y Discord como canal de comunicación.

La finalidad es recuperar información documental relevante y proporcionar contexto a un modelo generativo. El sistema no reemplaza al personal de salud ni pretende asumir responsabilidades profesionales.

## Razones de la arquitectura local

La ejecución con Ollama permite mantener el procesamiento de los modelos dentro de la infraestructura propia. Los objetivos son preservar mayor control sobre los datos y el procesamiento, reducir costos asociados a APIs externas y disminuir la dependencia de proveedores externos.

Esta arquitectura reduce ciertos riesgos, pero no garantiza privacidad absoluta. La privacidad real depende de la configuración de servicios externos, integraciones y almacenamiento.

## Componentes

| Componente | Responsabilidad |
|---|---|
| Discord | Interfaz de entrada y salida para los usuarios. |
| `discord-bot` | Recibe mensajes autorizados, valida la ruta del canal y los reenvía a n8n. |
| n8n | Orquesta el flujo RAG, la memoria conversacional y las llamadas configuradas a los modelos. |
| Ollama | Ejecuta los modelos generativos y el modelo de embeddings dentro de la infraestructura. |
| Supabase | Se usa para almacenamiento y recuperación vectorial en la implementación declarada del proyecto. |
| Qdrant | Componente opcional definido en Docker Compose mediante el perfil `ia`; su participación activa no debe asumirse sin verificar los workflows. |
| Nginx | Expone el acceso público a n8n y actúa como proxy inverso hacia el puerto local. |

## Flujo general

1. Un usuario publica un mensaje en un canal permitido de Discord.
2. `discord-bot` rechaza mensajes de bots, mensajes fuera del servidor o canales sin ruta configurada.
3. El bot selecciona un webhook de n8n y añade el identificador de sesión correspondiente.
4. n8n recibe el mensaje y ejecuta la lógica RAG configurada.
5. Cuando corresponde, los modelos Ollama generan embeddings o respuestas.
6. n8n devuelve el texto al bot y este lo entrega a Discord.

Los detalles internos de nodos, conexiones y prompts no se incluyen en esta documentación hasta estabilizar los workflows.

## Estado actual y planificado

**Actualmente implementado:**

- Docker Compose y contenedores definidos.
- n8n como orquestador.
- Ollama como ejecución local de modelos.
- Supabase como almacenamiento y recuperación vectorial declarados para el proyecto.
- Memoria conversacional mediante los mecanismos configurados en n8n.
- Bot de Discord como puente de comunicación.
- Workflows RAG existentes con distintas configuraciones de memoria.

**Planificado:**

- RAG multiagente con procesamiento prioritario de texto.
- Recepción de audio y transcripción mediante STT.

## Relación con las implementaciones anteriores

El proyecto anterior `agente-alex` se desarrolló como un componente independiente a partir de una versión anterior del backend de ALEX. Recuperaba documentos con ChromaDB, preparaba contexto y consumía proveedores externos de inteligencia artificial. Este antecedente no describe la arquitectura vigente.

Alex-rag utiliza una implementación independiente con ejecución local mediante Ollama y no está integrado con el backend de ALEX.
