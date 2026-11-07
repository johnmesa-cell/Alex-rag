const { Client, GatewayIntentBits } = require("discord.js");
const { askN8n } = require("./n8n-client");
const { splitMessage } = require("./message-utils");

const DUPLICATE_TTL_MS = 10 * 60 * 1000;

function createBot(config, dependencies = {}) {
  const client = dependencies.client || new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
    ],
  });
  const fetchN8n = dependencies.askN8n || askN8n;
  const seenMessages = new Map();
  const userQueues = new Map();

  const cleanupSeen = () => {
    const now = Date.now();
    for (const [messageId, expiresAt] of seenMessages) {
      if (expiresAt <= now) seenMessages.delete(messageId);
    }
  };

  const processMessage = async (message) => {
    if (
      message.author?.bot ||
      !message.guildId ||
      !config.allowedChannelIds.has(message.channelId)
    ) {
      return;
    }
    cleanupSeen();
    if (seenMessages.has(message.id)) return;
    seenMessages.set(message.id, Date.now() + DUPLICATE_TTL_MS);

    const userId = message.author.id;
    const previous = userQueues.get(userId) || Promise.resolve();
    const current = previous
      .catch(() => undefined)
      .then(async () => {
        try {
          const answer = await fetchN8n(config, message);
          for (const chunk of splitMessage(answer)) {
            await message.channel.send(chunk);
          }
        } catch (error) {
          console.error(`Failed to process Discord message ${message.id}:`, error);
          await message.channel.send(
            "No pude procesar tu consulta en este momento. Inténtalo de nuevo más tarde.",
          );
        }
      });
    userQueues.set(userId, current);
    await current;
    if (userQueues.get(userId) === current) userQueues.delete(userId);
  };

  client.on("messageCreate", (message) => {
    processMessage(message).catch((error) => {
      console.error("Unexpected Discord message handler error:", error);
    });
  });

  return { client, processMessage };
}

module.exports = { createBot };
