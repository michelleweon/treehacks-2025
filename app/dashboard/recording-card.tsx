"use client";
/*
Note: "use client" is a Next.js App Router directive that tells React to render the component as
a client component rather than a server component. This establishes the server-client boundary,
providing access to client-side functionality such as hooks and event handlers to this component and
any of its imported children. Although the SpeciesCard component itself does not use any client-side
functionality, it is beneficial to move it to the client because it is rendered in a list with a unique
key prop in species/page.tsx. When multiple component instances are rendered from a list, React uses the unique key prop
on the client-side to correctly match component state and props should the order of the list ever change.
React server components don't track state between rerenders, so leaving the uniquely identified components (e.g. SpeciesCard)
can cause errors with matching props and state in child components if the list order changes.
*/
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface RecordingCardProps {
  recordings: {
    sample_index: number;
    green: number | null;
    red: number | null;
    ir: number | null;
    acc_x: number | null;
    acc_y: number | null;
    acc_z: number | null;
  }[];
  type: "afib" | "irregular" | "regular" | "unclassified";
}

export default function RecordingCard({ recordings, type }: RecordingCardProps) {
  const filename = recordings[0]?.filename ?? "N/A";

  // Transform all recordings data for the chart
  const chartData = recordings.map((recording, index) => ({
    index,
    green: recording.green,
    red: recording.red,
    ir: recording.ir,
  }));

  // Calculate averages for sensor data
  const averages = {
    green: recordings.reduce((sum, r) => sum + (r.green ?? 0), 0) / recordings.length,
    red: recordings.reduce((sum, r) => sum + (r.red ?? 0), 0) / recordings.length,
    ir: recordings.reduce((sum, r) => sum + (r.ir ?? 0), 0) / recordings.length,
    acc_x: recordings.reduce((sum, r) => sum + (r.acc_x ?? 0), 0) / recordings.length,
    acc_y: recordings.reduce((sum, r) => sum + (r.acc_y ?? 0), 0) / recordings.length,
    acc_z: recordings.reduce((sum, r) => sum + (r.acc_z ?? 0), 0) / recordings.length,
  };

  return (
    <div className="rounded-lg border border-border bg-background p-4 shadow-sm">
      {/* Header */}
      <div className="mb-4">
        <h4 className="text-lg font-semibold text-foreground">
          {filename}
          <span
            className={`ml-2 text-sm ${
              type === "afib"
                ? "text-red-600"
                : type === "irregular"
                  ? "text-yellow-600"
                  : type === "unclassified"
                    ? "text-blue-600"
                    : "text-green-600"
            }`}
          >
            ({type.toUpperCase()})
          </span>
        </h4>
        <p className="text-sm text-muted-foreground">Samples: {recordings.length}</p>
      </div>

      {/* Average Sensor Data */}
      <div className="mb-4 grid grid-cols-2 gap-2 text-sm">
        <div>
          <p className="font-medium text-foreground">Avg Green:</p>
          <p className="text-muted-foreground">{averages.green.toFixed(2)}</p>
        </div>
        <div>
          <p className="font-medium text-foreground">Avg Red:</p>
          <p className="text-muted-foreground">{averages.red.toFixed(2)}</p>
        </div>
        <div>
          <p className="font-medium text-foreground">Avg IR:</p>
          <p className="text-muted-foreground">{averages.ir.toFixed(2)}</p>
        </div>
      </div>

      {/* Average Accelerometer Data */}
      <div className="mb-4">
        <h5 className="mb-2 font-medium text-foreground">Average Accelerometer</h5>
        <div className="grid grid-cols-3 gap-2 text-sm">
          <div>
            <p className="text-muted-foreground">X:</p>
            <p className="text-foreground">{averages.acc_x.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Y:</p>
            <p className="text-foreground">{averages.acc_y.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Z:</p>
            <p className="text-foreground">{averages.acc_z.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Time Series Chart */}
      <div className="h-32 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="index" stroke="currentColor" />
            <YAxis stroke="currentColor" />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--background)",
                borderColor: "var(--border)",
                color: "var(--foreground)",
              }}
            />
            <Line type="monotone" dataKey="green" stroke="#22c55e" strokeWidth={2} name="Green" />
            <Line type="monotone" dataKey="red" stroke="#ef4444" strokeWidth={2} name="Red" />
            <Line type="monotone" dataKey="ir" stroke="#8884d8" strokeWidth={2} name="IR" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
