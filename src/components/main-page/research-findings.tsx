"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const waitTimeData = [
  { range: "0-1 hours", patients: 15, percentage: 12 },
  { range: "1-2 hours", patients: 25, percentage: 20 },
  { range: "2-3 hours", patients: 35, percentage: 28 },
  { range: "3-4 hours", patients: 30, percentage: 24 },
  { range: "4+ hours", patients: 20, percentage: 16 },
];

const anxietyLevels = [
  { level: "Low", value: 20, color: "#10B981" },
  { level: "Moderate", value: 45, color: "#F59E0B" },
  { level: "High", value: 35, color: "#EF4444" },
];

const supportNeeds = [
  { need: "Information about wait times", percentage: 85 },
  { need: "Emotional support", percentage: 72 },
  { need: "Insurance/billing questions", percentage: 68 },
  { need: "Medical history access", percentage: 61 },
  { need: "Family communication", percentage: 54 },
];

export function ResearchFindings() {
  return (
    <section className="container mx-auto px-4 py-16">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
            Research Findings
          </h2>
          <p className="text-lg text-gray-600">
            Insights from interviews with healthcare professionals and patient
            surveys across multiple institutions.{" "}
            <Link
              href="https://docs.google.com/spreadsheets/d/1F5lJeUYFFhjbwgb7kRFgDixxbJqvtqSH-c4q18fgMng/edit?usp=sharing"
              target="_blank"
              className="text-blue-500 underline"
            >
              Actual research findings
            </Link>
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Wait Times Distribution */}
          <Card className="p-6">
            <CardHeader className="p-0 mb-6">
              <CardTitle className="text-xl font-semibold">
                Emergency Department Wait Times
              </CardTitle>
              <p className="text-sm text-gray-600">
                Distribution of patient wait times in hours
              </p>
            </CardHeader>
            <CardContent className="p-0">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={waitTimeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Bar
                    dataKey="percentage"
                    fill="#3B82F6"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Anxiety Levels */}
          <Card className="p-6">
            <CardHeader className="p-0 mb-6">
              <CardTitle className="text-xl font-semibold">
                Patient Anxiety Levels During Wait
              </CardTitle>
              <p className="text-sm text-gray-600">
                Self-reported anxiety levels from patient interviews
              </p>
            </CardHeader>
            <CardContent className="p-0">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={anxietyLevels}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ level, value }) => `${level}: ${value}%`}
                  >
                    {anxietyLevels.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Support Needs */}
        <Card className="p-6">
          <CardHeader className="p-0 mb-6">
            <CardTitle className="text-xl font-semibold">
              Top Patient Support Needs
            </CardTitle>
            <p className="text-sm text-gray-600">
              What patients most want help with during ED visits
            </p>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-4">
              {supportNeeds.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">
                      {item.need}
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      {item.percentage}%
                    </span>
                  </div>
                  <Progress value={item.percentage} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Key Insights */}
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <Card className="p-6 bg-blue-50 border-blue-200">
            <CardContent className="p-0 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">68%</div>
              <p className="text-sm text-blue-800">
                of patients wait 2+ hours in ED
              </p>
            </CardContent>
          </Card>

          <Card className="p-6 bg-orange-50 border-orange-200">
            <CardContent className="p-0 text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">80%</div>
              <p className="text-sm text-orange-800">
                report moderate to high anxiety
              </p>
            </CardContent>
          </Card>

          <Card className="p-6 bg-green-50 border-green-200">
            <CardContent className="p-0 text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">92%</div>
              <p className="text-sm text-green-800">
                of nurses support AI assistance
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
