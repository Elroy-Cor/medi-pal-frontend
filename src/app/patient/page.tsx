"use client";
import { ChatPage } from "@/components/patient/chat-page";
import { ERSessionPage } from "@/components/patient/er-session-page";
import { FamilyPage } from "@/components/patient/family-page";
import { InsurancePage } from "@/components/patient/insurance-page";
import { MedicalHistoryPage } from "@/components/patient/medical-history-page";
import { MedicalResultModal } from "@/components/patient/medical-result-modal";
import { PatientSidebar } from "@/components/patient/patient-sidebar";
import { ProfilePage } from "@/components/patient/profile-page";
import { WellnessCheck } from "@/components/patient/wellness-check";
import {
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/toaster";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import medipalLogo from "@/public/brand-01.png";
import { Menu } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

export type PageType =
  | "chat"
  | "medical-history"
  | "insurance"
  | "family"
  | "er-session"
  | "profile";

function PatientPortalContent() {
  const [currentPage, setCurrentPage] = useState<PageType>("chat");
  const [showMedicalResult, setShowMedicalResult] = useState(false);
  const { toast } = useToast();
  const { open } = useSidebar();
  const isMobileDevice = useIsMobile();

  // Simulate medical result notification
  useEffect(() => {
    const timer = setTimeout(() => {
      toast({
        title: "📋 New Medical Result Available",
        description: "Your recent blood test results are ready for review.",
        action: (
          <button
            onClick={() => setShowMedicalResult(true)}
            className="bg-blue-600 text-white px-3 py-1.5 rounded-md text-sm hover:bg-blue-700 transition-colors"
          >
            View Result
          </button>
        ),
      });
    }, 10000);

    return () => clearTimeout(timer);
  }, [toast]);

  const renderCurrentPage = () => {
    switch (currentPage) {
      case "chat":
        return <ChatPage />;
      case "medical-history":
        return <MedicalHistoryPage />;
      case "insurance":
        return <InsurancePage />;
      case "family":
        return <FamilyPage />;
      case "er-session":
        return <ERSessionPage />;
      case "profile":
        return <ProfilePage />;
      default:
        return <ChatPage />;
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-slate-50 relative">
      <PatientSidebar currentPage={currentPage} onPageChange={setCurrentPage} />

      {/* Mobile Header with Menu Toggle */}
      {isMobileDevice && (
        <div className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-slate-200 px-4 py-1 md:py-3 flex items-center justify-between lg:hidden">
          <SidebarTrigger className="p-2 hover:bg-slate-100 rounded-md">
            <Menu className="h-5 w-5" />
          </SidebarTrigger>
          <Image src={medipalLogo} alt="Medipal" width={120} height={32} />
          <div className="w-9" />
        </div>
      )}

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div
          className={`flex-1 overflow-auto ${isMobileDevice ? "pt-16" : ""}`}
        >
          <div
            className={cn(
              "h-full transition-all duration-300",
              isMobileDevice ? "p-4" : "p-6 md:p-8",
              // Only add left padding on desktop when sidebar is collapsed
              !isMobileDevice && !open ? "pl-20" : ""
            )}
          >
            {renderCurrentPage()}
          </div>
        </div>
      </main>

      <MedicalResultModal
        open={showMedicalResult}
        onOpenChange={setShowMedicalResult}
      />
      <WellnessCheck />
      <Toaster />
    </div>
  );
}

export default function PatientPortal() {
  return (
    <SidebarProvider defaultOpen={true}>
      <PatientPortalContent />
    </SidebarProvider>
  );
}
