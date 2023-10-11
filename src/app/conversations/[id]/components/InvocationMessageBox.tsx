import { InvocationMessage } from "@/lib/models/message";
import ActionBox from "./ActionBox";
import useInvoke from "@/mutations/useInvoke";
import useSendInvocationResult from "@/mutations/useSendInvocationResult";
import InvocationResult from "@/app/components/InvocationResult";

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

  const invocation = {
    uri: message.uri,
    method: message.method,
    args: message.args,
  };

  const onClick = () => {
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

  return (
    <li className="px-6 py-4 rounded-lg border-2 bg-white border-primary-300 flex flex-col gap-4">
      <h2 className="font-bold">Actions</h2>
      <div className="flex flex-col gap-2">
        <ActionBox invocation={invocation} />
      </div>
      <button
        disabled={!!data}
        onClick={() => {
          onClick();
        }}
        className="rounded-lg bg-primary-500 w-full px-4 py-3 text-white font-bold"
      >
        Execute
      </button>
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
