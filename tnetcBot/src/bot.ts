import { Telegraf } from 'telegraf';
import { handleStartCommand, handleCallbackQuery } from './handlers';
import { schedulerService } from './services';
import { BOT_TOKEN } from './config';

// Create bot instance
const bot = new Telegraf(BOT_TOKEN);

// Initialize services
schedulerService.init(bot);

// Register command handlers
bot.start(handleStartCommand);
bot.help(ctx => {
  ctx.reply(
    "Welcome to the TNETC Trading Bot!\n\n" +
    "Use /start to begin exploring our trading services.\n" +
    "We offer premium trading signals, VIP packages, and more!"
  );
});

// Register callback query handler
bot.on('callback_query', handleCallbackQuery);

// Register error handler
bot.catch((err, ctx) => {
  console.error(`Error for ${ctx.updateType}:`, err);
  ctx.reply('An error occurred while processing your request. Please try again later.');
});

export default bot; 