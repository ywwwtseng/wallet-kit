import {
  clearLocalStorageByPrefix
} from "./chunk-HN22XQYT.js";
import {
  bsc,
  bscTestnet,
  mainnet,
  sepolia,
  solana,
  solanaDevnet
} from "./chunk-DMT75HZL.js";

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

// src/WalletKitConnectProvider.tsx
import {
  useRef as useRef2,
  useState as useState3,
  useMemo as useMemo2,
  useCallback as useCallback2,
  useEffect as useEffect2,
  createContext
} from "react";
import {
  useAppKitProvider,
  useDisconnect,
  useAppKitNetwork
} from "@reown/appkit/react";
import { useAppKitConnection } from "@reown/appkit-adapter-solana/react";
import * as web3 from "@ywwwtseng/web3";
import { useSwitchChain, useConnection, useChainId, useConfig } from "wagmi";

// src/ContinueInWalletModal.tsx
import { Modal, Typography } from "@ywwwtseng/react-kit";
import { jsx, jsxs } from "react/jsx-runtime";
function ContinueInWalletModal({
  theme = "dark",
  type,
  logo,
  open,
  onClose,
  getWalletInfo
}) {
  const walletInfo = getWalletInfo?.();
  const redirect = walletInfo?.redirect;
  const link = redirect?.native;
  if (walletInfo.type === "INJECTED" || type === "writeContract") {
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
              href: link,
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

// src/hooks/useStabilizedAccount.ts
import { useEffect, useRef, useState as useState2 } from "react";
function useStabilizedAccount(account) {
  const statusRef = useRef(void 0);
  const [stabilizedAccount, setStabilizedAccount] = useState2({
    address: account.address,
    isConnected: account.isConnected,
    status: "connecting"
  });
  useEffect(() => {
    if (account.status === "connecting" || account.status === "reconnecting") {
      if (!statusRef.current) {
        statusRef.current = account.status;
      }
    } else {
      statusRef.current = account.status;
    }
    setStabilizedAccount({
      address: account.address,
      status: statusRef.current,
      isConnected: account.isConnected
    });
  }, [account.address, account.status, account.isConnected]);
  return stabilizedAccount;
}

// src/hooks/useAccounts.ts
function useAccounts() {
  const solanaAccount = useAppKitAccount({ namespace: "solana" });
  const ethersAccount = useAppKitAccount({ namespace: "eip155" });
  const stabilizedAccount = useStabilizedAccount(ethersAccount);
  return useMemo(() => {
    return {
      bsc: stabilizedAccount,
      ethereum: stabilizedAccount,
      solana: {
        address: solanaAccount.address,
        status: solanaAccount.status,
        isConnected: solanaAccount.isConnected
      }
    };
  }, [solanaAccount, ethersAccount, stabilizedAccount]);
}

// src/hooks/useTransfer.ts
import { useWriteContract, useSendTransaction } from "wagmi";

// src/abi.ts
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

// src/hooks/useTransfer.ts
function useTransfer() {
  const writeContract = useWriteContract();
  const sendTransaction = useSendTransaction();
  const transfer = async ({
    account,
    tokenAddress,
    to,
    amount,
    chainId
  }) => {
    if (tokenAddress) {
      const hash = await writeContract.mutateAsync({
        address: tokenAddress,
        abi: ERC20_ABI,
        functionName: "transfer",
        chainId,
        args: [to, typeof amount === "string" ? BigInt(amount) : amount],
        chain: void 0,
        account
      });
      writeContract.reset();
      return hash;
    } else {
      const hash = await sendTransaction.mutateAsync({
        to,
        value: typeof amount === "string" ? BigInt(amount) : amount,
        chainId,
        account
      });
      sendTransaction.reset();
      return hash;
    }
  };
  return {
    transfer
  };
}

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
      status: void 0,
      isConnected: false
    },
    ethereum: {
      address: void 0,
      status: void 0,
      isConnected: false
    },
    solana: {
      address: void 0,
      status: void 0,
      isConnected: false
    }
  },
  balances: {},
  currentChainId: void 0,
  connectedCallbacks: {
    bsc: [],
    ethereum: [],
    solana: []
  },
  getAccount: () => {
    throw new Error("getAccount is not implemented");
  },
  executeConnectedCallbacks: () => {
    throw new Error("executeConnectedCallbacks is not implemented");
  },
  openContinueInWalletModal: () => {
    throw new Error("openContinueInWalletModal is not implemented");
  },
  closeContinueInWalletModal: () => {
    throw new Error("closeContinueInWalletModal is not implemented");
  },
  setBalances: () => {
    throw new Error("setBalances is not implemented");
  },
  getNetwork: () => {
    throw new Error("getNetwork is not implemented");
  },
  open: () => {
    throw new Error("open is not implemented");
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
  maunalExecuteConnectedCallbacks = false,
  logo,
  children,
  getWalletInfo
}) => {
  const connectedCallbacksRef = useRef2({
    bsc: [],
    ethereum: [],
    solana: []
  });
  const config = useConfig();
  const [connectError, setConnectError] = useState3(null);
  const [balances, setBalances] = useState3({});
  const [continueInWalletModal, setContinueInWalletModal] = useState3({ open: false, type: void 0 });
  const [isSendTxPending, setIsSendTxPending] = useState3(false);
  const { disconnect: _disconnect } = useDisconnect();
  const { switchNetwork: switchAppKitNetwork } = useAppKitNetwork();
  const { connection } = useAppKitConnection();
  const accounts = useAccounts();
  const switchChain = useSwitchChain();
  const { isConnected } = useConnection();
  const currentChainId = useChainId();
  const { transfer } = useTransfer();
  const executeConnectedCallbacks = useCallback2(async (network) => {
    if (network === "bsc") {
      for (const callback of connectedCallbacksRef.current.bsc) {
        await callback();
      }
      connectedCallbacksRef.current.bsc = [];
    } else if (network === "ethereum") {
      for (const callback of connectedCallbacksRef.current.ethereum) {
        await callback();
      }
      connectedCallbacksRef.current.ethereum = [];
    } else if (network === "solana") {
      for (const callback of connectedCallbacksRef.current.solana) {
        await callback();
      }
      connectedCallbacksRef.current.solana = [];
    }
  }, [maunalExecuteConnectedCallbacks]);
  useEffect2(() => {
    if (accounts.bsc.isConnected && !maunalExecuteConnectedCallbacks) {
      void executeConnectedCallbacks("bsc");
    }
  }, [accounts.bsc.isConnected, maunalExecuteConnectedCallbacks]);
  useEffect2(() => {
    if (accounts.ethereum.isConnected && !maunalExecuteConnectedCallbacks) {
      void executeConnectedCallbacks("ethereum");
    }
  }, [accounts.ethereum.isConnected, maunalExecuteConnectedCallbacks]);
  useEffect2(() => {
    if (accounts.solana.isConnected && !maunalExecuteConnectedCallbacks) {
      void executeConnectedCallbacks("solana");
    }
  }, [accounts.solana.isConnected, maunalExecuteConnectedCallbacks]);
  if (debug) {
    console.log("[WalletKitConnectProvider] accounts", accounts);
  }
  const disconnect = useCallback2(async (clearLocalStorage) => {
    if (debug) {
      console.trace("[WalletKitConnectProvider] disconnect");
    }
    await _disconnect();
    if (clearLocalStorage) {
      clearLocalStorageByPrefix("@appkit/");
      clearLocalStorageByPrefix("wagmi.");
    }
  }, [_disconnect]);
  const openContinueInWalletModal = useCallback2((type) => {
    setContinueInWalletModal({ open: true, type });
  }, [setContinueInWalletModal]);
  const closeContinueInWalletModal = useCallback2(() => {
    setContinueInWalletModal({ open: false, type: void 0 });
  }, [setContinueInWalletModal]);
  const solanaProvider = useAppKitProvider("solana");
  const { open: _open, isPending: isConnectPending } = useConnect();
  const open = useCallback2(async (options) => {
    try {
      await _open(options?.view);
    } catch (error) {
      setConnectError(error instanceof Error ? error : new Error(String(error)));
    }
  }, [_open]);
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
  const getAccount = useCallback2((network) => {
    if (network === "bsc") {
      return accounts.bsc;
    } else if (network === "ethereum") {
      return accounts.ethereum;
    } else if (network === "solana") {
      return accounts.solana;
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
        openContinueInWalletModal("signTransaction");
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
        closeContinueInWalletModal();
      }
    },
    [accounts.solana, solanaProvider, connection, openContinueInWalletModal, closeContinueInWalletModal]
  );
  const sendTransaction = async ({
    feePayer,
    source,
    token,
    destination,
    amount
  }) => {
    try {
      setIsSendTxPending(true);
      openContinueInWalletModal("sendTransaction");
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
      const address = getAccount(token.network)?.address;
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
      const hash = await transfer({
        tokenAddress: token.token_address,
        to: destination,
        amount: typeof amount === "string" ? BigInt(amount) : amount,
        chainId,
        account: address
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
      closeContinueInWalletModal();
    }
  };
  const value = useMemo2(
    () => ({
      isMainnet,
      accounts,
      balances,
      isConnectPending,
      isSendTxPending,
      error: connectError,
      currentChainId,
      connectedCallbacks: connectedCallbacksRef.current,
      getAccount,
      executeConnectedCallbacks,
      openContinueInWalletModal,
      closeContinueInWalletModal,
      open,
      disconnect,
      setBalances,
      getNetwork,
      signTransaction,
      sendTransaction,
      switchNetwork
    }),
    [
      isMainnet,
      accounts,
      balances,
      isConnectPending,
      isSendTxPending,
      currentChainId,
      connectError,
      getAccount,
      executeConnectedCallbacks,
      openContinueInWalletModal,
      closeContinueInWalletModal,
      open,
      setBalances,
      getNetwork,
      disconnect,
      signTransaction,
      sendTransaction,
      switchNetwork
    ]
  );
  return /* @__PURE__ */ jsxs2(WalletKitConnectContext.Provider, { value, children: [
    children,
    continueInWalletModal.open && /* @__PURE__ */ jsx2(
      ContinueInWalletModal,
      {
        open: true,
        type: continueInWalletModal.type,
        theme,
        logo,
        getWalletInfo,
        onClose: () => {
          console.log("[WalletKitConnectProvider] onClose");
          setIsSendTxPending(false);
          closeContinueInWalletModal();
        }
      }
    )
  ] });
};

export {
  useAccounts,
  useConnect,
  WalletKitConnectContext,
  WalletKitConnectProvider
};
