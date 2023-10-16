"use client";

import * as Loader from "react-loader-spinner";

import { useEffect, useRef, useState } from "react";

import { CHAT_SUGGESTIONS } from "@/lib/constants";
import { ChatSuggestion } from "@/lib/types";
import ChatSuggestions from "@/app/components/ChatSuggestions";
import InvocationMessageBox from "./components/InvocationMessageBox";
import InvocationResultBox from "./components/InvocationResultBox";
import { MessageType } from "@/lib/models/message";
import { OPTIMISTIC_CONVERSATION_ID } from "@/constants";
import TextMessageBox from "./components/TextMessageBox";
import useAddMessage from "@/mutations/useAddMessage";
import useConversation from "@/queries/useConversation";
import { useParams } from "next/navigation";

const Conversation = () => {
  const { id } = useParams();
  const listRef = useRef(null);
  const [promptValue, setPromptValue] = useState<string>();
  const { data: conversation } = useConversation(id as string);
  const { mutate: addMessage, isLoading: isLoadingAddMessage } = useAddMessage(
    id as string
  );
  const promptRef = useRef<HTMLTextAreaElement>(null);

  const conversationIsOptimisticPlaceholder = id === OPTIMISTIC_CONVERSATION_ID;

  useEffect(() => {
    setPromptValue("");
  }, []);

  useEffect(() => {
    (listRef.current as any)?.lastElementChild?.scrollIntoView();
  }, [conversation]);

  const onSubmit = () => {
    if (promptValue && promptValue.length) {
      addMessage(promptValue);
    }
    setPromptValue("");
  };

  const isLoading = isLoadingAddMessage || conversationIsOptimisticPlaceholder;

  const lastMessage = conversation?.messages?.length
    ? conversation.messages[conversation.messages.length - 1]
    : undefined;

  const shouldDisableInput =
    isLoading ||
    !conversation ||
    conversation.completed ||
    conversationIsOptimisticPlaceholder ||
    (lastMessage?.kind === MessageType.InvocationMessage &&
      lastMessage.method !== "askQuestion");

  const onSuggestionSelect = (suggestion: ChatSuggestion) => {
    setPromptValue(suggestion.prompt);
    const setFocus = () => {
      promptRef.current?.focus();
      if (suggestion.preselect) {
        promptRef.current?.setSelectionRange(
          suggestion.preselect.from,
          suggestion.preselect.to
        );
      }
    };
    setTimeout(() => {
      setFocus();
    });
  };

  return (
    <>
      <div className="flex-1 h-full w-full flex flex-col items-center bg-gray-50 overflow-y-auto">
        {conversation?.messages?.length ? (
          <ul
            className="flex-1 flex flex-col gap-2 w-full max-w-3xl py-10"
            ref={listRef}
          >
            {conversation?.agentChatId && (
              <li className="text-xs text-gray-500">
                Agent chat ID: {conversation.agentChatId}
              </li>
            )}
            {conversation?.messages.map((message, i) => {
              switch (message.kind) {
                case MessageType.InvocationMessage:
                  if (message.method === "askQuestion") {
                    return (
                      <TextMessageBox
                        key={message.id}
                        message={{
                          id: message.id,
                          kind: MessageType.TextMessage,
                          text: message.args.question,
                          fromUser: false,
                          timestamp: message.timestamp,
                          conversation: message.conversation,
                        }}
                      />
                    );
                  }

                  if (!message.isReadonly) {
                    return (
                      <InvocationMessageBox
                        key={message.id}
                        message={message}
                        conversationId={conversation.id}
                        disabled={i !== conversation.messages.length - 1}
                      />
                    );
                  }

                  break;
                case MessageType.InvocationResultMessage:
                  return (
                    <InvocationResultBox
                      type={message.ok ? "success" : "error"}
                      result={message.result}
                    ></InvocationResultBox>
                  );
                  break;
                case MessageType.TextMessage:
                  return <TextMessageBox key={message.id} message={message} />;
              }
            })}
            {isLoading || id === "new" ? (
              <li className="flex justify-center items-center p-2">
                <Loader.TailSpin
                  height="50"
                  width="50"
                  color="#5361F8"
                  ariaLabel="tail-spin-loading"
                  radius="1"
                  wrapperStyle={{}}
                  wrapperClass=""
                  visible={true}
                />
              </li>
            ) : null}
          </ul>
        ) : (
          <div className="max-w-3xl h-full flex flex-col justify-end pb-6">
            <ChatSuggestions
              suggestions={CHAT_SUGGESTIONS}
              onSuggestionSelect={(prompt) => onSuggestionSelect(prompt)}
            ></ChatSuggestions>
          </div>
        )}
      </div>
      <div className="flex justify-center items-center border-t-2 border-gray-100 w-full">
        {promptValue !== undefined ? (
          <textarea
            className="m-6 border-primary-100 border-2 w-full max-w-3xl min-h-[64px] p-3 text-sm rounded-lg"
            value={promptValue}
            disabled={shouldDisableInput}
            onChange={(e) => setPromptValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key !== "Enter") return;
              onSubmit();
              e.currentTarget.blur();
            }}
            ref={promptRef}
          />
        ) : null}
      </div>
    </>
  );
};

export default Conversation;
