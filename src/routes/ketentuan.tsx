import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { Section } from "@/components/site/Section";
import { CheckCircle2, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/ketentuan")({
  head: () => ({
    meta: [
      { title: "Ketentuan Peserta — Kemah Film MPJ 2026" },
      { name: "description", content: "Ringkasan ketentuan peserta Kemah Film MPJ 2026." },
      { property: "og:title", content: "Ketentuan Peserta — Kemah Film MPJ 2026" },
      { property: "og:description", content: "Ringkasan ketentuan peserta Kemah Film MPJ 2026." },
    ],
    links: [{ rel: "canonical", href: "/ketentuan" }],
  }),
  component: KetentuanPage,
});

const items = [
  {
    title: "Pendaftaran",
    desc: "Mengisi formulir resmi dan melengkapi seluruh data dengan benar.",
  },
  { title: "Bukti Pembayaran", desc: "Mengunggah bukti pembayaran sesuai gelombang yang berlaku." },
  {
    title: "Portofolio",
    desc: "Mengirim link karya orisinil sesuai bidang kemampuan (publik & dapat diakses panitia).",
  },
  {
    title: "Surat Delegasi",
    desc: "Wajib diunggah bagi delegasi resmi media/pesantren (PDF/JPG/PNG). Peserta tanpa surat delegasi tetap dapat mendaftar sebagai Peserta Umum.",
  },
  {
    title: "Technical Meeting",
    desc: "Wajib mengikuti technical meeting sebelum kegiatan dimulai.",
  },
  {
    title: "Perlengkapan",
    desc: "Membawa perlengkapan pribadi (ibadah, pakaian, obat) dan perlengkapan produksi kelompok.",
  },
  {
    title: "Kedisiplinan",
    desc: "Mengikuti seluruh rangkaian kegiatan dari pembukaan hingga penutupan.",
  },
  {
    title: "Refund",
    desc: "Biaya pendaftaran tidak dapat dikembalikan kecuali kegiatan dibatalkan panitia.",
  },
];

function KetentuanPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <Section
        eyebrow="Peserta"
        title="Ketentuan Peserta Kemah Film MPJ 2026"
        description="Mohon dibaca dengan seksama sebelum melakukan pendaftaran."
      >
        <div className="grid sm:grid-cols-2 gap-4">
          {items.map((it) => (
            <div
              key={it.title}
              className="rounded-2xl bg-card p-6 shadow-card border border-border/40"
            >
              <div className="flex gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-primary-dark">{it.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{it.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-col sm:flex-row gap-3">
          <Link
            to="/daftar"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground hover:bg-primary-dark transition"
          >
            Lanjut Daftar
          </Link>
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-secondary px-6 py-3 font-semibold text-secondary-foreground hover:bg-secondary/80 transition"
          >
            <ArrowLeft className="h-4 w-4" /> Kembali ke Beranda
          </Link>
        </div>
      </Section>
      <SiteFooter />
    </div>
  );
}
