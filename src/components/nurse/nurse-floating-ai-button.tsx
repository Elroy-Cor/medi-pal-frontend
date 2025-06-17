"use client"

import { Button } from "@/components/ui/button"
import { MessageCircle } from "lucide-react"

interface FloatingAIButtonProps {
  onClick: () => void
}

export function FloatingAIButton({ onClick }: FloatingAIButtonProps) {
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Button
        onClick={onClick}
        className="w-14 h-14 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-200"
      >
        <MessageCircle className="w-6 h-6 text-white" />
      </Button>
    </div>
  )
}
