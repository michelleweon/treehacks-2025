import { z } from "zod" // Import Zod for schema validation

// Define a Zod enum for valid kingdoms
export const kingdoms = z.enum([
  "Animalia",
  "Plantae",
  "Fungi",
  "Protista",
  "Archaea",
  "Bacteria"
])

// Define a schema for species data using Zod
export const speciesSchema = z.object({
  // Scientific name: required string with at least one character, trimmed of whitespace
  scientific_name: z.string().trim().min(1),

  // Common name: optional string, transformed to null if empty or whitespace-only
  common_name: z.string().nullable().transform(val =>
    !val || val.trim() === "" ? null : val.trim()
  ),

  // Kingdom: must be one of the predefined values in the `kingdoms` enum
  kingdom: kingdoms,

  // Total population: optional positive integer greater than or equal to 1, or null
  total_population: z.number().int().positive().min(1).nullable(),

  // Image URL: optional string that must be a valid URL, transformed to null if empty or whitespace-only
  image: z.string().url().nullable().transform(val =>
    !val || val.trim() === "" ? null : val.trim()
  ),

  // Description: optional string, transformed to null if empty or whitespace-only
  description: z.string().nullable().transform(val =>
    !val || val.trim() === "" ? null : val.trim()
  ),
})

// Export the TypeScript type inferred from the `speciesSchema`
// This ensures type safety when working with species data throughout the application
export type FormData = z.infer<typeof speciesSchema>

// Define default values for the form fields, matching the schema's structure and types
export const defaultValues: FormData = {
  scientific_name: "",       // Default to an empty string for scientific name
  common_name: null,         // Default to null for common name (optional field)
  kingdom: "Animalia",       // Default to "Animalia" as the kingdom
  total_population: null,    // Default to null for total population (optional field)
  image: null,               // Default to null for image URL (optional field)
  description: null          // Default to null for description (optional field)
}
