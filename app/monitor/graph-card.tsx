"use client";

import type { Database } from "@/types/supabase";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface GraphCardProps {
  recordings: {
    filename: string;
    sample_index: number;
    green: number | null;
    red: number | null;
    ir: number | null;
    acc_x: number | null;
    acc_y: number | null;
    acc_z: number | null;
  }[];
  metadata: Database["public"]["Tables"]["metadata"]["Row"] | undefined;
  type: "afib" | "irregular" | "regular" | "unclassified";
}

export default function GraphCard({ recordings, metadata, type }: GraphCardProps) {
  if (!metadata) return null;

  // Prepare metadata for bar chart
  const metadataChartData = [
    { name: "AFib", value: metadata.atrial_fibrillation ?? 0 },
    { name: "Brady", value: metadata.bradycardia ?? 0 },
    { name: "Tachy", value: metadata.tachycardia ?? 0 },
    { name: "Extrasys", value: metadata.extrasystoles_frequent ?? 0 },
  ];

  // Prepare time series data
  const timeSeriesData = recordings.map((rec, index) => ({
    index,
    green: rec.green ?? 0,
    red: rec.red ?? 0,
    ir: rec.ir ?? 0,
  }));

  // Prepare motion data
  const motionData = recordings.map((rec, index) => ({
    index,
    x: rec.acc_x ?? 0,
    y: rec.acc_y ?? 0,
    z: rec.acc_z ?? 0,
  }));

  return (
    <div className="rounded-lg border border-border bg-background p-4 shadow-sm">
      {/* Header */}
      <div className="mb-4">
        <h4 className="text-lg font-semibold text-foreground">Signal Analysis</h4>
        <p className="text-sm text-muted-foreground">Visual representation of key metrics</p>
      </div>

      {/* Metadata Bar Chart */}
      <div className="mb-6">
        <h5 className="mb-2 font-medium text-foreground">Classification Distribution (%)</h5>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={metadataChartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="name" stroke="currentColor" />
              <YAxis stroke="currentColor" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--background)",
                  borderColor: "var(--border)",
                }}
              />
              <Bar
                dataKey="value"
                fill={
                  type === "afib"
                    ? "rgb(239 68 68)"
                    : type === "irregular"
                      ? "rgb(234 179 8)"
                      : type === "unclassified"
                        ? "rgb(59 130 246)"
                        : "rgb(34 197 94)"
                }
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Sensor Signals Line Chart */}
      <div className="mb-6">
        <h5 className="mb-2 font-medium text-foreground">Sensor Signals</h5>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={timeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="index" stroke="currentColor" />
              <YAxis stroke="currentColor" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--background)",
                  borderColor: "var(--border)",
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="green" stroke="#22c55e" dot={false} />
              <Line type="monotone" dataKey="red" stroke="#ef4444" dot={false} />
              <Line type="monotone" dataKey="ir" stroke="#8884d8" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Motion Data Line Chart */}
      <div>
        <h5 className="mb-2 font-medium text-foreground">Accelerometer Data</h5>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={motionData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="index" stroke="currentColor" />
              <YAxis stroke="currentColor" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--background)",
                  borderColor: "var(--border)",
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="x" stroke="#22c55e" dot={false} />
              <Line type="monotone" dataKey="y" stroke="#ef4444" dot={false} />
              <Line type="monotone" dataKey="z" stroke="#8884d8" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
