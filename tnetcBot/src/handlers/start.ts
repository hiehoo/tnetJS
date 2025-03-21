import { Context } from "telegraf";
import { handleWelcomeFlow } from "../flows/welcome";
import { EntryPoint } from "../types";

/**
 * Handle the /start command
 */
export async function handleStart(ctx: Context): Promise<void> {
  if (!ctx.from) return;

  try {
    // Try to extract entry point from command if given
    const messageText =
      ctx.message && "text" in ctx.message ? ctx.message.text : "/start";

    // Extract source parameter if any
    let source;
    if (messageText.startsWith("/start") && messageText.length > 6) {
      const parts = messageText.split(" ");
      if (parts.length > 1) {
        source = parts[1].trim();
      }
    }
    // Handle the welcome flow
    await handleWelcomeFlow(ctx, source as EntryPoint);
  } catch (error) {
    console.error("Error in start command:", error);
    await ctx.reply(
      "Welcome to TNETC Trading! Please try using the /start command again."
    );
  }
}
