import { getBalance, sendTransaction } from 'wagmi/actions';
import { Actions } from 'wagmi/tempo';
import { writeContract, readContract, type Config } from '@wagmi/core';
import type { Address, Abi } from 'viem';

export { useConfig as useWagmiConfig, useAccount as useWagmiAccount } from 'wagmi';

const ERC20_ABI = [
  {
    name: 'transfer',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ type: 'bool' }],
  },
  {
    type: 'function',
    name: 'balanceOf',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: 'balance', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'decimals',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint8' }],
  },
] as Abi;

export const sendWagmiTransaction = async (
  config: Config,
  {
    tokenAddress,
    to,
    amount,
    chainId,
  }: {
    tokenAddress?: Address;
    to: Address;
    amount: bigint | string;
    chainId: number;
  }
) => {
  if (tokenAddress) {
    return await writeContract(config, {
      address: tokenAddress,
      abi: ERC20_ABI,
      functionName: 'transfer',
      chainId,
      args: [to, typeof amount === 'string' ? BigInt(amount) : amount],
    } as any);
  } else {
    return await sendTransaction(config, {
      to,
      value: typeof amount === 'string' ? BigInt(amount) : amount,
      chainId,
    });
  }
};

export const getWagmiBalance = async (config: Config, { address, token, chainId }: { address: Address; token?: Address; chainId: number }) => {
  if (token) {
    const balance = await Actions.token.getBalance(config, {
      account: address,
      token: token,
    });

    return balance;
  } else {
    const balance = await getBalance(config, {
      address,
      chainId,
    });

    return balance.value;
  }
};
