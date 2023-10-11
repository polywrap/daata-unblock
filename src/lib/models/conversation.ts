import dayjs from "dayjs";
import {
  TextMessage,
  InvocationMessage,
  InvocationResultMessage,
} from "./message";
import { User } from "./user";

export interface ConversationDTO {
  id: string;
  name?: string;
  createdAt: string;
  completed: boolean;
  error?: string;
  messages: (InvocationMessage | TextMessage | InvocationResultMessage)[];
  user: User;
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
