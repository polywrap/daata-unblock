import { Conversation, ConversationDTO } from "@/lib/models/conversation";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { MessageType } from "@/lib/models/message";
import { OPTIMISTIC_CONVERSATION_ID } from "@/constants";
import { User } from "@/lib/models/user";
import dayjs from "dayjs";
import http from "@/lib/http";
import { useRouter } from "next/navigation";

export default function useCreateConversation() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["createSession"],
    mutationFn: async ({ prompt }: { prompt?: string }) => {
      const optimisticConversation = {
        id: OPTIMISTIC_CONVERSATION_ID,
        completed: false,
        createdAt: new Date().toISOString(),
        lastUpdated: dayjs(),
        user: {} as User,
        messages: prompt
          ? [
              {
                id: "optimistic",
                fromUser: true,
                timestamp: new Date(),
                text: prompt,
                kind: MessageType.TextMessage,
              },
            ]
          : [],
      } as Conversation;

      const previousConversations =
        queryClient.getQueryData<Conversation[]>(["conversations"]) ?? [];

      queryClient.setQueryData(
        ["conversations"],
        [...previousConversations, optimisticConversation]
      );

      queryClient.setQueryData(
        ["conversation", OPTIMISTIC_CONVERSATION_ID],
        optimisticConversation
      );

      router.push(`/conversations/${OPTIMISTIC_CONVERSATION_ID}`);

      const { data } = await http.post<ConversationDTO>(`conversations`, {
        prompt,
      });

      const newConversations = [
        ...previousConversations.filter(
          (conversation) => conversation.id !== OPTIMISTIC_CONVERSATION_ID
        ),
        data,
      ];

      return { previousConversations, newConversations };
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["conversations"], data.newConversations);

      const newConversationId = data.newConversations.slice(-1)[0].id;
      router.replace(`/conversations/${newConversationId}`);
    },
    onError: (_, __, context: any) => {
      queryClient.setQueryData(
        ["conversations"],
        context.previousConversations
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["conversations"],
      });
    },
  });
}
