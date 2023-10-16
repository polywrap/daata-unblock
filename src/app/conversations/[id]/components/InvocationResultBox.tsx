import ErrorIcon from "../../../../../public/icons/error.svg";
import Image from "next/image";
import LoadingIcon from "../../../../../public/icons/infoCircle.svg";
import SuccessIcon from "../../../../../public/icons/successCheck.svg";
import clsx from "clsx";
import { useState } from "react";

type InvocationResultType = "success" | "error" | "loading";

interface Props {
  type: InvocationResultType;
  result: string;
}

const colorClasses: Record<InvocationResultType, string> = {
  success: "bg-success-300 border-success-500",
  error: "bg-error-300 border-error-500",
  loading: "bg-primary-300 border-primary-500",
};

const iconsMap: Record<InvocationResultType, string> = {
  success: SuccessIcon,
  error: ErrorIcon,
  loading: LoadingIcon,
};

const InvocationResultBox = ({ type, result }: Props) => {
  const [isDataExpanded, setIsDataExpanded] = useState(false);

  const toggleExpand = () => {
    setIsDataExpanded(!isDataExpanded);
  };

  const invokeResult = JSON.parse(result) as { result: any; error: any };

  const invokeResultPretty = invokeResult.result
    ? JSON.stringify(invokeResult.result, null, 2)
    : JSON.stringify(invokeResult.error, null, 2);

  return (
    <div
      className={clsx(
        "flex flex-col gap-2 border-2 rounded-lg p-3 text-sm overflow-x-auto",
        colorClasses[type]
      )}
    >
      <div className={clsx("flex items-center gap-2")}>
        <Image src={iconsMap[type]} width={32} height={32} alt={type} />
        <p>{type === "success" ? "Action executed succesfully" : "Error executing action"}</p>
        {result && (
          <span
            className="text-sm font-semibold cursor-pointer hover:underline"
            onClick={() => toggleExpand()}
          >
            Show {isDataExpanded ? "less" : "more"}
          </span>
        )}
      </div>

      {isDataExpanded && (
        <pre className="text-sm font-mono">
          {invokeResultPretty}
        </pre>
      )}
    </div>
  );
};

export default InvocationResultBox;
