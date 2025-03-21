export enum EntryPoint {
  DEFAULT = "telegram_ads",
  FACEBOOK_ADS = "facebook_ads",
  TELEGRAM_ADS = "telegram_ads",
  GOOGLE_ADS = "google_ads",
  YOUTUBE_ADS = "youtube_ads",
  INSTAGRAM_ADS = "instagram_ads",
  TIKTOK_ADS = "tiktok_ads",
  X_ADS = "x_ads",
  ADSGRAM = "adsgram",
}

export enum ServiceType {
  SIGNAL = "signal",
  VIP = "vip",
  X10_CHALLENGE = "x10_challenge",
  COPYTRADE = "copytrade",
}

export enum UserState {
  NEW = "new",
  WELCOME_SHOWN = "welcome_shown",
  SERVICE_SELECTED = "service_selected",
  INFO_SHOWN = "info_shown",
  TESTIMONIAL_SHOWN = "testimonial_shown",
  PRICING_SHOWN = "pricing_shown",
  PURCHASED = "purchased",
  IN_SALE_PROCESS = "in_sale_process",
  REF_REGISTERED = "ref_registered",
  FUNDED = "funded",
}

export interface UserData {
  id: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  entryPoint: EntryPoint;
  state: UserState;
  lastVisit: number;
  services: ServiceType[];
  campaignId: string;
  selectedService?: ServiceType;
  lastActive?: Date;
  testimonialsSent?: number;
  purchasedServices?: ServiceType[];
  createdAt?: Date;
  updatedAt?: Date;
  source?: string;
}
