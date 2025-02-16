export interface Database {
  public: {
    Tables: {
      metadata: {
        Row: {
          filename: string;
          created_at: string;
          atrial_fibrillation: number | null;
          extrasystoles_frequent: number | null;
          classification: string | null;
          sinus: number | null;
          bradycardia: number | null;
          tachycardia: number | null;
          brady_episode: number | null;
          increased_hrv: number | null;
          tachy_episode: number | null;
          atrial_flutter: number | null;
          extrasystoles_bigminy: number | null;
          extrasystoles_isolated: number | null;
          extrasystoles_trigeminy: number | null;
          extrasystoles_big_episode: number | null;
          extrasystoles_trig_episode: number | null;
        };
        Insert: Record<string, number | string | null>;
        Update: Record<string, number | string | null>;
      };
      afib: {
        Row: Record<string, number | string | null>;
        Insert: Record<string, number | string | null>;
        Update: Record<string, number | string | null>;
      };
      irregular: {
        Row: Record<string, number | string | null>;
        Insert: Record<string, number | string | null>;
        Update: Record<string, number | string | null>;
      };
      regular: {
        Row: Record<string, number | string | null>;
        Insert: Record<string, number | string | null>;
        Update: Record<string, number | string | null>;
      };
      unclassified: {
        Row: Record<string, number | string | null>;
        Insert: Record<string, number | string | null>;
        Update: Record<string, number | string | null>;
      };
      recordings: {
        Row: {
          // ... recording fields
        };
      };
    };
  };
}
