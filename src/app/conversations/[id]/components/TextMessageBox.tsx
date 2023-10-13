import PolywrapAvatar from "@/app/components/PolywrapAvatar";
import { TextMessage } from "@/lib/models/message";
import clsx from "clsx";

const TextMessageBox = ({ message }: { message: TextMessage }) => {
  return (
    <li
      key={message.id}
      className={clsx(
        "px-6 py-4 rounded-lg border-2 border-primary-300 flex items-center gap-4",
        message.fromUser ? "bg-primary-100" : "bg-white"
      )}
    >
      {message.fromUser ? (
        <div className="w-8 h-8 rounded-full bg-white border-gray-100 border-2" />
      ) : (
        <PolywrapAvatar />
      )}
      <pre className="text-sm whitespace-pre-wrap font-[hdcolton]">{message.text}</pre>
    </li>
  );
};

export default TextMessageBox;
