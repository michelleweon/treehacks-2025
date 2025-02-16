"use client";

// Import necessary UI components and types
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface MetadataInfo {
  filename: string;
  sinus: number | null;
  bradycardia: number | null;
  tachycardia: number | null;
  brady_episode: number | null;
  increased_hrv: number | null;
  tachy_episode: number | null;
  atrial_flutter: number | null;
  atrial_fibrillation: number | null;
  extrasystoles_bigminy: number | null;
  extrasystoles_frequent: number | null;
  extrasystoles_isolated: number | null;
  extrasystoles_trigeminy: number | null;
  extrasystoles_big_episode: number | null;
  extrasystoles_trig_episode: number | null;
}

interface RecordingDetailProps {
  label: string;
  value: number | null;
}

// Component to render a single recording detail
function RecordingDetail({ label, value }: RecordingDetailProps) {
  if (value === null) return null;

  return (
    <div className="py-2">
      <p className="flex items-baseline gap-2">
        <span className="min-w-32 font-semibold">{label}:</span>
        <span>{value.toFixed(2)}%</span>
      </p>
    </div>
  );
}

interface SeeMoreDialogProps {
  filename: string;
  metadata: MetadataInfo;
}

// Main component to display metadata information in a dialog
export default function SeeMoreDialog({ filename, metadata }: SeeMoreDialogProps) {
  const details = [
    { label: "Sinus Rhythm", value: metadata.sinus },
    { label: "Bradycardia", value: metadata.bradycardia },
    { label: "Tachycardia", value: metadata.tachycardia },
    { label: "Brady Episodes", value: metadata.brady_episode },
    { label: "Increased HRV", value: metadata.increased_hrv },
    { label: "Tachy Episodes", value: metadata.tachy_episode },
    { label: "Atrial Flutter", value: metadata.atrial_flutter },
    { label: "Atrial Fibrillation", value: metadata.atrial_fibrillation },
    { label: "Extrasystoles Bigminy", value: metadata.extrasystoles_bigminy },
    { label: "Extrasystoles Frequent", value: metadata.extrasystoles_frequent },
    { label: "Extrasystoles Isolated", value: metadata.extrasystoles_isolated },
    { label: "Extrasystoles Trigeminy", value: metadata.extrasystoles_trigeminy },
    { label: "Extrasystoles Big Episode", value: metadata.extrasystoles_big_episode },
    { label: "Extrasystoles Trig Episode", value: metadata.extrasystoles_trig_episode },
  ];

  return (
    <Dialog>
      {/* Button to trigger the dialog */}
      <DialogTrigger asChild>
        <Button className="mt-3 w-full">View Metadata</Button>
      </DialogTrigger>

      {/* Dialog content */}
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl">Recording Metadata</DialogTitle>
          <p className="text-sm text-muted-foreground">{filename}</p>
        </DialogHeader>

        {/* Render all details using the `RecordingDetail` component */}
        <div className="space-y-2">
          {details.map((detail) => (
            <RecordingDetail key={detail.label} label={detail.label} value={detail.value} />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
