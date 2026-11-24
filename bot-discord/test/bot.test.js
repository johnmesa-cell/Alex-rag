
const test = require("node:test");
const assert = require("node:assert/strict");
const { createBot } = require("../src/bot");

function config() {
  return {
    channelRoutes: new Map([
      ["channel-1", "http://n8n:5678/webhook/simple"],
      ["channel-2", "http://n8n:5678/webhook/simple"],
      ["channel-3", "http://n8n:5678/webhook/custom-route"],
      ["channel-4", "http://n8n:5678/webhook/sql"],
    ]),
    legacySqlSessionChannelIds: new Set(["channel-3", "channel-4"]),
    requestTimeoutMs: 1000,
  };
}

function message(id, userId = "user", channelId = "channel-1") {
  const sent = [];

  return {
    id,
    guildId: "guild",
    channelId,
    content: `question-${id}`,
    author: { id: userId, bot: false },
    channel: { send: async (content) => sent.push(content) },
    sent,
  };
}

test("ignores bots, unconfigured channels, and messages without a server", async () => {
  let calls = 0;

  const { processMessage } = createBot(config(), {
    client: { on() {} },
    askN8n: async () => {
      calls += 1;
      return "answer";
    },
  });

  await processMessage({
    ...message("bot"),
    author: { id: "bot", bot: true },
  });

  await processMessage(message("other", "user", "channel-5"));

  const directMessage = message("direct");
  directMessage.guildId = null;
  await processMessage(directMessage);

  assert.equal(calls, 0);
});

test("routes each channel to its configured webhook", async () => {
  const received = [];

  const { processMessage } = createBot(config(), {
    client: { on() {} },
    askN8n: async (_config, incoming, webhookUrl, sessionRoute) => {
      received.push({
        channelId: incoming.channelId,
        webhookUrl,
        sessionRoute,
      });

      return "answer";
    },
  });

  await processMessage(message("original-1", "user", "channel-1"));
  await processMessage(message("original-2", "user", "channel-2"));
  await processMessage(message("sql-1", "user", "channel-3"));
  await processMessage(message("sql-2", "user", "channel-4"));

  assert.deepEqual(received, [
    {
      channelId: "channel-1",
      webhookUrl: "http://n8n:5678/webhook/simple",
      sessionRoute: "simple",
    },
    {
      channelId: "channel-2",
      webhookUrl: "http://n8n:5678/webhook/simple",
      sessionRoute: "simple",
    },
    {
      channelId: "channel-3",
      webhookUrl: "http://n8n:5678/webhook/custom-route",
      sessionRoute: "sql",
    },
    {
      channelId: "channel-4",
      webhookUrl: "http://n8n:5678/webhook/sql",
      sessionRoute: "sql",
    },
  ]);
});

test("shared webhook URLs keep session classifications independent", async () => {
  const botConfig = config();
  botConfig.legacySqlSessionChannelIds.add("channel-2");

  const received = [];

  const { processMessage } = createBot(botConfig, {
    client: { on() {} },
    askN8n: async (_config, incoming, webhookUrl, sessionRoute) => {
      received.push({ channelId: incoming.channelId, webhookUrl, sessionRoute });
      return "answer";
    },
  });

  await processMessage(message("shared-simple", "user", "channel-1"));
  await processMessage(message("shared-sql", "user", "channel-2"));

  assert.deepEqual(received, [
    {
      channelId: "channel-1",
      webhookUrl: "http://n8n:5678/webhook/simple",
      sessionRoute: "simple",
    },
    {
      channelId: "channel-2",
      webhookUrl: "http://n8n:5678/webhook/simple",
      sessionRoute: "sql",
    },
  ]);
});

test("configured channels without legacy SQL metadata use simple sessions", async () => {
  const received = [];

  const { processMessage } = createBot(config(), {
    client: { on() {} },
    askN8n: async (_config, incoming, _webhookUrl, sessionRoute) => {
      received.push({ channelId: incoming.channelId, sessionRoute });
      return "answer";
    },
  });

  await processMessage(message("simple-session", "user", "channel-1"));

  assert.deepEqual(received, [
    { channelId: "channel-1", sessionRoute: "simple" },
  ]);
});

test("deduplicates messages and serializes each user's queue", async () => {
  const started = [];
  const release = [];

  const { processMessage } = createBot(config(), {
    client: { on() {} },
    askN8n: async (_config, incoming) => {
      started.push(incoming.id);

      await new Promise((resolve) => release.push(resolve));

      return `answer-${incoming.id}`;
    },
  });

  const first = message("first");
  const duplicate = message("first");
  const second = message("second");

  const firstRun = processMessage(first);
  const duplicateRun = processMessage(duplicate);
  const secondRun = processMessage(second);

  await new Promise((resolve) => setImmediate(resolve));

  assert.deepEqual(started, ["first"]);

  release.shift()();

  await new Promise((resolve) => setImmediate(resolve));

  assert.deepEqual(started, ["first", "second"]);

  release.shift()();

  await Promise.all([firstRun, duplicateRun, secondRun]);

  assert.deepEqual(first.sent, ["answer-first"]);
  assert.deepEqual(second.sent, ["answer-second"]);
  assert.deepEqual(duplicate.sent, []);
});
