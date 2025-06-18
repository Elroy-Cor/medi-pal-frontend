"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Activity,
  AlertTriangle,
  FileText,
  Mic,
  MicOff,
  Send,
  Sparkles,
  Trash2,
  Users,
  Video,
  VideoOff,
  Volume2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { MedicalResultModal } from "./medical-result-modal";
import { sambaNovaService } from "@/services/sambanova";
import { SimpleMarkdown } from "@/components/ui/simple-markdown";
import { TypingIndicator } from "@/components/ui/typing-indicator";

interface Message {
  id: string;
  text: string;
  sender: "user" | "ai";
  timestamp: Date | string;
  type?: "voice" | "text";
  hasButtons?: boolean;
}

export function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isVideoActive, setIsVideoActive] = useState(false);
  const [isResultsModalOpen, setIsResultsModalOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Helper function to ensure timestamp is a Date object
  const ensureDate = (timestamp: Date | string): Date => {
    return timestamp instanceof Date ? timestamp : new Date(timestamp);
  };

  // Clear messages and session storage
  const clearMessages = () => {
    setMessages([]);
    sessionStorage.removeItem("chatHistory");
  };

  // Load chat history from session storage
  useEffect(() => {
    // Clear messages on page load/refresh
    clearMessages();

    // Initial welcome message
    const welcomeMessage: Message = {
      id: "welcome",
      text: "Good morning, John! 👋 I'm your AI health assistant. I'm here to help you manage your healthcare needs. What would you like to do today?",
      sender: "ai",
      timestamp: new Date(),
      type: "text",
      hasButtons: true,
    };

    setMessages([welcomeMessage]);
  }, []);

  // Save messages to session storage
  useEffect(() => {
    if (messages.length > 0) {
      sessionStorage.setItem("chatHistory", JSON.stringify(messages));
    }
  }, [messages]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;
    
    const userMessage = inputText;
    addMessage(inputText, "user", isVoiceMode ? "voice" : "text");
    setInputText("");

    // Add a streaming message placeholder with typing indicator
    const streamingMessageId = "streaming-" + Date.now().toString();
    const streamingMessage: Message = {
      id: streamingMessageId,
      text: "",
      sender: "ai",
      timestamp: new Date(),
      type: "text",
    };
    setMessages((prev) => [...prev, streamingMessage]);

    try {
      // Small delay to show typing indicator
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Stream the response from SambaNova
      const stream = sambaNovaService.sendMessageStream(userMessage);
      let streamedText = "";

      for await (const chunk of stream) {
        streamedText += chunk;
        
        // Update the streaming message with accumulated text
        setMessages((prev) => 
          prev.map(msg => 
            msg.id === streamingMessageId 
              ? { ...msg, text: streamedText }
              : msg
          )
        );
      }
    } catch (error) {
      console.error('Error getting streaming AI response:', error);
      
      // Update with error message
      setMessages((prev) => 
        prev.map(msg => 
          msg.id === streamingMessageId 
            ? { 
                ...msg, 
                text: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment." 
              }
            : msg
        )
      );
    }
  };

  const toggleVoiceMode = () => {
    setIsVoiceMode(!isVoiceMode);
    if (!isVoiceMode) {
      // Simulate voice listening
      setIsListening(true);
      setTimeout(() => {
        setIsListening(false);
        setInputText("I need to start an ER session");
      }, 2000);
    }
  };

  const toggleVideo = () => {
    setIsVideoActive(!isVideoActive);
    if (!isVideoActive) {
      // When activating video, also enable voice mode
      setIsVoiceMode(true);
    }
  };

  const handleQuickAction = (action: string) => {
    addMessage(action, "user");
    setTimeout(() => {
      if (action.includes("ER")) {
        addMessage(
          "Perfect! I'll help you start the ER process. Please navigate to the Emergency section from the sidebar to generate your hospital QR code. The system will guide you through each step. 🏥",
          "ai"
        );
      } else {
        addMessage(
          "I've checked your family monitoring system. All your emergency contacts are safe and not currently in any medical facilities. Mary Johnson was recently discharged and is recovering well at home. 💚",
          "ai"
        );
      }
    }, 1000);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            AI Health Assistant
          </h1>
          <p className="text-slate-600 mt-1">
            Your personal healthcare companion
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-full">
            <Activity className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-700">Online</span>
          </div>
          <Badge
            variant={isVoiceMode ? "default" : "secondary"}
            className="px-3 py-1 rounded-full"
          >
            {isVoiceMode ? "🎤 Voice Mode" : "💬 Text Mode"}
          </Badge>
          <Button
            variant={isVoiceMode ? "default" : "outline"}
            size="sm"
            onClick={toggleVoiceMode}
            className="rounded-full"
          >
            {isVoiceMode ? (
              <Volume2 className="h-4 w-4" />
            ) : (
              <Mic className="h-4 w-4" />
            )}
          </Button>
          {isVoiceMode && (
            <Button
              variant={isVideoActive ? "default" : "outline"}
              size="sm"
              onClick={toggleVideo}
              className="rounded-full"
            >
              {isVideoActive ? (
                <Video className="h-4 w-4" />
              ) : (
                <VideoOff className="h-4 w-4" />
              )}
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={clearMessages}
            className="rounded-full"
            title="Clear chat history"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Video Chat Container - Tavus Integration Ready */}
      {isVoiceMode && isVideoActive && (
        <Card className="mb-6 shadow-lg border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <Video className="h-5 w-5 text-blue-600" />
                Video Chat with AI Assistant
              </h3>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-slate-600">Live</span>
              </div>
            </div>

            {/* Tavus Video Container */}
            <div className="relative bg-slate-900 rounded-xl overflow-hidden aspect-video">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="h-8 w-8" />
                  </div>
                  <h4 className="text-xl font-semibold mb-2">
                    AI Health Assistant
                  </h4>
                  <p className="text-blue-200">Ready for video consultation</p>
                  <div className="mt-4 text-sm text-slate-400">
                    {/* Tavus video element will be inserted here */}
                    <div
                      id="tavus-video-container"
                      className="w-full h-full absolute inset-0"
                    >
                      {/* Tavus SDK will mount video here */}
                    </div>
                  </div>
                </div>
              </div>

              {/* Video Controls Overlay */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                <div className="flex items-center gap-3 bg-black/50 backdrop-blur-sm rounded-full px-4 py-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-white hover:bg-white/20 rounded-full"
                  >
                    <Mic className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-white hover:bg-white/20 rounded-full"
                  >
                    <Video className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-white hover:bg-red-500/80 rounded-full"
                    onClick={toggleVideo}
                  >
                    <VideoOff className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Video Chat Status */}
            <div className="mt-4 flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-slate-600">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Connection: Excellent</span>
              </div>
              <div className="text-slate-500">Duration: 00:00</div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      {/* {messages.length <= 1 && !isVideoActive && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4 text-slate-700">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card
              className="cursor-pointer hover:shadow-md transition-all duration-200 border-red-200 bg-red-50"
              onClick={() => handleQuickAction("Start the ER process")}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-red-800">
                      Emergency Room
                    </h3>
                    <p className="text-sm text-red-600">Start ER check-in</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card
              className="cursor-pointer hover:shadow-md transition-all duration-200 border-blue-200 bg-blue-50"
              onClick={() => handleQuickAction("Check on next of kin")}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-blue-800">
                      Family Status
                    </h3>
                    <p className="text-sm text-blue-600">
                      Check family members
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card
              className="cursor-pointer hover:shadow-md transition-all duration-200 border-green-200 bg-green-50"
              onClick={() => setIsResultsModalOpen(true)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                    <FileText className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-green-800">
                      Review Results
                    </h3>
                    <p className="text-sm text-green-600">
                      View medical reports
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )} */}

      {/* Chat Messages */}
      <Card
        className={`flex-1 mb-6 shadow-sm border-slate-200 ${
          isVideoActive ? "max-h-64" : ""
        }`}
      >
        <CardContent className="p-6 h-full overflow-hidden">
          <div className="h-full overflow-y-auto space-y-6 pr-2 max-h-[calc(100vh-24rem)]">
            {messages.map((message) =>
              message.hasButtons ? (
                <div
                  key={message.id}
                  className={`flex ${
                    message.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] ${
                      message.sender === "user" ? "order-2" : "order-1"
                    }`}
                  >
                    <div
                      className={`p-4 rounded-2xl ${
                        message.sender === "user"
                          ? "bg-blue-600 text-white rounded-br-md"
                          : "bg-white border border-slate-200 text-slate-800 rounded-bl-md shadow-sm"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        {message.type === "voice" && (
                          <Mic className="h-3 w-3 opacity-70" />
                        )}
                        <span className="text-xs opacity-70">
                          {ensureDate(message.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="leading-relaxed">{message.text}</p>
                      <div className="flex gap-2 mt-2">
                        <Button
                          variant="outline"
                          className="rounded-full flex gap-2"
                          onClick={() =>
                            handleQuickAction("Start the ER process")
                          }
                        >
                          <AlertTriangle className="h-5 w-5 text-red-600" />
                          <h3 className="font-semibold text-red-800">
                            Start ER check-in
                          </h3>
                        </Button>

                        <Button
                          variant="outline"
                          className="rounded-full flex gap-2"
                          onClick={() =>
                            handleQuickAction("Check on next of kin")
                          }
                        >
                          <Users className="h-5 w-5 text-blue-600" />
                          <h3 className="font-semibold text-blue-800">
                            Check family members
                          </h3>
                        </Button>

                        <Button
                          variant="outline"
                          className="rounded-full flex gap-2"
                          onClick={() => setIsResultsModalOpen(true)}
                        >
                          <FileText className="h-5 w-5 text-green-600" />
                          <h3 className="font-semibold text-green-800">
                            View medical reports
                          </h3>
                        </Button>
                      </div>
                    </div>
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
                    className={`max-w-[80%] ${
                      message.sender === "user" ? "order-2" : "order-1"
                    }`}
                  >
                    <div
                      className={`p-4 rounded-2xl ${
                        message.sender === "user"
                          ? "bg-blue-600 text-white rounded-br-md"
                          : "bg-white border border-slate-200 text-slate-800 rounded-bl-md shadow-sm"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        {message.type === "voice" && (
                          <Mic className="h-3 w-3 opacity-70" />
                        )}
                        <span className="text-xs opacity-70">
                          {ensureDate(message.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      {message.sender === "ai" && message.text === "" ? (
                        <TypingIndicator />
                      ) : message.sender === "ai" ? (
                        <SimpleMarkdown content={message.text} />
                      ) : (
                        <p className="leading-relaxed">{message.text}</p>
                      )}
                    </div>
                  </div>
                </div>
              )
            )}
            <div ref={messagesEndRef} />
          </div>
        </CardContent>
      </Card>

      {/* Input Area */}
      <Card className="shadow-sm border-slate-200">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Input
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={
                  isVideoActive
                    ? "Speak or type your message..."
                    : isListening
                    ? "Listening..."
                    : "Type your message or ask a question..."
                }
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                disabled={isListening}
                className="h-12 px-4 rounded-xl border-slate-200 focus:border-blue-300 focus:ring-blue-100"
              />
              {isListening && (
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <div className="animate-pulse">
                    <MicOff className="h-5 w-5 text-red-500" />
                  </div>
                </div>
              )}
            </div>
            <Button
              onClick={handleSendMessage}
              disabled={!inputText.trim() || isListening}
              className="h-12 px-6 rounded-xl bg-blue-600 hover:bg-blue-700"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Medical Results Modal */}
      <MedicalResultModal
        open={isResultsModalOpen}
        onOpenChange={setIsResultsModalOpen}
      />
    </div>
  );
}
