import { Conversation } from "./conversation";

export enum MessageType {
  TextMessage = "TEXT_MESSAGE",
  InvocationMessage = "FUNCTION_MESSAGE",
  InvocationResultMessage = "FUNCTION_RESULT_MESSAGE",
}

export interface Message {
  id: string;
  timestamp: Date;
  fromUser: boolean;
  conversation: Conversation;
}

export interface TextMessage extends Message {
  kind: MessageType.TextMessage;
  text: string;
}

export interface InvocationMessage extends Message {
  kind: MessageType.InvocationMessage;
  uri: string;
  method: string;
  args: any;
  functionName: string;
  isReadonly: boolean;
  requiresSign: boolean;
  readableDescription: string;
}

export interface InvocationResultMessage extends Message {
  kind: MessageType.InvocationResultMessage;
  result: string;
}
