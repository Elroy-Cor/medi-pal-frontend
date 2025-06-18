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
import { TypingIndicator } from "@/components/ui/typing-indicator";
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
  isLoading?: boolean;
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
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputText,
      sender: "user",
      timestamp: new Date(),
    };

    setChatMessages((prev) => [...prev, userMessage]);
    const query = inputText;
    setInputText("");
    setIsLoading(true);

    // Add loading message
    const loadingMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      text: "",
      sender: "ai",
      timestamp: new Date(),
      isLoading: true,
    };

    setChatMessages((prev) => [...prev, loadingMessage]);

    try {
      // Call the medical report RAG API
      const response = await fetch("/api/medical-report-rag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      
      // Extract the response text from the API response
      let aiResponseText = "";
      if (data.success && data.data) {
        aiResponseText = data.data;
      } else if (data.response) {
        aiResponseText = data.response;
      } else {
        aiResponseText = "I'm sorry, I couldn't find specific information about that in your medical reports. Could you try rephrasing your question or ask about a specific test result?";
      }

      // Replace loading message with actual response
      setChatMessages((prev) =>
        prev.map((msg) =>
          msg.id === loadingMessage.id
            ? {
                ...msg,
                text: aiResponseText,
                isLoading: false,
              }
            : msg
        )
      );
    } catch (error) {
      console.error("Error calling medical report RAG:", error);
      
      // Replace loading message with error message
      setChatMessages((prev) =>
        prev.map((msg) =>
          msg.id === loadingMessage.id
            ? {
                ...msg,
                text: "I'm sorry, I'm having trouble accessing your medical report information right now. Please try again in a moment.",
                isLoading: false,
              }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
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
                      {message.isLoading ? (
                        <TypingIndicator />
                      ) : (
                        message.text
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Input
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={isLoading ? "Processing..." : "Ask about your results..."}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  className="text-sm"
                  disabled={isLoading}
                />
                <Button 
                  size="sm" 
                  onClick={handleSendMessage}
                  disabled={isLoading || !inputText.trim()}
                >
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
