// utils/healthDataProcessor.ts

interface RawHealthMetrics {
    bradycardia: number;
    tachycardia: number;
    increased_hrv: number;
    atrial_flutter: number;
    atrial_fibrillation: number;
    green: number;
    red: number;
    ir: number;
    acc_x: number;
    acc_y: number;
    acc_z: number;
    sample_index: number;
  }
  
  export const processHealthData = (rawData: RawHealthMetrics) => {
    // Calculate readiness score based on various factors
    const readinessScore = calculateReadinessScore(rawData);
    
    // Calculate activity level based on accelerometer data
    const activityLevel = calculateActivityLevel(rawData);
    
    // Process heart-related metrics
    const heartMetrics = processHeartMetrics(rawData);
    
    return {
      readinessScore,
      ...heartMetrics,
      activityLevel,
      raw: rawData
    };
  };
  
  const calculateReadinessScore = (data: RawHealthMetrics): number => {
    // Higher score is better
    let score = 100;
    
    // Reduce score based on cardiac issues
    if (data.bradycardia > 0.01) score -= 15;
    if (data.tachycardia > 0.01) score -= 15;
    if (data.atrial_flutter > 0.01) score -= 20;
    if (data.atrial_fibrillation > 0.01) score -= 25;
    
    // Adjust for HRV (higher HRV is generally better)
    score += data.increased_hrv * 100;
    
    // Ensure score stays within 0-100 range
    return Math.max(0, Math.min(100, score));
  };
  
  const calculateActivityLevel = (data: RawHealthMetrics) => {
    // Calculate magnitude of acceleration
    const magnitude = Math.sqrt(
      Math.pow(data.acc_x, 2) + 
      Math.pow(data.acc_y, 2) + 
      Math.pow(data.acc_z, 2)
    );
    
    return {
      intensity: magnitude,
      // Simplified step count estimation based on green channel
      steps: Math.floor(data.green / 1000)
    };
  };
  
  const processHeartMetrics = (data: RawHealthMetrics) => {
    // Calculate heart rate from green channel (simplified)
    const estimatedHeartRate = Math.floor(data.green / 1000);
    
    return {
      heartRate: estimatedHeartRate,
      hrv: data.increased_hrv * 100, // Scale to more readable number
      anomalies: {
        bradycardia: data.bradycardia > 0.01,
        tachycardia: data.tachycardia > 0.01,
        atrialFlutter: data.atrial_flutter > 0.01,
        atrialFibrillation: data.atrial_fibrillation > 0.01
      }
    };
  };