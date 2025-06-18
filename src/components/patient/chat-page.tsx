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
import VideoChat, { VideoChatRef } from "./video-chat";
import { sessionStartedAtom, currentStepIndexAtom } from "@/store/er-session";
import { getDefaultStore } from "jotai";

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
  const [isAiResponding, setIsAiResponding] = useState(false);
  const [isFunctionCallLoading, setIsFunctionCallLoading] = useState(false);

  // WebRTC refs for voice mode
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const videoChatRef = useRef<VideoChatRef>(null);

  // Add refs for managing audio track during AI responses
  const audioTrackRef = useRef<MediaStreamTrack | null>(null);
  const audioContextRef = useRef<{
    audioContext: AudioContext;
    updateAudioGain: () => void;
  } | null>(null);

  const audioSenderRef = useRef<RTCRtpSender | null>(null);

  // Helper function to ensure timestamp is a Date object
  const ensureDate = (timestamp: Date | string): Date => {
    return timestamp instanceof Date ? timestamp : new Date(timestamp);
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
    const welcomeMessage: Message = {
      id: "welcome",
      text: `Good morning ${user.name}! 👋 I'm your AI health assistant. I'm here to help you manage your healthcare needs. What would you like to do today?`,
      sender: "ai",
      timestamp: new Date(),
      type: "text",
      hasButtons: true,
    };

    setMessages([]);
    sessionStorage.removeItem("chatHistory");
    setMessages([welcomeMessage]);
  };

  // Fetch OpenAI session when component mounts
  useEffect(() => {
    const welcomeMessage: Message = {
      id: "welcome",
      text: `Good morning ${user.name}! 👋 I'm your AI health assistant. I'm here to help you manage your healthcare needs. What would you like to do today?`,
      sender: "ai",
      timestamp: new Date(),
      type: "text",
      hasButtons: true,
    };

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

    // Set loading state
    setIsFunctionCallLoading(true);

    // Add a system message to show function call is in progress
    addMessage(
      `🔄 Loading data from ${eventData.name.replace(/_/g, " ")}...`,
      "system"
    );

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

      // Add error message
      addMessage(
        `❌ Error loading data: ${(error as Error).message}`,
        "system"
      );

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
    } finally {
      // Always clear loading state
      setIsFunctionCallLoading(false);
    }
  };

  // const controlAudioTransmission = async (enable: boolean) => {
  //   if (!peerConnectionRef.current || !audioTrackRef.current) {
  //     console.log("Cannot control audio - missing refs");
  //     return;
  //   }

  //   try {
  //     if (enable) {
  //       // Enable audio transmission - only add if not already added
  //       if (!audioSenderRef.current) {
  //         console.log("🎤 Enabling audio transmission");
  //         audioSenderRef.current = peerConnectionRef.current.addTrack(
  //           audioTrackRef.current,
  //           audioStreamRef.current!
  //         );
  //       } else {
  //         console.log("🎤 Audio already enabled - no action needed");
  //       }
  //     } else {
  //       // Disable audio transmission - only remove if exists
  //       if (audioSenderRef.current) {
  //         console.log("🔇 Disabling audio transmission");
  //         peerConnectionRef.current.removeTrack(audioSenderRef.current);
  //         audioSenderRef.current = null;
  //       } else {
  //         console.log("🔇 Audio already disabled - no action needed");
  //       }
  //     }
  //   } catch (error) {
  //     console.error("Error controlling audio transmission:", error);
  //     // Reset sender ref on error to maintain consistency
  //     if (!enable) {
  //       audioSenderRef.current = null;
  //     }
  //   }
  // };

  // Alternative approach using replaceTrack instead of add/remove
  const controlAudioTransmissionAlt = async (enable: boolean) => {
    if (!peerConnectionRef.current || !audioTrackRef.current) {
      console.log("Cannot control audio - missing refs");
      return;
    }

    try {
      if (audioSenderRef.current) {
        if (enable) {
          console.log("🎤 Enabling audio transmission via replaceTrack");
          await audioSenderRef.current.replaceTrack(audioTrackRef.current);
        } else {
          console.log("🔇 Disabling audio transmission via replaceTrack");
          await audioSenderRef.current.replaceTrack(null);
        }
      } else if (enable) {
        // First time - add the track
        console.log("🎤 Adding audio track for first time");
        audioSenderRef.current = peerConnectionRef.current.addTrack(
          audioTrackRef.current,
          audioStreamRef.current!
        );
      }
    } catch (error) {
      console.error("Error controlling audio transmission:", error);
    }
  };

  // Updated startRealtimeConversation function
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

      // 3. Store audio track reference but don't add it yet
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrackRef.current = audioTrack;
        // Initially add the track (user can speak first)
        audioSenderRef.current = pc.addTrack(audioTrack, stream);
        console.log("Audio track stored and initially added");
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
          }

          // AI started responding with text - disable audio ONCE
          else if (data.type === "response.audio_transcript.delta") {
            if (!isAiResponding) {
              setIsAiResponding(true);
              console.log(
                "🔇 AI started responding - disabling audio transmission (ONCE)"
              );
              await controlAudioTransmissionAlt(false); // Use alternative approach
            }
            setPartialTranscript((prev) => prev + data.delta);
          }

          // AI finished text response
          else if (data.type === "response.audio_transcript.done") {
            addMessage(data.transcript, "ai", "voice");
            setPartialTranscript("");
            console.log("AI text transcript done, waiting for audio to finish");
          }

          // User started speaking
          else if (data.type === "input_audio_buffer.speech_started") {
            if (!isAiResponding && !isFunctionCallLoading) {
              setIsListening(true);
              setPartialTranscript("");
              console.log("✅ User started speaking - AI not responding");
            } else {
              console.log(
                "❌ User speech should be blocked - AI is responding"
              );
            }
          }

          // User stopped speaking
          else if (data.type === "input_audio_buffer.speech_stopped") {
            setIsListening(false);
            console.log("User stopped speaking");
          }

          // AI started audio response - this might fire multiple times, so check state
          else if (data.type === "response.audio.delta") {
            if (!isAiResponding) {
              setIsAiResponding(true);
              console.log(
                "🔇 AI started audio response - disabling audio transmission (ONCE)"
              );
              await controlAudioTransmissionAlt(false);
            }

            // Handle video lip-sync if needed
            if (isVideoActive && videoChatRef.current && data.delta) {
              console.log("Received audio delta for lip-sync:", data.delta);
            }
          }

          // AI finished audio response
          else if (data.type === "response.audio.done") {
            console.log("🎤 AI finished audio response");
            // Don't enable audio yet - wait for complete response
          }

          // AI response completely finished - NOW enable audio ONCE
          else if (data.type === "response.done") {
            console.log(
              "🎤 AI response completely done - enabling audio transmission (ONCE)"
            );
            setIsAiResponding(false);
            await controlAudioTransmissionAlt(true); // Use alternative approach

            // Handle video lip-sync completion
            if (isVideoActive && videoChatRef.current) {
              console.log("AI response completed, processing lip-sync");
              // ... your existing lip-sync code ...
            }
          }

          // Handle errors
          else if (data.type === "error") {
            console.error("OpenAI API error:", data);
            setIsAiResponding(false);
            setIsFunctionCallLoading(false);
            // Re-enable audio on error
            await controlAudioTransmissionAlt(true);
            addMessage(
              `Error: ${data.error?.message || "Unknown error occurred"}`,
              "system"
            );
          }
        } catch (error) {
          console.error("Error parsing data channel message:", error);
        }
      };

      dataChannel.onopen = () => {
        console.log("Data channel opened");
        // Send session update
        dataChannel.send(
          JSON.stringify({
            type: "session.update",
            session: {
              input_audio_transcription: {
                model: "whisper-1",
                language: "en",
              },
              turn_detection: {
                type: "server_vad",
                threshold: 0.7, // Higher = less sensitive
                prefix_padding_ms: 300,
                silence_duration_ms: 800, // Longer silence before speech end
              },
              input_audio_format: "pcm16",
              output_audio_format: "pcm16",
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

      // 7. POST offer SDP to OpenAI
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
      setIsListening(false);
      setIsAiResponding(false);
      addMessage(
        "🎤 Connected! Start speaking... I can help with insurance, medical history, or medical reports!",
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

  // Updated stopRealtimeConversation function
  const stopRealtimeConversation = () => {
    console.log("Stopping realtime conversation...");

    // Reset all states first
    setIsVoiceMode(false);
    setIsListening(false);
    setIsAiResponding(false);
    setIsFunctionCallLoading(false);
    setPartialTranscript("");
    setConnectionState("disconnected");

    // Clear refs - IMPORTANT: Clear these before closing peer connection
    audioTrackRef.current = null;
    audioSenderRef.current = null;

    // Stop and cleanup audio stream
    if (audioStreamRef.current) {
      console.log("Stopping audio tracks...");
      audioStreamRef.current.getTracks().forEach((track) => {
        console.log(
          `Stopping track: ${track.kind}, state: ${track.readyState}`
        );
        track.stop();
      });
      audioStreamRef.current = null;
    }

    // Close data channel
    if (dataChannelRef.current) {
      console.log("Closing data channel...");
      dataChannelRef.current.close();
      dataChannelRef.current = null;
    }

    // Close peer connection
    if (peerConnectionRef.current) {
      console.log("Closing peer connection...");
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    // Clear audio player
    if (audioPlayerRef.current) {
      audioPlayerRef.current.srcObject = null;
      audioPlayerRef.current.pause();
    }

    addMessage("🔇 Voice mode disconnected", "system", "voice");
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
      const stream = sambaNovaService.sendPatientMessageStream(userMessage);
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
        // Generate a session ID
        const sessionId = `ER-${Date.now()}-${Math.random()
          .toString(36)
          .substr(2, 9)}`;

        // Get the default store
        const store = getDefaultStore();

        // Set the session atoms
        store.set(sessionStartedAtom, true);
        store.set(currentStepIndexAtom, 0);

        addMessage(
          `I've started your emergency room session. Your session ID is ${sessionId}. You'll now be guided through the following steps:
1. Hospital Check-in
2. Triage Assessment
3. Waiting Room
4. Medical Examination
5. Treatment/Procedure
6. Discharge & Follow-up

Please proceed to the hospital reception and scan the QR code to begin your visit.`,
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

  // Update audio gain when AI response or function loading state changes
  useEffect(() => {
    if (audioContextRef.current) {
      audioContextRef.current.updateAudioGain();
    }
  }, [isAiResponding, isFunctionCallLoading]);

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

      {/* Video Chat Container */}
      {isVoiceMode && isVideoActive && (
        <Card className="mb-6 shadow-xl border-0 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 overflow-hidden">
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <Video className="h-5 w-5 text-blue-600" />
                Dr. MediPal - Your AI Health Assistant
              </h3>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 border border-green-200 rounded-full">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-green-700">
                    Live Video Call
                  </span>
                </div>
                <div className="flex items-center gap-1 text-slate-500">
                  <div className="w-2 h-2 bg-slate-300 rounded-full"></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-slate-300 rounded-full"></div>
                </div>
              </div>
            </div>

            <div
              className="relative bg-gradient-to-b from-blue-50 to-indigo-100 rounded-xl overflow-hidden border-2 border-white shadow-inner"
              style={{ height: "65vh" }}
            >
              <VideoChat
                ref={videoChatRef}
                isActive={isVideoActive}
                className="w-full h-full"
              />

              {/* Video call overlay UI */}
              <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                <div className="bg-black/20 backdrop-blur-sm rounded-lg px-3 py-2">
                  <p className="text-white text-sm font-medium">Dr. MediPal</p>
                  <p className="text-white/80 text-xs">AI Health Specialist</p>
                </div>

                <div className="flex gap-2">
                  {isListening && (
                    <div className="bg-red-500 rounded-full p-2 animate-pulse">
                      <Mic className="h-4 w-4 text-white" />
                    </div>
                  )}
                  {isAiResponding && (
                    <div className="bg-blue-500 rounded-full p-2 animate-bounce">
                      <Volume2 className="h-4 w-4 text-white" />
                    </div>
                  )}
                  {isFunctionCallLoading && (
                    <div className="bg-orange-500 rounded-full p-2 animate-spin">
                      <Activity className="h-4 w-4 text-white" />
                    </div>
                  )}
                </div>
              </div>

              {/* Professional video call indicators */}
              <div className="absolute top-4 right-4">
                <div className="bg-black/20 backdrop-blur-sm rounded-lg px-3 py-1">
                  <span className="text-white text-xs font-medium">HD</span>
                </div>
              </div>

              {/* Video call controls */}
              <div className="absolute bottom-4 right-4 center-4">
                <div className="flex items-center justify-center gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleVideo}
                    className="bg-red-500 hover:bg-red-600 text-white border-0 rounded-full px-4 py-2"
                  >
                    <VideoOff className="h-4 w-4 mr-2" />
                    End Video Call
                  </Button>
                </div>
              </div>
            </div>

            {/* Professional video call footer */}
            <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Secure end-to-end encrypted consultation</span>
              </div>
              <div className="flex items-center gap-4">
                <span>3D Avatar Technology</span>
                <span>•</span>
                <span>Real-time Lip Sync</span>
                <span>•</span>
                <span>Voice conversation active</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Chat Messages - Hidden during video call */}
      {!(isVoiceMode && isVideoActive) && (
        <Card
          className="flex-1 mb-6 shadow-sm border-slate-200"
          style={{
            paddingTop: "unset",
            paddingBottom: "unset",
          }}
        >
          <CardContent className="p-4 h-full overflow-hidden">
            <div className="h-full overflow-y-auto space-y-2 pr-2 max-h-[calc(100vh-24rem)]">
              {messages.map((message) =>
                message.hasButtons ? (
                  <div key={message.id} className="flex justify-start">
                    <div className="max-w-[80%]">
                      <div className="pt-2 pb-2 px-2 rounded-2xl bg-white border border-slate-200 text-slate-800 rounded-bl-md shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                          {message.type === "voice" && (
                            <Mic className="h-3 w-3 opacity-70" />
                          )}
                          <span className="text-xs opacity-70">
                            {ensureDate(message.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="leading-relaxed text-sm">
                          {message.text}
                        </p>
                        <div className="flex gap-2 mt-2 flex-wrap ">
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-full flex gap-2"
                            onClick={() =>
                              handleQuickAction("Start the ER process")
                            }
                          >
                            <AlertTriangle className="h-4 w-4 text-red-600" />
                            <span className="font-semibold text-red-800 text-xs">
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
                            <span className="font-semibold text-blue-800 text-xs">
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
                            <span className="font-semibold text-green-800 text-xs">
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
                      message.sender === "user"
                        ? "justify-end"
                        : "justify-start"
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
                          <p className="leading-relaxed text-sm">
                            {message.text}
                          </p>
                        )}

                        {/* System messages */}
                        {message.sender === "system" && (
                          <p className="leading-relaxed text-sm">
                            {message.text}
                          </p>
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
      )}

      {isAiResponding && (
        <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full">
          🤐 Please wait - AI is speaking
        </div>
      )}

      {/* Input Area - Hidden during video call */}
      {!(isVoiceMode && isVideoActive) && (
        <Card className="shadow-sm border-slate-200">
          <CardContent className="p-4">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Input
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={
                    isVoiceMode
                      ? isFunctionCallLoading
                        ? "Loading data from backend, please wait..."
                        : isAiResponding
                        ? "AI is responding, please wait..."
                        : isListening
                        ? "Listening..."
                        : "Voice mode active - speak or type..."
                      : "Type your message about insurance, medical history, or health questions..."
                  }
                  onKeyPress={(e) =>
                    e.key === "Enter" && !isVoiceMode && handleSendMessage()
                  }
                  disabled={
                    isVoiceMode &&
                    (isListening || isAiResponding || isFunctionCallLoading)
                  }
                  className="h-12 px-4 rounded-xl border-slate-200 focus:border-blue-300 focus:ring-blue-100"
                />
                {(isListening || isAiResponding || isFunctionCallLoading) && (
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    <div
                      className={
                        isFunctionCallLoading
                          ? "animate-spin"
                          : isAiResponding
                          ? "animate-bounce"
                          : "animate-pulse"
                      }
                    >
                      {isFunctionCallLoading ? (
                        <Activity className="h-5 w-5 text-orange-500" />
                      ) : isAiResponding ? (
                        <Volume2 className="h-5 w-5 text-blue-500" />
                      ) : (
                        <Mic className="h-5 w-5 text-green-500" />
                      )}
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
      )}

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
