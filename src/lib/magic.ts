import { MAGIC_KEY } from "@/constants";
import { ethers } from "ethers";
import { Magic } from "magic-sdk";

export const getMagic = () => {
  const magic = new Magic(MAGIC_KEY, {
    network: "mainnet",
  });

  const login = async () => {
    await magic.wallet.connectWithUI();
    const provider = await magic.wallet.getProvider();
    return new ethers.providers.Web3Provider(provider);
  };

  const logout = async () => {
    await magic.wallet.disconnect();
  };

  return {
    login,
    logout,
  };
};
