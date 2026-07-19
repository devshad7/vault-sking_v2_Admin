import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
  useCallback,
} from "react";
import type { Editor, Range } from "@tiptap/core";
import type { LucideIcon } from "lucide-react";

export interface SlashCommandItem {
  title: string;
  icon: LucideIcon;
  command: (props: { editor: Editor; range: Range }) => void;
}

interface SlashCommandListProps {
  items: SlashCommandItem[];
  command: (item: SlashCommandItem) => void;
}

export interface SlashCommandListRef {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean;
}

export const SlashCommandList = forwardRef<
  SlashCommandListRef,
  SlashCommandListProps
>((props, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => setSelectedIndex(0), [props.items]);

  const selectItem = useCallback(
    (index: number) => {
      const item = props.items[index];
      if (item) props.command(item);
    },
    [props]
  );

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }) => {
      if (event.key === "ArrowUp") {
        setSelectedIndex(
          (selectedIndex + props.items.length - 1) % props.items.length
        );
        return true;
      }
      if (event.key === "ArrowDown") {
        setSelectedIndex((selectedIndex + 1) % props.items.length);
        return true;
      }
      if (event.key === "Enter") {
        selectItem(selectedIndex);
        return true;
      }
      return false;
    },
  }));

  if (!props.items.length) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-2 text-sm text-slate-500 shadow-lg dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
        No results
      </div>
    );
  }

  return (
    <div className="max-h-72 w-64 overflow-y-auto rounded-lg border border-slate-200 bg-white p-1 shadow-lg dark:border-slate-700 dark:bg-slate-800">
      {props.items.map((item, index) => {
        const Icon = item.icon;
        return (
          <button
            key={item.title}
            type="button"
            onClick={() => selectItem(index)}
            className={`flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm transition-colors ${
              index === selectedIndex
                ? "bg-orange-100 text-orange-900 dark:bg-orange-500/20 dark:text-orange-200"
                : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700"
            }`}
          >
            <Icon size={16} />
            {item.title}
          </button>
        );
      })}
    </div>
  );
});

SlashCommandList.displayName = "SlashCommandList";