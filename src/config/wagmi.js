import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { defineChain } from "viem";

// ─── Monad Testnet Chain Definition ─────────────────────────────────────────
export const monadTestnet = defineChain({
  id: 10143,
  name: "Monad Testnet",
  nativeCurrency: { name: "Monad", symbol: "MON", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://testnet-rpc.monad.xyz"] },
  },
  blockExplorers: {
    default: {
      name: "Monad Explorer",
      url: "https://testnet.monadexplorer.com",
    },
  },
  testnet: true,
});

// ─── Wagmi Config ────────────────────────────────────────────────────────────
export const wagmiConfig = getDefaultConfig({
  appName: "YieldMind",
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || "demo-project-id",
  chains: [monadTestnet],
  ssr: false,
});
