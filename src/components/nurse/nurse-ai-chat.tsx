"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertTriangle,
  Mic,
  MicOff,
  Send,
  Stethoscope,
  Trash2,
  Users,
  VideoOff,
  Volume2,
  Zap,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface Message {
  id: string;
  text: string;
  sender: "user" | "ai";
  timestamp: Date | string;
  type?: "voice" | "text";
  hasButtons?: boolean;
}

interface AIChatProps {
  isOpen: boolean;
  onClose: () => void;
  totalPatients: number;
  criticalPatients: number;
  distressedPatients: number;
  setTriageModalOpen?: (open: boolean) => void;
}

export function AIChat({
  isOpen,
  onClose,
  totalPatients,
  criticalPatients,
  distressedPatients,
  setTriageModalOpen,
}: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isVideoActive, setIsVideoActive] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Helper function to ensure timestamp is a Date object
  const ensureDate = (timestamp: Date | string): Date => {
    return timestamp instanceof Date ? timestamp : new Date(timestamp);
  };

  // Clear messages and session storage
  const clearMessages = () => {
    setMessages([]);
    sessionStorage.removeItem("nurseAiChatHistory");
  };

  // Load chat history from session storage
  useEffect(() => {
    const savedHistory = sessionStorage.getItem("nurseAiChatHistory");
    if (savedHistory) {
      setMessages(JSON.parse(savedHistory));
    } else {
      // Initial welcome message
      const welcomeMessage: Message = {
        id: "welcome",
        text: `Good ${getTimeOfDay()}! 👋 I'm your AI Nurse Assistant. I can see you're monitoring ${totalPatients} patients with ${criticalPatients} critical cases. How can I help you with patient care today?`,
        sender: "ai",
        timestamp: new Date(),
        type: "text",
        hasButtons: true,
      };
      setMessages([welcomeMessage]);
    }
  }, [totalPatients, criticalPatients]);

  // Save messages to session storage
  useEffect(() => {
    if (messages.length > 0) {
      sessionStorage.setItem("nurseAiChatHistory", JSON.stringify(messages));
    }
  }, [messages]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "morning";
    if (hour < 18) return "afternoon";
    return "evening";
  };

  const addMessage = (
    text: string,
    sender: "user" | "ai",
    type: "voice" | "text" = "text"
  ) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      sender,
      timestamp: new Date(),
      type,
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    addMessage(inputText, "user", isVoiceMode ? "voice" : "text");
    setInputText("");

    // Simulate AI response based on nurse context
    setTimeout(() => {
      const input = inputText.toLowerCase();

      if (
        input.includes("critical") ||
        input.includes("priority") ||
        input.includes("urgent")
      ) {
        addMessage(
          `I see you have ${criticalPatients} critical patients currently. Priority patients should be seen within 15 minutes. Would you like me to help prioritize care plans or alert the physician on duty? 🚨`,
          "ai"
        );
      } else if (
        input.includes("distressed") ||
        input.includes("upset") ||
        input.includes("angry")
      ) {
        addMessage(
          `Currently ${distressedPatients} patients are showing signs of distress. I recommend checking on room assignments and providing comfort measures. Would you like specific de-escalation protocols? 💙`,
          "ai"
        );
      } else if (input.includes("triage") || input.includes("new patient")) {
        addMessage(
          "I can help you with triage protocols. For new patients, ensure vital signs are taken within 5 minutes and ESI scoring is completed. Would you like me to pull up the triage guidelines? 📋",
          "ai"
        );
      } else if (
        input.includes("medication") ||
        input.includes("drug") ||
        input.includes("dosage")
      ) {
        addMessage(
          "I can assist with medication administration guidelines, drug interactions, and dosage calculations. Always follow the 5 rights of medication administration. What specific medication question do you have? 💊",
          "ai"
        );
      } else if (
        input.includes("doctor") ||
        input.includes("physician") ||
        input.includes("consult")
      ) {
        addMessage(
          "I can help you prepare for physician consultations or escalate urgent cases. Would you like me to summarize patient status for handoff or contact the attending physician? 👨‍⚕️",
          "ai"
        );
      } else {
        addMessage(
          `I'm here to support your nursing workflow. With ${totalPatients} patients to monitor, I can help with care protocols, medication guidance, patient communication, or clinical documentation. What do you need assistance with? 🩺`,
          "ai"
        );
      }
    }, 1000);
  };

  const toggleVoiceMode = () => {
    setIsVoiceMode(!isVoiceMode);
    if (!isVoiceMode) {
      // Simulate voice listening
      setIsListening(true);
      setTimeout(() => {
        setIsListening(false);
        setInputText("Check protocols for agitated patients");
      }, 2000);
    }
  };

  const toggleVideo = () => {
    setIsVideoActive(!isVideoActive);
    if (!isVideoActive) {
      setIsVoiceMode(true);
    }
  };

  const handleQuickAction = (action: string) => {
    addMessage(action, "user");
    setTimeout(() => {
      if (action.includes("Critical")) {
        addMessage(
          `Immediate attention required! Critical patients (P1) should be seen within 15 minutes. Current critical cases: ${criticalPatients}. I recommend alerting the charge nurse and ensuring physician availability. 🚨`,
          "ai"
        );
      } else if (action.includes("Triage")) {
        addMessage(
          "Triage protocol activated. New patients should have initial assessment within 5 minutes. I'll help you with ESI scoring and bed assignment priorities. Remember to document chief complaint and vital signs first. 📝",
          "ai"
        );
        // open triage modal
        setTriageModalOpen?.(true);
      } else if (action.includes("Patient Status")) {
        addMessage(
          `Current ward status: ${totalPatients} total patients, ${criticalPatients} critical, ${distressedPatients} showing distress. I recommend prioritizing comfort measures for distressed patients and ensuring critical patients have physician orders. 👥`,
          "ai"
        );
      }
    }, 1000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-24 right-6 w-96 h-[600px] bg-white rounded-lg shadow-2xl border border-gray-200 z-40 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-cyan-600 via-teal-800 to-cyan-800 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white">AI Nurse Assistant</h3>
              <p className="text-xs text-purple-100">Ward Overview Context</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant={isVoiceMode ? "default" : "secondary"}
              className="px-2 py-1 text-xs bg-white/20 text-white border-white/30"
            >
              {isVoiceMode ? "🎤" : "💬"}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleVoiceMode}
              className="text-white hover:bg-white/20 p-1"
            >
              {isVoiceMode ? (
                <Volume2 className="h-3 w-3" />
              ) : (
                <Mic className="h-3 w-3" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearMessages}
              className="text-white hover:bg-white/20 p-1"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-white/20"
            >
              ×
            </Button>
          </div>
        </div>
      </div>

      {/* Video Chat Container */}
      {isVoiceMode && isVideoActive && (
        <div className="p-3 border-b border-gray-200 bg-gradient-to-br from-blue-50 to-indigo-50">
          <div className="relative bg-slate-900 rounded-lg overflow-hidden aspect-video">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white">
                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Zap className="h-6 w-6" />
                </div>
                <h4 className="text-sm font-semibold mb-1">
                  AI Nurse Assistant
                </h4>
                <p className="text-xs text-blue-200">
                  Video consultation ready
                </p>
              </div>
            </div>
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2">
              <div className="flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1">
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-white hover:bg-white/20 rounded-full p-1"
                >
                  <Mic className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-white hover:bg-red-500/80 rounded-full p-1"
                  onClick={toggleVideo}
                >
                  <VideoOff className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 p-3 overflow-y-auto">
        <div className="space-y-3">
          {messages.map((message) =>
            message.hasButtons ? (
              <div key={message.id} className="space-y-2">
                <div className="bg-gray-100 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-gray-500">
                      {ensureDate(message.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-800">{message.text}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs h-8 rounded-full flex items-center gap-1"
                    onClick={() => handleQuickAction("Check Critical Patients")}
                  >
                    <AlertTriangle className="h-3 w-3 text-red-600" />
                    Critical Patients
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs h-8 rounded-full flex items-center gap-1"
                    onClick={() => handleQuickAction("Start Triage Process")}
                  >
                    <Stethoscope className="h-3 w-3 text-blue-600" />
                    Triage
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs h-8 rounded-full flex items-center gap-1"
                    onClick={() => handleQuickAction("Review Patient Status")}
                  >
                    <Users className="h-3 w-3 text-green-600" />
                    Patient Status
                  </Button>
                </div>
              </div>
            ) : (
              <div
                key={message.id}
                className={`flex ${
                  message.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] ${
                    message.sender === "user"
                      ? "bg-cyan-700 text-white rounded-lg rounded-br-md"
                      : "bg-gray-100 text-gray-800 rounded-lg rounded-bl-md"
                  } p-3`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {message.type === "voice" && (
                      <Mic className="h-3 w-3 opacity-70" />
                    )}
                    <span className="text-xs opacity-70">
                      {ensureDate(message.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed">{message.text}</p>
                </div>
              </div>
            )
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="p-3 border-t border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="flex-1 relative">
            <Input
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                isListening
                  ? "Listening..."
                  : "Ask about patients, protocols, or medications..."
              }
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              disabled={isListening}
              className="text-sm h-10 rounded-lg"
            />
            {isListening && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-pulse">
                  <MicOff className="h-4 w-4 text-red-500" />
                </div>
              </div>
            )}
          </div>
          <Button
            onClick={handleSendMessage}
            disabled={!inputText.trim() || isListening}
            size="sm"
            className="h-10 px-4 bg-cyan-800 hover:bg-cyan-900 rounded-lg"
          >
            <Send className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}
