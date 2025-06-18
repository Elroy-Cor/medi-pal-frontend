"use client";
import { user as mockUser } from "@/app/constants";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

import {
  Activity,
  Calendar,
  Edit,
  Heart,
  Mail,
  MapPin,
  Phone,
  Shield,
  User,
} from "lucide-react";

export function ProfilePage() {
  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
          <User className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-800">My Profile</h1>
          <p className="text-slate-600">
            Manage your personal information and preferences
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Overview */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="flex items-center gap-3">
                <User className="h-5 w-5 text-slate-600" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex items-center gap-6 mb-8">
                <Avatar className="h-20 w-20">
                  <AvatarImage src="/placeholder.svg?height=80&width=80" />
                  <AvatarFallback className="bg-blue-100 text-blue-700 text-2xl font-medium">
                    JS
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-2xl font-semibold text-slate-800">
                    {mockUser.name}
                  </h3>
                  <p className="text-slate-600 mb-2">
                    Patient ID: {mockUser.patientId}
                  </p>
                  <Badge
                    variant="outline"
                    className="bg-green-50 text-green-700 border-green-200"
                  >
                    <Activity className="h-3 w-3 mr-1" />
                    Active Patient
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                  <div>
                    <Label className="text-sm font-medium text-slate-600 flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email Address
                    </Label>
                    <p className="text-slate-800 mt-2 p-3 bg-slate-50 rounded-lg">
                      {mockUser.email}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-slate-600 flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Phone Number
                    </Label>
                    <p className="text-slate-800 mt-2 p-3 bg-slate-50 rounded-lg">
                      {mockUser.phone}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-slate-600 flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Address
                    </Label>
                    <p className="text-slate-800 mt-2 p-3 bg-slate-50 rounded-lg">
                      {mockUser.address}
                    </p>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  <div>
                    <Label className="text-sm font-medium text-slate-600 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Date of Birth
                    </Label>
                    <p className="text-slate-800 mt-2 p-3 bg-slate-50 rounded-lg">
                      {new Date(mockUser.dateOfBirth).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-slate-600 flex items-center gap-2">
                      <Heart className="h-4 w-4" />
                      Blood Type
                    </Label>
                    <p className="text-slate-800 mt-2 p-3 bg-slate-50 rounded-lg">
                      {mockUser.bloodType}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-slate-600">
                      Allergies
                    </Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {mockUser.allergies.map((allergy, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="bg-red-50 text-red-700 border-red-200"
                        >
                          {allergy}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-200">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile Information
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Medical Information */}
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="flex items-center gap-3">
                <Activity className="h-5 w-5 text-slate-600" />
                Medical Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-sm font-medium text-slate-600">
                    Primary Care Doctor
                  </Label>
                  <p className="text-slate-800 mt-2 p-3 bg-slate-50 rounded-lg">
                    {mockUser.primaryDoctor}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-600 flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Insurance Provider
                  </Label>
                  <p className="text-slate-800 mt-2 p-3 bg-slate-50 rounded-lg">
                    {mockUser.insuranceProvider}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-600">
                    Emergency Contact
                  </Label>
                  <p className="text-slate-800 mt-2 p-3 bg-slate-50 rounded-lg">
                    {mockUser.emergencyContact}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-600">
                    Member Since
                  </Label>
                  <p className="text-slate-800 mt-2 p-3 bg-slate-50 rounded-lg">
                    {new Date(mockUser.memberSince).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions Sidebar */}
        <div className="space-y-6">
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <Edit className="h-4 w-4 mr-2" />
                Update Contact Info
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Shield className="h-4 w-4 mr-2" />
                Manage Insurance
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Heart className="h-4 w-4 mr-2" />
                Update Medical Info
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <User className="h-4 w-4 mr-2" />
                Privacy Settings
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-slate-200">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="text-lg">Account Status</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">
                  Profile Completion
                </span>
                <Badge
                  variant="outline"
                  className="bg-green-50 text-green-700 border-green-200"
                >
                  100%
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">
                  Verification Status
                </span>
                <Badge
                  variant="outline"
                  className="bg-blue-50 text-blue-700 border-blue-200"
                >
                  Verified
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Last Login</span>
                <span className="text-sm text-slate-800">Today</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
