import { use, useEffect } from 'react';
import { useAppKitConnection } from '@reown/appkit-adapter-solana/react';
import * as web3 from '@ywwwtseng/web3';
import { getBalance } from 'wagmi/actions';
import { Actions } from 'wagmi/tempo';
import { useConfig } from 'wagmi';
import { Address } from 'viem';
import { WalletKitConnectContext } from '../WalletKitConnectProvider';
import { Token } from '../types';

export function useBalance(token?: Token | null) {
  const config = useConfig();
  const { balances, setBalances, getAccount, getNetwork } = use(WalletKitConnectContext);

  const { connection } = useAppKitConnection();

  useEffect(() => {
    if (!token) {
      return;
    }

    const account = getAccount(token.network);
    if (!account || !account.address || !account.isConnected) {
      return;
    }

    if (token.network === 'solana') {
      if (!connection) {
        return;
      }

      web3.utils.solana.getBalance(connection, {
        address: account.address as string,
        tokenAddress: token.token_address,
        tokenProgram: token.token_program,
      }).then((balance) => {
        setBalances({ [token.id]: String(balance) });
      });
    } else if (token.network) {


      const network = getNetwork(token.network);

      if (!network) {
        throw Error('network not found');
      }

      if (token.token_address) {
        Actions.token.getBalance(config, {
          account: account.address as Address,
          token: token.token_address as Address,
          chainId: network.id as number,
        }).then((balance) => {
          setBalances({ [token.id]: String(balance) });
        });

      } else {
        getBalance(config, {
          address: account.address as Address,
          chainId: network.id as number,
        }).then((balance) => {
          setBalances({ [token.id]: String(balance.value) });
        });
      }
    }
  }, [token]);

  return token ? balances[token.id] : undefined;
};