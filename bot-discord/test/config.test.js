const test = require("node:test");
const assert = require("node:assert/strict");
const { loadConfig } = require("../src/config");

function environment(overrides = {}) {
  return {
    DISCORD_TOKEN: "token",
    DISCORD_ALLOWED_CHANNEL_IDS: "channel-a,channel-b",
    N8N_DISCORD_WEBHOOK_URL: "http://n8n:5678/webhook/discord-chat",
    N8N_WEBHOOK_SECRET: "secret",
    ...overrides,
  };
}

test("requires exactly two allowed channels", () => {
  assert.throws(
    () => loadConfig(environment({ DISCORD_ALLOWED_CHANNEL_IDS: "one" })),
    /exactly two/,
  );
});

test("loads and trims bot configuration", () => {
  const config = loadConfig(environment({
    DISCORD_ALLOWED_CHANNEL_IDS: " channel-a, channel-b ",
    DISCORD_REQUEST_TIMEOUT_MS: "5000",
  }));
  assert.equal(config.requestTimeoutMs, 5000);
  assert.equal(config.allowedChannelIds.has("channel-a"), true);
});
