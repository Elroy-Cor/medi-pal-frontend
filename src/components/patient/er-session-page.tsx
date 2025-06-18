"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertTriangle,
  CheckCircle,
  Circle,
  Clock,
  FileText,
  MapPin,
  QrCode,
  Scan,
  Stethoscope,
  User,
} from "lucide-react";
import { useEffect } from "react";
import { useAtom } from 'jotai';
import {
  sessionStartedAtom,
  currentStepIndexAtom,
  erStepsAtom,
  startERSession,
  progressToNextStep,
  type ERStep,
  DEFAULT_ER_STEPS
} from '@/store/er-session';

export function ERSessionPage() {
  const [sessionStarted, setSessionStarted] = useAtom(sessionStartedAtom);
  const [currentStepIndex] = useAtom(currentStepIndexAtom);
  const [steps] = useAtom(erStepsAtom);
  const [, startSession] = useAtom(startERSession);
  const [, progressStep] = useAtom(progressToNextStep);

  useEffect(() => {
    if (sessionStarted) {
      // Simulate automatic progression through steps
      const interval = setInterval(() => {
        progressStep();
      }, 8000); // Progress every 8 seconds for demo

      return () => clearInterval(interval);
    }
  }, [sessionStarted, steps]);

  const handleScanQR = () => {
    startSession();
  };

  const getStepStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in-progress":
        return "bg-blue-100 text-blue-800";
      case "upcoming":
        return "bg-gray-100 text-gray-500";
      default:
        return "bg-gray-100 text-gray-500";
    }
  };

  const getStepIcon = (step: any, index: number) => {
    const IconComponent = step.icon;
    if (step.status === "completed") {
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    } else if (step.status === "in-progress") {
      return <IconComponent className="h-5 w-5 text-blue-600" />;
    } else {
      return <Circle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getCurrentStatusMessage = () => {
    const currentStep = steps[currentStepIndex];
    switch (currentStep?.id) {
      case "triage":
        return "You are currently in the triage queue. A nurse will assess your condition shortly to determine the urgency of your case.";
      case "waiting-room":
        return "Triage completed. You are now waiting to be assigned to a doctor. Please remain in the waiting area.";
      case "examination":
        return "You are being seen by a doctor. Please follow their instructions and answer all questions honestly.";
      case "treatment":
        return "You are receiving medical treatment. Please remain calm and follow all medical staff instructions.";
      case "discharge":
        return "Your treatment is complete. The doctor will review your results and provide discharge instructions.";
      default:
        return "Please scan the QR code at the hospital reception to begin your visit.";
    }
  };

  if (!sessionStarted) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Emergency Room Session
          </h1>
          <p className="text-gray-600">
            Start your ER visit by scanning the QR code at the hospital
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                Hospital Check-in QR Code
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-4">
              <div className="w-64 h-64 bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
                <div className="text-center">
                  <QrCode className="h-16 w-16 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-500">
                    QR Code for Hospital Check-in
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Session ID: ER-2024-789456
                  </p>
                </div>
              </div>
              <Button onClick={handleScanQR} className="w-full">
                <Scan className="h-4 w-4 mr-2" />
                Simulate Scan at Hospital
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                What to Expect
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {DEFAULT_ER_STEPS.map((step, index) => (
                  <div key={step.id} className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-semibold">{step.title}</h4>
                      <p className="text-sm text-gray-600">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          ER Session Active
        </h1>
        <p className="text-gray-600">
          Your emergency room session is currently in progress
        </p>
      </div>

      {/* Current Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Current Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Badge
                className={getStepStatusColor(steps[currentStepIndex]?.status)}
              >
                {steps[currentStepIndex]?.title.toUpperCase()}
              </Badge>
            </div>
            <div className="text-sm text-gray-500">
              Session ID: ER-2024-789456
            </div>
          </div>

          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-blue-800">{getCurrentStatusMessage()}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-700">Session Details</h4>
              <div className="text-sm space-y-1">
                <p>
                  <span className="font-medium">Check-in Time:</span>{" "}
                  {new Date().toLocaleTimeString()}
                </p>
                <p>
                  <span className="font-medium">Current Step:</span>{" "}
                  {currentStepIndex + 1} of {steps.length}
                </p>
                <p>
                  <span className="font-medium">Estimated Total Time:</span> 2-4
                  hours
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-700 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Location
              </h4>
              <div className="text-sm space-y-1">
                <p>
                  <span className="font-medium">Hospital:</span> City General
                  Hospital
                </p>
                <p>
                  <span className="font-medium">Department:</span> Emergency
                  Room
                </p>
                <p>
                  <span className="font-medium">Current Area:</span>{" "}
                  {steps[currentStepIndex]?.id === "triage"
                    ? "Triage Bay"
                    : steps[currentStepIndex]?.id === "waiting-room"
                    ? "Waiting Area A"
                    : steps[currentStepIndex]?.id === "examination"
                    ? "Exam Room 5"
                    : steps[currentStepIndex]?.id === "treatment"
                    ? "Treatment Room 2"
                    : steps[currentStepIndex]?.id === "discharge"
                    ? "Discharge Area"
                    : "Reception"}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step Progress Card */}
      <Card>
        <CardHeader>
          <CardTitle>Your ER Journey Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {steps.map((step, index) => {
              const isCompleted = step.status === "completed";
              const isCurrent = step.status === "in-progress";
              const isUpcoming = step.status === "upcoming";

              return (
                <div
                  key={step.id}
                  className={`flex items-start gap-4 p-4 rounded-lg border-2 transition-all ${
                    isCurrent
                      ? "border-blue-200 bg-blue-50"
                      : isCompleted
                      ? "border-green-200 bg-green-50"
                      : "border-gray-200 bg-gray-50"
                  }`}
                >
                  <div className="flex-shrink-0 mt-1">
                    {getStepIcon(step, index)}
                  </div>
                  <div className="flex-grow">
                    <div className="flex items-center justify-between">
                      <h3
                        className={`font-semibold ${
                          isCurrent
                            ? "text-blue-800"
                            : isCompleted
                            ? "text-green-800"
                            : "text-gray-500"
                        }`}
                      >
                        {step.title}
                      </h3>
                      <Badge className={getStepStatusColor(step.status)}>
                        {step.status === "in-progress"
                          ? "Current"
                          : step.status === "completed"
                          ? "Done"
                          : "Upcoming"}
                      </Badge>
                    </div>
                    <p
                      className={`text-sm mt-1 ${
                        isCurrent
                          ? "text-blue-700"
                          : isCompleted
                          ? "text-green-700"
                          : "text-gray-500"
                      }`}
                    >
                      {step.description}
                    </p>

                    {/* Show additional details for current and next step */}
                    {isCurrent && (
                      <div className="mt-3 p-3 bg-white rounded border border-blue-200">
                        <h4 className="font-medium text-blue-800 mb-2">
                          What's happening now:
                        </h4>
                        <p className="text-sm text-blue-700">
                          {step.id === "triage" &&
                            "A nurse will check your vital signs, ask about your symptoms, and assign a priority level based on the severity of your condition."}
                          {step.id === "waiting-room" &&
                            "You'll wait in the designated area until a doctor becomes available. Wait times vary based on your priority level and current patient load."}
                          {step.id === "examination" &&
                            "The doctor will examine you, review your symptoms, and may order additional tests like blood work, X-rays, or other diagnostic procedures."}
                          {step.id === "treatment" &&
                            "Based on your diagnosis, you'll receive appropriate treatment which may include medication, procedures, or observation."}
                          {step.id === "discharge" &&
                            "The medical team will review your test results, provide discharge instructions, prescriptions if needed, and schedule any follow-up appointments."}
                        </p>
                      </div>
                    )}

                    {/* Show preview for next step */}
                    {index === currentStepIndex + 1 && (
                      <div className="mt-3 p-3 bg-gray-50 rounded border border-gray-200">
                        <h4 className="font-medium text-gray-700 mb-2">
                          Coming up next:
                        </h4>
                        <p className="text-sm text-gray-600">
                          {step.id === "triage" &&
                            "Quick assessment to prioritize your care"}
                          {step.id === "waiting-room" &&
                            "Comfortable waiting area while we prepare for your examination"}
                          {step.id === "examination" &&
                            "Thorough medical evaluation by our emergency doctor"}
                          {step.id === "treatment" &&
                            "Personalized treatment plan based on your diagnosis"}
                          {step.id === "discharge" &&
                            "Final review and instructions for your continued care"}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Estimated Timeline Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Estimated Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="font-medium text-green-800">Completed</p>
              <p className="text-2xl font-bold text-green-600">
                {steps.filter((s) => s.status === "completed").length}
              </p>
              <p className="text-green-600">steps</p>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <p className="font-medium text-blue-800">Current</p>
              <p className="text-2xl font-bold text-blue-600">
                {steps.filter((s) => s.status === "in-progress").length}
              </p>
              <p className="text-blue-600">step</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="font-medium text-gray-700">Remaining</p>
              <p className="text-2xl font-bold text-gray-600">
                {steps.filter((s) => s.status === "upcoming").length}
              </p>
              <p className="text-gray-600">steps</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
