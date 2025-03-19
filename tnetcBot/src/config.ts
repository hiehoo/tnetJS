import * as dotenv from "dotenv";
import { ServiceInfo, ServiceType, TestimonialInfo } from "./types";

// Load environment variables
dotenv.config();

// Bot configuration
export const BOT_TOKEN = process.env.BOT_TOKEN || "YOUR_BOT_TOKEN_HERE";
export const ADMIN_USER_ID = Number(process.env.ADMIN_USER_ID) || 0;
export const IS_PRODUCTION = process.env.NODE_ENV === "production";

// Webhook configuration (for production)
export const USE_WEBHOOK = process.env.USE_WEBHOOK === "true";
export const WEBHOOK_DOMAIN =
  process.env.WEBHOOK_DOMAIN || "https://your-app-domain.com";
export const WEBHOOK_PORT = parseInt(process.env.PORT || "3000", 10);

// Service Information
export const SERVICES: Record<ServiceType, ServiceInfo> = {
  [ServiceType.SIGNAL]: {
    id: ServiceType.SIGNAL,
    name: "Premium Forex Signals",
    description:
      "High probability trading signals delivered directly to your phone",
    price: 199,
    discountPrice: 99,
    limitedTime: "48 hours",
    limitedSlots: 15,
    resultImages: [
      "assets/results/signal_results_1.jpg",
      "assets/results/signal_results_2.jpg",
    ],
    features: [
      "Professional trade signals with 92% win rate",
      "Entry, stop loss, and take profit levels",
      "Up to 10 signals per day",
      "Advanced risk management advice",
      "Full mobile compatibility",
      "Daily market analysis and insights",
      "Private VIP Telegram group access",
    ],
    testimonialImages: [
      "assets/testimonials/testimonial_1.jpg",
      "assets/testimonials/testimonial_2.jpg",
    ],
  },
  [ServiceType.VIP]: {
    id: ServiceType.VIP,
    name: "VIP Package",
    description:
      "Complete trading ecosystem including signals, community, and education",
    price: 499,
    discountPrice: 299,
    limitedSlots: 5,
    resultImages: [
      "assets/results/vip_results_1.jpg",
      "assets/results/vip_results_2.jpg",
    ],
    features: [
      "All Premium Signals included",
      "Access to private VIP community",
      "Weekly live trading sessions",
      "Direct access to expert traders",
      "Priority 24/7 support",
      "Detailed market forecasts",
      "Performance tracking and analysis",
    ],
    testimonialImages: [
      "assets/testimonials/testimonial_3.jpg",
      "assets/testimonials/testimonial_4.jpg",
    ],
  },
  [ServiceType.X10_CHALLENGE]: {
    id: ServiceType.X10_CHALLENGE,
    name: "X10 Challenge",
    description: "Multiply your trading account 10X in 66 days",
    price: 0,
    limitedSlots: 12,
    resultImages: [
      "assets/results/x10_results_1.jpg",
      "assets/results/x10_results_2.jpg",
    ],
    features: [
      "Step-by-step trading plan",
      "Daily guidance from expert traders",
      "Proven strategy with historical results",
      "Risk management framework",
      "Account monitoring and feedback",
      "Special trades only for challengers",
      "Certificate upon completion",
    ],
    testimonialImages: ["assets/testimonials/testimonial_5.jpg"],
  },
  [ServiceType.COPYTRADE]: {
    id: ServiceType.COPYTRADE,
    name: "Lifetime Copytrade",
    description: "Automatically copy trades from our expert traders",
    price: 299,
    discountPrice: 199,
    limitedTime: "72 hours",
    resultImages: [
      "assets/results/copytrade_results_1.jpg",
      "assets/results/copytrade_results_2.jpg",
    ],
    features: [
      "Fully automated trading",
      "Trades copied in real-time",
      "Adjustable risk settings",
      "Works with any broker",
      "No technical skills required",
      "Performance statistics dashboard",
      "Lifetime access to the service",
    ],
    testimonialImages: ["assets/testimonials/testimonial_6.jpg"],
  },
};

// Testimonials
export const TESTIMONIALS: TestimonialInfo[] = [
  {
    id: "1",
    serviceName: ServiceType.SIGNAL,
    imagePath: "assets/testimonials/testimonial_1.jpg",
    caption:
      "These signals are INCREDIBLE! 9/10 winning trades this week and already up $2,100. The analysis provided with each signal helps me learn too!",
  },
  {
    id: "2",
    serviceName: ServiceType.SIGNAL,
    imagePath: "assets/testimonials/testimonial_2.jpg",
    caption:
      "I've tried many signal services before, but these are by far the most accurate. 91% win rate last month! The team is super responsive too.",
  },
  {
    id: "3",
    serviceName: ServiceType.VIP,
    imagePath: "assets/testimonials/testimonial_3.jpg",
    caption:
      "The VIP package is worth every penny! I'm making consistent profits daily. The private community is gold too!",
  },
  {
    id: "4",
    serviceName: ServiceType.VIP,
    imagePath: "assets/testimonials/testimonial_4.jpg",
    caption:
      "Just hit $5K profit in my first month with the VIP package! The weekly strategy sessions alone are worth the price. So glad I got in before spots filled up!",
  },
  {
    id: "5",
    serviceName: ServiceType.X10_CHALLENGE,
    imagePath: "assets/testimonials/testimonial_5.jpg",
    caption:
      "I turned my $1K account into $9,700 in just 27 days with the X10 Challenge! These guys know what they're doing. Don't miss this opportunity!",
  },
  {
    id: "6",
    serviceName: ServiceType.COPYTRADE,
    imagePath: "assets/testimonials/testimonial_6.jpg",
    caption:
      "Copytrade has been life-changing! I'm making passive income while working my day job. Already up 37% this month alone!",
  },
];

// Testimonial probabilities
export const TESTIMONIAL_CHANCE = {
  AFTER_WELCOME: 0.45, // 45% chance to show after welcome
  AFTER_INFO: 0.3, // 30% chance to show after viewing service info
};

// Follow-up timing (in hours)
export const FOLLOW_UP_TIMING = {
  FIRST_MESSAGE: 24,
  SECOND_MESSAGE: 48,
  FINAL_MESSAGE: 72,
};

// Export a config object for easier imports
export const config = {
  BOT_TOKEN,
  ADMIN_USER_ID,
  IS_PRODUCTION,
  USE_WEBHOOK,
  WEBHOOK_DOMAIN,
  WEBHOOK_PORT,
  SERVICES,
};
