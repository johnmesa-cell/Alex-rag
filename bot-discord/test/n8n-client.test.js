
const test = require("node:test");
const assert = require("node:assert/strict");
const { askN8n } = require("../src/n8n-client");

const config = {
  n8nWebhookUrl: "http://n8n:5678/webhook/discord-chat",
  n8nSqlWebhookUrl:
    "http://n8n:5678/webhook/edae0fd6-42bf-446d-a880-1374b198a7d2",
  n8nWebhookSecret: "secret",
  requestTimeoutMs: 1000,
};

const message = {
  id: "message-id",
  content: "question",
  guildId: "guild-id",
  channelId: "channel-id",
  author: { id: "user-id" },
};

test("sends authenticated request to Simple Memory webhook", async () => {
  let request;
  let requestedUrl;

  const answer = await askN8n(
    config,
    message,
    "simple",
    async (url, options) => {
      requestedUrl = url;
      request = options;

      return {
        ok: true,
        status: 200,
        text: async () => JSON.stringify({ response: "answer" }),
      };
    }
  );

  assert.equal(answer, "answer");
  assert.equal(requestedUrl, config.n8nWebhookUrl);
  assert.equal(request.headers["X-N8N-WEBHOOK-SECRET"], "secret");

  const payload = JSON.parse(request.body);

  assert.equal(payload.message, "question");
  assert.equal(payload.messageId, "message-id");
  assert.equal(payload.sessionId, "discord:guild-id:user-id");
});

test("sends authenticated request to Postgres Chat Memory webhook", async () => {
  let request;
  let requestedUrl;

  const answer = await askN8n(
    config,
    message,
    "sql",
    async (url, options) => {
      requestedUrl = url;
      request = options;

      return {
        ok: true,
        status: 200,
        text: async () => JSON.stringify({ response: "SQL answer" }),
      };
    }
  );

  assert.equal(answer, "SQL answer");
  assert.equal(requestedUrl, config.n8nSqlWebhookUrl);
  assert.equal(request.headers["X-N8N-WEBHOOK-SECRET"], "secret");

  const payload = JSON.parse(request.body);

  assert.equal(
    payload.sessionId,
    "discord:postgres:guild-id:channel-id:user-id"
  );
});

test("accepts plain-text webhook responses", async () => {
  const answer = await askN8n(
    config,
    message,
    "simple",
    async () => ({
      ok: true,
      status: 200,
      text: async () => "plain answer",
    })
  );

  assert.equal(answer, "plain answer");
});

test("rejects unknown workflow routes", async () => {
  await assert.rejects(
    () => askN8n(config, message, "unknown"),
    /Unknown n8n workflow route/
  );
});
