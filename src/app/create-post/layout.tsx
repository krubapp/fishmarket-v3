import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function CreatePostLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}
