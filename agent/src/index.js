require("dotenv").config();
const cron = require("node-cron");
const { runKeeper } = require("./keeper");

console.log("🤖 YieldMind AI Agent starting...");
console.log("📡 Network: Monad Testnet");
console.log("⏰ Schedule: every 24h (or AGENT_INTERVAL env for testing)\n");

// Run immediately on start
runKeeper();

// Schedule: every 24h by default, or use AGENT_INTERVAL for dev (e.g. "*/1 * * * *" = every minute)
const schedule = process.env.AGENT_CRON || "0 0 * * *";
cron.schedule(schedule, () => {
  console.log(`\n[${new Date().toISOString()}] ⏰ Scheduled run triggered`);
  runKeeper();
});
