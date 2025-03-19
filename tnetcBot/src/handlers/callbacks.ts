import { Context } from "telegraf";
import { database } from "../services";
import { EntryPoint, ServiceType } from "../types";
import { Helpers, KeyboardUtils, MessageTemplates } from "../utils";
import {
  handleServiceSelection,
  handleServiceResults,
  handleHowItWorks,
  handleServicePricing,
  handlePurchase,
} from "../flows/services";
import { Markup } from "telegraf";

/**
 * Handle callback queries from inline buttons
 */
export async function handleCallbackQuery(ctx: Context): Promise<void> {
  // Ensure we have a callback query
  if (!ctx.callbackQuery || !("data" in ctx.callbackQuery)) return;

  // Parse callback data (format: action:param)
  const { action, param } = Helpers.parseCallbackData(ctx.callbackQuery.data);

  console.log(`Callback received: action=${action}, param=${param}`); // Add logging

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
        if (error instanceof Error && error.message.includes("not found")) {
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
        case "retry_welcome":
          if (user) {
            const welcomeMessage = MessageTemplates.getWelcomeMessage(user);
            const servicesKeyboard = KeyboardUtils.getServicesKeyboard();
            await ctx.replyWithMarkdown(welcomeMessage, servicesKeyboard);
          }
          break;

        // Service selection
        case "service":
          await handleServiceSelection(ctx, param as ServiceType);
          break;

        // Handle Signal service actions
        case "signal":
          await handleSignalAction(ctx, param);
          break;

        // Handle VIP service actions
        case "vip":
          await handleVIPAction(ctx, param);
          break;

        // Handle X10 Challenge actions
        case "x10":
          await handleX10Action(ctx, param);
          break;

        // Handle Copytrade actions
        case "copytrade":
          await handleCopytradeAction(ctx, param);
          break;

        // Handle back actions
        case "back":
          await handleBackAction(ctx, param);
          break;

        // Handle results actions
        case "results":
          await handleServiceResults(ctx, param as ServiceType);
          break;

        // Handle how it works actions
        case "how":
          await handleHowItWorks(ctx, param as ServiceType);
          break;

        // Handle pricing actions
        case "pricing":
          await handleServicePricing(ctx, param as ServiceType);
          break;

        // Handle buy actions
        case "buy":
          await handlePurchase(ctx, param as ServiceType);
          break;

        // Handle main menu
        case "menu":
          if (user) {
            const welcomeMessage = MessageTemplates.getWelcomeMessage(user);
            const servicesKeyboard = KeyboardUtils.getServicesKeyboard();
            await ctx.replyWithMarkdown(welcomeMessage, servicesKeyboard);
          }
          break;

        default:
          console.log(`Unhandled action: ${action}`);
          await ctx.reply(
            `Sorry, this feature (${action}) is not implemented yet.`
          );
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
    case "results":
      await handleServiceResults(ctx, ServiceType.SIGNAL);
      // Send image of signal results
      await ctx.replyWithPhoto({ source: 'assets/results/ea_results_1.jpg' }, 
        { caption: "📊 Here are our recent signal results showing consistent profits!" });
      break;

    case "stats":
      await ctx.replyWithMarkdown(
        "*📊 Signal Service Performance Stats*\n\n✅ Win Rate: 87.3%\n📈 Average Monthly Return: 28-42%\n🎯 Signal Accuracy: 94.6%\n⏱️ Signals per Week: 15-20\n💰 Avg. Profit per Signal: 3.2%"
      );
      // Add CTA button to join private community
      await ctx.reply("Want to learn more from our traders?", Markup.inlineKeyboard([
        [Markup.button.url('Join Private Community Now', 'https://t.me/tnetccommunity/1')]
      ]));
      break;

    case "examples":
      await ctx.replyWithMarkdown(
        "*📱 Signal Examples*\n\nOur signals provide precise entry, take profit, and stop loss levels for each trade."
      );
      
      // Send example signal images
      await ctx.replyWithPhoto({ source: 'assets/service-info/signal1.png' }, 
        { caption: "🚀 BTC/USDT LONG\n\n▶️ Entry: 63,250-63,500\n🎯 Targets: 64,800 / 65,500 / 66,200\n🛑 Stop Loss: 62,100\n\nLeverage: 5-10x\n⏱️ Timeframe: 12-24 hours" });
      
      await ctx.replyWithPhoto({ source: 'assets/service-info/signal2.png' }, 
        { caption: "📉 XAU/USDT SHORT\n\n▶️ Entry: 3,380-3,420\n🎯 Targets: 3,280 / 3,150 / 3,050\n🛑 Stop Loss: 3,520\n\nLeverage: 5-10x\n⏱️ Timeframe: 8-12 hours" });
      
      // Add CTA after examples
      await ctx.reply("Ready to receive signals like these?", Markup.inlineKeyboard([
        [Markup.button.url('💰 Get Premium Signals', 'https://t.me/m/DvGbHx0NZTFl')]
      ]));
      break;

    case "pricing":
      await handleServicePricing(ctx, ServiceType.SIGNAL);
      break;

    default:
      await ctx.replyWithMarkdown(
        "Select an option from the Signal service menu:"
      );
      await ctx.reply("", KeyboardUtils.getSignalKeyboard());
  }
}

/**
 * Handle VIP service specific actions
 */
async function handleVIPAction(ctx: Context, action: string): Promise<void> {
  switch (action) {
    case "benefits":
      await ctx.replyWithMarkdown(
        "*🏆 EXCLUSIVE VIP PACKAGE BENEFITS 🏆*\n\n" +
        "📈 *Premium Benefits Only Available to VIP Members:*\n\n" +
        "• Priority access to ALL trade signals before regular users\n" +
        "• Personal VIP account manager available 24/7\n" +
        "• One-on-one trading strategy consultation calls\n" +
        "• Access to proprietary trading algorithms and strategies\n" +
        "• Entry to our exclusive VIP trading community\n" +
        "• First access to new features and services\n\n" +
        "*⏰ LIMITED TIME OFFER: Only 15 VIP spots remaining!*"
      );
      
      // Add CTA button
      await ctx.reply("Ready to upgrade your trading experience?", {
        reply_markup: {
          inline_keyboard: [[
            { text: "💎 BECOME A VIP MEMBER NOW", url: "https://t.me/m/DvGbHx0NZTFl" }
          ]]
        }
      });
      break;

    case "performance":
      try {
        // Send text testimonials first
        await ctx.replyWithMarkdown(
          "*💰 VIP MEMBERS SUCCESS STORIES 💰*\n\n" +
          "💬 *Alex P.* - _\"Since joining the VIP program, my trading has completely transformed. I'm consistently making $5,000+ weekly following the VIP signals. Best investment I've ever made.\"_\n\n" +
          "💬 *Jennifer K.* - _\"The personal coaching alone is worth 10x what I paid. My account has grown 320% in just 2 months with the VIP team guiding me.\"_\n\n" +
          "💬 *Marcus T.* - _\"The exclusive VIP signals have been incredible - 97% win rate last month and I've already made back my investment 8 times over!\"_"
        );
        
        // Send performance images
        const mediaGroup = [
          {
            type: 'photo' as const,
            media: { source: 'assets/testimonials/testimonial_1.jpg' },
            caption: "✅ VIP member results - $15,400 profit in 1 week",
            parse_mode: 'Markdown' as const
          },
          {
            type: 'photo' as const,
            media: { source: 'assets/testimonials/testimonial_2.jpg' },
            caption: "✅ VIP signals performance - 94.3% accuracy last month",
            parse_mode: 'Markdown' as const
          }
        ];
        
        await ctx.replyWithMediaGroup(mediaGroup);
        
        // Final CTA
        await ctx.replyWithMarkdown(
          "*🔥 SPECIAL VIP OFFER - 50% DISCOUNT TODAY ONLY! 🔥*\n\n" +
          "Regular price: ~~$1,000/month~~\n" +
          "Limited time offer: *$497 LIFETIME ACCESS*\n\n" +
          "*⚠️ ONLY 15 SPOTS REMAINING AT THIS PRICE ⚠️*",
          {
            reply_markup: {
              inline_keyboard: [[
                { text: "💎 SECURE YOUR VIP ACCESS NOW", url: "https://t.me/m/DvGbHx0NZTFl" }
              ]]
            }
          }
        );
      } catch (error) {
        console.error("Error sending VIP results:", error);
        // Fallback to text only
        await ctx.replyWithMarkdown(
          "*📊 VIP PERFORMANCE HIGHLIGHTS*\n\n" +
          "• Average monthly return: 115-180%\n" +
          "• Signal accuracy: 97.3%\n" +
          "• VIP members outperform regular users by 3.5x\n\n" +
          "*🔥 SPECIAL OFFER: 50% OFF LIFETIME ACCESS TODAY ONLY!*"
        );
      }
      break;

    case "features":
      await ctx.replyWithMarkdown(
        "*🚀 PREMIUM VIP FEATURES & SERVICES 🚀*\n\n" +
        "✅ *Exclusive Access to Everything:*\n\n" +
        "• 24/7 direct support line with trading experts\n" +
        "• Weekly market analysis video calls\n" +
        "• Custom trade plan development for your goals\n" +
        "• Risk management consultation\n" +
        "• Lifetime access to premium educational materials\n" +
        "• Early access to our proprietary trading tools\n" +
        "• Direct line to our top analysts\n\n" +
        "*💎 Value: Over $5,000 - Available now for just $497!*"
      );
      
      // Add image and CTA
      await ctx.replyWithPhoto(
        { source: 'assets/service-info/vip_benefits.jpg' },
        { 
          caption: "VIP members average 3.5x higher returns than standard users!",
          reply_markup: {
            inline_keyboard: [[
              { text: "🔥 GET VIP ACCESS TODAY", url: "https://t.me/m/DvGbHx0NZTFl" }
            ]]
          }
        }
      );
      break;

    case "pricing":
      await ctx.replyWithMarkdown(
        "*💰 VIP PACKAGE - SPECIAL LIMITED OFFER 💰*\n\n" +
        "*⚠️ WARNING: PRICES INCREASE TOMORROW! ⚠️*\n\n" +
        "*VIP PACKAGE INCLUDES:*\n" +
        "✅ Lifetime access to premium signals\n" +
        "✅ 24/7 personal account manager\n" +
        "✅ Private VIP community access\n" +
        "✅ Weekly strategy sessions\n" +
        "✅ Proprietary trading algorithms\n" +
        "✅ Risk management tools\n\n" +
        "*REGULAR PRICE: $3,000/MONTH*\n" +
        "*TODAY'S OFFER: $1999 ONE-TIME PAYMENT (LIFETIME)*\n\n" +
        "*⏰ ONLY 15 VIP SPOTS REMAINING AT THIS PRICE!*\n" +
        "Our last VIP spots sold out in under 8 hours. Don't miss this opportunity!"
      );
      
      // Add strong CTA button
      await ctx.reply("Ready to transform your trading?", {
        reply_markup: {
          inline_keyboard: [[
            { text: "💎 SECURE YOUR VIP ACCESS NOW", url: "https://t.me/m/DvGbHx0NZTFl" }
          ]]
        }
      });
      break;

    default:
      await ctx.replyWithMarkdown(
        "*🏆 VIP EXCLUSIVE PACKAGE - LIMITED AVAILABILITY! 🏆*\n\n" +
        "Discover why our VIP members achieve 3.5x better results with our most comprehensive trading package!\n\n" +
        "Select an option below to learn more:"
      );
      await ctx.reply("", KeyboardUtils.getVIPKeyboard());
  }
}

/**
 * Handle X10 Challenge specific actions
 */
async function handleX10Action(ctx: Context, action: string): Promise<void> {
  switch (action) {
    case "join":
      await ctx.reply("🚀 *JOIN THE X10 CHALLENGE NOW!* 🚀", {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "🔥 JOIN THE TNETC COMMUNITY 🔥",
                url: "https://t.me/tnetccommunity/186",
              },
            ],
          ],
        },
      });
      // await ctx.reply(joinMessage, { parse_mode: 'Markdown' });
      break;

    case "testimonials_with_images":
      try {
        // First send the testimonial text
        await ctx.replyWithMarkdown(
          "🌟 *X10 CHALLENGE SUCCESS STORIES* 🌟\n\n" +
          "Here are some of our successful traders who completed the X10 Challenge:\n\n" +
          "💬 *John M.* - _\"I was skeptical at first, but after following the X10 Challenge strategy, I turned my $1,000 account into $12,450 in just 28 days! Life-changing experience.\"_\n\n" +
          "💬 *Sarah T.* - _\"The X10 Challenge gave me the confidence and knowledge to become a consistent trader. My initial $500 grew to $5,700 in just one month!\"_\n\n" +
          "💬 *Michael R.* - _\"I've tried other services before but nothing comes close to the X10 Challenge. The support team is always available and the signals are incredibly accurate. $2,000 to $21,300 in 31 days!\"_"
        );

        // Then send testimonial images
        // In a production environment, you would use real testimonial images
        const mediaGroup = [
          {
            type: 'photo' as const,
            media: { source: 'assets/testimonials/testimonial_1.jpg' },
            caption: "✅ X10 Challenge member results - $1,000 to $10,500 in 25 days",
            parse_mode: 'Markdown' as const
          },
          {
            type: 'photo' as const,
            media: { source: 'assets/testimonials/testimonial_2.jpg' },
            caption: "✅ X10 Challenge member results - Account growth of 1,150%",
            parse_mode: 'Markdown' as const
          }
        ];
        
        await ctx.replyWithMediaGroup(mediaGroup);
        
        // Send a final call-to-action message
        await ctx.replyWithMarkdown(
          "🔥 *Don't miss out on the opportunity to transform your trading!* 🔥\n\n" +
          "Only *17 spots* remain in our current X10 Challenge. Join now to receive our premium signals and guidance!",
          {
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: "🚀 JOIN THE X10 CHALLENGE NOW! 🚀",
                    url: "https://t.me/tnetccommunity/186"
                  }
                ]
              ]
            }
          }
        );
      } catch (error) {
        console.error("Error sending testimonials with images:", error);
        
        // Fallback if images can't be sent
        await ctx.replyWithMarkdown(
          "📊 *X10 Challenge Success Stories*\n\n" +
          "Our members consistently achieve incredible results:\n\n" +
          "• Average account growth: 850% in 30 days\n" +
          "• 94.5% of members complete the challenge successfully\n" +
          "• 50+ traders have turned $1,000 into $10,000+ using our system"
        );
      }
      break;

    case "details":
      await ctx.replyWithMarkdown(
        "*🔥 X10 CHALLENGE - FINAL 17 SPOTS AVAILABLE! 🔥*\n\n" +
          "*⚠️ WARNING: This offer is closing THIS WEEK ⚠️*\n\n" +
          "Our exclusive X10 Challenge has helped members achieve incredible results:\n\n" +
          "✅ Previous challenge: *10X account growth in just 66 days*\n" +
          "✅ Members reporting $500-$3,000+ profits weekly\n" +
          "✅ Step-by-step guidance from professional traders\n" +
          "✅ Proven strategy with 94% win rate\n\n" +
          "*WHAT YOU GET:*\n" +
          "• Access to exclusive challenge group\n" +
          "• Premium signals (not available elsewhere)\n" +
          "• 1-on-1 strategy coaching\n" +
          "• Daily trade opportunities\n\n" +
          "*ORIGINAL PRICE: $350*\n" +
          "*CURRENT PRICE: $0 (FREE)*\n\n" +
          "*⏰ ONLY 17 SPOTS REMAIN - OFFER ENDS THIS WEEK!*\n" +
          "Our last batch of members filled within 24 hours. Don't miss this opportunity!"
      );
      break;

    case "success":
      try {
        // Send testimonial images
        const testimonialImages = [
          {
            type: 'photo' as const,
            media: { source: './assets/testimonials/testimonial_1.jpg' },
            parse_mode: 'Markdown' as const
          },
          {
            type: 'photo' as const,
            media: { source: './assets/testimonials/testimonial_2.jpg' },
            parse_mode: 'Markdown' as const
          },
          {
            type: 'photo' as const,
            media: { source: './assets/testimonials/testimonial_3.jpg' },
            parse_mode: 'Markdown' as const
          }
        ];
        
        await ctx.replyWithMediaGroup(testimonialImages);
        
        // Send result images
        // Get testimonials from service
        const testimonialService = new TestimonialService();
        const x10Testimonials = testimonialService.getFollowUpTestimonials(ServiceType.X10_CHALLENGE);
        
        // Create media group for results
        const resultImages = [
          {
            type: 'photo' as const,
            media: { source: './assets/results/x10_result_1.jpg' },
            caption: x10Testimonials.length > 0 ? x10Testimonials[0].text : "🚀 Incredible results from our X10 Challenge members!",
            parse_mode: 'Markdown' as const
          },
          {
            type: 'photo' as const,
            media: { source: './assets/results/x10_result_2.jpg' },
            caption: x10Testimonials.length > 1 ? x10Testimonials[1].text : "💰 Another member's success story from our X10 Challenge!",
            parse_mode: 'Markdown' as const
          },
          {
            type: 'photo' as const,
            media: { source: './assets/results/ea_result_1.jpg' },
            caption: "📈 Our proven system consistently delivers results!",
            parse_mode: 'Markdown' as const
          }
        ];
        
        await ctx.replyWithMediaGroup(resultImages);
        
        // Send text testimonials as well
        await ctx.replyWithMarkdown(
          '*📊 X10 Challenge Success Stories*\n\n' +
          'John S. - "Started with $1,000, ended with $12,450 in just 28 days!"\n\n' +
          'Maria L. - "The X10 Challenge helped me quit my job. I turned $2,500 into $27,800 in a month."\n\n' +
          'David R. - "I was skeptical at first, but the results speak for themselves. $5,000 to $48,900 in 30 days."'
        );
      } catch (error) {
        console.error("Error sending testimonials and results:", error);
        
        // Fallback to just text if images fail
        await ctx.replyWithMarkdown(
          '*📊 X10 Challenge Success Stories*\n\n' +
          'John S. - "Started with $1,000, ended with $12,450 in just 28 days!"\n\n' +
          'Maria L. - "The X10 Challenge helped me quit my job. I turned $2,500 into $27,800 in a month."\n\n' +
          'David R. - "I was skeptical at first, but the results speak for themselves. $5,000 to $48,900 in 30 days."'
        );
      }
      break;

    case "howItWorks":
      await handleHowItWorks(ctx, ServiceType.X10_CHALLENGE);
      break;

    default:
      await ctx.replyWithMarkdown(
        "Select an option from the X10 Challenge menu:"
      );
      await ctx.reply("", KeyboardUtils.getX10ChallengeKeyboard());
  }
}

/**
 * Handle Copytrade specific actions
 */
async function handleCopytradeAction(
  ctx: Context,
  action: string
): Promise<void> {
  switch (action) {
    case "results":
      try {
        // Send copytrade result images
        const resultImages = [
          {
            type: 'photo' as const,
            media: { source: './assets/results/copytrade_results_1.jpg' },
            caption: '*COPYTRADE RESULTS - Consistent profits with minimal risk*',
            parse_mode: 'Markdown' as const
          },
          {
            type: 'photo' as const,
            media: { source: './assets/results/copytrade_results_2.jpg' },
            parse_mode: 'Markdown' as const
          },
          {
            type: 'photo' as const,
            media: { source: './assets/results/copytrade_results_1.jpg' },
            parse_mode: 'Markdown' as const
          }
        ];
        
        await ctx.replyWithMediaGroup(resultImages);
        await handleServiceResults(ctx, ServiceType.COPYTRADE);
      } catch (error) {
        console.error("Error sending copytrade results:", error);
        // Fallback to regular results if images fail
        await handleServiceResults(ctx, ServiceType.COPYTRADE);
      }
      break;

    case "stats":
      await ctx.replyWithMarkdown(
        "*🔥 EXCLUSIVE COPYTRADE PERFORMANCE STATS 🔥*\n\n✅ *Average Monthly Return:* 25-35% (while most traders struggle to make 5%)\n✅ *Maximum Drawdown:* Only 8% (exceptional risk management)\n✅ *Trading Frequency:* 20-30 trades/month (consistent opportunities)\n✅ *Win Rate:* Incredible 89% success rate!\n\n_Don't miss out on these market-beating returns - limited spots available!_"
      );
      break;

    case "start":
      await ctx.replyWithMarkdown(
        "*🚀 Start Your Copytrading Journey Today!*\n\n" +
        "Ready to earn passive income through our proven copytrading system? Our expert team will:\n\n" +
        "• Guide you through the complete setup process\n" +
        "• Configure your account for optimal performance\n" +
        "• Answer all your questions about the service\n\n" +
        "*👇 Click the button below to get started 👇*"
      );
      await ctx.reply("", Markup.inlineKeyboard([
        [Markup.button.url("📱 Contact Support Team", "https://t.me/m/KAYFGGyMYzk1")]
      ]));
      break;

    default:
      await ctx.replyWithMarkdown("Select an option from the Copytrade menu:");
      await ctx.reply("", KeyboardUtils.getCopytradeKeyboard());
  }
}

/**
 * Handle back actions
 */
async function handleBackAction(ctx: Context, param: string): Promise<void> {
  if (param === "services") {
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
      const serviceMessage =
        MessageTemplates.getServiceInfoMessage(serviceType);
      const keyboard = KeyboardUtils.getServiceKeyboard(serviceType);
      await ctx.replyWithMarkdown(serviceMessage, keyboard);
    } catch (error) {
      console.error(`Error handling back action: ${error}`);
      // Fallback to main services menu
      await ctx.reply("", KeyboardUtils.getServicesKeyboard());
    }
  }
}
