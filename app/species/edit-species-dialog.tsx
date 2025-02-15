"use client"

// Import necessary components and utilities
import { Icons } from "@/components/icons"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"
import { createBrowserSupabaseClient } from "@/lib/client-utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { SpeciesForm } from "./species-form"
import { type FormData, speciesSchema } from "./species-schema"
import type { Database } from "@/lib/schema"

// Define the Species type based on the database schema
type Species = Database["public"]["Tables"]["species"]["Row"]

// Define props for the EditSpeciesDialog component
interface EditSpeciesDialogProps {
  species: Species
}

export default function EditSpeciesDialog({ species }: EditSpeciesDialogProps) {
  const router = useRouter()
  // State to control dialog visibility
  const [open, setOpen] = useState(false)
  // State to track form submission status
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Initialize form with react-hook-form and zod validation
  const form = useForm<FormData>({
    resolver: zodResolver(speciesSchema),
    defaultValues: {
      scientific_name: species.scientific_name,
      common_name: species.common_name,
      kingdom: species.kingdom,
      total_population: species.total_population,
      image: species.image,
      description: species.description,
    },
    mode: "onChange",
  })

  // Reset form when species prop changes
  useEffect(() => {
    form.reset(species)
  }, [species, form])

  // Function to handle form submission
  const onSubmit = async (input: FormData) => {
    try {
      setIsSubmitting(true)
      const supabase = createBrowserSupabaseClient()

      // Update the species data in the Supabase 'species' table
      const { error } = await supabase
        .from("species")
        .update(input)
        .eq('id', species.id)
        .select()

      if (error) throw error

      // Close dialog, refresh page, and show success toast
      setOpen(false)
      router.refresh()
      toast({
        title: "Species edited!",
        description: `Successfully edited ${input.scientific_name}.`,
      })
    } catch (error) {
      // Show error toast if something goes wrong
      toast({
        title: "Something went wrong.",
        description: error instanceof Error ? error.message : "An unknown error occurred.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* Dialog trigger button */}
      <DialogTrigger asChild>
        <Button variant="secondary" className="w-full">
          <Icons.page className="mr-3 h-5 w-5" />
          Edit Species
        </Button>
      </DialogTrigger>

      {/* Dialog content */}
      <DialogContent className="max-h-screen overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Species</DialogTitle>
          <DialogDescription>
            Edit species here. Click &quot;Edit Species&quot; below when you&apos;re done.
          </DialogDescription>
        </DialogHeader>

        {/* Species form component */}
        <SpeciesForm
          form={form}
          onSubmit={(e) => {
            e.preventDefault()
            if (isSubmitting) return
            void form.handleSubmit(onSubmit)(e)
          }}
          submitLabel={isSubmitting ? "Saving..." : "Edit Species"}
        />
      </DialogContent>
    </Dialog>
  )
}
