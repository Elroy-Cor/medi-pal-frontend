import { Patient, Status } from '@/utils/nurse/nurseTypes';

// Define Sentiments as an array for runtime use
export const Sentiments = [
  'good',
  'calm',
  'tired',
  'restless',
  'angry',
  'distressed',
] as const;
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
} from 'lucide-react';

export const getSentimentIcon = (sentiment: string) => {
  switch (sentiment) {
    case 'good':
    case 'calm':
      return <Smile className='w-4 h-4 text-green-600' />;
    case 'restless':
    case 'tired':
      return <Meh className='w-4 h-4 text-yellow-600' />;
    case 'angry':
      return <Frown className='w-4 h-4 text-red-600' />;
    case 'distressed':
      return <AlertCircle className='w-4 h-4 text-red-700' />;
    default:
      return <Meh className='w-4 h-4 text-gray-600' />;
  }
};

export const getSentimentColor = (sentiment: string) => {
  switch (sentiment) {
    case 'good':
    case 'calm':
      return 'bg-green-100 text-green-800';
    case 'restless':
    case 'tired':
      return 'bg-yellow-100 text-yellow-800';
    case 'angry':
      return 'bg-red-100 text-red-800';
    case 'distressed':
      return 'bg-red-200 text-red-900';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'P1':
      return 'bg-red-100 text-red-900 border-red-900';
    case 'P2':
      return 'bg-yellow-100 text-yellow-800 border-yellow-800';
    case 'P3':
      return 'bg-blue-100 text-blue-800 border-blue-800';
    default:
      return 'bg-green-100 text-green-800 border-green-800';
  }
};

export const getStageIcon = (status: string) => {
  switch (status) {
    case 'Registration Kiosk':
      return <UserCheck className='w-4 h-4' />;
    case 'Nurse Triage':
      return <Stethoscope className='w-4 h-4' />;
    case 'Doctor Consult':
      return <User className='w-4 h-4' />;
    case 'Order/Execute Tests':
      return <TestTube className='w-4 h-4' />;
    case 'Review Test Results':
      return <FileText className='w-4 h-4' />;
    case 'Discharge Procedures':
      return <Home className='w-4 h-4' />;
    default:
      return <Clock className='w-4 h-4' />;
  }
};

// convert time in minutes to hours and minutes
export const formatTime = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0 && remainingMinutes === 0) {
    return '0 min';
  }
  if (hours === 0) {
    return `${remainingMinutes} mins`;
  }
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${remainingMinutes}m`;
};

// Enhanced but simple avgWaitTime calculation
export const calculateAvgWaitTime = (patients: Patient[]) => {
  if (patients.length === 0) return 0;

  // Filter out completed patients
  const activePatients = patients.filter((p) => p.status !== Status.complete);

  if (activePatients.length === 0) return 0;

  // Calculate weighted average based on priority
  let totalWeightedTime = 0;
  let totalWeight = 0;

  activePatients.forEach((patient) => {
    const currentWait = patient.waitTime || 0;

    // Priority weight (P1 = 0.5, P2 = 0.7, P3 = 1.0, P4 = 1.3)
    const priorityWeight =
      patient.priority === 'P1'
        ? 0.5
        : patient.priority === 'P2'
        ? 0.7
        : patient.priority === 'P4'
        ? 1.3
        : 1.0;

    // Add extra time for distressed patients
    const stressBonus =
      patient.sentiment === 'distressed' || patient.sentiment === 'angry'
        ? 10
        : 0;

    const adjustedTime = (currentWait + stressBonus) * priorityWeight;

    totalWeightedTime += adjustedTime;
    totalWeight += priorityWeight;
  });

  // System load factor - more patients = slightly longer waits
  const loadFactor = 1 + activePatients.length / 20;

  const avgTime =
    totalWeight > 0 ? (totalWeightedTime / totalWeight) * loadFactor : 0;

  return Math.round(avgTime);
};

// get patient statistics
export const getPatientStats = (patients: Patient[]) => {
  const totalPatients = patients.length;
  const criticalPatients = patients.filter((p) => p.priority === 'P1').length;
  const distressedPatients = patients.filter(
    (p) => p.sentiment === 'distressed' || p.sentiment === 'angry'
  ).length;
  const beddedPatients = patients.filter(
    (p) => p.status === Status.bed_assigned || p.status === Status.room_assigned
  ).length;
  const avgWaitTime = calculateAvgWaitTime(patients);

  return {
    totalPatients,
    criticalPatients,
    distressedPatients,
    beddedPatients,
    avgWaitTime,
  };
};

// util to randomize patient data for testing
export const randomizePatients = (patients: Patient[]) => {
  // Convert Status enum/object to an array of its values
  const statusValues = Array.isArray(Status) ? Status : Object.values(Status);

  return patients.map((patient) => ({
    ...patient,
    id: String(Math.random().toString(36).substring(2, 15)), // Generate a random ID
    sentiment: Sentiments[Math.floor(Math.random() * Sentiments.length)],
    status: statusValues[Math.floor(Math.random() * statusValues.length)],
    timeInStage: Math.floor(Math.random() * 60),
    nextStatus: statusValues[Math.floor(Math.random() * statusValues.length)],
    prevStatus: statusValues[Math.floor(Math.random() * statusValues.length)],
  }));
};
