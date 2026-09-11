import type { AiCropAssessment } from "@/types/domain";
import { isConfigured } from "./config";
import { delay } from "./supabaseService";

/**
 * Preliminary wheat image guidance.
 *
 * IMPORTANT: image analysis is preliminary visual guidance only. It cannot
 * determine moisture percentage. The physical assessment at the centre is the
 * authoritative one.
 */
export interface AiVisionServiceContract {
  isReady(): boolean;
  analyseCropImage(input: {
    imageDataUrl: string;
    imageName: string;
    bookingId: string | null;
  }): Promise<AiCropAssessment>;
}

const SIMULATED = [
  {
    preliminary_quality: "Looks good" as const,
    confidence: 0.82,
    observations: [
      "Grain colour looks uniform golden-brown",
      "No obvious foreign material visible in the frame",
      "Very few visibly damaged grains",
    ],
    recommendations: [
      "Clean once more before loading to remove dust",
      "Carry the load in dry sacks",
      "Final grade will be decided by the centre's physical test",
    ],
  },
  {
    preliminary_quality: "Acceptable" as const,
    confidence: 0.68,
    observations: [
      "Slight colour variation between grains",
      "Small amount of chaff / husk visible",
      "A few shrivelled grains visible",
    ],
    recommendations: [
      "Sieve the lot to remove chaff",
      "Sun-dry for a few hours if the grain feels soft",
      "Final grade will be decided by the centre's physical test",
    ],
  },
  {
    preliminary_quality: "Needs attention" as const,
    confidence: 0.61,
    observations: [
      "Visible discoloration on part of the sample",
      "Foreign material such as stones or straw appears present",
      "Some grains look broken or damaged",
    ],
    recommendations: [
      "Clean and re-sort before bringing the load",
      "Separate the discoloured portion",
      "Speak to the centre officer before unloading",
    ],
  },
];

export const aiVisionService: AiVisionServiceContract = {
  isReady: () => isConfigured("aiVision"),

  async analyseCropImage({ imageDataUrl, imageName, bookingId }) {
    await delay(1800);
    const pick = SIMULATED[Math.floor(Math.random() * SIMULATED.length)]!;
    return {
      id: `ai-${Date.now()}`,
      booking_id: bookingId,
      image_name: imageName,
      image_data_url: imageDataUrl,
      model: "demo-vision-v1 (simulated)",
      is_simulated: true,
      created_at: new Date().toISOString(),
      ...pick,
    };
  },
};

export const AI_DISCLAIMER =
  "Photo check is only early guidance. It cannot measure moisture. The centre's physical test is the official result.";
