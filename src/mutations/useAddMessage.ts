import { API_URL } from "@/constants";
import http from "@/lib/http";
import {
  Conversation,
  ConversationDTO,
  conversationDTOToConversation,
} from "@/lib/models/conversation";
import { MessageType, TextMessage } from "@/lib/models/message";
import { UserMessageType } from "@/lib/models/user";
import { addOptimisticMessage } from "@/lib/optimisticUpdates/conversation";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function useAddMessage(conversationId: string) {
  const queryClient = useQueryClient();

  return useMutation(
    ["addMessage"],
    async (prompt: string) => {
      await queryClient.cancelQueries({
        queryKey: ["conversation", conversationId],
      });

      const { previousConversation } = addOptimisticMessage(
        conversationId,
        prompt,
        queryClient
      );

      const { data } = await http.put<ConversationDTO>(
        `conversations/${conversationId}`,
        {
          type: UserMessageType.MESSAGE,
          content: prompt,
        }
      );

      const newConversation = conversationDTOToConversation(data);

      return { previousConversation, newConversation };
    },
    {
      onError: (_, __, context: any) => {
        queryClient.setQueryData(
          ["conversation", conversationId],
          context.previousConversation
        );
      },
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: ["conversation", conversationId],
        });
      },
    }
  );
}
