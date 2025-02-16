if (!process.env.PERPLEXITY_API_KEY) {
  throw new Error("Missing PERPLEXITY_API_KEY environment variable");
}

interface Recording {
  filename: string;
  sample_index: number;
  ir: number | null;
  acc_x: number | null;
  acc_y: number | null;
  acc_z: number | null;
}

export async function POST(request: Request) {
  try {
    const { recordings, metadata } = await request.json() as {
      recordings: Recording[];
      metadata: {
        atrial_fibrillation: number | null;
        bradycardia: number | null;
        tachycardia: number | null;
      };
    };

    // Prepare data for analysis
    const analysisPrompt = `
      Analyze this heart recording data:
      - Duration: ${recordings.length / 100}s
      - AFib Risk: ${metadata.atrial_fibrillation ?? 0}%
      - Bradycardia Risk: ${metadata.bradycardia ?? 0}%
      - Tachycardia Risk: ${metadata.tachycardia ?? 0}%
      - Motion Level: ${calculateMotionIntensity(recordings)}
      - HRV: ${calculateHRV(recordings.map(r => r.ir).filter(Boolean))}

      Provide a brief medical assessment focusing on combat readiness and health risks.
    `;

    console.log("Sending request to Perplexity with prompt:", analysisPrompt);

    const requestBody = {
      model: 'sonar-reasoning-pro',
      messages: [{
        role: 'user',
        content: analysisPrompt
      }],
      max_tokens: 150,
      temperature: 0.7,
      top_p: 1,
      stream: false
    };

    console.log("Request body:", JSON.stringify(requestBody, null, 2));

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Perplexity API error details:", {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        error: errorText,
        requestBody: JSON.stringify(requestBody, null, 2)
      });
      throw new Error(`Perplexity API error: ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    console.log("Perplexity API response:", JSON.stringify(data, null, 2));

    if (!data.choices?.[0]?.message?.content) {
      console.error("Unexpected response structure:", data);
      throw new Error("Invalid response structure from Perplexity API");
    }

    return Response.json({
      analysis: data.choices[0].message.content
    });
  } catch (error) {
    console.error("Perplexity analysis error:", error instanceof Error ? error.message : error);
    return Response.json({
      error: "Failed to analyze recording",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}

// Helper functions
function calculateMotionIntensity(recordings: Recording[]) {
  return recordings.reduce((sum, r) => {
    const x = r.acc_x ?? 0;
    const y = r.acc_y ?? 0;
    const z = r.acc_z ?? 0;
    return sum + Math.sqrt(x * x + y * y + z * z);
  }, 0) / recordings.length;
}

function calculateHRV(values: number[]) {
  if (values.length < 2) return 0;
  const intervals = values.slice(1).map((v, i) => Math.abs(v - values[i]));
  const mean = intervals.reduce((a, b) => a + b, 0) / intervals.length;
  return Math.sqrt(intervals.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / intervals.length);
}
