# 🧠 YieldMind — AI Yield Optimizer on Monad

> Autonomous DeFi yield optimization powered by an AI agent on Monad Testnet.
> Built for hackathon — deposits USDC into the highest-yielding pool, rebalanced daily by Claude AI.

![Monad Testnet](https://img.shields.io/badge/Network-Monad%20Testnet-8B5CF6)
![License](https://img.shields.io/badge/License-MIT-green)

---

## ✨ How it works

```
User deposits USDC
        ↓
   Vault Contract (Monad)
        ↓
   AI Keeper Agent runs every 24h:
   1. Reads APRs from all MockPools on-chain
   2. Sends data to Claude API for analysis
   3. Claude reasons about risk, TVL, yield delta
   4. If better pool found → calls rebalance() on Vault
        ↓
   Funds always in the best pool
```

---

## 🏗 Project Structure

```
yieldmind/
├── frontend/          React + Vite + wagmi + RainbowKit  → Vercel
├── contracts/         Solidity (Hardhat)                  → Monad Testnet
└── agent/             Node.js AI Keeper                   → Railway / Render
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- A wallet with Monad Testnet MON (faucet: https://faucet.monad.xyz)
- Anthropic API key (https://console.anthropic.com)
- WalletConnect Project ID (https://cloud.walletconnect.com) — free

---

### Step 1 — Deploy Contracts

```bash
cd contracts
npm install
cp .env.example .env
# Fill in PRIVATE_KEY in .env
npm run deploy
```

This deploys:
- `MockUSDC` — test ERC20 with faucet function
- `MockPool` × 3 — AlphaLend, KuruSwap, MonoVault (configurable APRs)
- `Vault` — custodial vault with AI-controlled `rebalance()`

After deploy, `deployments.json` is auto-generated and copied to `frontend/src/config/`.

---

### Step 2 — Frontend (local)

```bash
cd frontend
npm install
cp .env.example .env
# Fill in VITE_WALLETCONNECT_PROJECT_ID
npm run dev
# → http://localhost:5173
```

#### Deploy to Vercel
1. Push repo to GitHub
2. Import project in Vercel
3. Set **Root Directory** → `frontend`
4. Add env variable: `VITE_WALLETCONNECT_PROJECT_ID`
5. Deploy ✓

---

### Step 3 — AI Agent

```bash
cd agent
npm install
cp .env.example .env
# Fill in PRIVATE_KEY (keeper wallet) + ANTHROPIC_API_KEY
# Copy deployments.json from contracts/ into agent/
cp ../contracts/deployments.json ./deployments.json
npm start
```

For dev/demo — run every minute instead of 24h:
```bash
AGENT_CRON="*/1 * * * *" npm start
```

#### Deploy to Railway
1. Create new project → Deploy from GitHub
2. Set root directory to `agent/`
3. Add env variables: `PRIVATE_KEY`, `ANTHROPIC_API_KEY`, `MONAD_RPC_URL`
4. Deploy ✓

---

## 🔧 Contracts

| Contract   | Description                                      |
|------------|--------------------------------------------------|
| `Vault`    | Custodial vault. Users deposit/withdraw USDC. Only `keeper` can call `rebalance()` |
| `MockPool` | Simulated yield pool with configurable APR (set via `setApr()`) |
| `MockUSDC` | Test ERC20 with public `faucet()` — mint free test tokens |

### Key Functions

```solidity
// Vault.sol
vault.deposit(uint256 amount)                           // user deposits
vault.withdraw(uint256 amount)                          // user withdraws
vault.rebalance(address newPool, string reason)         // keeper only
vault.getUserBalance(address user) → uint256
vault.activePool() → address

// MockPool.sol
pool.setApr(uint256 aprBps)   // owner sets APR (e.g. 1250 = 12.50%)
pool.aprBps() → uint256

// MockUSDC.sol
usdc.faucet(address to, uint256 amount)   // anyone can mint test tokens
```

---

## 🤖 AI Agent

The keeper agent:
1. Reads on-chain APR data from all registered pools every 24h
2. Builds a prompt with pool data, TVL, risk, and current allocation
3. Sends to Claude claude-sonnet-4-20250514 for a REBALANCE / HOLD decision
4. If REBALANCE — signs and submits `vault.rebalance(newPool, reasoning)`
5. The `reasoning` string from Claude is stored on-chain in the event log

### Claude Prompt Logic
The agent instructs Claude to:
- Identify the highest risk-adjusted APR
- Only rebalance if net gain > 0.5% (gas justification)
- Explain the decision in plain English (shown to users in the UI)
- Respond strictly as JSON for safe parsing

---

## 🌐 Tech Stack

| Layer      | Tech                                              |
|------------|---------------------------------------------------|
| Frontend   | React 18, Vite, wagmi v2, RainbowKit, TanStack Query |
| Contracts  | Solidity 0.8.20, OpenZeppelin 5, Hardhat          |
| Agent      | Node.js, Anthropic SDK, ethers v6, node-cron      |
| Network    | Monad Testnet (Chain ID: 10143)                   |
| Deploy     | Vercel (frontend) + Railway (agent)               |

---

## 📄 License

MIT
