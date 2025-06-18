"use client";

import { nextOfKin as mockNextOfKin } from "@/app/constants";
import { ContactDetailsModal } from "@/components/patient/contact-details-modal";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NextOfKin } from "@/types";
import { AlertCircle, Heart, Mail, Phone, Plus, Users } from "lucide-react";
import { useEffect, useState } from "react";

export function FamilyPage() {
  const [nextOfKin, setNextOfKin] = useState<NextOfKin[]>(mockNextOfKin);
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [selectedContact, setSelectedContact] = useState<NextOfKin | null>(
    null
  );
  const [showContactModal, setShowContactModal] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "safe":
        return "bg-green-50 text-green-700 border-green-200";
      case "hospitalized":
        return "bg-red-50 text-red-700 border-red-200";
      case "unknown":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "safe":
        return <Heart className="h-4 w-4" />;
      case "hospitalized":
        return <AlertCircle className="h-4 w-4" />;
      case "unknown":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const handleContactClick = (contact: NextOfKin) => {
    setSelectedContact(contact);
    setShowContactModal(true);
  };

  const emergencyContacts = nextOfKin.filter(
    (contact) => contact.isEmergencyContact
  );
  const otherContacts = nextOfKin.filter(
    (contact) => !contact.isEmergencyContact
  );

  useEffect(() => {
    //TODO: anyhow run nextOfKin so no error
    setNextOfKin(mockNextOfKin);
  }, []);

  return (
    <div className="space-y-4">
      {/* Header Section */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
          <Users className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Family & Friends
          </h1>
          <p className="text-slate-600">
            Manage your emergency contacts and family connections
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="px-2">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">
                  {nextOfKin.length}
                </p>
                <p className="text-sm text-slate-600">Total Contacts</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="px-2">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">
                  {emergencyContacts.length}
                </p>
                <p className="text-sm text-slate-600">Emergency Contacts</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="px-2">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Heart className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">
                  {nextOfKin.filter((c) => c.hospitalStatus === "safe").length}
                </p>
                <p className="text-sm text-slate-600">Safe & Well</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Emergency Contacts */}
      <Card
        className="shadow-sm border-slate-200"
        style={{
          gap: 0,
        }}
      >
        <CardHeader
          className="border-b border-slate-100"
          style={{
            paddingBottom: "10px",
          }}
        >
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-600" />
              Emergency Contacts
            </span>
            <Dialog open={isAddingContact} onOpenChange={setIsAddingContact}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Contact
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Emergency Contact</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      placeholder="Enter full name"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="relationship">Relationship</Label>
                    <Input
                      id="relationship"
                      placeholder="e.g., Spouse, Parent, Sibling"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      placeholder="+1 (555) 123-4567"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="email@example.com"
                      className="mt-2"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setIsAddingContact(false)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Add Contact
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsAddingContact(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {emergencyContacts.map((contact) => (
              <div
                key={contact.id}
                className="border border-slate-200 rounded-xl p-4 cursor-pointer hover:bg-slate-50 transition-colors"
                onClick={() => handleContactClick(contact)}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-slate-100 text-slate-700 text-sm">
                        {contact.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-semibold text-slate-800">
                        {contact.name}
                      </h4>
                      <p className="text-sm text-slate-600">
                        {contact.relationship}
                      </p>
                    </div>
                  </div>
                  <Badge
                    className={getStatusColor(contact.hospitalStatus)}
                    variant="outline"
                  >
                    <span className="flex items-center gap-1">
                      {getStatusIcon(contact.hospitalStatus)}
                      {contact.hospitalStatus}
                    </span>
                  </Badge>
                </div>

                <div className="grid grid-cols-1 gap-2 text-sm">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Phone className="h-3 w-3" />
                    <span>{contact.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Mail className="h-3 w-3" />
                    <span>{contact.email}</span>
                  </div>
                </div>

                {contact.hospitalStatus === "hospitalized" && (
                  <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700 text-sm font-medium">
                      Currently at {contact.hospitalInfo?.hospital} - Click for
                      details
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Other Contacts */}
      <Card
        className="shadow-sm border-slate-200"
        style={{
          gap: 0,
        }}
      >
        <CardHeader
          className="border-b border-slate-100"
          style={{
            paddingBottom: "10px",
          }}
        >
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-3">
              <Users className="h-5 w-5 text-slate-600" />
              Family & Friends
            </span>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Contact
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {otherContacts.map((contact) => (
              <div
                key={contact.id}
                className="border border-slate-200 rounded-xl p-4 cursor-pointer hover:bg-slate-50 transition-colors"
                onClick={() => handleContactClick(contact)}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-slate-100 text-slate-700 text-xs">
                        {contact.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-medium text-slate-800 text-sm">
                        {contact.name}
                      </h4>
                      <p className="text-xs text-slate-600">
                        {contact.relationship}
                      </p>
                    </div>
                  </div>
                  <Badge
                    className={getStatusColor(contact.hospitalStatus)}
                    variant="outline"
                    // size="sm"
                  >
                    <span className="flex items-center gap-1">
                      {getStatusIcon(contact.hospitalStatus)}
                      <span className="text-xs">{contact.hospitalStatus}</span>
                    </span>
                  </Badge>
                </div>

                <div className="text-xs text-slate-600">
                  <div className="flex items-center gap-1 mb-1">
                    <Phone className="h-3 w-3" />
                    <span>{contact.phone}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Contact Details Modal */}
      <ContactDetailsModal
        contact={selectedContact}
        open={showContactModal}
        onOpenChange={setShowContactModal}
      />
    </div>
  );
}
