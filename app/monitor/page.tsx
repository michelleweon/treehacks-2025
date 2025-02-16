import { Separator } from "@/components/ui/separator";
import { TypographyH2 } from "@/components/ui/typography";
import { createServerSupabaseClient } from "@/lib/server-utils";
import { redirect } from "next/navigation";
import RecordingCard from "./recording-card";
import AddNewTeamDialog from "./add-new-team-dialog";
import type { Database } from "@/types/supabase";
import AnalysisCard from "./analysis-card";
import GraphCard from "./graph-card";

export default async function Dashboard() {
  const supabase = createServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/");
  }

  // Get data from all tables including metadata
  const { data: afib } = await supabase.from("afib").select("*").order("sample_index", { ascending: false });
  const { data: irregular } = await supabase.from("irregular").select("*").order("sample_index", { ascending: false });
  const { data: regular } = await supabase.from("regular").select("*").order("sample_index", { ascending: false });
  const { data: unclassified } = await supabase.from("unclassified").select("*").order("sample_index", { ascending: false });
  const { data: metadata } = await supabase.from("metadata").select("*");

  // Create a map of filename to metadata for easier lookup
  const metadataByFile = (metadata || []).reduce<Record<string, Database["public"]["Tables"]["metadata"]["Row"]>>(
    (acc, meta) => {
      if (meta.filename) {
        acc[meta.filename] = meta;
      }
      return acc;
    },
    {}
  );

  // Group data by filename for each type
  const groupRecordingsByFile = (recordings: any[]) => {
    return recordings?.reduce((acc, recording) => {
      const filename = recording.filename || "unknown";
      if (!acc[filename]) {
        acc[filename] = [];
      }
      acc[filename].push(recording);
      return acc;
    }, {});
  };

  const afibByFile = groupRecordingsByFile(afib || []);
  const irregularByFile = groupRecordingsByFile(irregular || []);
  const regularByFile = groupRecordingsByFile(regular || []);
  const unclassifiedByFile = groupRecordingsByFile(unclassified || []);
  return (
    <>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <TypographyH2>Team Monitor</TypographyH2>
        {<AddNewTeamDialog />}
      </div>
      <Separator className="my-4" />

      {/* Recording Type Sections */}
      <div className="space-y-8">
        {/* Regular Section */}
        <section>
          <h3 className="mb-4 text-xl font-semibold">Regular Heartbeat</h3>
          <div className="grid grid-cols-1 gap-4">
            {Object.entries(regularByFile).map(([filename, recordings]) => (
              <div key={filename} className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <RecordingCard
                  recordings={recordings}
                  type="regular"
                  metadata={metadataByFile[filename]}
                />
                <AnalysisCard
                  recordings={recordings}
                  type="regular"
                  metadata={metadataByFile[filename]}
                />
                <GraphCard
                  recordings={recordings}
                  type="regular"
                  metadata={metadataByFile[filename]}
                />
              </div>
            ))}
          </div>
        </section>

        {/* Irregular Section */}
        <section>
          <h3 className="mb-4 text-xl font-semibold">Irregular Heartbeat</h3>
          <div className="grid grid-cols-1 gap-4">
            {Object.entries(irregularByFile).map(([filename, recordings]) => (
              <div key={filename} className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <RecordingCard
                  recordings={recordings}
                  type="irregular"
                  metadata={metadataByFile[filename]}
                />
                <AnalysisCard
                  recordings={recordings}
                  type="irregular"
                  metadata={metadataByFile[filename]}
                />
                <GraphCard
                  recordings={recordings}
                  type="irregular"
                  metadata={metadataByFile[filename]}
                />
              </div>
            ))}
          </div>
        </section>

        {/* AFib Section */}
        <section>
          <h3 className="mb-4 text-xl font-semibold">Atrial Fibrillation (AFib) Heartbeat</h3>
          <div className="grid grid-cols-1 gap-4">
            {Object.entries(afibByFile).map(([filename, recordings]) => (
              <div key={filename} className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <RecordingCard
                  recordings={recordings}
                  type="afib"
                  metadata={metadataByFile[filename]}
                />
                <AnalysisCard
                  recordings={recordings}
                  type="afib"
                  metadata={metadataByFile[filename]}
                />
                <GraphCard
                  recordings={recordings}
                  type="afib"
                  metadata={metadataByFile[filename]}
                />
              </div>
            ))}
          </div>
        </section>

        {/* Unclassified Section */}
        <section>
          <h3 className="mb-4 text-xl font-semibold">Unclassified Heartbeat</h3>
          <div className="grid grid-cols-1 gap-4">
            {Object.entries(unclassifiedByFile).map(([filename, recordings]) => (
              <div key={filename} className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <RecordingCard
                  recordings={recordings}
                  type="unclassified"
                  metadata={metadataByFile[filename]}
                />
                <AnalysisCard
                  recordings={recordings}
                  type="unclassified"
                  metadata={metadataByFile[filename]}
                />
                <GraphCard
                  recordings={recordings}
                  type="unclassified"
                  metadata={metadataByFile[filename]}
                />
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
