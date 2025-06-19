import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  ChevronDown,
  ChevronRight,
  Activity,
  Clock,
  Heart,
  AlertTriangle,
  ChevronUp,
  ArrowUpDown,
} from "lucide-react"
import React, { useState, useMemo } from "react"
import type { Patient } from "@/utils/nurse/nurseTypes"
import { getSentimentIcon, getSentimentColor, getPriorityColor, getStageIcon } from "@/utils/nurse/nurseUtils"
import { TreatmentTimeline } from "./nurse-treatment-timeline"
import { formatTime } from "@/utils/nurse/nurseUtils"

interface PatientListProps {
  patients: Patient[]
}

type SortField = 'name' | 'status' | 'sentiment' | 'priority' | 'waitTime' | 'room' | 'age'
type SortDirection = 'asc' | 'desc' | null

export function PatientList({ patients }: PatientListProps) {
  const [openRows, setOpenRows] = useState<string[]>([])
  const [sortField, setSortField] = useState<SortField | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>(null)

  const toggleRow = (id: string) => {
    setOpenRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    )
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Cycle through: asc -> desc -> null
      if (sortDirection === 'asc') {
        setSortDirection('desc')
      } else if (sortDirection === 'desc') {
        setSortDirection(null)
        setSortField(null)
      } else {
        setSortDirection('asc')
      }
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-3 w-3 text-gray-400" />
    }
    
    if (sortDirection === 'asc') {
      return <ChevronUp className="h-3 w-3 text-blue-600" />
    } else if (sortDirection === 'desc') {
      return <ChevronDown className="h-3 w-3 text-blue-600" />
    }
    
    return <ArrowUpDown className="h-3 w-3 text-gray-400" />
  }

  const sortedPatients = useMemo(() => {
    if (!sortField || !sortDirection) {
      return patients
    }

    // Sentiment order: positive to negative (1 = most positive, 6 = most negative)
    const sentimentOrder = { 
      'good': 1,      // most positive
      'calm': 2,      // positive
      'tired': 3,     // neutral/mild negative
      'restless': 4,  // moderate negative  
      'distressed': 5, // negative
      'angry': 6      // most negative
    }

    return [...patients].sort((a, b) => {
      let aValue: string | number
      let bValue: string | number

      switch (sortField) {
        case 'name':
          aValue = a.name?.toLowerCase() || ''
          bValue = b.name?.toLowerCase() || ''
          break
        case 'status':
          aValue = a.status?.toLowerCase() || ''
          bValue = b.status?.toLowerCase() || ''
          break
        case 'sentiment':
          aValue = sentimentOrder[a.sentiment as keyof typeof sentimentOrder] || 999
          bValue = sentimentOrder[b.sentiment as keyof typeof sentimentOrder] || 999
          break
        case 'priority':
          // Extract number from priority string (e.g., "P1" -> 1, "P2" -> 2)
          aValue = a.priority ? parseInt(a.priority.substring(1)) || 999 : 999
          bValue = b.priority ? parseInt(b.priority.substring(1)) || 999 : 999
          break
        case 'waitTime':
          aValue = a.waitTime || 0
          bValue = b.waitTime || 0
          break
        case 'room':
          aValue = a.room?.toLowerCase() || ''
          bValue = b.room?.toLowerCase() || ''
          break
        case 'age':
          aValue = a.age || 0
          bValue = b.age || 0
          break
        default:
          return 0
      }

      // Handle string comparison
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const result = aValue.localeCompare(bValue)
        return sortDirection === 'asc' ? result : -result
      }

      // Handle number comparison
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        const result = aValue - bValue
        return sortDirection === 'asc' ? result : -result
      }

      return 0
    })
  }, [patients, sortField, sortDirection]) // Removed sentimentOrder from dependencies

  const SortableHeader = ({ field, children, className = "", justify }: { 
    field: SortField, 
    children: React.ReactNode,
    className?: string,
    justify?: string
  }) => (
    <TableHead 
      className={`cursor-pointer hover:bg-gray-50 select-none transition-colors ${className}`}
      onClick={() => handleSort(field)}
    >
      <div className={`flex items-center ${justify ? justify : 'justify-between'}`}>
        {children}
        {getSortIcon(field)}
      </div>
    </TableHead>
  )

  return (
    <main className="flex-1 p-3 md:p-6 pt-0">
      <div className="space-y-2">
        <Card className="shadow-md py-4 gap-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="md:text-xl font-semibold flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-600" />
                Current Patients
              </CardTitle>
              <div className="flex items-center gap-4">
                {sortField && (
                  <p className="text-xs text-gray-500">
                    Sorted by {sortField} ({sortDirection === 'asc' ? 'ascending' : 'descending'})
                  </p>
                )}
                <p className="text-sm text-gray-600">{patients.length} patients shown</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]"></TableHead>
                  <SortableHeader field="name">Patient</SortableHeader>
                  <SortableHeader field="status">Current Stage</SortableHeader>
                  <SortableHeader field="sentiment">Sentiment</SortableHeader>
                  <SortableHeader field="priority">Priority</SortableHeader>
                  <SortableHeader field="waitTime">Wait Time</SortableHeader>
                  <SortableHeader field="room" justify="justify-end gap-2" className="text-right pr-6">Room</SortableHeader>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedPatients.map((patient) => (
                  <React.Fragment key={patient.id}>
                    <TableRow
                      className="cursor-pointer hover:bg-gray-50 data-[state=open]:bg-gray-100"
                      onClick={() => toggleRow(patient.id)}
                      data-state={openRows.includes(patient.id) ? "open" : "closed"}
                    >
                      <TableCell className="pl-4">
                        {openRows.includes(patient.id) ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </TableCell>
                      
                      <TableCell>
                        <div>
                          <p className="font-semibold text-gray-900">{patient.name}</p>
                          <p className="text-sm text-gray-600">
                            {patient.id} • Age {patient.age}
                          </p>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <div className="flex-shrink-0">
                            {getStageIcon(patient.status || '')}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{patient.status}</p>
                            <p className="text-xs text-gray-500">
                              In stage: {formatTime(patient.timeInStage ?? 0)}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <div className="flex-shrink-0">
                            {getSentimentIcon(patient.sentiment)}
                          </div>
                          <Badge className={`${getSentimentColor(patient.sentiment)} text-xs`}>
                            {patient.sentiment.charAt(0).toUpperCase() + patient.sentiment.slice(1)}
                          </Badge>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <Badge className={`${getPriorityColor(patient.priority)} font-semibold`}>
                          {patient.priority.toUpperCase()}
                        </Badge>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3 text-gray-500" />
                          <span className="text-sm font-medium">{formatTime(patient.waitTime ?? 0)}</span>
                        </div>
                      </TableCell>
                      
                      <TableCell className="text-right font-medium pr-6">
                        {patient.room}
                      </TableCell>
                    </TableRow>
                    
                    {openRows.includes(patient.id) && (
                      <TableRow key={`${patient.id}-details`}>
                        <TableCell colSpan={7} className="p-6 bg-gray-50">
                          <div className="space-y-6">
                            {/* Reason for ER Visit */}
                            <div className="bg-blue-50 rounded-lg p-4">
                              <h4 className="text-sm font-semibold text-blue-900 mb-2">Reason for ER Visit</h4>
                              <p className="text-sm text-blue-800">{patient.complaint}</p>
                            </div>

                            {/* Treatment Timeline */}
                            <TreatmentTimeline
                              prevStage={patient.prevStatus || ''}
                              currentStage={patient.status || ''}
                              nextStage={patient.nextStatus || ''}
                            />

                            {/* Detailed Information Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                              <div>
                                <h5 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                  <Activity className="h-4 w-4" />
                                  Patient Details
                                </h5>
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Arrival Time:</span>
                                    <span className="text-gray-900 font-medium">{patient.arrivalTime}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Total Wait:</span>
                                    <span className="text-gray-900 font-medium">{formatTime(patient.waitTime ?? 0)}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Phone:</span>
                                    <span className="text-gray-900 font-medium">{patient.phone}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Address:</span>
                                    <span className="text-gray-900 font-medium text-right">{patient.address}</span>
                                  </div>
                                </div>
                              </div>

                              <div>
                                <h5 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                  <Heart className="h-4 w-4 text-red-500" />
                                  Vital Signs
                                </h5>
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Blood Pressure:</span>
                                    <span className="text-gray-900 font-medium">{patient.vitals.bp}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Temperature:</span>
                                    <span className="text-gray-900 font-medium">{patient.vitals.temp}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Heart Rate:</span>
                                    <span className="text-gray-900 font-medium">{patient.vitals.hr}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">SpO2:</span>
                                    <span className="text-gray-900 font-medium">{patient.vitals.spo2}</span>
                                  </div>
                                </div>
                              </div>

                              <div>
                                <h5 className="text-sm font-semibold text-gray-700 mb-3">
                                  Medical Information
                                </h5>
                                <div className="space-y-3">
                                  <div>
                                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Allergies</span>
                                    <p className="text-sm text-gray-800 mt-1">
                                      {patient.allergies && patient.allergies.length > 0 
                                        ? patient.allergies.join(', ') 
                                        : 'None known'}
                                    </p>
                                  </div>
                                  <div>
                                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Medications</span>
                                    <p className="text-sm text-gray-800 mt-1">
                                      {patient.medications && patient.medications.length > 0 
                                        ? patient.medications.join(', ') 
                                        : 'None'}
                                    </p>
                                  </div>
                                  <div>
                                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Medical History</span>
                                    <p className="text-sm text-gray-800 mt-1">
                                      {patient.medicalHistory && patient.medicalHistory.length > 0 
                                        ? patient.medicalHistory.join(', ') 
                                        : 'None significant'}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Next Action */}
                            <div className="bg-yellow-50 rounded-lg p-4">
                              <h4 className="text-sm font-semibold text-yellow-900 mb-2 flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4" />
                                Next Action Required
                              </h4>
                              <p className="text-sm text-yellow-800">{patient.nextAction}</p>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-wrap gap-2 pt-2">
                              <Button variant="outline" size="sm">
                                Update Status
                              </Button>
                              <Button variant="outline" size="sm">
                                View Full Record
                              </Button>
                              <Button variant="outline" size="sm">
                                Contact Patient
                              </Button>
                              <Button variant="outline" size="sm">
                                Transfer Patient
                              </Button>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
