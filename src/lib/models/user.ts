import { Conversation } from "./conversation";

export interface User {
  id: string;
  magicIssuer?: string;
  email?: string;
  anonId?: string;
  isAdmin: boolean;
  conversations: Conversation[];
}

export enum UserMessageType {
  ABORT = "ABORT",
  MESSAGE = "MESSAGE",
  FUNCTION = "FUNCTION",
  NONE = "NONE",
}
