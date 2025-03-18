import { Context } from 'telegraf';
import { ServiceType } from '../types';
import { Helpers, KeyboardUtils } from '../utils';
import { 
  handleServiceSelection,
  handleServiceResults,
  handleHowItWorks,
  handleServicePricing,
  handlePurchase
} from '../flows/services';

/**
 * Handle callback queries from inline buttons
 */
export async function handleCallbackQuery(ctx: Context): Promise<void> {
  // Ensure we have a callback query
  if (!ctx.callbackQuery || !('data' in ctx.callbackQuery)) return;
  
  // Parse callback data (format: action:param)
  const { action, param } = Helpers.parseCallbackData(ctx.callbackQuery.data);
  
  // Answer the callback query to stop loading animation
  await ctx.answerCbQuery();
  
  // Handle specific actions
  switch (action) {
    // Service selection
    case 'service':
      await handleServiceSelection(ctx, param as ServiceType);
      break;
    
    // Back to main service selection
    case 'back':
      if (param === 'services') {
        // Send services keyboard
        await ctx.editMessageReplyMarkup(KeyboardUtils.getServicesKeyboard().reply_markup);
      } else {
        // Back to specific service
        const serviceType = param as ServiceType;
        const keyboard = KeyboardUtils.getServiceKeyboard(serviceType);
        await ctx.editMessageReplyMarkup(keyboard.reply_markup);
      }
      break;
    
    // Service-specific actions
    case 'ea':
      // EA_BOT related handlers removed
      break;
      
    case 'signal':
      handleSignalAction(ctx, param);
      break;
      
    case 'vip':
      handleVIPAction(ctx, param);
      break;
      
    case 'x10':
      handleX10Action(ctx, param);
      break;
      
    case 'copytrade':
      handleCopytradeAction(ctx, param);
      break;
      
    // Purchase flow
    case 'buy':
      await handlePurchase(ctx, param as ServiceType);
      break;
      
    // Questions
    case 'questions':
      await ctx.replyWithMarkdown(
        "💬 *Have questions? We're here to help!*\n\n" +
        "Please ask any questions you have about our services and our team will respond shortly.\n\n" +
        "In the meantime, would you like to see some more testimonials from our satisfied users?"
      );
      break;
      
    // Discount info
    case 'discount':
      await ctx.replyWithMarkdown(
        "🔥 *LIMITED TIME DISCOUNT OFFER!* 🔥\n\n" +
        "You've clicked on a special discount offer that's only available for a short time!\n\n" +
        "This discounted price will expire soon, so we recommend securing your spot now before it returns to the regular price."
      );
      break;
  }
}

/**
 * Handle Signal service related actions
 */
function handleSignalAction(ctx: Context, param: string): void {
  switch (param) {
    case 'results':
      handleServiceResults(ctx, ServiceType.SIGNAL);
      // Send results image
      ctx.replyWithPhoto({ source: './assets/results/copytrade_results_1.jpg' });
      break;
    case 'stats':
      // Show signal stats
      ctx.replyWithMarkdown(
        "📊 *SIGNAL SERVICE PERFORMANCE STATS* 📊\n\n" +
        "✅ 92% Win Rate\n" +
        "✅ 5-10 Signals Every Day\n" +
        "✅ All Major Currency Pairs\n" +
        "✅ Detailed Entry/Exit Points\n\n" +
        "These results are based on verified signal performance."
      );
      break;
    case 'examples':
      // Show signal examples
      ctx.replyWithMarkdown(
        "📱 *SIGNAL EXAMPLE* 📱\n\n" +
        "❇️ *EURUSD BUY*\n" +
        "⏰ *Time:* 09:30 GMT\n" +
        "📍 *Entry:* 1.0850\n" +
        "🛑 *Stop Loss:* 1.0820\n" +
        "🎯 *Take Profit:* 1.0910\n" +
        "⚠️ *Risk:* 1% of account\n\n" +
        "This is just one example of the high-quality signals you'll receive daily."
      );
      break;
    case 'pricing':
      handleServicePricing(ctx, ServiceType.SIGNAL);
      break;
  }
}

/**
 * Handle VIP related actions
 */
function handleVIPAction(ctx: Context, param: string): void {
  switch (param) {
    case 'benefits':
      ctx.replyWithMarkdown(
        "🏆 *VIP PACKAGE BENEFITS* 🏆\n\n" +
        "✅ Full Access to EA Bot\n" +
        "✅ Premium Signal Service\n" +
        "✅ Exclusive VIP Community\n" +
        "✅ Weekly Live Trading Sessions\n" +
        "✅ Priority Support 24/7\n" +
        "✅ Custom Strategy Consultation\n\n" +
        "The VIP Package is our most comprehensive offering for serious traders."
      );
      // Add contact support message
      ctx.replyWithMarkdown(
        "💰 *GET VIP ACCESS NOW* 💰\n\n" +
        "To purchase the VIP package, please contact our support team for payment instructions:\n\n" +
        "[👉 CONTACT SUPPORT FOR PAYMENT 👈](https://t.me/m/DvGbHx0NZTFl)"
      );
      break;
    case 'performance':
      handleServiceResults(ctx, ServiceType.VIP);
      // Add contact support message
      ctx.replyWithMarkdown(
        "💰 *GET VIP ACCESS NOW* 💰\n\n" +
        "To purchase the VIP package, please contact our support team for payment instructions:\n\n" +
        "[👉 CONTACT SUPPORT FOR PAYMENT 👈](https://t.me/m/DvGbHx0NZTFl)"
      );
      break;
    case 'features':
      handleHowItWorks(ctx, ServiceType.VIP);
      // Add contact support message
      ctx.replyWithMarkdown(
        "💰 *GET VIP ACCESS NOW* 💰\n\n" +
        "To purchase the VIP package, please contact our support team for payment instructions:\n\n" +
        "[👉 CONTACT SUPPORT FOR PAYMENT 👈](https://t.me/m/DvGbHx0NZTFl)"
      );
      break;
    case 'pricing':
      handleServicePricing(ctx, ServiceType.VIP);
      // Add contact support message
      ctx.replyWithMarkdown(
        "💰 *GET VIP ACCESS NOW* 💰\n\n" +
        "To purchase the VIP package, please contact our support team for payment instructions:\n\n" +
        "[👉 CONTACT SUPPORT FOR PAYMENT 👈](https://t.me/m/DvGbHx0NZTFl)"
      );
      break;
  }
}

/**
 * Handle X10 Challenge related actions
 */
function handleX10Action(ctx: Context, param: string): void {
  switch (param) {
    case 'details':
      ctx.replyWithMarkdown(
        "🚀 *X10 CHALLENGE DETAILS* 🚀\n\n" +
        "The X10 Challenge is a 30-day program designed to multiply your trading account by 10 times:\n\n" +
        "✅ Daily trading signals specifically for the challenge\n" +
        "✅ Community of traders all working toward the same goal\n" +
        "✅ Performance tracking dashboard\n" +
        "✅ Risk management guidelines\n\n" +
        "Only 17 spots remaining for this round of the challenge!"
      );
      break;
    case 'success':
      handleServiceResults(ctx, ServiceType.X10_CHALLENGE);
      break;
    case 'howItWorks':
      handleHowItWorks(ctx, ServiceType.X10_CHALLENGE);
      break;
    case 'join':
      // Redirect user to the TNETC Community channel
      ctx.replyWithMarkdown(
        "🚀 *JOINING X10 CHALLENGE!* 🚀\n\n" +
        "You're being redirected to our exclusive TNETC Community channel to complete your registration.\n\n" +
        "Click the link below to join:\n" +
        "[👉 JOIN TNETC COMMUNITY CHANNEL 👈](https://t.me/tnetccommunity/186)"
      );
      break;
  }
}

/**
 * Handle Copytrade related actions
 */
function handleCopytradeAction(ctx: Context, param: string): void {
  switch (param) {
    case 'results':
      handleServiceResults(ctx, ServiceType.COPYTRADE);
      break;
    case 'stats':
      // Show copytrade stats
      ctx.replyWithMarkdown(
        "📊 *COPYTRADE PERFORMANCE STATS* 📊\n\n" +
        "✅ 85% Win Rate\n" +
        "✅ 32% Average Monthly Return\n" +
        "✅ Low-Medium Risk Profile\n" +
        "✅ $500 Minimum Investment\n\n" +
        "Our copytrade service offers truly passive income with minimal effort."
      );
      break;
    case 'howItWorks':
      handleHowItWorks(ctx, ServiceType.COPYTRADE);
      break;
    case 'start':
      // Redirect user to chat with support
      ctx.replyWithMarkdown(
        "🔥 *TNETC COPYTRADE SERVICE* 🔥\n\n" +
        "You're being redirected to our support team to set up your copytrade account.\n\n" +
        "Click the link below to chat with our support team:\n" +
        "[👉 CHAT WITH TNETC SUPPORT 👈](https://t.me/m/1Q0AzxOLNDY1)"
      );
      break;
  }
} 