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

export const REGIONAL_OPTIONS = [
  "Regional Dapil IV",
  "Regional Situbondo-Bondowoso",
  "Regional SidoPas",
  "Regional Banyuwangi",
  "Regional Malang Raya",
  "Regional Blitar",
  "Regional Ojo Lamban",
  "Regional Jombang",
  "Regional Kediri",
  "Regional Nganjuk",
  "Regional Plat AE",
  "Regional Madura",
  "Regional Tulungagung-Trenggalek",
  "Regional Mojokerto",
  "Regional Probolinggo",
  "Regional SBY-GRESIK",
] as const;

export type PaymentTierId = (typeof PAYMENT_TIERS)[number]["id"];
export type DelegationStatus = "HAS_DELEGATION" | "NO_DELEGATION";
export type DelegationType = "MPJ_REGIONAL" | "OTHER_COMMUNITY" | "NO_DELEGATION";

export function getPaymentTier(id: string) {
  return PAYMENT_TIERS.find((tier) => tier.id === id);
}

export function normalizeWhatsapp(value: string) {
  let number = value.replace(/\D/g, "");
  if (number.startsWith("0")) number = `62${number.slice(1)}`;
  if (number.startsWith("620")) number = `62${number.slice(3)}`;
  return number;
}

export function createPaymentUniqueCode(whatsapp: string) {
  const digits = normalizeWhatsapp(whatsapp);
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

export function getLegacyDelegationStatus(delegationType: DelegationType): DelegationStatus {
  return delegationType === "NO_DELEGATION" ? "NO_DELEGATION" : "HAS_DELEGATION";
}

export function getCurrentPaymentTier(delegationType: DelegationType, date = new Date()) {
  if (delegationType === "NO_DELEGATION") return getPaymentTier("GENERAL");

  const jakartaDate = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
  if (jakartaDate >= "2026-06-26") return getPaymentTier("WAVE_3_OTS");
  if (jakartaDate >= "2026-06-15") return getPaymentTier("WAVE_2");
  return getPaymentTier("WAVE_1");
}

export function calculatePaymentSummary(delegationType: DelegationType | "", whatsapp: string) {
  if (!delegationType) return undefined;
  const tier = getCurrentPaymentTier(delegationType);
  if (!tier) return undefined;
  const uniqueCode = createPaymentUniqueCode(whatsapp);
  return {
    tier,
    uniqueCode,
    totalAmount: tier.amount + uniqueCode,
  };
}
