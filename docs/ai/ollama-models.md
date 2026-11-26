# Modelos Ollama

Alex-rag utiliza Ollama para ejecutar localmente los modelos indicados por la configuración vigente del proyecto.

## Inventario confirmado

| Modelo | Tipo | Uso |
|---|---|---|
| `Llama 3.2:3b` | Modelo generativo | Procesos de investigación del sistema RAG y tareas que correspondan a la configuración vigente de los workflows. |
| `Qwen 2.5:3b` | Modelo generativo | Generación de respuestas según la configuración de los workflows. |
| `Qwen3-Embedding:0.6b` | Modelo de embeddings | Transformación de texto en representaciones vectoriales para recuperación semántica. |

No se debe ampliar este inventario con modelos históricos o modelos usados únicamente en experimentos sin confirmar su instalación en la infraestructura actual.

## Modelos generativos

Los modelos generativos reciben contexto y producen texto. `Llama 3.2:3b` y `Qwen 2.5:3b` tienen responsabilidades distintas dentro de la configuración operativa: investigación y generación de respuestas, respectivamente.

La asignación exacta de modelos a nodos y prompts pertenece a los workflows y no se documenta internamente hasta estabilizar su configuración.

## Modelo de embeddings

`Qwen3-Embedding:0.6b` transforma consultas y fragmentos de documentos en vectores. n8n utiliza esas representaciones con el mecanismo de recuperación configurado, actualmente declarado como Supabase.

## Relación con n8n

n8n actúa como orquestador. Puede llamar a Ollama para:

- producir embeddings;
- ejecutar modelos generativos;
- preparar la respuesta que finalmente recibe el bot de Discord.

No se han verificado en el repositorio dimensiones vectoriales, cuantización, ventana de contexto ni parámetros internos adicionales. Estos valores no deben inferirse o inventarse.
