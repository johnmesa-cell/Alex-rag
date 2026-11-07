const test = require("node:test");
const assert = require("node:assert/strict");
const { splitMessage } = require("../src/message-utils");

test("splits responses at Discord's message limit", () => {
  const chunks = splitMessage("a".repeat(4001));
  assert.deepEqual(chunks.map((chunk) => chunk.length), [2000, 2000, 1]);
});

test("rejects empty responses", () => {
  assert.throws(() => splitMessage("   "), /contain text/);
});
