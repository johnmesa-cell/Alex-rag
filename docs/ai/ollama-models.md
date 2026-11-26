# Modelos Ollama

Alex-rag utiliza Ollama para ejecutar localmente los modelos indicados por la configuración vigente del proyecto.

## Inventario confirmado

| Modelo | Tipo | Uso |
|---|---|---|
| `llama3.2:3b` | Modelo generativo | Generación de texto dentro de la configuración general de Ollama. |
| `qwen2.5:3b` | Modelo generativo | Generación de texto dentro de la configuración general de Ollama. |
| `qwen3-embedding:0.6b` | Modelo de embeddings | Generación de representaciones vectoriales a partir de texto. |

No se debe ampliar este inventario con modelos históricos o modelos usados únicamente en experimentos sin confirmar su instalación en la infraestructura actual.

## Modelos generativos

Los modelos generativos reciben contexto y producen texto. `llama3.2:3b` y `qwen2.5:3b` se consideran modelos generativos, pero la documentación disponible no permite asignarles responsabilidades adicionales ni distinguir cuál procesa una etapa concreta.

La asignación exacta de modelos a nodos y prompts pertenece a los workflows y no se documenta internamente hasta estabilizar su configuración.

## Modelo de embeddings

`qwen3-embedding:0.6b` transforma texto en representaciones vectoriales para posibilitar la recuperación semántica. n8n utiliza el modelo según los workflows configurados.

## Relación con n8n

n8n actúa como orquestador. Puede llamar a Ollama para:

- producir embeddings;
- ejecutar modelos generativos;
- preparar la respuesta que finalmente recibe el bot de Discord.

No se han verificado en el repositorio dimensiones vectoriales, cuantización, ventana de contexto ni parámetros internos adicionales. Estos valores no deben inferirse o inventarse.
