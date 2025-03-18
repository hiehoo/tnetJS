import {
  EntryPoint,
  FollowUpInfo,
  ServiceType,
  UserData,
  UserState,
} from "../types";
import { Helpers } from "../utils/helpers";
import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

// SQLite database implementation
class DatabaseService {
  private db: Database.Database;

  constructor() {
    // Create data directory if it doesn't exist
    const dataDir = path.join(process.cwd(), "data");
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Initialize SQLite database
    this.db = new Database(path.join(dataDir, "tnetc-bot.db"));

    // Create tables if they don't exist
    this.initializeTables();
  }

  // Initialize database tables
  private initializeTables(): void {
    // Users table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT,
        firstName TEXT,
        lastName TEXT,
        entryPoint TEXT NOT NULL,
        state TEXT NOT NULL,
        selectedService TEXT,
        lastVisit INTEGER NOT NULL,
        lastActive TEXT,
        services TEXT DEFAULT '[]',
        campaignId TEXT,
        testimonialsSent INTEGER DEFAULT 0,
        createdAt TEXT,
        updatedAt TEXT
      )
    `);

    // User purchased services table (many-to-many relationship)
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS user_services (
        userId TEXT NOT NULL,
        serviceType TEXT NOT NULL,
        purchasedAt TEXT NOT NULL,
        PRIMARY KEY (userId, serviceType),
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Follow-ups table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS follow_ups (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId TEXT NOT NULL,
        serviceType TEXT NOT NULL,
        messageNumber INTEGER,
        sentAt TEXT,
        scheduledDate TEXT,
        messageId INTEGER,
        cancelled BOOLEAN DEFAULT 0,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Service stats table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS service_stats (
        serviceType TEXT PRIMARY KEY,
        count INTEGER DEFAULT 0
      )
    `);

    // Initialize service stats if needed
    const serviceTypes = [
      ServiceType.SIGNAL,
      ServiceType.VIP,
      ServiceType.X10_CHALLENGE,
      ServiceType.COPYTRADE,
    ];

    // Prepare service stats
    const statsInitStmt = this.db.prepare(`
      INSERT OR IGNORE INTO service_stats (serviceType, count)
      VALUES (?, 0)
    `);

    // Begin transaction for batch inserts
    const initTransaction = this.db.transaction(() => {
      for (const serviceType of serviceTypes) {
        statsInitStmt.run(serviceType);
      }
    });

    // Execute transaction
    initTransaction();
  }

  // User methods
  async getUser(userId: number): Promise<UserData | undefined> {
    // Prepare statement
    const stmt = this.db.prepare(`
      SELECT * FROM users WHERE id = ?
    `);

    // Execute query
    const userRow = stmt.get(userId.toString()) as any;

    if (!userRow) return undefined;

    // Fetch purchased services
    const purchasedServices = this.getUserPurchasedServices(userId);

    // Convert row to UserData object
    return {
      id: userRow.id,
      username: userRow.username,
      firstName: userRow.firstName,
      lastName: userRow.lastName,
      entryPoint: userRow.entryPoint as EntryPoint,
      state: userRow.state as UserState,
      lastVisit: userRow.lastVisit,
      services: userRow.services ? JSON.parse(userRow.services) : [],
      campaignId: userRow.campaignId || Helpers.idGenerator(),
      selectedService: userRow.selectedService as ServiceType | undefined,
      lastActive: userRow.lastActive ? new Date(userRow.lastActive) : undefined,
      testimonialsSent: userRow.testimonialsSent || 0,
      purchasedServices: purchasedServices,
      createdAt: userRow.createdAt ? new Date(userRow.createdAt) : undefined,
      updatedAt: userRow.updatedAt ? new Date(userRow.updatedAt) : undefined,
    };
  }

  private getUserPurchasedServices(userId: number): ServiceType[] {
    const stmt = this.db.prepare(`
      SELECT serviceType FROM user_services WHERE userId = ?
    `);

    const rows = stmt.all(userId.toString()) as any[];
    return rows.map((row) => row.serviceType as ServiceType);
  }

  async createUser(
    userId: number,
    entryPoint: EntryPoint = EntryPoint.DEFAULT,
    username?: string,
    firstName?: string,
    lastName?: string
  ): Promise<UserData> {
    const now = Date.now();
    const nowDate = new Date();
    const campaignId = Helpers.idGenerator();

    // Prepare statement
    const stmt = this.db.prepare(`
      INSERT INTO users (
        id, username, firstName, lastName, entryPoint, 
        state, lastVisit, lastActive, services, campaignId,
        testimonialsSent, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    // Execute insert
    stmt.run(
      userId.toString(),
      username || null,
      firstName || null,
      lastName || null,
      entryPoint,
      UserState.NEW,
      now,
      nowDate.toISOString(),
      JSON.stringify([]),
      campaignId,
      0,
      nowDate.toISOString(),
      nowDate.toISOString()
    );

    // Return the created user
    const userData: UserData = {
      id: userId.toString(),
      username,
      firstName,
      lastName,
      entryPoint,
      state: UserState.NEW,
      lastVisit: now,
      services: [],
      campaignId,
      lastActive: nowDate,
      testimonialsSent: 0,
      purchasedServices: [],
      createdAt: nowDate,
      updatedAt: nowDate,
    };

    return userData;
  }

  async updateUser(
    userId: number,
    updates: Partial<UserData>
  ): Promise<UserData> {
    // Get current user
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error(`User with ID ${userId} not found.`);
    }

    // Update the timestamp
    const now = new Date();

    // Start transaction
    const transaction = this.db.transaction(() => {
      // Update user table fields
      const userFieldsToUpdate = [
        "username",
        "firstName",
        "lastName",
        "entryPoint",
        "state",
        "selectedService",
        "lastVisit",
        "services",
        "campaignId",
        "testimonialsSent",
      ];

      const fieldsToSet: string[] = [];
      const values: any[] = [];

      // Add lastActive if present
      if (updates.lastActive) {
        fieldsToSet.push("lastActive = ?");
        values.push(updates.lastActive.toISOString());
      }

      userFieldsToUpdate.forEach((field) => {
        if (field in updates) {
          fieldsToSet.push(`${field} = ?`);
          const value =
            field === "services" && Array.isArray(updates.services)
              ? JSON.stringify(updates.services)
              : (updates as any)[field];
          values.push(value);
        }
      });

      // Add updatedAt field
      fieldsToSet.push("updatedAt = ?");
      values.push(now.toISOString());

      // Add userId for WHERE clause
      values.push(userId.toString());

      // Execute update if there are fields to update
      if (fieldsToSet.length > 0) {
        const updateQuery = `
          UPDATE users 
          SET ${fieldsToSet.join(", ")} 
          WHERE id = ?
        `;

        const updateStmt = this.db.prepare(updateQuery);
        updateStmt.run(...values);
      }

      // Handle purchased services update if needed
      if (updates.purchasedServices) {
        // First, get current services
        const currentServices = this.getUserPurchasedServices(userId);

        // Find services to add (ones in updates but not in current)
        const servicesToAdd = updates.purchasedServices.filter(
          (service) => !currentServices.includes(service)
        );

        // Add new services
        if (servicesToAdd.length > 0) {
          const insertServiceStmt = this.db.prepare(`
            INSERT OR IGNORE INTO user_services (userId, serviceType, purchasedAt)
            VALUES (?, ?, ?)
          `);

          for (const service of servicesToAdd) {
            insertServiceStmt.run(
              userId.toString(),
              service,
              now.toISOString()
            );

            // Update service stats
            this.incrementServiceStat(service);
          }
        }
      }
    });

    // Execute transaction
    transaction();

    // Return updated user - get fresh from database
    const updatedUser = await this.getUser(userId);
    if (!updatedUser) {
      throw new Error(`Failed to update user with ID ${userId}`);
    }

    return updatedUser;
  }

  private incrementServiceStat(serviceType: ServiceType): void {
    const stmt = this.db.prepare(`
      UPDATE service_stats
      SET count = count + 1
      WHERE serviceType = ?
    `);

    stmt.run(serviceType);
  }

  async getUsersByState(state: UserState): Promise<UserData[]> {
    const stmt = this.db.prepare(`
      SELECT id FROM users WHERE state = ?
    `);

    const rows = stmt.all(state) as any[];

    // Get full user data for each ID
    const users: UserData[] = [];
    for (const row of rows) {
      const user = await this.getUser(parseInt(row.id));
      if (user) users.push(user);
    }

    return users;
  }

  async getUsersByService(service: ServiceType): Promise<UserData[]> {
    const stmt = this.db.prepare(`
      SELECT DISTINCT u.id 
      FROM users u
      LEFT JOIN user_services us ON u.id = us.userId
      WHERE u.selectedService = ? OR us.serviceType = ?
    `);

    const rows = stmt.all(service, service) as any[];

    // Get full user data for each ID
    const users: UserData[] = [];
    for (const row of rows) {
      const user = await this.getUser(parseInt(row.id));
      if (user) users.push(user);
    }

    return users;
  }

  // Follow-up methods
  async createFollowUp(followUp: FollowUpInfo): Promise<FollowUpInfo> {
    const stmt = this.db.prepare(`
      INSERT INTO follow_ups (
        userId, serviceType, messageNumber, sentAt, 
        scheduledDate, messageId, cancelled
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      followUp.userId.toString(),
      followUp.serviceType,
      followUp.messageNumber || null,
      followUp.sentAt ? followUp.sentAt.toISOString() : null,
      followUp.scheduledDate ? followUp.scheduledDate.toISOString() : null,
      followUp.messageId || null,
      followUp.cancelled ? 1 : 0
    );

    // Get the inserted ID
    const id = result.lastInsertRowid as number;

    // Return the full follow-up object
    return {
      ...followUp,
      id,
    } as FollowUpInfo;
  }

  async getFollowUps(userId: number): Promise<FollowUpInfo[]> {
    const stmt = this.db.prepare(`
      SELECT * FROM follow_ups WHERE userId = ?
    `);

    const rows = stmt.all(userId.toString()) as any[];

    // Convert rows to FollowUpInfo objects
    return rows.map((row) => ({
      id: row.id,
      userId: row.userId,
      serviceType: row.serviceType as ServiceType,
      messageNumber: row.messageNumber,
      sentAt: row.sentAt ? new Date(row.sentAt) : undefined,
      scheduledDate: row.scheduledDate
        ? new Date(row.scheduledDate)
        : undefined,
      messageId: row.messageId,
      cancelled: Boolean(row.cancelled),
    }));
  }

  async updateFollowUp(
    userId: number,
    serviceType: ServiceType,
    updates: Partial<FollowUpInfo>
  ): Promise<FollowUpInfo | undefined> {
    // Find the follow-up
    const stmt = this.db.prepare(`
      SELECT * FROM follow_ups 
      WHERE userId = ? AND serviceType = ? AND cancelled = 0
      ORDER BY id DESC LIMIT 1
    `);

    const row = stmt.get(userId.toString(), serviceType) as any;

    if (!row) return undefined;

    // Prepare update fields
    const fieldsToSet: string[] = [];
    const values: any[] = [];

    if ("messageNumber" in updates) {
      fieldsToSet.push("messageNumber = ?");
      values.push(updates.messageNumber);
    }

    if ("sentAt" in updates) {
      fieldsToSet.push("sentAt = ?");
      values.push(updates.sentAt ? updates.sentAt.toISOString() : null);
    }

    if ("scheduledDate" in updates) {
      fieldsToSet.push("scheduledDate = ?");
      values.push(
        updates.scheduledDate ? updates.scheduledDate.toISOString() : null
      );
    }

    if ("messageId" in updates) {
      fieldsToSet.push("messageId = ?");
      values.push(updates.messageId);
    }

    if ("cancelled" in updates) {
      fieldsToSet.push("cancelled = ?");
      values.push(updates.cancelled ? 1 : 0);
    }

    // Add ID for WHERE clause
    values.push(row.id);

    // Execute update if there are fields to update
    if (fieldsToSet.length > 0) {
      const updateQuery = `
        UPDATE follow_ups 
        SET ${fieldsToSet.join(", ")} 
        WHERE id = ?
      `;

      const updateStmt = this.db.prepare(updateQuery);
      updateStmt.run(...values);
    }

    // Get the updated follow-up
    const getUpdatedStmt = this.db.prepare(`
      SELECT * FROM follow_ups WHERE id = ?
    `);

    const updatedRow = getUpdatedStmt.get(row.id) as any;

    // Convert to FollowUpInfo object
    return {
      id: updatedRow.id,
      userId: updatedRow.userId,
      serviceType: updatedRow.serviceType as ServiceType,
      messageNumber: updatedRow.messageNumber,
      sentAt: updatedRow.sentAt ? new Date(updatedRow.sentAt) : undefined,
      scheduledDate: updatedRow.scheduledDate
        ? new Date(updatedRow.scheduledDate)
        : undefined,
      messageId: updatedRow.messageId,
      cancelled: Boolean(updatedRow.cancelled),
    };
  }

  async cancelAllFollowUps(userId: number): Promise<void> {
    const stmt = this.db.prepare(`
      UPDATE follow_ups
      SET cancelled = 1
      WHERE userId = ?
    `);

    stmt.run(userId.toString());
  }

  // Stats methods
  async getTotalUsers(): Promise<number> {
    const stmt = this.db.prepare(`
      SELECT COUNT(*) as count FROM users
    `);

    const result = stmt.get() as any;
    return result.count;
  }

  async getPurchasedServicesCount(): Promise<Record<ServiceType, number>> {
    const stmt = this.db.prepare(`
      SELECT serviceType, count FROM service_stats
    `);

    const rows = stmt.all() as any[];

    // Convert to record
    const result: Record<ServiceType, number> = {
      [ServiceType.SIGNAL]: 0,
      [ServiceType.VIP]: 0,
      [ServiceType.X10_CHALLENGE]: 0,
      [ServiceType.COPYTRADE]: 0,
    };

    rows.forEach((row) => {
      result[row.serviceType as ServiceType] = row.count;
    });

    return result;
  }

  // Close database connection
  closeConnection(): void {
    this.db.close();
  }

  /**
   * Migrate in-memory data to SQLite (for testing purposes)
   * @param users List of in-memory users to migrate
   * @param followUps List of in-memory follow-ups to migrate
   */
  async migrateData(
    users: UserData[],
    followUps: FollowUpInfo[]
  ): Promise<void> {
    // Begin transaction
    const transaction = this.db.transaction(() => {
      // Migrate users
      for (const user of users) {
        // Insert user
        const insertUserStmt = this.db.prepare(`
          INSERT OR IGNORE INTO users (
            id, username, firstName, lastName, entryPoint, state,
            selectedService, lastVisit, lastActive, services, campaignId,
            testimonialsSent, createdAt, updatedAt
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        const lastActive = user.lastActive?.toISOString() || null;
        const services = JSON.stringify(user.services || []);
        const testimonialsSent = user.testimonialsSent || 0;
        const createdAt = user.createdAt?.toISOString() || null;
        const updatedAt = user.updatedAt?.toISOString() || null;

        insertUserStmt.run(
          user.id,
          user.username,
          user.firstName,
          user.lastName,
          user.entryPoint,
          user.state,
          user.selectedService,
          user.lastVisit,
          lastActive,
          services,
          user.campaignId,
          testimonialsSent,
          createdAt,
          updatedAt
        );

        // Insert purchased services
        if (user.purchasedServices && user.purchasedServices.length > 0) {
          const insertServiceStmt = this.db.prepare(`
            INSERT OR IGNORE INTO user_services (userId, serviceType, purchasedAt)
            VALUES (?, ?, ?)
          `);

          for (const service of user.purchasedServices) {
            insertServiceStmt.run(
              user.id,
              service,
              updatedAt || new Date().toISOString()
            );

            // Update service stats
            this.incrementServiceStat(service);
          }
        }
      }

      // Migrate follow-ups
      for (const followUp of followUps) {
        const insertFollowUpStmt = this.db.prepare(`
          INSERT OR IGNORE INTO follow_ups (
            userId, serviceType, messageNumber, sentAt, 
            scheduledDate, messageId, cancelled
          ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `);

        insertFollowUpStmt.run(
          followUp.userId.toString(),
          followUp.serviceType,
          followUp.messageNumber || null,
          followUp.sentAt ? followUp.sentAt.toISOString() : null,
          followUp.scheduledDate ? followUp.scheduledDate.toISOString() : null,
          followUp.messageId || null,
          followUp.cancelled ? 1 : 0
        );
      }
    });

    // Execute transaction
    transaction();

    console.log(
      `Migration complete: ${users.length} users and ${followUps.length} follow-ups migrated.`
    );
  }
}

// Singleton instance
export const database = new DatabaseService();
