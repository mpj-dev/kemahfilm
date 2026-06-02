import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { CheckCircle2, MessageCircle, Home, ClipboardList } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { getSuccessfulRegistration, type SuccessfulRegistration } from "@/lib/registration";
import { PAYMENT_CONFIG, formatRupiah, getPaymentTier } from "@/lib/payment";

export const Route = createFileRoute("/sukses")({
  head: () => ({
    meta: [
      { title: "Pendaftaran Berhasil — Kemah Film MPJ 2026" },
      { name: "description", content: "Pendaftaran Kemah Film MPJ 2026 berhasil dikirim." },
      { name: "robots", content: "noindex" },
    ],
  }),
  validateSearch: (s: Record<string, unknown>) => ({
    id: typeof s.id === "string" ? s.id : undefined,
  }),
  component: SuksesPage,
});

function SuksesPage() {
  const { id } = useSearch({ from: "/sukses" });
  const [registration, setRegistration] = useState<SuccessfulRegistration>();

  useEffect(() => {
    setRegistration(getSuccessfulRegistration(id));
  }, [id]);

  const isValidSuccess = Boolean(registration);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteHeader />
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-xl rounded-3xl bg-card p-8 sm:p-10 shadow-soft border border-border/40 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.15, type: "spring", stiffness: 200 }}
            className="mx-auto h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center"
          >
            {isValidSuccess ? (
              <CheckCircle2 className="h-12 w-12 text-primary" />
            ) : (
              <ClipboardList className="h-12 w-12 text-primary" />
            )}
          </motion.div>
          <h1 className="mt-6 text-3xl sm:text-4xl font-bold text-primary-dark">
            {isValidSuccess ? "Pendaftaran Berhasil Dikirim" : "Status Pendaftaran"}
          </h1>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            {isValidSuccess
              ? "Pendaftaran dan bukti pembayaran kamu telah dikirim. Panitia akan memvalidasi pembayaran terlebih dahulu. ID resmi peserta akan diberikan setelah pembayaran di-ACC oleh admin."
              : "Belum ada konfirmasi pendaftaran pada sesi browser ini. Silakan isi formulir pendaftaran atau kembali ke beranda."}
          </p>

          {isValidSuccess && id && (
            <div className="mt-6 rounded-2xl bg-secondary p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Nomor Pendaftaran
              </p>
              <p className="mt-1 text-2xl font-bold text-primary-dark font-mono tracking-wider">
                {id}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                Simpan nomor ini untuk keperluan konfirmasi.
              </p>
              <div className="mt-4 border-t border-border pt-4">
                {registration?.delegationType && (
                  <>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Status Delegasi
                    </p>
                    <p className="mt-1 font-semibold text-primary-dark">
                      {registration.delegationType === "MPJ_REGIONAL"
                        ? "Dari Regional MPJ"
                        : registration.delegationType === "OTHER_COMMUNITY"
                          ? "Dari komunitas/lembaga lain"
                          : "Tidak memiliki surat delegasi"}
                    </p>
                  </>
                )}
                {registration?.regional && (
                  <>
                    <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Regional
                    </p>
                    <p className="mt-1 font-semibold text-primary-dark">{registration.regional}</p>
                  </>
                )}
                {registration?.communityName && (
                  <>
                    <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Nama Komunitas/Lembaga
                    </p>
                    <p className="mt-1 font-semibold text-primary-dark">
                      {registration.communityName}
                    </p>
                  </>
                )}
                {registration?.paymentTier && (
                  <>
                    <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Kategori Pembayaran
                    </p>
                    <p className="mt-1 font-semibold text-primary-dark">
                      {getPaymentTier(registration.paymentTier)?.label}
                    </p>
                  </>
                )}
                <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Status Validasi Pembayaran
                </p>
                <p className="mt-1 font-bold text-accent">Menunggu validasi pembayaran admin</p>
                {registration?.paymentTotalAmount && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    Total transfer:{" "}
                    <span className="font-semibold text-primary-dark">
                      {formatRupiah(registration.paymentTotalAmount)}
                    </span>
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            {isValidSuccess ? (
              <a
                href={`https://wa.me/${PAYMENT_CONFIG.adminWhatsapp}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-accent px-6 py-3 font-semibold text-accent-foreground hover:opacity-90 transition"
              >
                <MessageCircle className="h-4 w-4" /> Hubungi Admin
              </a>
            ) : (
              <Link
                to="/daftar"
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground hover:bg-primary-dark transition"
              >
                <ClipboardList className="h-4 w-4" /> Isi Formulir
              </Link>
            )}
            <Link
              to="/"
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-secondary px-6 py-3 font-semibold text-secondary-foreground hover:bg-secondary/80 transition"
            >
              <Home className="h-4 w-4" /> Kembali ke Beranda
            </Link>
          </div>
        </motion.div>
      </main>
      <SiteFooter />
    </div>
  );
}
