import { ChatSuggestion } from "./types";

export const CHAT_SUGGESTIONS: ChatSuggestion[] = [
  {
    title: "🏦 List Safes where I am an owner",
    subtitle: "",
    prompt: "List Safes where I am an owner",
  },
  {
    title: "🚀 Create a new Safe with me as an owner",
    subtitle: "",
    prompt: "Create a new Safe with me as an owner",
  },
  {
    title: "✍️ Create a transaction to send 1 ETH to ENS/Wallet from my safe",
    subtitle: "",
    prompt: "Create a transaction to send 1 ETH to ens_or_wallet_address from my safe",
    preselect: {
      from: 38,
      to: 59
    }
  },
  {
    title: "📋 List pending multi-signature transactions on my safe",
    subtitle: "",
    prompt: "List pending multi-signature transactions on enter_safe_address",
    preselect: {
      from: 45,
      to: 63
    }
  },
  {
    title: "🖋️ Sign a pending transaction on my Safe",
    subtitle: "",
    prompt: "Sign a pending transaction on my Safe",
  },
  {
    title: "📘 List the capabilities Unblock has",
    subtitle: "",
    prompt: "List the capabilities Unblock has",
  },
];