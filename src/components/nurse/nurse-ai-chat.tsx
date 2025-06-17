"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Zap, Mic } from "lucide-react"

interface AIChatProps {
  isOpen: boolean
  onClose: () => void
  totalPatients: number
}

export function AIChat({ isOpen, onClose, totalPatients }: AIChatProps) {
  if (!isOpen) return null

  return (
    <div className="fixed bottom-24 right-6 w-80 h-96 bg-white rounded-lg shadow-2xl border border-gray-200 z-40 flex flex-col">
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-purple-600 to-blue-600 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white">AI Nurse Assistant</h3>
              <p className="text-xs text-purple-100">Ward Overview Context</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-white/20">
            ×
          </Button>
        </div>
      </div>

      <div className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-3">
          <div className="bg-gray-100 rounded-lg p-3">
            <p className="text-sm text-gray-800">
              Hi! I can help you with patient information, care protocols, or answer questions about the current ward
              status. What would you like to know?
            </p>
          </div>
          <div className="text-xs text-gray-500 text-center">
            I can see you&apos;re viewing the Ward Overview with {totalPatients} patients
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-2">
          <Input placeholder="Ask about patients or protocols..." className="flex-1" />
          <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
            <Mic className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
