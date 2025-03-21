import { runMigrations, rollbackMigrations } from "./migrationRunner";

// Get command line arguments
const args = process.argv.slice(2);
const command = args[0];
const steps = parseInt(args[1] || "1", 10);

async function main() {
  try {
    switch (command) {
      case "up":
        await runMigrations();
        break;
      case "down":
        await rollbackMigrations(steps);
        break;
      default:
        console.log("Usage:");
        console.log("  npm run migrate:up    - Run all pending migrations");
        console.log("  npm run migrate:down  - Rollback last migration");
        console.log("  npm run migrate:down N - Rollback N migrations");
        process.exit(1);
    }
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

main();
