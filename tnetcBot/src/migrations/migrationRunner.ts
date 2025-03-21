import { database } from "../services/database";
import * as initialSchema from "./001_initial_schema";
import * as addSourceColumn from "./002_add_source_column";

// Add new migrations here
const migrations = [
  {
    id: "001_initial_schema",
    up: initialSchema.up,
    down: initialSchema.down,
  },
  {
    id: "002_add_source_column",
    up: addSourceColumn.up,
    down: addSourceColumn.down,
  },
  // Add more migrations here as needed
];

export async function runMigrations(): Promise<void> {
  console.log("Starting database migrations...");

  try {
    // Create migrations table if it doesn't exist
    database.db.exec(`
      CREATE TABLE IF NOT EXISTS migrations (
        id TEXT PRIMARY KEY,
        executed_at TEXT NOT NULL
      )
    `);

    // Get executed migrations
    const executedMigrations = database.db
      .prepare("SELECT id FROM migrations")
      .all() as { id: string }[];

    // Run pending migrations
    for (const migration of migrations) {
      if (!executedMigrations.find((m) => m.id === migration.id)) {
        console.log(`Running migration: ${migration.id}`);
        await migration.up();

        // Record migration
        database.db
          .prepare("INSERT INTO migrations (id, executed_at) VALUES (?, ?)")
          .run(migration.id, new Date().toISOString());

        console.log(`Migration ${migration.id} completed successfully`);
      }
    }

    console.log("All migrations completed successfully");
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  }
}

export async function rollbackMigrations(steps: number = 1): Promise<void> {
  console.log(`Rolling back ${steps} migration(s)...`);

  try {
    // Get executed migrations in reverse order
    const executedMigrations = database.db
      .prepare("SELECT id FROM migrations ORDER BY executed_at DESC")
      .all() as { id: string }[];

    // Rollback specified number of migrations
    for (let i = 0; i < steps && i < executedMigrations.length; i++) {
      const migrationId = executedMigrations[i].id;
      const migration = migrations.find((m) => m.id === migrationId);

      if (migration) {
        console.log(`Rolling back migration: ${migrationId}`);
        await migration.down();

        // Remove migration record
        database.db
          .prepare("DELETE FROM migrations WHERE id = ?")
          .run(migrationId);

        console.log(`Rollback of ${migrationId} completed successfully`);
      }
    }

    console.log("Rollback completed successfully");
  } catch (error) {
    console.error("Rollback failed:", error);
    throw error;
  }
}

// Example usage:
// To run migrations:
// runMigrations().catch(console.error);

// To rollback last migration:
// rollbackMigrations().catch(console.error);

// To rollback multiple migrations:
// rollbackMigrations(3).catch(console.error);
