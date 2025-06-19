"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Calendar,
  ChevronDown,
  ChevronRight,
  Clock,
  FileText,
  MapPin,
  User,
} from "lucide-react";
import { Fragment, useState } from "react";

import { medicalVisits as mockVisits } from "@/app/constants";

export function MedicalHistoryPage() {
  const [openRows, setOpenRows] = useState<string[]>([]);

  const toggleRow = (id: string) => {
    setOpenRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-50 text-green-700 border-green-200";
      case "ongoing":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "scheduled":
        return "bg-amber-50 text-amber-700 border-amber-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
          <FileText className="h-4 w-4 md:h-6 md:w-6 text-white" />
        </div>
        <div className="min-w-0">
          <h1 className="text-sm text-wrap md:text-3xl font-bold text-slate-800 truncate">
            Medical History
          </h1>
          <p className="text-xs text-slate-600 mt-1 hidden sm:block">
            Your complete medical visit history and records
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-6">
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="px-2 md:p-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Calendar className="h-5 w-5 text-green-600" />
              </div>
              <div className="flex flex-row md:flex-col gap-2 md:gap-0">
                <p className="text-2xl font-bold text-slate-800">4</p>
                <p className="text-sm text-slate-600 self-center md:self-start">
                  Total Visits
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="px-2 md:p-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">1</p>
                <p className="text-sm text-slate-600 self-center md:self-start">
                  Ongoing Care
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="px-2 md:p-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <User className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">3</p>
                <p className="text-sm text-slate-600 self-center md:self-start">
                  Doctors Seen
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Medical History Table */}
      <Card className="shadow-sm border-slate-200">
        <CardHeader className="py-4">
          <CardTitle className="text-xl font-semibold">Recent Visits</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-100">
                <TableHead className="w-[50px]"></TableHead>
                <TableHead className="font-semibold text-slate-700">
                  Date
                </TableHead>
                <TableHead className="font-semibold text-slate-700">
                  Hospital
                </TableHead>
                <TableHead className="font-semibold text-slate-700">
                  Reason
                </TableHead>
                <TableHead className="font-semibold text-slate-700">
                  Status
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockVisits
                .sort(
                  (a, b) =>
                    new Date(b.date).getTime() - new Date(a.date).getTime()
                )
                .map((visit, id) => (
                  <Fragment key={id}>
                    <TableRow
                      key={visit.id}
                      className="cursor-pointer hover:bg-slate-50 transition-colors border-slate-100"
                      onClick={() => toggleRow(visit.id)}
                    >
                      <TableCell>
                        {openRows.includes(visit.id) ? (
                          <ChevronDown className="h-4 w-4 text-slate-400" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-slate-400" />
                        )}
                      </TableCell>
                      <TableCell className="font-medium text-slate-800">
                        {new Date(visit.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-slate-400" />
                          <span className="text-slate-700">
                            {visit.hospital}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-700">
                        {visit.reason}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={getStatusColor(visit.status)}
                          variant="outline"
                        >
                          {visit.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                    {openRows.includes(visit.id) && (
                      <TableRow key={`${visit.id}-details`}>
                        <TableCell
                          colSpan={5}
                          className="bg-slate-50 border-slate-100"
                        >
                          <div className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-4">
                                <div>
                                  <h4 className="font-semibold text-slate-700 mb-2 flex items-center gap-2">
                                    <User className="h-4 w-4 text-slate-500" />
                                    Doctor Information
                                  </h4>
                                  <p className="text-slate-600 bg-white p-3 rounded-lg border border-slate-200">
                                    {visit.doctor}
                                  </p>
                                </div>
                                <div>
                                  <h4 className="font-semibold text-slate-700 mb-2">
                                    Follow-up
                                  </h4>
                                  <p className="text-slate-600 bg-white p-3 rounded-lg border border-slate-200">
                                    {visit.followUp}
                                  </p>
                                </div>
                              </div>
                              <div className="space-y-4">
                                <div>
                                  <h4 className="font-semibold text-slate-700 mb-2">
                                    Diagnosis
                                  </h4>
                                  <p className="text-slate-600 bg-white p-3 rounded-lg border border-slate-200">
                                    {visit.diagnosis}
                                  </p>
                                </div>
                                <div>
                                  <h4 className="font-semibold text-slate-700 mb-2">
                                    Treatment
                                  </h4>
                                  <p className="text-slate-600 bg-white p-3 rounded-lg border border-slate-200 overflow-scroll">
                                    {visit.treatment}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
