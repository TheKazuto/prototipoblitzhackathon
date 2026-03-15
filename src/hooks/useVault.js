import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount } from "wagmi";
import { parseUnits, formatUnits } from "viem";
import { VAULT_ABI, ERC20_ABI, ADDRESSES } from "../config/contracts";
import { monadTestnet } from "../config/wagmi";

const VAULT = ADDRESSES.Vault;
const USDC = ADDRESSES.MockUSDC;
const CHAIN = monadTestnet.id;

// ─── READ HOOKS ──────────────────────────────────────────────────────────────

export function useUserBalance(address) {
  return useReadContract({
    address: VAULT,
    abi: VAULT_ABI,
    functionName: "getUserBalance",
    args: [address],
    chainId: CHAIN,
    query: { enabled: !!address && !!VAULT },
  });
}

export function useTotalDeposited() {
  return useReadContract({
    address: VAULT,
    abi: VAULT_ABI,
    functionName: "totalDeposited",
    chainId: CHAIN,
    query: { enabled: !!VAULT },
  });
}

export function useActivePool() {
  return useReadContract({
    address: VAULT,
    abi: VAULT_ABI,
    functionName: "activePool",
    chainId: CHAIN,
    query: { enabled: !!VAULT },
  });
}

export function useRegisteredPools() {
  return useReadContract({
    address: VAULT,
    abi: VAULT_ABI,
    functionName: "getRegisteredPools",
    chainId: CHAIN,
    query: { enabled: !!VAULT },
  });
}

export function useUSDCBalance(address) {
  return useReadContract({
    address: USDC,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: [address],
    chainId: CHAIN,
    query: { enabled: !!address && !!USDC },
  });
}

export function useAllowance(address) {
  return useReadContract({
    address: USDC,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: [address, VAULT],
    chainId: CHAIN,
    query: { enabled: !!address && !!USDC && !!VAULT },
  });
}

// ─── WRITE HOOKS ─────────────────────────────────────────────────────────────

export function useDeposit() {
  const { writeContractAsync, isPending, data: hash } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const deposit = async (amountUsdc) => {
    const amount = parseUnits(amountUsdc, 6);
    return writeContractAsync({
      address: VAULT,
      abi: VAULT_ABI,
      functionName: "deposit",
      args: [amount],
      chainId: CHAIN,
    });
  };

  return { deposit, isPending, isConfirming, isSuccess, hash };
}

export function useWithdraw() {
  const { writeContractAsync, isPending, data: hash } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const withdraw = async (amountUsdc) => {
    const amount = parseUnits(amountUsdc, 6);
    return writeContractAsync({
      address: VAULT,
      abi: VAULT_ABI,
      functionName: "withdraw",
      args: [amount],
      chainId: CHAIN,
    });
  };

  return { withdraw, isPending, isConfirming, isSuccess, hash };
}

export function useApprove() {
  const { writeContractAsync, isPending } = useWriteContract();

  const approve = async (amount) => {
    return writeContractAsync({
      address: USDC,
      abi: ERC20_ABI,
      functionName: "approve",
      args: [VAULT, parseUnits(amount, 6)],
      chainId: CHAIN,
    });
  };

  return { approve, isPending };
}

export function useFaucet() {
  const { address } = useAccount();
  const { writeContractAsync, isPending } = useWriteContract();

  const mint = async () => {
    return writeContractAsync({
      address: USDC,
      abi: ERC20_ABI,
      functionName: "faucet",
      args: [address, parseUnits("10000", 6)],
      chainId: CHAIN,
    });
  };

  return { mint, isPending };
}

// ─── UTILS ───────────────────────────────────────────────────────────────────
export const fmt6 = (val) =>
  val ? Number(formatUnits(val, 6)).toLocaleString("en", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00";
