import type { Profile, UserRole } from "@/types/domain";
import { isConfigured, serviceConfig } from "./config";

/**
 * Auth + data adapter.
 *
 * Today: demo implementation backed by local state (no database, no network).
 * Later: replace the demo body with a real Supabase client created from
 * serviceConfig.supabase — the UI calls only this interface, so no page needs
 * to change.
 */
export interface SupabaseServiceContract {
  isReady(): boolean;
  requestOtp(phone: string): Promise<{ sent: boolean; demoOtp?: string }>;
  verifyOtp(
    phone: string,
    otp: string,
    role: UserRole,
    fullName?: string,
  ): Promise<Profile>;
  signOut(): Promise<void>;
  /** Placeholder for Supabase Storage uploads (crop images, documents). */
  uploadFile(bucket: string, file: File): Promise<{ path: string; url: string }>;
  /** Placeholder for Supabase Realtime channel subscription. */
  subscribe(channel: string, handler: (payload: unknown) => void): () => void;
}

export const DEMO_OTP = "1234";

export const supabaseService: SupabaseServiceContract = {
  isReady: () => isConfigured("supabase") && serviceConfig.supabase.url !== "",

  async requestOtp(phone) {
    await delay(500);
    if (!/^\d{10}$/.test(phone)) throw new Error("Enter a valid 10-digit mobile number");
    return { sent: true, demoOtp: DEMO_OTP };
  },

  async verifyOtp(phone, otp, role, fullName) {
    await delay(500);
    if (otp !== DEMO_OTP) throw new Error("Wrong code. In demo mode the code is 1234.");
    return {
      id: `profile-${phone}`,
      role,
      full_name: fullName?.trim() || (role === "farmer" ? "Demo Farmer" : "Centre Officer"),
      phone,
      preferred_language: "en",
      created_at: new Date().toISOString(),
    };
  },

  async signOut() {
    await delay(150);
  },

  async uploadFile(bucket, file) {
    await delay(300);
    const url = URL.createObjectURL(file);
    return { path: `${bucket}/demo/${file.name}`, url };
  },

  subscribe(_channel, _handler) {
    // Demo mode: realtime changes are simulated inside the local store.
    return () => {};
  },
};

export function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
