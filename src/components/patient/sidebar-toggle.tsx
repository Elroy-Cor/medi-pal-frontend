"use client";

import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { ChevronRight, Heart } from "lucide-react";

export function SidebarToggle() {
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";

  if (!isCollapsed) return null;

  return (
    <div className="fixed left-0 top-1/2 -translate-y-1/2 z-50">
      <Button
        onClick={toggleSidebar}
        className="h-16 w-8 rounded-r-xl rounded-l-none bg-white border border-l-0 border-slate-200 shadow-lg hover:shadow-xl transition-all duration-200 hover:w-10 group"
        variant="ghost"
      >
        <div className="flex flex-col items-center gap-1">
          <div className="w-5 h-5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-md flex items-center justify-center">
            <Heart className="h-3 w-3 text-white" />
          </div>
          <ChevronRight className="h-3 w-3 text-slate-400 group-hover:text-slate-600 transition-colors" />
        </div>
      </Button>
    </div>
  );
}
