import { Patient, Status } from "@/utils/nurse/nurseTypes"

// Define Sentiments as an array for runtime use
export const Sentiments = ['good', 'calm', 'tired', 'restless', 'angry', 'distressed'] as const;
import {
  User,
  Clock,
  Frown,
  Meh,
  Smile,
  AlertCircle,
  FileText,
  Stethoscope,
  TestTube,
  Home,
  UserCheck,
} from "lucide-react"

export const getSentimentIcon = (sentiment: string) => {
  switch (sentiment) {
    case "good":
    case "calm":
      return <Smile className="w-4 h-4 text-green-600" />
    case "restless":
    case "tired":
      return <Meh className="w-4 h-4 text-yellow-600" />
    case "angry":
      return <Frown className="w-4 h-4 text-red-600" />
    case "distressed":
      return <AlertCircle className="w-4 h-4 text-red-700" />
    default:
      return <Meh className="w-4 h-4 text-gray-600" />
  }
}

export const getSentimentColor = (sentiment: string) => {
  switch (sentiment) {
    case "good":
    case "calm":
      return "bg-green-100 text-green-800"
    case "restless":
    case "tired":
      return "bg-yellow-100 text-yellow-800"
    case "angry":
      return "bg-red-100 text-red-800"
    case "distressed":
      return "bg-red-200 text-red-900"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

export const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "P1":
      return "bg-red-600 text-white"
    case "P2":
      return "bg-yellow-500 text-white"
    default:
      return "bg-blue-500 text-white"
  }
}

export const getStageIcon = (status: string) => {
  switch (status) {
    case "Registration Kiosk":
      return <UserCheck className="w-4 h-4" />
    case "Nurse Triage":
      return <Stethoscope className="w-4 h-4" />
    case "Doctor Consult":
      return <User className="w-4 h-4" />
    case "Order/Execute Tests":
      return <TestTube className="w-4 h-4" />
    case "Review Test Results":
      return <FileText className="w-4 h-4" />
    case "Discharge Procedures":
      return <Home className="w-4 h-4" />
    default:
      return <Clock className="w-4 h-4" />
  }
}

// convert time in minutes to hours and minutes
export const formatTime = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}min`;
}

export const getPatientStats = (patients: Patient[]) => {
  const totalPatients = patients.length
  const criticalPatients = patients.filter((p) => p.priority === "critical").length
  const distressedPatients = patients.filter((p) => p.sentiment === "distressed" || p.sentiment === "angry").length
  const avgWaitTime = "1h 25min" // This could be calculated from actual data

  return {
    totalPatients,
    criticalPatients,
    distressedPatients,
    avgWaitTime,
  }
}

// util to randomize patient data for testing
export const randomizePatients = (patients: Patient[]) => {
  // Convert Status enum/object to an array of its values
  const statusValues = Array.isArray(Status)
    ? Status
    : Object.values(Status);

  return patients.map((patient) => ({
    ...patient,
    id: String(Math.random().toString(36).substring(2, 15)), // Generate a random ID
    sentiment: Sentiments[Math.floor(Math.random() * Sentiments.length)],
    status: statusValues[Math.floor(Math.random() * statusValues.length)],
    timeInStage: Math.floor(Math.random() * 60),
    nextStatus: statusValues[Math.floor(Math.random() * statusValues.length)],
    prevStatus: statusValues[Math.floor(Math.random() * statusValues.length)],
  }))
}