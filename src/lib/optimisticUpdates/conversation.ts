import { QueryClient } from "@tanstack/react-query";
import { Conversation } from "../models/conversation";
import { MessageType, TextMessage } from "../models/message";

export const addOptimisticMessage = (
  conversationId: string,
  text: string,
  queryClient: QueryClient
) => {
  // Snapshot the previous value
  const previousConversation = queryClient.getQueryData([
    "conversation",
    conversationId,
  ]) as Conversation;

  // Optimistically update to the new value
  queryClient.setQueryData(["conversation", conversationId], {
    ...previousConversation,
    messages: [
      ...(previousConversation?.messages ?? []),
      {
        id: "optimistic",
        fromUser: true,
        timestamp: new Date(),
        text,
        kind: MessageType.TextMessage,
        conversation: previousConversation,
      } as TextMessage,
    ],
  });

  return { previousConversation };
};
