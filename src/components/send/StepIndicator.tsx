import { cn } from "@/lib/utils";

export const StepIndicator = ({
  steps,
  currentStep,
  onStepClick,
}: {
  steps: number;
  currentStep: number;
  onStepClick: (step: number) => void;
}) => {
  return (
    <div className="flex justify-between mb-8">
      {Array.from({ length: steps }).map((_, index) => (
        <div
          key={index}
          className={`flex items-center ${index !== steps - 1 ? "flex-1" : ""}`}
        >
          <button
            onClick={() => onStepClick(index + 1)}
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
              index + 1 <= currentStep
                ? "bg-primary text-black cursor-pointer"
                : "bg-gray-500 text-black cursor-not-allowed"
            )}
            disabled={index + 1 > currentStep}
          >
            {index + 1}
          </button>
          {index !== steps - 1 && (
            <div
              className={`flex-1 h-1 mx-2 ${
                index + 1 < currentStep ? "bg-primary" : "bg-gray-200"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
};