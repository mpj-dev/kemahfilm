import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Film, Camera, Clapperboard, Tent, Users, Award, Calendar, MapPin,
  CheckCircle2, Sparkles, Lightbulb, PenLine, Scissors, MessageCircle, ArrowRight
} from "lucide-react";
import logo from "@/assets/logo-mpj.png";
import heroImg from "@/assets/hero-kemah.jpg";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { Section } from "@/components/site/Section";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Kemah Film MPJ 2026 | Media Pondok Jawa Timur" },
      { name: "description", content: "Pendaftaran resmi Kemah Film MPJ 2026, program pelatihan dan produksi film bagi pegiat media pondok Jawa Timur. 3–5 Juli 2026 di Benjor Pine Camping Ground, Malang." },
      { property: "og:title", content: "Kemah Film MPJ 2026" },
      { property: "og:description", content: "Tempat Gagasan Bertemu Rasa, Tempat Karya Bertemu Makna." },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: LandingPage,
});

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.5, ease: "easeOut" as const },
};

const tujuan = [
  "Meningkatkan kompetensi media santri",
  "Mengenalkan proses produksi film dari hulu ke hilir",
  "Membangun jejaring media pesantren se-Jawa Timur",
  "Melahirkan karya film pendek yang berkualitas",
  "Menyiapkan ekosistem sineas santri yang berkelanjutan",
];

const kelas = [
  { icon: Film, title: "Dasar Perfilman", desc: "Fondasi bahasa visual dan grammar sinema." },
  { icon: Lightbulb, title: "Pengembangan Ide & Storytelling", desc: "Menggali ide kuat dari realitas santri." },
  { icon: PenLine, title: "Penulisan Skrip", desc: "Struktur naskah film pendek yang efektif." },
  { icon: Camera, title: "Cinematography & Teknik Shooting", desc: "Komposisi, lighting, dan tata kamera." },
  { icon: Scissors, title: "Editing & Pasca Produksi", desc: "Rhythm, color, dan finishing karya." },
  { icon: Sparkles, title: "Review Karya & Sharing Session", desc: "Kurasi karya bersama mentor dan peserta." },
];

const ketentuan = [
  "Mengisi formulir pendaftaran",
  "Mengunggah bukti pembayaran",
  "Mengirimkan portofolio karya sesuai ketentuan panitia",
  "Mengikuti technical meeting",
  "Membawa perlengkapan pribadi dan produksi",
];

const hak = [
  "ID Card peserta",
  "Materi dan mentoring eksklusif",
  "Konsumsi selama kegiatan",
  "Fasilitas tenda dan perlengkapan camping",
  "Merchandise",
  "Sertifikat",
  "Kesempatan memperoleh penghargaan peserta terbaik",
];

const biaya = [
  { label: "Gelombang 1", price: "285.000", note: "1–14 Juni 2026", popular: false },
  { label: "Gelombang 2", price: "335.000", note: "15–25 Juni 2026", popular: true },
  { label: "Gelombang 3 / OTS", price: "400.000", note: "Setelah 25 Juni 2026", popular: false },
  { label: "Peserta Umum", price: "1.000.000", note: "Non-santri / undangan", popular: false },
];

const timeline = [
  { date: "1–14 Juni 2026", title: "Pendaftaran Gelombang 1" },
  { date: "15–25 Juni 2026", title: "Pendaftaran Gelombang 2" },
  { date: "26 Juni 2026", title: "Wawancara Peserta Tertentu" },
  { date: "27 Juni 2026", title: "Pembagian Kelompok" },
  { date: "28 Juni 2026", title: "Technical Meeting" },
  { date: "3–5 Juli 2026", title: "Pelaksanaan Kemah Film" },
];

const faqs = [
  { q: "Apakah semua pendaftar otomatis lolos?", a: "Tidak. Panitia melakukan verifikasi berkas, portofolio, dan kelengkapan administrasi. Sebagian peserta mungkin diundang wawancara singkat." },
  { q: "Apakah wajib punya karya?", a: "Wajib. Kamu perlu mengirim minimal satu link karya orisinil (film/video) yang pernah kamu produksi sesuai dengan kemampuan yang dipilih." },
  { q: "Bagaimana ketentuan link karya?", a: "Link dapat berupa YouTube, Instagram, TikTok, Google Drive, atau platform lain. Pastikan link publik dan dapat diakses panitia tanpa permintaan akses." },
  { q: "Bagaimana upload surat delegasi?", a: "Unggah surat delegasi resmi dari media/pesantren dalam format PDF, JPG, atau PNG saat mengisi formulir pendaftaran." },
  { q: "Bagaimana verifikasi pembayaran?", a: "Setelah submit, panitia akan memverifikasi bukti pembayaran dalam 1–3 hari kerja dan menghubungi via WhatsApp." },
  { q: "Kapan peserta mendapat informasi lanjutan?", a: "Informasi pembagian kelompok dan technical meeting dibagikan via WhatsApp grup peserta setelah verifikasi selesai." },
  { q: "Apa saja perlengkapan yang wajib dibawa?", a: "Perlengkapan ibadah, pakaian ganti, sleeping bag/matras tipis, obat pribadi, serta perlengkapan produksi (kamera, tripod, audio) sesuai kapasitas kelompok." },
  { q: "Bagaimana kebijakan refund?", a: "Biaya pendaftaran yang telah dibayarkan tidak dapat dikembalikan, kecuali kegiatan dibatalkan oleh panitia." },
];

function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-hero text-primary-foreground">
        <div className="absolute inset-0 film-grain opacity-60" />
        <div
          className="absolute inset-0 opacity-25 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImg})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-primary-dark/40 via-primary-dark/60 to-primary-dark/90" />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 pt-16 pb-20 sm:pt-24 sm:pb-28">
          <motion.div {...fadeUp} className="flex items-center gap-3 mb-6">
            <img src={logo} alt="Logo MPJ" className="h-12 w-12 bg-white/95 rounded-xl p-1.5 shadow-lg" />
            <div className="text-xs sm:text-sm">
              <p className="font-semibold tracking-wide">Media Pondok Jawa Timur</p>
              <p className="text-primary-foreground/70">Regional Malang</p>
            </div>
          </motion.div>

          <motion.span
            {...fadeUp}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="inline-flex items-center gap-2 rounded-full bg-accent/15 border border-accent/30 px-3 py-1 text-xs font-medium text-accent backdrop-blur"
          >
            <Clapperboard className="h-3.5 w-3.5" /> Pendaftaran Dibuka — Gelombang 1
          </motion.span>

          <motion.h1
            {...fadeUp}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-5 text-4xl sm:text-6xl lg:text-7xl font-extrabold leading-[1.05]"
          >
            Kemah Film <span className="text-accent">MPJ 2026</span>
          </motion.h1>

          <motion.p
            {...fadeUp}
            transition={{ duration: 0.6, delay: 0.18 }}
            className="mt-5 text-lg sm:text-xl text-primary-foreground/90 font-medium max-w-2xl"
          >
            Tempat Gagasan Bertemu Rasa, Tempat Karya Bertemu Makna.
          </motion.p>

          <motion.p
            {...fadeUp}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="mt-4 max-w-2xl text-primary-foreground/80 leading-relaxed"
          >
            Program pelatihan, produksi, dan kolaborasi film bagi pegiat media pondok Jawa Timur —
            tiga hari berkemah, berkarya, dan membangun jejaring sineas santri.
          </motion.p>

          <motion.div
            {...fadeUp}
            transition={{ duration: 0.6, delay: 0.32 }}
            className="mt-7 flex flex-wrap gap-4 text-sm"
          >
            <div className="flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-4 py-2 backdrop-blur">
              <Calendar className="h-4 w-4 text-accent" /> 3–5 Juli 2026
            </div>
            <div className="flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-4 py-2 backdrop-blur">
              <MapPin className="h-4 w-4 text-accent" /> Benjor Pine Camping Ground, Tumpang — Malang
            </div>
          </motion.div>

          <motion.div
            {...fadeUp}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-9 flex flex-col sm:flex-row gap-3"
          >
            <Link
              to="/daftar"
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-accent px-7 py-3.5 font-bold text-accent-foreground shadow-soft hover:bg-accent/90 transition-all hover:scale-[1.02]"
            >
              Daftar Sekarang
              <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link
              to="/ketentuan"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white/10 border border-white/25 px-7 py-3.5 font-semibold text-primary-foreground hover:bg-white/15 transition backdrop-blur"
            >
              Lihat Ketentuan
            </Link>
          </motion.div>
        </div>
      </section>

      {/* TENTANG */}
      <Section id="tentang" eyebrow="Tentang" title="Kemah, Karya, dan Kolaborasi Santri">
        <motion.div {...fadeUp} className="grid md:grid-cols-3 gap-5">
          <div className="md:col-span-2 rounded-2xl bg-card p-7 shadow-card border border-border/50">
            <p className="text-foreground/85 leading-relaxed text-lg">
              <strong className="text-primary-dark">Kemah Film MPJ 2026</strong> merupakan program
              pengembangan ekosistem kreator santri berbasis film di Jawa Timur. Kegiatan ini
              menggabungkan pembelajaran teori, praktik lapangan, kerja tim, dan pengalaman produksi
              film langsung dalam suasana perkemahan.
            </p>
          </div>
          <div className="rounded-2xl bg-gradient-hero p-7 text-primary-foreground shadow-card">
            <Tent className="h-8 w-8 text-accent mb-4" />
            <p className="font-bold text-xl">3 Hari Penuh</p>
            <p className="text-sm text-primary-foreground/80 mt-2">
              Berkemah di tengah pinus, berkarya bersama mentor & sesama pegiat media pondok.
            </p>
          </div>
        </motion.div>
      </Section>

      {/* TUJUAN */}
      <Section id="tujuan" eyebrow="Tujuan" title="Apa yang Ingin Kami Capai">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tujuan.map((t, i) => (
            <motion.div
              key={t}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="rounded-2xl bg-card p-5 shadow-card border border-border/40 flex gap-3"
            >
              <CheckCircle2 className="h-5 w-5 text-primary-light shrink-0 mt-0.5" />
              <p className="text-foreground/85">{t}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* KELAS */}
      <Section id="kelas" eyebrow="Kelas Pelatihan" title="Belajar dari Hulu ke Hilir">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {kelas.map((k, i) => (
            <motion.div
              key={k.title}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="group rounded-2xl bg-card p-6 shadow-card border border-border/40 hover:border-primary/40 hover:-translate-y-1 transition-all"
            >
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-primary/10 text-primary mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition">
                <k.icon className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-lg text-primary-dark">{k.title}</h3>
              <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{k.desc}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* KETENTUAN & HAK */}
      <Section id="ketentuan-hak" eyebrow="Peserta" title="Ketentuan & Hak Peserta">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="rounded-2xl bg-card p-7 shadow-card border border-border/40">
            <h3 className="font-bold text-xl text-primary-dark mb-4">Ketentuan Peserta</h3>
            <ul className="space-y-3">
              {ketentuan.map((k) => (
                <li key={k} className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-foreground/85">{k}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl bg-gradient-hero p-7 text-primary-foreground shadow-card">
            <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
              <Award className="h-5 w-5 text-accent" /> Hak Peserta
            </h3>
            <ul className="space-y-3">
              {hak.map((h) => (
                <li key={h} className="flex gap-3">
                  <Sparkles className="h-4 w-4 text-accent shrink-0 mt-1" />
                  <span className="text-primary-foreground/90">{h}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      {/* BIAYA */}
      <Section id="biaya" eyebrow="Biaya Pendaftaran" title="Pilih Gelombangmu" description="Semakin awal mendaftar, semakin hemat. Kuota terbatas per gelombang.">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {biaya.map((b, i) => (
            <motion.div
              key={b.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className={`relative rounded-2xl p-6 shadow-card border ${
                b.popular
                  ? "bg-gradient-hero text-primary-foreground border-accent/40"
                  : "bg-card border-border/40"
              }`}
            >
              {b.popular && (
                <span className="absolute -top-3 left-6 rounded-full bg-accent px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-accent-foreground">
                  Populer
                </span>
              )}
              <p className={`text-sm font-semibold ${b.popular ? "text-accent" : "text-primary"}`}>{b.label}</p>
              <p className={`mt-3 text-3xl font-extrabold ${b.popular ? "text-primary-foreground" : "text-primary-dark"}`}>
                Rp{b.price}
              </p>
              <p className={`mt-1 text-xs ${b.popular ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                {b.note}
              </p>
            </motion.div>
          ))}
        </div>
        <div className="mt-8 flex justify-center">
          <Link
            to="/daftar"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground shadow-soft hover:bg-primary-dark transition"
          >
            Amankan Slotmu <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </Section>

      {/* TIMELINE */}
      <Section id="timeline" eyebrow="Timeline" title="Linimasa Kegiatan">
        <div className="relative">
          <div className="absolute left-4 sm:left-1/2 top-0 bottom-0 w-px bg-border" />
          <div className="space-y-6">
            {timeline.map((t, i) => (
              <motion.div
                key={t.title}
                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
                className={`relative flex sm:items-center gap-5 ${
                  i % 2 === 0 ? "sm:flex-row" : "sm:flex-row-reverse"
                }`}
              >
                <div className="absolute left-4 sm:left-1/2 -translate-x-1/2 h-3.5 w-3.5 rounded-full bg-accent ring-4 ring-background" />
                <div className="ml-12 sm:ml-0 sm:w-1/2 sm:px-8">
                  <div className="rounded-2xl bg-card p-5 shadow-card border border-border/40">
                    <p className="text-xs font-semibold text-accent uppercase tracking-wider">{t.date}</p>
                    <p className="mt-1 font-bold text-primary-dark">{t.title}</p>
                  </div>
                </div>
                <div className="hidden sm:block sm:w-1/2" />
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* SISTEM PENUGASAN */}
      <Section id="penugasan" eyebrow="Sistem Penugasan" title="Berkemah & Berkarya dalam Kelompok">
        <div className="grid md:grid-cols-5 gap-6">
          <div className="md:col-span-3 rounded-2xl bg-card p-7 shadow-card border border-border/40">
            <Users className="h-7 w-7 text-primary mb-3" />
            <p className="text-foreground/85 leading-relaxed">
              Peserta akan dibagi secara acak ke dalam kelompok produksi berisi
              <strong className="text-primary-dark"> 8–10 orang</strong> dari berbagai delegasi pesantren.
              Setiap kelompok menempati satu tenda dan bekerja secara kolaboratif selama kegiatan.
            </p>
          </div>
          <div className="md:col-span-2 rounded-2xl bg-primary-dark p-7 text-primary-foreground shadow-card">
            <p className="text-sm font-semibold text-accent uppercase tracking-wider mb-3">Output Kelompok</p>
            <ul className="space-y-2 text-primary-foreground/90 text-sm">
              <li>• Ide cerita</li>
              <li>• Naskah film pendek</li>
              <li>• Produksi film</li>
              <li>• Editing dan finalisasi</li>
              <li>• Presentasi karya</li>
            </ul>
          </div>
        </div>
      </Section>

      {/* FAQ */}
      <Section id="faq" eyebrow="FAQ" title="Pertanyaan yang Sering Diajukan">
        <div className="grid gap-3">
          {faqs.map((f, i) => (
            <motion.details
              key={f.q}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.03 }}
              className="group rounded-2xl bg-card border border-border/40 shadow-card p-5 [&_summary::-webkit-details-marker]:hidden"
            >
              <summary className="flex items-start justify-between gap-4 cursor-pointer font-semibold text-primary-dark">
                {f.q}
                <span className="shrink-0 h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm group-open:rotate-45 transition-transform">+</span>
              </summary>
              <p className="mt-3 text-muted-foreground leading-relaxed">{f.a}</p>
            </motion.details>
          ))}
        </div>
      </Section>

      {/* CTA */}
      <section className="py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-hero p-10 sm:p-14 text-center text-primary-foreground shadow-soft">
            <div className="absolute inset-0 film-grain opacity-50" />
            <div className="relative">
              <Clapperboard className="h-10 w-10 text-accent mx-auto mb-4" />
              <h2 className="text-3xl sm:text-4xl font-bold">Siap Berkemah & Berkarya?</h2>
              <p className="mt-3 text-primary-foreground/85 max-w-xl mx-auto">
                Bergabunglah dengan ratusan pegiat media pondok dari seluruh Jawa Timur dalam tiga hari yang akan mengubah cara kamu memandang film.
              </p>
              <div className="mt-7 flex flex-col sm:flex-row justify-center gap-3">
                <Link
                  to="/daftar"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-7 py-3.5 font-bold text-accent-foreground hover:bg-accent/90 transition"
                >
                  Daftar Sekarang <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href="https://wa.me/6285124739344"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-white/10 border border-white/25 px-7 py-3.5 font-semibold hover:bg-white/15 transition"
                >
                  <MessageCircle className="h-4 w-4" /> Tanya Admin
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
