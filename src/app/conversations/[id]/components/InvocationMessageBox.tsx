import ActionBox from "./ActionBox";
import { InvocationMessage } from "@/lib/models/message";
import { addOptimisticInvokeResultMessage } from "@/lib/optimisticUpdates/conversation";
import clsx from "clsx";
import { getMagic } from "@/lib/magic";
import useInvoke from "@/mutations/useInvoke";
import { useProviderStore } from "@/stores/providerStore";
import { useQueryClient } from "@tanstack/react-query";
import useSendInvocationResult from "@/mutations/useSendInvocationResult";
import { useState } from "react";

const InvocationMessageBox = ({
  message,
  conversationId,
  disabled: disabled,
}: {
  message: InvocationMessage;
  conversationId: string;
  disabled: boolean;
}) => {
  const { mutate: sendInvocationResult } =
    useSendInvocationResult(conversationId);
  const { mutate: invoke, isLoading, data } = useInvoke();
  const queryClient = useQueryClient();
  const { provider } = useProviderStore();

  const isWalletConnected = !!provider;

  const [isWalletConnecting, setIsWalletConnecting] = useState(false);

  const invocation = {
    uri: message.uri,
    method: message.method,
    args: message.args,
  };

  const onInvoke = () => {
    invoke(
      {
        invocation,
        requiresSignature: message.requiresSign,
      },
      {
        onSuccess: (data) => {
          console.log(data);
          addOptimisticInvokeResultMessage(
            conversationId,
            JSON.stringify({ result: data, error: null }),
            true,
            queryClient
          );
          sendInvocationResult({
            functionName: message.functionName,
            result: JSON.stringify({ result: data, error: null }),
            ok: true,
          });
        },
        onError: (error) => {
          console.log(error);
          addOptimisticInvokeResultMessage(
            conversationId,
            JSON.stringify({ result: null, error: error }),
            false,
            queryClient
          );
          sendInvocationResult({
            functionName: message.functionName,
            result: JSON.stringify({
              result: null,
              error: (error as any).message,
            }),
            ok: false,
          });
        },
      }
    );
  };

  const onConnectWallet = async () => {
    const { login } = getMagic();

    if (!useProviderStore.getState().provider) {
      setIsWalletConnecting(true);

      try {
        const resultingProvider = await login();
        useProviderStore.setState({ provider: resultingProvider });
      } catch (e) {
        console.error(e);
      }

      setIsWalletConnecting(false);
    }
  };

  return (
    <li className="px-6 py-4 rounded-lg border-2 bg-white border-primary-300 flex flex-col gap-4">
      <h2 className="font-bold">Action</h2>
      <div className="text-sm text-gray-500">{message.description}</div>
      <div className="flex flex-col gap-2">
        <ActionBox invocation={invocation} />
      </div>
      {!isWalletConnected && message.requiresSign && !disabled ? (
        <button
          disabled={isWalletConnecting || disabled}
          onClick={() => {
            onConnectWallet();
          }}
          className={clsx(
            "rounded-lg bg-primary-500 w-full px-4 py-3 text-white font-bold disabled:bg-primary-300",
            { "animate-pulse": isWalletConnecting }
          )}
        >
          Connect wallet
        </button>
      ) : (
        <button
          disabled={isLoading || disabled}
          onClick={() => {
            onInvoke();
          }}
          className={clsx(
            "rounded-lg bg-primary-500 w-full px-4 py-3 text-white font-bold disabled:bg-primary-300",
            { "animate-pulse": isLoading }
          )}
        >
          {isLoading ? "Executing" : "Execute"}
        </button>
      )}
    </li>
  );
};

export default InvocationMessageBox;
