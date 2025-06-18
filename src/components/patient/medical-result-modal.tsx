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

    // Simulate AI response based on the medical report
    setTimeout(() => {
      let aiResponse = "";
      if (inputText.toLowerCase().includes("cholesterol") || inputText.toLowerCase().includes("lipid")) {
        aiResponse =
          "Your lipid panel shows several concerning findings: Total cholesterol is 218 mg/dL (borderline high), LDL is 142 mg/dL (borderline high), HDL is low at 38 mg/dL, and triglycerides are elevated at 188 mg/dL. This pattern indicates dyslipidemia and increased cardiovascular risk. Your doctor recommends starting statin therapy and adopting a Mediterranean-style diet.";
      } else if (inputText.toLowerCase().includes("diabetes") || inputText.toLowerCase().includes("glucose") || inputText.toLowerCase().includes("a1c")) {
        aiResponse =
          "Your HbA1c is 6.1%, which places you in the prediabetes range (5.7-6.4%). Your fasting glucose is also elevated at 108 mg/dL. This indicates insulin resistance and significantly increased risk for developing Type 2 diabetes. Immediate lifestyle modifications including reducing refined carbohydrates and increasing physical activity to 150 minutes per week are recommended.";
      } else if (inputText.toLowerCase().includes("vitamin") || inputText.toLowerCase().includes("deficiency")) {
        aiResponse =
          "Your vitamin D level is significantly low at 22 ng/mL, which is considered deficient (normal is 30-100 ng/mL). This deficiency can affect bone health, immune function, and overall wellbeing. Your doctor recommends high-dose supplementation with 5000 IU daily for 12 weeks, followed by 2000 IU maintenance therapy.";
      } else if (inputText.toLowerCase().includes("iron") || inputText.toLowerCase().includes("anemia") || inputText.toLowerCase().includes("hemoglobin")) {
        aiResponse =
          "Your results show iron deficiency anemia with hemoglobin at 12.8 g/dL (low), hematocrit at 38.2% (low), serum iron at 52 μg/dL (low), and ferritin severely low at 8 ng/mL. This indicates significant iron deficiency that requires iron supplementation (Ferrous sulfate 325mg daily) and investigation for potential sources of blood loss, particularly GI bleeding.";
      } else if (inputText.toLowerCase().includes("liver") || inputText.toLowerCase().includes("alt") || inputText.toLowerCase().includes("ast")) {
        aiResponse =
          "Your liver enzymes are elevated: ALT is 68 U/L and AST is 52 U/L (both above normal ranges). This suggests hepatic stress or inflammation. Contributing factors may include alcohol use, medications, fatty liver disease, or other causes. Your doctor recommends alcohol cessation, weight loss if applicable, and avoiding hepatotoxic medications.";
      } else if (inputText.toLowerCase().includes("inflammation") || inputText.toLowerCase().includes("crp")) {
        aiResponse =
          "Your C-Reactive Protein (CRP) is significantly elevated at 4.2 mg/L, indicating high cardiovascular risk (normal is <1.0 mg/L). This suggests systemic inflammation which increases your risk for heart disease and stroke. Recommendations include an anti-inflammatory diet, regular exercise, stress management, and addressing other cardiovascular risk factors.";
      } else {
        aiResponse =
          "Your lab results show several areas needing attention: prediabetes (HbA1c 6.1%), dyslipidemia, iron deficiency anemia, vitamin D deficiency, elevated liver enzymes, and high inflammation markers. These findings indicate increased cardiovascular and diabetes risk requiring immediate lifestyle changes and medical management. Which specific area would you like me to explain in more detail?";
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
      <DialogContent className="sm:max-w-[80vw] h-[80vh] max-h-[80vh] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Blood Test Results - June 18, 2025
          </DialogTitle>
        </DialogHeader>

        <div className="flex gap-4 flex-1 min-h-0 p-4">
          {/* PDF Viewer */}
          <div className="flex-1 bg-gray-100 rounded-lg overflow-hidden">
            <iframe 
              src="/medical_report.html"
              className="w-full h-full border-0"
              title="Medical Results Document"
            />
          </div>

          {/* Chat Interface */}
          <Card className="w-80 flex flex-col min-h-0">
            <CardContent className="px-4 py-4 flex flex-col h-full">
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
