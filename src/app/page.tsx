"use client";

import { useRef, useState } from "react";

import { CHAT_SUGGESTIONS } from "@/lib/constants";
import ChatSuggestions from "./components/ChatSuggestions";
import Image from "next/image";
import SendIcon from "../../public/send.svg";
import useCreateConversation from "@/mutations/useCreateConversation";

export default function Home() {
  const { mutate: createConversation, isLoading } = useCreateConversation();
  const [inputValue, setinputValue] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);

  const onSubmit = () => {
    setinputValue("");
    createConversation({ prompt: inputValue });
  };

  const onPressEnter = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;
    onSubmit();
  };

  const onSuggestionSelect = (prompt: string) => {
    setinputValue(prompt);
    inputRef.current?.focus();
  };

  return (
    <main className="flex h-full justify-center bg-[#f7f7f7] p-24">
      <div className="flex h-full flex-col w-[720px]">
        <div className="flex-1 flex flex-col gap-10 w-full justify-center items-center">
          <h1 className="text-[40px] font-bold text-center text-primary-300">
            What&apos;s blocking you?
          </h1>
          <ChatSuggestions
            suggestions={CHAT_SUGGESTIONS}
            onSuggestionSelect={(prompt) => onSuggestionSelect(prompt)}
          ></ChatSuggestions>
          <div className="relative rainbow-border bg-white drop-shadow-md w-full">
            <span className="absolute inset-y-0 right-0 flex items-center pr-3">
              <button
                type="submit"
                className="p-2 w-10 h-10 border-2 rounded-md flex justify-center items-center"
                onClick={() => {
                  onSubmit();
                }}
              >
                <Image src={SendIcon} alt="send" />
              </button>
            </span>
            <input
              className="bg-transparent h-16 rounded-md w-full p-3 pr-[72px] focus:outline-none"
              onKeyDown={onPressEnter}
              onChange={(e) => setinputValue(e.target.value)}
              value={inputValue}
              disabled={isLoading}
              ref={inputRef}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
