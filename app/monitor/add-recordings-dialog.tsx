"use client";

import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

export default function AddRecordingsDialog() {
  const [zipFile, setZipFile] = useState<File | null>(null);
  const { toast } = useToast();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!zipFile) {
      toast({
        title: "Error",
        description: "Please select a file",
        variant: "destructive",
      });
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", zipFile);

      const uploadResponse = await fetch("/api/upload-recordings", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error(`Upload failed: ${uploadResponse.statusText}`);
      }

      const result = await uploadResponse.json();

      toast({
        title: "Success",
        description: "File uploaded successfully",
      });
    } catch (error) {
      console.error("Error uploading recordings:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to upload file",
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <input
        type="file"
        accept=".zip"
        onChange={(e) => setZipFile(e.target.files?.[0] || null)}
      />
      <button type="submit">Upload</button>
    </form>
  );
}
