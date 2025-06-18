import { atom, Getter, Setter } from 'jotai';
import {
  AlertTriangle,
  Clock,
  FileText,
  QrCode,
  Stethoscope,
  User,
  LucideIcon
} from 'lucide-react';

export interface ERStep {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  status: 'waiting' | 'upcoming' | 'in-progress' | 'completed';
}

// Initial ER steps
export const DEFAULT_ER_STEPS: ERStep[] = [
  {
    id: "check-in",
    title: "Hospital Check-in",
    description: "Scan QR code at reception",
    icon: QrCode,
    status: "waiting",
  },
  {
    id: "triage",
    title: "Triage Assessment",
    description: "Initial evaluation by nurse",
    icon: User,
    status: "upcoming",
  },
  {
    id: "waiting-room",
    title: "Waiting Room",
    description: "Wait for doctor assignment",
    icon: Clock,
    status: "upcoming",
  },
  {
    id: "examination",
    title: "Medical Examination",
    description: "Doctor consultation and tests",
    icon: Stethoscope,
    status: "upcoming",
  },
  {
    id: "treatment",
    title: "Treatment/Procedure",
    description: "Receive necessary medical care",
    icon: AlertTriangle,
    status: "upcoming",
  },
  {
    id: "discharge",
    title: "Discharge & Follow-up",
    description: "Review results and next steps",
    icon: FileText,
    status: "upcoming",
  },
];

// Create atoms for our state
export const sessionStartedAtom = atom<boolean>(false);
export const currentStepIndexAtom = atom<number>(0);
export const erStepsAtom = atom<ERStep[]>(DEFAULT_ER_STEPS);
export const sessionIdAtom = atom<string | null>(null);

// Derived atom for current step
export const currentStepAtom = atom(
  (get: Getter) => get(erStepsAtom)[get(currentStepIndexAtom)]
);

// Function to generate session ID
export const generateSessionId = () => {
  return `ER-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Actions
export const startERSession = atom(
  null, // Read value (not used)
  (get: Getter, set: Setter) => {
    const sessionId = generateSessionId();
    set(sessionStartedAtom, true);
    set(sessionIdAtom, sessionId);
    const newSteps = [...get(erStepsAtom)];
    newSteps[0].status = "completed";
    newSteps[1].status = "in-progress";
    set(erStepsAtom, newSteps);
    set(currentStepIndexAtom, 1);
    return sessionId;
  }
);

export const progressToNextStep = atom(
  null, // Read value (not used)
  (get: Getter, set: Setter) => {
    const currentIndex = get(currentStepIndexAtom);
    const steps = get(erStepsAtom);
    
    if (currentIndex < steps.length - 1) {
      const newSteps = [...steps];
      newSteps[currentIndex].status = "completed";
      newSteps[currentIndex + 1].status = "in-progress";
      set(erStepsAtom, newSteps);
      set(currentStepIndexAtom, currentIndex + 1);
    }
  }
); 