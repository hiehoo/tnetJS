import { Context } from 'telegraf';
import { database } from '../services';
import { EntryPoint, UserState } from '../types';
import { KeyboardUtils, MessageTemplates } from '../utils';
import { Markup } from 'telegraf';

/**
 * Handle the welcome flow for new users
 */
export async function handleWelcomeFlow(ctx: Context): Promise<void> {
  try {
    // Ensure we have user information from the context
    if (!ctx.from) {
      console.error('Error in welcome flow: ctx.from is undefined');
      await ctx.reply('Welcome! Please try using the /start command again.');
      return;
    }
    
    const userId = ctx.from.id;
    
    // Try to get existing user or create new one if not found
    let user;
    try {
      try {
        user = await database.getUser(userId);
      } catch (error) {
        // If user doesn't exist, create a new one
        if (error instanceof Error && error.message.includes('not found')) {
          console.log(`Creating new user for ${userId}`);
          user = await database.createUser(
            userId,
            EntryPoint.DEFAULT,
            ctx.from.username,
            ctx.from.first_name,
            ctx.from.last_name
          );
        } else {
          throw error; // Re-throw if it's a different error
        }
      }
      
      if (user) {
        // Set user state to WELCOME_SHOWN
        await database.updateUser(userId, { 
          state: UserState.WELCOME_SHOWN,
          lastActive: new Date()
        });
        
        // Check if the user has already purchased services
        if (user.purchasedServices && user.purchasedServices.length > 0) {
          // If user already has purchased services, skip the welcome flow
          const purchasedMessage = MessageTemplates.getWelcomeMessage(user);
          await ctx.replyWithMarkdown(purchasedMessage);
          return;
        }
        
        // Send welcome message with services keyboard
        const welcomeMessage = MessageTemplates.getWelcomeMessage(user);
        const servicesKeyboard = KeyboardUtils.getServicesKeyboard();
        
        await ctx.replyWithMarkdown(welcomeMessage, servicesKeyboard);
      } else {
        throw new Error(`Failed to get or create user ${userId}`);
      }
      
    } catch (dbError) {
      console.error(`Database error in welcome flow for user ${userId}:`, dbError);
      
      // Send a fallback welcome message with basic info
      const fallbackMessage = 
        "👋 *Welcome to TNETC Trading!*\n\n" +
        "We're experiencing a technical issue right now. " +
        "Please try the following:\n\n" +
        "• Use the /start command again\n" +
        "• Contact our support if the issue persists\n\n" +
        "We apologize for the inconvenience!";
      
      const retryButton = Markup.inlineKeyboard([
        Markup.button.callback("🔄 Try Again", "retry_welcome")
      ]);
      
      await ctx.replyWithMarkdown(fallbackMessage, retryButton);
    }
  } catch (error) {
    console.error('Unexpected error in welcome flow:', error);
    await ctx.reply('Welcome! Something went wrong. Please try using the /start command again.');
  }
} 