import { ServiceType, EntryPoint, UserData } from '../types';
import { SERVICES } from '../config';

/**
 * Utility for message templates
 */
export class MessageTemplates {
  /**
   * Generate welcome message based on entry point
   */
  static getWelcomeMessage(user: UserData): string {
    let message = '';
    const firstName = user.firstName || 'there';

    // Common greeting header
    const greeting = `👋 *Welcome ${firstName}!* 👋\n\n`;

    // Always use the default welcome message
    message = greeting;
    message += `*🔥 Welcome to TNETC Trading's EXCLUSIVE Community! 🔥*\n\n`;
    message += `You've just discovered what the top 1% of traders DON'T want you to know. Our members are silently making consistent profits while others struggle.\n\n`;
    message += `*⚠️ LIMITED-TIME OPPORTUNITIES:*\n\n`;
    message += `*🚀 X10 CHALLENGE - ALMOST SOLD OUT!*\n`;
    message += `• 10X your account in just 66 days (proven strategy)\n`;
    message += `• *ONLY ${SERVICES[ServiceType.X10_CHALLENGE].limitedSlots} SLOTS LEFT* out of 100\n`;
    message += `• *$350 VALUE → $0 (FREE)* - Offer ends this week!\n\n`;
    message += `*💰 LIFETIME COPYTRADE - NEVER OFFERED AGAIN*\n`;
    message += `• Automated profits without lifting a finger\n`;
    message += `• Members already making $500-$2500/week\n`;
    message += `• *$500 VALUE → $0 (FREE LIFETIME)* - ${SERVICES[ServiceType.COPYTRADE].limitedTime}!\n\n`;
    message += `*💎 PREMIUM VIP PACKAGE - EXCLUSIVE ACCESS*\n`;
    message += `• Our most elite package (94% win rate last month)\n`;
    message += `• Members reporting 40%+ monthly returns\n`;
    message += `• *ONLY ${SERVICES[ServiceType.VIP].limitedSlots} SPOTS* available at current pricing\n\n`;
    message += `*⏰ Which opportunity will you grab before it's gone?*`;

    return message;
  }

  /**
   * Generate service information message
   */
  static getServiceInfoMessage(service: ServiceType): string {
    const serviceInfo = SERVICES[service];
    let message = '';

    switch (service) {
      case ServiceType.SIGNAL:
        message = `📱 *PREMIUM FOREX SIGNALS* 📱\n\n`;
        message += `Receive high-probability trading signals with a *verified 92% win rate* delivered directly to your phone!\n\n`;
        message += `💵 *Start profiting from the markets today!* 💵\n\n`;
        message += `✅ ${serviceInfo.features.slice(0, 4).join('\n✅ ')}\n\n`;
        message += `*OFFER ENDS THIS WEEK - Limited time discount available!*\n\n`;
        message += `Select an option below to learn more:`;
        break;
        
      case ServiceType.VIP:
        message = `🏆 *PREMIUM VIP PACKAGE* 🏆\n\n`;
        message += `Get access to our COMPLETE trading ecosystem with *EA bot, signals, and exclusive community* all in one package!\n\n`;
        message += `👑 *For serious traders who want MAXIMUM results!* 👑\n\n`;
        message += `✅ ${serviceInfo.features.slice(0, 4).join('\n✅ ')}\n\n`;
        message += `*ONLY ${serviceInfo.limitedSlots} VIP SPOTS AVAILABLE!*\n\n`;
        message += `Select an option below to learn more:`;
        break;
        
      case ServiceType.X10_CHALLENGE:
        message = `🚀 *X10 CHALLENGE* 🚀\n\n`;
        message += `Join our exclusive challenge and follow our expert signals to multiply your trading account by *10X in just 30 days*!\n\n`;
        message += `📈 *Transform your trading results immediately!* 📈\n\n`;
        message += `✅ ${serviceInfo.features.slice(0, 4).join('\n✅ ')}\n\n`;
        message += `*ONLY ${serviceInfo.limitedSlots} SPOTS LEFT for this round of the challenge!*\n\n`;
        message += `Select an option below to learn more:`;
        break;
        
      case ServiceType.COPYTRADE:
        message = `💸 *COPYTRADE SERVICE* 💸\n\n`;
        message += `Let our expert traders do all the work! Our copytrade service *automatically copies our trades* to your account for truly passive income.\n\n`;
        message += `🛌 *Make money while you sleep!* 🛌\n\n`;
        message += `✅ ${serviceInfo.features.slice(0, 4).join('\n✅ ')}\n\n`;
        message += `*${serviceInfo.limitedTime} - Don't miss this opportunity!*\n\n`;
        message += `Select an option below to learn more:`;
        break;
    }

    return message;
  }

  /**
   * Generate pricing message for service
   */
  static getServicePricingMessage(service: ServiceType): string {
    const serviceInfo = SERVICES[service];
    let message = '';
    
    // Header
    message = `💰 *${serviceInfo.name} - PRICING* 💰\n\n`;
    
    // Price information
    if (serviceInfo.discountPrice) {
      const discountPercent = Math.round(
        ((serviceInfo.price - serviceInfo.discountPrice) / serviceInfo.price) * 100
      );
      
      message += `*SPECIAL OFFER:* ~$${serviceInfo.price}~ *$${serviceInfo.discountPrice}* (${discountPercent}% OFF!)\n\n`;
      
      if (serviceInfo.limitedTime) {
        message += `⏱️ *This offer expires in ${serviceInfo.limitedTime}!*\n\n`;
      }
      
      if (serviceInfo.limitedSlots) {
        message += `🔥 *Only ${serviceInfo.limitedSlots} spots available at this price!*\n\n`;
      }
    } else {
      message += `*PRICE:* $${serviceInfo.price}\n\n`;
    }
    
    // Features
    message += `*What's Included:*\n`;
    serviceInfo.features.forEach(feature => {
      message += `✅ ${feature}\n`;
    });
    message += '\n';
    
    // FOMO and call to action
    message += `🚨 *Traders who joined last week are already seeing amazing results!* 🚨\n\n`;
    message += `Secure your spot now before prices increase:`;
    
    return message;
  }

  /**
   * Generate "how it works" message
   */
  static getHowItWorksMessage(service: ServiceType): string {
    let message = '';
    
    switch (service) {
      case ServiceType.SIGNAL:
        message = `📱 *HOW OUR SIGNAL SERVICE WORKS* 📱\n\n`;
        message += `Our signal service provides you with precise entry/exit points:\n\n`;
        message += `1️⃣ *Join:* Get access to our private signals channel\n\n`;
        message += `2️⃣ *Receive:* Get 5-10 high-quality signals daily\n\n`;
        message += `3️⃣ *Trade:* Follow our detailed instructions for each trade\n\n`;
        message += `4️⃣ *Profit:* Enjoy consistent profits with 92% accuracy\n\n`;
        message += `Each signal includes entry price, stop loss, take profit levels, and risk management advice.\n\n`;
        message += `*Ready to start receiving winning signals?*`;
        break;
        
      case ServiceType.VIP:
        message = `🏆 *HOW THE VIP PACKAGE WORKS* 🏆\n\n`;
        message += `The VIP Package gives you complete access to our trading ecosystem:\n\n`;
        message += `1️⃣ *All-in-One:* Get the EA bot AND premium signals\n\n`;
        message += `2️⃣ *Community:* Join our exclusive VIP trading group\n\n`;
        message += `3️⃣ *Learn:* Access weekly live sessions with our experts\n\n`;
        message += `4️⃣ *Support:* Receive priority 24/7 support\n\n`;
        message += `VIP members receive everything they need to maximize their trading success in one comprehensive package.\n\n`;
        message += `*Ready for the ultimate trading experience?*`;
        break;
        
      case ServiceType.X10_CHALLENGE:
        message = `*🔥 X10 CHALLENGE - FINAL 17 SPOTS AVAILABLE! 🔥*\n\n`;
        message += `*⚠️ WARNING: This offer is closing THIS WEEK ⚠️*\n\n`;
        message += `Our exclusive X10 Challenge has helped members achieve incredible results:\n\n`;
        message += `✅ Previous challenge: *10X account growth in just 66 days*\n`;
        message += `✅ Members reporting $500-$3,000+ profits weekly\n`;
        message += `✅ Step-by-step guidance from professional traders\n`;
        message += `✅ Proven strategy with 94% win rate\n\n`;
        message += `*WHAT YOU GET:*\n`;
        message += `• Access to exclusive challenge group\n`;
        message += `• Premium signals (not available elsewhere)\n`;
        message += `• 1-on-1 strategy coaching\n`;
        message += `• Daily trade opportunities\n\n`;
        message += `*ORIGINAL PRICE: $350*\n`;
        message += `*CURRENT PRICE: $0 (FREE)*\n\n`;
        message += `*⏰ ONLY 17 SPOTS REMAIN - OFFER ENDS THIS WEEK!*\n`;
        message += `Our last batch of members filled within 24 hours. Don't miss this opportunity!`;
        break;
        
      case ServiceType.COPYTRADE:
        message = `*🔥 TNETC Copytrade Plan - FREE! 🔥*\n\n`;
        message += `Our Copytrade Plan is perfect for those who want to earn from trading without having to trade themselves.\n\n`;
        message += `*What's Included:*\n`;
        message += `✅ Copy trade us on Puprime - we handle everything\n`;
        message += `✅ 1-on-1 account setup support\n`;
        message += `✅ Weekly performance reports\n`;
        message += `✅ Perfect for beginners - no trading knowledge needed\n\n`;
        message += `*Limited Time Offer:*\n`;
        message += `• Regular Price: $500 (lifetime access)\n`;
        message += `• Current Promotion: FREE!\n\n`;
        message += `To get started with our Copytrade Plan, contact our support team using the button below.`;
        break;
    }
    
    return message;
  }

  /**
   * Generate purchase completion message
   */
  static getPurchaseCompletionMessage(service: ServiceType): string {
    let message = '';
    const serviceInfo = SERVICES[service];
    
    message = `🎉 *CONGRATULATIONS!* 🎉\n\n`;
    message += `You've successfully purchased our *${serviceInfo.name}*!\n\n`;
    
    // Setup instructions
    message += `*NEXT STEPS:*\n\n`;
    
    switch (service) {
      case ServiceType.SIGNAL:
        message += `1️⃣ You'll receive an invite to our private signals channel within 1 hour\n`;
        message += `2️⃣ Download our recommended broker (if needed)\n`;
        message += `3️⃣ Review the signal trading guide (sent to your email)\n`;
        message += `4️⃣ Start trading with our signals today!\n\n`;
        break;
        
      case ServiceType.VIP:
        message += `1️⃣ Check your email for complete access instructions\n`;
        message += `2️⃣ You'll receive invites to all VIP channels within 1 hour\n`;
        message += `3️⃣ Download and set up your EA Bot\n`;
        message += `4️⃣ Join our next live trading session (schedule in your email)\n\n`;
        break;
        
      case ServiceType.X10_CHALLENGE:
        message += `1️⃣ You'll receive an invite to our challenge group within 1 hour\n`;
        message += `2️⃣ Review the challenge rules and strategies (sent to your email)\n`;
        message += `3️⃣ Prepare your trading account (minimum $1,000 recommended)\n`;
        message += `4️⃣ The challenge starts tomorrow - get ready!\n\n`;
        break;
        
      case ServiceType.COPYTRADE:
        message += `1️⃣ Check your email for setup instructions\n`;
        message += `2️⃣ Follow the guide to connect your trading account\n`;
        message += `3️⃣ Set your risk parameters as recommended\n`;
        message += `4️⃣ Our team will verify your setup and activate copying within 24 hours\n\n`;
        break;
    }
    
    message += `*Our support team will contact you shortly to ensure smooth setup!*\n\n`;
    message += `If you have any questions, please don't hesitate to reach out.`;
    
    return message;
  }
} 