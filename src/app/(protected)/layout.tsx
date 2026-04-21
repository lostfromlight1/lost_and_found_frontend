import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/features/auth/config/auth-options";
import Navbar from "@/components/navbar/Navbar"; // This works now with default export
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

  // Cast or pass the user object safely
  const user = session.user as any; 

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-100/50">
      <Navbar user={user} />
      
      <div className="flex flex-1 overflow-hidden">
        <LeftSidebar userRole={user?.role}/>
        
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