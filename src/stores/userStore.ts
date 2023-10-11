import { create } from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";

interface UserState {
  xUserId: string | null;
  setXUserId: (id: string) => void;
  pendingPrompt: string | null;
  setPendingPrompt: (prompt: string | null) => void;
  activeConversationId: string | null;
  setActiveConversationId: (id: string | null) => void;
}

export const useUserStore = create<UserState>()(
  devtools(
    persist(
      (set) => ({
        activeConversationId: null,
        setActiveConversationId: (id) =>
          set((state) => {
            state.activeConversationId = id;

            return state;
          }),
        pendingPrompt: null,
        setPendingPrompt: (prompt) =>
          set((state) => {
            state.pendingPrompt = prompt;

            return state;
          }),
        xUserId: null,
        setXUserId: (id) =>
          set((state) => {
            state.xUserId = id;

            return state;
          }),
      }),
      {
        name: "user-storage",
        storage: createJSONStorage(() => localStorage),
      }
    )
  )
);
