import { isConfigured } from "./config";

/**
 * Payment workflow adapter.
 * DEMO ONLY — no money moves. Connect a real gateway later behind this contract.
 */
export interface PaymentServiceContract {
  isReady(): boolean;
  buildReference(sequence: number, date?: Date): string;
  calculateAmount(netQuantityQuintal: number, ratePerQuintal: number): number;
}

export const paymentService: PaymentServiceContract = {
  isReady: () => isConfigured("payment"),

  buildReference(sequence, date = new Date()) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `PAY-SM-${y}${m}${d}-${String(sequence).padStart(5, "0")}`;
  },

  calculateAmount(netQuantityQuintal, ratePerQuintal) {
    return Math.round(netQuantityQuintal * ratePerQuintal);
  },
};

export const PAYMENT_DISCLAIMER =
  "Demo payment workflow — no real money transfer.";
