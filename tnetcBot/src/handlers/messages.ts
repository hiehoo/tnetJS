import { Context } from 'telegraf';
import { database } from '../services';
import { EntryPoint, UserState } from '../types';
import { Helpers, KeyboardUtils, MessageTemplates } from '../utils';

/**
 * Handle incoming text messages
 */
export async function handleMessage(ctx: Context): Promise<void> {
  if (!ctx.message || !('text' in ctx.message) || !ctx.from) return;
  
  const messageText = ctx.message.text;
  const userId = ctx.from.id;
  
  try {
    // Get or create user
    let user;
    try {
      user = await database.getUser(userId);
    } catch (error) {
      // If user doesn't exist, handle as new user
      if (error instanceof Error && error.message.includes('not found')) {
        // Determine entry point from message if possible
        const entryPoint = Helpers.getEntryPointFromMessage(messageText);
        
        // Create new user
        user = await database.createUser(
          userId,
          entryPoint,
          ctx.from.username,
          ctx.from.first_name,
          ctx.from.last_name
        );
        
        // Send welcome message
        const welcomeMessage = MessageTemplates.getWelcomeMessage(user);
        const servicesKeyboard = KeyboardUtils.getServicesKeyboard();
        await ctx.replyWithMarkdown(welcomeMessage, servicesKeyboard);
        
        // Update user state
        await database.updateUser(userId, {
          state: UserState.WELCOME_SHOWN,
          lastActive: new Date()
        });
        
        return;
      } else {
        throw error; // Re-throw if it's a different error
      }
    }
    
    // Handle based on user state and message content
    if (messageText.startsWith('/')) {
      // Handle commands that aren't caught by the command handlers
      if (messageText === '/services') {
        if (user) {
          const welcomeMessage = MessageTemplates.getWelcomeMessage(user);
          const servicesKeyboard = KeyboardUtils.getServicesKeyboard();
          await ctx.replyWithMarkdown(welcomeMessage, servicesKeyboard);
        } else {
          await ctx.reply('Please try using the /start command first.');
        }
      } else if (messageText === '/help') {
        await ctx.reply('Use /start to begin exploring our trading services.');
      }
    } else {
      // Handle regular messages - for now, just prompt them to use commands
      await ctx.reply(
        "I can help you explore our trading services. Please use /start to view available options."
      );
    }
    
    // Update user's last active timestamp
    await database.updateUser(userId, {
      lastActive: new Date()
    });
    
  } catch (error) {
    console.error('Error handling message:', error);
    await ctx.reply('Sorry, there was an error processing your message. Please try using the /start command.');
  }
} 