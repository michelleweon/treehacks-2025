// supabase/functions/import-csv/index.ts
import { serve } from 'https://esm.sh/@std/http/server';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Client } from 'https://deno.land/x/postgres@v0.17.0/mod.ts';
import { parse } from 'https://esm.sh/csv-parse@5.5.3';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') ?? '';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const dbConfig = {
    connectionString: Deno.env.get('SUPABASE_DB_URL') ?? '', // Ensure you set this environment variable
};


serve(async (req) => {
  try {
      const { bucket, name } = await req.json();

      const { data, error } = await supabase.storage
          .from(bucket)
          .download(name)

      if (error) {
          console.error("Error downloading file from storage: ", error);
          throw new Error("Unable to download file from storage")
      }

      const csvText = new TextDecoder().decode(data); //Decode the CSV
      const results = Array.from(parse(csvText, {
          header: true,
          skipEmptyLines: true
        })
      );

      //Get database name from filename
      const tableName = name.includes('metadata') ? 'metadata' : 'recordings';

      //Initialize a Supabase database client
      const db = new Client(dbConfig);
      await db.connect();

      //Batch Insert using a dynamic query
      const batchSize = 100;

      for (let i = 0; i < results.length; i += batchSize) {
        const batch = results.slice(i, i + batchSize);

        if (batch.length > 0) {
          const columns = Object.keys(batch[0] as Object);
          const values = batch.map(obj => `(${columns.map(col => {
            let val = (obj as any)[col];
            if (val === null || val === undefined) return 'NULL';
            if (typeof val === 'string') val = val.replace(/'/g, "''"); // Escape single quotes in string values
            return typeof val === 'string' ? `'${val}'` : val;
          }).join(',')})`).join(',');

          const insertCommand = `
            INSERT INTO ${tableName} (${columns.join(',')})
            VALUES ${values};
          `;
          console.log(`Executing batch insert for rows ${i} to ${i + batch.length - 1}`);
          try {
            await db.queryObject(insertCommand);
          } catch (insertError) {
            console.error(`Error inserting batch of rows ${i} to ${i + batchSize - 1}:`, insertError);
            throw insertError; // Re-throw the error to stop processing or handle differently
          }
        }
      }
        return new Response(
            JSON.stringify({ message: "Data insertion successful" }),
            {
                status: 200,
                headers: { "Content-Type": "application/json" },
            }
        );

    } catch (error) {
        console.error("Error in Edge Function: ", error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
});
