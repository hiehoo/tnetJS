import { database } from "../services/database";
import { ServiceType } from "../types";

export async function up(): Promise<void> {
  console.log("Running migration: 001_initial_schema");

  // Create users table
  database.db.exec(`
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

  // Create user_services table
  database.db.exec(`
    CREATE TABLE IF NOT EXISTS user_services (
      userId TEXT NOT NULL,
      serviceType TEXT NOT NULL,
      purchasedAt TEXT NOT NULL,
      PRIMARY KEY (userId, serviceType),
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Create follow_ups table
  database.db.exec(`
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

  // Create service_stats table
  database.db.exec(`
    CREATE TABLE IF NOT EXISTS service_stats (
      serviceType TEXT PRIMARY KEY,
      count INTEGER DEFAULT 0
    )
  `);

  // Initialize service stats
  const serviceTypes = [
    ServiceType.SIGNAL,
    ServiceType.VIP,
    ServiceType.X10_CHALLENGE,
    ServiceType.COPYTRADE,
  ];

  const statsInitStmt = database.db.prepare(`
    INSERT OR IGNORE INTO service_stats (serviceType, count)
    VALUES (?, 0)
  `);

  const initTransaction = database.db.transaction(() => {
    for (const serviceType of serviceTypes) {
      statsInitStmt.run(serviceType);
    }
  });

  initTransaction();

  console.log("Migration 001_initial_schema completed successfully");
}

export async function down(): Promise<void> {
  console.log("Rolling back migration: 001_initial_schema");

  // Drop tables in reverse order of creation
  database.db.exec("DROP TABLE IF EXISTS service_stats");
  database.db.exec("DROP TABLE IF EXISTS follow_ups");
  database.db.exec("DROP TABLE IF EXISTS user_services");
  database.db.exec("DROP TABLE IF EXISTS users");

  console.log("Rollback 001_initial_schema completed successfully");
}
