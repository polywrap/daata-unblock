import { API_URL } from "@/constants";
import http from "@/lib/http";
import {
  ConversationDTO,
  conversationDTOToConversation,
} from "@/lib/models/conversation";
import { useQuery } from "@tanstack/react-query";

export default function useConversations() {
  return useQuery(["conversations"], async () => {
    const { data } = await http.get<ConversationDTO[]>(`conversations`);

    return data.map(conversationDTOToConversation);
  });
}
