import { StepProgressProps } from "../types";

export const StepIndicator: React.FC<StepProgressProps> = ({
  currentStep,
  totalSteps,
}) => {
  return (
    <div className="m-8">
      <div className="relative flex justify-between">
        {/* Line connector */}
        <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-lime-200 -z-10" />

        {[...Array(totalSteps)].map((_, index) => (
          <div key={index} className="flex flex-col items-center gap-2">
            {/* Circle with number */}
            <div
              className={`
                w-10 h-10 rounded-full flex items-center justify-center 
                font-semibold text-sm border-2 
                ${
                  index + 1 <= currentStep
                    ? "bg-lime-500 border-lime-500 text-white"
                    : "bg-white border-lime-200 text-lime-500"
                }
              `}
            >
              {index + 1}
            </div>
            {/* Step label */}
            <span
              className={`text-sm ${
                index + 1 <= currentStep ? "text-lime-700" : "text-gray-400"
              }`}
            >
              {index === 0 ? "Company" : index === 1 ? "Goals" : "Reporting"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
