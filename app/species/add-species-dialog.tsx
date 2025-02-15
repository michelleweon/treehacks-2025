"use client"

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
import { useState } from "react"
import { useForm } from "react-hook-form"
import { SpeciesForm } from "./species-form"
import { type FormData, speciesSchema, defaultValues } from "./species-schema"

// Define the props for the AddSpeciesDialog component
interface AddSpeciesDialogProps {
  userId: string
}

export default function AddSpeciesDialog({ userId }: AddSpeciesDialogProps) {
  const router = useRouter()
  // State to control the dialog open/close
  const [open, setOpen] = useState(false)
  // State to track form submission status
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Initialize the form using react-hook-form with zod schema validation
  const form = useForm<FormData>({
    resolver: zodResolver(speciesSchema),
    defaultValues,
    mode: "onChange",
  })

  // Function to handle form submission
  const onSubmit = async (input: FormData) => {
    try {
      setIsSubmitting(true)
      // Create a Supabase client
      const supabase = createBrowserSupabaseClient()

      // Insert the new species data into the Supabase 'species' table
      const { error } = await supabase
        .from("species")
        .insert([{
          author: userId,
          ...input
        }])

      if (error) throw error

      // Reset the form, close the dialog, and refresh the page
      form.reset(defaultValues)
      setOpen(false)
      router.refresh()

      // Show a success toast notification
      toast({
        title: "New species added!",
        description: `Successfully added ${input.scientific_name}.`
      })
    } catch (error) {
      // Show an error toast notification if something goes wrong
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
        <Button variant="secondary">
          <Icons.add className="mr-3 h-5 w-5" />
          Add Species
        </Button>
      </DialogTrigger>

      {/* Dialog content */}
      <DialogContent className="max-h-screen overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add Species</DialogTitle>
          <DialogDescription>
            Add a new species here. Click &quot;Add Species&quot; below when you&apos;re done.
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
          submitLabel={isSubmitting ? "Adding..." : "Add Species"}
        />
      </DialogContent>
    </Dialog>
  )
}
