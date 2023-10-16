import { InvocationResultMessage, MessageType, TextMessage } from "../models/message";

import { Conversation } from "../models/conversation";
import { QueryClient } from "@tanstack/react-query";

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

export const addOptimisticInvokeResultMessage = (
  conversationId: string,
  result: string,
  ok: boolean,
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
        fromUser: false,
        timestamp: new Date(),
        ok: ok,
        result: result,
        kind: MessageType.InvocationResultMessage,
        conversation: previousConversation,
      } as InvocationResultMessage,
    ],
  });

  return { previousConversation };
};