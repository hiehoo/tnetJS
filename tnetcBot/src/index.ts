import { startBot } from "./bot";
import { clientConfig, startClient } from "./client";
// import { startClient } from "./client";

// Initialize the bot

// Start the bot
startBot()
  .then(() => {
    console.log("Bot started");
    return startClient();
  })
  .then((client) => {
    console.log("Client started");
    return clientConfig(client);
  })
  .then(() => {
    console.log("Client configured");
  })
  .catch((err) => {
    console.error("Error starting bot:", err);
  });
