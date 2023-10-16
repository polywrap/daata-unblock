import {
  Connection,
  Connections,
  ethereumWalletPlugin,
} from "@polywrap/ethereum-wallet-js";
import {
  PolywrapClient,
  PolywrapClientConfigBuilder,
} from "@polywrap/client-js";

import { EthersAdapter } from "@safe-global/protocol-kit";
import { ethers } from "ethers";
import { getMagic } from "../magic";
import { makeAddressBookPlugin } from "./plugins/AddressBook";
import { makeEnsPlugin } from "./plugins/ens";
import { makeSafeTxPlugin } from "./plugins/SafeTx";
import { safeApiPlugin } from "@polywrap/safe-api-plugin";
import { useProviderStore } from "@/stores/providerStore";

const getBasePolywrapClientConfigBuilder = () => {
  const builder = new PolywrapClientConfigBuilder();
  builder.addBundle("sys");
  builder.addBundle("web3");

  builder.setRedirect(
    "wrap://wrapscan.io/polywrap/addressBook@1.0",
    "wrap://wrapscan.io/polywrap/addressBook@1.1.1"
  );

  builder.setPackage(
    "wrap://wrapscan.io/polywrap/addressBook@1.1.1",
    makeAddressBookPlugin()
  );

  builder.setPackage(
    "wrap://wrapscan.io/polywrap/ens-plugin@1.0",
    makeEnsPlugin()
  );

  builder.addEnv("wrapscan.io/polywrap/covalent@1.0", {
    apiKey: "cqt_rQdPCkVXWP9vGMRFY9rgb6vCDfGv",
    vsCurrency: "usd",
    format: 0,
  });

  // HACK to support proper version of protocol kit
  builder.setRedirect(
    "wrapscan.io/polywrap/protocol-kit@0.1.0",
    "wrapscan.io/polywrap/protocol-kit@0.0.1"
  );

  return builder;
};

export const getPolywrapClient = async (
  provider: ethers.providers.Web3Provider | null
) => {
  const builder = getBasePolywrapClientConfigBuilder();

  if (provider) {
    const connection = new Connection({
      provider: provider,
    });
    const safeOwner = provider.getSigner(0);

    let safeTxServiceUrl = "https://safe-transaction-mainnet.safe.global";
    switch (provider.network.chainId) {
      case 1:
        safeTxServiceUrl = "https://safe-transaction-mainnet.safe.global";
        break;
      case 56:
        safeTxServiceUrl = "https://safe-transaction-bsc.safe.global";
        break;
      case 137:
        safeTxServiceUrl = "https://safe-transaction-polygon.safe.global";
        break;
      case 42161:
        safeTxServiceUrl = "https://safe-transaction-arbitrum.safe.global";
        break;
      case 10:
        safeTxServiceUrl = "https://safe-transaction-optimism.safe.global";
        break;
      case 43114:
        safeTxServiceUrl = "https://safe-transaction-avalanche.safe.global";
        break;
      case 8453:
        safeTxServiceUrl = "https://safe-transaction-base.safe.global";
        break;
      case 100:
        safeTxServiceUrl = "https://safe-transaction-gnosis-chain.safe.global";
        break;

      // testnets
      case 5:
        safeTxServiceUrl = "https://safe-transaction-goerli.safe.global";
        break;
      case 1442:
        safeTxServiceUrl = "https://safe-transaction-zkevm.safe.global";
        break;
      default:
        safeTxServiceUrl = "https://safe-transaction-mainnet.safe.global";
        break;
    }

    const ethAdapter = new EthersAdapter({
      ethers,
      signerOrProvider: safeOwner,
    });

    builder.setPackage(
      "wrapscan.io/polywrap/ethereum-wallet@1.0",
      ethereumWalletPlugin({
        connections: new Connections({
          networks: {
            ethereum: connection,
          },
          defaultNetwork: "ethereum",
        }),
      })
    );

    builder.setPackage(
      "plugin/safe-api-kit@1.0",
      safeApiPlugin({
        signer: safeOwner,
        txServiceUrl: safeTxServiceUrl,
        ethAdapter: ethAdapter,
      })
    );

    builder.setPackage(
      "plugin/safe-tx-plugin@1.0",
      makeSafeTxPlugin({ ethAdapter, signer: safeOwner, txServiceUrl: safeTxServiceUrl })
    );
  }

  return new PolywrapClient(builder.build());
};

export const getReadonlyPolywrapClient = () => {
  return new PolywrapClient(getBasePolywrapClientConfigBuilder().build());
};
