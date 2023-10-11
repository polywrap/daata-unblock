export const API_URL = process.env.NEXT_PUBLIC_ROOT_API_URL as string;
export const MAGIC_KEY = process.env.NEXT_PUBLIC_MAGIC_KEY as string;

if (!API_URL) {
  throw new Error("API_URL is not defined");
}

if (!MAGIC_KEY) {
  throw new Error("MAGIC_KEY is not defined");
}

export const OPTIMISTIC_CONVERSATION_ID = "new";
