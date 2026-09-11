import type { Booking, ProcurementCentre, QueuePrediction } from "@/types/domain";
import { queuePredictionService } from "@/services";
import { CENTRE_ARRIVAL_RATE, CENTRE_HISTORICAL_LOAD, WHEAT } from "./demoData";

export function queueForCentre(bookings: Booking[], centreId: string): Booking[] {
  return bookings
    .filter((b) => b.centre_id === centreId && (b.status === "waiting" || b.status === "processing"))
    .sort((a, b) => a.created_at.localeCompare(b.created_at));
}

export function positionOf(bookings: Booking[], booking: Booking): number | null {
  const q = queueForCentre(bookings, booking.centre_id);
  const idx = q.findIndex((b) => b.id === booking.id);
  return idx === -1 ? null : idx + 1;
}

export function queueLengthByCentre(bookings: Booking[]): Record<string, number> {
  const map: Record<string, number> = {};
  bookings.forEach((b) => {
    if (b.status === "waiting" || b.status === "processing") {
      map[b.centre_id] = (map[b.centre_id] ?? 0) + 1;
    }
  });
  return map;
}

export function predictFor(
  centre: ProcurementCentre,
  bookings: Booking[],
  booking: Booking | null,
  aheadOverride?: number,
): QueuePrediction {
  const now = new Date();
  const q = queueForCentre(bookings, centre.id);
  const ahead =
    aheadOverride ??
    (booking ? Math.max(0, q.findIndex((b) => b.id === booking.id)) : q.length);
  return queuePredictionService.predict({
    centre_id: centre.id,
    booking_id: booking?.id ?? null,
    queue_length: ahead,
    active_counters: centre.active_counters,
    arrival_rate_per_hour: CENTRE_ARRIVAL_RATE[centre.id] ?? 6,
    average_processing_time: centre.average_processing_minutes,
    crop_code: WHEAT.code,
    hour_of_day: now.getHours(),
    day_of_week: now.getDay(),
    month: now.getMonth() + 1,
    historical_load: CENTRE_HISTORICAL_LOAD[centre.id] ?? 0.5,
    completed_today: bookings.filter(
      (b) => b.centre_id === centre.id && b.status === "payment_completed",
    ).length,
    currently_processing: bookings.filter(
      (b) => b.centre_id === centre.id && b.status === "processing",
    ).length,
  });
}
