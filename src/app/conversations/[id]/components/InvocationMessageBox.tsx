import ActionBox from "./ActionBox";
import { InvocationMessage } from "@/lib/models/message";
import InvocationResult from "@/app/components/InvocationResult";
import { getMagic } from "@/lib/magic";
import useInvoke from "@/mutations/useInvoke";
import { useProviderStore } from "@/stores/providerStore";
import useSendInvocationResult from "@/mutations/useSendInvocationResult";
import { useState } from "react";

const InvocationMessageBox = ({
  message,
  conversationId,
}: {
  message: InvocationMessage;
  conversationId: string;
}) => {
  const { mutate: sendInvocationResult } =
    useSendInvocationResult(conversationId);
  const { mutate: invoke, isLoading, error, data } = useInvoke();

  const [isWalletConnected, setIsWalletConnected] = useState(
    !!useProviderStore.getState().provider
  );

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
        requiresSignature: message.requiresSignature,
      },
      {
        onSuccess: (data) => {
          console.log(data);
          sendInvocationResult({
            functionName: message.functionName,
            result: JSON.stringify({ result: data, error: null }),
          });
        },
        onError: (error) => {
          console.log(error);
          sendInvocationResult({
            functionName: message.functionName,
            result: JSON.stringify({
              result: data,
              error: (error as any).message,
            }),
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
        setIsWalletConnected(!!useProviderStore.getState().provider);
      } catch (e) {
        console.error(e);
      }

      setIsWalletConnecting(false);
    }
  };

  return (
    <li className="px-6 py-4 rounded-lg border-2 bg-white border-primary-300 flex flex-col gap-4">
      <h2 className="font-bold">Actions</h2>
      <div className="flex flex-col gap-2">
        <ActionBox invocation={invocation} />
      </div>
      {isWalletConnected ? (
        <button
          disabled={!!data}
          onClick={() => {
            onInvoke();
          }}
          className="rounded-lg bg-primary-500 w-full px-4 py-3 text-white font-bold"
        >
          Execute
        </button>
      ) : (
        <button
          disabled={isWalletConnecting}
          onClick={() => {
            onConnectWallet();
          }}
          className="rounded-lg bg-primary-500 w-full px-4 py-3 text-white font-bold disabled:bg-primary-300"
        >
          Connect wallet
        </button>
      )}
      {isLoading ? (
        <div>
          <InvocationResult type={"loading"} text={"Invoking actions"} />
        </div>
      ) : null}
      {data ? (
        <div>
          <InvocationResult
            type={"success"}
            text={`Actions executed successfully`}
          />
        </div>
      ) : null}
      {error ? (
        <div>
          <InvocationResult type={"error"} text={`Error executing actions`} />
        </div>
      ) : null}
    </li>
  );
};

export default InvocationMessageBox;
