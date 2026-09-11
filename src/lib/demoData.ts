import type {
  Booking,
  CentreSlot,
  Crop,
  FarmerProfile,
  MandiRate,
  ProcurementCentre,
} from "@/types/domain";

/** Demo location used for distance calculation (Indore city centre). */
export const DEMO_ORIGIN = { latitude: 22.7196, longitude: 75.8577 };

export const WHEAT: Crop = {
  id: "crop-wheat",
  code: "WHT",
  name: "Wheat",
  name_hi: "गेहूँ",
  unit: "quintal",
};

export const CROPS: Crop[] = [WHEAT];

export const DEMO_CENTRES: ProcurementCentre[] = [
  {
    id: "ctr-ind-01",
    name: "Choithram Procurement Centre",
    centre_type: "Government Procurement Centre",
    city: "Indore",
    district: "Indore",
    state: "Madhya Pradesh",
    address: "Choithram Mandi Road, Indore",
    latitude: 22.6874,
    longitude: 75.8394,
    operating_hours: "08:00 - 18:00",
    wheat_enabled: true,
    capacity: 220,
    active_counters: 3,
    average_processing_minutes: 12,
    active: true,
  },
  {
    id: "ctr-ind-02",
    name: "Laxmibai Nagar Krishi Upaj Mandi",
    centre_type: "Krishi Upaj Mandi",
    city: "Indore",
    district: "Indore",
    state: "Madhya Pradesh",
    address: "Laxmibai Nagar, Indore",
    latitude: 22.7385,
    longitude: 75.8709,
    operating_hours: "07:00 - 17:00",
    wheat_enabled: true,
    capacity: 300,
    active_counters: 4,
    average_processing_minutes: 14,
    active: true,
  },
  {
    id: "ctr-ind-03",
    name: "Sanwer Cooperative Society Centre",
    centre_type: "Cooperative Society Centre",
    city: "Sanwer",
    district: "Indore",
    state: "Madhya Pradesh",
    address: "Society Marg, Sanwer",
    latitude: 22.9709,
    longitude: 75.8272,
    operating_hours: "08:00 - 16:00",
    wheat_enabled: true,
    capacity: 120,
    active_counters: 2,
    average_processing_minutes: 10,
    active: true,
  },
  {
    id: "ctr-ind-04",
    name: "Depalpur Warehouse Procurement Point",
    centre_type: "Warehouse Procurement Point",
    city: "Depalpur",
    district: "Indore",
    state: "Madhya Pradesh",
    address: "Warehouse Complex, Depalpur",
    latitude: 22.8524,
    longitude: 75.5423,
    operating_hours: "09:00 - 17:00",
    wheat_enabled: true,
    capacity: 150,
    active_counters: 2,
    average_processing_minutes: 11,
    active: true,
  },
  {
    id: "ctr-ind-05",
    name: "Mhow Government Procurement Centre",
    centre_type: "Government Procurement Centre",
    city: "Mhow",
    district: "Indore",
    state: "Madhya Pradesh",
    address: "Mandi Gate, Mhow",
    latitude: 22.5525,
    longitude: 75.7605,
    operating_hours: "08:00 - 18:00",
    wheat_enabled: true,
    capacity: 180,
    active_counters: 3,
    average_processing_minutes: 13,
    active: true,
  },
  {
    id: "ctr-ind-06",
    name: "Betma Seasonal Centre",
    centre_type: "Cooperative Society Centre",
    city: "Betma",
    district: "Indore",
    state: "Madhya Pradesh",
    address: "Betma Bypass Road",
    latitude: 22.6926,
    longitude: 75.6035,
    operating_hours: "Closed today",
    wheat_enabled: true,
    capacity: 80,
    active_counters: 1,
    average_processing_minutes: 15,
    active: false,
  },
];

export const DEMO_RATES: MandiRate[] = [
  ["ctr-ind-01", 2465],
  ["ctr-ind-02", 2510],
  ["ctr-ind-03", 2440],
  ["ctr-ind-04", 2480],
  ["ctr-ind-05", 2495],
  ["ctr-ind-06", 2425],
].map(([centre_id, rate], i) => ({
  id: `rate-${i + 1}`,
  centre_id: centre_id as string,
  crop_id: WHEAT.id,
  rate_per_quintal: rate as number,
  effective_date: new Date().toISOString().slice(0, 10),
  source: "demo" as const,
}));

/** Historical load factor (0-1) used by the demo prediction model. */
export const CENTRE_HISTORICAL_LOAD: Record<string, number> = {
  "ctr-ind-01": 0.62,
  "ctr-ind-02": 0.81,
  "ctr-ind-03": 0.35,
  "ctr-ind-04": 0.48,
  "ctr-ind-05": 0.7,
  "ctr-ind-06": 0.2,
};

export const CENTRE_ARRIVAL_RATE: Record<string, number> = {
  "ctr-ind-01": 8,
  "ctr-ind-02": 12,
  "ctr-ind-03": 4,
  "ctr-ind-04": 6,
  "ctr-ind-05": 9,
  "ctr-ind-06": 2,
};

const SLOT_WINDOWS = [
  ["08:00", "09:00"],
  ["09:00", "10:00"],
  ["10:00", "11:00"],
  ["11:00", "12:00"],
  ["12:00", "13:00"],
  ["14:00", "15:00"],
  ["15:00", "16:00"],
  ["16:00", "17:00"],
];

export function dateKey(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

export function buildDemoSlots(): CentreSlot[] {
  const slots: CentreSlot[] = [];
  DEMO_CENTRES.forEach((centre) => {
    [0, 1, 2].forEach((offset) => {
      SLOT_WINDOWS.forEach(([start, end], i) => {
        const capacity = Math.max(6, Math.round(centre.capacity / 12));
        const load = CENTRE_HISTORICAL_LOAD[centre.id] ?? 0.5;
        const booked = Math.min(
          capacity,
          Math.round(capacity * load * (offset === 0 ? 1 : 0.55) + (i % 3)),
        );
        slots.push({
          id: `slot-${centre.id}-${offset}-${i}`,
          centre_id: centre.id,
          crop_id: WHEAT.id,
          slot_date: dateKey(offset),
          start_time: start!,
          end_time: end!,
          capacity,
          booked_count: booked,
          status: centre.active ? "open" : "closed",
        });
      });
    });
  });
  return slots;
}

export const DEMO_FARMER_PROFILE: FarmerProfile = {
  id: "farmer-demo-1",
  profile_id: "profile-demo",
  smartmandi_farmer_id: "SM-MP-IND-004821",
  crops: ["Wheat"],
  village: "Kshipra",
  district: "Indore",
  state: "Madhya Pradesh",
  land_area_acres: 6.5,
  external_euparjan_id: null,
  external_enam_id: null,
  external_mp_emandi_id: null,
  fpo_or_society_id: "FPO-IND-118",
  bank_account_masked: "XXXX XXXX 4471",
};

/** Other farmers already in the queue at the main demo centre. */
export const DEMO_QUEUE_FARMERS = [
  { name: "Ramesh Patidar", village: "Hatod", quantity: 24 },
  { name: "Sunita Bai", village: "Sanwer", quantity: 18 },
  { name: "Mohan Chouhan", village: "Betma", quantity: 32 },
  { name: "Kailash Yadav", village: "Depalpur", quantity: 15 },
  { name: "Ganga Prasad", village: "Kshipra", quantity: 28 },
  { name: "Devilal Solanki", village: "Mhow", quantity: 21 },
];

export function buildDemoQueueBookings(centreId: string, slotId: string): Booking[] {
  const statuses: Booking["status"][] = [
    "processing",
    "waiting",
    "waiting",
    "waiting",
    "arrived",
    "booked",
  ];
  return DEMO_QUEUE_FARMERS.map((f, i) => ({
    id: `bkg-demo-${i + 1}`,
    farmer_profile_id: `demo-farmer-${i + 1}`,
    centre_id: centreId,
    crop_id: WHEAT.id,
    slot_id: slotId,
    token_number: `WHT-IND-${1001 + i}`,
    expected_quantity_quintal: f.quantity,
    status: statuses[i]!,
    qr_data: `SMARTMANDI|WHT-IND-${1001 + i}`,
    created_at: new Date(Date.now() - (i + 1) * 3600_000).toISOString(),
  }));
}

export function haversineKm(
  a: { latitude: number; longitude: number },
  b: { latitude: number; longitude: number },
): number {
  const R = 6371;
  const dLat = ((b.latitude - a.latitude) * Math.PI) / 180;
  const dLon = ((b.longitude - a.longitude) * Math.PI) / 180;
  const lat1 = (a.latitude * Math.PI) / 180;
  const lat2 = (b.latitude * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return Math.round(2 * R * Math.asin(Math.sqrt(h)) * 10) / 10;
}
