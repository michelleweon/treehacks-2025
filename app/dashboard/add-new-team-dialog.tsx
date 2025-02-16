"use client";

import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { useState } from "react";

export default function AddNewTeamDialog() {
  // State to control the dialog open/close
  const [open, setOpen] = useState(false);
  // State to track form submission status
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      const form = event.currentTarget;
      const formData = new FormData(form);
      const file = formData.get("zipFile") as File;

      if (!file || !file.name.endsWith(".zip")) {
        throw new Error("Please upload a valid ZIP file");
      }

      const response = await fetch("/api/upload-recordings", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = (await response.json()) as { error: string };
        throw new Error(errorData.error || "Failed to upload file");
      }

      toast({
        title: "Success",
        description: "File uploaded successfully",
      });

      // Store form reference before closing dialog
      form.reset();
      setOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to upload file",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* Dialog trigger button */}
      <DialogTrigger asChild>
        <Button variant="secondary">
          <Icons.add className="mr-3 h-5 w-5" />
          Add New Team
        </Button>
      </DialogTrigger>

      {/* Dialog content */}
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add New Team</DialogTitle>
          <DialogDescription>
            Upload a ZIP file containing AFib, Regular, Irregular, Unclassified, and Metadata files.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="rounded-lg border border-border bg-background p-4">
            <div className="space-y-4">
              <Input type="file" name="zipFile" accept=".zip" disabled={isLoading} className="text-foreground" />
              <div className="text-sm text-muted-foreground">Supported format: .zip</div>
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? "Uploading..." : "Upload"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
