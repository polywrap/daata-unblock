import { ChatSuggestion } from "@/lib/types";
import clsx from "clsx";

type Props = {
  suggestions: ChatSuggestion[];
  onSuggestionSelect?: (suggestion: ChatSuggestion) => void;
};

export default function ChatSuggestions({
  suggestions,
  onSuggestionSelect,
}: Props) {
  const maybeRunSuggestion = (suggestion: ChatSuggestion) => {
    if (onSuggestionSelect) {
      onSuggestionSelect(suggestion);
    }
  };

  return (
    <div className="grid grid-rows-2 grid-cols-3 gap-4">
      {suggestions.map((suggestion, i) => (
        <div
          key={`suggestion-${i}`}
          className={clsx(
            "rounded-lg bg-white border-primary-300 border-2 drop-shadow-md h-14 py-1 px-3 text-xs flex flex-col justify-center",
            {"cursor-pointer": onSuggestionSelect}
          )}
          onClick={() => maybeRunSuggestion(suggestion)}
        >
          {suggestion.title}
          <br />
          <span className="text-xxs text-neutral-400">
            {suggestion.subtitle}
          </span>
        </div>
      ))}
    </div>
  );
}
