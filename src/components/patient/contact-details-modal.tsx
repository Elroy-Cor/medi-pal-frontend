"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import {
  Activity,
  AlertCircle,
  Clock,
  Heart,
  Mail,
  MapPin,
  Phone,
  User,
} from "lucide-react";

interface HospitalStage {
  stage: string;
  status: "completed" | "current" | "upcoming";
  timestamp?: string;
  description: string;
  location?: string;
  doctor?: string;
  estimatedDuration?: string;
}

interface NextOfKin {
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

interface ContactDetailsModalProps {
  contact: NextOfKin | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ContactDetailsModal({
  contact,
  open,
  onOpenChange,
}: ContactDetailsModalProps) {
  if (!contact) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "safe":
        return "bg-green-50 text-green-700 border-green-200";
      case "hospitalized":
        return "bg-red-50 text-red-700 border-red-200";
      case "unknown":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "safe":
        return <Heart className="h-4 w-4" />;
      case "hospitalized":
        return <AlertCircle className="h-4 w-4" />;
      case "unknown":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getStageColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "current":
        return "bg-blue-100 text-blue-800";
      case "upcoming":
        return "bg-slate-100 text-slate-600";
      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  const calculateProgress = (stages: HospitalStage[]) => {
    const completedStages = stages.filter(
      (stage) => stage.status === "completed"
    ).length;
    return (completedStages / stages.length) * 100;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-fit max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-slate-100 text-slate-700">
                {contact.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <span className="text-xl">{contact.name}</span>
              <p className="text-sm font-normal text-slate-600">
                {contact.relationship}
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <User className="h-4 w-4" />
                Contact Information
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-slate-400" />
                  <span>{contact.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-slate-400" />
                  <span>{contact.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-slate-400" />
                  <span>{contact.address}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-slate-800">Status & Details</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge
                    className={getStatusColor(contact.hospitalStatus)}
                    variant="outline"
                  >
                    <span className="flex items-center gap-1">
                      {getStatusIcon(contact.hospitalStatus)}
                      {contact.hospitalStatus}
                    </span>
                  </Badge>
                  {contact.isEmergencyContact && (
                    <Badge
                      variant="outline"
                      className="bg-blue-50 text-blue-700 border-blue-200"
                    >
                      Emergency Contact
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Hospital Information - Only if hospitalized */}
          {contact.hospitalStatus === "hospitalized" &&
            contact.hospitalInfo && (
              <div className="border border-red-200 rounded-lg bg-red-50 p-6 space-y-6">
                <div>
                  <h3 className="font-semibold text-red-800 mb-4 flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Hospital Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <p>
                        <span className="font-medium">Hospital:</span>{" "}
                        {contact.hospitalInfo.hospital}
                      </p>
                      <p>
                        <span className="font-medium">Room:</span>{" "}
                        {contact.hospitalInfo.roomNumber}
                      </p>
                      <p>
                        <span className="font-medium">Reason:</span>{" "}
                        {contact.hospitalInfo.reason}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p>
                        <span className="font-medium">Admitted:</span>{" "}
                        {contact.hospitalInfo.admissionDate}
                      </p>
                      <p>
                        <span className="font-medium">Est. Discharge:</span>{" "}
                        {contact.hospitalInfo.estimatedDischarge}
                      </p>
                      <p>
                        <span className="font-medium">Emergency Contact:</span>{" "}
                        {contact.hospitalInfo.emergencyContact}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-red-800">
                      Treatment Progress
                    </h4>
                    <span className="text-sm text-red-600">
                      {Math.round(
                        calculateProgress(contact.hospitalInfo.stages)
                      )}
                      % Complete
                    </span>
                  </div>
                  <Progress
                    value={calculateProgress(contact.hospitalInfo.stages)}
                    className="h-3 bg-red-100"
                  />
                </div>

                {/* Treatment Stages */}
                <div>
                  <h4 className="font-medium text-red-800 mb-4 flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Treatment Timeline
                  </h4>
                  <div className="space-y-4">
                    {contact.hospitalInfo.stages.map((stage, index) => (
                      <div key={index} className="flex items-start gap-4">
                        <div className="flex flex-col items-center">
                          <div
                            className={`w-4 h-4 rounded-full ${
                              stage.status === "completed"
                                ? "bg-green-500"
                                : stage.status === "current"
                                ? "bg-blue-500 animate-pulse"
                                : "bg-slate-300"
                            }`}
                          />
                          {index <
                            (contact.hospitalInfo?.stages.length ?? 0) - 1 && (
                            <div className="w-0.5 h-8 bg-slate-200 mt-2" />
                          )}
                        </div>
                        <div className="flex-1 pb-4">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-medium text-slate-800">
                              {stage.stage}
                            </h5>
                            <Badge
                              className={getStageColor(stage.status)}
                              variant="outline"
                            >
                              {stage.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-600 mb-2">
                            {stage.description}
                          </p>
                          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                            {stage.timestamp && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {stage.timestamp}
                              </span>
                            )}
                            {stage.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {stage.location}
                              </span>
                            )}
                            {stage.doctor && (
                              <span className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {stage.doctor}
                              </span>
                            )}
                            {stage.estimatedDuration && (
                              <span>Est. {stage.estimatedDuration}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Current Status Alert */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-blue-800">
                      Current Status
                    </span>
                  </div>
                  <p className="text-blue-700 text-sm">
                    {contact.name} is currently in the{" "}
                    <strong>{contact.hospitalInfo.currentStage}</strong> stage.
                    The medical team is monitoring their progress closely. Last
                    update: 2 hours ago.
                  </p>
                </div>
              </div>
            )}

          {/* Safe Status Message */}
          {contact.hospitalStatus === "safe" && (
            <div className="border border-green-200 bg-green-50 rounded-lg p-4">
              <p className="text-green-700 text-sm flex items-center gap-2">
                <Heart className="h-4 w-4" />
                {contact.name} is safe and not currently in any medical
                facility. Last check: 1 hour ago.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
