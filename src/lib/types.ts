export type ChatSuggestion = {
  title: string;
  subtitle: string;
  prompt: string;
  preselect?: {
    from: number;
    to: number;
  }
};
