"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import { buildExtensions } from "./extensions";
import { Toolbar } from "./Toolbar";
import { SelectionBubbleMenu } from "./SelectionBubbleMenu";
import { EditorStatsBar } from "./EditorStatsBar";
import { sanitizeEditorHtml } from "@/lib/sanitizeHtml";
import type { BlogEditorProps, EditorStats } from "./types";

const AVERAGE_WORDS_PER_MINUTE = 200;

export default function Editor({
  value,
  onChange,
  placeholder = "Write your story...",
  onImageUpload,
  editable = true,
  className = "",
  colorScheme = "auto",
  minHeight = 320,
}: BlogEditorProps) {
  const [isDark, setIsDark] = useState(false);
  const [imagePromptOpen, setImagePromptOpen] = useState(false);

  const extensions = useMemo(() => buildExtensions(placeholder), [placeholder]);

  const editor = useEditor({
    extensions,
    content: value,
    editable,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "prose prose-slate dark:prose-invert max-w-none focus:outline-none px-4 py-3",
      },
      handleDrop: (view, event) => {
        const file = event.dataTransfer?.files?.[0];
        if (file && file.type.startsWith("image/")) {
          event.preventDefault();
          void insertImageFile(file);
          return true;
        }
        return false;
      },
      handlePaste: (view, event) => {
        const file = Array.from(event.clipboardData?.files ?? []).find((f) =>
          f.type.startsWith("image/")
        );
        if (file) {
          event.preventDefault();
          void insertImageFile(file);
          return true;
        }
        return false;
      },
    },
    onUpdate: ({ editor: e }) => {
      onChange(sanitizeEditorHtml(e.getHTML()));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const insertImageFile = useCallback(
    async (file: File) => {
      if (!editor) return;
      try {
        const url = onImageUpload ? await onImageUpload(file) : URL.createObjectURL(file);
        editor.chain().focus().setImage({ src: url, alt: file.name }).run();
      } catch {
        // Silently ignore failed uploads; caller can surface its own toast.
      }
    },
    [editor, onImageUpload]
  );

  // Listen for the slash-command "insert image" request.
  useEffect(() => {
    if (!editor) return;
    const handler = () => setImagePromptOpen(true);
    editor.view.dom.addEventListener("blog-editor:request-image", handler);
    return () =>
      editor.view.dom.removeEventListener("blog-editor:request-image", handler);
  }, [editor]);

  useEffect(() => {
    if (!imagePromptOpen) return;
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = () => {
      const file = input.files?.[0];
      if (file) void insertImageFile(file);
      setImagePromptOpen(false);
    };
    input.click();
  }, [imagePromptOpen, insertImageFile]);

  // Keep editor content in sync if `value` changes externally (e.g. loading
  // a different blog post into the same mounted editor).
  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if (value !== current && value !== undefined) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, editor]);

  useEffect(() => {
    if (colorScheme === "auto") {
      const media = window.matchMedia("(prefers-color-scheme: dark)");
      setIsDark(document.documentElement.classList.contains("dark") || media.matches);
      const listener = (e: MediaQueryListEvent) => setIsDark(e.matches);
      media.addEventListener("change", listener);
      return () => media.removeEventListener("change", listener);
    }
    setIsDark(colorScheme === "dark");
  }, [colorScheme]);

  const stats: EditorStats = useMemo(() => {
    const characters = editor?.storage.characterCount?.characters() ?? 0;
    const words = editor?.storage.characterCount?.words() ?? 0;
    return {
      characters,
      words,
      readingTimeMinutes: Math.max(1, Math.ceil(words / AVERAGE_WORDS_PER_MINUTE)),
    };
  }, [editor?.storage.characterCount, editor?.state]);

  if (!editor) {
    return (
      <div
        className="animate-pulse rounded-lg border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800"
        style={{ minHeight }}
      />
    );
  }

  return (
    <div
      className={`${isDark ? "dark" : ""} ${className}`}
      data-blog-editor-root
    >
      <div className="overflow-hidden rounded-lg border border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-900">
        {editable && <Toolbar editor={editor} onImageUpload={onImageUpload} />}
        {editable && <SelectionBubbleMenu editor={editor} />}
        <div style={{ minHeight }} className="overflow-y-auto">
          <EditorContent editor={editor} />
        </div>
        {editable && <EditorStatsBar stats={stats} />}
      </div>
    </div>
  );
}