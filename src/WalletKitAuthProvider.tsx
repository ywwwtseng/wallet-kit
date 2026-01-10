import { useCallback, useEffect, useState, useMemo, createContext, useRef } from 'react';

import type { Address } from 'viem';
import { type Views, useAppKitAccount, useDisconnect } from '@reown/appkit/react';
import { signMessage } from 'wagmi/actions';
import { useConnect } from './hooks/useConnect';
import { useWagmiConfig } from './wagmi';
import { getStoredJWT, clearStoredJWT, storeJWT, getSignMessage, isJWTExpired, getJWTExpirationTime } from './utils';
import { Status } from './constants';

export interface WalletKitAuthContextState {
  signIn: (view?: Views) => Promise<void>;
  signOut: () => Promise<void>;
  isSigningInProcessing: boolean;
  isLoggingOutProcessing: boolean;
  address: string | undefined;
  jwtToken: string | null;
  status: Status;
}

export const WalletKitAuthContext = createContext<WalletKitAuthContextState>({
  signIn: () => {
    throw new Error('signIn is not implemented');
  },
  signOut: () => {
    throw new Error('signOut is not implemented');
  },
  address: undefined,
  isSigningInProcessing: false,
  isLoggingOutProcessing: false,
  jwtToken: null,
  status: Status.PENDING,
});


export const WalletKitAuthProvider = ({
  url = '/console/api',
  appKey,
  onSignInSuccess,
  children,
}: {
  url?: string;
  appKey: string;
  onSignInSuccess?: () => void;
  children: React.ReactNode | ((state: WalletKitAuthContextState) => React.ReactNode);
}) => {
  const expirationTimerRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [jwtToken, setJwtToken] = useState<string | null>(null);
  const { disconnect } = useDisconnect();
  const { open } = useConnect();
  const ethersAccount = useAppKitAccount({ namespace: 'eip155' });
  const config = useWagmiConfig();
  const [initialized, setInitialized] = useState(false);
  const [isLoggingOutProcessing, setIsLoggingOutProcessing] = useState(false);
  const [isSigningInProcessing, setIsSigningInProcessing] = useState(false);

  const status = useMemo(() => {
    if (!initialized || isLoggingOutProcessing || isSigningInProcessing) return Status.PENDING;
    if (!!jwtToken && !!ethersAccount.address) return Status.AUTHENTICATED;
    return Status.UNAUTHENTICATED;
  }, [initialized, isLoggingOutProcessing, isSigningInProcessing, jwtToken, ethersAccount.address]);

  const signIn = useCallback(
    async (view?: Views) => {
      // 1. 打开钱包连接
      try {
        await open(view ?? 'ConnectingWalletConnectBasic');
      } catch (error) {
        console.error('Sign in error:', error);
        throw error;
      }
    },
    [open, ethersAccount.address, config]
  );

  const signOut = useCallback(async () => {
    setIsLoggingOutProcessing(true);
    // 清除定时器
    if (expirationTimerRef.current) {
      clearTimeout(expirationTimerRef.current);
      expirationTimerRef.current = null;
    }
    clearStoredJWT(appKey);
    setJwtToken(null);
    await disconnect();
    setIsLoggingOutProcessing(false);
  }, [appKey, disconnect]);

  // 设置 token 过期定时器
  const setupExpirationTimer = useCallback((token: string) => {
    // 清除旧的定时器
    if (expirationTimerRef.current) {
      clearTimeout(expirationTimerRef.current);
      expirationTimerRef.current = null;
    }

    const expirationTime = getJWTExpirationTime(token);
    if (!expirationTime) {
      return; // 无法获取过期时间，不设置定时器
    }

    const now = Date.now();
    const timeUntilExpiration = expirationTime - now;

    // 如果已经过期，立即清除
    if (timeUntilExpiration <= 0) {
      clearStoredJWT(appKey);
      setJwtToken(null);
      return;
    }

    // 设置定时器，在过期时清除 token
    expirationTimerRef.current = setTimeout(() => {
      clearStoredJWT(appKey);
      setJwtToken(null);
      expirationTimerRef.current = null;
    }, timeUntilExpiration);
  }, [appKey]);

  // 初始化时检查是否有存储的 JWT token
  useEffect(() => {
    if (isLoggingOutProcessing) return;
    // 只在正在连接且有地址时才跳过（避免断开连接过程中的 connecting 状态阻止初始化）
    if (ethersAccount.status === 'connecting') {
      reconnectTimerRef.current = setTimeout(async () => {
        await signOut();
        setInitialized(true);
      }, 5000);
      return;
    };

    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    setInitialized(false);
    const stored = getStoredJWT(appKey);

    if (stored && stored.address === ethersAccount.address) {
      // 检查 token 是否过期
      if (isJWTExpired(stored.token)) {
        clearStoredJWT(appKey);
        setJwtToken(null);
      } else {
        setJwtToken(stored.token);
        setupExpirationTimer(stored.token);
      }
    } else if (stored && stored.address !== ethersAccount.address) {
      // 地址不匹配，清除旧的 token
      clearStoredJWT(appKey);
      setJwtToken(null);
    }

    setInitialized(true);
  }, [ethersAccount.status, ethersAccount.address, isLoggingOutProcessing, setupExpirationTimer, appKey]);

  // 当钱包断开连接时，清除 JWT token
  useEffect(() => {
    if (isLoggingOutProcessing) return;

    if (!ethersAccount.address && jwtToken) {
      // 清除定时器
      if (expirationTimerRef.current) {
        clearTimeout(expirationTimerRef.current);
        expirationTimerRef.current = null;
      }
      clearStoredJWT(appKey);
      setJwtToken(null);
    }
  }, [ethersAccount.address, jwtToken, isLoggingOutProcessing]);

  useEffect(() => {
    if (isLoggingOutProcessing) return;
    if (ethersAccount.status !== 'connected') return;


    if (initialized && ethersAccount.address && !jwtToken) {

      (async () => {
        try {
          // 2. 等待钱包连接
          if (!ethersAccount.address) {
            throw new Error('Wallet not connected');
          }

          setIsSigningInProcessing(true);

          // 3. 从后端获取签名消息和 nonce
          const { message, nonce } = await getSignMessage(url,ethersAccount.address);

          // 4. 使用钱包签名消息
          // wagmi 的 signMessage 会自动从 config 中获取 provider
          if (!config) {
            throw new Error('Wagmi config not available');
          }

          const signature = await signMessage(config, {
            message,
            account: ethersAccount.address as Address,
          });

          // 5. 发送签名到后端 API 获取 JWT token
          const response = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              type: 'mutate',
              action: 'auth:signin',
              payload: {
                address: ethersAccount.address,
                message,
                signature,
                nonce,
              },
            }),
          });

          if (!response.ok) {
            const error = await response.json().catch(() => ({ error: 'Unknown error' }));
            throw new Error(error.error || 'Failed to sign in');
          }

          const data = await response.json();
          const result = data.data as { token: string; address: string; };

          // 6. 存储 JWT token
          storeJWT(appKey, result.token, result.address);
          setJwtToken(result.token);
          setupExpirationTimer(result.token);

          onSignInSuccess?.();

          return result;
        } catch (error) {
          disconnect();
          console.error('Sign in error:', error);
          throw error;
        } finally {
          setIsSigningInProcessing(false);
        }
      })();

    }
  }, [initialized, ethersAccount.status, jwtToken, isLoggingOutProcessing, setupExpirationTimer]);

  // 组件卸载时清理定时器
  useEffect(() => {
    return () => {
      setInitialized(false);

      if (expirationTimerRef.current) {
        clearTimeout(expirationTimerRef.current);
        expirationTimerRef.current = null;
      }
    };
  }, []);

  const value = useMemo(() => ({
    signIn,
    signOut,
    isSigningInProcessing,
    isLoggingOutProcessing,
    jwtToken,
    status,
    address: ethersAccount.address,
  }), [signIn, signOut, isSigningInProcessing, isLoggingOutProcessing, jwtToken, status, ethersAccount.address]);

  if (!initialized) {
    return null;
  }

  return (
    <WalletKitAuthContext.Provider value={value}>
      {typeof children === 'function' ? children(value) : children}
    </WalletKitAuthContext.Provider>
  );
};