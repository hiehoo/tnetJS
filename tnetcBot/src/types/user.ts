export enum EntryPoint {
  DEFAULT = 'default',
  EA_CAMPAIGN = 'ea_campaign',
  SIGNAL_CAMPAIGN = 'signal_campaign',
  VIP_CAMPAIGN = 'vip_campaign'
}

export enum ServiceType {
  SIGNAL = 'signal',
  VIP = 'vip',
  X10_CHALLENGE = 'x10_challenge',
  COPYTRADE = 'copytrade'
}

export enum UserState {
  NEW = 'new',
  WELCOME_SHOWN = 'welcome_shown',
  SERVICE_SELECTED = 'service_selected',
  INFO_SHOWN = 'info_shown',
  TESTIMONIAL_SHOWN = 'testimonial_shown',
  PRICING_SHOWN = 'pricing_shown',
  PURCHASED = 'purchased',
  SETUP_COMPLETE = 'setup_complete'
}

export interface UserData {
  id: number;
  username?: string;
  firstName?: string;
  lastName?: string;
  entryPoint: EntryPoint;
  state: UserState;
  selectedService?: ServiceType;
  lastActive: Date;
  followUpScheduled?: boolean;
  testimonialsSent: number;
  purchasedServices: ServiceType[];
  createdAt: Date;
  updatedAt: Date;
} 