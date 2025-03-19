import { Telegraf, session } from "telegraf";
import { handleStart } from "./handlers/start";
import { handleCallbackQuery } from "./handlers/callbacks";
import { handleMessage } from "./handlers/messages";
import { database } from "./services";
import { BOT_TOKEN, USE_WEBHOOK, WEBHOOK_DOMAIN, WEBHOOK_PORT } from "./config";

// Initialize the bot
const bot = new Telegraf(BOT_TOKEN);

// Export the bot so it can be used by other modules
export { bot };

// Register middleware
bot.use(session());

// Register command handlers
bot.start(handleStart);
bot.help((ctx) =>
  ctx.reply("Use /start to begin or tap on any of the buttons to navigate.")
);

// Register callback query handler
bot.on("callback_query", handleCallbackQuery);

// Register message handler
bot.on("message", handleMessage);

// Register error handler
bot.catch((err: unknown, ctx) => {
  console.error(`Error for ${ctx.updateType}:`, err);

  try {
    // Send a user-friendly error message
    ctx
      .reply(
        "Sorry, there was an issue processing your request. Please try using the /start command to restart the bot."
      )
      .catch((sendErr) => {
        console.error("Failed to send error message:", sendErr);
      });

    // If this is a database-related error, log more detailed info
    if (
      typeof err === "object" &&
      err !== null &&
      "message" in err &&
      typeof err.message === "string" &&
      (err.message.includes("not found") ||
        err.message.includes("database") ||
        err.message.includes("SQLITE"))
    ) {
      console.error("Database related error:", err.message);

      // Try to create user if this is a user not found error
      if (err.message.includes("User with ID") && ctx.from) {
        const userId = ctx.from.id;
        console.log(`Attempting to recover by creating user ${userId}`);

        import("./types").then(({ EntryPoint }) => {
          database
            .createUser(
              userId,
              EntryPoint.DEFAULT,
              ctx.from?.username,
              ctx.from?.first_name,
              ctx.from?.last_name
            )
            .catch((createErr) => {
              console.error(
                "Failed to create user during recovery:",
                createErr
              );
            });
        });
      }
    }
  } catch (handlerErr) {
    console.error("Error in error handler:", handlerErr);
  }
});

// Start the bot
export function startBot() {
  console.log("Starting bot...");

  if (USE_WEBHOOK) {
    // Set up webhook for production
    bot
      .launch({
        webhook: {
          domain: WEBHOOK_DOMAIN,
          port: WEBHOOK_PORT,
        },
      })
      .then(() => {
        console.log(`Bot started with webhook on port ${WEBHOOK_PORT}`);
      })
      .catch((err) => {
        console.error("Failed to start bot with webhook:", err);
      });
  } else {
    // Use polling for development
    bot
      .launch()
      .then(() => {
        console.log("Bot started with polling");
      })
      .catch((err) => {
        console.error("Failed to start bot with polling:", err);
      });
  }

  // Enable graceful stop
  process.once("SIGINT", () => {
    bot.stop("SIGINT");
    database.closeConnection();
  });
  process.once("SIGTERM", () => {
    bot.stop("SIGTERM");
    database.closeConnection();
  });
}
