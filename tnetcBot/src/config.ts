import dotenv from 'dotenv';
import { ServiceInfo, ServiceType, TestimonialInfo } from './types';

dotenv.config();

export const BOT_TOKEN = process.env.BOT_TOKEN || '';
export const ADMIN_USER_ID = Number(process.env.ADMIN_USER_ID) || 0;
export const IS_PRODUCTION = process.env.NODE_ENV === 'production';

// Service Information
export const SERVICES: Record<ServiceType, ServiceInfo> = {
  [ServiceType.SIGNAL]: {
    id: ServiceType.SIGNAL,
    name: 'Premium Forex Signals',
    description: 'Receive high-quality trading signals with 92% win rate directly to your phone',
    price: 149,
    discountPrice: 99,
    features: [
      '5-10 Signals Daily',
      '92% Win Rate',
      'All Pairs Covered',
      'Entry/Stop/Target Details',
      'Market Analysis',
      '24/7 Support Channel'
    ],
    limitedTime: 'This week only',
    resultImages: ['assets/results/ea_results_1.jpg', 'assets/results/ea_results_2.jpg'],
    testimonialImages: ['assets/testimonials/testimonial_1.jpg', 'assets/testimonials/testimonial_2.jpg']
  },
  [ServiceType.VIP]: {
    id: ServiceType.VIP,
    name: 'VIP Trading Package',
    description: 'All-inclusive VIP package with signals, and exclusive community access',
    price: 299,
    discountPrice: 199,
    features: [
      'VIP Signals Channel',
      'Private Community Access',
      'Weekly Live Sessions',
      'Priority Support',
      'Custom Strategy Guidance'
    ],
    limitedSlots: 5,
    resultImages: ['assets/results/copytrade_results_1.jpg', 'assets/results/copytrade_results_2.jpg'],
    testimonialImages: ['assets/testimonials/testimonial_3.jpg', 'assets/testimonials/testimonial_4.jpg']
  },
  [ServiceType.X10_CHALLENGE]: {
    id: ServiceType.X10_CHALLENGE,
    name: 'X10 Challenge',
    description: 'Join our exclusive X10 Challenge and multiply your account by 10x in 30 days',
    price: 0,
    features: [
      'Free Access for Limited Time',
      'Daily Signals',
      '30-Day Challenge',
      'Community Support',
      'Performance Tracking'
    ],
    limitedSlots: 17,
    limitedTime: '24 hours',
    resultImages: ['assets/results/x10_results_1.jpg', 'assets/results/x10_results_2.jpg'],
    testimonialImages: ['assets/testimonials/testimonial_5.jpg']
  },
  [ServiceType.COPYTRADE]: {
    id: ServiceType.COPYTRADE,
    name: 'Copytrade Service',
    description: 'Copy our expert traders automatically with our copytrade service',
    price: 249,
    discountPrice: 149,
    features: [
      'Fully Automated Trading',
      '85% Win Rate',
      'Multiple Strategies',
      'Conservative Risk Settings',
      'Daily Performance Updates',
      'Flexible Investment Amount'
    ],
    limitedTime: 'FINAL FREE OFFER',
    resultImages: ['assets/results/copytrade_results_1.jpg', 'assets/results/copytrade_results_2.jpg'],
    testimonialImages: ['assets/testimonials/testimonial_6.jpg']
  }
};

// Testimonials
export const TESTIMONIALS: TestimonialInfo[] = [
  {
    id: '1',
    serviceName: ServiceType.SIGNAL,
    imagePath: 'assets/testimonials/testimonial_1.jpg',
    caption: "These signals are INCREDIBLE! 9/10 winning trades this week and already up $2,100. The analysis provided with each signal helps me learn too!"
  },
  {
    id: '2',
    serviceName: ServiceType.SIGNAL,
    imagePath: 'assets/testimonials/testimonial_2.jpg',
    caption: "I've tried many signal services before, but these are by far the most accurate. 91% win rate last month! The team is super responsive too."
  },
  {
    id: '3',
    serviceName: ServiceType.VIP,
    imagePath: 'assets/testimonials/testimonial_3.jpg',
    caption: "The VIP package is worth every penny! I'm making consistent profits daily. The private community is gold too!"
  },
  {
    id: '4',
    serviceName: ServiceType.VIP,
    imagePath: 'assets/testimonials/testimonial_4.jpg',
    caption: "Just hit $5K profit in my first month with the VIP package! The weekly strategy sessions alone are worth the price. So glad I got in before spots filled up!"
  },
  {
    id: '5',
    serviceName: ServiceType.X10_CHALLENGE,
    imagePath: 'assets/testimonials/testimonial_5.jpg',
    caption: "I turned my $1K account into $9,700 in just 27 days with the X10 Challenge! These guys know what they're doing. Don't miss this opportunity!"
  },
  {
    id: '6',
    serviceName: ServiceType.COPYTRADE,
    imagePath: 'assets/testimonials/testimonial_6.jpg',
    caption: "Copytrade has been life-changing! I'm making passive income while working my day job. Already up 37% this month alone!"
  }
];

// Testimonial probabilities
export const TESTIMONIAL_CHANCE = {
  AFTER_WELCOME: 0.45,  // 45% chance to show after welcome
  AFTER_INFO: 0.30      // 30% chance to show after viewing service info
};

// Follow-up timing (in hours)
export const FOLLOW_UP_TIMING = {
  FIRST_MESSAGE: 24,
  SECOND_MESSAGE: 48,
  FINAL_MESSAGE: 72
}; 