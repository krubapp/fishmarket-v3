/**
 * VariantList (Figma: node 443:1585).
 * Table display of variant groups on the create-listing form.
 */

import type { VariantGroup } from "@/lib/schemas/listing";

export interface VariantListProps {
  /** Variant groups to display. */
  groups: VariantGroup[];
  /** Called when groups change (price, available, image updates). */
  onGroupsChange: (groups: VariantGroup[]) => void;
  /** Called when user wants to open the variant drawer. */
  onOpenDrawer: () => void;
  /** Local variant image files keyed by variant value ID. */
  variantImageFiles: Map<string, File>;
  /** Called when a variant image file is selected. */
  onVariantImageSelect: (valueId: string, file: File) => void;
}
