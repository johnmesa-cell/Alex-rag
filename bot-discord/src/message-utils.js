const DISCORD_MESSAGE_LIMIT = 2000;

function splitMessage(content, limit = DISCORD_MESSAGE_LIMIT) {
  if (typeof content !== "string" || !content.trim()) {
    throw new Error("The n8n response did not contain text");
  }
  const chunks = [];
  for (let offset = 0; offset < content.length; offset += limit) {
    chunks.push(content.slice(offset, offset + limit));
  }
  return chunks;
}

function sessionIdFor(message) {
  return `discord:${message.guildId}:${message.author.id}`;
}

module.exports = { DISCORD_MESSAGE_LIMIT, sessionIdFor, splitMessage };
