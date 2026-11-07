const test = require("node:test");
const assert = require("node:assert/strict");
const { askN8n } = require("../src/n8n-client");

const config = {
  n8nWebhookUrl: "http://n8n:5678/webhook/discord-chat",
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

test("sends the authenticated session payload and reads JSON responses", async () => {
  let request;
  const answer = await askN8n(config, message, async (_url, options) => {
    request = options;
    return {
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ response: "answer" }),
    };
  });

  assert.equal(answer, "answer");
  assert.equal(request.headers["X-Webhook-Secret"], "secret");
  assert.equal(JSON.parse(request.body).sessionId, "discord:guild-id:user-id");
});

test("accepts plain-text webhook responses", async () => {
  const answer = await askN8n(config, message, async () => ({
    ok: true,
    status: 200,
    text: async () => "plain answer",
  }));
  assert.equal(answer, "plain answer");
});
