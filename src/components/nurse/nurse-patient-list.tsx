import { Accordion } from "@/components/ui/accordion"
import type { Patient } from "@/utils/nurse/nurseTypes"
import { PatientCard } from "./nurse-patient-card"

interface PatientListProps {
  patients: Patient[]
}

export function PatientList({ patients }: PatientListProps) {
  return (
    <main className="flex-1 p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Current Patients</h3>
          <p className="text-sm text-gray-600">{patients.length} patients shown</p>
        </div>

        <Accordion type="multiple" className="space-y-2">
          {patients.map((patient) => (
            <PatientCard key={patient.id} patient={patient} />
          ))}
        </Accordion>
      </div>
    </main>
  )
}
