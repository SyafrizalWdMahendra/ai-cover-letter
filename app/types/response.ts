export interface GenerateResponse {
  success: boolean;
  data?: string | null;
  error?: string | null;
}

export type TCreditCounterSlot = {
  creditCounterSlot: React.ReactNode;
};
