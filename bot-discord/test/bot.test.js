const test = require("node:test");
const assert = require("node:assert/strict");
const { createBot } = require("../src/bot");

function config() {
  return {
    allowedChannelIds: new Set(["allowed"]),
    requestTimeoutMs: 1000,
  };
}

function message(id, userId = "user") {
  const sent = [];
  return {
    id,
    guildId: "guild",
    channelId: "allowed",
    content: `question-${id}`,
    author: { id: userId, bot: false },
    channel: { send: async (content) => sent.push(content) },
    sent,
  };
}

test("ignores bots and messages outside the allowed channels", async () => {
  let calls = 0;
  const { processMessage } = createBot(config(), {
    client: { on() {} },
    askN8n: async () => {
      calls += 1;
      return "answer";
    },
  });

  await processMessage({ ...message("bot"), author: { id: "bot", bot: true } });
  await processMessage({ ...message("other"), channelId: "other" });
  assert.equal(calls, 0);
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
