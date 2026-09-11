import type { BookingStatus, PaymentStatus } from "@/types/domain";
import type { Language } from "@/components/preferences";

export function rupees(n: number): string {
  return `₹${n.toLocaleString("en-IN")}`;
}

export function timeOf(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function dateTimeOf(iso: string): string {
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function friendlyDate(dateStr: string): string {
  const today = new Date().toISOString().slice(0, 10);
  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  if (dateStr === today) return "Today";
  if (dateStr === tomorrow) return "Tomorrow";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export function minutesLabel(m: number): string {
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  return `${h} hr ${m % 60} min`;
}

export const BOOKING_STATUS_LABEL: Record<BookingStatus, string> = {
  booked: "Slot booked",
  arrived: "Arrived at gate",
  waiting: "Waiting in queue",
  processing: "Being processed",
  assessed: "Quality checked",
  procured: "Procurement completed",
  payment_initiated: "Payment initiated",
  payment_processing: "Payment processing",
  payment_completed: "Payment completed",
  cancelled: "Cancelled",
  no_show: "Did not arrive",
};

export const BOOKING_STATUS_LABEL_HI: Record<BookingStatus, string> = {
  booked: "स्लॉट बुक हुआ",
  arrived: "गेट पर पहुंचे",
  waiting: "कतार में प्रतीक्षारत",
  processing: "प्रक्रिया जारी",
  assessed: "गुणवत्ता जांची गई",
  procured: "खरीद पूर्ण",
  payment_initiated: "भुगतान शुरू",
  payment_processing: "भुगतान प्रक्रिया में",
  payment_completed: "भुगतान पूर्ण",
  cancelled: "रद्द",
  no_show: "नहीं पहुंचे",
};

export const BOOKING_STATUS_TONE: Record<
  BookingStatus,
  "neutral" | "primary" | "wheat" | "success" | "danger" | "info"
> = {
  booked: "primary",
  arrived: "info",
  waiting: "wheat",
  processing: "info",
  assessed: "info",
  procured: "success",
  payment_initiated: "wheat",
  payment_processing: "wheat",
  payment_completed: "success",
  cancelled: "danger",
  no_show: "danger",
};

export const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
  not_started: "Not started",
  initiated: "Initiated",
  processing: "Processing",
  completed: "Completed",
  failed: "Failed",
};

export const PAYMENT_STATUS_LABEL_HI: Record<PaymentStatus, string> = {
  not_started: "शुरू नहीं हुआ",
  initiated: "शुरू किया गया",
  processing: "प्रक्रिया में",
  completed: "पूर्ण",
  failed: "असफल",
};

/** Returns the label for a status key using the given map, Hindi map and language. */
export function statusLabel<K extends string>(
  map: Record<K, string>,
  mapHi: Record<K, string>,
  key: K,
  language: Language,
): string {
  return language === "hi" ? mapHi[key] : map[key];
}
