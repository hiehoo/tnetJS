import { Telegraf } from 'telegraf';
import { handleCallbackQuery } from './handlers/callbacks';
import { database } from './services';
import { BOT_TOKEN } from './config';
import { EntryPoint } from './types';
import { startBot } from './bot';

console.log('Starting TNETC Trading Bot...');

// Initialize the bot
const bot = new Telegraf(BOT_TOKEN);

// Register command handlers
bot.start(async (ctx) => {
  if (!ctx.from) return;
  
  try {
    // Create or get user
    const userId = ctx.from.id;
    let user;
    
    try {
      // Try to get existing user
      user = await database.getUser(userId);
    } catch (error) {
      // Create new user if not found
      console.log(`Creating new user for ID ${userId} on start command`);
      user = await database.createUser(
        userId,
        EntryPoint.DEFAULT,
        ctx.from.username,
        ctx.from.first_name,
        ctx.from.last_name
      );
    }
    
    // Send welcome message
    const { KeyboardUtils, MessageTemplates } = await import('./utils');
    
    if (user) {
      const welcomeMessage = MessageTemplates.getWelcomeMessage(user);
      const servicesKeyboard = KeyboardUtils.getServicesKeyboard();
      
      await ctx.replyWithMarkdown(welcomeMessage, servicesKeyboard);
    } else {
      // Fallback if user is somehow undefined
      await ctx.reply('Welcome to TNETC Trading! Please try again in a moment.');
    }
    
  } catch (error) {
    console.error('Error in start command:', error);
    await ctx.reply('Welcome to TNETC Trading! Please try using the /start command again.');
  }
});

bot.help(ctx => ctx.reply('Use /start to begin exploring our trading services.'));

// Register callback query handler
bot.on('callback_query', handleCallbackQuery);

// Register error handler
bot.catch((err: unknown, ctx) => {
  console.error(`Error for ${ctx.updateType}:`, err);
  
  try {
    // Send a user-friendly error message
    ctx.reply(
      "Sorry, there was an issue processing your request. Please try using the /start command to restart the bot."
    ).catch(sendErr => {
      console.error('Failed to send error message:', sendErr);
    });
    
    // If this is a database-related error, log more detailed info
    if (typeof err === 'object' && err !== null && 'message' in err && typeof err.message === 'string' && (
      err.message.includes('not found') || 
      err.message.includes('database') ||
      err.message.includes('SQLITE')
    )) {
      console.error('Database related error:', err.message);
      
      // Try to create user if this is a user not found error
      if (err.message.includes('User with ID') && ctx.from) {
        const userId = ctx.from.id;
        console.log(`Attempting to recover by creating user ${userId}`);
        
        import('./types').then(({ EntryPoint }) => {
          database.createUser(
            userId, 
            EntryPoint.DEFAULT,
            ctx.from?.username,
            ctx.from?.first_name,
            ctx.from?.last_name
          ).catch(createErr => {
            console.error('Failed to create user during recovery:', createErr);
          });
        });
      }
    }
  } catch (handlerErr) {
    console.error('Error in error handler:', handlerErr);
  }
});

// Start the bot
startBot();

// Enable graceful stop
process.once('SIGINT', () => {
  console.log('Bot stopping due to SIGINT');
  bot.stop('SIGINT');
});

process.once('SIGTERM', () => {
  console.log('Bot stopping due to SIGTERM');
  bot.stop('SIGTERM');
}); 