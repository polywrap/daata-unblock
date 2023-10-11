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

  return builder;
};

export const getPolywrapClient = async () => {
  const { login } = getMagic();

  if (!useProviderStore.getState().provider) {
    const resultingProvider = await login();
    useProviderStore.setState({ provider: resultingProvider });
  }

  const provider = useProviderStore.getState()
    .provider as ethers.providers.Web3Provider;

  const connection = new Connection({
    provider: provider,
  });
  const safeOwner = provider.getSigner(0);

  const ethAdapter = new EthersAdapter({
    ethers,
    signerOrProvider: safeOwner,
  });

  const builder = getBasePolywrapClientConfigBuilder();

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
      txServiceUrl: "https://safe-transaction-mainnet.safe.global",
      ethAdapter: ethAdapter,
    })
  );

  console.log(builder);

  return new PolywrapClient(builder.build());
};

export const getReadonlyPolywrapClient = () => {
  return new PolywrapClient(getBasePolywrapClientConfigBuilder().build());
};
