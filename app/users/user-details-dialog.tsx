"use client"; // Indicates that this is a client-side component

// Import necessary UI components
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Database } from "@/lib/schema";

// Define the User type based on the database schema
type User = Database["public"]["Tables"]["profiles"]["Row"];

// Props interface for the UserDetailsDialog component
interface UserDetailsDialogProps {
  user: User;
  buttonClassName?: string; // Optional class name for the trigger button
}

// Props interface for the UserField component
interface UserFieldProps {
  label: string;
  value: string | null;
  isItalic?: boolean; // Optional flag to render the value in italic
}

// Component to render a single user detail (label and value)
const UserField = ({ label, value, isItalic = false }: UserFieldProps) => (
  <div className="mb-4">
    <p>
      <span className="font-semibold">{label}: </span>
      <span className={isItalic ? "italic" : ""}>
        {value ?? "Not provided"} {/* Display "Not provided" if value is null */}
      </span>
    </p>
  </div>
);

// Main component to display user details in a dialog
export default function UserDetailsDialog({
  user,
  buttonClassName = "mt-3 w-full" // Default button class
}: UserDetailsDialogProps) {
  return (
    <Dialog>
      {/* Button to trigger the dialog */}
      <DialogTrigger asChild>
        <Button className={buttonClassName} variant="secondary">
          See More
        </Button>
      </DialogTrigger>

      {/* Dialog content */}
      <DialogContent className="max-h-screen overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
        </DialogHeader>

        {/* User details section */}
        <div className="mt-4 space-y-2">
          {/* Display user's name */}
          <UserField
            label="Name"
            value={user.display_name}
          />
          {/* Display user's email (in italic) */}
          <UserField
            label="Email"
            value={user.email}
            isItalic
          />
          {/* Display user's biography */}
          <UserField
            label="Bio"
            value={user.biography}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
