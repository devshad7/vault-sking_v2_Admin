export interface BlogEditorProps {
  /** Sanitized HTML string (controlled value) */
  value: string;
  /** Called with sanitized HTML on every meaningful change */
  onChange: (html: string) => void;
  placeholder?: string;
  /** Handles uploading a File and must resolve to a public URL */
  onImageUpload?: (file: File) => Promise<string>;
  editable?: boolean;
  className?: string;
  /** Force a color scheme instead of following the `dark` class / OS preference */
  colorScheme?: "light" | "dark" | "auto";
  minHeight?: number;
}

export interface EditorStats {
  characters: number;
  words: number;
  readingTimeMinutes: number;
}