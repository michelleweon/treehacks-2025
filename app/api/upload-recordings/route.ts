import { type Database } from "@/types/supabase";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { parse } from "csv-parse/sync";
import JSZip from "jszip";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient<Database>({
      cookies: () => cookieStore,
    });

    try {
      // Use getUser instead of getSession
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) {
        return NextResponse.json({ success: false, error: "Please sign in again" }, { status: 401 });
      }

      const formData = await request.formData();
      const file = formData.get("file") as File;

      if (!file) {
        return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 });
      }

      const zipBuffer = await file.arrayBuffer();
      const zip = await JSZip.loadAsync(zipBuffer);

      type RecordType = Record<string, string | number | boolean | null>;

      // Process metadata.csv first
      const metadataFile = zip.file("metadata.csv");
      if (metadataFile) {
        console.log("Processing metadata.csv...");
        const content = await metadataFile.async("text");
        const records = parse(content, {
          columns: true,
          skip_empty_lines: true,
        }) as RecordType[];

        console.log("Metadata records:", records.length);
        const { error: metadataError } = await supabase.from("metadata").upsert(records);
        if (metadataError) {
          console.error("Metadata error:", metadataError);
          throw metadataError;
        }
      } else {
        console.log("No metadata.csv found in zip");
      }

      // Process recordings from each folder
      const folders = {
        afib: "afib",
        irregular: "irregular",
        regular: "regular",
        unclassified: "unclassified",
      };

      for (const [folderName, tableName] of Object.entries(folders)) {
        console.log(`Processing ${folderName} folder...`);
        const folderFiles = Object.entries(zip.files).filter(
          ([path]) => path.startsWith(`${folderName}/`) && path.endsWith(".csv"),
        );

        console.log(`Found ${folderFiles.length} CSV files in ${folderName}`);

        for (const [path, zipEntry] of folderFiles) {
          if (zipEntry.dir) continue;
          console.log(`Processing file: ${path}`);

          const content = await zipEntry.async("text");
          const records = parse(content, {
            columns: true,
            skip_empty_lines: true,
          }) as RecordType[];

          console.log(`Parsed ${records.length} records from ${path}`);
          const { error } = await supabase.from(tableName).upsert(records);
          if (error) {
            console.error(`Error upserting to ${tableName}:`, error);
            throw error;
          }
          console.log(`Successfully uploaded ${records.length} records to ${tableName}`);
        }
      }

      return NextResponse.json({ success: true });
    } catch (authError) {
      console.error("Auth error:", authError);
      return NextResponse.json({ success: false, error: "Authentication failed" }, { status: 401 });
    }
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to process files",
        details: error,
      },
      { status: 500 },
    );
  }
}

const validateRecordingData = (record: any): boolean => {
  return (
    typeof record.sample_index === "number" &&
    (record.green === null || typeof record.green === "number") &&
    (record.red === null || typeof record.red === "number") &&
    (record.ir === null || typeof record.ir === "number") &&
    (record.acc_x === null || typeof record.acc_x === "number") &&
    (record.acc_y === null || typeof record.acc_y === "number") &&
    (record.acc_z === null || typeof record.acc_z === "number") &&
    (record.filename === null || typeof record.filename === "string")
  );
};
