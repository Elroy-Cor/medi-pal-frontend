"use client";

import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
// Nurse utils
import { NurseHeader } from "@/components/nurse/nurse-header";
import { PatientList } from "@/components/nurse/nurse-patient-list";
import { SummaryCards } from "@/components/nurse/nurse-summary-cards";
import { TriageForm } from "@/components/nurse/triage-form";
import { getPatientStats, randomizePatients } from "@/utils/nurse/nurseUtils";
import { FloatingAIButton } from "@/components/nurse/nurse-floating-ai-button";
// use breakpoint hook to detect screen size
import { useBreakpoint } from "@/hooks/use-breakpoints";
// sonner
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import { initialPatients } from "@/utils/nurse/initialPatients";

// types
import { AIChat } from "@/components/nurse/nurse-ai-chat";
import { Patient, Status } from "@/utils/nurse/nurseTypes";

export default function NurseDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAIChat, setShowAIChat] = useState(false);
  const [triageModalOpen, setTriageModalOpen] = useState(false);
  const [patients, setPatients] = useState(initialPatients);
  const stats = getPatientStats(patients);
  const { toast } = useToast();

  const [hasShownMobileToast, setHasShownMobileToast] = useState(false);
  const currentBreakpoint = useBreakpoint();

  const filteredPatients = patients.filter(
    (patient: Patient) =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

    // Mobile breakpoint toast - only show once per session
    useEffect(() => {
      if (currentBreakpoint && !hasShownMobileToast) {
        const isMobile = currentBreakpoint === 'xs' || currentBreakpoint === 'sm';
        
        if (isMobile) {
          toast({
            title: "📱 Mobile View Detected",
            description: "For the best experience, consider using a tablet or desktop device to view the full dashboard.",
            variant: "default",
            duration: 5000, // Show for 5 seconds
            className: 'bg-gray-800/90 backdrop-blur-sm  text-white p-4 rounded-lg shadow-lg',
          });
          setHasShownMobileToast(true);
        }
      }
    }, [currentBreakpoint, toast, hasShownMobileToast]);
  
    // Optional: Reset the toast flag when switching back to larger screens
    useEffect(() => {
      if (currentBreakpoint && hasShownMobileToast) {
        const isDesktop = currentBreakpoint === 'md' || currentBreakpoint === 'lg' || currentBreakpoint === 'xl' || currentBreakpoint === 'xxl';
        
        if (isDesktop) {
          // Reset flag so toast can show again if user switches back to mobile
          setHasShownMobileToast(false);
        }
      }
    }, [currentBreakpoint, hasShownMobileToast]);

  // Separate useEffect for the interval
  useEffect(() => {
    const randomizePatientsRef = setInterval(() => {
      setPatients((prevPatients) => randomizePatients(prevPatients));
    }, 60000);

    return () => {
      clearInterval(randomizePatientsRef);
    };
  }, []);


  // increment wait time every minute
  useEffect(() => {
    const incrementWaitTime = setInterval(() => {
      setPatients((prevPatients) =>
        prevPatients.map((patient) => {
          if (patient.status !== Status.complete) {
            return {
              ...patient,
              waitTime: (patient.waitTime ?? 0) + 1, // increment wait time by 1 minute
              timeInStage: (patient.timeInStage ?? 0) + 1, // increment time in stage by 1 minute
            };
          }
          return patient; // don't increment for completed patients
        })
      );
    }, 60000); // 60000 ms = 1 minute
    return () => {
      clearInterval(incrementWaitTime);
    };
  }, []);

  // Separate useEffect to check for distressed patients whenever patients change
  useEffect(() => {
    const distressedPatients = patients.filter(
      (patient: Patient) =>
        patient.sentiment === "distressed" || patient.sentiment === "angry"
    );

    if (distressedPatients.length > 0) {
      toast({
        title: "⚠️ Distressed Patients Detected",
        description: `There are ${distressedPatients.length} patients showing signs of distress or anger. Please check their status.`,
        variant: "destructive",
        className: "text-white p-4",

      });
    }
  }, [patients, toast]); // This will run every time patients array changes

  // Function to add a new patient
  const handleAddPatient = (patientData: Patient) => {
    // Generate a new patient ID
    const allPatients = Object.values(patients).flat();
    const maxId = Math.max(
      ...allPatients.map((p: Patient) =>
        Number.parseInt(p.id.replace("P", ""))
      ),
      0
    );
    const newId = `P${String(maxId + 1).padStart(3, "0")}`;

    const currentTimeStr = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    const newPatient = {
      ...patientData,
      id: newId,
      arrivalTime: currentTimeStr,
      waitTime: 0,
      timeline: [
        { time: currentTimeStr, event: `Patient arrived` },
        {
          time: currentTimeStr,
          event: `Triaged as P${patientData.priority}`,
        },
      ],
    };

    setPatients((prevPatients) => [...prevPatients, newPatient]);

    // Update stats
    const updatedStats = getPatientStats([...patients, newPatient]);
    setPatients((prevPatients) => {
      return prevPatients.map((p) =>
        p.id === newId ? { ...p, ...updatedStats } : p
      );
    });

    // Show success toast
    toast({
      title: "✅ Patient Added",
      description: `${patientData.name} has been added to the queue with priority P${patientData.priority}.`,
    });

    setTriageModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <NurseHeader
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        setTriageModalOpen={setTriageModalOpen}
      />

      {/* Summary Cards */}
      <SummaryCards
        totalPatients={stats.totalPatients}
        criticalPatients={stats.criticalPatients}
        avgWaitTime={stats.avgWaitTime}
        distressedPatients={stats.distressedPatients}
        beddedPatients={stats.beddedPatients} // Pass bedded patients count
      />

      {/* Patient Accordion List */}
      <PatientList patients={filteredPatients} />

      {/* Triage Modal */}
      <Dialog open={triageModalOpen} onOpenChange={setTriageModalOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto p-0">
          <TriageForm
            onAddPatient={handleAddPatient}
            onCancel={() => setTriageModalOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Floating AI Assistant Button */}
      {!triageModalOpen && (
        <FloatingAIButton onClick={() => setShowAIChat(!showAIChat)} />
      )}

      {/* AI Chat Panel */}
      {showAIChat && !triageModalOpen && (
        <AIChat
          isOpen={showAIChat}
          onClose={() => setShowAIChat(false)}
          totalPatients={stats.totalPatients}
          criticalPatients={stats.criticalPatients}
          distressedPatients={stats.distressedPatients}
          setTriageModalOpen={setTriageModalOpen}
        />
      )}
      <Toaster />
    </div>
  );
}
