import { ethers } from "ethers";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface ProviderState {
  provider: ethers.providers.Web3Provider | null;
  setProvider: (provider: ethers.providers.Web3Provider) => void;
}

export const useProviderStore = create<ProviderState>()(
  devtools((set) => ({
    provider: null,
    setProvider: (provider) =>
      set((state) => {
        state.provider = provider;
        return state;
      }),
  }))
);
