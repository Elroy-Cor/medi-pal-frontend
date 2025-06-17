import { Check, Clock, ArrowRight } from "lucide-react"
import { getStageIcon } from "@/utils/nurse/nurseUtils"

interface TreatmentTimelineProps {
  prevStage: string
  currentStage: string
  nextStage: string
}

export function TreatmentTimeline({ prevStage, currentStage, nextStage }: TreatmentTimelineProps) {
  const isComplete = nextStage === "Complete"

  return (
    <div className="w-full">
      <h4 className="text-sm font-semibold text-gray-900 mb-3">Treatment Progress</h4>

      <div className="relative flex items-center justify-between">
        {/* Previous Stage - Completed */}
        <div className="flex flex-col items-center space-y-2 flex-1">
          <div className="relative">
            <div className="w-10 h-10 bg-green-100 border-2 border-green-500 rounded-full flex items-center justify-center">
              <Check className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <div className="text-center">
            <p className="text-xs font-medium text-green-700">Completed</p>
            <p className="text-xs text-gray-600 max-w-20 leading-tight">{prevStage}</p>
          </div>
        </div>

        {/* Connection Line 1 */}
        <div className="flex-1 h-0.5 bg-green-300 mx-2 relative">
          <ArrowRight className="absolute right-0 top-1/2 transform -translate-y-1/2 w-3 h-3 text-green-500" />
        </div>

        {/* Current Stage - Active */}
        <div className="flex flex-col items-center space-y-2 flex-1">
          <div className="relative">
            <div className="w-12 h-12 bg-blue-100 border-3 border-blue-500 rounded-full flex items-center justify-center shadow-lg">
              {getStageIcon(currentStage)}
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            </div>
          </div>
          <div className="text-center">
            <p className="text-xs font-semibold text-blue-700">Current</p>
            <p className="text-xs text-gray-900 font-medium max-w-20 leading-tight">{currentStage}</p>
          </div>
        </div>

        {/* Connection Line 2 */}
        <div className={`flex-1 h-0.5 mx-2 relative ${isComplete ? "bg-gray-200" : "bg-gray-300"}`}>
          {!isComplete && (
            <ArrowRight className="absolute right-0 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400" />
          )}
        </div>

        {/* Next Stage - Upcoming or Complete */}
        <div className="flex flex-col items-center space-y-2 flex-1">
          <div className="relative">
            {isComplete ? (
              <div className="w-10 h-10 bg-green-100 border-2 border-green-500 rounded-full flex items-center justify-center">
                <Check className="w-5 h-5 text-green-600" />
              </div>
            ) : (
              <div className="w-10 h-10 bg-gray-100 border-2 border-gray-300 rounded-full flex items-center justify-center">
                <Clock className="w-4 h-4 text-gray-400" />
              </div>
            )}
          </div>
          <div className="text-center">
            <p className={`text-xs font-medium ${isComplete ? "text-green-700" : "text-gray-500"}`}>
              {isComplete ? "Complete" : "Next"}
            </p>
            <p
              className={`text-xs max-w-20 leading-tight ${isComplete ? "text-green-600 font-medium" : "text-gray-500"}`}
            >
              {nextStage}
            </p>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-4 w-full bg-gray-200 rounded-full h-1.5">
        <div
          className="bg-gradient-to-r from-green-500 to-blue-500 h-1.5 rounded-full transition-all duration-500"
          style={{ width: isComplete ? "100%" : "50%" }}
        ></div>
      </div>
    </div>
  )
}
