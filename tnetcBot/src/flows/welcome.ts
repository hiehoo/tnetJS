import { Context } from 'telegraf';
import { Message } from 'telegraf/typings/core/types/typegram';
import { EntryPoint, UserData, UserState } from '../types';
import { database } from '../services';
import { KeyboardUtils, MessageTemplates, Helpers } from '../utils';
import { testimonialService } from '../services/testimonials';

/**
 * Handle the welcome flow for new users
 */
export async function handleWelcomeFlow(ctx: Context, entryPoint: EntryPoint): Promise<void> {
  if (!ctx.from) return;

  const userId = ctx.from.id;
  const username = ctx.from.username;
  const firstName = ctx.from.first_name;
  const lastName = ctx.from.last_name;

  // Get or create user
  let user = await database.getUser(userId);
  if (!user) {
    user = await database.createUser(userId, entryPoint, username, firstName, lastName);
  } else {
    // Update entry point and reset state if the user is starting again
    await database.updateUser(userId, { 
      entryPoint, 
      state: UserState.NEW,
      lastActive: new Date()
    });
    user = await database.getUser(userId) as UserData;
  }

  // Send welcome message
  const welcomeMessage = MessageTemplates.getWelcomeMessage(user);
  const keyboard = KeyboardUtils.getServicesKeyboard();
  
  // Send welcome message with services keyboard
  await ctx.replyWithMarkdown(welcomeMessage, keyboard);

  // Update user state
  await database.updateUser(userId, { 
    state: UserState.WELCOME_SHOWN,
    lastActive: new Date()
  });

  // Randomly show testimonials after welcome (based on probability)
  const testimonials = testimonialService.getWelcomeTestimonials();
  if (testimonials.length > 0) {
    // Add a small delay before sending testimonials
    setTimeout(async () => {
      try {
        // Send a testimonial intro message
        await ctx.replyWithMarkdown('*Look at what our users are saying:* 👇');
        
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
          testimonialsSent: user.testimonialsSent + testimonials.length,
          state: UserState.TESTIMONIAL_SHOWN
        });
      } catch (err) {
        console.error('Error in testimonial flow:', err);
      }
    }, 3000);
  }
} 