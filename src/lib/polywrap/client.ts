import {
  PolywrapClient,
  PolywrapClientConfigBuilder,
} from "@polywrap/client-js";
import { ethers } from "ethers";
import {
  Connection,
  Connections,
  ethereumWalletPlugin,
} from "@polywrap/ethereum-wallet-js";
import { makeAddressBookPlugin } from "./plugins/AddressBook";
import { getMagic } from "../magic";
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

  return new PolywrapClient(builder.build());
};

export const getReadonlyPolywrapClient = () => {
  return new PolywrapClient(getBasePolywrapClientConfigBuilder().build());
};
