"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { registeredPatients } from "@/utils/nurse/initialPatients";
import type { RegisteredPatient } from "@/utils/nurse/nurseTypes";
import { Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface PatientSearchProps {
  onPatientSelect?: (patient: RegisteredPatient) => void;
}

export function PatientSearch({ onPatientSelect }: PatientSearchProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState<RegisteredPatient[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  // get ref of the card to prevent it from collapsing when clicked
  const cardRef = useRef<HTMLDivElement>(null);

  // Filter suggestions based on search term or show initial suggestions
  useEffect(() => {
    if (searchTerm.trim() === "") {
      // Show first 5 patients when no search term
      setSuggestions(registeredPatients.slice(0, 10));
      return;
    }

    const filtered = registeredPatients.filter(
      (patient) =>
        patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.phone.includes(searchTerm) ||
        patient.address.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Limit to 5 suggestions
    setSuggestions(filtered.slice(0, 10));
    setSelectedIndex(-1);
  }, [searchTerm]);

  // if clicked outside the search field and card (card ref), collapse it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isExpanded &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node) &&
        cardRef.current &&
        !cardRef.current.contains(event.target as Node)
      ) {
        handleCollapse();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isExpanded]);

  // Focus input when expanded and show initial suggestions
  useEffect(() => {
    if (isExpanded) {
      if (inputRef.current) {
        inputRef.current.focus();
      }
      // Show initial suggestions when expanded
      setSuggestions(registeredPatients.slice(0, 10));
    }
  }, [isExpanded]);

  const handleExpand = () => {
    setIsExpanded(true);
  };

  const handleCollapse = () => {
    setIsExpanded(false);
    setSearchTerm("");
    setSuggestions([]);
    setSelectedIndex(-1);
  };

  const handlePatientSelect = (patient: RegisteredPatient) => {
    setSearchTerm(patient.name);
    setSuggestions([]);
    onPatientSelect?.(patient);
    // Keep expanded to show selected patient
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (suggestions.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handlePatientSelect(suggestions[selectedIndex]);
        }
        break;
      case "Escape":
        handleCollapse();
        break;
    }
  };

  return (
    <div className="relative">
      {/* Button State */}
      <div
        className={`transition-all duration-300 ease-in-out ${
          isExpanded
            ? "opacity-0 scale-95 pointer-events-none"
            : "opacity-100 scale-100"
        }`}
      >
        <Button
          onClick={handleExpand}
          className="bg-[#53a590] hover:bg-cyan-800 text-white transition-all duration-200"
        >
          <Search className="w-4 h-4 mr-2" />
          Load Patient Data
        </Button>
      </div>

      {/* Search Field State */}
      <div
        className={`absolute top-0 -left-40 transition-all duration-300 ease-in-out ${
          isExpanded
            ? "opacity-100 scale-100"
            : "opacity-0 scale-95 pointer-events-none"
        }`}
      >
        <div className="flex items-center space-x-2 min-w-80">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              ref={inputRef}
              type="text"
              placeholder="Search registered patients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pl-10 pr-4 py-2 w-full bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCollapse}
            className="border-gray-300 hover:bg-red-100"
          >
            <X className="w-4 h-4  text-red-600" />
          </Button>
        </div>

        {/* Suggestions Dropdown */}
        {suggestions.length > 0 && (
          <Card
            className="absolute top-full left-0 right-0 mt-2 z-50 shadow-lg p-0 overflow-y-auto max-h-[186px]"
            ref={cardRef}
          >
            <CardContent className="p-0">
              <div className="space-y-0">
                {suggestions.map((patient, index) => (
                  <div
                    key={`${patient.name}-${patient.phone}`}
                    className={`text-sm py-2 px-3 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0 ${
                      index === 0 ? "rounded-t-xl" : ""
                    } ${
                      index === suggestions.length - 1 ? "rounded-b-xl" : ""
                    } ${
                      index === selectedIndex
                        ? "bg-green-50 border-green-200"
                        : "hover:bg-gray-50"
                    }`}
                    onClick={() => {
                      setIsExpanded(false);
                      handlePatientSelect(patient);
                    }}
                  >
                    <div className="flex items-center space-x-3">
                      <div>
                        <p className="font-medium text-gray-900">
                          {patient.name}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* No Results */}
        {searchTerm.trim() !== "" && suggestions.length === 0 && (
          <Card className="absolute top-full left-0 right-0 mt-2 z-50 shadow-lg border-gray-200">
            <CardContent className="p-4 text-center text-gray-500">
              <Search className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">
                No patients found matching &quot;{searchTerm}&quot;
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
