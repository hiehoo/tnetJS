import { Telegraf } from 'telegraf';
import { ServiceType } from '../types';
import { FOLLOW_UP_TIMING, SERVICES } from '../config';
import { database, testimonialService } from './';
import { Helpers } from '../utils';

/**
 * Service to handle scheduling follow-up messages
 */
class SchedulerService {
  private bot: Telegraf | null = null;
  private followUpTimers: Map<string, NodeJS.Timeout> = new Map();

  /**
   * Initialize with Telegraf bot instance
   */
  init(bot: Telegraf): void {
    this.bot = bot;
  }

  /**
   * Schedule follow-up messages for a user
   */
  async scheduleFollowUp(userId: number, serviceType: ServiceType): Promise<void> {
    if (!this.bot) {
      console.warn('Scheduler not initialized with bot instance');
      return;
    }

    // Cancel any existing follow-ups for this user
    await this.cancelFollowUps(userId);

    // Schedule first follow-up
    const firstTimer = setTimeout(() => {
      this.sendFollowUpMessage(userId, serviceType, 1);
    }, FOLLOW_UP_TIMING.FIRST_MESSAGE * 60 * 60 * 1000);

    // Schedule second follow-up
    const secondTimer = setTimeout(() => {
      this.sendFollowUpMessage(userId, serviceType, 2);
    }, FOLLOW_UP_TIMING.SECOND_MESSAGE * 60 * 60 * 1000);

    // Schedule final follow-up
    const finalTimer = setTimeout(() => {
      this.sendFollowUpMessage(userId, serviceType, 3);
    }, FOLLOW_UP_TIMING.FINAL_MESSAGE * 60 * 60 * 1000);

    // Store timer references
    this.followUpTimers.set(`${userId}:1`, firstTimer);
    this.followUpTimers.set(`${userId}:2`, secondTimer);
    this.followUpTimers.set(`${userId}:3`, finalTimer);
  }

  /**
   * Cancel all follow-ups for a user
   */
  async cancelFollowUps(userId: number): Promise<void> {
    // Clear existing follow-up timers
    for (let i = 1; i <= 3; i++) {
      const key = `${userId}:${i}`;
      if (this.followUpTimers.has(key)) {
        clearTimeout(this.followUpTimers.get(key));
        this.followUpTimers.delete(key);
      }
    }

    // Mark all follow-ups as cancelled in the database
    await database.cancelAllFollowUps(userId);
  }

  /**
   * Send a follow-up message to a user
   */
  private async sendFollowUpMessage(userId: number, serviceType: ServiceType, messageNumber: number): Promise<void> {
    try {
      if (!this.bot) {
        console.warn('Scheduler not initialized with bot instance');
        return;
      }

      // Get user data
      const user = await database.getUser(userId);
      if (!user) return;

      // Check if user has already purchased this service
      if (user.purchasedServices && user.purchasedServices.includes(serviceType)) {
        console.log(`User ${userId} already purchased ${serviceType}. Not scheduling follow-ups.`);
        return;
      }

      // Get service info
      const service = SERVICES[serviceType];
      
      // Get testimonials for service
      const testimonials = testimonialService.getFollowUpTestimonials(serviceType);

      // Build message text
      let message = '';

      switch (messageNumber) {
        case 1:
          message = `Hey ${user.firstName || 'there'}, I noticed you were checking out our ${service.name}.\n\n`;
          message += `Just wanted to remind you that we only have ${service.limitedSlots || 'a few'} spots left! `;
          message += `Many traders are already benefiting from this service.\n\n`;
          message += `Would you like more information or have any questions about the ${service.name}?`;
          break;
        case 2:
          message = `Hi ${user.firstName || 'there'}! Quick update on our ${service.name}.\n\n`;
          message += `We've been getting a lot of interest and spots are filling up fast. `;
          message += `${service.limitedTime ? `This offer expires in ${service.limitedTime}` : 'This is a limited time offer'}.\n\n`;
          message += `Here's what some of our users are saying:`;
          break;
        case 3:
          message = `FINAL NOTICE: ${user.firstName || 'Hey trader'}, this is your last chance to secure the ${service.name}!\n\n`;
          message += `${service.limitedSlots ? `Only ${Math.max(2, service.limitedSlots - 3)} spots remaining` : 'Very limited spots remaining'}. `;
          message += `After that, the price will increase significantly.\n\n`;
          message += `Don't miss out on these incredible results:`;
          break;
      }

      // Send the message
      const sentMessage = await this.bot.telegram.sendMessage(userId, message);

      // Send testimonials if available (for messages 2 and 3)
      if (messageNumber >= 2 && testimonials.length > 0) {
        // Send testimonials in batches of 3
        for (let i = 0; i < testimonials.length; i += 3) {
          const batch = testimonials.slice(i, i + 3);
          
          if (batch.length === 1) {
            // If only one testimonial, send with caption
            await this.bot.telegram.sendPhoto(userId, { source: batch[0].imagePath }, {
              caption: batch[0].caption,
              parse_mode: 'Markdown'
            });
          } else {
            // Send as a media group
            const mediaGroup = batch.map(testimonial => ({
              type: 'photo' as const,
              media: { source: testimonial.imagePath },
              caption: testimonial.caption,
              parse_mode: 'Markdown' as const
            }));
            
            await this.bot.telegram.sendMediaGroup(userId, mediaGroup);
          }
          
          // Add a small delay between batches
          if (i + 3 < testimonials.length) {
            await new Promise(resolve => setTimeout(resolve, 1500));
          }
        }
      }

      // Record the follow-up
      await database.createFollowUp({
        userId,
        serviceType,
        messageNumber,
        sentAt: new Date(),
        messageId: sentMessage.message_id
      });
    } catch (err) {
      console.error(`Failed to send follow-up message: ${err}`);
    }
  }
}

// Singleton instance
export const schedulerService = new SchedulerService(); 