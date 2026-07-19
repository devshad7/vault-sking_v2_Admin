import { BubbleMenu } from "@tiptap/react/menus";
import type { Editor } from "@tiptap/react";
import type { EditorState } from "@tiptap/pm/state";
import { Bold, Italic, Underline as UnderlineIcon, Strikethrough, Link2 } from "lucide-react";

interface SelectionBubbleMenuProps {
  editor: Editor;
}

export function SelectionBubbleMenu({ editor }: SelectionBubbleMenuProps) {
  return (
    <BubbleMenu
      editor={editor}
      shouldShow={({ state }: { state: EditorState }) => !state.selection.empty}
      className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1 shadow-lg dark:border-slate-700 dark:bg-slate-800"
    >
      <BubbleButton
        active={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
        label="Bold"
      >
        <Bold size={14} />
      </BubbleButton>
      <BubbleButton
        active={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
        label="Italic"
      >
        <Italic size={14} />
      </BubbleButton>
      <BubbleButton
        active={editor.isActive("underline")}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        label="Underline"
      >
        <UnderlineIcon size={14} />
      </BubbleButton>
      <BubbleButton
        active={editor.isActive("strike")}
        onClick={() => editor.chain().focus().toggleStrike().run()}
        label="Strikethrough"
      >
        <Strikethrough size={14} />
      </BubbleButton>
      <BubbleButton
        active={editor.isActive("link")}
        onClick={() => {
          const url = window.prompt("Enter URL", editor.getAttributes("link").href ?? "https://");
          if (url === null) return;
          if (url === "") {
            editor.chain().focus().unsetLink().run();
            return;
          }
          editor.chain().focus().setLink({ href: url }).run();
        }}
        label="Link"
      >
        <Link2 size={14} />
      </BubbleButton>
    </BubbleMenu>
  );
}

function BubbleButton({
  onClick,
  active,
  label,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={`rounded p-1.5 ${
        active
          ? "bg-orange-500 text-white"
          : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
      }`}
    >
      {children}
    </button>
  );
}