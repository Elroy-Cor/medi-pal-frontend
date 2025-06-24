'use client';

import type React from 'react';
import { useCallback, useEffect, useState, useRef, useMemo } from 'react';
import {
  Activity,
  AlertTriangle,
  Brain,
  ChevronRight,
  Clock,
  Mic,
  MicOff,
  Stethoscope,
  User,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Patient,
  RegisteredPatient,
  Sentiments,
} from '@/utils/nurse/nurseTypes';
import { PatientSearch } from './nurse-patient-search';
import { motion } from 'motion/react';
// toast/sonner
import { useToast } from '@/hooks/use-toast';
import { triageSambaNovaService, type TriageFormUpdates } from '@/services/triageSambanova';

export type PatientData = {
  name: string;
  age: number;
  gender: string;
  phone: string;
  address: string;
  NOK: string;
  complaint: string;
  painLevel: number;
  vitals: {
    systolic: number;
    diastolic: number;
    heartRate: number;
    temperature: string;
    spo2: string;
  };
  allergies: string;
  medications: string;
  medicalHistory: string;
  notes: string;
  assignedNurse: string;
};

export type TriageEvaluation = {
  priority: number;
  severity: string;
  sentiment: string;
  score: number;
  reasons: string[];
};

// Triage algorithm
const evaluatePatient = (patientData: PatientData) => {
  let score = 0;
  const reasons: string[] = [];

  // Vital signs evaluation
  const { systolic, diastolic, heartRate, temperature, spo2 } =
    patientData.vitals;

  // Blood pressure
  if (systolic >= 180 || diastolic >= 120) {
    score += 10;
    reasons.push('Severe hypertension');
  } else if (systolic >= 160 || diastolic >= 100) {
    score += 5;
    reasons.push('Hypertension');
  } else if (systolic <= 90 || diastolic <= 60) {
    score += 15;
    reasons.push('Hypotension');
  }

  // Heart rate
  if (heartRate >= 120) {
    score += 10;
    reasons.push('Tachycardia');
  } else if (heartRate <= 50) {
    score += 10;
    reasons.push('Bradycardia');
  }

  // Temperature
  if (Number.parseFloat(temperature) >= 103) {
    score += 10;
    reasons.push('High fever');
  } else if (Number.parseFloat(temperature) >= 100.4) {
    score += 5;
    reasons.push('Fever');
  }

  // SpO2
  if (Number.parseInt(spo2) <= 90) {
    score += 15;
    reasons.push('Severe hypoxemia');
  } else if (Number.parseInt(spo2) <= 94) {
    score += 10;
    reasons.push('Hypoxemia');
  }

  // Pain level
  if (patientData.painLevel >= 8) {
    score += 10;
    reasons.push('Severe pain');
  } else if (patientData.painLevel >= 5) {
    score += 5;
    reasons.push('Moderate pain');
  }

  // Chief complaint evaluation
  const criticalKeywords = [
    'chest pain',
    'difficulty breathing',
    'shortness of breath',
    'stroke',
    'unconscious',
    'severe bleeding',
    'head injury',
  ];
  const urgentKeywords = [
    'fracture',
    'abdominal pain',
    'severe headache',
    'deep cut',
    'allergic reaction',
    'fever',
    'dehydration',
  ];

  const complaint = patientData.complaint.toLowerCase();

  for (const keyword of criticalKeywords) {
    if (complaint.includes(keyword)) {
      score += 15;
      reasons.push(`Critical symptom: ${keyword}`);
      break;
    }
  }

  for (const keyword of urgentKeywords) {
    if (complaint.includes(keyword)) {
      score += 10;
      reasons.push(`Urgent symptom: ${keyword}`);
      break;
    }
  }

  // Age factor
  if (patientData.age >= 75 || patientData.age <= 5) {
    score += 5;
    reasons.push('Age risk factor');
  }

  // Medical history
  if (
    patientData.medicalHistory.includes('heart disease') ||
    patientData.medicalHistory.includes('stroke')
  ) {
    score += 5;
    reasons.push('Cardiovascular history');
  }

  if (patientData.medicalHistory.includes('diabetes')) {
    score += 3;
    reasons.push('Diabetes history');
  }

  if (patientData.medicalHistory.includes('immunocompromised')) {
    score += 5;
    reasons.push('Immunocompromised');
  }

  // Determine priority
  let priority = 4;
  let severity = 'non-urgent';

  if (score >= 25) {
    priority = 1;
    severity = 'critical';
  } else if (score >= 15) {
    priority = 2;
    severity = 'urgent';
  } else if (score >= 5) {
    priority = 3;
    severity = 'less-urgent';
  }

  // Determine sentiment based on pain and complaint
  let sentiment = 'neutral';
  if (
    patientData.painLevel >= 8 ||
    complaint.includes('severe') ||
    complaint.includes('extreme')
  ) {
    sentiment = 'distressed';
  } else if (
    patientData.painLevel >= 6 ||
    complaint.includes('pain') ||
    complaint.includes('worried')
  ) {
    sentiment = 'anxious';
  } else if (patientData.painLevel >= 4) {
    sentiment = 'uncomfortable';
  } else if (patientData.painLevel >= 2) {
    sentiment = 'worried';
  } else {
    sentiment = 'calm';
  }

  return {
    priority,
    severity,
    sentiment,
    score,
    reasons,
  };
};

export function TriageForm({
  onAddPatient,
  onCancel,
}: {
  onAddPatient: (data: Patient) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    phone: '',
    address: '',
    NOK: '',
    complaint: '',
    painLevel: 0,
    vitals: {
      systolic: '',
      diastolic: '',
      heartRate: '',
      temperature: '',
      spo2: '',
    },
    allergies: '',
    medications: '',
    medicalHistory: '',
    notes: '',
    assignedNurse: '',
  });

  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [currentFocusedField, setCurrentFocusedField] = useState<string | null>(
    null
  );
  const [voiceSimulationStep, setVoiceSimulationStep] = useState(0);
  const [aiEvaluation, setAiEvaluation] = useState<TriageEvaluation | null>(
    null
  );
  const [finalPriority, setFinalPriority] = useState<number | null>(null);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [isVoiceListening, setIsVoiceListening] = useState(false);
  const [isVoiceProcessing, setIsVoiceProcessing] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const { toast } = useToast();

  // Add realtime conversation state (similar to chat-page.tsx)
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [connectionState, setConnectionState] = useState("disconnected");
  const [isAiResponding, setIsAiResponding] = useState(false);
  
  // WebRTC refs for OpenAI realtime (simplified - no audio playback)
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);
  const audioTrackRef = useRef<MediaStreamTrack | null>(null);
  const audioSenderRef = useRef<RTCRtpSender | null>(null);

  // Create refs for all form inputs
  const inputRefs = useRef<Record<string, HTMLElement | null>>({});
  
  // Voice recognition refs (keep for fallback)

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
        setVoiceError("Error fetching session: " + (error as Error).message);
      }
    };

    fetchSession();
  }, []);

  // Function to handle OpenAI function calls for updating triage form
  const handleTriageFunctionCall = async (
    eventData: {
      name: string;
      arguments: string;
      call_id: string;
    },
    dataChannel: RTCDataChannel
  ) => {
    console.log("OpenAI wants to call triage function:", eventData);

    try {
      const parsedArgs = JSON.parse(eventData.arguments);
      
      // Handle different triage form update functions
      switch (eventData.name) {
        case "update_patient_info":
          if (parsedArgs.name) setFormData(prev => ({ ...prev, name: parsedArgs.name }));
          if (parsedArgs.age) setFormData(prev => ({ ...prev, age: parsedArgs.age.toString() }));
          if (parsedArgs.gender) setFormData(prev => ({ ...prev, gender: parsedArgs.gender }));
          if (parsedArgs.phone) setFormData(prev => ({ ...prev, phone: parsedArgs.phone }));
          if (parsedArgs.address) setFormData(prev => ({ ...prev, address: parsedArgs.address }));
          if (parsedArgs.emergency_contact) setFormData(prev => ({ ...prev, NOK: parsedArgs.emergency_contact }));
          
          toast({
            title: 'Patient Info Updated',
            description: 'Basic patient information has been filled in.',
            duration: 3000,
            className: 'border-2 border-blue-600 bg-blue-100 text-blue-800',
          });
          break;

        case "update_symptoms":
          if (parsedArgs.complaint) setFormData(prev => ({ ...prev, complaint: parsedArgs.complaint }));
          if (parsedArgs.pain_level !== undefined) setFormData(prev => ({ ...prev, painLevel: parsedArgs.pain_level }));
          
          toast({
            title: 'Symptoms Updated',
            description: 'Chief complaint and pain level have been recorded.',
            duration: 3000,
            className: 'border-2 border-orange-600 bg-orange-100 text-orange-800',
          });
          break;

        case "update_vitals":
          setFormData(prev => ({
            ...prev,
            vitals: {
              ...prev.vitals,
              ...(parsedArgs.systolic && { systolic: parsedArgs.systolic.toString() }),
              ...(parsedArgs.diastolic && { diastolic: parsedArgs.diastolic.toString() }),
              ...(parsedArgs.heart_rate && { heartRate: parsedArgs.heart_rate.toString() }),
              ...(parsedArgs.temperature && { temperature: parsedArgs.temperature.toString() }),
              ...(parsedArgs.spo2 && { spo2: parsedArgs.spo2.toString() }),
            }
          }));
          
          toast({
            title: 'Vitals Updated',
            description: 'Vital signs have been recorded.',
            duration: 3000,
            className: 'border-2 border-red-600 bg-red-100 text-red-800',
          });
          break;

        case "update_medical_history":
          if (parsedArgs.allergies) setFormData(prev => ({ ...prev, allergies: parsedArgs.allergies }));
          if (parsedArgs.medications) setFormData(prev => ({ ...prev, medications: parsedArgs.medications }));
          if (parsedArgs.medical_history) setFormData(prev => ({ ...prev, medicalHistory: parsedArgs.medical_history }));
          if (parsedArgs.notes) setFormData(prev => ({ ...prev, notes: parsedArgs.notes }));
          
          toast({
            title: 'Medical History Updated',
            description: 'Medical history and current medications recorded.',
            duration: 3000,
            className: 'border-2 border-green-600 bg-green-100 text-green-800',
          });
          break;

        default:
          throw new Error(`Unknown triage function: ${eventData.name}`);
      }

      // Send success response back to OpenAI
      dataChannel.send(
        JSON.stringify({
          type: "conversation.item.create",
          item: {
            type: "function_call_output",
            call_id: eventData.call_id,
            output: JSON.stringify({
              success: true,
              message: `Successfully updated ${eventData.name.replace(/_/g, ' ')}`
            }),
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
      console.error("Triage function call error:", error);

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

  // Voice form update handler
  const handleFormUpdate = useCallback((updates: TriageFormUpdates) => {
    console.log('Applying form updates:', updates);

    setFormData((prev) => {
      const newFormData = { ...prev };

      // Update patient info
      if (updates.patientInfo) {
        const info = updates.patientInfo;
        if (info.name) newFormData.name = info.name;
        if (info.age) newFormData.age = info.age.toString();
        if (info.gender) newFormData.gender = info.gender;
        if (info.phone) newFormData.phone = info.phone;
        if (info.address) newFormData.address = info.address;
        if (info.emergencyContact) newFormData.NOK = info.emergencyContact;
      }

      // Update symptoms
      if (updates.symptoms) {
        const symptoms = updates.symptoms;
        if (symptoms.complaint) newFormData.complaint = symptoms.complaint;
        if (symptoms.painLevel !== undefined) newFormData.painLevel = symptoms.painLevel;
      }

      // Update vitals
      if (updates.vitals) {
        const vitals = updates.vitals;
        const newVitals = { ...newFormData.vitals };
        if (vitals.systolic) newVitals.systolic = vitals.systolic.toString();
        if (vitals.diastolic) newVitals.diastolic = vitals.diastolic.toString();
        if (vitals.heartRate) newVitals.heartRate = vitals.heartRate.toString();
        if (vitals.temperature) newVitals.temperature = vitals.temperature.toString();
        if (vitals.spo2) newVitals.spo2 = vitals.spo2.toString();
        newFormData.vitals = newVitals;
      }

      // Update medical history
      if (updates.medicalHistory) {
        const history = updates.medicalHistory;
        if (history.allergies) newFormData.allergies = history.allergies;
        if (history.medications) newFormData.medications = history.medications;
        if (history.medicalHistory) newFormData.medicalHistory = history.medicalHistory;
        if (history.notes) newFormData.notes = history.notes;
      }

      return newFormData;
    });

    // Show success toast
    toast({
      title: 'Form Updated',
      description: 'Voice input has been processed and form fields updated.',
      duration: 3000,
      className: 'border-2 border-green-600 bg-gradient-to-tr from-green-700 via-emerald-500 to-teal-700 text-white',
    });
  }, [toast]);

  // OpenAI Realtime Conversation Functions
  const startRealtimeConversation = async () => {
    console.log("Starting realtime triage conversation...");
    console.log("Client secret available:", !!clientSecret);

    if (!clientSecret) {
      toast({
        title: 'Connection Error',
        description: 'No client secret available. Please refresh the page.',
        duration: 5000,
        className: 'border-2 border-red-600 bg-red-100 text-red-800',
      });
      return;
    }

    setVoiceError(null);
    setVoiceTranscript('');
    
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

      // 3. Store audio track reference
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrackRef.current = audioTrack;
        audioSenderRef.current = pc.addTrack(audioTrack, stream);
        console.log("Audio track stored and added");
      }

      // 4. Create data channel for realtime events
      const dataChannel = pc.createDataChannel("oai-events", {
        ordered: true,
      });
      dataChannelRef.current = dataChannel;

      dataChannel.onmessage = async (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log("Received triage event:", data);

          // Handle function calls for triage form updates
          if (data.type === "response.function_call_arguments.done") {
            await handleTriageFunctionCall(data, dataChannel);
            return;
          }

          // Handle different event types
          if (data.type === "conversation.item.input_audio_transcription.completed") {
            setVoiceTranscript(data.transcript);
            console.log("User said:", data.transcript);
          }

          // AI processing response (visual feedback only)
          else if (data.type === "response.audio_transcript.delta" || data.type === "response.text.delta") {
            if (!isAiResponding) {
              setIsAiResponding(true);
              console.log("🤖 AI processing triage input");
            }
          }

          // AI finished processing
          else if (data.type === "response.done") {
            console.log("✅ AI triage processing completed");
            setIsAiResponding(false);
            setVoiceTranscript('');
          }

          // User speech events
          else if (data.type === "input_audio_buffer.speech_started") {
            setIsVoiceListening(true);
            console.log("✅ User started speaking - triage");
          }
          else if (data.type === "input_audio_buffer.speech_stopped") {
            setIsVoiceListening(false);
            console.log("User stopped speaking - triage");
          }

          // Handle errors
          else if (data.type === "error") {
            console.error("OpenAI API error:", data);
            setIsAiResponding(false);
            setVoiceError(`Error: ${data.error?.message || "Unknown error occurred"}`);
          }
        } catch (error) {
          console.error("Error parsing triage data channel message:", error);
        }
      };

      dataChannel.onopen = () => {
        console.log("Triage data channel opened");
        // Send session update with triage-specific functions
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
                threshold: 0.7,
                prefix_padding_ms: 300,
                silence_duration_ms: 800,
              },
              input_audio_format: "pcm16",
              // Note: No audio output needed - focusing on form updates only
              instructions: `You are a helpful medical triage assistant. Your role is to help nurses collect patient information efficiently and accurately. 

When the user provides information, use the appropriate function to update the triage form:
- Use update_patient_info for name, age, gender, phone, address, emergency contact
- Use update_symptoms for chief complaint and pain level
- Use update_vitals for blood pressure, heart rate, temperature, oxygen saturation  
- Use update_medical_history for allergies, medications, medical history, notes

Always confirm what information you've recorded and ask for any missing critical information needed for triage assessment.`,
              tools: [
                {
                  type: "function",
                  name: "update_patient_info",
                  description: "Update basic patient demographic information",
                  parameters: {
                    type: "object",
                    properties: {
                      name: { type: "string", description: "Patient's full name" },
                      age: { type: "number", description: "Patient's age in years" },
                      gender: { type: "string", enum: ["Male", "Female", "Other"], description: "Patient's gender" },
                      phone: { type: "string", description: "Patient's phone number" },
                      address: { type: "string", description: "Patient's address" },
                      emergency_contact: { type: "string", description: "Emergency contact name and phone" }
                    }
                  }
                },
                {
                  type: "function", 
                  name: "update_symptoms",
                  description: "Update patient symptoms and chief complaint",
                  parameters: {
                    type: "object",
                    properties: {
                      complaint: { type: "string", description: "Chief complaint - main reason for visit" },
                      pain_level: { type: "number", minimum: 0, maximum: 10, description: "Pain level from 0-10" }
                    }
                  }
                },
                {
                  type: "function",
                  name: "update_vitals", 
                  description: "Update patient vital signs",
                  parameters: {
                    type: "object",
                    properties: {
                      systolic: { type: "number", description: "Systolic blood pressure" },
                      diastolic: { type: "number", description: "Diastolic blood pressure" },
                      heart_rate: { type: "number", description: "Heart rate in beats per minute" },
                      temperature: { type: "number", description: "Temperature in Celsius" },
                      spo2: { type: "number", description: "Oxygen saturation percentage" }
                    }
                  }
                },
                {
                  type: "function",
                  name: "update_medical_history",
                  description: "Update medical history and medications",
                  parameters: {
                    type: "object", 
                    properties: {
                      allergies: { type: "string", description: "Known allergies" },
                      medications: { type: "string", description: "Current medications" },
                      medical_history: { type: "string", description: "Relevant medical history" },
                      notes: { type: "string", description: "Additional notes" }
                    }
                  }
                }
              ]
            },
          })
        );
      };

      // Note: Audio playback removed - focusing on form updates only

      // 6. Create offer (no audio receive needed - just voice input for form updates)
      const offer = await pc.createOffer({
        offerToReceiveAudio: false,
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

      setIsVoiceListening(false);
      setIsAiResponding(false);
      
      toast({
        title: 'Voice Triage Connected',
        description: '🎤 Start speaking to fill out the triage form!',
        duration: 5000,
        className: 'border-2 border-green-600 bg-green-100 text-green-800',
      });
      
      console.log("Voice triage mode activated successfully");
    } catch (err) {
      console.error("Error in startRealtimeConversation:", err);
      setVoiceError("Error starting voice mode: " + (err as Error).message);
      toast({
        title: 'Voice Connection Failed',
        description: (err as Error).message,
        duration: 5000,
        className: 'border-2 border-red-600 bg-red-100 text-red-800',
      });
    }
  };

  const stopRealtimeConversation = () => {
    console.log("Stopping realtime triage conversation...");

    // Reset all states
    setIsVoiceListening(false);
    setIsAiResponding(false);
    setVoiceTranscript('');
    setConnectionState("disconnected");

    // Clear refs
    audioTrackRef.current = null;
    audioSenderRef.current = null;

    // Stop audio stream
    if (audioStreamRef.current) {
      console.log("Stopping audio tracks...");
      audioStreamRef.current.getTracks().forEach((track) => {
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

    // Note: Audio player removed - no audio playback needed

    toast({
      title: 'Voice Triage Disconnected',
      description: '🔇 Voice mode has been stopped.',
      duration: 3000,
      className: 'border-2 border-gray-600 bg-gray-100 text-gray-800',
    });
  };

  // Note: Old browser SpeechRecognition functions removed - now using OpenAI Realtime API

  // Define the voice simulation sequence
  const voiceSimulationSteps = useMemo(() => [
    {
      field: 'complaint',
      value: 'Severe chest pain radiating to left arm, started 30 minutes ago',
      delay: 1000,
      message: 'Chief complaint: Severe chest pain',
    },
    {
      field: 'painLevel',
      value: 8,
      delay: 1000,
      message: 'Pain level: 8 out of 10',
    },
    {
      field: 'systolic',
      value: '160',
      delay: 1000,
      message: 'Blood pressure: 160',
    },
    {
      field: 'diastolic',
      value: '95',
      delay: 1000,
      message: 'over 95',
    },
    {
      field: 'heartRate',
      value: '110',
      delay: 1000,
      message: 'Heart rate: 110 beats per minute',
    },
    {
      field: 'temperature',
      value: '37.1',
      delay: 1000,
      message: 'Temperature: normal',
    },
    {
      field: 'spo2',
      value: '96',
      delay: 1000,
      message: 'Oxygen saturation: 96 percent',
    },
    {
      field: 'allergies',
      value: 'No known allergies',
      delay: 1000,
      message: 'No known allergies',
    },
    {
      field: 'medications',
      value: 'Lisinopril 10mg daily, Metformin 500mg twice daily',
      delay: 1000,
      message: 'Current medications noted',
    },
    {
      field: 'medicalHistory',
      value: 'Hypertension, Type 2 diabetes, smoker',
      delay: 1000,
      message: 'Medical history: Hypertension, diabetes',
    },
  ], []);

  // Helper function to set refs
  const setInputRef = (field: string) => (el: HTMLElement | null) => {
    inputRefs.current[field] = el;
  };

  // Helper function to scroll to element
  const scrollToElement = (element: HTMLElement) => {
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
  };

  // Helper function to add focus border
  const getFocusBorderClass = (fieldName: string) => {
    return currentFocusedField === fieldName
      ? 'ring-2 ring-blue-500 ring-offset-2 border-blue-500 transition-all duration-300'
      : '';
  };

  // Voice simulation effect
  useEffect(() => {
    if (!isVoiceActive || voiceSimulationStep >= voiceSimulationSteps.length) {
      return;
    }

    console.log('Voice simulation step:', voiceSimulationStep);

    const currentStep = voiceSimulationSteps[voiceSimulationStep];

    // Set focus border on current field
    setCurrentFocusedField(currentStep.field);

    // Scroll to the current field
    const element = inputRefs.current[currentStep.field];
    if (element) {
      scrollToElement(element);
    }

    const timer = setTimeout(() => {
      // Fill the form data
      if (currentStep.field === 'painLevel') {
        setFormData((prev) => ({
          ...prev,
          painLevel: currentStep.value as number,
        }));
      } else if (
        ['systolic', 'diastolic', 'heartRate', 'temperature', 'spo2'].includes(
          currentStep.field
        )
      ) {
        setFormData((prev) => ({
          ...prev,
          vitals: {
            ...prev.vitals,
            [currentStep.field]: currentStep.value as string,
          },
        }));
      } else if (currentStep.field === 'gender') {
        handleSelectChange('gender', currentStep.value as string);
      } else {
        setFormData((prev) => ({
          ...prev,
          [currentStep.field]: currentStep.value as string,
        }));
      }

      // Move to next step
      setVoiceSimulationStep((prev) => prev + 1);

      // Clear focus after a short delay
      setTimeout(() => {
        setCurrentFocusedField(null);
      }, 500);
    }, currentStep.delay);

    return () => clearTimeout(timer);
  }, [isVoiceActive, voiceSimulationStep, voiceSimulationSteps]);

  // Handle voice triage click - now uses OpenAI realtime conversation
  const handleVoiceTriageClick = () => {
    if (connectionState === "connected" || isVoiceListening || isAiResponding) {
      stopRealtimeConversation();
    } else {
      startRealtimeConversation();
    }
  };

  // Handle voice triage click for simulation (keeping original for demo)
  const handleVoiceSimulationClick = () => {
    if (!isVoiceActive) {
      setIsVoiceActive(true);
      setVoiceSimulationStep(0);
      setCurrentFocusedField(null);

      // Auto-stop after all steps complete
      const totalDuration =
        voiceSimulationSteps.reduce((acc, step) => acc + step.delay, 0) + 1000;
      setTimeout(() => {
        setIsVoiceActive(false);
        setCurrentFocusedField(null);
        setVoiceSimulationStep(0);

        // Show final evaluation toast
        toast({
          title: 'AI Triage Completed!',
          description: "Please access the patient's evaluation.",
          duration: 5000,
          className:
            'border-2 border-cyan-600 bg-gradient-to-tr from-cyan-700 via-emerald-500 to-teal-700 text-white',
        });
      }, totalDuration);
    } else {
      // Stop simulation
      setIsVoiceActive(false);
      setCurrentFocusedField(null);
      setVoiceSimulationStep(0);
    }
  };

  // useEffect to setAiEvaluation based on formData changes
  const evaluateFormData = useCallback(() => {
    if (
      formData.name &&
      formData.age &&
      formData.gender &&
      // formData.phone &&
      // formData.address &&
      // formData.emergencyContact &&
      formData.complaint &&
      formData.painLevel !== undefined &&
      formData.vitals.systolic &&
      formData.vitals.diastolic &&
      formData.vitals.heartRate &&
      formData.vitals.temperature &&
      formData.vitals.spo2 &&
      formData.allergies &&
      formData.medications &&
      formData.medicalHistory
    ) {
      const evaluation = evaluatePatient({
        ...formData,
        age: Number.parseInt(formData.age),
        NOK: formData.NOK,
        vitals: {
          ...formData.vitals,
          systolic: Number.parseInt(formData.vitals.systolic),
          diastolic: Number.parseInt(formData.vitals.diastolic),
          heartRate: Number.parseInt(formData.vitals.heartRate),
          temperature: formData.vitals.temperature,
          spo2: formData.vitals.spo2,
        },
      });

      setAiEvaluation(evaluation);
      setFinalPriority(evaluation.priority);
    } else {
      // Clear evaluation if form is incomplete
      setAiEvaluation(null);
      setFinalPriority(null);
    }
  }, [formData]);

  // Run evaluation whenever form data changes
  useEffect(() => {
    evaluateFormData();
  }, [formData, evaluateFormData]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleVitalsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      vitals: {
        ...prev.vitals,
        [name]: value,
      },
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePainChange = (value: number[]) => {
    setFormData((prev) => ({ ...prev, painLevel: value[0] }));
  };

  const handlePatientSelect = (patient: RegisteredPatient) => {
    console.log('Suggested patient:', patient);

    // fill form data with selected patient
    setFormData({
      name: patient.name || '',
      age: patient.age?.toString() || '',
      gender: patient.gender || '',
      phone: patient.phone || '',
      address: patient.address || '',
      NOK: patient.NOK || '',
      complaint: '', // Keep empty as this is visit-specific
      painLevel: 0, // Keep default as this is visit-specific
      vitals: {
        systolic: '',
        diastolic: '',
        heartRate: '',
        temperature: '',
        spo2: '',
      }, // Keep empty as vitals are visit-specific
      allergies: patient.allergies?.join(', ') || '',
      medications: patient.medications?.join(', ') || '',
      medicalHistory: patient.medicalHistory?.join(', ') || '',
      notes: '', // Keep empty for new visit notes
      assignedNurse: '',
    });
  };

  const handleSubmit = () => {
    // Format the data for the patient queue
    const allergiesArray = formData.allergies
      ? formData.allergies.split(',').map((item) => item.trim())
      : ['None known'];
    const medicationsArray = formData.medications
      ? formData.medications.split(',').map((item) => item.trim())
      : ['None'];
    const medicalHistoryArray = formData.medicalHistory
      ? formData.medicalHistory.split(',').map((item) => item.trim())
      : ['No significant history'];

    const patientData: Patient = {
      id: Math.random().toString(36).slice(2, 10),
      name: formData.name,
      age: Number.parseInt(formData.age),
      phone: formData.phone,
      address: formData.address,
      gender: formData.gender,
      complaint: formData.complaint,
      vitals: {
        bp: `${formData.vitals.systolic}/${formData.vitals.diastolic}`,
        hr: formData.vitals.heartRate.toString(),
        temp: `${formData.vitals.temperature}°F`,
        spo2: `${formData.vitals.spo2}%`,
      },
      sentiment: (aiEvaluation?.sentiment ?? 'calm') as Sentiments,
      priority:
        'P' + String(finalPriority) ||
        (aiEvaluation ? String(aiEvaluation.priority) : ''),
      NOK: formData.NOK,
      allergies: allergiesArray,
      medications: medicationsArray,
      medicalHistory: medicalHistoryArray,
      notes: formData.notes,
    };

    /**
     * TODO:
     * 1) set status
     * 2) AI VOICE BUTTON
     * 3) Logic to mock AI voice
     */

    console.log('Submitting patient data:', patientData);

    onAddPatient(patientData);
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1:
        return 'bg-red-100 text-red-800 border-red-200';
      case 2:
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 3:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 4:
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityName = (priority: number) => {
    switch (priority) {
      case 1:
        return 'Immediate';
      case 2:
        return 'Urgent';
      case 3:
        return 'Less Urgent';
      case 4:
        return 'Non-Urgent';
      default:
        return 'Unknown';
    }
  };

  // THE ENTIRE LOGIC IMITATING A VOICE COMING IN, AND THEN FILLING UP THE FORMS ACCORDINGLY
  // THERE WILL ALSO BE A BORDER FOR EACH INPUT FIELD THAT WILL CHANGE COLOR BASED ON THE 'AI EVALUATION'
  // THE SCROLL POSITION WILL ALSO CHANGE BASED ON WHERE THE 'AI EVALUATION' IS FOCUSED ON
  // const handleVoiceTriageClick = () => {
  //   setIsVoiceActive(!isVoiceActive);

  //   // Simulate voice recording duration
  //   if (!isVoiceActive) {
  //     setTimeout(() => {
  //       setIsVoiceActive(false);
  //     }, 10000); // Auto-stop after 5 seconds
  //   }
  // };

  return (
    <div className='flex flex-col h-full'>
      <DialogHeader className='sticky top-0 z-10 flex flex-row items-center justify-between bg-gradient-to-r from-[#399eb8] to-[#27546c] text-white p-6  rounded-t-lg'>
        <DialogTitle className='text-2xl font-bold'>Patient Triage</DialogTitle>
        <div className='flex items-center space-x-4'>
          {/* button to load patient data */}
          <PatientSearch onPatientSelect={handlePatientSelect} />
          {/* button to open ai chat */}

          {/* Voice Triage Button with animated bars */}
          <div className='relative inline-flex group items-center shadow-none rounded-lg'>
            <div className='absolute z-10 -inset-0.5 opacity-100 bg-gradient-to-r from-emerald-300 via-cyan-300 to-sky-300 rounded-lg blur-sm group-hover:opacity-100 group-hover:-inset-1 group-hover:blur-md transition-all duration-300'></div>
            <Button
              className={`z-20 bg-gradient-to-br from-emerald-600 via-cyan-600 to-cyan-800 hover:bg-cyan-800 text-white transition-all duration-200 hover:cursor-pointer ${
                !clientSecret ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              onClick={handleVoiceTriageClick}
              disabled={!clientSecret}
            >
              {(connectionState === "connected" || isVoiceListening || isAiResponding) ? (
                <div className='flex items-center space-x-1'>
                  {/* Animated Sound Wave Bars */}
                  {[...Array(8)].map((_, i) => (
                    <motion.div
                      key={i}
                      className='bg-white rounded-full'
                      style={{ width: '3px' }}
                      initial={{ height: 8 }}
                      animate={{
                        height: [8, 12 + Math.sin(i * 0.5) * 8, 8],
                        opacity: [0.4, 1, 0.4],
                      }}
                      transition={{
                        duration: 0.5 + i * 0.1,
                        repeat: Infinity,
                        ease: [0.4, 0, 0.6, 1],
                        delay: i * 0.1,
                        repeatType: 'reverse',
                      }}
                    />
                  ))}
                                  <span className='ml-2 text-sm'>
                  {isAiResponding ? 'AI Processing...' : isVoiceListening ? 'Listening...' : 'Connected'}
                </span>
                </div>
              ) : (
                <>
                  {clientSecret ? (
                    <Mic className='w-4 h-4 mr-2' />
                  ) : (
                    <MicOff className='w-4 h-4 mr-2' />
                  )}
                  <span>
                    {!clientSecret ? 'Loading...' : 'Start Voice Triage'}
                  </span>
                </>
              )}
            </Button>
          </div>

          {/* Demo Voice Simulation Button */}
          <div className='relative inline-flex group items-center shadow-none rounded-lg'>
            <div className='absolute z-10 -inset-0.5 opacity-100 bg-gradient-to-r from-purple-300 via-pink-300 to-rose-300 rounded-lg blur-sm group-hover:opacity-100 group-hover:-inset-1 group-hover:blur-md transition-all duration-300'></div>
            <Button
              className={`z-20 bg-gradient-to-br from-purple-600 via-pink-600 to-rose-800 hover:bg-rose-800 text-white transition-all duration-200 hover:cursor-pointer `}
              onClick={handleVoiceSimulationClick}
            >
              {!isVoiceActive ? (
                <>
                  <Brain className='w-4 h-4 mr-2' />
                  Demo Simulation
                </>
              ) : (
                <div className='flex items-center space-x-1'>
                  {/* Animated Sound Wave Bars */}
                  {[...Array(8)].map((_, i) => (
                    <motion.div
                      key={i}
                      className='bg-white rounded-full'
                      style={{ width: '3px' }}
                      initial={{ height: 8 }}
                      animate={
                        isVoiceActive
                          ? {
                              height: [8, 12 + Math.sin(i * 0.5) * 8, 8],
                              opacity: [0.4, 1, 0.4],
                            }
                          : { height: 8, opacity: 0.4 }
                      }
                      transition={{
                        duration: 0.5 + i * 0.1,
                        repeat: isVoiceActive ? Infinity : 0,
                        ease: [0.4, 0, 0.6, 1],
                        delay: i * 0.1,
                        repeatType: 'reverse',
                      }}
                    />
                  ))}
                  <span className='ml-2 text-sm'>Demo Running...</span>
                </div>
              )}
            </Button>
          </div>
        </div>
      </DialogHeader>

      {/* Voice Transcript Display */}
      {(isVoiceListening || voiceTranscript) && (
        <div className='bg-blue-50 border-l-4 border-blue-400 p-4 mx-6 mt-4 rounded-r-lg'>
          <div className='flex items-start'>
            <div className='flex items-center'>
              <Mic className='h-5 w-5 text-blue-400 mr-2' />
            </div>
            <div className='flex-1'>
              <h4 className='text-sm font-medium text-blue-800 mb-1'>
                Voice Input Status: {isVoiceListening ? 'Listening...' : isVoiceProcessing ? 'Processing...' : 'Ready'}
              </h4>
              {voiceTranscript && (
                <p className='text-sm text-blue-700'>
                  <strong>Transcript:</strong> {voiceTranscript}
                </p>
              )}
              {isVoiceProcessing && (
                <p className='text-xs text-blue-600 mt-1 italic'>
                  AI is analyzing your input and updating the form...
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className='flex-1 p-6 overflow-y-auto'>
        {/* PATIENT INFO */}
        <div className='space-y-6 mb-4'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div className='space-y-3'>
              <Label htmlFor='name'>Patient Name</Label>
              <Input
                ref={setInputRef('name')}
                id='name'
                name='name'
                value={formData.name}
                onChange={handleInputChange}
                placeholder='Full name'
                className={getFocusBorderClass('name')}
                required
              />
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-3'>
                <Label htmlFor='age'>Age</Label>
                <Input
                  ref={setInputRef('age')}
                  id='age'
                  name='age'
                  type='number'
                  value={formData.age}
                  onChange={handleInputChange}
                  placeholder='Years'
                  className={getFocusBorderClass('age')}
                  required
                />
              </div>

              <div className='space-y-3'>
                <Label htmlFor='gender'>Gender</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) => handleSelectChange('gender', value)}
                >
                  <SelectTrigger
                    ref={setInputRef('gender')}
                    className={`w-full ${getFocusBorderClass('gender')}`}
                  >
                    <SelectValue placeholder='Select' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='Male'>Male</SelectItem>
                    <SelectItem value='Female'>Female</SelectItem>
                    <SelectItem value='Other'>Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div className='space-y-3'>
              <Label htmlFor='phone'>Phone Number</Label>
              <Input
                ref={setInputRef('phone')}
                id='phone'
                name='phone'
                value={formData.phone}
                onChange={handleInputChange}
                placeholder='(xxx) xxx-xxxx'
                className={getFocusBorderClass('phone')}
              />
            </div>

            <div className='space-y-3'>
              <Label htmlFor='emergencyContact'>Emergency Contact</Label>
              <Input
                id='emergencyContact'
                name='emergencyContact'
                value={formData.NOK}
                onChange={handleInputChange}
                placeholder='Name and phone number'
              />
            </div>
          </div>

          <div className='space-y-3'>
            <Label htmlFor='address'>Address</Label>
            <Input
              id='address'
              name='address'
              value={formData.address}
              onChange={handleInputChange}
              placeholder='Street address, city, state'
            />
          </div>
        </div>

        {/* horizontal divider */}
        <div className='border-t border-gray-200 my-6' />

        <div className='space-y-6 mb-4'>
          <div className='space-y-3'>
            <Label htmlFor='complaint'>Chief Complaint</Label>
            <Textarea
              ref={setInputRef('complaint')}
              id='complaint'
              name='complaint'
              value={formData.complaint}
              onChange={handleInputChange}
              placeholder='Describe the main reason for visit'
              className={`min-h-[100px] ${getFocusBorderClass('complaint')}`}
              required
            />
          </div>

          {/* Pain Level with special handling */}
          <div className='space-y-3'>
            <Label>Pain Level (0-10)</Label>
            <div
              ref={setInputRef('painLevel')}
              className={`space-y-2 p-3 rounded-md ${
                getFocusBorderClass('painLevel')
                  ? 'ring-2 ring-blue-500 ring-offset-2'
                  : ''
              }`}
            >
              <div className='flex justify-between text-xs text-gray-500'>
                <span>No Pain</span>
                <span>Moderate</span>
                <span>Severe</span>
              </div>
              <Slider
                value={[formData.painLevel]}
                min={0}
                max={10}
                step={1}
                onValueChange={handlePainChange}
                className='py-4'
              />
              <div className='flex justify-between'>
                <span className='text-2xl font-bold'>{formData.painLevel}</span>
                <div className='flex items-center'>
                  {formData.painLevel >= 7 ? (
                    <Badge className='bg-red-100 text-red-800 border-red-200'>
                      Severe
                    </Badge>
                  ) : formData.painLevel >= 4 ? (
                    <Badge className='bg-orange-100 text-orange-800 border-orange-200'>
                      Moderate
                    </Badge>
                  ) : formData.painLevel >= 1 ? (
                    <Badge className='bg-yellow-100 text-yellow-800 border-yellow-200'>
                      Mild
                    </Badge>
                  ) : (
                    <Badge className='bg-green-100 text-green-800 border-green-200'>
                      None
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* VITALS */}
        <div className='space-y-6 mb-4'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center'>
                <Activity className='h-5 w-5 mr-2 text-red-500' />
                Vital Signs
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-6'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div className='space-y-4'>
                  <Label className='text-base'>Blood Pressure</Label>
                  <div className='flex items-center space-x-2'>
                    <div className='space-y-2'>
                      <Label
                        htmlFor='systolic'
                        className='text-sm text-gray-500'
                      >
                        Systolic
                      </Label>
                      <Input
                        ref={setInputRef('systolic')}
                        id='systolic'
                        name='systolic'
                        type='number'
                        value={formData.vitals.systolic}
                        onChange={handleVitalsChange}
                        placeholder='mmHg'
                        className={`w-24 ${getFocusBorderClass('systolic')}`}
                        required
                      />
                    </div>
                    <span className='text-xl font-bold mt-6'>/</span>
                    <div className='space-y-2'>
                      <Label
                        htmlFor='diastolic'
                        className='text-sm text-gray-500'
                      >
                        Diastolic
                      </Label>
                      <Input
                        ref={setInputRef('diastolic')}
                        id='diastolic'
                        name='diastolic'
                        type='number'
                        value={formData.vitals.diastolic}
                        onChange={handleVitalsChange}
                        placeholder='mmHg'
                        className={`w-24 ${getFocusBorderClass('diastolic')}`}
                        required
                      />
                    </div>
                    <div className='ml-2 mt-6'>
                      <Label className='sr-only'>Status</Label>
                      {formData.vitals.systolic &&
                        formData.vitals.diastolic && (
                          <Badge
                            className={
                              Number.parseInt(formData.vitals.systolic) >=
                                180 ||
                              Number.parseInt(formData.vitals.diastolic) >= 120
                                ? 'bg-red-100 text-red-800 border-red-200'
                                : Number.parseInt(formData.vitals.systolic) >=
                                    140 ||
                                  Number.parseInt(formData.vitals.diastolic) >=
                                    90
                                ? 'bg-orange-100 text-orange-800 border-orange-200'
                                : Number.parseInt(formData.vitals.systolic) <=
                                    90 ||
                                  Number.parseInt(formData.vitals.diastolic) <=
                                    60
                                ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                                : 'bg-green-100 text-green-800 border-green-200'
                            }
                          >
                            {Number.parseInt(formData.vitals.systolic) >= 180 ||
                            Number.parseInt(formData.vitals.diastolic) >= 120
                              ? 'Crisis'
                              : Number.parseInt(formData.vitals.systolic) >=
                                  140 ||
                                Number.parseInt(formData.vitals.diastolic) >= 90
                              ? 'High'
                              : Number.parseInt(formData.vitals.systolic) <=
                                  90 ||
                                Number.parseInt(formData.vitals.diastolic) <= 60
                              ? 'Low'
                              : 'Normal'}
                          </Badge>
                        )}
                    </div>
                  </div>
                </div>

                <div className='space-y-4'>
                  <Label htmlFor='heartRate' className='text-base'>
                    Heart Rate
                  </Label>
                  <div className='flex items-center space-x-2'>
                    <Input
                      ref={setInputRef('heartRate')}
                      id='heartRate'
                      name='heartRate'
                      type='number'
                      value={formData.vitals.heartRate}
                      onChange={handleVitalsChange}
                      placeholder='BPM'
                      className={`w-24 ${getFocusBorderClass('heartRate')}`}
                      required
                    />
                    <span className='text-sm text-gray-500'>BPM</span>
                    <div>
                      {formData.vitals.heartRate && (
                        <Badge
                          className={
                            Number.parseInt(formData.vitals.heartRate) >= 120
                              ? 'bg-red-100 text-red-800 border-red-200'
                              : Number.parseInt(formData.vitals.heartRate) >=
                                100
                              ? 'bg-orange-100 text-orange-800 border-orange-200'
                              : Number.parseInt(formData.vitals.heartRate) <= 50
                              ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                              : 'bg-green-100 text-green-800 border-green-200'
                          }
                        >
                          {Number.parseInt(formData.vitals.heartRate) >= 120
                            ? 'Tachycardia'
                            : Number.parseInt(formData.vitals.heartRate) >= 100
                            ? 'Elevated'
                            : Number.parseInt(formData.vitals.heartRate) <= 50
                            ? 'Bradycardia'
                            : 'Normal'}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div className='space-y-4'>
                  <Label htmlFor='temperature' className='text-base'>
                    Temperature
                  </Label>
                  <div className='flex items-center space-x-2'>
                    <Input
                      ref={setInputRef('temperature')}
                      id='temperature'
                      name='temperature'
                      value={formData.vitals.temperature}
                      onChange={handleVitalsChange}
                      placeholder='36.8'
                      className={`w-24 ${getFocusBorderClass('temperature')}`}
                      required
                    />
                    <span className='text-sm text-gray-500'>°C</span>
                    <div>
                      {formData.vitals.temperature && (
                        <Badge
                          className={
                            Number.parseFloat(formData.vitals.temperature) >=
                            38.5
                              ? 'bg-red-100 text-red-800 border-red-200'
                              : Number.parseFloat(
                                  formData.vitals.temperature
                                ) >= 37.6
                              ? 'bg-orange-100 text-orange-800 border-orange-200'
                              : Number.parseFloat(
                                  formData.vitals.temperature
                                ) <= 35
                              ? 'bg-blue-100 text-blue-800 border-blue-200'
                              : 'bg-green-100 text-green-800 border-green-200'
                          }
                        >
                          {Number.parseFloat(formData.vitals.temperature) >=
                          38.5
                            ? 'High Fever'
                            : Number.parseFloat(formData.vitals.temperature) >=
                              37.6
                            ? 'Fever'
                            : Number.parseFloat(formData.vitals.temperature) <=
                              35
                            ? 'Hypothermia'
                            : 'Normal'}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className='space-y-4'>
                  <Label htmlFor='spo2' className='text-base'>
                    SpO2
                  </Label>
                  <div className='flex items-center space-x-2'>
                    <Input
                      ref={setInputRef('spo2')}
                      id='spo2'
                      name='spo2'
                      type='number'
                      value={formData.vitals.spo2}
                      onChange={handleVitalsChange}
                      placeholder='98'
                      className={`w-24 ${getFocusBorderClass('spo2')}`}
                      required
                    />
                    <span className='text-sm text-gray-500'>%</span>
                    <div>
                      {formData.vitals.spo2 && (
                        <Badge
                          className={
                            Number.parseInt(formData.vitals.spo2) <= 90
                              ? 'bg-red-100 text-red-800 border-red-200'
                              : Number.parseInt(formData.vitals.spo2) <= 94
                              ? 'bg-orange-100 text-orange-800 border-orange-200'
                              : 'bg-green-100 text-green-800 border-green-200'
                          }
                        >
                          {Number.parseInt(formData.vitals.spo2) <= 90
                            ? 'Critical'
                            : Number.parseInt(formData.vitals.spo2) <= 94
                            ? 'Low'
                            : 'Normal'}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* horizontal divider */}
        <div className='border-t border-gray-200 my-6' />

        {/* AI EVALUATION */}
        <div className='space-y-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div className='space-y-3'>
              <Label htmlFor='allergies'>Allergies</Label>
              <Textarea
                ref={setInputRef('allergies')}
                id='allergies'
                name='allergies'
                value={formData.allergies}
                onChange={handleInputChange}
                placeholder='List allergies, separated by commas'
                className={getFocusBorderClass('allergies')}
              />
            </div>

            <div className='space-y-3'>
              <Label htmlFor='medications'>Current Medications</Label>
              <Textarea
                ref={setInputRef('medications')}
                id='medications'
                name='medications'
                value={formData.medications}
                onChange={handleInputChange}
                placeholder='List medications, separated by commas'
                className={getFocusBorderClass('medications')}
              />
            </div>
          </div>

          <div className='space-y-3'>
            <Label htmlFor='medicalHistory'>Medical History</Label>
            <Textarea
              ref={setInputRef('medicalHistory')}
              id='medicalHistory'
              name='medicalHistory'
              value={formData.medicalHistory}
              onChange={handleInputChange}
              placeholder='Relevant medical history, separated by commas'
              className={getFocusBorderClass('medicalHistory')}
            />
          </div>

          <div className='space-y-3'>
            <Label htmlFor='notes'>Additional Notes</Label>
            <Textarea
              id='notes'
              name='notes'
              value={formData.notes}
              onChange={handleInputChange}
              placeholder='Any additional observations or notes'
              className='min-h-[100px]'
            />
          </div>
        </div>

        {/* ai priority */}
        <div className='space-y-6'>
          <Card className='border-0 shadow-lg'>
            <CardHeader className='bg-[#0e2946] text-white rounded-t-lg p-4'>
              <div className='flex items-center space-x-3'>
                <Brain className='h-6 w-6' />
                <CardTitle>AI Triage Evaluation</CardTitle>
              </div>
              <CardDescription className='text-indigo-100'>
                Based on the provided patient information
              </CardDescription>
            </CardHeader>
            <CardContent className='p-6 space-y-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm text-gray-500'>Recommended Priority</p>
                  <div className='flex items-center mt-1'>
                    <Badge
                      className={`text-lg px-3 py-1 ${
                        aiEvaluation
                          ? getPriorityColor(aiEvaluation.priority)
                          : 'bg-gray-100 text-gray-800 border-gray-200'
                      }`}
                    >
                      {aiEvaluation ? `P${aiEvaluation.priority}` : '-'}
                    </Badge>
                    <span className='ml-2 font-semibold'>
                      {aiEvaluation
                        ? getPriorityName(aiEvaluation.priority)
                        : '-'}
                    </span>
                  </div>
                </div>
                <div>
                  <p className='text-sm text-gray-500'>Triage Score</p>
                  <p className='text-2xl font-bold'>
                    {aiEvaluation ? aiEvaluation.score : '-'}
                  </p>
                </div>
              </div>

              <div>
                <p className='text-sm text-gray-500 mb-2'>Key Factors</p>
                <div className='flex flex-wrap gap-2'>
                  {aiEvaluation
                    ? aiEvaluation.reasons.map(
                        (reason: string, index: number) => (
                          <Badge
                            key={index}
                            variant='outline'
                            className='bg-indigo-50 text-indigo-700 border-indigo-200'
                          >
                            {reason}
                          </Badge>
                        )
                      )
                    : '-'}
                </div>
              </div>

              <div className='bg-gray-50 p-4 rounded-lg'>
                <p className='text-sm text-gray-500 mb-2'>
                  Nurse&apos;s Final Decision
                </p>
                <p className='text-sm mb-4'>
                  {aiEvaluation
                    ? `
                    The AI has recommended priority P${aiEvaluation.priority},
                    but you can override this if needed.
                    `
                    : 'The AI evaluation is not yet available. Please complete the patient information step to generate an AI recommendation.'}
                </p>

                <RadioGroup
                  value={finalPriority?.toString()}
                  onValueChange={(value) =>
                    setFinalPriority(Number.parseInt(value))
                  }
                  className='grid grid-cols-2 gap-4'
                >
                  <div>
                    <RadioGroupItem
                      value='1'
                      id='p1'
                      className='peer sr-only'
                      aria-label='Priority 1 - Immediate'
                    />
                    <Label
                      htmlFor='p1'
                      className='flex flex-col items-center justify-between rounded-md border-2 border-red-200 bg-red-50 p-4 hover:bg-red-100 hover:text-red-900 peer-data-[state=checked]:border-red-500 peer-data-[state=checked]:bg-red-100 peer-data-[state=checked]:text-red-900'
                    >
                      <Zap className='mb-2 h-6 w-6 text-red-600' />
                      <span className='font-semibold'>P1 - Immediate</span>
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem
                      value='2'
                      id='p2'
                      className='peer sr-only'
                      aria-label='Priority 2 - Urgent'
                    />
                    <Label
                      htmlFor='p2'
                      className='flex flex-col items-center justify-between rounded-md border-2 border-orange-200 bg-orange-50 p-4 hover:bg-orange-100 hover:text-orange-900 peer-data-[state=checked]:border-orange-500 peer-data-[state=checked]:bg-orange-100 peer-data-[state=checked]:text-orange-900'
                    >
                      <AlertTriangle className='mb-2 h-6 w-6 text-orange-600' />
                      <span className='font-semibold'>P2 - Urgent</span>
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem
                      value='3'
                      id='p3'
                      className='peer sr-only'
                      aria-label='Priority 3 - Less Urgent'
                    />
                    <Label
                      htmlFor='p3'
                      className='flex flex-col items-center justify-between rounded-md border-2 border-yellow-200 bg-yellow-50 p-4 hover:bg-yellow-100 hover:text-yellow-900 peer-data-[state=checked]:border-yellow-500 peer-data-[state=checked]:bg-yellow-100 peer-data-[state=checked]:text-yellow-900'
                    >
                      <Clock className='mb-2 h-6 w-6 text-yellow-600' />
                      <span className='font-semibold'>P3 - Less Urgent</span>
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem
                      value='4'
                      id='p4'
                      className='peer sr-only'
                      aria-label='Priority 4 - Non-Urgent'
                    />
                    <Label
                      htmlFor='p4'
                      className='flex flex-col items-center justify-between rounded-md border-2 border-blue-200 bg-blue-50 p-4 hover:bg-blue-100 hover:text-blue-900 peer-data-[state=checked]:border-blue-500 peer-data-[state=checked]:bg-blue-100 peer-data-[state=checked]:text-blue-900'
                    >
                      <User className='mb-2 h-6 w-6 text-blue-600' />
                      <span className='font-semibold'>P4 - Non-Urgent</span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className='bg-blue-50 p-4 rounded-lg border border-blue-200'>
                <div className='flex items-start space-x-3'>
                  <Stethoscope className='h-5 w-5 mt-0.5 text-blue-500' />
                  <div>
                    <p className='font-medium text-blue-900'>Patient Summary</p>
                    <p className='text-sm text-blue-700 mt-1'>
                      {formData
                        ? `${formData.name}, ${formData.age}y/o
                      ${
                        formData.gender === 'M'
                          ? 'male'
                          : formData.gender === 'F'
                          ? 'female'
                          : 'patient'
                      }
                      with ${formData.complaint.toLowerCase()}. Pain level:
                      ${formData.painLevel}/10. Vitals: BP
                      ${
                        formData.vitals.systolic
                      }/{formData.vitals.diastolic}, HR
                      ${formData.vitals.heartRate}, Temp
                      ${formData.vitals.temperature}°F, SpO2
                      ${formData.vitals.spo2}%.`
                        : '-'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* FOOTER */}
      <div className='p-6 border-t flex items-center justify-between bg-gray-50'>
        <Button variant='outline' onClick={onCancel}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!finalPriority}
          className='bg-[#53a590] hover:bg-cyan-800'
        >
          <>
            Add Patient to Queue
            <ChevronRight className='ml-2 h-4 w-4' />
          </>
        </Button>
      </div>

      {/* Audio player removed - focusing on visual form updates only */}
    </div>
  );
}

// Extend the Window interface to include SpeechRecognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}
