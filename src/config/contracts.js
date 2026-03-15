// ─── ABIs ────────────────────────────────────────────────────────────────────

export const VAULT_ABI = [
  // Read
  { inputs: [], name: "activePool", outputs: [{ type: "address" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "totalDeposited", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "user", type: "address" }], name: "getUserBalance", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "getRegisteredPools", outputs: [{ type: "address[]" }], stateMutability: "view", type: "function" },
  // Write
  { inputs: [{ name: "amount", type: "uint256" }], name: "deposit", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "amount", type: "uint256" }], name: "withdraw", outputs: [], stateMutability: "nonpayable", type: "function" },
  // Events
  { anonymous: false, inputs: [{ indexed: true, name: "user", type: "address" }, { name: "amount", type: "uint256" }], name: "Deposited", type: "event" },
  { anonymous: false, inputs: [{ indexed: true, name: "user", type: "address" }, { name: "amount", type: "uint256" }], name: "Withdrawn", type: "event" },
  { anonymous: false, inputs: [{ indexed: true, name: "fromPool", type: "address" }, { indexed: true, name: "toPool", type: "address" }, { name: "amount", type: "uint256" }, { name: "agentReason", type: "string" }], name: "Rebalanced", type: "event" },
];

export const POOL_ABI = [
  { inputs: [], name: "poolName", outputs: [{ type: "string" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "poolType", outputs: [{ type: "string" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "aprBps", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "totalDeposits", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
];

export const ERC20_ABI = [
  { inputs: [{ name: "account", type: "address" }], name: "balanceOf", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "spender", type: "address" }, { name: "amount", type: "uint256" }], name: "approve", outputs: [{ type: "bool" }], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "owner", type: "address" }, { name: "spender", type: "address" }], name: "allowance", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "to", type: "address" }, { name: "amount", type: "uint256" }], name: "faucet", outputs: [], stateMutability: "nonpayable", type: "function" },
];

// ─── POOL METADATA (display info — fill after deploy) ────────────────────────
export const POOL_META = {
  AlphaLend: {
    icon: "AL",
    color: "#00ff88",
    bg: "rgba(0,255,136,0.12)",
    risk: "Low",
  },
  KuruSwap: {
    icon: "KS",
    color: "#00e5ff",
    bg: "rgba(0,229,255,0.12)",
    risk: "Medium",
  },
  MonoVault: {
    icon: "MV",
    color: "#ffd166",
    bg: "rgba(255,209,102,0.12)",
    risk: "Low",
  },
};

// ─── ADDRESSES ───────────────────────────────────────────────────────────────
// Populated via VITE_ environment variables (set in .env or Vercel dashboard)
// After deploying contracts, add these to frontend/.env (or Vercel env vars):
//
//   VITE_VAULT_ADDRESS=0x...
//   VITE_USDC_ADDRESS=0x...
//   VITE_POOL_ALPHALEND=0x...
//   VITE_POOL_KURUSWAP=0x...
//   VITE_POOL_MONOVAULT=0x...

export const ADDRESSES = {
  Vault:    import.meta.env.VITE_VAULT_ADDRESS   || "",
  MockUSDC: import.meta.env.VITE_USDC_ADDRESS    || "",
  pools: {
    AlphaLend: import.meta.env.VITE_POOL_ALPHALEND  || "",
    KuruSwap:  import.meta.env.VITE_POOL_KURUSWAP   || "",
    MonoVault: import.meta.env.VITE_POOL_MONOVAULT  || "",
  },
};
