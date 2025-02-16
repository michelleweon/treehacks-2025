import type { Database } from "@/types/supabase";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { parse } from "csv-parse/sync";
import { readFile } from "fs/promises";
import JSZip from "jszip";
import { cookies } from "next/headers";
import { join } from "path";

export async function POST(request: Request) {
  try {
    const { filename } = (await request.json()) as { filename: string };
    const filePath = join(process.cwd(), "public", "uploads", filename);
    const fileBuffer = await readFile(filePath);

    const zip = new JSZip();
    const contents = await zip.loadAsync(Buffer.from(fileBuffer));
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore });

    for (const [path, zipEntry] of Object.entries(contents.files)) {
      if (zipEntry.dir || !path.endsWith(".csv")) continue;

      const content = await zipEntry.async("string");
      const records = parse(content, {
        columns: true,
        skip_empty_lines: true,
      }) as Record<string, unknown>[];

      const csvFilename = path.split("/").pop() ?? "unknown";

      // Handle metadata separately since it doesn't have sample_index
      if (path.includes("metadata")) {
        const { error } = await supabase.from("metadata").upsert(
          records.map((record) => ({
            ...record,
            filename: csvFilename,
          })),
          {
            onConflict: "filename", // Only use filename for metadata
            ignoreDuplicates: false,
          },
        );

        if (error) {
          console.error("Error upserting metadata:", error);
          throw error;
        }
        continue;
      }

      // Handle other tables that have sample_index
      let tableName = "unclassified";
      if (path.includes("/regular/")) tableName = "regular";
      if (path.includes("/irregular/")) tableName = "irregular";
      if (path.includes("/afib/")) tableName = "afib";

      const { error } = await supabase.from(tableName).upsert(
        records.map((record) => ({
          ...record,
          filename: csvFilename,
        })),
        {
          onConflict: "filename,sample_index",
          ignoreDuplicates: false,
        },
      );

      if (error) {
        console.error(`Error upserting into ${tableName}:`, error);
        throw error;
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Processing error:", error);
    return new Response(JSON.stringify({ success: false, error: "Failed to process zip file" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
