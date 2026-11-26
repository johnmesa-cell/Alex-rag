
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

function sessionIdFor(message, route = "simple") {
  if (route === "sql") {
    return `discord:postgres:${message.guildId}:${message.channelId}:${message.author.id}`;
  }

  if (route === "simple") {
    return `discord:${message.guildId}:${message.author.id}`;
  }

  throw new Error(`Unknown session route: ${route}`);
}

module.exports = {
  DISCORD_MESSAGE_LIMIT,
  sessionIdFor,
  splitMessage,
};
