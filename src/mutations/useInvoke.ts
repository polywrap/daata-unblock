import {
  getPolywrapClient,
  getReadonlyPolywrapClient,
} from "@/lib/polywrap/client";

import { Invocation } from "@/lib/models/invocation";
import { useMutation } from "@tanstack/react-query";

const useInvoke = () => {
  return useMutation({
    mutationFn: async (args: {
      invocation: Invocation;
      requiresSignature: boolean;
    }) => {
      const polywrapClient = await getPolywrapClient()

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
