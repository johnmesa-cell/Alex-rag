const test = require("node:test");
const assert = require("node:assert/strict");

const {
  splitMessage,
  sessionIdFor,
} = require("../src/message-utils");

const message = {
  guildId: "guild-id",
  channelId: "channel-id",
  author: { id: "user-id" },
};

test("splits responses at Discord's message limit", () => {
  const chunks = splitMessage("a".repeat(4001));

  assert.deepEqual(
    chunks.map((chunk) => chunk.length),
    [2000, 2000, 1]
  );
});

test("rejects empty responses", () => {
  assert.throws(
    () => splitMessage("   "),
    /contain text/
  );
});

test("generates the original Simple Memory session ID", () => {
  const sessionId = sessionIdFor(message, "simple");

  assert.equal(
    sessionId,
    "discord:guild-id:user-id"
  );
});

test("generates an independent Postgres session ID", () => {
  const sessionId = sessionIdFor(message, "sql");

  assert.equal(
    sessionId,
    "discord:postgres:guild-id:channel-id:user-id"
  );
});

test("rejects unknown session routes", () => {
  assert.throws(
    () => sessionIdFor(message, "unknown"),
    /Unknown session route/
  );
});
