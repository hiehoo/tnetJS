import { Context } from 'telegraf';
import { handleWelcomeFlow } from '../flows';
import { Helpers } from '../utils';
import { EntryPoint } from '../types';

/**
 * Handle the /start command
 */
export async function handleStartCommand(ctx: Context): Promise<void> {
  // Extract the message text from context
  const message = ctx.message && 'text' in ctx.message ? ctx.message.text : '/start';
  
  // Extract entry point from the message (if any)
  const entryPoint = Helpers.getEntryPointFromMessage(message);
  
  // Handle the welcome flow
  await handleWelcomeFlow(ctx, entryPoint);
} 