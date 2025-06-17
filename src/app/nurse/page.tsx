'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent } from '@/components/ui/dialog';
// icons
import { MessageCircle, Mic, Zap } from 'lucide-react';
// Nurse utils
import { getPatientStats, randomizePatients } from '@/utils/nurse/nurseUtils';
import { NurseHeader } from '@/components/nurse/nurse-header';
import { TriageForm } from '@/components/nurse/triage-form';
import { SummaryCards } from '@/components/nurse/nurse-summary-cards';
import { PatientList } from '@/components/nurse/nurse-patient-list';
// sonner
import { toast } from 'sonner';
// types
import { Patient, Status } from '@/utils/nurse/nurseTypes';

const initialPatients: Patient[] = [
  {
    id: 'P001',
    name: 'Sarah Chen',
    age: 34,
    phone: '65-9123-4567',
    address: '123 Orchard Road, Singapore',
    gender: 'Female',
    complaint: 'Chest pain and shortness of breath',
    vitals: { bp: '140/90', temp: '37.2°C', hr: '95 bpm', spo2: '96%' },
    allergies: ['Penicillin'],
    medications: ['Aspirin (daily)'],
    medicalHistory: ['Asthma'],
    notes: 'Patient appears anxious. Recent travel history noted.',
    sentiment: 'restless',
    priority: 'P2',
    NOK: 'David Chen (Husband) - 65-8765-4321',
    status: Status.nurse_triage,
    prevStatus: Status.registration,
    nextStatus: Status.doctor_consult,
    waitTime: 25,
    room: 'N/A',
    progress: 2,
    nextAction: 'Nurse assessment',
    timeInStage: 15, // in minutes
    arrivalTime: '2:30 PM',
  },
  {
    id: 'P002',
    name: 'Michael Davis',
    age: 58,
    phone: '65-8234-5678',
    address: '45 Commonwealth Ave, Singapore',
    gender: 'Male',
    complaint: 'Persistent cough and fever',
    vitals: { bp: '120/80', temp: '38.5°C', hr: '78 bpm', spo2: '98%' },
    allergies: [],
    medications: ['Lisinopril (daily)'],
    medicalHistory: ['Hypertension'],
    notes: 'Symptoms started 3 days ago. Exhibits mild fatigue.',
    sentiment: 'calm',
    priority: 'P3',
    NOK: 'Linda Davis (Wife) - 65-7654-3210',
    status: Status.waiting_room,
    prevStatus: Status.nurse_triage,
    nextStatus: Status.doctor_consult,
    waitTime: 40,
    room: 'N/A',
    progress: 3,
    nextAction: 'Awaiting doctor to call',
    timeInStage: 30,
    arrivalTime: '1:45 PM',
  },
  {
    id: 'P003',
    name: 'Jessica Lee',
    age: 12,
    phone: '65-9345-6789',
    address: '78 Serangoon Rd, Singapore',
    gender: 'Female',
    complaint: 'Sprained ankle from sports',
    vitals: { bp: '110/70', temp: '36.8°C', hr: '85 bpm', spo2: '99%' },
    allergies: ['Dust'],
    medications: [],
    medicalHistory: [],
    notes: 'Accompanied by mother. Minor swelling observed.',
    sentiment: 'distressed',
    priority: 'P4',
    NOK: 'Emily Lee (Mother) - 65-9876-5432',
    status: Status.arrived,
    prevStatus: Status.arrived,
    nextStatus: Status.registration,
    waitTime: 5,
    room: 'N/A',
    progress: 1,
    nextAction: 'Head to registration kiosk',
    timeInStage: 5,
    arrivalTime: '3:00 PM',
  },
  {
    id: 'P004',
    name: 'David Wilson',
    age: 76,
    phone: '65-9456-7890',
    address: '9 Bishan St 22, Singapore',
    gender: 'Male',
    complaint: 'Severe abdominal pain',
    vitals: { bp: '150/95', temp: '37.5°C', hr: '102 bpm', spo2: '95%' },
    allergies: ['Shellfish'],
    medications: ['Warfarin (daily)'],
    medicalHistory: ['Type 2 Diabetes', 'Heart Disease'],
    notes: 'Pain onset sudden. Requires immediate attention.',
    sentiment: 'good',
    priority: 'P1',
    NOK: 'Sophie Wilson (Daughter) - 65-6789-0123',
    status: Status.bed_assigned,
    prevStatus: Status.awaiting_bed,
    nextStatus: Status.doctor_consult,
    waitTime: 10,
    room: 'Room 3B',
    progress: 4,
    nextAction: 'Doctor examination',
    timeInStage: 5,
    arrivalTime: '2:50 PM',
  },
  {
    id: 'P005',
    name: 'Emily White',
    age: 29,
    phone: '65-9567-8901',
    address: '10 Marine Parade, Singapore',
    gender: 'Female',
    complaint: 'Routine blood work',
    vitals: { bp: '115/75', temp: '37.0°C', hr: '70 bpm', spo2: '99%' },
    allergies: [],
    medications: ['Oral Contraceptives'],
    medicalHistory: [],
    notes: 'Annual check-up. No acute complaints.',
    sentiment: 'tired',
    priority: 'P3',
    NOK: 'Self',
    status: Status.test_in_progress,
    prevStatus: Status.awaiting_tests,
    nextStatus: Status.await_results,
    waitTime: 15,
    room: 'Lab 2',
    progress: 6,
    nextAction: 'Lab technician to finish tests',
    timeInStage: 10,
    arrivalTime: '1:00 PM',
  },
  {
    id: 'P006',
    name: 'Chris Green',
    age: 45,
    phone: '65-9678-9012',
    address: '11 Yishun Ave 9, Singapore',
    gender: 'Male',
    complaint: 'Severe headache and dizziness',
    vitals: { bp: '130/85', temp: '37.1°C', hr: '88 bpm', spo2: '97%' },
    allergies: ['Sulfa drugs'],
    medications: [],
    medicalHistory: ['Migraines'],
    notes: 'Reports vision disturbances. Requested dark room.',
    sentiment: 'angry',
    priority: 'P2',
    NOK: 'Mark Green (Brother) - 65-6543-2109',
    status: Status.waiting_doctor,
    prevStatus: Status.room_assigned,
    nextStatus: Status.doctor_consult,
    waitTime: 60,
    room: 'Room 1A',
    progress: 5,
    nextAction: 'Doctor to enter room',
    timeInStage: 45,
    arrivalTime: '1:30 PM',
  },
];

export default function NurseDashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAIChat, setShowAIChat] = useState(false);
  const [triageModalOpen, setTriageModalOpen] = useState(false);
  const [patients, setPatients] = useState(initialPatients);
  const stats = getPatientStats(patients);

  const filteredPatients = patients.filter(
    (patient: Patient) =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Function to run randomizePatients every 60 seconds
  const randomizePatientsRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    // Randomize patients every 60 seconds
    randomizePatientsRef.current = setInterval(() => {
      setPatients((prevPatients) => randomizePatients(prevPatients));
    }, 60000);
  }, []);

  // Function to add a new patient
  const handleAddPatient = (patientData: Patient) => {
    // Generate a new patient ID
    const allPatients = Object.values(patients).flat();
    const maxId = Math.max(
      ...allPatients.map((p: Patient) => Number.parseInt(p.id.replace('P', ''))),
      0
    );
    const newId = `P${String(maxId + 1).padStart(3, '0')}`;

    const currentTimeStr = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    const newPatient = {
      ...patientData,
      id: newId,
      arrivalTime: currentTimeStr,
      waitTime: 0,
      timeline: [
        { time: currentTimeStr, event: `Patient arrived` },
        {
          time: currentTimeStr,
          event: `Triaged as P${patientData.priority}`,
        },
      ],
    };

    setPatients((prevPatients) => [...prevPatients, newPatient]);

    // Update stats
    const updatedStats = getPatientStats([...patients, newPatient]);
    setPatients((prevPatients) => {
      return prevPatients.map((p) =>
        p.id === newId ? { ...p, ...updatedStats } : p
      );
    });

    // Show success toast
    toast.message('✅ Patient Added', {
      description: `${patientData.name} has been added to the queue with priority P${patientData.priority}.`,
    });

    setTriageModalOpen(false);
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <NurseHeader
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        setTriageModalOpen={setTriageModalOpen}
      />

      {/* Summary Cards */}
      <SummaryCards
        totalPatients={stats.totalPatients}
        criticalPatients={stats.criticalPatients}
        avgWaitTime={stats.avgWaitTime}
        distressedPatients={stats.distressedPatients}
      />

      {/* Patient Accordion List */}
      <PatientList patients={filteredPatients} />

      {/* Triage Modal */}
      <Dialog open={triageModalOpen} onOpenChange={setTriageModalOpen}>
        <DialogContent className='sm:max-w-4xl max-h-[90vh] overflow-y-auto p-0'>
          <TriageForm
            onAddPatient={handleAddPatient}
            onCancel={() => setTriageModalOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Floating AI Assistant Button */}
      <div className='fixed bottom-6 right-6 z-50'>
        <Button
          onClick={() => setShowAIChat(!showAIChat)}
          className='w-14 h-14 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-200'
        >
          <MessageCircle className='w-6 h-6 text-white' />
        </Button>
      </div>

      {/* AI Chat Panel */}
      {showAIChat && (
        <div className='fixed bottom-24 right-6 w-80 h-96 bg-white rounded-lg shadow-2xl border border-gray-200 z-40 flex flex-col'>
          <div className='p-4 border-b border-gray-200 bg-gradient-to-r from-purple-600 to-blue-600 rounded-t-lg'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center space-x-2'>
                <div className='w-8 h-8 bg-white/20 rounded-full flex items-center justify-center'>
                  <Zap className='w-4 h-4 text-white' />
                </div>
                <div>
                  <h3 className='font-semibold text-white'>
                    AI Nurse Assistant
                  </h3>
                  <p className='text-xs text-purple-100'>
                    Ward Overview Context
                  </p>
                </div>
              </div>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => setShowAIChat(false)}
                className='text-white hover:bg-white/20'
              >
                ×
              </Button>
            </div>
          </div>

          <div className='flex-1 p-4 overflow-y-auto'>
            <div className='space-y-3'>
              <div className='bg-gray-100 rounded-lg p-3'>
                <p className='text-sm text-gray-800'>
                  Hi! I can help you with patient information, care protocols,
                  or answer questions about the current ward status. What would
                  you like to know?
                </p>
              </div>
              <div className='text-xs text-gray-500 text-center'>
                I can see you&apos;re viewing the Ward Overview with{' '}
                {patients.length} patients
              </div>
            </div>
          </div>

          <div className='p-4 border-t border-gray-200'>
            <div className='flex items-center space-x-2'>
              <Input
                placeholder='Ask about patients or protocols...'
                className='flex-1'
              />
              <Button size='sm' className='bg-purple-600 hover:bg-purple-700'>
                <Mic className='w-4 h-4' />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
