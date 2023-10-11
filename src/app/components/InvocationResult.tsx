import clsx from "clsx";
import Image from "next/image";
import SuccessIcon from "../../../public/icons/successCheck.svg";
import LoadingIcon from "../../../public/icons/infoCircle.svg";
import ErrorIcon from "../../../public/icons/error.svg";

type InvocationResultType = "success" | "error" | "loading";

interface Props {
  type: InvocationResultType;
  text: string;
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

const InvocationResult = ({ type, text }: Props) => {
  return (
    <div
      className={clsx(
        "flex items-center gap-2 border rounded-lg p-3 text-sm",
        colorClasses[type]
      )}
    >
      <Image src={iconsMap[type]} width={32} height={32} alt={type} />
      <p>{text}</p>
    </div>
  );
};

export default InvocationResult;
