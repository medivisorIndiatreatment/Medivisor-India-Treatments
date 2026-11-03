"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Send } from "lucide-react"

interface FormNavigationProps {
  currentStep: number
  totalSteps: number
  onNext: () => void
  onPrevious: () => void
  onSubmit: () => void
}

export function FormNavigation({ currentStep, totalSteps, onNext, onPrevious, onSubmit }: FormNavigationProps) {
  return (
    <div className="mt-8 flex gap-4">
      <Button
        onClick={onPrevious}
        disabled={currentStep === 1}
        variant="outline"
        className="flex-1 gap-2 bg-gray-200 hover:bg-gray-300 border-gray-400"
      >
        <ChevronLeft className="h-4 w-4" />
        Previous
      </Button>
      {currentStep === totalSteps ? (
        <Button
          onClick={onSubmit}
          className="flex-1 gap-2 bg-[#74c044] hover:from-primary/90 hover:to-primary/70"
        >
          <Send className="h-4 w-4" />
          Submit Application
        </Button>
      ) : (
        <Button
          onClick={onNext}
          className="flex-1 gap-2 text-white bg-[#74c044] hover:from-primary/90 hover:to-primary/70"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}
