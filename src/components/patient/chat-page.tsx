"use client";
import { user } from "@/app/constants";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SimpleMarkdown } from "@/components/ui/simple-markdown";
import { TypingIndicator } from "@/components/ui/typing-indicator";
import { sambaNovaService } from "@/services/sambanova";
import {
  Activity,
  AlertTriangle,
  FileText,
  Mic,
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

interface Message {
  id: string;
  text: string;
  sender: "user" | "ai" | "system";
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
  const [partialTranscript, setPartialTranscript] = useState("");
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [connectionState, setConnectionState] = useState("disconnected");

  // WebRTC refs for voice mode
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Helper function to ensure timestamp is a Date object
  const ensureDate = (timestamp: Date | string): Date => {
    return timestamp instanceof Date ? timestamp : new Date(timestamp);
  };

  const welcomeMessage: Message = {
    id: "welcome",
    text: `Good morning ${user.name}! 👋 I'm your AI health assistant. I'm here to help you manage your healthcare needs. What would you like to do today?`,
    sender: "ai",
    timestamp: new Date(),
    type: "text",
    hasButtons: true,
  };

  // Add message helper
  const addMessage = (
    text: string,
    sender: "user" | "ai" | "system",
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

  // Clear messages and session storage
  const clearMessages = () => {
    setMessages([]);
    sessionStorage.removeItem("chatHistory");

    // Initial welcome message

    setMessages([welcomeMessage]);
  };

  // Fetch OpenAI session when component mounts
  useEffect(() => {
    const fetchSession = async () => {
      try {
        console.log("Fetching OpenAI session...");
        const response = await fetch("/api/session");

        if (!response.ok) {
          throw new Error(`Session API error: ${response.status}`);
        }

        const data = await response.json();
        console.log("Session data:", data);

        if (data.client_secret && data.client_secret.value) {
          setClientSecret(data.client_secret.value);
          console.log("Client secret set successfully");
        } else {
          throw new Error("No client secret in response");
        }
      } catch (error) {
        console.error("Error fetching session:", error);
        addMessage(
          "Error fetching session: " + (error as Error).message,
          "system"
        );
      }
    };

    fetchSession();

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

  // Function to handle OpenAI function calls
  const handleFunctionCall = async (
    eventData: {
      name: string;
      arguments: string;
      call_id: string;
    },
    dataChannel: RTCDataChannel
  ) => {
    console.log("OpenAI wants to call function:", eventData);

    try {
      const parsedArgs = JSON.parse(eventData.arguments);
      const query = parsedArgs.query;
      let apiRoute = "";

      // Map OpenAI function names to your Next.js API routes
      switch (eventData.name) {
        case "ai_insurance_rag":
          apiRoute = "/api/insurance-rag";
          break;
        case "medical_history_rag":
          apiRoute = "/api/medical-history-rag";
          break;
        case "medical_report_rag":
          apiRoute = "/api/medical-report-rag";
          break;
        default:
          throw new Error(`Unknown function: ${eventData.name}`);
      }

      console.log(`Calling API route: ${apiRoute} with query: "${query}"`);

      // Call your Next.js API route
      const response = await fetch(apiRoute, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: query,
          userId: "user_123",
          sessionId: Date.now().toString(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `API route failed: ${response.status} - ${errorData.error}`
        );
      }

      const responseData = await response.json();
      console.log(`Function ${eventData.name} completed:`, responseData);

      // Show the raw backend response in chat for debugging
      if (responseData.success && responseData.data) {
        addMessage(
          `🔍 **Raw Backend Response for "${query}":**\n\n${responseData.data}`,
          "system"
        );
      }

      // Send the result back to OpenAI
      dataChannel.send(
        JSON.stringify({
          type: "conversation.item.create",
          item: {
            type: "function_call_output",
            call_id: eventData.call_id,
            output: JSON.stringify(responseData),
          },
        })
      );

      // Tell OpenAI to generate a response
      dataChannel.send(
        JSON.stringify({
          type: "response.create",
        })
      );
    } catch (error) {
      console.error("Function call error:", error);

      // Send error back to OpenAI
      dataChannel.send(
        JSON.stringify({
          type: "conversation.item.create",
          item: {
            type: "function_call_output",
            call_id: eventData.call_id,
            output: JSON.stringify({
              error: (error as Error).message,
              success: false,
            }),
          },
        })
      );

      dataChannel.send(
        JSON.stringify({
          type: "response.create",
        })
      );
    }
  };

  // Start real-time voice conversation
  const startRealtimeConversation = async () => {
    console.log("Starting realtime conversation...");
    console.log("Client secret available:", !!clientSecret);

    if (!clientSecret) {
      addMessage(
        "Error: No client secret available. Please refresh the page.",
        "system"
      );
      return;
    }

    setPartialTranscript("");
    try {
      // 1. Get user media
      console.log("Requesting microphone access...");
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 24000,
        },
      });
      console.log("Got user media stream");
      audioStreamRef.current = stream;

      // 2. Create PeerConnection
      const pc = new RTCPeerConnection();
      peerConnectionRef.current = pc;

      // Monitor connection state
      pc.onconnectionstatechange = () => {
        console.log("Connection state changed:", pc.connectionState);
        setConnectionState(pc.connectionState);
      };

      // 3. Add audio track
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        pc.addTrack(audioTrack, stream);
        console.log("Added audio track to peer connection");
      }

      // 4. Create data channel for realtime events
      const dataChannel = pc.createDataChannel("oai-events", {
        ordered: true,
      });
      dataChannelRef.current = dataChannel;

      dataChannel.onmessage = async (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log("Received event:", data);

          // Handle function calls
          if (data.type === "response.function_call_arguments.done") {
            await handleFunctionCall(data, dataChannel);
            return;
          }

          // Handle different event types
          if (
            data.type ===
            "conversation.item.input_audio_transcription.completed"
          ) {
            addMessage(data.transcript, "user", "voice");
          } else if (data.type === "response.audio_transcript.delta") {
            setPartialTranscript((prev) => prev + data.delta);
          } else if (data.type === "response.audio_transcript.done") {
            addMessage(data.transcript, "ai", "voice");
            setPartialTranscript("");
          } else if (data.type === "input_audio_buffer.speech_started") {
            setIsListening(true);
            setPartialTranscript("");
          } else if (data.type === "input_audio_buffer.speech_stopped") {
            setIsListening(false);
          }
        } catch (error) {
          console.error("Error parsing data channel message:", error);
        }
      };

      dataChannel.onopen = () => {
        console.log("Data channel opened");
        // Send session update to enable input audio transcription
        dataChannel.send(
          JSON.stringify({
            type: "session.update",
            session: {
              input_audio_transcription: {
                model: "whisper-1",
                language: "en", // Default to English unless stated otherwise
              },
            },
          })
        );
      };

      // 5. Handle incoming media (AI audio response)
      pc.ontrack = (event) => {
        console.log("Received track event");
        const [remoteStream] = event.streams;
        if (audioPlayerRef.current && remoteStream) {
          audioPlayerRef.current.srcObject = remoteStream;
          audioPlayerRef.current.play().catch((error) => {
            console.error("Error playing audio:", error);
          });
        }
      };

      // 6. Create offer
      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: false,
      });
      await pc.setLocalDescription(offer);

      // 7. POST offer SDP to OpenAI via our API route
      console.log("Sending SDP offer to OpenAI...");
      const sdpResponse = await fetch(
        `/api/realtime?model=gpt-4o-realtime-preview-2025-06-03`,
        {
          method: "POST",
          body: offer.sdp,
          headers: {
            Authorization: `Bearer ${clientSecret}`,
            "Content-Type": "application/sdp",
          },
        }
      );

      if (!sdpResponse.ok) {
        const errorText = await sdpResponse.text();
        throw new Error(`Failed to signal with OpenAI: ${errorText}`);
      }

      const answerSDP = await sdpResponse.text();
      console.log("Received answer SDP from OpenAI");

      // 8. Set remote description
      await pc.setRemoteDescription({ type: "answer", sdp: answerSDP });

      setIsVoiceMode(true);
      addMessage(
        "Connected! Start speaking... I can help with insurance, medical history, or medical reports!",
        "system",
        "voice"
      );
      console.log("Voice mode activated successfully");
    } catch (err) {
      console.error("Error in startRealtimeConversation:", err);
      addMessage(
        "Error starting voice mode: " + (err as Error).message,
        "system"
      );
    }
  };

  // Stop real-time conversation
  const stopRealtimeConversation = () => {
    console.log("Stopping realtime conversation...");
    setIsVoiceMode(false);
    setIsListening(false);
    setPartialTranscript("");
    setConnectionState("disconnected");

    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      audioStreamRef.current = null;
    }

    if (dataChannelRef.current) {
      dataChannelRef.current.close();
      dataChannelRef.current = null;
    }

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    if (audioPlayerRef.current) {
      audioPlayerRef.current.srcObject = null;
    }

    addMessage(" Voice mode disconnected", "system", "voice");
  };

  // Handle text message sending (for non-voice mode)
  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    // Don't process text messages when voice mode is active
    if (isVoiceMode) {
      setInputText("");
      return;
    }

    const userMessage = inputText;
    addMessage(inputText, "user", "text");
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
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Stream the response from SambaNova
      const stream = sambaNovaService.sendMessageStream(userMessage);
      let streamedText = "";

      for await (const chunk of stream) {
        streamedText += chunk;

        // Update the streaming message with accumulated text
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === streamingMessageId ? { ...msg, text: streamedText } : msg
          )
        );
      }
    } catch (error) {
      console.error("Error getting streaming AI response:", error);

      // Update with error message
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === streamingMessageId
            ? {
                ...msg,
                text: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.",
              }
            : msg
        )
      );
    }
  };

  const toggleVoiceMode = () => {
    if (!isVoiceMode) {
      // Start voice mode
      startRealtimeConversation();
    } else {
      // Stop voice mode
      stopRealtimeConversation();
    }
  };

  const toggleVideo = () => {
    setIsVideoActive(!isVideoActive);
    if (!isVideoActive && !isVoiceMode) {
      // When activating video, also enable voice mode
      toggleVoiceMode();
    }
  };

  const handleQuickAction = (action: string) => {
    addMessage(action, "user");
    // Handle quick actions with appropriate API calls
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
  console.log("messages", messages);
  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Health Buddy</h1>
            <p className="text-xs text-slate-600 mt-1">
              Your personal healthcare companion
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-full">
            <Activity className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-700">
              {connectionState === "connected"
                ? "Connected"
                : clientSecret
                ? "Ready"
                : "Loading..."}
            </span>
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
            disabled={!clientSecret}
            title={
              !clientSecret
                ? "Loading session..."
                : isVoiceMode
                ? "Stop voice mode"
                : "Start voice mode"
            }
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

      {/* Partial Transcript Display */}

      {/* Video Chat Container */}
      {isVoiceMode && isVideoActive && (
        <Card className="mb-6 shadow-lg border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <Video className="h-5 w-5 text-blue-600" />
                Video Chat with Your Personal Health Assistant
              </h3>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-slate-600">Live</span>
              </div>
            </div>

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
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
                <div key={message.id} className="flex justify-start">
                  <div className="max-w-[80%]">
                    <div className="p-4 rounded-2xl bg-white border border-slate-200 text-slate-800 rounded-bl-md shadow-sm">
                      <div className="flex items-center gap-2 mb-2">
                        {message.type === "voice" && (
                          <Mic className="h-3 w-3 opacity-70" />
                        )}
                        <span className="text-xs opacity-70">
                          {ensureDate(message.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="leading-relaxed">{message.text}</p>
                      <div className="flex gap-2 mt-2 flex-wrap">
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-full flex gap-2"
                          onClick={() =>
                            handleQuickAction("Start the ER process")
                          }
                        >
                          <AlertTriangle className="h-4 w-4 text-red-600" />
                          <span className="font-semibold text-red-800">
                            Start ER check-in
                          </span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-full flex gap-2"
                          onClick={() =>
                            handleQuickAction("Check on next of kin")
                          }
                        >
                          <Users className="h-4 w-4 text-blue-600" />
                          <span className="font-semibold text-blue-800">
                            Check family members
                          </span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-full flex gap-2"
                          onClick={() => setIsResultsModalOpen(true)}
                        >
                          <FileText className="h-4 w-4 text-green-600" />
                          <span className="font-semibold text-green-800">
                            View medical reports
                          </span>
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
                          : message.sender === "system"
                          ? "bg-gray-100 text-gray-700 rounded-bl-md"
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
                        {/* Show message type indicator */}
                        <Badge
                          variant="outline"
                          className={`text-[10px] py-0.5 px-1 rounded-full ${
                            message.type === "voice"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {message.type === "voice" ? "🎤 Voice" : "💬 Text"}
                        </Badge>
                      </div>

                      {/* User messages */}
                      {message.sender === "user" && (
                        <p className="leading-relaxed">{message.text}</p>
                      )}

                      {/* System messages */}
                      {message.sender === "system" && (
                        <p className="leading-relaxed">{message.text}</p>
                      )}

                      {/* AI messages */}
                      {message.sender === "ai" && (
                        <>
                          {/* Show typing indicator for empty AI messages (streaming placeholder) */}
                          {message.text === "" && <TypingIndicator />}

                          {/* Show completed AI message content */}
                          {message.text !== "" && (
                            <SimpleMarkdown content={message.text} />
                          )}

                          {/* Show partial transcript only for the most recent AI message when in voice mode */}
                          {message.id === messages[messages.length - 1]?.id &&
                            isVoiceMode &&
                            partialTranscript &&
                            message.text === "" && (
                              <div className="italic text-slate-600">
                                <Mic className="h-3 w-3 inline mr-1" />
                                {partialTranscript}
                              </div>
                            )}
                        </>
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
                  isVoiceMode
                    ? isListening
                      ? "Listening..."
                      : "Voice mode active - speak or type..."
                    : "Type your message about insurance, medical history, or health questions..."
                }
                onKeyPress={(e) =>
                  e.key === "Enter" && !isVoiceMode && handleSendMessage()
                }
                disabled={isVoiceMode && isListening}
                className="h-12 px-4 rounded-xl border-slate-200 focus:border-blue-300 focus:ring-blue-100"
              />
              {isListening && (
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <div className="animate-pulse">
                    <Mic className="h-5 w-5 text-green-500" />
                  </div>
                </div>
              )}
            </div>
            <Button
              onClick={handleSendMessage}
              disabled={!inputText.trim() || isVoiceMode}
              className="h-12 px-6 rounded-xl bg-blue-600 hover:bg-blue-700"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Hidden audio player for AI responses */}
      <audio
        ref={audioPlayerRef}
        autoPlay
        playsInline
        style={{ display: "none" }}
      />

      {/* Medical Results Modal */}
      <MedicalResultModal
        open={isResultsModalOpen}
        onOpenChange={setIsResultsModalOpen}
      />
    </div>
  );
}
