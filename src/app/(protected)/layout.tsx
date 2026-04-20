import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/features/auth/config/auth-options";
import Navbar from "@/components/layout/Navbar";
import LeftSidebar from "@/components/layout/LeftSidebar";
import RightSidebar from "@/components/layout/RightSidebar";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-100/50">
      <Navbar user={session.user} />
      
      <div className="flex flex-1 overflow-hidden">
        <LeftSidebar userRole={session.user?.role} />
        
        {/* Main scrollable feed area */}
        <main className="flex-1 overflow-y-auto scroll-smooth">
          <div className="max-w-3xl mx-auto w-full p-4 md:p-6 lg:p-8"> 
            {children}
          </div>
        </main>
        
        <RightSidebar />
      </div>
    </div>
  );
}
