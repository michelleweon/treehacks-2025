"use client"

// Import necessary UI components and types
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import type { Database } from "@/lib/schema"

// Define the `Species` type based on the database schema
type Species = Database["public"]["Tables"]["species"]["Row"]

// Props for the `SpeciesDetail` component
interface SpeciesDetailProps {
  label: string // The label to display (e.g., "Scientific Name")
  value: string | number | null // The value associated with the label (can be null)
  italic?: boolean // Optional flag to render the value in italic
}

// Component to render a single species detail (label and value)
function SpeciesDetail({ label, value, italic }: SpeciesDetailProps) {
  if (value === null) return null // If the value is null, don't render anything

  return (
    <div className="py-2">
      {/* Render the label and value */}
      <p className="flex items-baseline gap-2">
        <span className="font-semibold min-w-32">{label}:</span>
        {/* Apply italic styling if `italic` is true */}
        <span className={italic ? "italic" : ""}>
          {/* Format numbers with commas for better readability */}
          {typeof value === 'number' ? value.toLocaleString() : value}
        </span>
      </p>
    </div>
  )
}

// Props for the `SpeciesDetailsDialog` component
interface SpeciesDetailsDialogProps {
  species: Species // The species object containing its details
}

// Main component to display species details in a dialog
export default function SpeciesDetailsDialog({ species }: SpeciesDetailsDialogProps) {
  // Prepare an array of details to display in the dialog
  const details = [
    { label: "Scientific Name", value: species.scientific_name, italic: true },
    { label: "Common Name", value: species.common_name },
    { label: "Kingdom", value: species.kingdom },
    { label: "Total Population", value: species.total_population },
    { label: "Description", value: species.description },
  ]

  return (
    <Dialog>
      {/* Button to trigger the dialog */}
      <DialogTrigger asChild>
        <Button className="mt-3 w-full">
          Learn More
        </Button>
      </DialogTrigger>

      {/* Dialog content */}
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl">
            Species Details
          </DialogTitle>
        </DialogHeader>

        {/* Render all details using the `SpeciesDetail` component */}
        <div className="space-y-2">
          {details.map(detail => (
            <SpeciesDetail
              key={detail.label} // Use the label as a unique key
              label={detail.label} // Pass the label (e.g., "Scientific Name")
              value={detail.value} // Pass the corresponding value
              italic={detail.italic} // Pass whether the value should be italicized
            />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
