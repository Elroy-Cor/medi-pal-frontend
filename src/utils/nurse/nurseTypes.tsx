export type Patient = {
  id: string;
  name: string;
  age: number;
  phone: string;
  address: string;
  gender: string;
  complaint: string;
  vitals: {
    bp: string;
    temp: string;
    hr: string;
    spo2: string;
  };
  allergies?: string[];
  medications?: string[];
  medicalHistory?: string[];
  notes?: string;
  sentiment: Sentiments;
  priority: string;
  NOK?: string;
  status?: Status;
  prevStatus?: Status;
  nextStatus?: Status;
  waitTime?: number; // in minutes
  room?: string;
  progress?: number;
  nextAction?: string;
  timeInStage?: number;
  arrivalTime?: string;
};

export type Sentiments = 'good' | 'calm' | 'tired' | 'restless' | 'angry' | 'distressed';

export enum Status {
  arrived = 'Arrived',
  registration = 'Registration Kiosk',
  waiting_triage = 'Waiting Triage',
  nurse_triage = 'Nurse Triage',
  waiting_room = 'Waiting Room',
  awaiting_bed = 'Awaiting Bed',
  bed_assigned = 'Bed Assigned',
  room_assigned = 'Room Assigned',
  waiting_doctor = 'Waiting Doctor',
  doctor_consult = 'Doctor Consult',
  awaiting_tests = 'Awaiting Tests',
  test_in_progress = 'Test In Progress',
  await_results = 'Awaiting Results',
  discharge_procedures = 'Discharge Procedures',
  complete = 'Complete',
}