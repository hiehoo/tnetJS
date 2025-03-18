import { Context } from 'telegraf';
import { database } from '../services';
import { EntryPoint, ServiceType } from '../types';
import { Helpers, KeyboardUtils, MessageTemplates } from '../utils';
import { handleServiceSelection, handleServiceResults, handleHowItWorks, handleServicePricing, handlePurchase } from '../flows/services';
import { Markup } from 'telegraf';

/**
 * Handle callback queries from inline buttons
 */
export async function handleCallbackQuery(ctx: Context): Promise<void> {
  // Ensure we have a callback query
  if (!ctx.callbackQuery || !('data' in ctx.callbackQuery)) return;
  
  // Parse callback data (format: action:param)
  const { action, param } = Helpers.parseCallbackData(ctx.callbackQuery.data);
  
  console.log(`Callback received: action=${action}, param=${param}`);  // Add logging

  // Answer the callback query to stop loading animation
  await ctx.answerCbQuery();

  try {
    // Ensure user exists in the database
    if (ctx.from) {
      const userId = ctx.from.id;
      let user;
      
      try {
        user = await database.getUser(userId);
      } catch (error) {
        // If user doesn't exist, create a new user record
        if (error instanceof Error && error.message.includes('not found')) {
          console.log(`Creating new user for ID ${userId} from callback`);
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

      // Handle specific actions
      switch (action) {
        // Retry welcome flow
        case 'retry_welcome':
          if (user) {
            const welcomeMessage = MessageTemplates.getWelcomeMessage(user);
            const servicesKeyboard = KeyboardUtils.getServicesKeyboard();
            await ctx.replyWithMarkdown(welcomeMessage, servicesKeyboard);
          }
          break;

        // Service selection
        case 'service':
          await handleServiceSelection(ctx, param as ServiceType);
          break;
        
        // Handle Signal service actions
        case 'signal':
          await handleSignalAction(ctx, param);
          break;
        
        // Handle VIP service actions
        case 'vip':
          await handleVIPAction(ctx, param);
          break;
        
        // Handle X10 Challenge actions
        case 'x10':
          await handleX10Action(ctx, param);
          break;
        
        // Handle Copytrade actions
        case 'copytrade':
          await handleCopytradeAction(ctx, param);
          break;
        
        // Handle back actions
        case 'back':
          await handleBackAction(ctx, param);
          break;
        
        // Handle results actions
        case 'results':
          await handleServiceResults(ctx, param as ServiceType);
          break;
        
        // Handle how it works actions
        case 'how':
          await handleHowItWorks(ctx, param as ServiceType);
          break;
        
        // Handle pricing actions
        case 'pricing':
          await handleServicePricing(ctx, param as ServiceType);
          break;
        
        // Handle buy actions
        case 'buy':
          await handlePurchase(ctx, param as ServiceType);
          break;
        
        // Handle main menu
        case 'menu':
          if (user) {
            const welcomeMessage = MessageTemplates.getWelcomeMessage(user);
            const servicesKeyboard = KeyboardUtils.getServicesKeyboard();
            await ctx.replyWithMarkdown(welcomeMessage, servicesKeyboard);
          }
          break;
        
        default:
          console.log(`Unhandled action: ${action}`);
          await ctx.reply(`Sorry, this feature (${action}) is not implemented yet.`);
      }
    }
  } catch (error) {
    console.error(`Error handling callback_query: ${error}`);
    
    // Provide a fallback response to the user
    await ctx.replyWithMarkdown(
      "Sorry, there was an issue processing your request. Please try using the /start command to restart the bot."
    );
  }
}

/**
 * Handle Signal service specific actions
 */
async function handleSignalAction(ctx: Context, action: string): Promise<void> {
  switch (action) {
    case 'results':
      await handleServiceResults(ctx, ServiceType.SIGNAL);
      break;
    
    case 'stats':
      await ctx.replyWithMarkdown('*📊 Signal Service Performance Stats*\n\nWin Rate: 92%\nAverage Monthly Return: 35-45%\nAverage Signal Accuracy: 97%');
      break;
    
    case 'examples':
      await ctx.replyWithMarkdown('*📱 Signal Examples*\n\nOur signals provide precise entry, take profit, and stop loss levels for each trade.');
      // Here you would normally send example images
      break;
    
    case 'pricing':
      await handleServicePricing(ctx, ServiceType.SIGNAL);
      break;
    
    default:
      await ctx.replyWithMarkdown('Select an option from the Signal service menu:');
      await ctx.reply('', KeyboardUtils.getSignalKeyboard());
  }
}

/**
 * Handle VIP service specific actions
 */
async function handleVIPAction(ctx: Context, action: string): Promise<void> {
  switch (action) {
    case 'benefits':
      await ctx.replyWithMarkdown('*🏆 VIP Benefits*\n\n• Priority access to all trading signals\n• Personal account manager\n• One-on-one trading consultation\n• Access to exclusive trading strategies\n• VIP trading community membership');
      break;
    
    case 'performance':
      await handleServiceResults(ctx, ServiceType.VIP);
      break;
    
    case 'features':
      await ctx.replyWithMarkdown('*🚀 Premium VIP Features*\n\n• 24/7 direct support line\n• Weekly market analysis calls\n• Custom trade plan development\n• Risk management consultation\n• Lifetime access to educational materials');
      break;
    
    case 'pricing':
      await handleServicePricing(ctx, ServiceType.VIP);
      break;
    
    default:
      await ctx.replyWithMarkdown('Select an option from the VIP service menu:');
      await ctx.reply('', KeyboardUtils.getVIPKeyboard());
  }
}

/**
 * Handle X10 Challenge specific actions
 */
async function handleX10Action(ctx: Context, action: string): Promise<void> {
  switch (action) {
    case 'join':
      const joinMessage = '🚀 *Click here to join the X10 Challenge now!* 🚀\n\n[JOIN THE TNETC COMMUNITY](https://t.me/tnetccommunity/186)';
      await ctx.reply(joinMessage, { parse_mode: 'Markdown' });
      break;
    
    case 'details':
      await ctx.replyWithMarkdown('*🎯 X10 Challenge Details*\n\n• 10x your trading account in 30 days\n• Follow our expert traders\' signals\n• Complete trading plan provided\n• Daily support and guidance\n• Access to proprietary strategies');
      break;
    
    case 'success':
      await ctx.replyWithMarkdown('*📊 X10 Challenge Success Stories*\n\nJohn S. - "Started with $1,000, ended with $12,450 in just 28 days!"\n\nMaria L. - "The X10 Challenge helped me quit my job. I turned $2,500 into $27,800 in a month."\n\nDavid R. - "I was skeptical at first, but the results speak for themselves. $5,000 to $48,900 in 30 days."');
      break;
    
    case 'howItWorks':
      await handleHowItWorks(ctx, ServiceType.X10_CHALLENGE);
      break;
    
    default:
      await ctx.replyWithMarkdown('Select an option from the X10 Challenge menu:');
      await ctx.reply('', KeyboardUtils.getX10ChallengeKeyboard());
  }
}

/**
 * Handle Copytrade specific actions
 */
async function handleCopytradeAction(ctx: Context, action: string): Promise<void> {
  switch (action) {
    case 'results':
      await handleServiceResults(ctx, ServiceType.COPYTRADE);
      break;
    
    case 'stats':
      await ctx.replyWithMarkdown('*📊 Copytrade Performance Stats*\n\nAverage Monthly Return: 25-35%\nMaximum Drawdown: 8%\nTrading Frequency: 20-30 trades/month\nWin Rate: 89%');
      break;
    
    case 'start':
      await handleServicePricing(ctx, ServiceType.COPYTRADE);
      break;
    
    case 'howItWorks':
      await handleHowItWorks(ctx, ServiceType.COPYTRADE);
      break;
    
    default:
      await ctx.replyWithMarkdown('Select an option from the Copytrade menu:');
      await ctx.reply('', KeyboardUtils.getCopytradeKeyboard());
  }
}

/**
 * Handle back actions
 */
async function handleBackAction(ctx: Context, param: string): Promise<void> {
  if (param === 'services') {
    // Back to main services menu
    if (ctx.from) {
      const user = await database.getUser(ctx.from.id);
      if (user) {
        const welcomeMessage = MessageTemplates.getWelcomeMessage(user);
        const servicesKeyboard = KeyboardUtils.getServicesKeyboard();
        await ctx.replyWithMarkdown(welcomeMessage, servicesKeyboard);
      }
    }
  } else {
    // Back to specific service menu
    try {
      const serviceType = param as ServiceType;
      const serviceMessage = MessageTemplates.getServiceInfoMessage(serviceType);
      const keyboard = KeyboardUtils.getServiceKeyboard(serviceType);
      await ctx.replyWithMarkdown(serviceMessage, keyboard);
    } catch (error) {
      console.error(`Error handling back action: ${error}`);
      // Fallback to main services menu
      await ctx.reply('', KeyboardUtils.getServicesKeyboard());
    }
  }
} 