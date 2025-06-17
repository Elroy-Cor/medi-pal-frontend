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
import { SidebarProvider, useSidebar } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
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
      <main
        className={`flex-1 overflow-auto transition-all duration-300 ${
          open ? "ml-0" : "ml-0"
        }`}
      >
        <div
          className={`p-8 mx-auto transition-all duration-300 ${
            open ? "pr-8" : "pl-14"
          }`}
        >
          {renderCurrentPage()}
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
