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
  CircleDollarSign,
  DollarSign,
  PackageCheck,
  Shield,
} from "lucide-react";
import React, { useState } from "react";

interface Insurance {
  id: string;
  provider: string;
  planName: string;
  policyNumber: string;
  status: "active" | "expired" | "pending";
  coverage: string[];
  deductible: string;
  copay: string;
  outOfPocketMax: string;
  renewalDate: string;
  monthlyPremium: string;
}

const mockInsurance: Insurance[] = [
  {
    id: "1",
    provider: "Blue Cross Blue Shield",
    planName: "Premium Health Plan",
    policyNumber: "BCBS-2024-789456",
    status: "active",
    coverage: [
      "Emergency Room Visits",
      "Specialist Consultations",
      "Prescription Medications",
      "Preventive Care",
      "Mental Health Services",
      "Dental (Basic)",
      "Vision (Basic)",
    ],
    deductible: "$1,500",
    copay: "$25 (Primary Care), $50 (Specialist)",
    outOfPocketMax: "$6,000",
    renewalDate: "2025-01-01",
    monthlyPremium: "$450",
  },
  {
    id: "2",
    provider: "Aetna",
    planName: "Basic Coverage Plan",
    policyNumber: "AET-2023-123789",
    status: "expired",
    coverage: [
      "Emergency Room Visits",
      "Primary Care",
      "Prescription Medications (Generic)",
      "Preventive Care",
    ],
    deductible: "$2,500",
    copay: "$35 (Primary Care), $75 (Specialist)",
    outOfPocketMax: "$8,000",
    renewalDate: "2024-01-01",
    monthlyPremium: "$320",
  },
  {
    id: "3",
    provider: "UnitedHealthcare",
    planName: "Family Plus Plan",
    policyNumber: "UHC-2025-456123",
    status: "pending",
    coverage: [
      "Emergency Room Visits",
      "Specialist Consultations",
      "Prescription Medications",
      "Preventive Care",
      "Mental Health Services",
      "Dental (Comprehensive)",
      "Vision (Comprehensive)",
      "Maternity Care",
    ],
    deductible: "$1,000",
    copay: "$20 (Primary Care), $40 (Specialist)",
    outOfPocketMax: "$5,000",
    renewalDate: "2025-03-01",
    monthlyPremium: "$650",
  },
];

export function InsurancePage() {
  const [openRows, setOpenRows] = useState<string[]>([]);

  const toggleRow = (id: string) => {
    setOpenRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-emerald-100 text-emerald-700";
      case "expired":
        return "bg-red-100 text-red-700";
      case "pending":
        return "bg-amber-100 text-amber-700";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
          <Shield className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Insurance Plans</h1>
          <p className="text-slate-600">
            Your complete medical visit history and records
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card className="shadow-sm border-zinc-200">
          <CardHeader>
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <CircleDollarSign className="h-5 w-5 text-green-500" />
              Total Premium
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">$1,420</div>
            <p className="text-sm text-gray-500">Combined monthly premium</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-zinc-200">
          <CardHeader>
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <PackageCheck className="h-5 w-5 text-blue-500" />
              Active Policies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">1</div>
            <p className="text-sm text-gray-500">
              Currently active insurance policies
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-zinc-200">
          <CardHeader>
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <Shield className="h-5 w-5 text-yellow-500" />
              Pending Policies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">1</div>
            <p className="text-sm text-gray-500">
              Policies awaiting activation
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-md">
        <CardHeader className="py-4">
          <CardTitle className="text-xl font-semibold">
            Insurance Plans
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]"></TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Plan Name</TableHead>
                <TableHead>Policy Number</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Monthly Premium</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockInsurance.map((insurance) => (
                <React.Fragment key={insurance.id}>
                  <TableRow
                    key={insurance.id}
                    className="cursor-pointer hover:bg-gray-50 data-[state=open]:bg-gray-100"
                    onClick={() => toggleRow(insurance.id)}
                    data-state={
                      openRows.includes(insurance.id) ? "open" : "closed"
                    }
                  >
                    <TableCell>
                      {openRows.includes(insurance.id) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </TableCell>
                    <TableCell className="font-medium">
                      {insurance.provider}
                    </TableCell>
                    <TableCell>{insurance.planName}</TableCell>
                    <TableCell className="font-mono text-sm">
                      {insurance.policyNumber}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${getStatusColor(
                          insurance.status
                        )}`}
                      >
                        {insurance.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {insurance.monthlyPremium}
                    </TableCell>
                  </TableRow>
                  {openRows.includes(insurance.id) && (
                    <TableRow key={`${insurance.id}-details`}>
                      <TableCell colSpan={6} className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                              <DollarSign className="h-4 w-4" />
                              Financial Details
                            </h4>
                            <div className="space-y-1 text-sm">
                              <p>
                                <span className="font-medium">Deductible:</span>{" "}
                                {insurance.deductible}
                              </p>
                              <p>
                                <span className="font-medium">Copay:</span>{" "}
                                {insurance.copay}
                              </p>
                              <p>
                                <span className="font-medium">
                                  Out-of-pocket Max:
                                </span>{" "}
                                {insurance.outOfPocketMax}
                              </p>
                            </div>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              Plan Details
                            </h4>
                            <div className="space-y-1 text-sm">
                              <p>
                                <span className="font-medium">
                                  Renewal Date:
                                </span>{" "}
                                {insurance.renewalDate}
                              </p>
                              <p>
                                <span className="font-medium">Policy:</span>{" "}
                                {insurance.policyNumber}
                              </p>
                            </div>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-700 mb-2">
                              Coverage
                            </h4>
                            <div className="flex flex-wrap gap-1">
                              {insurance.coverage.map((item, index) => (
                                <Badge
                                  key={index}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {item}
                                </Badge>
                              ))}
                            </div>
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
  );
}
