import { Invocation } from "@/lib/models/invocation";
import { ethers } from "ethers";

const ReadableAction = ({ invocation }: { invocation: Invocation }) => {
  if (invocation.method === "sendTransaction") {
    return (
      <p className="font-bold text-primary-300 text-sm">
        Send{" "}
        <span className="text-primary-500">
          {ethers.utils.formatEther(invocation.args?.tx?.value).toString()} ETH
        </span>{" "}
        to <span className="text-primary-500">{invocation.args?.tx?.to}</span>
      </p>
    );
  }

  if (invocation.method === "set") {
    return (
      <p className="font-bold text-primary-300 text-sm">
        Set <span className="text-primary-500">{invocation.args?.key}</span> to{" "}
        <span className="text-primary-500">{invocation.args?.value}</span> in
        your address book
      </p>
    );
  }

  return (
    <p className="font-bold text-primary-300 text-sm">
      Invoke <span className="text-primary-500">{invocation.method}</span> with{" "}
      <span className="text-primary-500">
        {JSON.stringify(invocation.args, null, 2)}
      </span>
    </p>
  );
};

const ActionBox = ({ invocation }: { invocation: Invocation }) => {
  return (
    <div className="flex gap-2 items-center">
      <div className="flex-1 rounded-lg border-primary-300 border px-4 py-2">
        <ReadableAction invocation={invocation} />
      </div>
    </div>
  );
};

export default ActionBox;
