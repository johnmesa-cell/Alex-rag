
function requiredFrom(env, name) {
  const value = env[name]?.trim();

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function loadConfig(env = process.env) {
  const token = env.DISCORD_TOKEN?.trim();

  if (!token) {
    throw new Error("Missing required environment variable: DISCORD_TOKEN");
  }

  const channelIds = (env.DISCORD_ALLOWED_CHANNEL_IDS || "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);

  if (channelIds.length !== 4) {
    throw new Error(
      "DISCORD_ALLOWED_CHANNEL_IDS must contain exactly four channel IDs"
    );
  }

  const sqlChannelIds = (env.DISCORD_SQL_CHANNEL_IDS || "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);

  if (sqlChannelIds.length !== 2) {
    throw new Error(
      "DISCORD_SQL_CHANNEL_IDS must contain exactly two channel IDs"
    );
  }

  // Primero comprobamos que no existan canales duplicados.
  if (new Set(channelIds).size !== channelIds.length) {
    throw new Error("Discord channel IDs must not contain duplicates");
  }

  // Después comprobamos que los canales SQL estén permitidos.
  if (!sqlChannelIds.every((id) => channelIds.includes(id))) {
    throw new Error(
      "DISCORD_SQL_CHANNEL_IDS must contain IDs from DISCORD_ALLOWED_CHANNEL_IDS"
    );
  }

  const timeoutMs = Number(env.DISCORD_REQUEST_TIMEOUT_MS || 120000);

  if (!Number.isInteger(timeoutMs) || timeoutMs <= 0) {
    throw new Error("DISCORD_REQUEST_TIMEOUT_MS must be a positive integer");
  }

  return {
    token,
    allowedChannelIds: new Set(channelIds),
    sqlChannelIds: new Set(sqlChannelIds),
    n8nWebhookUrl: requiredFrom(env, "N8N_DISCORD_WEBHOOK_URL"),
    n8nSqlWebhookUrl: requiredFrom(env, "N8N_SQL_DISCORD_WEBHOOK_URL"),
    n8nWebhookSecret: requiredFrom(env, "N8N_WEBHOOK_SECRET"),
    requestTimeoutMs: timeoutMs,
  };
}

module.exports = { loadConfig };
