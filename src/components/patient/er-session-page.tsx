"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Clock, MapPin, QrCode, Scan } from "lucide-react";
import { useState } from "react";

export function ERSessionPage() {
  const [sessionStarted, setSessionStarted] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<
    "waiting" | "triaging" | "in-progress" | "completed"
  >("waiting");

  const handleScanQR = () => {
    setSessionStarted(true);
    setCurrentStatus("triaging");

    // Simulate status progression
    setTimeout(() => setCurrentStatus("in-progress"), 5000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "waiting":
        return "bg-yellow-100 text-yellow-800";
      case "triaging":
        return "bg-blue-100 text-blue-800";
      case "in-progress":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case "waiting":
        return "Please scan the QR code at the hospital reception";
      case "triaging":
        return "You are currently in the triage queue. Please wait for your turn.";
      case "in-progress":
        return "You are being seen by medical staff. Please follow their instructions.";
      case "completed":
        return "Your ER session has been completed. Please check for any follow-up instructions.";
      default:
        return "Unknown status";
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
                Instructions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold">Arrive at Hospital</h4>
                    <p className="text-sm text-gray-600">
                      Go to the emergency room reception desk
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold">Scan QR Code</h4>
                    <p className="text-sm text-gray-600">
                      Show this QR code to the reception staff or scan it at the
                      kiosk
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold">Wait for Triage</h4>
                    <p className="text-sm text-gray-600">
                      You&apos;ll be called for initial assessment based on
                      urgency
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    4
                  </div>
                  <div>
                    <h4 className="font-semibold">Receive Care</h4>
                    <p className="text-sm text-gray-600">
                      Follow medical staff instructions throughout your visit
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  //TODO: add a real time status update, add more stuff
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
              <Badge className={getStatusColor(currentStatus)}>
                {currentStatus.toUpperCase()}
              </Badge>
            </div>
            <div className="text-sm text-gray-500">
              Session ID: ER-2024-789456
            </div>
          </div>

          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-blue-800">{getStatusMessage(currentStatus)}</p>
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
                  <span className="font-medium">Estimated Wait:</span> 15-30
                  minutes
                </p>
                <p>
                  <span className="font-medium">Priority Level:</span> Standard
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
                  <span className="font-medium">Room:</span> Waiting Area A
                </p>
              </div>
            </div>
          </div>

          {currentStatus === "triaging" && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="font-semibold text-yellow-800 mb-2">
                Triage Information
              </h4>
              <p className="text-yellow-700 text-sm">
                You are currently in the triage queue. A nurse will assess your
                condition shortly to determine the urgency of your case. Please
                remain in the waiting area and listen for your name to be
                called.
              </p>
            </div>
          )}

          {currentStatus === "in-progress" && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-2">
                Currently Being Seen
              </h4>
              <p className="text-green-700 text-sm">
                You are now being attended to by medical staff. Please follow
                all instructions given by your healthcare providers. Your
                session progress will be updated automatically.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
