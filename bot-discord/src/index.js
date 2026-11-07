const { loadConfig } = require("./config");
const { createBot } = require("./bot");

try {
  const config = loadConfig();
  const { client } = createBot(config);
  client.once("ready", (readyClient) => {
    console.log(`Discord bot logged in as ${readyClient.user.tag}`);
  });
  client.login(config.token).catch((error) => {
    console.error("Discord login failed:", error);
    process.exitCode = 1;
  });
} catch (error) {
  console.error("Bot configuration failed:", error.message);
  process.exitCode = 1;
}
