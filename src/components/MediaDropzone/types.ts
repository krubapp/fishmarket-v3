/**
 * Media dropzone (Figma: Image zone, node 87:1090).
 * Drop/select area for images/videos with title, subtitle, and error state.
 * When `files` is provided, renders an internal image carousel with
 * navigation arrows, counter pill, and delete button.
 */

export type MediaDropzoneProps = {
  /** Main line (default "Select images "). */
  title?: string;
  /** Helper line (default "You can only add up to 10 images / videos"). */
  subtitle?: string;
  /** Current files. When non-empty, shows preview carousel with controls. */
  files?: File[];
  /** Called when files are added (drop/click) or removed (delete button). */
  onFilesChange?: (files: File[]) => void;
  /** Called when some HEIC files could not be converted (e.g. unsupported variant). Receives the failed files so the parent can show a message. */
  onConversionError?: (failedFiles: File[]) => void;
  /** Accept attribute for the file input (default "image/*,video/*"). */
  accept?: string;
  /** Max number of files (default 10). */
  maxFiles?: number;
  /** Error state: red background and border. */
  error?: boolean;
  /** Disabled state. */
  disabled?: boolean;
  /** Optional class for the root element. */
  className?: string;
  /** Optional content when no `files` prop (backwards-compatible). */
  children?: React.ReactNode;
};
