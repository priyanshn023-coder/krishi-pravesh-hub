/**
 * SmartMandi database contract.
 *
 * These TypeScript interfaces mirror the future Supabase tables.
 * NOTHING here creates a database — they are the shared shape used by the
 * mock/demo services today and by the real Supabase client later.
 */

export type UUID = string;
export type ISODate = string;

export type UserRole = "farmer" | "authority";

export interface Profile {
  id: UUID;
  role: UserRole;
  full_name: string;
  phone: string;
  preferred_language: "en" | "hi";
  created_at: ISODate;
}

export interface FarmerProfile {
  id: UUID;
  profile_id: UUID;
  smartmandi_farmer_id: string;
  crops: string[];
  village: string;
  district: string;
  state: string;
  land_area_acres: number;
  external_euparjan_id: string | null;
  external_enam_id: string | null;
  external_mp_emandi_id: string | null;
  fpo_or_society_id: string | null;
  bank_account_masked: string | null;
}

export type CentreType =
  | "Government Procurement Centre"
  | "Krishi Upaj Mandi"
  | "Cooperative Society Centre"
  | "Warehouse Procurement Point";

export interface ProcurementCentre {
  id: UUID;
  name: string;
  centre_type: CentreType;
  city: string;
  district: string;
  state: string;
  address: string;
  latitude: number;
  longitude: number;
  operating_hours: string;
  wheat_enabled: boolean;
  capacity: number;
  active_counters: number;
  average_processing_minutes: number;
  active: boolean;
}

export interface Crop {
  id: UUID;
  code: string;
  name: string;
  name_hi: string;
  unit: "quintal";
}

export interface MandiRate {
  id: UUID;
  centre_id: UUID;
  crop_id: UUID;
  rate_per_quintal: number;
  effective_date: ISODate;
  source: "demo";
}

export interface CentreSlot {
  id: UUID;
  centre_id: UUID;
  crop_id: UUID;
  slot_date: string;
  start_time: string;
  end_time: string;
  capacity: number;
  booked_count: number;
  status: "open" | "closed";
}

export type BookingStatus =
  | "booked"
  | "arrived"
  | "waiting"
  | "processing"
  | "assessed"
  | "procured"
  | "payment_initiated"
  | "payment_processing"
  | "payment_completed"
  | "cancelled"
  | "no_show";

export interface Booking {
  id: UUID;
  farmer_profile_id: UUID;
  centre_id: UUID;
  crop_id: UUID;
  slot_id: UUID;
  token_number: string;
  expected_quantity_quintal: number;
  status: BookingStatus;
  qr_data: string;
  created_at: ISODate;
}

export interface GateEntry {
  id: UUID;
  booking_id: UUID;
  centre_id: UUID;
  rfid_id: string;
  reader_id: string;
  entered_at: ISODate;
  source: "rfid_simulator" | "manual" | "rfid_hardware";
}

export interface QueueEvent {
  id: UUID;
  booking_id: UUID;
  centre_id: UUID;
  event_type:
    | "queued"
    | "position_changed"
    | "processing_started"
    | "processing_completed";
  position: number | null;
  created_at: ISODate;
}

export type QualityGrade = "A" | "B" | "C" | "Rejected";

export interface CropAssessment {
  id: UUID;
  booking_id: UUID;
  gross_weight_kg: number;
  tare_weight_kg: number;
  net_weight_kg: number;
  moisture_percent: number;
  foreign_matter_percent: number;
  damaged_grain_percent: number;
  quality_grade: QualityGrade;
  notes: string;
  assessed_by: string;
  assessed_at: ISODate;
}

export interface AiCropAssessment {
  id: UUID;
  booking_id: UUID | null;
  image_name: string;
  image_data_url: string;
  preliminary_quality: "Looks good" | "Acceptable" | "Needs attention";
  confidence: number;
  observations: string[];
  recommendations: string[];
  model: string;
  is_simulated: boolean;
  created_at: ISODate;
}

export type PaymentStatus =
  | "not_started"
  | "initiated"
  | "processing"
  | "completed"
  | "failed";

export interface Payment {
  id: UUID;
  booking_id: UUID;
  reference: string;
  amount: number;
  rate_per_quintal: number;
  net_quantity_quintal: number;
  status: PaymentStatus;
  is_demo: true;
  updated_at: ISODate;
}

export interface QueuePrediction {
  id: UUID;
  centre_id: UUID;
  booking_id: UUID | null;
  queue_length: number;
  active_counters: number;
  arrival_rate_per_hour: number;
  average_processing_time: number;
  historical_load: number;
  prediction_minutes: number;
  predicted_turn_time: ISODate;
  model_version: string;
  created_at: ISODate;
}

export type NotificationEvent =
  | "registration"
  | "slot_booked"
  | "token_generated"
  | "reminder"
  | "gate_entry"
  | "queue_update"
  | "processing"
  | "assessment"
  | "procurement"
  | "payment_initiated"
  | "payment_completed";

export interface AppNotification {
  id: UUID;
  recipient_role: UserRole;
  event: NotificationEvent;
  title: string;
  body: string;
  read: boolean;
  channel: "in_app";
  created_at: ISODate;
}

export interface AuditLog {
  id: UUID;
  actor: string;
  action: string;
  entity: string;
  entity_id: string;
  created_at: ISODate;
}

/** Journey state machine order used across the UI. */
export const JOURNEY_STAGES = [
  "Registration",
  "Centre Selected",
  "Slot Booked",
  "Token Generated",
  "Arrived at Gate",
  "Waiting",
  "Processing",
  "Quality Assessment",
  "Procurement Completed",
  "Payment Initiated",
  "Payment Processing",
  "Payment Completed",
] as const;

export type JourneyStage = (typeof JOURNEY_STAGES)[number];
