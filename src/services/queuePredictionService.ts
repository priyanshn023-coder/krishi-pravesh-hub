import type { QueuePrediction } from "@/types/domain";
import { isConfigured } from "./config";

/**
 * Waiting-time prediction.
 *
 * Today: a transparent demo estimator over synthetic demo data.
 * Later: point VITE_QUEUE_PREDICTION_ENDPOINT at a Python service serving a
 * Random Forest / Gradient Boosting regression model. The feature payload below
 * is the contract that service must accept.
 */
export interface QueuePredictionFeatures {
  centre_id: string;
  booking_id: string | null;
  queue_length: number;
  active_counters: number;
  arrival_rate_per_hour: number;
  average_processing_time: number;
  crop_code: string;
  hour_of_day: number;
  day_of_week: number;
  month: number;
  historical_load: number;
  completed_today: number;
  currently_processing: number;
}

export interface QueuePredictionServiceContract {
  isReady(): boolean;
  modelName(): string;
  modelVersion(): string;
  predict(features: QueuePredictionFeatures): QueuePrediction;
}

export const queuePredictionService: QueuePredictionServiceContract = {
  isReady: () => isConfigured("queuePrediction"),
  modelName: () => "Random Forest Regression",
  modelVersion: () => "v1-demo (synthetic data)",

  predict(f) {
    const counters = Math.max(1, f.active_counters);
    // Base service time for everyone ahead in the queue.
    const base = (f.queue_length * f.average_processing_time) / counters;
    // Load pressure: arrivals faster than throughput stretch the wait.
    const throughput = (counters * 60) / Math.max(1, f.average_processing_time);
    const pressure = Math.max(0, f.arrival_rate_per_hour - throughput) * 1.5;
    // Peak-hour and seasonal load adjustments from historical demo load.
    const peak = f.hour_of_day >= 10 && f.hour_of_day <= 13 ? 1.15 : 1;
    const seasonal = 0.9 + f.historical_load * 0.3;
    const inProgress = f.currently_processing > 0 ? f.average_processing_time * 0.4 : 0;

    const minutes = Math.max(
      5,
      Math.round((base + pressure + inProgress) * peak * seasonal),
    );

    return {
      id: `pred-${Date.now()}`,
      centre_id: f.centre_id,
      booking_id: f.booking_id,
      queue_length: f.queue_length,
      active_counters: counters,
      arrival_rate_per_hour: f.arrival_rate_per_hour,
      average_processing_time: f.average_processing_time,
      historical_load: f.historical_load,
      prediction_minutes: minutes,
      predicted_turn_time: new Date(Date.now() + minutes * 60_000).toISOString(),
      model_version: "v1-demo",
      created_at: new Date().toISOString(),
    };
  },
};
