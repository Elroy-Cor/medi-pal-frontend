import { Card, CardContent } from "@/components/ui/card"
import { Users, AlertTriangle, Clock, AlertCircle } from "lucide-react"

interface SummaryCardsProps {
  totalPatients: number
  criticalPatients: number
  avgWaitTime: string
  distressedPatients: number
}

export function SummaryCards({ totalPatients, criticalPatients, avgWaitTime, distressedPatients }: SummaryCardsProps) {
  return (
    <div className="p-6 bg-white border-b border-gray-200">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Patients in Ward</p>
                <p className="text-2xl font-bold text-gray-900">{totalPatients}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Critical Patients</p>
                <p className="text-2xl font-bold text-red-600">{criticalPatients}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Wait Time</p>
                <p className="text-2xl font-bold text-orange-600">{avgWaitTime}</p>
              </div>
              <Clock className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Distressed Patients</p>
                <p className="text-2xl font-bold text-red-700">{distressedPatients}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-700" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
