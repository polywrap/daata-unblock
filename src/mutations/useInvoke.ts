import {
  getPolywrapClient,
  getReadonlyPolywrapClient,
} from "@/lib/polywrap/client";

import { Invocation } from "@/lib/models/invocation";
import { PolywrapClient } from "@polywrap/client-js";
import { ethers } from "ethers";
import { getMagic } from "@/lib/magic";
import { useMutation } from "@tanstack/react-query";
import { useProviderStore } from "@/stores/providerStore";

const useInvoke = () => {
  return useMutation({
    mutationFn: async (args: {
      invocation: Invocation;
      requiresSignature: boolean;
    }) => {
      let polywrapClient: PolywrapClient;

      if (args.requiresSignature) {
        // Ensure that a provider is present
        // if provider is present, we don't request a wallet connection again
        if (!useProviderStore.getState().provider) {
          const { login } = getMagic();

          const resultingProvider = await login();
          useProviderStore.setState({ provider: resultingProvider });
        }

        const provider = useProviderStore.getState()
          .provider as ethers.providers.Web3Provider;

        polywrapClient = await getPolywrapClient(provider);
      } else {
        polywrapClient = await getPolywrapClient(null);
      }

      const result = await polywrapClient.invoke({
        uri: args.invocation.uri,
        method: args.invocation.method,
        args: args.invocation.args,
      });

      if (!result.ok) {
        throw new Error(`Invocation failed: ${result.error}`);
      }

      return result.value;
    },
  });
};

export default useInvoke;
