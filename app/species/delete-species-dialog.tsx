"use client"

// Import necessary components and utilities
import { Icons } from "@/components/icons"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"
import { createBrowserSupabaseClient } from "@/lib/client-utils"
import { useRouter } from "next/navigation"
import { useState } from "react"

// Define the props for the DeleteSpeciesDialog component
interface DeleteSpeciesDialogProps {
  speciesId: number // ID of the species to be deleted
}

// Main component for deleting a species
export default function DeleteSpeciesDialog({ speciesId }: DeleteSpeciesDialogProps) {
  const router = useRouter() // Next.js router for navigation and refreshing data
  const [open, setOpen] = useState(false) // State to control dialog visibility
  const [isDeleting, setIsDeleting] = useState(false) // State to track deletion process

  // Function to handle the delete operation
  const handleDelete = async () => {
    try {
      setIsDeleting(true) // Set deletion state to true
      const supabase = createBrowserSupabaseClient() // Create a Supabase client instance

      // Perform delete operation on the 'species' table where the ID matches `speciesId`
      const { error } = await supabase
        .from("species")
        .delete()
        .eq('id', speciesId)

      if (error) throw error // Throw an error if the deletion fails

      setOpen(false) // Close the dialog after successful deletion
      router.refresh() // Refresh the page to reflect changes

      // Show a success toast notification
      toast({
        title: "Species successfully deleted!",
      })
    } catch (error) {
      // Show an error toast notification if something goes wrong
      toast({
        title: "Something went wrong.",
        description: error instanceof Error ? error.message : "An unknown error occurred.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false) // Reset deletion state after completion
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* Trigger button to open the delete dialog */}
      <DialogTrigger asChild>
        <Button variant="destructive" className="w-full">
          <Icons.trash className="mr-3 h-5 w-5" />
          Delete Species
        </Button>
      </DialogTrigger>

      {/* Dialog content */}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete Species</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this species? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        {/* Buttons for confirming or canceling the deletion */}
        <div className="flex gap-3 mt-4">
          {/* Delete button */}
          <Button
            variant="destructive"
            className="flex-1"
            onClick={() => void handleDelete()}
            disabled={isDeleting} // Disable button while deleting
          >
            {isDeleting ? (
              <>
                {/* Spinner icon shown during deletion */}
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete'
            )}
          </Button>

          {/* Cancel button to close the dialog */}
          <DialogClose asChild>
            <Button type="button" variant="secondary" className="flex-1">
              Cancel
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  )
}
