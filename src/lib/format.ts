import type { BookingStatus, PaymentStatus } from "@/types/domain";

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
