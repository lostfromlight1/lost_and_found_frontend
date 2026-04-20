"use client";

import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function RightSidebar() {
  const pathname = usePathname();

  // Only render the sidebar if the user is on the dashboard
  if (pathname !== "/dashboard") {
    return null;
  }

  const rules = [
    "Stay on topic (Lost & Found only)",
    "Be civil and respectful",
    "No spam or self-promotion",
    "Do not post personal ID numbers publicly",
    "Verify ownership before returning items",
  ];

  return (
    <aside className="w-80 bg-white border-l hidden lg:flex flex-col h-full overflow-y-auto shrink-0 sticky top-0">
      <div className="p-5 space-y-6">
        
        {/* Rules Card (Reddit Style) */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="bg-primary px-4 py-3 text-primary-foreground font-bold text-sm tracking-wide">
            COMMUNITY RULES
          </div>
          <div className="p-2">
            {rules.map((rule, index) => (
              <div key={index} className="flex items-start justify-between py-2.5 px-2 border-b border-slate-100 last:border-0 hover:bg-slate-100 cursor-pointer rounded-md">
                <span className="text-xs font-medium text-slate-700 flex gap-2">
                  <span className="font-bold text-slate-400">{index + 1}.</span> 
                  {rule}
                </span>
                <ChevronDown size={14} className="text-slate-400 mt-0.5 shrink-0" />
              </div>
            ))}
          </div>
        </div>

        {/* Stats Placeholder */}
        <div className="grid grid-cols-2 gap-2 text-center">
          <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
            <p className="text-lg font-bold text-slate-800">1.2K</p>
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Items Found</p>
          </div>
          <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
            <p className="text-lg font-bold text-slate-800">450</p>
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Active Posts</p>
          </div>
        </div>

        {/* Action Button */}
        <Button className="w-full rounded-full font-bold shadow-sm">
          Join Community
        </Button>

      </div>
    </aside>
  );
}
