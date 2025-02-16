export interface PerplexityAnalysisResponse {
  analysis: string;
  error?: string;
}

export function isPerplexityAnalysisResponse(data: unknown): data is PerplexityAnalysisResponse {
  return (
    typeof data === "object" &&
    data !== null &&
    "analysis" in data &&
    typeof (data as PerplexityAnalysisResponse).analysis === "string"
  );
}
