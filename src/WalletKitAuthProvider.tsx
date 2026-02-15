import { useCallback, useEffect, useState, useMemo, createContext, useRef } from 'react';

import type { Address } from 'viem';
import { type Views, useDisconnect } from '@reown/appkit/react';
import { useConfig } from 'wagmi';
import { signMessage } from 'wagmi/actions';
import { useAccounts } from './hooks/useAccounts';
import { useConnect } from './hooks/useConnect';
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
  const logoutTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [jwtToken, setJwtToken] = useState<string | null>(null);
  const { disconnect } = useDisconnect();
  const { open } = useConnect();
  const accounts = useAccounts();

  const config = useConfig();
  const [initialized, setInitialized] = useState(false);
  const [isLoggingOutProcessing, setIsLoggingOutProcessing] = useState(false);
  const [isSigningInProcessing, setIsSigningInProcessing] = useState(false);

  const status = useMemo(() => {
    if (
      accounts.bsc.status === 'connecting' ||
      accounts.bsc.status === 'reconnecting' ||
      isLoggingOutProcessing
    ) return Status.PENDING;
    if (!initialized) return Status.INITIALIZING;
    if (!jwtToken) {
      if (accounts.bsc.address) {
        return Status.WAITING_FOR_AUTHENTICATION;
      }

      return Status.UNAUTHENTICATED;
    }
    if (isSigningInProcessing) return Status.AUTHENTICATING;
    return Status.AUTHENTICATED;
  }, [initialized, isLoggingOutProcessing, isSigningInProcessing, jwtToken, accounts.bsc]);

  console.log('WalletKitAuthProvider', status);

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
    [open, accounts.bsc.address, config]
  );

  const signOut = useCallback(async () => {
    setIsLoggingOutProcessing(true);
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
    if (status !== Status.INITIALIZING) return;

    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = null;
    }

    // 只在正在连接且有地址时才跳过（避免断开连接过程中的 connecting 状态阻止初始化）
    if (accounts.bsc.status === 'disconnected') {
      logoutTimerRef.current = setTimeout(() => {
        signOut().then(() => {
          setInitialized(true);
        });
      }, 1000);
      return;
    };

    setInitialized(false);
    const stored = getStoredJWT(appKey);

    if (stored && stored.address === accounts.bsc.address && !isJWTExpired(stored.token)) {
      setJwtToken(stored.token);
      setupExpirationTimer(stored.token);
    } else {
      setJwtToken(null);
      clearStoredJWT(appKey);
    }

    setInitialized(true);
  }, [status]);

  // 当钱包断开连接时，清除 JWT token
  useEffect(() => {
    if (status !== Status.AUTHENTICATED) return;

    if (!accounts.bsc.address) {
      if (expirationTimerRef.current) {
        clearTimeout(expirationTimerRef.current);
        expirationTimerRef.current = null;
      }
      clearStoredJWT(appKey);
      setJwtToken(null);
    }
  }, [status]);

  useEffect(() => {
    if (status !== Status.WAITING_FOR_AUTHENTICATION) return;

    (async () => {
      try {
        setIsSigningInProcessing(true);

        // 3. 从后端获取签名消息和 nonce
        const { message, nonce } = await getSignMessage(url,accounts.bsc.address);

        // 4. 使用钱包签名消息
        // wagmi 的 signMessage 会自动从 config 中获取 provider
        if (!config) {
          throw new Error('Wagmi config not available');
        }

        const signature = await signMessage(config, {
          message,
          account: accounts.bsc.address as Address,
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
              address: accounts.bsc.address,
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

  }, [status]);

  // 组件卸载时清理定时器
  useEffect(() => {
    return () => {
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
    address: accounts.bsc.address,
  }), [signIn, signOut, isSigningInProcessing, isLoggingOutProcessing, jwtToken, status, accounts.bsc.address]);

  if (!initialized) {
    return null;
  }

  return (
    <WalletKitAuthContext.Provider value={value}>
      {typeof children === 'function' ? children(value) : children}
    </WalletKitAuthContext.Provider>
  );
};