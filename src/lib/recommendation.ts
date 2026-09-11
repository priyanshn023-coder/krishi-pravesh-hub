import type { CentreSlot, ProcurementCentre } from "@/types/domain";
import {
  CENTRE_ARRIVAL_RATE,
  CENTRE_HISTORICAL_LOAD,
  DEMO_ORIGIN,
  DEMO_RATES,
  haversineKm,
  WHEAT,
} from "./demoData";
import { queuePredictionService } from "@/services";

export interface CentreInsight {
  centre: ProcurementCentre;
  distanceKm: number;
  ratePerQuintal: number;
  openSlots: number;
  earliestSlot: CentreSlot | null;
  waitMinutes: number;
  queueLength: number;
  score: number;
  reasons: string[];
}

/**
 * Transparent decision-support ranking (NOT an AI claim):
 * 30% waiting time · 25% distance · 25% rate · 10% slot availability · 10% operating status
 */
export const SCORE_WEIGHTS = {
  wait: 0.3,
  distance: 0.25,
  rate: 0.25,
  slots: 0.1,
  status: 0.1,
} as const;

export function buildCentreInsights(
  centres: ProcurementCentre[],
  slots: CentreSlot[],
  queueLengthByCentre: Record<string, number>,
): CentreInsight[] {
  const now = new Date();

  const raw = centres.map((centre) => {
    const distanceKm = haversineKm(DEMO_ORIGIN, centre);
    const ratePerQuintal =
      DEMO_RATES.find((r) => r.centre_id === centre.id)?.rate_per_quintal ?? 0;
    const centreSlots = slots
      .filter(
        (s) =>
          s.centre_id === centre.id &&
          s.crop_id === WHEAT.id &&
          s.status === "open" &&
          s.booked_count < s.capacity,
      )
      .sort((a, b) =>
        `${a.slot_date}${a.start_time}`.localeCompare(`${b.slot_date}${b.start_time}`),
      );
    const queueLength = queueLengthByCentre[centre.id] ?? 0;
    const prediction = queuePredictionService.predict({
      centre_id: centre.id,
      booking_id: null,
      queue_length: queueLength,
      active_counters: centre.active_counters,
      arrival_rate_per_hour: CENTRE_ARRIVAL_RATE[centre.id] ?? 6,
      average_processing_time: centre.average_processing_minutes,
      crop_code: WHEAT.code,
      hour_of_day: now.getHours(),
      day_of_week: now.getDay(),
      month: now.getMonth() + 1,
      historical_load: CENTRE_HISTORICAL_LOAD[centre.id] ?? 0.5,
      completed_today: 0,
      currently_processing: queueLength > 0 ? 1 : 0,
    });
    return {
      centre,
      distanceKm,
      ratePerQuintal,
      openSlots: centreSlots.reduce((n, s) => n + (s.capacity - s.booked_count), 0),
      earliestSlot: centreSlots[0] ?? null,
      waitMinutes: prediction.prediction_minutes,
      queueLength,
    };
  });

  const min = (fn: (r: (typeof raw)[number]) => number) => Math.min(...raw.map(fn));
  const max = (fn: (r: (typeof raw)[number]) => number) => Math.max(...raw.map(fn));

  const norm = (v: number, lo: number, hi: number, higherIsBetter: boolean) => {
    if (hi === lo) return 1;
    const t = (v - lo) / (hi - lo);
    return higherIsBetter ? t : 1 - t;
  };

  return raw
    .map((r) => {
      const waitScore = norm(r.waitMinutes, min((x) => x.waitMinutes), max((x) => x.waitMinutes), false);
      const distScore = norm(r.distanceKm, min((x) => x.distanceKm), max((x) => x.distanceKm), false);
      const rateScore = norm(
        r.ratePerQuintal,
        min((x) => x.ratePerQuintal),
        max((x) => x.ratePerQuintal),
        true,
      );
      const slotScore = norm(r.openSlots, min((x) => x.openSlots), max((x) => x.openSlots), true);
      const statusScore = r.centre.active ? 1 : 0;

      const score = Math.round(
        (waitScore * SCORE_WEIGHTS.wait +
          distScore * SCORE_WEIGHTS.distance +
          rateScore * SCORE_WEIGHTS.rate +
          slotScore * SCORE_WEIGHTS.slots +
          statusScore * SCORE_WEIGHTS.status) *
          100,
      );

      const reasons: string[] = [];
      if (distScore > 0.6) reasons.push(`it is closer to you (${r.distanceKm} km)`);
      if (waitScore > 0.6) reasons.push(`the predicted wait is shorter (about ${r.waitMinutes} min)`);
      if (rateScore > 0.6) reasons.push(`the demo rate is higher (₹${r.ratePerQuintal}/quintal)`);
      if (slotScore > 0.5 && r.openSlots > 0) reasons.push(`wheat slots are available (${r.openSlots} places)`);
      if (!r.centre.active) reasons.push("the centre is not operating today");
      if (reasons.length === 0) reasons.push("it is an average match on distance, rate and wait");

      return { ...r, score, reasons };
    })
    .sort((a, b) => b.score - a.score);
}

export type SortKey = "recommended" | "nearest" | "rate" | "wait" | "earliest";

export function sortInsights(list: CentreInsight[], key: SortKey): CentreInsight[] {
  const copy = [...list];
  switch (key) {
    case "nearest":
      return copy.sort((a, b) => a.distanceKm - b.distanceKm);
    case "rate":
      return copy.sort((a, b) => b.ratePerQuintal - a.ratePerQuintal);
    case "wait":
      return copy.sort((a, b) => a.waitMinutes - b.waitMinutes);
    case "earliest":
      return copy.sort((a, b) => {
        const av = a.earliestSlot
          ? `${a.earliestSlot.slot_date}${a.earliestSlot.start_time}`
          : "9999";
        const bv = b.earliestSlot
          ? `${b.earliestSlot.slot_date}${b.earliestSlot.start_time}`
          : "9999";
        return av.localeCompare(bv);
      });
    default:
      return copy.sort((a, b) => b.score - a.score);
  }
}

export function explain(insight: CentreInsight): string {
  return `Recommended because ${insight.reasons.slice(0, 3).join(", and ")}.`;
}
