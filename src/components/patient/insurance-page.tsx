"use client";
import { insurance } from "@/app/constants";
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

export function InsurancePage() {
  const [openRows, setOpenRows] = useState<string[]>([]);

  // Transform insurance data for UI compatibility
  const transformedInsurance = insurance.map((item, index) => ({
    id: index.toString(),
    provider: item.provider,
    planName: item.plan_name,
    policyNumber: item.policy_number || "Pending",
    status: item.status.toLowerCase().includes("issued") ? "active" : "pending",
    coverage: item.coverage,
    monthlyPremium: `$${item.monthly_premium.toFixed(2)}`,
    renewalDate: item.renewal_date,
    financialDetails: item.financial_details,
  }));

  // Calculate stats
  const totalPremium = insurance.reduce(
    (sum, item) => sum + item.monthly_premium,
    0
  );
  const activePolicies = transformedInsurance.filter(
    (item) => item.status === "active"
  ).length;
  const pendingPolicies = transformedInsurance.filter(
    (item) => item.status === "pending"
  ).length;

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
    <div className="space-y-4">
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
            <div className="text-3xl font-bold text-gray-900">
              ${totalPremium.toFixed(2)}
            </div>
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
            <div className="text-3xl font-bold text-gray-900">
              {activePolicies}
            </div>
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
            <div className="text-3xl font-bold text-gray-900">
              {pendingPolicies}
            </div>
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
              {transformedInsurance.map((insuranceItem) => (
                <React.Fragment key={insuranceItem.id}>
                  <TableRow
                    key={insuranceItem.id}
                    className="cursor-pointer hover:bg-gray-50 data-[state=open]:bg-gray-100"
                    onClick={() => toggleRow(insuranceItem.id)}
                    data-state={
                      openRows.includes(insuranceItem.id) ? "open" : "closed"
                    }
                  >
                    <TableCell>
                      {openRows.includes(insuranceItem.id) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </TableCell>
                    <TableCell className="font-medium">
                      {insuranceItem.provider}
                    </TableCell>
                    <TableCell>{insuranceItem.planName}</TableCell>
                    <TableCell className="font-mono text-sm">
                      {insuranceItem.policyNumber}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${getStatusColor(
                          insuranceItem.status
                        )}`}
                      >
                        {insuranceItem.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {insuranceItem.monthlyPremium}
                    </TableCell>
                  </TableRow>
                  {openRows.includes(insuranceItem.id) && (
                    <TableRow key={`${insuranceItem.id}-details`}>
                      <TableCell colSpan={6} className="p-4">
                        <div className="pl-10 grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                              <DollarSign className="h-4 w-4" />
                              Financial Details
                            </h4>
                            <div className="space-y-1 text-sm">
                              {Object.entries(
                                insuranceItem.financialDetails
                              ).map(([key, value]) => (
                                <p key={key}>
                                  <span className="font-medium">{key}:</span>{" "}
                                  {value || "N/A"}
                                </p>
                              ))}
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
                                {insuranceItem.renewalDate}
                              </p>
                              <p>
                                <span className="font-medium">Policy:</span>{" "}
                                {insuranceItem.policyNumber}
                              </p>
                            </div>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-700 mb-2">
                              Coverage
                            </h4>
                            <div className="flex flex-wrap gap-1 max-w-[350px] overflow-hidden">
                              {insuranceItem.coverage.map(
                                (item: string, index: number) => (
                                  <Badge
                                    key={index}
                                    variant="outline"
                                    className="text-xs"
                                  >
                                    {item}
                                  </Badge>
                                )
                              )}
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
