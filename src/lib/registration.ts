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
  source: string;
  user_agent: string;
}

export async function submitRegistration(
  payload: RegistrationPayload,
): Promise<{ registration_id?: string }> {
  const API_URL = import.meta.env.VITE_GAS_ENDPOINT as string | undefined;
  if (!API_URL) {
    // Placeholder fallback: generate a local mock id so flow can be tested before GAS is wired up.
    await new Promise((r) => setTimeout(r, 900));
    return { registration_id: "KFMPJ-" + Math.random().toString(36).slice(2, 8).toUpperCase() };
  }
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=UTF-8" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Gagal mengirim pendaftaran");
  const body = (await res.json()) as { ok?: boolean; registration_id?: string; error?: string };
  if (!body.ok) throw new Error(body.error || "Gagal mengirim pendaftaran");
  return body;
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
