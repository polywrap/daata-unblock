import {
  InvocationMessage,
  InvocationResultMessage,
  TextMessage,
} from "./message";

import { User } from "./user";
import dayjs from "dayjs";

export interface ConversationDTO {
  id: string;
  name?: string;
  createdAt: string;
  completed: boolean;
  error?: string;
  messages: (InvocationMessage | TextMessage | InvocationResultMessage)[];
  user: User;
  agentChatId: string;
}

export interface Conversation {
  id: string;
  name?: string;
  messages: (InvocationMessage | TextMessage | InvocationResultMessage)[];
  user: User;
  createdAt: string;
  completed: boolean;
  error?: string;
  lastUpdated: dayjs.Dayjs;
  agentChatId: string;
}

export const conversationDTOToConversation = (
  dto: ConversationDTO
): Conversation => ({
  ...dto,
  lastUpdated:
    dto.messages && dto.messages.length
      ? dayjs(dto.messages[dto.messages.length - 1].timestamp)
      : dayjs(dto.createdAt),
});
