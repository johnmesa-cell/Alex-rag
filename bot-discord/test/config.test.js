
const test = require("node:test");
const assert = require("node:assert/strict");
const { loadConfig } = require("../src/config");

function environment(overrides = {}) {
  return {
    DISCORD_TOKEN: "token",
    DISCORD_ALLOWED_CHANNEL_IDS: "channel-a,channel-b,channel-c,channel-d",
    DISCORD_SQL_CHANNEL_IDS: "channel-c,channel-d",
    N8N_DISCORD_WEBHOOK_URL: "http://n8n:5678/webhook/discord-chat",
    N8N_SQL_DISCORD_WEBHOOK_URL:
      "http://n8n:5678/webhook/edae0fd6-42bf-446d-a880-1374b198a7d2",
    N8N_WEBHOOK_SECRET: "secret",
    ...overrides,
  };
}

test("requires exactly four allowed channels", () => {
  assert.throws(
    () => loadConfig(environment({
      DISCORD_ALLOWED_CHANNEL_IDS: "one,two",
    })),
    /exactly four/
  );
});

test("requires exactly two SQL channels", () => {
  assert.throws(
    () => loadConfig(environment({
      DISCORD_SQL_CHANNEL_IDS: "channel-c",
    })),
    /exactly two/
  );
});

test("SQL channels must belong to the allowed channels", () => {
  assert.throws(
    () => loadConfig(environment({
      DISCORD_SQL_CHANNEL_IDS: "channel-c,channel-x",
    })),
    /must contain IDs from DISCORD_ALLOWED_CHANNEL_IDS/
  );
});

test("rejects duplicate channel IDs", () => {
  assert.throws(
    () => loadConfig(environment({
      DISCORD_ALLOWED_CHANNEL_IDS:
        "channel-a,channel-b,channel-c,channel-a",
    })),
    /must not contain duplicates/
  );
});

test("loads and trims bot configuration", () => {
  const config = loadConfig(environment({
    DISCORD_ALLOWED_CHANNEL_IDS:
      " channel-a, channel-b, channel-c, channel-d ",
    DISCORD_SQL_CHANNEL_IDS: " channel-c, channel-d ",
    DISCORD_REQUEST_TIMEOUT_MS: "5000",
  }));

  assert.equal(config.requestTimeoutMs, 5000);

  assert.equal(config.allowedChannelIds.size, 4);
  assert.equal(config.allowedChannelIds.has("channel-a"), true);
  assert.equal(config.allowedChannelIds.has("channel-d"), true);

  assert.equal(config.sqlChannelIds.size, 2);
  assert.equal(config.sqlChannelIds.has("channel-c"), true);
  assert.equal(config.sqlChannelIds.has("channel-d"), true);

  assert.equal(
    config.n8nWebhookUrl,
    "http://n8n:5678/webhook/discord-chat"
  );

  assert.equal(
    config.n8nSqlWebhookUrl,
    "http://n8n:5678/webhook/edae0fd6-42bf-446d-a880-1374b198a7d2"
  );
});
