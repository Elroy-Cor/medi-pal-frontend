import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { User } from "lucide-react"
import type { Patient } from "@/utils/nurse/nurseTypes"
import { getSentimentIcon, getSentimentColor, getPriorityColor, getStageIcon } from "@/utils/nurse/nurseUtils"
import { TreatmentTimeline } from "./nurse-treatment-timeline"

interface PatientCardProps {
  patient: Patient
}

export function PatientCard({ patient }: PatientCardProps) {
  return (
    <AccordionItem value={patient.id} className="border-0">
      <Card className="hover:shadow-md transition-shadow">
        <AccordionTrigger className="hover:no-underline p-0">
          <CardContent className="p-4 w-full">
            {/* Collapsed View - Essential Info Only */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {/* Patient Name & Basic Info */}
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900">{patient.name}</p>
                    <p className="text-sm text-gray-600">
                      {patient.id} • Age {patient.age} • {patient.room}
                    </p>
                  </div>
                </div>

                {/* Current Stage */}
                <div className="flex items-center space-x-2 min-w-0">
                  {getStageIcon(patient.status || '')}
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-900">{patient.status || ''}</p>
                    <p className="text-xs text-gray-500">In stage: {patient.timeInStage}</p>
                  </div>
                </div>

                {/* Sentiment */}
                <div className="flex items-center space-x-2">
                  {getSentimentIcon(patient.sentiment)}
                  <Badge className={getSentimentColor(patient.sentiment)}>
                    {patient.sentiment.charAt(0).toUpperCase() + patient.sentiment.slice(1)}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                {/* Priority */}
                <Badge className={getPriorityColor(patient.priority)}>{patient.priority.toUpperCase()}</Badge>
              </div>
            </div>
          </CardContent>
        </AccordionTrigger>

        {/* Expanded View - Additional Details */}
        <AccordionContent className="pb-0">
          <CardContent className="px-4 pb-4 pt-0">
            <div className="border-t border-gray-100 pt-4 space-y-4">
              {/* Reason for ER Visit */}
              <div className="bg-blue-50 rounded-lg p-3">
                <h4 className="text-sm font-semibold text-blue-900 mb-1">Reason for ER Visit</h4>
                <p className="text-sm text-blue-800">{patient.complaint}</p>
              </div>

              {/* Treatment Timeline */}
              <TreatmentTimeline
                prevStage={patient.prevStatus || ''}
                currentStage={patient.status || ''}
                nextStage={patient.nextStatus || ''}
              />

              {/* Detailed Information Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <h5 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                      Patient Details
                    </h5>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Arrival Time:</span>
                        <span className="text-gray-900">{patient.arrivalTime}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Wait:</span>
                        <span className="text-gray-900">{patient.waitTime}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Complaint:</span>
                        <span className="text-gray-900">{patient.complaint}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <h5 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Vital Signs</h5>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Blood Pressure:</span>
                        <span className="text-gray-900">{patient.vitals.bp}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Temperature:</span>
                        <span className="text-gray-900">{patient.vitals.temp}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Heart Rate:</span>
                        <span className="text-gray-900">{patient.vitals.hr}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">SpO2:</span>
                        <span className="text-gray-900">{patient.vitals.spo2}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Next Action */}
              <div className="bg-yellow-50 rounded-lg p-3">
                <h4 className="text-sm font-semibold text-yellow-900 mb-1">Next Action Required</h4>
                <p className="text-sm text-yellow-800">{patient.nextAction}</p>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2 pt-2">
                <Button variant="outline" size="sm">
                  Update Status
                </Button>
                <Button variant="outline" size="sm">
                  View Full Record
                </Button>
                <Button variant="outline" size="sm">
                  Contact Patient
                </Button>
              </div>
            </div>
          </CardContent>
        </AccordionContent>
      </Card>
    </AccordionItem>
  )
}
