const { ethers } = require("ethers");
const Anthropic = require("@anthropic-ai/sdk");
const deployments = require("../deployments.json");

// ─── ABIs (minimal) ──────────────────────────────────────────────────────────
const VAULT_ABI = [
  "function rebalance(address newPool, string calldata agentReason) external",
  "function activePool() external view returns (address)",
  "function totalDeposited() external view returns (uint256)",
  "function getRegisteredPools() external view returns (address[])",
  "event Rebalanced(address indexed fromPool, address indexed toPool, uint256 amount, string agentReason)",
];

const POOL_ABI = [
  "function poolName() external view returns (string)",
  "function poolType() external view returns (string)",
  "function aprBps() external view returns (uint256)",
  "function totalDeposits() external view returns (uint256)",
];

// ─── SETUP ───────────────────────────────────────────────────────────────────
const provider = new ethers.JsonRpcProvider(
  process.env.MONAD_RPC_URL || "https://testnet-rpc.monad.xyz"
);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ─── MAIN ────────────────────────────────────────────────────────────────────
async function runKeeper() {
  console.log("─".repeat(60));
  console.log(`[${new Date().toISOString()}] 🔄 Running AI keeper cycle`);

  try {
    // ── 1. Connect to vault ──────────────────────────────────────
    const vaultAddr = deployments.contracts.Vault;
    const vault = new ethers.Contract(vaultAddr, VAULT_ABI, wallet);

    const activePoolAddr = await vault.activePool();
    const totalDeposited = await vault.totalDeposited();
    const poolAddrs = await vault.getRegisteredPools();

    console.log(`\n📦 Vault: ${vaultAddr}`);
    console.log(`💰 Total deposited: ${ethers.formatUnits(totalDeposited, 6)} USDC`);
    console.log(`🏦 Active pool: ${activePoolAddr}`);

    // ── 2. Fetch APRs from all registered pools ──────────────────
    console.log("\n📊 Fetching pool data...");
    const poolData = [];

    for (const addr of poolAddrs) {
      const pool = new ethers.Contract(addr, POOL_ABI, provider);
      const [name, type, aprBps, tvl] = await Promise.all([
        pool.poolName(),
        pool.poolType(),
        pool.aprBps(),
        pool.totalDeposits(),
      ]);

      const aprPercent = Number(aprBps) / 100;
      poolData.push({
        address: addr,
        name,
        type,
        aprPercent,
        tvlUsdc: Number(ethers.formatUnits(tvl, 6)),
        isActive: addr.toLowerCase() === activePoolAddr.toLowerCase(),
      });

      console.log(`  ${name} (${type}): ${aprPercent.toFixed(2)}% APR | TVL: $${poolData[poolData.length - 1].tvlUsdc.toLocaleString()}`);
    }

    // ── 3. Ask Claude to decide ──────────────────────────────────
    console.log("\n🤖 Consulting AI agent...");
    const decision = await consultClaude(poolData, Number(ethers.formatUnits(totalDeposited, 6)));

    console.log(`\n💡 AI Decision: ${decision.action}`);
    console.log(`📝 Reasoning: ${decision.reasoning}`);

    // ── 4. Execute rebalance if needed ───────────────────────────
    if (
      decision.action === "REBALANCE" &&
      decision.targetPool &&
      decision.targetPool.toLowerCase() !== activePoolAddr.toLowerCase()
    ) {
      console.log(`\n⚡ Executing rebalance → ${decision.targetPoolName}...`);

      const tx = await vault.rebalance(decision.targetPool, decision.reasoning, {
        gasLimit: 500_000,
      });

      console.log(`  TX hash: ${tx.hash}`);
      const receipt = await tx.wait();
      console.log(`  ✅ Confirmed in block ${receipt.blockNumber}`);
    } else {
      console.log("\n✅ No rebalance needed — current pool is optimal");
    }

    console.log("\n✅ Keeper cycle complete");
    return decision;

  } catch (err) {
    console.error("\n❌ Keeper error:", err.message);
    if (process.env.NODE_ENV !== "production") console.error(err);
  }
}

// ─── CLAUDE DECISION ─────────────────────────────────────────────────────────
async function consultClaude(pools, totalUsdcDeposited) {
  const activePool = pools.find((p) => p.isActive);

  const prompt = `You are an autonomous DeFi yield optimization agent for the YieldMind protocol on Monad testnet.

Your job: analyze the current pool data and decide whether to rebalance funds.

## Current State
- Total funds under management: $${totalUsdcDeposited.toLocaleString()} USDC
- Active pool: ${activePool?.name || "none"} (${activePool?.aprPercent.toFixed(2)}% APR)

## Available Pools
${pools.map((p) => `- ${p.name} [${p.type}]: ${p.aprPercent.toFixed(2)}% APR | TVL: $${p.tvlUsdc.toLocaleString()} | ${p.isActive ? "ACTIVE ← current" : "available"}`).join("\n")}

## Decision Rules
1. Only rebalance if net APR gain > 0.5% (to justify gas costs)
2. Prefer stability — avoid constant switching
3. Consider TVL as a proxy for liquidity depth
4. Briefly explain your reasoning in plain English (max 2 sentences, will be shown to users)

## Response Format
Respond ONLY with valid JSON, no markdown, no extra text:
{
  "action": "REBALANCE" | "HOLD",
  "targetPool": "<pool_address_or_null>",
  "targetPoolName": "<pool_name_or_null>",
  "reasoning": "<2 sentence plain English explanation>"
}`;

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 300,
    messages: [{ role: "user", content: prompt }],
  });

  const raw = response.content[0].text.trim();

  try {
    return JSON.parse(raw);
  } catch {
    // Fallback: HOLD if parsing fails
    console.warn("⚠️  Could not parse AI response, defaulting to HOLD");
    return {
      action: "HOLD",
      targetPool: null,
      targetPoolName: null,
      reasoning: "Agent response parsing failed — holding current position as a precaution.",
    };
  }
}

module.exports = { runKeeper };
