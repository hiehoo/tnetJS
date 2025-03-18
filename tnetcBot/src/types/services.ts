import { ServiceType } from './user';

export interface ServiceInfo {
  id: ServiceType;
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  features: string[];
  limitedSlots?: number;
  limitedTime?: string;
  resultImages: string[];
  testimonialImages: string[];
}

export interface TestimonialInfo {
  id: string;
  serviceName: ServiceType;
  imagePath: string;
  caption: string;
}

export interface FollowUpInfo {
  userId: number;
  serviceType: ServiceType;
  messageNumber?: number;
  sentAt?: Date;
  scheduledDate?: Date;
  messagesSent?: number;
  messageId?: number;
  cancelled?: boolean;
} 