import { Check } from "lucide-react";

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

const STEPS = ["Personal", "Passport", "Family", "Security", "Submit"];

export function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
  // Logic to calculate progress line width
  const progressWidth = ((currentStep - 1) / (totalSteps - 1)) * 100;

  return (
    <div className="w-full max-w-4xl mx-auto py-12 px-4">
      <div className="relative flex items-center justify-between">
        
        {/* PROGRESS TRACK CONTAINER */}
        <div className="absolute top-[37px] left-0 w-full h-[3px] bg-slate-100 -translate-y-[18px] z-0">
          {/* ANIMATED FILL LINE */}
          <div 
            className="h-full bg-[#74c044] transition-all duration-700 ease-in-out shadow-[0_0_10px_rgba(79,70,229,0.5)]"
            style={{ width: `${progressWidth}%` }}
          />
        </div>

        {/* STEPS */}
        {STEPS.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isActive = stepNumber === currentStep;

          return (
            <div key={step} className="relative z-10 flex flex-col items-center">
              {/* CIRCLE BLOCK */}
              <div
                className={`
                  relative flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-500 delay-100
                  ${isCompleted 
                    ? "bg-[#74c044] border-[#74c044] text-white shadow-lg" 
                    : isActive 
                    ? "bg-white border-[#74c044] text-[#74c044] ring-[6px] ring-indigo-50" 
                    : "bg-white border-slate-200 text-slate-400"}
                `}
              >
                {/* INNER LINE LOGIC (The line "enters" the circle) */}
                {isCompleted ? (
                  <Check className="h-5 w-5 stroke-[3px] animate-in zoom-in duration-300" />
                ) : (
                  <span className="text-sm font-bold">{stepNumber}</span>
                )}
              </div>

              {/* LABEL */}
              <div className="absolute top-12 whitespace-nowrap">
                <p className={`
                  text-[11px] font-bold uppercase tracking-widest transition-colors duration-300
                  ${isActive ? "text-[#74c044]" : isCompleted ? "text-slate-800" : "text-slate-400"}
                `}>
                  {step}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}