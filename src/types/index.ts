export interface HospitalStage {
  stage: string;
  status: "completed" | "current" | "upcoming";
  timestamp?: string;
  description: string;
  location?: string;
  doctor?: string;
  estimatedDuration?: string;
}

export interface NextOfKin {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  email: string;
  address: string;
  isEmergencyContact: boolean;
  hospitalStatus: "safe" | "hospitalized" | "unknown";
  hospitalInfo?: {
    hospital: string;
    admissionDate: string;
    reason: string;
    currentStage: string;
    estimatedDischarge?: string;
    stages: HospitalStage[];
    emergencyContact?: string;
    roomNumber?: string;
  };
}
