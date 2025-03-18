import { Context } from 'telegraf';
import { database } from '../services';
import { EntryPoint, UserState, UserData } from '../types';
import { KeyboardUtils, MessageTemplates } from '../utils';
import { SERVICES } from '../config';

/**
 * Handle the /start command
 */
export async function handleStart(ctx: Context): Promise<void> {
  if (!ctx.from) return;
  
  try {
    // Create or get user
    const userId = ctx.from.id;
    let user: UserData | undefined;
    
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
    
    // Ensure user exists before proceeding
    if (!user) {
      console.error(`Unable to get or create user with ID ${userId}`);
      await ctx.reply('Welcome to TNETC Trading! Please try using the /start command again.');
      return;
    }
    
    // Check if user has purchased any services
    if (user.purchasedServices && user.purchasedServices.length > 0) {
      // User has purchased services - show different message
      await ctx.replyWithMarkdown('You have already purchased the following services:');
      
      for (const service of user.purchasedServices) {
        await ctx.replyWithMarkdown(`• ${SERVICES[service].name}`);
      }
    } else {
      // User hasn't purchased any services - show services menu
      const welcomeMessage = MessageTemplates.getWelcomeMessage(user);
      const servicesKeyboard = KeyboardUtils.getServicesKeyboard();
      await ctx.replyWithMarkdown(welcomeMessage, servicesKeyboard);
    }
    
    // Update user state
    await database.updateUser(userId, { 
      state: UserState.WELCOME_SHOWN,
      lastActive: new Date()
    });
  } catch (error) {
    console.error('Error in start command:', error);
    await ctx.reply('Welcome to TNETC Trading! Please try using the /start command again.');
  }
}

// Handle command: /services
export async function handleServicesCommand(ctx: any) {
  if (!ctx.from) return;
  
  const userId = ctx.from.id;
  
  try {
    // Get or create user
    let user = await database.getUser(userId);
    
    if (!user) {
      // Create new user if not exists
      console.log(`Creating new user for ID ${userId} from services command`);
      user = await database.createUser(
        userId,
        EntryPoint.DEFAULT,
        ctx.from.username,
        ctx.from.first_name,
        ctx.from.last_name
      );
    }
    
    // Ensure user exists before proceeding
    if (!user) {
      console.error(`Unable to get or create user with ID ${userId}`);
      await ctx.reply('An error occurred while processing the services command.');
      return;
    }
    
    // Check if user has purchased any services
    if (user.purchasedServices && user.purchasedServices.length > 0) {
      // User has purchased services - show different message
      await ctx.replyWithMarkdown('You have already purchased the following services:');
      
      for (const service of user.purchasedServices) {
        await ctx.replyWithMarkdown(`• ${SERVICES[service].name}`);
      }
    } else {
      // User hasn't purchased any services - show services menu
      const welcomeMessage = MessageTemplates.getWelcomeMessage(user);
      const servicesKeyboard = KeyboardUtils.getServicesKeyboard();
      await ctx.replyWithMarkdown(welcomeMessage, servicesKeyboard);
    }
  } catch (error) {
    console.error('Error in services command:', error);
    await ctx.reply('An error occurred while processing the services command.');
  }
} 