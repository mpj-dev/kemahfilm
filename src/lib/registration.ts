export interface RegistrationPayload {
  nama: string;
  asal_pesantren: string;
  alamat_pesantren: string;
  whatsapp: string;
  kemampuan: string;
  tingkat_kemampuan: string;
  pengalaman_produksi: string;
  kendala_produksi: string;
  motivasi: string;
  link_karya: string;
  surat_delegasi_file: { name: string; type: string; data: string } | null;
  bukti_pembayaran_file: { name: string; type: string; data: string } | null;
  agreement: boolean;
  website: string;
  form_started_at: string;
  payment_tier: string;
  payment_base_amount: number;
  payment_unique_code: number;
  payment_total_amount: number;
  payment_bank_name: string;
  payment_account_number: string;
  payment_account_holder: string;
  payment_status: "WAITING_ADMIN_APPROVAL";
  source: string;
  user_agent: string;
}

interface RegistrationResponse {
  ok?: boolean;
  registration_id?: string;
  error?: string;
}

const SUCCESSFUL_REGISTRATION_ID_KEY = "kemahfilmmpj:successful-registration-id";

export interface SuccessfulRegistration {
  registrationId: string;
  paymentTotalAmount?: number;
  paymentStatus?: "WAITING_ADMIN_APPROVAL";
}

export async function submitRegistration(
  payload: RegistrationPayload,
): Promise<{ registration_id: string }> {
  const apiUrl = (import.meta.env.VITE_GAS_ENDPOINT as string | undefined)?.trim();

  if (!apiUrl) {
    if (!import.meta.env.DEV) {
      throw new Error("Konfigurasi pendaftaran belum tersedia. Silakan hubungi panitia.");
    }

    // Local fallback keeps the UI testable before a development endpoint is configured.
    await new Promise((r) => setTimeout(r, 900));
    return { registration_id: "KFMPJ-" + Math.random().toString(36).slice(2, 8).toUpperCase() };
  }

  if (import.meta.env.DEV) {
    console.info("[registration] GAS endpoint:", apiUrl);
  }

  const res = await fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(payload),
  });

  if (import.meta.env.DEV) {
    console.info("[registration] GAS response status:", res.status);
  }

  if (!res.ok) throw new Error("Gagal mengirim pendaftaran. Silakan coba lagi.");

  const body = (await res.json()) as RegistrationResponse;
  if (!body.ok) throw new Error(body.error || "Gagal mengirim pendaftaran. Silakan coba lagi.");
  if (!body.registration_id) {
    throw new Error("ID pendaftaran tidak diterima. Silakan hubungi panitia.");
  }

  return { registration_id: body.registration_id };
}

export function fileToBase64(file: File): Promise<{ name: string; type: string; data: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve({ name: file.name, type: file.type, data: result.split(",")[1] ?? "" });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function rememberSuccessfulRegistration(registration: SuccessfulRegistration) {
  if (typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.setItem(SUCCESSFUL_REGISTRATION_ID_KEY, JSON.stringify(registration));
  } catch {
    // A successful backend submission must not fail when browser storage is unavailable.
  }
}

export function getSuccessfulRegistration(registrationId?: string) {
  if (!registrationId || typeof sessionStorage === "undefined") return undefined;
  try {
    const stored = sessionStorage.getItem(SUCCESSFUL_REGISTRATION_ID_KEY);
    if (!stored) return undefined;

    // Keep submissions from the previous frontend version valid during rollout.
    if (stored === registrationId) return { registrationId };

    const registration = JSON.parse(stored) as SuccessfulRegistration;
    return registration.registrationId === registrationId ? registration : undefined;
  } catch {
    return undefined;
  }
}
