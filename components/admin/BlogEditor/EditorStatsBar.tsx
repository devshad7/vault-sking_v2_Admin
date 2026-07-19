import type { EditorStats } from "./types";

export function EditorStatsBar({ stats }: { stats: EditorStats }) {
  return (
    <div className="flex items-center justify-end gap-4 border-t border-slate-200 px-3 py-1.5 text-xs text-slate-500 dark:border-slate-700 dark:text-slate-400">
      <span>{stats.words} words</span>
      <span>{stats.characters} characters</span>
      <span>{stats.readingTimeMinutes} min read</span>
    </div>
  );
}