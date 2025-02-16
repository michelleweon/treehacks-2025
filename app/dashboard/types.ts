// types.ts

// Enum for different alert severity levels
export enum AlertSeverity {
    CRITICAL = 'CRITICAL',
    URGENT = 'URGENT',
    WARNING = 'WARNING'
  }

  // Enum for readiness status
  export enum ReadinessStatus {
    FULLY_READY = 'FULLY_READY',
    PARTIALLY_READY = 'PARTIALLY_READY',
    MISSION_COMPROMISED = 'MISSION_COMPROMISED'
  }

  // Interface for health metrics
  export interface HealthMetrics {
    readinessScore: number;
    restingHeartRate: number;
    heartRateVariability: number;
    sleepQuality: {
      hours: number;
      efficiency: number;
    };
    activityLevel: {
      steps: number;
      intensity: number;
    };
  }

  // Interface for a single alert
  export interface Alert {
    id: string;
    severity: AlertSeverity;
    message: string;
    timestamp: Date;
    squadId: string;
    soldierId?: string;
  }

  // Interface for a soldier
  export interface Soldier {
    id: string;
    name: string;
    squadId: string;
    healthMetrics: HealthMetrics;
    alerts: Alert[];
    annotations: {
      text: string;
      timestamp: Date;
      author: string;
    }[];
  }

  // Interface for a squad
  export interface Squad {
    id: string;
    name: string;
    soldiers: Soldier[];
    averageReadinessScore: number;
    status: ReadinessStatus;
    anomalyCount: number;
  }

  // Interface for time series data point
  export interface TimeSeriesDataPoint {
    timestamp: Date;
    value: number;
  }

  // Interface for squad performance data
  export interface SquadPerformanceData {
    avgHeartRate: TimeSeriesDataPoint[];
    avgHRV: TimeSeriesDataPoint[];
    avgSleepDuration: TimeSeriesDataPoint[];
  }

  export interface AuthError {
    message: string;
    status: number;
  }

  export interface UploadResponse {
    success: boolean;
    error?: string;
    details?: unknown;
  }
