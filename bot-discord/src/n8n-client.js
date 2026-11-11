const { Agent } = require("undici");
const { sessionIdFor } = require("./message-utils");

async function askN8n(
  config,
  message,
  route = "simple",
  fetchImpl = fetch
) {
  let webhookUrl;

  if (route === "sql") {
    webhookUrl = config.n8nSqlWebhookUrl;
  } else if (route === "simple") {
    webhookUrl = config.n8nWebhookUrl;
  } else {
    throw new Error(`Unknown n8n workflow route: ${route}`);
  }

  if (!webhookUrl) {
    throw new Error(`Missing webhook URL for route: ${route}`);
  }

  const sessionId = sessionIdFor(message, route);

  const controller = new AbortController();

  const timeout = setTimeout(
    () => controller.abort(),
    config.requestTimeoutMs
  );

  const dispatcher = new Agent({
    headersTimeout: config.requestTimeoutMs,
    bodyTimeout: config.requestTimeoutMs,
  });

  try {
    const response = await fetchImpl(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-N8N-WEBHOOK-SECRET": config.n8nWebhookSecret,
      },
      body: JSON.stringify({
        message: message.content,
        messageId: message.id,
        guildId: message.guildId,
        channelId: message.channelId,
        sessionId,
      }),
      signal: controller.signal,
      dispatcher,
    });

    if (!response.ok) {
      throw new Error(`n8n webhook returned HTTP ${response.status}`);
    }

    const rawBody = await response.text();

    let body;

    try {
      body = JSON.parse(rawBody);
    } catch {
      body = rawBody;
    }

    const answer = typeof body === "string"
      ? body
      : body.response ?? body.output ?? body.text ?? body.message;

    if (typeof answer !== "string" || !answer.trim()) {
      throw new Error("n8n webhook returned no response text");
    }

    return answer;
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("The request to n8n timed out");
    }

    throw error;
  } finally {
    clearTimeout(timeout);
    await dispatcher.close();
  }
}

module.exports = { askN8n };