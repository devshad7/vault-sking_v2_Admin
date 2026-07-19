"use client";

import dynamic from "next/dynamic";
import type { BlogEditorProps } from "./types";

/**
 * Reusable rich text editor for blog create/edit forms.
 *
 * Dynamically imported with `ssr: false` because TipTap touches the DOM
 * (ProseMirror) directly and cannot be rendered on the server without
 * hydration mismatches.
 *
 * Usage:
 *   <BlogEditor value={body} onChange={setBody} onImageUpload={uploadFn} />
 */
const EditorClient = dynamic(() => import("./Editor"), {
  ssr: false,
  loading: () => (
    <div className="animate-pulse rounded-lg border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800" style={{ minHeight: 320 }} />
  ),
});

export function BlogEditor(props: BlogEditorProps) {
  return <EditorClient {...props} />;
}

export type { BlogEditorProps } from "./types";