import { EntryPoint, FollowUpInfo, ServiceType, UserData, UserState } from '../types';

// In-memory database for simplicity
// In a production environment, you would use a real database like MongoDB
class DatabaseService {
  private users: Map<number, UserData> = new Map();
  private followUps: Map<number, FollowUpInfo[]> = new Map();
  private serviceStats: Record<ServiceType, number>;

  constructor() {
    // For local development - initialize the stats
    this.serviceStats = {
      [ServiceType.SIGNAL]: 0,
      [ServiceType.VIP]: 0,
      [ServiceType.X10_CHALLENGE]: 0,
      [ServiceType.COPYTRADE]: 0
    };
  }

  // User methods
  async getUser(userId: number): Promise<UserData | undefined> {
    return this.users.get(userId);
  }

  async createUser(
    userId: number, 
    entryPoint: EntryPoint = EntryPoint.DEFAULT,
    username?: string,
    firstName?: string,
    lastName?: string
  ): Promise<UserData> {
    const now = new Date();
    const userData: UserData = {
      id: userId,
      username,
      firstName,
      lastName,
      entryPoint,
      state: UserState.NEW,
      lastActive: now,
      testimonialsSent: 0,
      purchasedServices: [],
      createdAt: now,
      updatedAt: now
    };

    this.users.set(userId, userData);
    return userData;
  }

  async updateUser(userId: number, updates: Partial<UserData>): Promise<UserData> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error(`User with ID ${userId} not found.`);
    }

    const updatedUser = {
      ...user,
      ...updates,
      updatedAt: new Date()
    };
    
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  async getUsersByState(state: UserState): Promise<UserData[]> {
    return Array.from(this.users.values()).filter(user => user.state === state);
  }

  async getUsersByService(service: ServiceType): Promise<UserData[]> {
    return Array.from(this.users.values()).filter(user => 
      user.selectedService === service || user.purchasedServices.includes(service)
    );
  }

  // Follow-up methods
  async createFollowUp(followUp: FollowUpInfo): Promise<FollowUpInfo> {
    const userFollowUps = this.followUps.get(followUp.userId) || [];
    userFollowUps.push(followUp);
    this.followUps.set(followUp.userId, userFollowUps);
    return followUp;
  }

  async getFollowUps(userId: number): Promise<FollowUpInfo[]> {
    return this.followUps.get(userId) || [];
  }

  async updateFollowUp(userId: number, serviceType: ServiceType, updates: Partial<FollowUpInfo>): Promise<FollowUpInfo | undefined> {
    const userFollowUps = this.followUps.get(userId) || [];
    const followUpIndex = userFollowUps.findIndex(f => f.serviceType === serviceType && !f.cancelled);
    
    if (followUpIndex === -1) return undefined;
    
    userFollowUps[followUpIndex] = {
      ...userFollowUps[followUpIndex],
      ...updates
    };
    
    this.followUps.set(userId, userFollowUps);
    return userFollowUps[followUpIndex];
  }

  async cancelAllFollowUps(userId: number): Promise<void> {
    const userFollowUps = this.followUps.get(userId) || [];
    const updatedFollowUps = userFollowUps.map(f => ({ ...f, cancelled: true }));
    this.followUps.set(userId, updatedFollowUps);
  }

  // Stats methods
  async getTotalUsers(): Promise<number> {
    return this.users.size;
  }

  async getPurchasedServicesCount(): Promise<Record<ServiceType, number>> {
    const result: Record<ServiceType, number> = {
      [ServiceType.SIGNAL]: 0,
      [ServiceType.VIP]: 0,
      [ServiceType.X10_CHALLENGE]: 0,
      [ServiceType.COPYTRADE]: 0
    };

    for (const user of this.users.values()) {
      for (const service of user.purchasedServices) {
        result[service]++;
      }
    }

    return result;
  }
}

// Singleton instance
export const database = new DatabaseService(); 