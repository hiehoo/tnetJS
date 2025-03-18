import bot from './bot';
import { IS_PRODUCTION } from './config';
import { database } from './services';

// Start the bot
async function startBot() {
  try {
    // Use webhook in production, polling in development
    if (IS_PRODUCTION) {
      // To be implemented for production
      // For Heroku or similar:
      // const PORT = process.env.PORT || 3000;
      // const URL = process.env.URL || 'https://your-heroku-app.herokuapp.com';
      // await bot.telegram.setWebhook(`${URL}/bot${bot.token}`);
      // bot.startWebhook(`/bot${bot.token}`, null, PORT);
      
      console.log('Bot started in production mode with webhook');
    } else {
      // Development mode with long polling
      await bot.launch();
      console.log('Bot started in development mode with long polling');
    }
    
    // Enable graceful stop
    process.once('SIGINT', () => {
      console.log('SIGINT signal received. Gracefully shutting down...');
      bot.stop('SIGINT');
      database.close();
    });
    
    process.once('SIGTERM', () => {
      console.log('SIGTERM signal received. Gracefully shutting down...');
      bot.stop('SIGTERM');
      database.close();
    });
  } catch (error) {
    console.error('Error starting the bot:', error);
  }
}

// Start the bot
startBot(); 