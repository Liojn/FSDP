// lib/schemas/recommendationSchema.ts

import { z } from "zod";
import { CategoryType } from "@/types";



// Updated Zod Schema with implementationSteps
export const createRecommendationSchema = z.object({
  userId: z.string().nonempty("User ID is required."),
  title: z.string().nonempty("Title is required."),
  description: z.string().nonempty("Description is required."),
  scope: z.string().nonempty("At least one scope must be selected."),
  impact: z.string().nonempty("Impact is required."),
  category: z.nativeEnum(CategoryType, {
    errorMap: () => ({ message: "Invalid category selected." }),
  }),
  estimatedEmissionReduction: z
    .number({
      invalid_type_error: "Estimated Emission Reduction must be a number.",
    })
    .min(0, "Estimated Emission Reduction cannot be negative."),
  priorityLevel: z.enum(["Low", "Medium", "High"], {
    errorMap: () => ({ message: "Invalid priority level." }),
  }),
  difficulty: z.enum(["Easy", "Moderate", "Hard"], {
    errorMap: () => ({ message: "Invalid difficulty." }),
  }),
  estimatedTimeframe: z.string().nonempty("Estimated timeframe is required."),
  implementationSteps: z
    .array(z.string().nonempty("Implementation step cannot be empty."))
    .min(1, "At least one implementation step is required."),
});




