import { mkdir, writeFile } from "fs/promises";
import { join } from "path";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("zipFile") as File;

    if (!file) {
      return new Response(JSON.stringify({ success: false, error: "No file provided" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Save the zip file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    try {
      // Create uploads directory if it doesn't exist
      const uploadDir = join(process.cwd(), "public", "uploads");
      await mkdir(uploadDir, { recursive: true });

      // Write file using Uint8Array
      await writeFile(join(uploadDir, file.name), new Uint8Array(buffer));

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (fsError) {
      console.error("File system error:", fsError);
      return new Response(JSON.stringify({ success: false, error: "Failed to save file" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  } catch (error) {
    console.error("Upload error:", error);
    return new Response(JSON.stringify({ success: false, error: "Server error occurred" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
