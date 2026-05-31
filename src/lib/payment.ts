// Replace these three placeholders before opening registration to the public.
// Do not deploy a public registration form with placeholder bank account data.
export const PAYMENT_CONFIG = {
  bankName: "Bank Digital BCA",
  accountNumber: "009885436890",
  accountHolder: "Amalia Fa'iqotus Silvia",
  adminWhatsapp: "6285124739344",
} as const;

export const PAYMENT_TIERS = [
  { id: "WAVE_1", label: "Gelombang 1", amount: 285_000 },
  { id: "WAVE_2", label: "Gelombang 2", amount: 335_000 },
  { id: "WAVE_3_OTS", label: "Gelombang 3 / OTS", amount: 400_000 },
  { id: "GENERAL", label: "Peserta Umum", amount: 1_000_000 },
] as const;

export type PaymentTierId = (typeof PAYMENT_TIERS)[number]["id"];

export function getPaymentTier(id: string) {
  return PAYMENT_TIERS.find((tier) => tier.id === id);
}

export function normalizePaymentWhatsapp(value: string) {
  return value.replace(/\D/g, "");
}

export function getPaymentUniqueCode(whatsapp: string) {
  const digits = normalizePaymentWhatsapp(whatsapp);
  const code = Number(digits.slice(-3));
  return code === 0 ? 111 : code;
}

export function formatPaymentUniqueCode(code: number) {
  return String(code).padStart(3, "0");
}

export function formatRupiah(amount: number) {
  return `Rp${amount.toLocaleString("id-ID")}`;
}

export function isPaymentConfigReady() {
  return [
    PAYMENT_CONFIG.bankName,
    PAYMENT_CONFIG.accountNumber,
    PAYMENT_CONFIG.accountHolder,
  ].every((value) => value.trim() && !value.startsWith("ISI_"));
}

export function calculatePaymentDetails(paymentTier: string, whatsapp: string) {
  const tier = getPaymentTier(paymentTier);
  if (!tier) return undefined;

  const uniqueCode = getPaymentUniqueCode(whatsapp);
  return {
    tier,
    uniqueCode,
    totalAmount: tier.amount + uniqueCode,
  };
}
