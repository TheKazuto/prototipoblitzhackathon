import { useReadContracts } from "wagmi";
import { POOL_ABI, POOL_META, ADDRESSES } from "../config/contracts";
import { monadTestnet } from "../config/wagmi";

const CHAIN = monadTestnet.id;

/**
 * Given a list of pool addresses, reads name/type/APR/TVL for each.
 * Falls back to mock data if contracts are not yet deployed.
 */
export function usePools(poolAddresses = []) {
  const contracts = poolAddresses.flatMap((addr) => [
    { address: addr, abi: POOL_ABI, functionName: "poolName", chainId: CHAIN },
    { address: addr, abi: POOL_ABI, functionName: "poolType", chainId: CHAIN },
    { address: addr, abi: POOL_ABI, functionName: "aprBps", chainId: CHAIN },
    { address: addr, abi: POOL_ABI, functionName: "totalDeposits", chainId: CHAIN },
  ]);

  const { data, isLoading, refetch } = useReadContracts({
    contracts,
    query: { enabled: poolAddresses.length > 0, refetchInterval: 5000 },
  });

  const pools = poolAddresses.map((addr, i) => {
    const base = i * 4;
    const name = data?.[base]?.result || getNameFromAddresses(addr);
    const type = data?.[base + 1]?.result || "Unknown";
    const aprBps = Number(data?.[base + 2]?.result || 0);
    const tvlRaw = BigInt(data?.[base + 3]?.result || 0n);
    const aprPercent = aprBps / 100;
    const tvlUsdc = Number(tvlRaw) / 1e6;
    const meta = POOL_META[name] || { icon: "??", color: "#888", bg: "rgba(128,128,128,0.1)", risk: "Unknown" };

    return {
      address: addr,
      name,
      type,
      aprPercent,
      tvlUsdc,
      ...meta,
    };
  });

  return { pools, isLoading, refetch };
}

function getNameFromAddresses(addr) {
  const pools = ADDRESSES.pools || {};
  for (const [name, a] of Object.entries(pools)) {
    if (a.toLowerCase() === addr.toLowerCase()) return name;
  }
  return addr.slice(0, 8) + "…";
}

// ─── MOCK DATA (used when contracts not yet deployed) ────────────────────────
export const MOCK_POOLS = [
  {
    address: "0x0000000000000000000000000000000000000001",
    name: "AlphaLend",
    type: "Lending",
    aprPercent: 8.4,
    tvlUsdc: 4200000,
    icon: "AL",
    color: "#00ff88",
    bg: "rgba(0,255,136,0.12)",
    risk: "Low",
  },
  {
    address: "0x0000000000000000000000000000000000000002",
    name: "KuruSwap",
    type: "AMM / LP",
    aprPercent: 12.1,
    tvlUsdc: 2700000,
    icon: "KS",
    color: "#00e5ff",
    bg: "rgba(0,229,255,0.12)",
    risk: "Medium",
  },
  {
    address: "0x0000000000000000000000000000000000000003",
    name: "MonoVault",
    type: "Yield Vault",
    aprPercent: 6.8,
    tvlUsdc: 1100000,
    icon: "MV",
    color: "#ffd166",
    bg: "rgba(255,209,102,0.12)",
    risk: "Low",
  },
];
