import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type {
  AiCropAssessment,
  AppNotification,
  Booking,
  BookingStatus,
  CentreSlot,
  CropAssessment,
  FarmerProfile,
  GateEntry,
  JourneyStage,
  NotificationEvent,
  Payment,
  Profile,
  QueueEvent,
  UserRole,
} from "@/types/domain";
import {
  buildDemoQueueBookings,
  buildDemoSlots,
  DEMO_CENTRES,
  DEMO_FARMER_PROFILE,
  DEMO_QUEUE_FARMERS,
  DEMO_RATES,
  WHEAT,
} from "@/lib/demoData";
import {
  notificationService,
  paymentService,
  type RfidScanPayload,
} from "@/services";

const STORAGE_KEY = "smartmandi-demo-state-v1";

export interface AppState {
  profile: Profile | null;
  farmer: FarmerProfile;
  slots: CentreSlot[];
  bookings: Booking[];
  gateEntries: GateEntry[];
  queueEvents: QueueEvent[];
  assessments: CropAssessment[];
  aiAssessments: AiCropAssessment[];
  payments: Payment[];
  notifications: AppNotification[];
  myBookingId: string | null;
  paymentSequence: number;
  tokenSequence: number;
}

const MAIN_CENTRE = DEMO_CENTRES[0]!;

function initialState(): AppState {
  const slots = buildDemoSlots();
  const firstSlot = slots.find((s) => s.centre_id === MAIN_CENTRE.id)!;
  return {
    profile: null,
    farmer: DEMO_FARMER_PROFILE,
    slots,
    bookings: buildDemoQueueBookings(MAIN_CENTRE.id, firstSlot.id),
    gateEntries: [],
    queueEvents: [],
    assessments: [],
    aiAssessments: [],
    payments: [],
    notifications: [],
    myBookingId: null,
    paymentSequence: 124,
    tokenSequence: 1025,
  };
}

interface Ctx {
  state: AppState;
  /** demo farmer name lookup for authority screens */
  farmerNameFor(booking: Booking): string;
  villageFor(booking: Booking): string;
  login(profile: Profile): void;
  logout(): void;
  updateFarmer(patch: Partial<FarmerProfile>): void;
  createBooking(input: {
    centreId: string;
    slotId: string;
    quantity: number;
  }): Booking;
  cancelBooking(bookingId: string): void;
  createSlot(input: Omit<CentreSlot, "id" | "booked_count">): void;
  updateSlot(slotId: string, patch: Partial<CentreSlot>): void;
  registerRfidScan(payload: RfidScanPayload, bookingId: string): void;
  setBookingStatus(bookingId: string, status: BookingStatus): void;
  saveAssessment(input: Omit<CropAssessment, "id" | "assessed_at">): void;
  saveAiAssessment(a: AiCropAssessment): void;
  initiatePayment(bookingId: string): void;
  advancePayment(bookingId: string): void;
  notify(input: {
    recipient_role: UserRole;
    event: NotificationEvent;
    title: string;
    body: string;
  }): void;
  markNotificationsRead(role: UserRole): void;
  resetDemo(): void;
}

const SmartMandiContext = createContext<Ctx | null>(null);

export function SmartMandiProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(initialState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setState((prev) => ({ ...prev, ...(JSON.parse(raw) as AppState) }));
    } catch {
      /* ignore corrupt demo state */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* storage full or unavailable */
    }
  }, [state, hydrated]);

  const notify = useCallback<Ctx["notify"]>((input) => {
    const notification = notificationService.build(input);
    setState((s) => ({ ...s, notifications: [notification, ...s.notifications] }));
  }, []);

  const login = useCallback<Ctx["login"]>(
    (profile) => {
      setState((s) => ({ ...s, profile }));
      if (profile.role === "farmer") {
        notify({
          recipient_role: "farmer",
          event: "registration",
          title: "Welcome to SmartMandi",
          body: `You are signed in as ${profile.full_name}.`,
        });
      }
    },
    [notify],
  );

  const logout = useCallback(() => {
    setState((s) => ({ ...s, profile: null }));
  }, []);

  const updateFarmer = useCallback<Ctx["updateFarmer"]>((patch) => {
    setState((s) => ({ ...s, farmer: { ...s.farmer, ...patch } }));
  }, []);

  const createBooking = useCallback<Ctx["createBooking"]>(
    ({ centreId, slotId, quantity }) => {
      const centre = DEMO_CENTRES.find((c) => c.id === centreId)!;
      let booking!: Booking;
      setState((s) => {
        const seq = s.tokenSequence + 1;
        const cityCode = centre.city.slice(0, 3).toUpperCase();
        const token = `${WHEAT.code}-${cityCode}-${seq}`;
        booking = {
          id: `bkg-${Date.now()}`,
          farmer_profile_id: s.farmer.id,
          centre_id: centreId,
          crop_id: WHEAT.id,
          slot_id: slotId,
          token_number: token,
          expected_quantity_quintal: quantity,
          status: "booked",
          qr_data: `SMARTMANDI|${token}|${s.farmer.smartmandi_farmer_id}|${centreId}|${slotId}`,
          created_at: new Date().toISOString(),
        };
        return {
          ...s,
          tokenSequence: seq,
          myBookingId: booking.id,
          bookings: [booking, ...s.bookings],
          slots: s.slots.map((sl) =>
            sl.id === slotId ? { ...sl, booked_count: sl.booked_count + 1 } : sl,
          ),
        };
      });
      notify({
        recipient_role: "farmer",
        event: "slot_booked",
        title: "Slot booked",
        body: `Your slot at ${centre.name} is confirmed.`,
      });
      notify({
        recipient_role: "farmer",
        event: "token_generated",
        title: "Token generated",
        body: `Show token ${booking.token_number} and your QR at the gate.`,
      });
      return booking;
    },
    [notify],
  );

  const cancelBooking = useCallback<Ctx["cancelBooking"]>((bookingId) => {
    setState((s) => {
      const booking = s.bookings.find((b) => b.id === bookingId);
      return {
        ...s,
        myBookingId: s.myBookingId === bookingId ? null : s.myBookingId,
        bookings: s.bookings.filter((b) => b.id !== bookingId),
        slots: booking
          ? s.slots.map((sl) =>
              sl.id === booking.slot_id
                ? { ...sl, booked_count: Math.max(0, sl.booked_count - 1) }
                : sl,
            )
          : s.slots,
      };
    });
  }, []);

  const createSlot = useCallback<Ctx["createSlot"]>((input) => {
    setState((s) => ({
      ...s,
      slots: [
        ...s.slots,
        { ...input, id: `slot-new-${Date.now()}`, booked_count: 0 },
      ],
    }));
  }, []);

  const updateSlot = useCallback<Ctx["updateSlot"]>((slotId, patch) => {
    setState((s) => ({
      ...s,
      slots: s.slots.map((sl) => (sl.id === slotId ? { ...sl, ...patch } : sl)),
    }));
  }, []);

  const setBookingStatus = useCallback<Ctx["setBookingStatus"]>(
    (bookingId, status) => {
      setState((s) => ({
        ...s,
        bookings: s.bookings.map((b) => (b.id === bookingId ? { ...b, status } : b)),
        queueEvents:
          status === "processing"
            ? [
                {
                  id: `qe-${Date.now()}`,
                  booking_id: bookingId,
                  centre_id:
                    s.bookings.find((b) => b.id === bookingId)?.centre_id ?? "",
                  event_type: "processing_started",
                  position: null,
                  created_at: new Date().toISOString(),
                },
                ...s.queueEvents,
              ]
            : s.queueEvents,
      }));
    },
    [],
  );

  const registerRfidScan = useCallback<Ctx["registerRfidScan"]>(
    (payload, bookingId) => {
      setState((s) => {
        const entry: GateEntry = {
          id: `gate-${Date.now()}`,
          booking_id: bookingId,
          centre_id: payload.centre_id,
          rfid_id: payload.rfid_id,
          reader_id: payload.reader_id,
          entered_at: payload.timestamp,
          source: "rfid_simulator",
        };
        const queued: QueueEvent = {
          id: `qe-${Date.now()}`,
          booking_id: bookingId,
          centre_id: payload.centre_id,
          event_type: "queued",
          position: s.bookings.filter(
            (b) => b.centre_id === payload.centre_id && b.status === "waiting",
          ).length + 1,
          created_at: payload.timestamp,
        };
        return {
          ...s,
          gateEntries: [entry, ...s.gateEntries],
          queueEvents: [queued, ...s.queueEvents],
          bookings: s.bookings.map((b) =>
            b.id === bookingId ? { ...b, status: "waiting" } : b,
          ),
        };
      });
      notify({
        recipient_role: "farmer",
        event: "gate_entry",
        title: "Gate entry recorded",
        body: "Your arrival was scanned at the gate. You are now in the queue.",
      });
    },
    [notify],
  );

  const saveAssessment = useCallback<Ctx["saveAssessment"]>(
    (input) => {
      setState((s) => ({
        ...s,
        assessments: [
          { ...input, id: `asm-${Date.now()}`, assessed_at: new Date().toISOString() },
          ...s.assessments.filter((a) => a.booking_id !== input.booking_id),
        ],
        bookings: s.bookings.map((b) =>
          b.id === input.booking_id ? { ...b, status: "assessed" } : b,
        ),
      }));
      notify({
        recipient_role: "farmer",
        event: "assessment",
        title: "Quality assessment completed",
        body: "The centre has recorded the official assessment of your wheat.",
      });
    },
    [notify],
  );

  const saveAiAssessment = useCallback<Ctx["saveAiAssessment"]>((a) => {
    setState((s) => ({ ...s, aiAssessments: [a, ...s.aiAssessments] }));
  }, []);

  const initiatePayment = useCallback<Ctx["initiatePayment"]>(
    (bookingId) => {
      setState((s) => {
        const booking = s.bookings.find((b) => b.id === bookingId);
        if (!booking) return s;
        const assessment = s.assessments.find((a) => a.booking_id === bookingId);
        const rate =
          DEMO_RATES.find((r) => r.centre_id === booking.centre_id)?.rate_per_quintal ??
          2400;
        const netQuintal = assessment
          ? assessment.net_weight_kg / 100
          : booking.expected_quantity_quintal;
        const seq = s.paymentSequence + 1;
        const payment: Payment = {
          id: `pay-${Date.now()}`,
          booking_id: bookingId,
          reference: paymentService.buildReference(seq),
          amount: paymentService.calculateAmount(netQuintal, rate),
          rate_per_quintal: rate,
          net_quantity_quintal: Math.round(netQuintal * 100) / 100,
          status: "initiated",
          is_demo: true,
          updated_at: new Date().toISOString(),
        };
        return {
          ...s,
          paymentSequence: seq,
          payments: [payment, ...s.payments.filter((p) => p.booking_id !== bookingId)],
          bookings: s.bookings.map((b) =>
            b.id === bookingId ? { ...b, status: "payment_initiated" } : b,
          ),
        };
      });
      notify({
        recipient_role: "farmer",
        event: "payment_initiated",
        title: "Payment initiated",
        body: "Demo payment workflow started — no real money transfer.",
      });
    },
    [notify],
  );

  const advancePayment = useCallback<Ctx["advancePayment"]>(
    (bookingId) => {
      let becameCompleted = false;
      setState((s) => {
        const payment = s.payments.find((p) => p.booking_id === bookingId);
        if (!payment) return s;
        const next =
          payment.status === "initiated"
            ? "processing"
            : payment.status === "processing"
              ? "completed"
              : payment.status;
        becameCompleted = next === "completed";
        return {
          ...s,
          payments: s.payments.map((p) =>
            p.booking_id === bookingId
              ? { ...p, status: next, updated_at: new Date().toISOString() }
              : p,
          ),
          bookings: s.bookings.map((b) =>
            b.id === bookingId
              ? {
                  ...b,
                  status: next === "completed" ? "payment_completed" : "payment_processing",
                }
              : b,
          ),
        };
      });
      notify({
        recipient_role: "farmer",
        event: becameCompleted ? "payment_completed" : "payment_initiated",
        title: becameCompleted ? "Payment completed" : "Payment processing",
        body: becameCompleted
          ? "Demo payment marked complete. No real money was transferred."
          : "Your demo payment is being processed.",
      });
    },
    [notify],
  );

  const markNotificationsRead = useCallback<Ctx["markNotificationsRead"]>((role) => {
    setState((s) => ({
      ...s,
      notifications: s.notifications.map((n) =>
        n.recipient_role === role ? { ...n, read: true } : n,
      ),
    }));
  }, []);

  const resetDemo = useCallback(() => {
    const fresh = initialState();
    setState(fresh);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* noop */
    }
  }, []);

  const farmerNameFor = useCallback<Ctx["farmerNameFor"]>(
    (booking) => {
      if (booking.id === state.myBookingId) return state.profile?.full_name ?? "You";
      const idx = Number(booking.id.replace("bkg-demo-", "")) - 1;
      return DEMO_QUEUE_FARMERS[idx]?.name ?? "Demo Farmer";
    },
    [state.myBookingId, state.profile],
  );

  const villageFor = useCallback<Ctx["villageFor"]>(
    (booking) => {
      if (booking.id === state.myBookingId) return state.farmer.village;
      const idx = Number(booking.id.replace("bkg-demo-", "")) - 1;
      return DEMO_QUEUE_FARMERS[idx]?.village ?? "Indore";
    },
    [state.myBookingId, state.farmer.village],
  );

  const value = useMemo<Ctx>(
    () => ({
      state,
      farmerNameFor,
      villageFor,
      login,
      logout,
      updateFarmer,
      createBooking,
      cancelBooking,
      createSlot,
      updateSlot,
      registerRfidScan,
      setBookingStatus,
      saveAssessment,
      saveAiAssessment,
      initiatePayment,
      advancePayment,
      notify,
      markNotificationsRead,
      resetDemo,
    }),
    [
      state,
      farmerNameFor,
      villageFor,
      login,
      logout,
      updateFarmer,
      createBooking,
      cancelBooking,
      createSlot,
      updateSlot,
      registerRfidScan,
      setBookingStatus,
      saveAssessment,
      saveAiAssessment,
      initiatePayment,
      advancePayment,
      notify,
      markNotificationsRead,
      resetDemo,
    ],
  );

  return (
    <SmartMandiContext.Provider value={value}>{children}</SmartMandiContext.Provider>
  );
}

export function useSmartMandi(): Ctx {
  const ctx = useContext(SmartMandiContext);
  if (!ctx) throw new Error("useSmartMandi must be used inside SmartMandiProvider");
  return ctx;
}

/** Booking of the signed-in demo farmer, if any. */
export function useMyBooking(): Booking | null {
  const { state } = useSmartMandi();
  return state.bookings.find((b) => b.id === state.myBookingId) ?? null;
}

const STAGE_BY_STATUS: Record<BookingStatus, JourneyStage> = {
  booked: "Slot Booked",
  arrived: "Arrived at Gate",
  waiting: "Waiting",
  processing: "Processing",
  assessed: "Quality Assessment",
  procured: "Procurement Completed",
  payment_initiated: "Payment Initiated",
  payment_processing: "Payment Processing",
  payment_completed: "Payment Completed",
  cancelled: "Registration",
  no_show: "Slot Booked",
};

export function journeyStageFor(booking: Booking | null): JourneyStage {
  if (!booking) return "Registration";
  if (booking.status === "booked") return "Token Generated";
  return STAGE_BY_STATUS[booking.status];
}
