
const test = require("node:test");
const assert = require("node:assert/strict");
const { askN8n } = require("../src/n8n-client");

const config = {
  n8nWebhookSecret: "secret",
  requestTimeoutMs: 1000,
};

const simpleWebhookUrl = "http://n8n:5678/webhook/discord-chat";
const sqlWebhookUrl =
  "http://n8n:5678/webhook/edae0fd6-42bf-446d-a880-1374b198a7d2";

const message = {
  id: "message-id",
  content: "question",
  guildId: "guild-id",
  channelId: "channel-id",
  author: { id: "user-id" },
};

test("sends one authenticated JSON request to the supplied webhook", async () => {
  let request;
  let requestedUrl;
  let requestCount = 0;

  const answer = await askN8n(
    config,
    message,
    simpleWebhookUrl,
    "simple",
    async (url, options) => {
      requestCount += 1;
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
  assert.equal(requestedUrl, simpleWebhookUrl);
  assert.equal(requestCount, 1);
  assert.equal(request.method, "POST");
  assert.equal(request.headers["Content-Type"], "application/json");
  assert.equal(request.headers["X-N8N-WEBHOOK-SECRET"], "secret");

  const payload = JSON.parse(request.body);

  assert.equal(payload.message, "question");
  assert.equal(payload.messageId, "message-id");
  assert.equal(payload.guildId, "guild-id");
  assert.equal(payload.channelId, "channel-id");
  assert.equal(payload.sessionId, "discord:guild-id:user-id");
});

test("preserves historical SQL session IDs independently of webhook URL", async () => {
  let request;
  let requestedUrl;

  const answer = await askN8n(
    config,
    message,
    sqlWebhookUrl,
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
  assert.equal(requestedUrl, sqlWebhookUrl);
  assert.equal(request.headers["X-N8N-WEBHOOK-SECRET"], "secret");

  const payload = JSON.parse(request.body);

  assert.equal(
    payload.sessionId,
    "discord:postgres:guild-id:channel-id:user-id"
  );
});

test("session IDs are selected independently of a shared webhook URL", async () => {
  const sharedWebhookUrl = "http://n8n:5678/webhook/shared";
  const requests = [];
  const fetchImpl = async (url, options) => {
    requests.push({
      url,
      payload: JSON.parse(options.body),
    });

    return {
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ response: "answer" }),
    };
  };

  await askN8n(config, message, sharedWebhookUrl, "simple", fetchImpl);
  await askN8n(config, message, sharedWebhookUrl, "sql", fetchImpl);

  assert.deepEqual(
    requests.map(({ url }) => url),
    [sharedWebhookUrl, sharedWebhookUrl]
  );
  assert.deepEqual(
    requests.map(({ payload }) => payload.sessionId),
    [
      "discord:guild-id:user-id",
      "discord:postgres:guild-id:channel-id:user-id",
    ]
  );
});

test("accepts plain-text webhook responses", async () => {
  const answer = await askN8n(
    config,
    message,
    simpleWebhookUrl,
    "simple",
    async () => ({
      ok: true,
      status: 200,
      text: async () => "plain answer",
    })
  );

  assert.equal(answer, "plain answer");
});

test("rejects responses without text", async () => {
  await assert.rejects(
    () => askN8n(config, message, simpleWebhookUrl, "simple", async () => ({
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ response: "" }),
    })),
    /returned no response text/
  );
});

test("does not retry failed HTTP requests", async () => {
  let requestCount = 0;

  await assert.rejects(
    () => askN8n(
      config,
      message,
      simpleWebhookUrl,
      "simple",
      async () => {
        requestCount += 1;
        throw new Error("network failure");
      }
    ),
    /network failure/
  );

  assert.equal(requestCount, 1);
});
