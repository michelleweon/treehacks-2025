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
  type: "afib" | "irregular" | "regular";
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
    <div className="bg-white rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-lg font-semibold">{filename}</h4>
          <p className="text-sm text-gray-500">Samples: {recordings.length}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm ${
          type === "afib"
            ? "bg-red-100 text-red-600"
            : type === "irregular"
            ? "bg-yellow-100 text-yellow-600"
            : "bg-green-100 text-green-600"
        }`}>
          {type.toUpperCase()}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="bg-gray-50 p-3 rounded">
          <p className="text-sm text-gray-500">Avg Green</p>
          <p className="text-lg font-semibold">{averages.green.toFixed(1)}</p>
        </div>
        <div className="bg-gray-50 p-3 rounded">
          <p className="text-sm text-gray-500">Avg Red</p>
          <p className="text-lg font-semibold">{averages.red.toFixed(1)}</p>
        </div>
        <div className="bg-gray-50 p-3 rounded">
          <p className="text-sm text-gray-500">Avg IR</p>
          <p className="text-lg font-semibold">{averages.ir.toFixed(1)}</p>
        </div>
      </div>

      <div className="h-32">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="index" tick={false} />
            <YAxis tick={false} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="green"
              stroke="#22c55e"
              strokeWidth={1.5}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="red"
              stroke="#ef4444"
              strokeWidth={1.5}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="ir"
              stroke="#8884d8"
              strokeWidth={1.5}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
