"use client";
import { user } from "@/app/constants";
import type { PageType } from "@/app/patient/page";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import BrandImage from "@/public/brand-01.png";
import BrandImageSquare from "@/public/brand-4x4.png";
import melissa from "@/public/melissa.png";
import {
  AlertTriangle,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  History,
  MessageCircle,
  Shield,
  User,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
interface PatientSidebarProps {
  currentPage: PageType;
  onPageChange: (page: PageType) => void;
}

const mainMenuItems = [
  {
    id: "chat" as PageType,
    title: "Health Buddy",
    icon: MessageCircle,
    // description: "Chat with your AI health assistant",
  },
  {
    id: "medical-history" as PageType,
    title: "Medical History",
    icon: History,
    // description: "View your medical records",
  },
  {
    id: "insurance" as PageType,
    title: "Insurance",
    icon: Shield,
    // description: "Manage your insurance plans",
  },
  {
    id: "family" as PageType,
    title: "Family & Friends",
    icon: Users,
    // description: "Connect with loved ones",
  },
  {
    id: "er-session" as PageType,
    title: "Emergency",
    icon: AlertTriangle,
    // description: "Emergency services",
  },
];

export function PatientSidebar({
  currentPage,
  onPageChange,
}: PatientSidebarProps) {
  const { toggleSidebar, open } = useSidebar();
  const isOpen = open;
  const router = useRouter();
  return (
    <Sidebar
      className="border-r border-slate-200 bg-white transition-all duration-300"
      collapsible="icon"
      style={
        {
          "--sidebar-width": "16rem",
          "--sidebar-width-icon": "4.5rem",
        } as React.CSSProperties
      }
    >
      <SidebarHeader className="border-b border-slate-100 p-4">
        <div className="flex items-center justify-between">
          <div
            className={`flex items-center gap-2 cursor-pointer hover:opacity-80 transition-all duration-200 ${
              !isOpen ? "justify-center" : ""
            }`}
            onClick={() => onPageChange("chat")}
          >
            {!isOpen && (
              <div className="w-8 h-8 py-2 rounded-lg flex items-center justify-center flex-shrink-0">
                <Link href={"/"}>
                  <Image
                    src={BrandImageSquare}
                    alt="medipal logo square"
                    className="my-2"
                    width={50}
                    height={50}
                  />
                </Link>
              </div>
            )}
            {isOpen && (
              <div className="overflow-hidden">
                <Link href={"/"}>
                  {/*TODO: if mobile show diff logo */}
                  <Image
                    src={BrandImage}
                    alt="medipal logo"
                    width={180}
                    height={200}
                  />
                </Link>
              </div>
            )}
          </div>

          {/* Toggle Button - Always visible */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className={`h-12 w-12 p-0  flex-shrink-0 transition-all duration-200 ${
              !isOpen ? "ml-0" : ""
            }`}
          >
            {isOpen ? (
              <ChevronLeft className="h-4 w-4 text-slate-600" />
            ) : (
              <ChevronRight className="h-4 w-4 text-slate-600" />
            )}
          </Button>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-3 md:p-4">
        <div className="space-y-1 md:space-y-2">
          <SidebarMenu>
            {mainMenuItems.map((item) => (
              <SidebarMenuItem key={item.id}>
                <SidebarMenuButton
                  isActive={currentPage === item.id}
                  onClick={() => onPageChange(item.id)}
                  className={`w-full px-2 md:px-3 rounded-xl transition-all duration-200 ${
                    isOpen ? "h-10 md:h-12" : "h-8 md:h-10 justify-center"
                  } ${
                    currentPage === item.id
                      ? "bg-blue-50 text-blue-700 border border-blue-200 shadow-sm"
                      : "hover:bg-slate-50 text-slate-700"
                  }`}
                  tooltip={!isOpen ? item.title : undefined}
                >
                  <item.icon
                    className={`h-4 w-4 md:h-5 md:w-5 flex-shrink-0 ${
                      currentPage === item.id
                        ? "text-blue-600"
                        : "text-slate-500"
                    }`}
                  />
                  {isOpen && (
                    <div className="flex-1 text-left min-w-0 ml-2 md:ml-3">
                      <div className="font-medium text-xs md:text-sm truncate">
                        {item.title}
                      </div>
                    </div>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </div>
      </SidebarContent>

      <SidebarFooter className="border-t border-slate-100 p-3 md:p-4">
        <SidebarMenuButton
          tooltip={!isOpen ? "Back to home" : undefined}
          onClick={() => {
            //route to home page
            router.push("/");
          }}
          className="mb-2"
        >
          <div className="flex items-center justify-center">
            <ArrowLeft className="h-3 w-3 md:h-4 md:w-4 text-slate-400 mr-2" />
            {isOpen && <span className="text-xs">Back to home</span>}
          </div>
        </SidebarMenuButton>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              isActive={currentPage === "profile"}
              onClick={() => onPageChange("profile")}
              className={`w-full px-2 md:px-3 rounded-xl transition-all duration-200 ${
                isOpen ? "h-12 md:h-14" : "h-8 md:h-10 justify-center"
              } ${
                currentPage === "profile"
                  ? "bg-slate-100 text-slate-800"
                  : "hover:bg-slate-50 text-slate-700"
              }`}
              tooltip={!isOpen ? "My Profile" : undefined}
            >
              <Avatar
                className={`flex-shrink-0 ${
                  isOpen ? "h-6 w-6 md:h-8 md:w-8" : "h-5 w-5 md:h-6 md:w-6"
                }`}
              >
                <AvatarImage src="/placeholder.svg?height=32&width=32" />
                <AvatarFallback className="bg-blue-100 text-blue-700 text-xs md:text-sm font-medium">
                  <Image
                    src={melissa}
                    alt="placeholder"
                    width={32}
                    height={32}
                  />
                </AvatarFallback>
              </Avatar>
              {isOpen && (
                <div className="flex-1 text-left min-w-0 ml-2 md:ml-3">
                  <div className="font-medium text-xs md:text-sm truncate">
                    {user.name}
                  </div>
                  <div className="text-xs text-slate-500 truncate">
                    My Profile
                  </div>
                </div>
              )}
              {isOpen && (
                <User className="h-3 w-3 md:h-4 md:w-4 text-slate-400 flex-shrink-0" />
              )}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
