
const test = require("node:test");
const assert = require("node:assert/strict");
const { loadConfig } = require("../src/config");

function environment(overrides = {}) {
  return {
    DISCORD_TOKEN: "token",
    DISCORD_CHANNEL_ROUTES: JSON.stringify({
      "channel-a": "http://n8n:5678/webhook/discord-chat",
      "channel-b": "http://n8n:5678/webhook/discord-chat",
      "channel-c": "https://n8n.example/webhook/postgres",
      "channel-d": "https://n8n.example/webhook/postgres",
    }),
    DISCORD_LEGACY_SQL_SESSION_CHANNEL_IDS: "channel-c,channel-d",
    N8N_WEBHOOK_SECRET: "secret",
    ...overrides,
  };
}

test("loads a single configured channel", () => {
  const config = loadConfig(environment({
    DISCORD_CHANNEL_ROUTES: '{"channel-a":"http://n8n:5678/webhook/chat"}',
    DISCORD_LEGACY_SQL_SESSION_CHANNEL_IDS: "",
  }));

  assert.deepEqual(
    [...config.channelRoutes],
    [["channel-a", "http://n8n:5678/webhook/chat"]]
  );
  assert.equal(config.legacySqlSessionChannelIds.size, 0);
});

test("supports multiple channels sharing or using different webhooks", () => {
  const config = loadConfig(environment());

  assert.equal(config.channelRoutes.size, 4);
  assert.equal(
    config.channelRoutes.get("channel-a"),
    config.channelRoutes.get("channel-b")
  );
  assert.notEqual(
    config.channelRoutes.get("channel-a"),
    config.channelRoutes.get("channel-c")
  );
});

test("rejects invalid route JSON", () => {
  assert.throws(
    () => loadConfig(environment({
      DISCORD_CHANNEL_ROUTES: '{"channel-a":',
    })),
    /must contain valid JSON/
  );
});

test("rejects an empty routes object", () => {
  assert.throws(
    () => loadConfig(environment({
      DISCORD_CHANNEL_ROUTES: "{}",
    })),
    /must not be empty/
  );
});

test("rejects empty channel IDs", () => {
  assert.throws(
    () => loadConfig(environment({
      DISCORD_CHANNEL_ROUTES: '{"":"http://n8n:5678/webhook/chat"}',
    })),
    /channel IDs must not be empty/
  );
});

test("rejects duplicate channel IDs", () => {
  assert.throws(
    () => loadConfig(environment({
      DISCORD_CHANNEL_ROUTES:
        '{"channel-a":"http://n8n:5678/webhook/one","channel-a":"http://n8n:5678/webhook/two"}',
    })),
    /must not contain duplicate channel IDs/
  );
});

test("rejects duplicate channel IDs separated by whitespace", () => {
  assert.throws(
    () => loadConfig(environment({
      DISCORD_CHANNEL_ROUTES:
        '{"channel-a":"http://n8n:5678/webhook/one", \n "channel-a" : "http://n8n:5678/webhook/two"}',
    })),
    /must not contain duplicate channel IDs/
  );
});

test("does not mistake braces inside route strings for JSON structure", () => {
  const config = loadConfig(environment({
    DISCORD_CHANNEL_ROUTES:
      '{"channel-{one}":"https://n8n.example/webhook/{route}","channel-two":"http://n8n:5678/webhook/other"}',
    DISCORD_LEGACY_SQL_SESSION_CHANNEL_IDS: "",
  }));

  assert.equal(
    config.channelRoutes.get("channel-{one}"),
    "https://n8n.example/webhook/{route}"
  );
  assert.equal(config.channelRoutes.size, 2);
});

test("accepts valid URLs containing escaped quotes and key-like text", () => {
  const webhookUrl =
    'https://n8n.example/webhook/{route}?query="channel-b":"value"';
  const config = loadConfig(environment({
    DISCORD_CHANNEL_ROUTES: JSON.stringify({
      "channel-{a}": webhookUrl,
      "channel-b": "http://n8n:5678/webhook/other",
    }),
    DISCORD_LEGACY_SQL_SESSION_CHANNEL_IDS: "",
  }));

  assert.equal(config.channelRoutes.get("channel-{a}"), webhookUrl);
  assert.equal(config.channelRoutes.size, 2);
});

test("rejects invalid webhook URLs", () => {
  assert.throws(
    () => loadConfig(environment({
      DISCORD_CHANNEL_ROUTES: '{"channel-a":"ftp://n8n.example/webhook/chat"}',
    })),
    /must use HTTP or HTTPS/
  );

  assert.throws(
    () => loadConfig(environment({
      DISCORD_CHANNEL_ROUTES: '{"channel-a":"not a URL"}',
    })),
    /invalid webhook URL/
  );
});

test("validates the temporary SQL session metadata independently of routing", () => {
  const config = loadConfig(environment({
    DISCORD_REQUEST_TIMEOUT_MS: "5000",
  }));

  assert.equal(config.requestTimeoutMs, 5000);
  assert.deepEqual(
    [...config.legacySqlSessionChannelIds],
    ["channel-c", "channel-d"]
  );

  assert.throws(
    () => loadConfig(environment({
      DISCORD_LEGACY_SQL_SESSION_CHANNEL_IDS: "channel-c,channel-x",
    })),
    /must contain IDs from DISCORD_CHANNEL_ROUTES/
  );

  assert.throws(
    () => loadConfig(environment({
      DISCORD_LEGACY_SQL_SESSION_CHANNEL_IDS: "channel-c,channel-c",
    })),
    /must not contain duplicates/
  );
});
