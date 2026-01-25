import { cookieStorage, createStorage } from '@wagmi/core';
import { createAppKit as createReownAppKit, type CreateAppKit } from '@reown/appkit/react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { SolanaAdapter } from '@reown/appkit-adapter-solana';
import { solana } from './networks';
import { JWT_TOKEN_KEY, JWT_ADDRESS_KEY } from './constants';
import type { AppKitNetwork } from './types';

export const parseJSON = (src: unknown) => {
  try {
    if (typeof src !== 'string') {
      return src;
    }

    return JSON.parse(src) as unknown;
  } catch {
    return null;
  }
}

export const createAppKit = (() => {
  // 单例实例（使用闭包封装）
  let instance: {
    config: typeof WagmiAdapter.prototype.wagmiConfig;
    getWalletInfo: () => ReturnType<ReturnType<typeof createReownAppKit>['getWalletInfo']>;
    networks: AppKitNetwork[];
  } | null = null;

  return ({
    themeMode,
    projectId,
    networks,
    ssr = false,
    ...config
  }: {
    themeMode?: 'light' | 'dark';
    projectId: string;
    networks: [AppKitNetwork, ...AppKitNetwork[]];
    ssr: boolean;
  } & CreateAppKit) => {
    // 如果已经创建了实例，检查网络配置是否匹配
    if (instance) {
      // 检查网络配置是否相同（通过比较网络 ID）
      const existingNetworkIds = instance.networks.map(n => n.id).sort();
      const newNetworkIds = networks.map(n => n.id).sort();
      const networksMatch = 
        existingNetworkIds.length === newNetworkIds.length &&
        existingNetworkIds.every((id, index) => id === newNetworkIds[index]);
      
      if (!networksMatch) {
        console.warn(
          'createAppKit: Networks configuration has changed. ' +
          'The existing instance will be reused, which may cause issues. ' +
          'Please ensure createAppKit is called with the same networks configuration.'
        );
      }
      
      return instance;
    }

    const wagmiAdapter = new WagmiAdapter({
      projectId,
      networks,
      ssr,
      ...(ssr ? {
        storage: createStorage({
          storage: cookieStorage
        }),
      } : {})
    });

    const solanaAdapter = new SolanaAdapter();

    const modal = createReownAppKit({
      themeMode,
      projectId,
      networks,
      adapters: networks.includes(solana) ? [wagmiAdapter, solanaAdapter] : [wagmiAdapter],
      features: {
        email: false,
        socials: [],
      },
      ...config,
    });

    instance = {
      config: wagmiAdapter.wagmiConfig,
      getWalletInfo: () => modal?.getWalletInfo(),
      networks,
    };

    return instance;
  };
})();

export function clearLocalStorageByPrefix(prefix: string) {
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith(prefix)) {
      localStorage.removeItem(key);
    }
  });
}

/**
 * 从后端获取签名消息和 nonce
 */
export async function getSignMessage(url: string, address: string): Promise<{
  message: string;
  nonce: string;
  expiresAt: number;
}> {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      type: 'mutate',
      action: 'auth:signin:nonce',
      payload: { address },
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || 'Failed to get sign message');
  }

  const data = await response.json();
  return data.data;
}

/**
 * 获取存储的 JWT token
 */
export function getStoredJWT(appKey: string): { token: string; address: string } | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const token = localStorage.getItem(`${appKey}_${JWT_TOKEN_KEY}`);
  const address = localStorage.getItem(`${appKey}_${JWT_ADDRESS_KEY}`);

  if (token && address) {
    return { token, address };
  }

  return null;
}

/**
 * 存储 JWT token
 */
export function storeJWT(appKey: string, token: string, address: string): void {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.setItem(`${appKey}_${JWT_TOKEN_KEY}`, token);
  localStorage.setItem(`${appKey}_${JWT_ADDRESS_KEY}`, address);
}

/**
 * 清除存储的 JWT token
 */
export function clearStoredJWT(appKey: string): void {
  console.trace('clearStoredJWT');
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.removeItem(`${appKey}_${JWT_TOKEN_KEY}`);
  localStorage.removeItem(`${appKey}_${JWT_ADDRESS_KEY}`);
}

/**
 * 获取 JWT token 的过期时间（毫秒）
 */
export function getJWTExpirationTime(token: string): number | null {
  try {
    // JWT 格式: header.payload.signature
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    // 解析 payload (base64 解码)
    const payload = JSON.parse(atob(parts[1]));

    // 获取 exp 字段（过期时间，Unix 时间戳）
    if (!payload.exp) {
      return null;
    }

    // 转换为毫秒
    return payload.exp * 1000;
  } catch (error) {
    console.error('Error getting JWT expiration time:', error);
    return null;
  }
}

/**
 * 检查 JWT token 是否过期
 */
export function isJWTExpired(token: string): boolean {
  try {
    // JWT 格式: header.payload.signature
    const parts = token.split('.');
    if (parts.length !== 3) {
      return true; // 无效的 token 格式，视为过期
    }

    // 解析 payload (base64 解码)
    const payload = JSON.parse(atob(parts[1]));

    // 检查 exp 字段（过期时间，Unix 时间戳）
    if (!payload.exp) {
      return true; // 没有过期时间，视为过期
    }

    // 检查是否过期（留 5 秒缓冲时间）
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp < currentTime + 5;
  } catch (error) {
    console.error('Error checking JWT expiration:', error);
    return true; // 解析失败，视为过期
  }
}