/**
 * Media dropzone (Figma: Image zone, node 87:1090).
 * Drop/select area for images/videos with title, subtitle, and error state.
 */

export type MediaDropzoneProps = {
  /** Main line (default "Select images "). */
  title?: string;
  /** Helper line (default "You can only add up to 10 images / videos"). */
  subtitle?: string;
  /** Called with selected files (e.g. from click or drop). */
  onFilesSelect?: (files: File[]) => void;
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
  /** Optional content to show when media is placed (e.g. preview). */
  children?: React.ReactNode;
};
