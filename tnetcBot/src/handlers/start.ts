import { Context } from "telegraf";
import { handleWelcomeFlow } from "../flows/welcome";
import { Helpers } from "../utils";
import { EntryPoint } from "../types";
import { database } from "../services";

/**
 * Handle the /start command
 */
export async function handleStart(ctx: Context): Promise<void> {
  if (!ctx.from) return;

  try {
    // Try to extract entry point from command if given
    const messageText =
      ctx.message && "text" in ctx.message ? ctx.message.text : "/start";
    const entryPoint = Helpers.getEntryPointFromMessage(messageText);

    // Handle the welcome flow
    await handleWelcomeFlow(ctx);
  } catch (error) {
    console.error("Error in start command:", error);
    await ctx.reply(
      "Welcome to TNETC Trading! Please try using the /start command again."
    );
  }
}

/**
 * Handle the /start command with entry point
 */
export async function handleStartWithEntryPoint(
  ctx: Context,
  entryPoint: EntryPoint
): Promise<void> {
  if (!ctx.from) return;

  try {
    // Update or create user with the specified entry point
    const userId = ctx.from.id;
    console.log("userId", userId);

    // Create or update user with this entry point
    let user;
    try {
      user = await database.getUser(userId);

      if (user) {
        // Update existing user's entry point
        await database.updateUser(userId, { entryPoint });
      }
    } catch (error) {
      // Create new user if not found
      console.log(
        `Creating new user for ID ${userId} from start command with entry point ${entryPoint}`
      );
      user = await database.createUser(
        userId,
        entryPoint,
        ctx.from.username,
        ctx.from.first_name,
        ctx.from.last_name
      );
    }

    // Call welcome flow
    await handleWelcomeFlow(ctx);
  } catch (error) {
    console.error(
      `Error in start command with entry point ${entryPoint}:`,
      error
    );
    await ctx.reply(
      "Welcome to TNETC Trading! Please try using the /start command again."
    );
  }
}
