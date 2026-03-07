/**
 * VariantDrawer (Figma: variant headers flow, node 410:10870).
 * Drawer for creating/managing variant groups on a listing.
 */

export type { VariantGroup, VariantValue } from "@/lib/schemas/listing";

export interface VariantDrawerProps {
  /** Whether the drawer is open. */
  open: boolean;
  /** Called when the drawer should close. */
  onClose: () => void;
  /** Current variant groups. */
  groups: import("@/lib/schemas/listing").VariantGroup[];
  /** Called when groups change (add/remove/rename groups, add/remove values). */
  onGroupsChange: (groups: import("@/lib/schemas/listing").VariantGroup[]) => void;
}
