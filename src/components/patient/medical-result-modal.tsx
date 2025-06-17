"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { FileText, MessageCircle, Send } from "lucide-react";
import { useState } from "react";

interface MedicalResultModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ChatMessage {
  id: string;
  text: string;
  sender: "user" | "ai";
  timestamp: Date;
}

export function MedicalResultModal({
  open,
  onOpenChange,
}: MedicalResultModalProps) {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      text: "Hello! I'm here to help you understand your blood test results. What would you like to know?",
      sender: "ai",
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState("");

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputText,
      sender: "user",
      timestamp: new Date(),
    };

    setChatMessages((prev) => [...prev, userMessage]);
    setInputText("");

    // Simulate AI response
    setTimeout(() => {
      let aiResponse = "";
      if (inputText.toLowerCase().includes("cholesterol")) {
        aiResponse =
          "Your cholesterol level is 195 mg/dL, which is within the normal range (less than 200 mg/dL). This indicates good cardiovascular health.";
      } else if (inputText.toLowerCase().includes("vitamin")) {
        aiResponse =
          "Your Vitamin D level has improved to 35 ng/mL, which is now in the sufficient range (30-100 ng/mL). The supplements are working well!";
      } else {
        aiResponse =
          "Based on your results, all major indicators are within normal ranges. Your overall health appears good. Is there a specific value you'd like me to explain?";
      }

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        sender: "ai",
        timestamp: new Date(),
      };

      setChatMessages((prev) => [...prev, aiMessage]);
    }, 1000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[80vw] sm:max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Blood Test Results - June 2024
          </DialogTitle>
        </DialogHeader>

        <div className="flex gap-4 h-full">
          {/* PDF Viewer */}
          <div className="flex-1 bg-gray-100 rounded-lg p-4 overflow-scroll max-h-[calc(100vh-18rem)]">
            <div className="bg-white p-6 rounded shadow-sm">
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold">LABORATORY RESULTS</h2>
                <p className="text-gray-600">City General Hospital</p>
                <p className="text-sm text-gray-500">
                  Patient: John Smith | DOB: 06/15/1985
                </p>
                <p className="text-sm text-gray-500">
                  Date Collected: June 10, 2024
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold border-b pb-2 mb-3">
                    LIPID PANEL
                  </h3>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="font-medium">Test</div>
                    <div className="font-medium">Result</div>
                    <div className="font-medium">Reference Range</div>

                    <div>Total Cholesterol</div>
                    <div>195 mg/dL</div>
                    <div>{"<200 mg/dL"}</div>

                    <div>HDL Cholesterol</div>
                    <div>58 mg/dL</div>
                    <div>{">40 mg/dL (M), >50 mg/dL (F)"}</div>

                    <div>LDL Cholesterol</div>
                    <div>118 mg/dL</div>
                    <div>{"<100 mg/dL"}</div>

                    <div>Triglycerides</div>
                    <div>95 mg/dL</div>
                    <div>{"<150 mg/dL"}</div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold border-b pb-2 mb-3">
                    VITAMINS & MINERALS
                  </h3>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="font-medium">Test</div>
                    <div className="font-medium">Result</div>
                    <div className="font-medium">Reference Range</div>

                    <div>Vitamin D, 25-OH</div>
                    <div>35 ng/mL</div>
                    <div>30-100 ng/mL</div>

                    <div>Vitamin B12</div>
                    <div>450 pg/mL</div>
                    <div>200-900 pg/mL</div>

                    <div>Iron</div>
                    <div>85 μg/dL</div>
                    <div>60-170 μg/dL</div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold border-b pb-2 mb-3">
                    COMPLETE BLOOD COUNT
                  </h3>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="font-medium">Test</div>
                    <div className="font-medium">Result</div>
                    <div className="font-medium">Reference Range</div>

                    <div>White Blood Cells</div>
                    <div>6.8 K/μL</div>
                    <div>4.0-11.0 K/μL</div>

                    <div>Red Blood Cells</div>
                    <div>4.7 M/μL</div>
                    <div>4.2-5.8 M/μL</div>

                    <div>Hemoglobin</div>
                    <div>14.2 g/dL</div>
                    <div>13.5-17.5 g/dL</div>

                    <div>Hematocrit</div>
                    <div>42.1%</div>
                    <div>41-53%</div>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded">
                <h4 className="font-semibold text-blue-800 mb-2">
                  Physician Notes
                </h4>
                <p className="text-blue-700 text-sm">
                  Overall results show significant improvement. Vitamin D levels
                  have normalized with supplementation. Cholesterol levels
                  remain within healthy ranges. Continue current supplement
                  regimen and maintain healthy lifestyle. Follow-up in 3 months.
                </p>
                <p className="text-blue-700 text-sm mt-2">
                  <strong>Dr. Emily Rodriguez, MD</strong>
                  <br />
                  Internal Medicine
                </p>
              </div>
            </div>
          </div>

          {/* Chat Interface */}
          <Card className="w-80 flex flex-col">
            <CardContent className="px-4 flex flex-col h-full">
              <div className="flex items-center gap-2 mb-4">
                <MessageCircle className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold">Ask about your results</h3>
              </div>

              <div className="flex-1 overflow-auto space-y-3 mb-4">
                {chatMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.sender === "user"
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] p-2 rounded-lg text-sm ${
                        message.sender === "user"
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {message.text}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Input
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Ask about your results..."
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  className="text-sm"
                />
                <Button size="sm" onClick={handleSendMessage}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
