import { Separator } from "@/components/ui/separator";
import { TypographyH2 } from "@/components/ui/typography";
import { createServerSupabaseClient } from "@/lib/server-utils";
import { redirect } from "next/navigation";
import RecordingCard from "./recording-card";
import AddNewTeamDialog from "./add-new-team-dialog";

export default async function Dashboard() {
  const supabase = createServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/");
  }

  // Get data from all three tables
  const { data: afib } = await supabase.from("afib").select("*").order("sample_index", { ascending: false });

  const { data: irregular } = await supabase.from("irregular").select("*").order("sample_index", { ascending: false });

  const { data: regular } = await supabase.from("regular").select("*").order("sample_index", { ascending: false });

  const { data: unclassified } = await supabase.from("unclassified").select("*").order("sample_index", { ascending: false });

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
        <TypographyH2>Heart Activity</TypographyH2>
        {<AddNewTeamDialog />}
      </div>
      <Separator className="my-4" />

      {/* Recording Type Sections */}
      <div className="space-y-8">
        {/* Regular Section */}
        <section>
          <h3 className="mb-4 text-xl font-semibold">Regular</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Object.entries(regularByFile).map(([filename, recordings]) => (
              <RecordingCard key={filename} recordings={recordings} type="regular" />
            ))}
          </div>
        </section>

        {/* Irregular Section */}
        <section>
          <h3 className="mb-4 text-xl font-semibold">Irregular</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Object.entries(irregularByFile).map(([filename, recordings]) => (
              <RecordingCard key={filename} recordings={recordings} type="irregular" />
            ))}
          </div>
        </section>

        {/* AFib Section */}
        <section>
          <h3 className="mb-4 text-xl font-semibold">Atrial Fibrillation (AFib)</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Object.entries(afibByFile).map(([filename, recordings]) => (
              <RecordingCard key={filename} recordings={recordings} type="afib" />
            ))}
          </div>
        </section>

        {/* AFib Section */}
          <section>
          <h3 className="mb-4 text-xl font-semibold">Unclassified</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Object.entries(unclassifiedByFile).map(([filename, recordings]) => (
              <RecordingCard key={filename} recordings={recordings} type="unclassified" />
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
