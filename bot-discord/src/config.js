function requiredFrom(env, name) {
  const value = env[name]?.trim();

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function rejectDuplicateRouteKeys(json) {
  const keys = new Set();
  let depth = 0;
  let inString = false;
  let escaped = false;
  let stringStart = -1;

  for (let index = 0; index < json.length; index += 1) {
    const character = json[index];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (character === "\\") {
        escaped = true;
      } else if (character === '"') {
        inString = false;

        if (depth !== 1) continue;

        let next = index + 1;

        while (/\s/.test(json[next] || "")) next += 1;

        if (json[next] !== ":") continue;

        const key = JSON.parse(json.slice(stringStart, index + 1));

        if (keys.has(key)) {
          throw new Error(
            `DISCORD_CHANNEL_ROUTES must not contain duplicate channel IDs: ${key}`
          );
        }

        keys.add(key);
      }

      continue;
    }

    if (character === '"') {
      inString = true;
      stringStart = index;
    } else if (character === "{") {
      depth += 1;
    } else if (character === "}") {
      depth -= 1;
    }
  }
}

function parseChannelRoutes(value) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error("DISCORD_CHANNEL_ROUTES must contain a non-empty JSON object");
  }

  let routes;

  try {
    routes = JSON.parse(value);
  } catch {
    throw new Error("DISCORD_CHANNEL_ROUTES must contain valid JSON");
  }

  if (
    routes === null ||
    typeof routes !== "object" ||
    Array.isArray(routes)
  ) {
    throw new Error("DISCORD_CHANNEL_ROUTES must be a JSON object");
  }

  rejectDuplicateRouteKeys(value);

  const entries = Object.entries(routes);

  if (entries.length === 0) {
    throw new Error("DISCORD_CHANNEL_ROUTES must not be empty");
  }

  const channelRoutes = new Map();

  for (const [rawChannelId, rawWebhookUrl] of entries) {
    const channelId = rawChannelId.trim();

    if (!channelId) {
      throw new Error("DISCORD_CHANNEL_ROUTES channel IDs must not be empty");
    }

    if (channelRoutes.has(channelId)) {
      throw new Error(
        `DISCORD_CHANNEL_ROUTES contains ambiguous channel ID: ${channelId}`
      );
    }

    if (typeof rawWebhookUrl !== "string" || !rawWebhookUrl.trim()) {
      throw new Error(
        `DISCORD_CHANNEL_ROUTES must define a webhook URL for channel ${channelId}`
      );
    }

    const webhookUrl = rawWebhookUrl.trim();
    let parsedUrl;

    try {
      parsedUrl = new URL(webhookUrl);
    } catch {
      throw new Error(
        `DISCORD_CHANNEL_ROUTES has an invalid webhook URL for channel ${channelId}`
      );
    }

    if (
      !["http:", "https:"].includes(parsedUrl.protocol) ||
      !parsedUrl.hostname
    ) {
      throw new Error(
        `DISCORD_CHANNEL_ROUTES webhook URL for channel ${channelId} must use HTTP or HTTPS`
      );
    }

    channelRoutes.set(channelId, webhookUrl);
  }

  return channelRoutes;
}

function parseLegacySqlSessionChannelIds(value, channelRoutes) {
  if (!value || value.trim() === "") return new Set();

  const channelIds = value.split(",").map((id) => id.trim());

  if (channelIds.some((id) => !id)) {
    throw new Error(
      "DISCORD_LEGACY_SQL_SESSION_CHANNEL_IDS must contain non-empty channel IDs"
    );
  }

  if (new Set(channelIds).size !== channelIds.length) {
    throw new Error(
      "DISCORD_LEGACY_SQL_SESSION_CHANNEL_IDS must not contain duplicates"
    );
  }

  if (!channelIds.every((id) => channelRoutes.has(id))) {
    throw new Error(
      "DISCORD_LEGACY_SQL_SESSION_CHANNEL_IDS must contain IDs from DISCORD_CHANNEL_ROUTES"
    );
  }

  return new Set(channelIds);
}

function loadConfig(env = process.env) {
  const token = env.DISCORD_TOKEN?.trim();

  if (!token) {
    throw new Error("Missing required environment variable: DISCORD_TOKEN");
  }

  const channelRoutes = parseChannelRoutes(env.DISCORD_CHANNEL_ROUTES);
  const legacySqlSessionChannelIds = parseLegacySqlSessionChannelIds(
    env.DISCORD_LEGACY_SQL_SESSION_CHANNEL_IDS,
    channelRoutes
  );
  const timeoutMs = Number(env.DISCORD_REQUEST_TIMEOUT_MS || 120000);

  if (!Number.isInteger(timeoutMs) || timeoutMs <= 0) {
    throw new Error("DISCORD_REQUEST_TIMEOUT_MS must be a positive integer");
  }

  return {
    token,
    channelRoutes,
    legacySqlSessionChannelIds,
    n8nWebhookSecret: requiredFrom(env, "N8N_WEBHOOK_SECRET"),
    requestTimeoutMs: timeoutMs,
  };
}

module.exports = { loadConfig };
