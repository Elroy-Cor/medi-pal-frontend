import MedipalBrand2 from "@/public/brand-01.png";
import MedipalBrand from "@/public/brand-4x4.png";
import { ChevronLeft, Search, Stethoscope } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
export const NurseHeader = ({
  searchTerm,
  setSearchTerm,
  setTriageModalOpen,
}: {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  setTriageModalOpen: (open: boolean) => void;
}) => {
  return (
    <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* back button */}
          <div className="block ">
            <Link href="/" className="text-gray-500 hover:text-gray-700">
              <ChevronLeft className="w-6 h-6" />
            </Link>
          </div>
          {/* Medipal logo in the center of header */}
          <div className="hidden sm:flex flex-1 justify-center">
            <Link href={"/"}>
              <Image
                src={MedipalBrand2}
                alt="Medipal Logo"
                width={140}
                height={140}
              />
            </Link>
          </div>
          {/* medipal other logo in the center of header in mobile view */}
          <div className="flex sm:hidden flex-1 justify-center">
            <Link href={"/"}>
              <Image
                src={MedipalBrand}
                alt="Medipal Logo"
                width={25}
                height={25}
              />
            </Link>
          </div>

          {/* vertical separator */}
          <div className="border-l border-gray-300 h-6 sm:h-12 mr-4"></div>

          {/* Ward Monitor Title */}
          <div className="flex items-center space-x-2">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Ward monitor</h1>
              <p className="text-xs  text-gray-600 hidden md:block">
                Real-time patient status and sentiment tracking
              </p>
            </div>
          </div>
        </div>

        {/* TITLE */}
        <div className="flex items-center space-x-4"></div>

        {/* Desktop Actions */}
        <div className="hidden lg:flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Search className="w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search patients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64"
            />
          </div>
          <Button
            className="bg-[#234b6c] hover:bg-cyan-800 text-white"
            onClick={() => setTriageModalOpen(true)}
          >
            <Stethoscope className="w-4 h-4 mr-2" />
            Triage Patient
          </Button>
        </div>

        {/* Mobile/Tablet Actions */}
        <div className="flex lg:hidden items-center space-x-2">
          {/* Search - Hidden on mobile, shown on tablet */}
          <div className="hidden md:flex items-center space-x-2">
            <Search className="w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-32"
            />
          </div>

          {/* Essential buttons only */}
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => setTriageModalOpen(true)}
            size="sm"
          >
            <Stethoscope className="w-4 h-4 md:mr-2" />
            <span className="hidden md:inline">Triage</span>
          </Button>
        </div>
      </div>

      {/* Mobile Search Bar - Below header on small screens */}
      <div className="mt-4 md:hidden">
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2 flex-1">
            <Search className="w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search patients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>
        </div>
      </div>
    </header>
  );
};
