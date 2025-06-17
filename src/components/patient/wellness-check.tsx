"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  AlertTriangle,
  CheckCircle,
  Heart,
  MessageCircle,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";

export function WellnessCheck() {
  const { toast } = useToast();
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  const [showWellnessModal, setShowWellnessModal] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      if (!lastCheck || now.getTime() - lastCheck.getTime() >= 5 * 60 * 1000) {
        // 5 minutes
        setLastCheck(now);
        setShowWellnessModal(true);
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [lastCheck]);

  const handleWellnessResponse = (
    response: "good" | "okay" | "not-good" | "emergency"
  ) => {
    setShowWellnessModal(false);

    switch (response) {
      case "good":
        toast({
          title: "Great to hear! 😊",
          description:
            "Thanks for confirming you're doing well. Keep taking care of yourself!",
        });
        break;
      case "okay":
        toast({
          title: "Thanks for checking in 👍",
          description:
            "If you need any assistance, don't hesitate to reach out to your healthcare provider.",
        });
        break;
      case "not-good":
        toast({
          title: "We're here to help 🤗",
          description:
            "A healthcare professional will be in touch with you shortly to provide assistance.",
          action: (
            <Button
              size="sm"
              onClick={() => {
                toast({
                  title: "Help is on the way",
                  description:
                    "A healthcare professional has been notified and will contact you within 15 minutes.",
                });
              }}
            >
              <Users className="h-4 w-4 mr-1" />
              Contact Sent
            </Button>
          ),
        });
        break;
      case "emergency":
        toast({
          title: "🚨 Emergency Response Activated",
          description:
            "Emergency services and your contacts are being notified. Help is on the way.",
          action: (
            <Button
              size="sm"
              variant="destructive"
              onClick={() => {
                toast({
                  title: "Emergency team dispatched",
                  description:
                    "Emergency responders are on their way to your location. Stay calm and wait for help.",
                });
              }}
            >
              <AlertTriangle className="h-4 w-4 mr-1" />
              Help Coming
            </Button>
          ),
        });
        break;
    }
  };

  if (!showWellnessModal) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl border-2 border-blue-200">
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-slate-800 mb-2">
              Wellness Check
            </h2>
            <p className="text-slate-600">
              Hi John! Just checking in on how you&apos;re feeling today.
            </p>
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => handleWellnessResponse("good")}
              className="w-full h-12 bg-green-600 hover:bg-green-700 text-white justify-start"
            >
              <CheckCircle className="h-5 w-5 mr-3" />
              I&apos;m feeling great! 😊
            </Button>

            <Button
              onClick={() => handleWellnessResponse("okay")}
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white justify-start"
            >
              <Heart className="h-5 w-5 mr-3" />
              I&apos;m doing okay 👍
            </Button>

            <Button
              onClick={() => handleWellnessResponse("not-good")}
              className="w-full h-12 bg-yellow-600 hover:bg-yellow-700 text-white justify-start"
            >
              <MessageCircle className="h-5 w-5 mr-3" />
              Not feeling my best 😐
            </Button>

            <Button
              onClick={() => handleWellnessResponse("emergency")}
              className="w-full h-12 bg-red-600 hover:bg-red-700 text-white justify-start"
            >
              <AlertTriangle className="h-5 w-5 mr-3" />I need immediate help!
              🚨
            </Button>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-200">
            <p className="text-xs text-slate-500 text-center">
              This wellness check helps us ensure your safety and well-being.
              Please select the option that best describes how you&apos;re
              feeling right now.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
