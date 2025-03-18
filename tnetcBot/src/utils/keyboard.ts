import { Markup } from 'telegraf';
import { InlineKeyboardButton, InlineKeyboardMarkup } from 'telegraf/typings/core/types/typegram';
import { ServiceType } from '../types';
import { SERVICES } from '../config';

/**
 * Utility to create various inline keyboard layouts for the bot
 */
export class KeyboardUtils {
  /**
   * Create a keyboard with all available services
   */
  static getServicesKeyboard() {
    const buttons: InlineKeyboardButton[][] = [];
    
    // Add X10 Challenge and Copytrade in the first row
    const row1 = [
      Markup.button.callback(
        `🚀 X10 CHALLENGE (${SERVICES[ServiceType.X10_CHALLENGE].limitedSlots} SLOTS LEFT)`, 
        `service:${ServiceType.X10_CHALLENGE}`
      )
    ];
    buttons.push(row1);

    // Add Signal service in the second row
    const row2 = [
      Markup.button.callback(
        `📱 PREMIUM SIGNALS (${SERVICES[ServiceType.SIGNAL].limitedTime})`, 
        `service:${ServiceType.SIGNAL}`
      ),
      Markup.button.callback(
        `💸 COPYTRADE (${SERVICES[ServiceType.COPYTRADE].limitedTime})`, 
        `service:${ServiceType.COPYTRADE}`
      )
    ];
    buttons.push(row2);

    // Add VIP package in the third row
    const row3 = [
      Markup.button.callback(
        `🏆 VIP PACKAGE (ONLY ${SERVICES[ServiceType.VIP].limitedSlots} SPOTS)`, 
        `service:${ServiceType.VIP}`
      )
    ];
    buttons.push(row3);

    return Markup.inlineKeyboard(buttons);
  }

  /**
   * Create a keyboard for Signal service
   */
  static getSignalKeyboard() {
    return Markup.inlineKeyboard([
      [
        Markup.button.callback('📈 View Signal Results', 'signal:results'),
        Markup.button.callback('📊 Signal Stats', 'signal:stats')
      ],
      [
        Markup.button.callback('📱 Signal Examples', 'signal:examples'),
        Markup.button.callback('💰 Pricing & Plans', 'signal:pricing')
      ],
      [
        Markup.button.callback('🔙 Back to Services', 'back:services')
      ]
    ]);
  }

  /**
   * Create a keyboard for VIP service
   */
  static getVIPKeyboard() {
    return Markup.inlineKeyboard([
      [
        Markup.button.callback('🏆 VIP Benefits', 'vip:benefits'),
        Markup.button.callback('📊 VIP Performance', 'vip:performance')
      ],
      [
        Markup.button.callback('🚀 Premium Features', 'vip:features'),
        Markup.button.callback('💰 Pricing & Access', 'vip:pricing')
      ],
      [
        Markup.button.callback('🔙 Back to Services', 'back:services')
      ]
    ]);
  }

  /**
   * Create a keyboard for X10 Challenge
   */
  static getX10ChallengeKeyboard() {
    return Markup.inlineKeyboard([
      [
        Markup.button.callback('🚀 JOIN CHALLENGE NOW! 🚀', 'x10:join')
      ],
      [
        Markup.button.callback('🎯 Challenge Details', 'x10:details'),
        Markup.button.callback('📊 Success Stories', 'x10:success')
      ],
      [
        Markup.button.callback('❓ How It Works', 'x10:howItWorks'),
        Markup.button.callback('🔙 Back to Services', 'back:services')
      ]
    ]);
  }

  /**
   * Create a keyboard for Copytrade service
   */
  static getCopytradeKeyboard() {
    return Markup.inlineKeyboard([
      [
        Markup.button.callback('📈 Copytrade Results', 'copytrade:results'),
        Markup.button.callback('📊 Performance Stats', 'copytrade:stats')
      ],
      [
        Markup.button.callback('💰 Start Earning', 'copytrade:start'),
        Markup.button.callback('❓ How It Works', 'copytrade:howItWorks')
      ],
      [
        Markup.button.callback('🔙 Back to Services', 'back:services')
      ]
    ]);
  }

  /**
   * Create a purchase keyboard for a service
   */
  static getPurchaseKeyboard(service: ServiceType) {
    const serviceInfo = SERVICES[service];
    
    const buttons = [
      [
        Markup.button.callback('💳 Buy Now', `buy:${service}`),
        Markup.button.callback('❓ Questions', `questions:${service}`)
      ],
      [
        Markup.button.callback('🔙 Back', `back:${service}`)
      ]
    ];

    // Add discount note if applicable
    if (serviceInfo.discountPrice) {
      const discountPercent = Math.round(
        ((serviceInfo.price - serviceInfo.discountPrice) / serviceInfo.price) * 100
      );
      
      const discountButton = Markup.button.callback(
        `🔥 ${discountPercent}% DISCOUNT - LIMITED TIME!`, 
        `discount:${service}`
      );
      
      buttons.unshift([discountButton]);
    }

    return Markup.inlineKeyboard(buttons);
  }

  /**
   * Get keyboard for a specific service
   */
  static getServiceKeyboard(service: ServiceType) {
    switch (service) {
      case ServiceType.SIGNAL:
        return this.getSignalKeyboard();
      case ServiceType.VIP:
        return this.getVIPKeyboard();
      case ServiceType.X10_CHALLENGE:
        return this.getX10ChallengeKeyboard();
      case ServiceType.COPYTRADE:
        return this.getCopytradeKeyboard();
      default:
        return this.getServicesKeyboard();
    }
  }

  /**
   * Create a confirmation keyboard
   */
  static getConfirmationKeyboard(confirmAction: string, cancelAction: string) {
    return Markup.inlineKeyboard([
      [
        Markup.button.callback('✅ Yes', confirmAction),
        Markup.button.callback('❌ No', cancelAction)
      ]
    ]);
  }

  /**
   * Build service details keyboard
   */
  static getServiceDetailsKeyboard(service: ServiceType) {
    const buttons = [];
    
    switch (service) {
      case ServiceType.SIGNAL:
        buttons.push([
          Markup.button.callback('📊 See Results', `results:${service}`),
          Markup.button.callback('ℹ️ How It Works', `how:${service}`)
        ]);
        
        buttons.push([
          Markup.button.callback('💰 Pricing & Purchase', `pricing:${service}`),
          Markup.button.callback('🏠 Main Menu', 'menu')
        ]);
        break;
      
      case ServiceType.VIP:
        buttons.push([
          Markup.button.callback('📊 See Results', `results:${service}`),
          Markup.button.callback('ℹ️ How It Works', `how:${service}`)
        ]);
        
        buttons.push([
          Markup.button.callback('💰 Pricing & Purchase', `pricing:${service}`),
          Markup.button.callback('🏠 Main Menu', 'menu')
        ]);
        break;
        
      case ServiceType.X10_CHALLENGE:
        buttons.push([
          Markup.button.callback('📊 See Results', `results:${service}`),
          Markup.button.callback('ℹ️ How It Works', `how:${service}`)
        ]);
        
        buttons.push([
          Markup.button.callback('💰 Pricing & Purchase', `pricing:${service}`),
          Markup.button.callback('🏠 Main Menu', 'menu')
        ]);
        break;
        
      case ServiceType.COPYTRADE:
        buttons.push([
          Markup.button.callback('📊 See Results', `results:${service}`),
          Markup.button.callback('ℹ️ How It Works', `how:${service}`)
        ]);
        
        buttons.push([
          Markup.button.callback('💰 Pricing & Purchase', `pricing:${service}`),
          Markup.button.callback('🏠 Main Menu', 'menu')
        ]);
        break;
    }

    return Markup.inlineKeyboard(buttons);
  }
} 