import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { CheckCircle2, MessageCircle, Home } from "lucide-react";
import { motion } from "framer-motion";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";

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
            <CheckCircle2 className="h-12 w-12 text-primary" />
          </motion.div>
          <h1 className="mt-6 text-3xl sm:text-4xl font-bold text-primary-dark">
            Pendaftaran Berhasil Dikirim
          </h1>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            Data dan berkas kamu telah diterima oleh panitia Kemah Film MPJ 2026.
            Panitia akan melakukan verifikasi dan menghubungi kamu melalui WhatsApp
            aktif yang telah didaftarkan.
          </p>

          {id && (
            <div className="mt-6 rounded-2xl bg-secondary p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                ID Pendaftaran
              </p>
              <p className="mt-1 text-2xl font-bold text-primary-dark font-mono tracking-wider">
                {id}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                Simpan ID ini untuk keperluan konfirmasi.
              </p>
            </div>
          )}

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <a
              href="https://wa.me/6285124739344"
              target="_blank"
              rel="noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-accent px-6 py-3 font-semibold text-accent-foreground hover:opacity-90 transition"
            >
              <MessageCircle className="h-4 w-4" /> Hubungi Admin
            </a>
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
