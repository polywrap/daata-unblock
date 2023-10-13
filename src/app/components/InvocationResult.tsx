import ErrorIcon from "../../../public/icons/error.svg";
import Image from "next/image";
import LoadingIcon from "../../../public/icons/infoCircle.svg";
import SuccessIcon from "../../../public/icons/successCheck.svg";
import clsx from "clsx";
import { useState } from "react";

type InvocationResultType = "success" | "error" | "loading";

interface Props {
  type: InvocationResultType;
  text: string;
  data?: any;
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

const InvocationResult = ({ type, text, data }: Props) => {
  const [isDataExpanded, setIsDataExpanded] = useState(false);

  const toggleExpand = () => {
    setIsDataExpanded(!isDataExpanded);
  };

  return (
    <div
      className={clsx(
        "flex flex-col gap-2 broder rounded-lg p-3 text-sm overflow-x-auto",
        colorClasses[type]
      )}
    >
      <div className={clsx("flex items-center gap-2")}>
        <Image src={iconsMap[type]} width={32} height={32} alt={type} />
        <p>{text}</p>
        {data && (
          <span
            className="text-sm font-semibold cursor-pointer hover:underline"
            onClick={() => toggleExpand()}
          >
            Show {isDataExpanded ? "less" : "more"}
          </span>
        )}
      </div>

      {isDataExpanded && (
        <pre className="text-sm font-mono">{JSON.stringify(data, null, 2)}</pre>
      )}
    </div>
  );
};

export default InvocationResult;
