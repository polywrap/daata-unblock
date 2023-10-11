import { API_URL } from "@/constants";
import http from "@/lib/http";
import { ConversationDTO } from "@/lib/models/conversation";
import { UserMessageType } from "@/lib/models/user";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function useSendInvocationResult(conversationId: string) {
  const queryClient = useQueryClient();

  return useMutation(
    ["sendInvocationResult"],
    async (args: { functionName: string; result: string }) => {
      await http.put<ConversationDTO>(`conversations/${conversationId}`, {
        type: UserMessageType.FUNCTION,
        functionName: args.functionName,
        content: args.result,
      });

      queryClient.invalidateQueries(["conversation", conversationId]);
    }
  );
}
