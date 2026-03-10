import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function CreateListingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}
