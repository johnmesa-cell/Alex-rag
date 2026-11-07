async function askN8n(config, message, fetchImpl = fetch) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.requestTimeoutMs);

  try {
    const response = await fetchImpl(config.n8nWebhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Webhook-Secret": config.n8nWebhookSecret,
      },
      body: JSON.stringify({
        message: message.content,
        messageId: message.id,
        guildId: message.guildId,
        channelId: message.channelId,
        sessionId: `discord:${message.guildId}:${message.author.id}`,
      }),
      signal: controller.signal,
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
      : body.response ?? body.output ?? body.text;
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
  }
}

module.exports = { askN8n };
