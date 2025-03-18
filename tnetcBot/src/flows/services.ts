import { Context } from 'telegraf';
import { ServiceType, UserState, EntryPoint } from '../types';
import { database, testimonialService, schedulerService, statsService } from '../services';
import { KeyboardUtils, MessageTemplates, Helpers } from '../utils';
import { SERVICES } from '../config';

/**
 * Handle when a user selects a service
 */
export async function handleServiceSelection(ctx: Context, serviceType: ServiceType): Promise<void> {
  if (!ctx.from) return;
  
  const userId = ctx.from.id;
  
  try {
    // Check if user exists
    const user = await database.getUser(userId);
    
    if (!user) {
      // Create new user if not exists
      console.log(`Creating new user for ID ${userId} from service selection`);
      await database.createUser(
        userId,
        EntryPoint.DEFAULT,
        ctx.from.username,
        ctx.from.first_name,
        ctx.from.last_name
      );
    }
    
    // Update user with selected service
    await database.updateUser(userId, {
      selectedService: serviceType,
      state: UserState.SERVICE_SELECTED,
      lastActive: new Date()
    });
    
    // Get service info message and keyboard
    const serviceMessage = MessageTemplates.getServiceInfoMessage(serviceType);
    const keyboard = KeyboardUtils.getServiceKeyboard(serviceType);
    
    // Send service info message
    await ctx.replyWithMarkdown(serviceMessage, keyboard);
    
    // Schedule follow-up messages for later
    await schedulerService.scheduleFollowUp(userId, serviceType);
    
    // Randomly show testimonials after service selection (based on probability)
    const testimonials = testimonialService.getInfoTestimonials(serviceType);
    if (testimonials.length > 0) {
      // Add a small delay before sending testimonials
      setTimeout(async () => {
        try {
          const user = await database.getUser(userId);
          if (!user) return;
          
          // Send testimonials in batches of 3
          for (let i = 0; i < testimonials.length; i += 3) {
            const batch = testimonials.slice(i, i + 3);
            
            if (batch.length === 1) {
              // If only one testimonial, send with caption
              await ctx.replyWithPhoto({ source: batch[0].imagePath }, {
                caption: batch[0].caption,
                parse_mode: 'Markdown'
              });
            } else {
              // Send as a media group
              const mediaGroup = batch.map((testimonial, index) => ({
                type: 'photo' as const,
                media: { source: testimonial.imagePath },
                caption: testimonial.caption,
                parse_mode: 'Markdown' as const
              }));
              
              await ctx.replyWithMediaGroup(mediaGroup);
            }
            
            // Add a small delay between batches
            if (i + 3 < testimonials.length) {
              await new Promise(resolve => setTimeout(resolve, 1500));
            }
          }
          
          // Update testimonials count
          await database.updateUser(userId, { 
            testimonialsSent: (user.testimonialsSent || 0) + testimonials.length,
            state: UserState.TESTIMONIAL_SHOWN
          });
        } catch (err) {
          console.error('Error in testimonial flow:', err);
        }
      }, 2000);
    }
  } catch (error) {
    console.error(`Error handling service selection: ${error}`);
    // Send fallback message
    await ctx.replyWithMarkdown(
      "Sorry, there was an issue processing your service selection. Please try using the /start command to restart the bot."
    );
  }
}

/**
 * Handle when a user views service results
 */
export async function handleServiceResults(ctx: Context, service: ServiceType): Promise<void> {
  if (!ctx.from) return;
  
  const userId = ctx.from.id;
  
  // Update user state
  await database.updateUser(userId, {
    state: UserState.INFO_SHOWN,
    lastActive: new Date()
  });
  
  try {
    // Send message about results
    await ctx.replyWithMarkdown('*Check out these incredible results:* 📈');
    
    // Get result images from service config
    const serviceInfo = SERVICES[service];
    const resultImages = serviceInfo.resultImages || [];
    
    // Send images in batches of max 3
    if (resultImages.length > 0) {
      // Get available result images
      const availableImages = [];
      for (const imagePath of resultImages) {
        if (imagePath.includes(`${service}_results`)) {
          availableImages.push(imagePath);
        } else if (service === ServiceType.X10_CHALLENGE && imagePath.includes('x10_results')) {
          availableImages.push(imagePath);
        }
      }
      
      // If no specific images found, use generic ones
      if (availableImages.length === 0) {
        if (service === ServiceType.VIP || service === ServiceType.SIGNAL) {
          availableImages.push('assets/results/x10_results_1.jpg', 'assets/results/x10_results_2.jpg');
        } else {
          availableImages.push('assets/results/copytrade_results_1.jpg', 'assets/results/copytrade_results_2.jpg');
        }
      }
      
      // Send images in batch of 3
      for (let i = 0; i < availableImages.length; i += 3) {
        const batch = availableImages.slice(i, i + 3);
        const mediaGroup = batch.map((imagePath, index) => ({
          type: 'photo' as const,
          media: { source: imagePath },
          caption: index === 0 ? `Outstanding performance with our ${service} service!` : '',
          parse_mode: 'Markdown' as const
        }));
        
        await ctx.replyWithMediaGroup(mediaGroup);
        
        // Small delay between batches
        if (i + 3 < availableImages.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }
    
    // Send stats message
    const statsMessage = statsService.formatStatsMessage(service);
    await ctx.replyWithMarkdown(statsMessage);
    
    // Send FOMO message
    const serviceConfig = SERVICES[service];
    const spotsLeft = serviceConfig.limitedSlots || 17;
    await ctx.replyWithMarkdown(Helpers.getRemainingSpotsMessage(spotsLeft));
  } catch (err) {
    console.error('Error sending result images:', err);
    
    // Fallback to just stats message if images fail
    const statsMessage = statsService.formatStatsMessage(service);
    await ctx.replyWithMarkdown(statsMessage);
  }
}

/**
 * Handle when a user views service "how it works"
 */
export async function handleHowItWorks(ctx: Context, service: ServiceType): Promise<void> {
  if (!ctx.from) return;
  
  const userId = ctx.from.id;
  
  // Update user state
  await database.updateUser(userId, {
    state: UserState.INFO_SHOWN,
    lastActive: new Date()
  });
  
  // Get how it works message
  const message = MessageTemplates.getHowItWorksMessage(service);
  
  // Send message
  await ctx.replyWithMarkdown(message);
  
  // After a delay, send time-sensitive message
  setTimeout(async () => {
    await ctx.replyWithMarkdown(Helpers.getTimeRunningOutMessage());
  }, 3000);
}

/**
 * Handle when a user views service pricing
 */
export async function handleServicePricing(ctx: Context, service: ServiceType): Promise<void> {
  if (!ctx.from) return;
  
  const userId = ctx.from.id;
  
  // Update user state
  await database.updateUser(userId, {
    state: UserState.PRICING_SHOWN,
    lastActive: new Date()
  });
  
  // Get pricing message
  const message = MessageTemplates.getServicePricingMessage(service);
  
  // Get purchase keyboard
  const keyboard = KeyboardUtils.getPurchaseKeyboard(service);
  
  // Send message with purchase keyboard
  await ctx.replyWithMarkdown(message, keyboard);
}

/**
 * Handle when a user initiates purchase
 */
export async function handlePurchase(ctx: Context, service: ServiceType): Promise<void> {
  if (!ctx.from) return;
  
  const userId = ctx.from.id;
  const user = await database.getUser(userId);
  if (!user) return;
  
  // In a real-world scenario, this would integrate with a payment system
  // For this example, we'll just simulate a successful purchase
  
  // Create a copy of the purchased services array with fallback to empty array
  const purchasedServices = user.purchasedServices ? [...user.purchasedServices] : [];
  if (!purchasedServices.includes(service)) {
    purchasedServices.push(service);
  }
  
  // Update user state
  await database.updateUser(userId, {
    purchasedServices,
    state: UserState.PURCHASED,
    lastActive: new Date()
  });
  
  // Cancel any follow-ups for this service
  await schedulerService.cancelFollowUps(userId);
  
  // Send purchase completion message
  const message = MessageTemplates.getPurchaseCompletionMessage(service);
  await ctx.replyWithMarkdown(message);
  
  // Ask for referrals after a delay
  setTimeout(async () => {
    await ctx.replyWithMarkdown(
      "*Know someone who would benefit from our services?*\n\n" +
      "Refer a friend and you'll both receive a special bonus! " +
      "Just have them mention your username when they sign up."
    );
  }, 5000);
} 