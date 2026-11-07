function required(name) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function loadConfig(env = process.env) {
  const token = env.DISCORD_TOKEN?.trim();
  const channelIds = (env.DISCORD_ALLOWED_CHANNEL_IDS || "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);

  if (!token) {
    throw new Error("Missing required environment variable: DISCORD_TOKEN");
  }
  if (channelIds.length !== 2) {
    throw new Error("DISCORD_ALLOWED_CHANNEL_IDS must contain exactly two channel IDs");
  }

  const timeoutMs = Number(env.DISCORD_REQUEST_TIMEOUT_MS || 120000);
  if (!Number.isInteger(timeoutMs) || timeoutMs <= 0) {
    throw new Error("DISCORD_REQUEST_TIMEOUT_MS must be a positive integer");
  }

  return {
    token,
    allowedChannelIds: new Set(channelIds),
    n8nWebhookUrl: requiredFrom(env, "N8N_DISCORD_WEBHOOK_URL"),
    n8nWebhookSecret: requiredFrom(env, "N8N_WEBHOOK_SECRET"),
    requestTimeoutMs: timeoutMs,
  };
}

function requiredFrom(env, name) {
  const value = env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

module.exports = { loadConfig };
