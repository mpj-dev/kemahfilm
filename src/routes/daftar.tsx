import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Upload,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import {
  submitRegistration,
  fileToBase64,
  rememberSuccessfulRegistration,
} from "@/lib/registration";

export const Route = createFileRoute("/daftar")({
  head: () => ({
    meta: [
      { title: "Daftar Peserta — Kemah Film MPJ 2026" },
      { name: "description", content: "Formulir pendaftaran peserta Kemah Film MPJ 2026." },
      { property: "og:title", content: "Daftar Peserta — Kemah Film MPJ 2026" },
      { property: "og:description", content: "Formulir pendaftaran peserta Kemah Film MPJ 2026." },
    ],
    links: [{ rel: "canonical", href: "/daftar" }],
  }),
  component: DaftarPage,
});

type FormState = {
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
  surat_delegasi_file: File | null;
  bukti_pembayaran_file: File | null;
  agreement: boolean;
  website: string;
};

const STEPS = ["Identitas", "Kemampuan", "Pengalaman", "Berkas", "Persetujuan"];
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_FILE_TYPES = ["application/pdf", "image/jpeg", "image/png"];

const initial: FormState = {
  nama: "",
  asal_pesantren: "",
  alamat_pesantren: "",
  whatsapp: "",
  kemampuan: "",
  tingkat_kemampuan: "",
  pengalaman_produksi: "",
  kendala_produksi: "",
  motivasi: "",
  link_karya: "",
  surat_delegasi_file: null,
  bukti_pembayaran_file: null,
  agreement: false,
  website: "",
};

function isUrl(s: string) {
  try {
    new URL(s);
    return true;
  } catch {
    return false;
  }
}

function validateUpload(file: File | null, label: string) {
  if (!file) return `${label} wajib dipilih`;
  if (file.size <= 0) return `${label} tidak boleh kosong`;
  if (file.size > MAX_FILE_SIZE) return `Ukuran ${label.toLowerCase()} maksimal 5 MB`;
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return `Format ${label.toLowerCase()} harus PDF, JPG, atau PNG`;
  }
  return undefined;
}

function DaftarPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<FormState>(initial);
  const [formStartedAt] = useState(() => new Date().toISOString());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const update = <K extends keyof FormState>(k: K, v: FormState[K]) => {
    setData((d) => ({ ...d, [k]: v }));
    setErrors((e) => ({ ...e, [k]: "" }));
  };

  function validateStep(s: number): boolean {
    const e: Record<string, string> = {};
    if (s === 0) {
      if (!data.nama.trim()) e.nama = "Nama wajib diisi";
      if (!data.asal_pesantren.trim()) e.asal_pesantren = "Asal pesantren wajib diisi";
      if (!data.alamat_pesantren.trim()) e.alamat_pesantren = "Alamat pesantren wajib diisi";
      const wa = data.whatsapp.replace(/\D/g, "");
      if (wa.length < 10) e.whatsapp = "WhatsApp minimal 10 digit";
    }
    if (s === 1) {
      if (!data.kemampuan) e.kemampuan = "Pilih bidang kemampuan";
      if (!data.tingkat_kemampuan) e.tingkat_kemampuan = "Pilih tingkat kemampuan";
    }
    if (s === 2) {
      if (data.pengalaman_produksi.trim().length < 50)
        e.pengalaman_produksi = "Minimal 50 karakter";
      if (data.kendala_produksi.trim().length < 30) e.kendala_produksi = "Minimal 30 karakter";
      if (data.motivasi.trim().length < 50) e.motivasi = "Minimal 50 karakter";
    }
    if (s === 3) {
      if (!data.link_karya.trim() || !isUrl(data.link_karya))
        e.link_karya = "Harus berupa URL valid";
      const suratDelegasiError = validateUpload(data.surat_delegasi_file, "Surat delegasi");
      const buktiPembayaranError = validateUpload(data.bukti_pembayaran_file, "Bukti pembayaran");
      if (suratDelegasiError) e.surat_delegasi_file = suratDelegasiError;
      if (buktiPembayaranError) e.bukti_pembayaran_file = buktiPembayaranError;
    }
    if (s === 4) {
      if (!data.agreement) e.agreement = "Wajib menyetujui ketentuan";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit() {
    if (!validateStep(4)) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const [surat, bukti] = await Promise.all([
        data.surat_delegasi_file ? fileToBase64(data.surat_delegasi_file) : Promise.resolve(null),
        data.bukti_pembayaran_file
          ? fileToBase64(data.bukti_pembayaran_file)
          : Promise.resolve(null),
      ]);
      const res = await submitRegistration({
        nama: data.nama.trim(),
        asal_pesantren: data.asal_pesantren.trim(),
        alamat_pesantren: data.alamat_pesantren.trim(),
        whatsapp: data.whatsapp.trim(),
        kemampuan: data.kemampuan,
        tingkat_kemampuan: data.tingkat_kemampuan,
        pengalaman_produksi: data.pengalaman_produksi.trim(),
        kendala_produksi: data.kendala_produksi.trim(),
        motivasi: data.motivasi.trim(),
        link_karya: data.link_karya.trim(),
        surat_delegasi_file: surat,
        bukti_pembayaran_file: bukti,
        agreement: data.agreement,
        website: data.website,
        form_started_at: formStartedAt,
        source: "kemahfilm.mediapondokjatim.id",
        user_agent: typeof navigator !== "undefined" ? navigator.userAgent : "",
      });
      rememberSuccessfulRegistration(res.registration_id);
      navigate({ to: "/sukses", search: { id: res.registration_id } });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Terjadi kesalahan. Coba lagi.");
    } finally {
      setSubmitting(false);
    }
  }

  function next() {
    if (!validateStep(step)) return;
    if (step < STEPS.length - 1) setStep(step + 1);
    else handleSubmit();
  }
  function prev() {
    if (step > 0) setStep(step - 1);
  }

  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="mx-auto max-w-2xl px-4 sm:px-6 py-10 sm:py-14">
        <div className="mb-6">
          <Link
            to="/"
            className="text-sm text-muted-foreground hover:text-primary inline-flex items-center gap-1"
          >
            <ChevronLeft className="h-4 w-4" /> Beranda
          </Link>
          <h1 className="mt-3 text-3xl sm:text-4xl font-bold text-primary-dark">
            Pendaftaran Peserta
          </h1>
          <p className="mt-2 text-muted-foreground">
            Lengkapi {STEPS.length} langkah berikut. Estimasi 5–7 menit.
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between text-xs font-semibold text-muted-foreground mb-2">
            <span>
              Langkah {step + 1} dari {STEPS.length}
            </span>
            <span className="text-primary">{STEPS[step]}</span>
          </div>
          <div className="h-2 rounded-full bg-secondary overflow-hidden">
            <motion.div
              className="h-full bg-gradient-accent"
              initial={false}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          </div>
        </div>

        <div className="rounded-3xl bg-card p-6 sm:p-8 shadow-card border border-border/40">
          <input
            type="text"
            name="website"
            value={data.website}
            onChange={(e) => update("website", e.target.value)}
            className="hidden"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
          />
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="space-y-5"
            >
              {step === 0 && (
                <>
                  <h2 className="text-lg font-bold text-primary-dark">Identitas Peserta</h2>
                  <Field label="Nama Lengkap" error={errors.nama}>
                    <input
                      className={inputCls(errors.nama)}
                      value={data.nama}
                      onChange={(e) => update("nama", e.target.value)}
                      placeholder="Nama sesuai KTP/identitas"
                    />
                  </Field>
                  <Field label="Asal Pesantren" error={errors.asal_pesantren}>
                    <input
                      className={inputCls(errors.asal_pesantren)}
                      value={data.asal_pesantren}
                      onChange={(e) => update("asal_pesantren", e.target.value)}
                      placeholder="Contoh: PP. Lirboyo"
                    />
                  </Field>
                  <Field label="Alamat Pesantren" error={errors.alamat_pesantren}>
                    <textarea
                      rows={2}
                      className={inputCls(errors.alamat_pesantren)}
                      value={data.alamat_pesantren}
                      onChange={(e) => update("alamat_pesantren", e.target.value)}
                      placeholder="Alamat lengkap pesantren"
                    />
                  </Field>
                  <Field
                    label="Nomor WhatsApp Aktif"
                    error={errors.whatsapp}
                    hint="Minimal 10 digit, contoh: 081234567890"
                  >
                    <input
                      type="tel"
                      inputMode="numeric"
                      className={inputCls(errors.whatsapp)}
                      value={data.whatsapp}
                      onChange={(e) => update("whatsapp", e.target.value)}
                      placeholder="08xxxxxxxxxx"
                    />
                  </Field>
                </>
              )}

              {step === 1 && (
                <>
                  <h2 className="text-lg font-bold text-primary-dark">Bidang Kemampuan</h2>
                  <Field label="Di mana kemampuanmu?" error={errors.kemampuan}>
                    <div className="grid gap-2">
                      {["Sutradara & Script Writer", "DOP & Editor", "Keduanya"].map((o) => (
                        <RadioCard
                          key={o}
                          label={o}
                          checked={data.kemampuan === o}
                          onChange={() => update("kemampuan", o)}
                        />
                      ))}
                    </div>
                  </Field>
                  <Field label="Tingkat Kemampuan" error={errors.tingkat_kemampuan}>
                    <div className="grid grid-cols-3 gap-2">
                      {["Basic", "Intermediate", "Advanced"].map((o) => (
                        <button
                          key={o}
                          type="button"
                          onClick={() => update("tingkat_kemampuan", o)}
                          className={`rounded-xl border-2 px-3 py-3 text-sm font-semibold transition ${
                            data.tingkat_kemampuan === o
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border bg-card hover:border-primary/40"
                          }`}
                        >
                          {o}
                        </button>
                      ))}
                    </div>
                  </Field>
                </>
              )}

              {step === 2 && (
                <>
                  <h2 className="text-lg font-bold text-primary-dark">Pengalaman & Motivasi</h2>
                  <Field
                    label="Pengalaman produksi film sesuai kemampuanmu"
                    error={errors.pengalaman_produksi}
                    hint={`${data.pengalaman_produksi.length}/min. 50 karakter`}
                  >
                    <textarea
                      rows={4}
                      className={inputCls(errors.pengalaman_produksi)}
                      value={data.pengalaman_produksi}
                      onChange={(e) => update("pengalaman_produksi", e.target.value)}
                      placeholder="Ceritakan project, peran, dan hasilnya..."
                    />
                  </Field>
                  <Field
                    label="Kendala yang sering kamu hadapi saat produksi film"
                    error={errors.kendala_produksi}
                    hint={`${data.kendala_produksi.length}/min. 30 karakter`}
                  >
                    <textarea
                      rows={3}
                      className={inputCls(errors.kendala_produksi)}
                      value={data.kendala_produksi}
                      onChange={(e) => update("kendala_produksi", e.target.value)}
                      placeholder="Misal: keterbatasan alat, tim, ide, dsb."
                    />
                  </Field>
                  <Field
                    label="Motivasi mengikuti Kemah Film MPJ 2026"
                    error={errors.motivasi}
                    hint={`${data.motivasi.length}/min. 50 karakter`}
                  >
                    <textarea
                      rows={4}
                      className={inputCls(errors.motivasi)}
                      value={data.motivasi}
                      onChange={(e) => update("motivasi", e.target.value)}
                      placeholder="Apa yang ingin kamu pelajari dan capai?"
                    />
                  </Field>
                </>
              )}

              {step === 3 && (
                <>
                  <h2 className="text-lg font-bold text-primary-dark">Link Karya & Berkas</h2>
                  <Field
                    label="Link film/video karya orisinilmu"
                    error={errors.link_karya}
                    hint="YouTube, Instagram, TikTok, Google Drive, dll. Pastikan link dapat diakses panitia."
                  >
                    <input
                      type="url"
                      className={inputCls(errors.link_karya)}
                      value={data.link_karya}
                      onChange={(e) => update("link_karya", e.target.value)}
                      placeholder="https://..."
                    />
                  </Field>
                  <FileField
                    label="Surat delegasi dari media/pesantren"
                    hint="Format: PDF, JPG, atau PNG"
                    file={data.surat_delegasi_file}
                    onChange={(f) => update("surat_delegasi_file", f)}
                    error={errors.surat_delegasi_file}
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                  <FileField
                    label="Bukti pembayaran"
                    hint="Format: PDF, JPG, atau PNG"
                    file={data.bukti_pembayaran_file}
                    onChange={(f) => update("bukti_pembayaran_file", f)}
                    error={errors.bukti_pembayaran_file}
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                </>
              )}

              {step === 4 && (
                <>
                  <h2 className="text-lg font-bold text-primary-dark">Persetujuan</h2>
                  <div className="rounded-2xl bg-secondary p-5 text-sm text-foreground/85 leading-relaxed">
                    Dengan submit form ini, saya menyatakan telah memahami segala aturan dan
                    ketentuan pelaksanaan kegiatan
                    <strong> Kemah Film MPJ 2026</strong> serta siap mengikuti seluruh rangkaian
                    kegiatan mulai dari Technical Meeting hingga penutupan. Saya juga siap menerima
                    sanksi atau punishment dari panitia penyelenggara apabila melanggar segala
                    bentuk aturan dan ketentuan kegiatan Kemah Film MPJ 2026.
                  </div>
                  <label
                    className={`flex gap-3 items-start rounded-2xl border-2 p-4 cursor-pointer transition ${
                      data.agreement
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/40"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={data.agreement}
                      onChange={(e) => update("agreement", e.target.checked)}
                      className="mt-1 h-5 w-5 accent-primary"
                    />
                    <span className="text-sm font-medium text-foreground">
                      Saya menyetujui seluruh ketentuan di atas.
                    </span>
                  </label>
                  {errors.agreement && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" /> {errors.agreement}
                    </p>
                  )}
                  {submitError && (
                    <div className="rounded-xl bg-destructive/10 border border-destructive/30 p-3 text-sm text-destructive flex gap-2">
                      <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" /> {submitError}
                    </div>
                  )}
                </>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="mt-8 flex gap-3">
            {step > 0 && (
              <button
                type="button"
                onClick={prev}
                disabled={submitting}
                className="inline-flex items-center justify-center gap-1 rounded-full border border-border bg-card px-5 py-3 text-sm font-semibold text-foreground hover:bg-secondary transition disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" /> Kembali
              </button>
            )}
            <button
              type="button"
              onClick={next}
              disabled={submitting}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-soft hover:bg-primary-dark transition disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Mengirim...
                </>
              ) : step === STEPS.length - 1 ? (
                <>
                  <CheckCircle2 className="h-4 w-4" /> Kirim Pendaftaran
                </>
              ) : (
                <>
                  Lanjut <ChevronRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}

function inputCls(error?: string) {
  return `w-full rounded-xl border-2 bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 transition focus:outline-none focus:ring-2 focus:ring-primary/30 ${
    error ? "border-destructive/60" : "border-border focus:border-primary"
  }`;
}

function Field({
  label,
  error,
  hint,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-foreground mb-1.5">
        {label} <span className="text-destructive">*</span>
      </label>
      {children}
      {error ? (
        <p className="mt-1.5 text-xs text-destructive flex items-center gap-1">
          <AlertCircle className="h-3 w-3" /> {error}
        </p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

function RadioCard({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`text-left rounded-xl border-2 px-4 py-3 text-sm font-medium transition flex items-center justify-between ${
        checked
          ? "border-primary bg-primary/5 text-primary-dark"
          : "border-border bg-card hover:border-primary/40"
      }`}
    >
      <span>{label}</span>
      <span
        className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${checked ? "border-primary" : "border-border"}`}
      >
        {checked && <span className="h-2.5 w-2.5 rounded-full bg-primary" />}
      </span>
    </button>
  );
}

function FileField({
  label,
  hint,
  file,
  onChange,
  error,
  accept,
}: {
  label: string;
  hint?: string;
  file: File | null;
  error?: string;
  accept: string;
  onChange: (f: File | null) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-foreground mb-1.5">
        {label} <span className="text-destructive">*</span>
      </label>
      <label
        className={`flex items-center gap-3 rounded-xl border-2 border-dashed bg-secondary/40 px-4 py-4 cursor-pointer hover:bg-secondary transition ${error ? "border-destructive/60" : "border-border"}`}
      >
        <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
          <Upload className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          {file ? (
            <>
              <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
              <p className="text-xs text-muted-foreground">
                {(file.size / 1024).toFixed(0)} KB · klik untuk ganti
              </p>
            </>
          ) : (
            <>
              <p className="text-sm font-medium text-foreground">Pilih file</p>
              <p className="text-xs text-muted-foreground">{hint}</p>
            </>
          )}
        </div>
        <input
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => onChange(e.target.files?.[0] ?? null)}
        />
      </label>
      {error && (
        <p className="mt-1.5 text-xs text-destructive flex items-center gap-1">
          <AlertCircle className="h-3 w-3" /> {error}
        </p>
      )}
    </div>
  );
}
