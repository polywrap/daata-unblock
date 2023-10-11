import http from "@/lib/http";
import {
  ConversationDTO,
  conversationDTOToConversation,
} from "@/lib/models/conversation";
import { useQuery } from "@tanstack/react-query";

export default function useConversation(id: string) {
  return useQuery(
    ["conversation", id],
    async () => {
      const { data } = await http.get<ConversationDTO>(`conversations/${id}`);

      return conversationDTOToConversation(data);
    },
    {
      enabled: !!id,
      refetchOnMount: false,
    }
  );
}
