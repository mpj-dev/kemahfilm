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
  { id: "GENERAL", label: "Peserta Umum", amount: 1_000_000 },
] as const;

export const EVENT_SCHEDULE = {
  eventDateLabel: "4–6 September 2026",
  wave1Label: "1–31 Juli 2026",
  wave2Label: "1–25 Agustus 2026",
  registrationStart: "2026-07-01",
  wave1End: "2026-07-31",
  wave2Start: "2026-08-01",
  registrationEnd: "2026-08-25",
} as const;

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

export function getJakartaDate(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function getRegistrationStatus(date = new Date()) {
  const jakartaDate = getJakartaDate(date);

  if (jakartaDate < EVENT_SCHEDULE.registrationStart) {
    return { status: "UPCOMING", label: "Pendaftaran Segera Dibuka" } as const;
  }
  if (jakartaDate <= EVENT_SCHEDULE.wave1End) {
    return { status: "OPEN", label: "Pendaftaran Dibuka - Gelombang 1" } as const;
  }
  if (jakartaDate >= EVENT_SCHEDULE.wave2Start && jakartaDate <= EVENT_SCHEDULE.registrationEnd) {
    return { status: "OPEN", label: "Pendaftaran Dibuka - Gelombang 2" } as const;
  }
  return { status: "CLOSED", label: "Pendaftaran Ditutup" } as const;
}

export function getCurrentPaymentTier(delegationType: DelegationType, date = new Date()) {
  const jakartaDate = getJakartaDate(date);
  if (
    jakartaDate < EVENT_SCHEDULE.registrationStart ||
    jakartaDate > EVENT_SCHEDULE.registrationEnd
  ) {
    return undefined;
  }
  if (delegationType === "NO_DELEGATION") return getPaymentTier("GENERAL");

  if (jakartaDate >= EVENT_SCHEDULE.wave2Start && jakartaDate <= EVENT_SCHEDULE.registrationEnd) {
    return getPaymentTier("WAVE_2");
  }
  if (jakartaDate >= EVENT_SCHEDULE.registrationStart && jakartaDate <= EVENT_SCHEDULE.wave1End) {
    return getPaymentTier("WAVE_1");
  }
  return undefined;
}

export function calculatePaymentSummary(delegationType: DelegationType | "", whatsapp: string) {
  if (!delegationType) return undefined;
  if (getRegistrationStatus().status === "CLOSED") return undefined;
  const tier = getCurrentPaymentTier(delegationType);
  if (!tier) return undefined;
  const uniqueCode = createPaymentUniqueCode(whatsapp);
  return {
    tier,
    uniqueCode,
    totalAmount: tier.amount + uniqueCode,
  };
}
