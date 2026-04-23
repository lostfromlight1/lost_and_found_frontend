import ProtectedLayoutClient from "@/app/(protected)/ProtectedLayoutClient"; // <-- Import our global shell

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedLayoutClient>
      {children}
    </ProtectedLayoutClient>
  );
}
