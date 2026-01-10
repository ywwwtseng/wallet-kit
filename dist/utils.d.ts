import { CreateAppKit, createAppKit as createAppKit$1 } from '@reown/appkit/react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { AppKitNetwork } from '@reown/appkit/networks';

declare const parseJSON: (src: unknown) => unknown;
declare const createAppKit: ({ themeMode, projectId, networks, ssr, ...config }: {
    themeMode?: "light" | "dark";
    projectId: string;
    networks: [AppKitNetwork, ...AppKitNetwork[]];
    ssr: boolean;
} & CreateAppKit) => {
    config: typeof WagmiAdapter.prototype.wagmiConfig;
    getWalletInfo: () => ReturnType<ReturnType<typeof createAppKit$1>["getWalletInfo"]>;
};
/**
 * 从后端获取签名消息和 nonce
 */
declare function getSignMessage(url: string, address: string): Promise<{
    message: string;
    nonce: string;
    expiresAt: number;
}>;
/**
 * 获取存储的 JWT token
 */
declare function getStoredJWT(appKey: string): {
    token: string;
    address: string;
} | null;
/**
 * 存储 JWT token
 */
declare function storeJWT(appKey: string, token: string, address: string): void;
/**
 * 清除存储的 JWT token
 */
declare function clearStoredJWT(appKey: string): void;
/**
 * 获取 JWT token 的过期时间（毫秒）
 */
declare function getJWTExpirationTime(token: string): number | null;
/**
 * 检查 JWT token 是否过期
 */
declare function isJWTExpired(token: string): boolean;

export { clearStoredJWT, createAppKit, getJWTExpirationTime, getSignMessage, getStoredJWT, isJWTExpired, parseJSON, storeJWT };
