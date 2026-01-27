import {
  clearLocalStorageByPrefix
} from "./chunk-NXHCTNMM.js";
import {
  bsc,
  bscTestnet,
  mainnet,
  sepolia,
  solana,
  solanaDevnet
} from "./chunk-DMT75HZL.js";

// src/WalletKitProvider.tsx
import {
  useMemo as useMemo3,
  createContext as createContext2
} from "react";
import { WagmiProvider, cookieToInitialState } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// src/WalletKitConnectProvider.tsx
import {
  use,
  useState as useState2,
  useMemo as useMemo2,
  useCallback as useCallback2,
  createContext
} from "react";
import {
  useAppKitProvider,
  useDisconnect,
  useAppKitNetwork
} from "@reown/appkit/react";
import { useAppKitConnection } from "@reown/appkit-adapter-solana/react";
import * as web3 from "@ywwwtseng/web3";
import { useSwitchChain, useConnection, useChainId, useConfig as useConfig2 } from "wagmi";

// src/ContinueInWalletModal.tsx
import { Modal, Typography } from "@ywwwtseng/react-kit";
import { jsx, jsxs } from "react/jsx-runtime";
function ContinueInWalletModal({
  theme = "dark",
  logo,
  open,
  onClose,
  getWalletInfo
}) {
  const walletInfo = getWalletInfo?.();
  const redirect = walletInfo?.redirect;
  const deepLink = redirect?.native;
  if (walletInfo.type === "INJECTED") {
    return null;
  }
  return /* @__PURE__ */ jsxs(Modal, { title: "wallet kit modal", open, onClose, children: [
    /* @__PURE__ */ jsx(Typography, { size: "1", children: walletInfo?.name }),
    /* @__PURE__ */ jsx("style", { children: `
        @keyframes breathe {

          0%,
          100% {
            transform: translateX(15px);
          }

          50% {
            transform: translateX(-15px);
          }
        }
      ` }),
    /* @__PURE__ */ jsx("style", { children: `
        @keyframes breathe-negative {

          0%,
          100% {
            transform: translateX(-15px);
          }

          50% {
            transform: translateX(15px);
          }
        }
      ` }),
    /* @__PURE__ */ jsxs(
      "div",
      {
        style: {
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
          gap: "16px",
          paddingTop: "16px",
          paddingBottom: "16px"
        },
        children: [
          /* @__PURE__ */ jsxs(
            "div",
            {
              style: {
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "8px"
              },
              children: [
                /* @__PURE__ */ jsx(
                  "div",
                  {
                    style: {
                      animation: "breathe 2s ease-in-out infinite"
                    },
                    children: logo
                  }
                ),
                walletInfo && /* @__PURE__ */ jsx(
                  "img",
                  {
                    style: {
                      animation: "breathe-negative 2s ease-in-out infinite"
                    },
                    width: 48,
                    height: 48,
                    src: walletInfo.icon,
                    alt: "wallet icon"
                  }
                )
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            "div",
            {
              style: {
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                gap: "2px"
              },
              children: [
                /* @__PURE__ */ jsxs(Typography, { size: "1", children: [
                  "Continue in ",
                  walletInfo?.name
                ] }),
                /* @__PURE__ */ jsx(Typography, { size: "1", color: theme === "dark" ? "rgba(255, 255, 255, 0.50)" : "rgba(0, 0, 0, 0.50)", weight: 400, children: "Confirm transaction in your wallet" })
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            "a",
            {
              style: {
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "8px",
                paddingLeft: "12px",
                paddingRight: "12px",
                paddingTop: "6px",
                paddingBottom: "6px",
                fontSize: "12px",
                border: "1px solid",
                borderColor: theme === "dark" ? "#d1d5db" : "#d1d5db",
                borderRadius: "4px",
                textDecoration: "none",
                color: theme === "dark" ? "#ffffff" : "#000000"
              },
              href: deepLink,
              target: "_blank",
              rel: "noopener noreferrer",
              children: [
                /* @__PURE__ */ jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", width: "12", height: "12", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", children: [
                  /* @__PURE__ */ jsx("path", { d: "M15 3h6v6" }),
                  /* @__PURE__ */ jsx("path", { d: "M10 14 21 3" }),
                  /* @__PURE__ */ jsx("path", { d: "M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" })
                ] }),
                "Open"
              ]
            }
          )
        ]
      }
    )
  ] });
}

// src/hooks/useAccounts.ts
import { useMemo } from "react";
import { useAppKitAccount } from "@reown/appkit/react";
function useAccounts() {
  const solanaAccount = useAppKitAccount({ namespace: "solana" });
  const ethersAccount = useAppKitAccount({ namespace: "eip155" });
  return useMemo(() => {
    return {
      bsc: {
        address: ethersAccount.address,
        status: ethersAccount.status
      },
      ethereum: {
        address: ethersAccount.address,
        status: ethersAccount.status
      },
      solana: {
        address: solanaAccount.address,
        status: solanaAccount.status
      }
    };
  }, [solanaAccount, ethersAccount]);
}

// src/hooks/useConnect.ts
import { useCallback, useState } from "react";
import { useAppKit } from "@reown/appkit/react";
function useConnect() {
  const appKit = useAppKit();
  const [isPending, setIsPending] = useState(false);
  const open = useCallback(async (view) => {
    setIsPending(true);
    await appKit.open({
      view: view ?? "AllWallets"
    });
    setIsPending(false);
  }, []);
  return {
    open,
    isPending
  };
}

// src/wagmi.ts
import { getBalance, sendTransaction } from "wagmi/actions";
import { Actions } from "wagmi/tempo";
import { writeContract } from "@wagmi/core";
import { useConfig, useAccount } from "wagmi";
var ERC20_ABI = [
  {
    name: "transfer",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" }
    ],
    outputs: [{ type: "bool" }]
  },
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "balance", type: "uint256" }]
  },
  {
    type: "function",
    name: "decimals",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint8" }]
  }
];
var sendWagmiTransaction = async (config, {
  tokenAddress,
  to,
  amount,
  chainId
}) => {
  if (tokenAddress) {
    return await writeContract(config, {
      address: tokenAddress,
      abi: ERC20_ABI,
      functionName: "transfer",
      chainId,
      args: [to, typeof amount === "string" ? BigInt(amount) : amount]
    });
  } else {
    return await sendTransaction(config, {
      to,
      value: typeof amount === "string" ? BigInt(amount) : amount,
      chainId
    });
  }
};
var getWagmiBalance = async (config, { address, token, chainId }) => {
  if (token) {
    const balance = await Actions.token.getBalance(config, {
      account: address,
      token
    });
    return balance;
  } else {
    const balance = await getBalance(config, {
      address,
      chainId
    });
    return balance.value;
  }
};

// src/WalletKitConnectProvider.tsx
import { jsx as jsx2, jsxs as jsxs2 } from "react/jsx-runtime";
var WalletKitConnectContext = createContext({
  isMainnet: true,
  isConnectPending: false,
  isSendTxPending: false,
  error: null,
  accounts: {
    bsc: {
      address: void 0,
      status: void 0
    },
    ethereum: {
      address: void 0,
      status: void 0
    },
    solana: {
      address: void 0,
      status: void 0
    }
  },
  balance: {},
  currentChainId: void 0,
  openContinueInWalletModal: () => {
    throw new Error("openContinueInWalletModal is not implemented");
  },
  getBalance: () => {
    throw new Error("getBalance is not implemented");
  },
  getNetwork: () => {
    throw new Error("getNetwork is not implemented");
  },
  connect: () => {
    throw new Error("connect is not implemented");
  },
  disconnect: () => {
    throw new Error("disconnect is not implemented");
  },
  signTransaction: () => {
    throw new Error("createTransaction is not implemented");
  },
  sendTransaction: () => {
    throw new Error("sendTransaction is not implemented");
  },
  switchNetwork: () => {
    throw new Error("switchNetwork is not implemented");
  }
});
var WalletKitConnectProvider = ({
  theme = "dark",
  debug = false,
  isMainnet = true,
  logo,
  children
}) => {
  const config = useConfig2();
  const [connectError, setConnectError] = useState2(null);
  const { getWalletInfo } = use(WalletKitContext);
  const [balance, setBalance] = useState2({});
  const [continueInWalletModal, openContinueInWalletModal] = useState2(false);
  const [isSendTxPending, setIsSendTxPending] = useState2(false);
  const { disconnect: d } = useDisconnect();
  const { switchNetwork: switchAppKitNetwork } = useAppKitNetwork();
  const { connection } = useAppKitConnection();
  const accounts = useAccounts();
  const switchChain = useSwitchChain();
  const { isConnected } = useConnection();
  const currentChainId = useChainId();
  const disconnect = useCallback2(async (clearLocalStorage) => {
    await d();
    if (clearLocalStorage) {
      clearLocalStorageByPrefix("@appkit/");
      clearLocalStorageByPrefix("wagmi.");
    }
  }, [d]);
  const delayOpenContinueInWalletModal = useCallback2(() => {
    setTimeout(() => {
      openContinueInWalletModal(true);
    }, 1500);
  }, [openContinueInWalletModal]);
  const solanaProvider = useAppKitProvider("solana");
  const { open, isPending: isConnectPending } = useConnect();
  const connect = useCallback2(async (options) => {
    try {
      await open(options?.view);
    } catch (error) {
      setConnectError(error instanceof Error ? error : new Error(String(error)));
    }
  }, [open]);
  const getNetwork = useCallback2((network) => {
    if (network === "bsc") {
      return isMainnet ? bsc : bscTestnet;
    } else if (network === "ethereum") {
      return isMainnet ? mainnet : sepolia;
    } else if (network === "solana") {
      return isMainnet ? solana : solanaDevnet;
    }
    return void 0;
  }, [isMainnet]);
  const getAccountAddress = useCallback2((network) => {
    if (network === "bsc") {
      return accounts.bsc.address;
    } else if (network === "ethereum") {
      return accounts.ethereum.address;
    } else if (network === "solana") {
      return accounts.solana.address;
    }
    return void 0;
  }, [accounts]);
  const switchNetwork = async (network) => {
    if (network === "bsc" || network === "ethereum") {
      const targetNetwork = getNetwork(network);
      if (!targetNetwork) {
        throw new Error(`Network ${network} not found`);
      }
      await switchAppKitNetwork(targetNetwork);
    }
  };
  const getBalance3 = async (token) => {
    if (token.network === "solana") {
      if (!connection || !accounts.solana.address) {
        throw Error("user is disconnected");
      }
      const balance2 = await web3.getBalance({
        network: token.network,
        connection
      })({
        address: accounts.solana.address,
        tokenAddress: token.token_address,
        tokenProgram: token.token_program
      });
      setBalance({ [token.id]: String(balance2) });
    } else {
      const address = getAccountAddress(token.network);
      if (!address) {
        throw Error("user is disconnected");
      }
      const network = getNetwork(token.network);
      if (!network) {
        throw Error("network not found");
      }
      const balance2 = await getWagmiBalance(config, {
        address,
        token: token.token_address ?? void 0,
        chainId: network.id
      });
      setBalance({ [token.id]: String(balance2) });
    }
  };
  const createTransaction = useCallback2(
    async ({
      feePayer,
      source,
      token,
      destination,
      amount
    }) => {
      if (!accounts.solana || !connection)
        throw Error("user is disconnected");
      const transaction = await web3.utils.solana.createTransaction(
        connection,
        {
          feePayer,
          source,
          destination,
          mint: token.token_address,
          amount,
          tokenProgram: token.token_program
        }
      );
      const latestBlockhash = await connection.getLatestBlockhash("finalized");
      transaction.feePayer = new web3.solana.PublicKey(feePayer);
      transaction.recentBlockhash = latestBlockhash.blockhash;
      transaction.lastValidBlockHeight = latestBlockhash.lastValidBlockHeight;
      return transaction;
    },
    [accounts.solana, solanaProvider, connection]
  );
  const signTransaction = useCallback2(
    async ({
      feePayer,
      source,
      token,
      destination,
      amount
    }) => {
      try {
        if (!accounts.solana || !connection)
          throw Error("user is disconnected");
        openContinueInWalletModal(true);
        const transaction = await createTransaction({
          feePayer,
          source,
          token,
          destination,
          amount
        });
        const signedTransaction = await solanaProvider.walletProvider.signTransaction(transaction);
        return signedTransaction;
      } catch (error) {
        console.error(error);
        throw error;
      } finally {
        openContinueInWalletModal(false);
      }
    },
    [accounts.solana, solanaProvider, connection]
  );
  const sendTransaction2 = async ({
    feePayer,
    source,
    token,
    destination,
    amount
  }) => {
    try {
      setIsSendTxPending(true);
      openContinueInWalletModal(true);
      if (token.network === "solana") {
        if (!connection) {
          throw Error("Solana connection not available");
        }
        const signature = await solanaProvider.walletProvider.sendTransaction(
          await createTransaction({
            feePayer,
            source,
            token,
            destination,
            amount
          }),
          connection
        );
        return signature;
      }
      const network = getNetwork(token.network);
      const address = getAccountAddress(token.network);
      if (!network) {
        throw Error("network not found");
      }
      if (!isConnected || !address) {
        throw Error("EVM wallet not connected. Please connect an EVM wallet first.");
      }
      const chainId = network.id;
      if (!chainId) {
        throw Error(`Unsupported network: ${network}`);
      }
      if (currentChainId !== chainId) {
        await switchChain.mutateAsync({ chainId });
      }
      const hash = await sendWagmiTransaction(config, {
        tokenAddress: token.token_address,
        to: destination,
        amount: typeof amount === "string" ? BigInt(amount) : amount,
        chainId
      });
      if (debug) {
        console.log("[WalletKitConnectProvider] sendTransaction:", hash);
      }
      return hash;
    } catch (error) {
      console.error(error, "error");
      throw error;
    } finally {
      setIsSendTxPending(false);
      openContinueInWalletModal(false);
    }
  };
  const value = useMemo2(
    () => ({
      isMainnet,
      accounts,
      balance,
      isConnectPending,
      isSendTxPending,
      error: connectError,
      currentChainId,
      openContinueInWalletModal: delayOpenContinueInWalletModal,
      connect,
      getBalance: getBalance3,
      getNetwork,
      disconnect,
      signTransaction,
      sendTransaction: sendTransaction2,
      switchNetwork
    }),
    [
      isMainnet,
      accounts,
      balance,
      isConnectPending,
      isSendTxPending,
      currentChainId,
      connectError,
      delayOpenContinueInWalletModal,
      connect,
      getBalance3,
      getNetwork,
      disconnect,
      signTransaction,
      sendTransaction2,
      switchNetwork
    ]
  );
  return /* @__PURE__ */ jsxs2(WalletKitConnectContext.Provider, { value, children: [
    children,
    continueInWalletModal && /* @__PURE__ */ jsx2(
      ContinueInWalletModal,
      {
        open: true,
        theme,
        logo,
        getWalletInfo,
        onClose: () => {
          setIsSendTxPending(false);
          openContinueInWalletModal(false);
        }
      }
    )
  ] });
};

// src/WalletKitProvider.tsx
import { jsx as jsx3 } from "react/jsx-runtime";
var queryClient = new QueryClient();
var WalletKitContext = createContext2({
  getWalletInfo: () => void 0
});
var WalletKitProvider = ({
  theme = "dark",
  debug = false,
  isMainnet = true,
  config,
  cookies,
  logo,
  children,
  getWalletInfo
}) => {
  const initialState = cookieToInitialState(config, cookies);
  const value = useMemo3(
    () => ({
      getWalletInfo
    }),
    [
      getWalletInfo
    ]
  );
  return /* @__PURE__ */ jsx3(QueryClientProvider, { client: queryClient, children: /* @__PURE__ */ jsx3(WagmiProvider, { config, initialState, children: /* @__PURE__ */ jsx3(WalletKitContext.Provider, { value, children: /* @__PURE__ */ jsx3(WalletKitConnectProvider, { debug, isMainnet, logo, theme, children }) }) }) });
};

export {
  WalletKitContext,
  WalletKitProvider,
  useConnect,
  useConfig,
  useAccount,
  WalletKitConnectContext
};
