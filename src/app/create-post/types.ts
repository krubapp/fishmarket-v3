export type CreatePostStep = 1 | 2 | 3 | 4;

export const STEP_TITLES: Record<CreatePostStep, string> = {
  1: "Upload Video",
  2: "Preview & Caption",
  3: "Tag & Link",
  4: "Settings",
};

export const TOTAL_STEPS = 4;
