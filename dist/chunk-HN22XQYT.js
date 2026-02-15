import {
  solana,
  solanaDevnet
} from "./chunk-DMT75HZL.js";

// src/utils.ts
import { cookieStorage, createStorage, http } from "@wagmi/core";
import { createAppKit } from "@reown/appkit/react";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { SolanaAdapter } from "@reown/appkit-adapter-solana";

// src/constants.ts
var Status = /* @__PURE__ */ ((Status2) => {
  Status2["PENDING"] = "pending";
  Status2["INITIALIZING"] = "initializing";
  Status2["WAITING_FOR_AUTHENTICATION"] = "waiting_for_authentication";
  Status2["AUTHENTICATING"] = "authenticating";
  Status2["AUTHENTICATED"] = "authenticated";
  Status2["UNAUTHENTICATED"] = "unauthenticated";
  return Status2;
})(Status || {});
var JWT_TOKEN_KEY = "web3_jwt_token";
var JWT_ADDRESS_KEY = "web3_jwt_address";

// src/utils.ts
var parseJSON = (src) => {
  try {
    if (typeof src !== "string") {
      return src;
    }
    return JSON.parse(src);
  } catch {
    return null;
  }
};
function initAppKit({ projectId, themeMode = "dark", networks, ssr = true, ...rest }) {
  const evmNetworks = networks.filter((n) => typeof n.id === "number");
  const hasSolana = networks.some((n) => n.id === solana.id || n.id === solanaDevnet.id);
  const wagmiAdapter = new WagmiAdapter({
    projectId,
    networks: evmNetworks,
    ssr,
    ...ssr ? { storage: createStorage({ storage: cookieStorage }) } : {},
    transports: evmNetworks.reduce((acc, n) => {
      acc[n.id] = http();
      return acc;
    }, {})
  });
  const adapters = hasSolana ? [wagmiAdapter, new SolanaAdapter()] : [wagmiAdapter];
  const modal = createAppKit({
    themeMode,
    projectId,
    networks,
    adapters,
    allWallets: "HIDE",
    debug: true,
    features: { email: false, socials: [] },
    ...rest
  });
  return {
    networks,
    config: wagmiAdapter.wagmiConfig,
    getWalletInfo: () => modal?.getWalletInfo()
  };
}
function clearLocalStorageByPrefix(prefix) {
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith(prefix)) {
      localStorage.removeItem(key);
    }
  });
}
async function getSignMessage(url, address) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      type: "mutate",
      action: "auth:signin:nonce",
      payload: { address }
    })
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(error.error || "Failed to get sign message");
  }
  const data = await response.json();
  return data.data;
}
function getStoredJWT(appKey) {
  if (typeof window === "undefined") {
    return null;
  }
  const token = localStorage.getItem(`${appKey}_${JWT_TOKEN_KEY}`);
  const address = localStorage.getItem(`${appKey}_${JWT_ADDRESS_KEY}`);
  if (token && address) {
    return { token, address };
  }
  return null;
}
function storeJWT(appKey, token, address) {
  if (typeof window === "undefined") {
    return;
  }
  localStorage.setItem(`${appKey}_${JWT_TOKEN_KEY}`, token);
  localStorage.setItem(`${appKey}_${JWT_ADDRESS_KEY}`, address);
}
function clearStoredJWT(appKey) {
  if (typeof window === "undefined") {
    return;
  }
  localStorage.removeItem(`${appKey}_${JWT_TOKEN_KEY}`);
  localStorage.removeItem(`${appKey}_${JWT_ADDRESS_KEY}`);
}
function getJWTExpirationTime(token) {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      return null;
    }
    const payload = JSON.parse(atob(parts[1]));
    if (!payload.exp) {
      return null;
    }
    return payload.exp * 1e3;
  } catch (error) {
    console.error("Error getting JWT expiration time:", error);
    return null;
  }
}
function isJWTExpired(token) {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      return true;
    }
    const payload = JSON.parse(atob(parts[1]));
    if (!payload.exp) {
      return true;
    }
    const currentTime = Math.floor(Date.now() / 1e3);
    return payload.exp < currentTime + 5;
  } catch (error) {
    console.error("Error checking JWT expiration:", error);
    return true;
  }
}

export {
  Status,
  JWT_TOKEN_KEY,
  JWT_ADDRESS_KEY,
  parseJSON,
  initAppKit,
  clearLocalStorageByPrefix,
  getSignMessage,
  getStoredJWT,
  storeJWT,
  clearStoredJWT,
  getJWTExpirationTime,
  isJWTExpired
};
