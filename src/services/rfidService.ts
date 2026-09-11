import { isConfigured } from "./config";

/**
 * RFID gate identification.
 *
 * The payload below is the contract a real reader gateway must POST.
 * Today it is produced by the on-screen DEMO simulator only.
 */
export interface RfidScanPayload {
  rfid_id: string;
  reader_id: string;
  centre_id: string;
  timestamp: string;
}

export interface RfidServiceContract {
  isReady(): boolean;
  readerStatus(): "hardware_connected" | "simulator";
  buildScan(input: { rfid_id: string; reader_id: string; centre_id: string }): RfidScanPayload;
}

export const rfidService: RfidServiceContract = {
  isReady: () => isConfigured("rfid"),
  readerStatus: () => (isConfigured("rfid") ? "hardware_connected" : "simulator"),
  buildScan: ({ rfid_id, reader_id, centre_id }) => ({
    rfid_id,
    reader_id,
    centre_id,
    timestamp: new Date().toISOString(),
  }),
};
