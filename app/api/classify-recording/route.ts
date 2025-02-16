import type { Database } from "@/types/supabase";
import { createClient } from "@supabase/supabase-js";
import { OpenAI } from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { sleep } from "@/lib/utils";

// Check environment variables
if (!process.env.OPENAI_API_KEY || !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing required environment variables");
}

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
);

if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing OPENAI_API_KEY environment variable");
}

// Use the key safely
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface Recording {
  filename: string;
  sample_index: number;
  green: number | null;
  red: number | null;
  ir: number | null;
  acc_x: number | null;
  acc_y: number | null;
  acc_z: number | null;
}

type Classification = "regular" | "irregular" | "afib" | "unclassified";

const queue = new Set();
const MAX_CONCURRENT = 3;

export async function POST(request: Request) {
  const id = Math.random().toString(36);

  while (queue.size >= MAX_CONCURRENT) {
    await sleep(1000);
  }

  queue.add(id);
  try {
    if (!process.env.OPENAI_API_KEY) {
      return Response.json({ error: "OpenAI API key not configured" }, { status: 500 });
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return Response.json({ error: "Supabase credentials not configured" }, { status: 500 });
    }

    try {
      const { recordings, metadata } = (await request.json()) as {
        recordings: Recording[];
        metadata: Database["public"]["Tables"]["metadata"]["Row"];
      };

      if (!recordings.length) {
        return Response.json({ error: "No recordings provided" }, { status: 400 });
      }

      const filename = recordings[0]?.filename;

      // Check cache first
      const { data: cached } = await supabase
        .from("ai_classifications")
        .select("*")
        .eq("filename", filename)
        .single();

      if (cached) {
        return Response.json({
          classification: cached.classification,
          confidence: cached.confidence,
        });
      }

      // Prepare data for OpenAI
      const dataDescription = `
        Recording Analysis:
        - Total Samples: ${recordings.length}
        - Duration: ${recordings.length / 100}s
        - AFib: ${metadata.atrial_fibrillation ?? 0}%
        - Bradycardia: ${metadata.bradycardia ?? 0}%
        - Tachycardia: ${metadata.tachycardia ?? 0}%
        - Extrasystoles: ${metadata.extrasystoles_frequent ?? 0}%

        Signal Statistics:
        - Average IR: ${calculateAverage(recordings.map((r) => r.ir))}
        - Average Motion: ${calculateMotionIntensity(recordings)}
        - Heart Rate Variability: ${calculateHRV(recordings.map((r) => r.ir).filter(Boolean))}
      `;

      const messages: ChatCompletionMessageParam[] = [
        {
          role: "system",
          content:
            "You are a medical AI assistant that classifies heart recordings as regular, irregular, afib, or unclassified. Respond only with one of these classifications.",
        },
        {
          role: "user",
          content: dataDescription,
        },
      ];

      // Add retry logic
      const maxRetries = 3;
      let retryCount = 0;
      let completion;

      while (retryCount < maxRetries) {
        try {
          completion = await openai.chat.completions.create({
            messages,
            model: "gpt-3.5-turbo",
            max_tokens: 10,
            temperature: 0.1,
          });
          break; // Success, exit loop
        } catch (error: any) {
          if (error?.code === 'rate_limit_exceeded') {
            retryCount++;
            if (retryCount === maxRetries) throw error;
            // Wait 20 seconds before retrying
            await sleep(20000);
            continue;
          }
          throw error; // Re-throw other errors
        }
      }

      const content = completion.choices[0]?.message?.content?.toLowerCase() ?? "unclassified";
      const classification = validateClassification(content);
      const confidence = completion.choices[0]?.finish_reason === "stop" ? 1 : 0.5;

      try {
        await supabase.from("ai_classifications").upsert({
          filename: recordings[0].filename,
          classification,
          confidence,
          timestamp: new Date().toISOString(),
        });
      } catch (dbError) {
        console.error("Failed to store classification:", dbError);
      }

      return Response.json({ classification, confidence });
    } catch (error) {
      console.error("Classification error:", error);
      return Response.json({ error: "Failed to classify recording" }, { status: 500 });
    }
  } finally {
    queue.delete(id);
  }
}

function validateClassification(input: string): Classification {
  const validClassifications: Classification[] = ["regular", "irregular", "afib", "unclassified"];
  return validClassifications.includes(input as Classification) ? (input as Classification) : "unclassified";
}

// Helper functions
function calculateAverage(values: (number | null)[]): number {
  const validValues = values.filter((v): v is number => v !== null);
  if (validValues.length === 0) return 0;
  return validValues.reduce((a, b) => a + b, 0) / validValues.length;
}

function calculateHRV(values: number[]): number {
  if (values.length < 2) return 0;

  const rrIntervals: number[] = [];
  for (let i = 1; i < values.length; i++) {
    const amplitude = Math.abs(values[i - 1] - values[i]);
    if (amplitude > 0) {
      rrIntervals.push(amplitude);
    }
  }

  if (rrIntervals.length < 2) return 0;

  const squaredDifferences: number[] = [];
  for (let i = 1; i < rrIntervals.length; i++) {
    const diff = rrIntervals[i - 1] - rrIntervals[i];
    squaredDifferences.push(diff * diff);
  }

  const meanSquaredDiff = squaredDifferences.reduce((sum, val) => sum + val, 0) / squaredDifferences.length;
  return Math.sqrt(meanSquaredDiff);
}

function calculateMotionIntensity(recordings: Recording[]): number {
  return (
    recordings.reduce((sum, r) => {
      const x = r.acc_x ?? 0;
      const y = r.acc_y ?? 0;
      const z = r.acc_z ?? 0;
      return sum + Math.sqrt(x * x + y * y + z * z);
    }, 0) / recordings.length
  );
}
