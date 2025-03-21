import { database } from "../services/database";

export async function up(): Promise<void> {
  console.log("Running migration: 002_add_source_column");

  try {
    // Add source column with default value 'teleads'
    database.database.exec(`
      ALTER TABLE users 
      ADD COLUMN source TEXT 
      CHECK(source IN ('facebook_ads', 'telegram_ads', 'google_ads', 'youtube_ads', 'instagram_ads', 'tiktok_ads', 'x_ads', 'adsgram')) 
      DEFAULT 'telegram_ads'
    `);

    console.log("Migration 002_add_source_column completed successfully");
  } catch (error) {
    console.error("Migration 002_add_source_column failed:", error);
    throw error;
  }
}

export async function down(): Promise<void> {
  console.log("Rolling back migration: 002_add_source_column");

  try {
    // Drop the source column
    database.database.exec(`
      ALTER TABLE users DROP COLUMN source
    `);

    console.log("Rollback 002_add_source_column completed successfully");
  } catch (error) {
    console.error("Rollback 002_add_source_column failed:", error);
    throw error;
  }
}
