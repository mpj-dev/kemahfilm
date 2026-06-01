import { Link } from "@tanstack/react-router";
import logo from "@/assets/logo-kemahfilm.png";
import { JUKNIS_URL } from "@/lib/links";
import { PAYMENT_CONFIG } from "@/lib/payment";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-white/10 bg-gradient-to-br from-[#003f16] to-[#006225] text-primary-foreground">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-3 md:gap-10 md:py-14">
        <div>
          <div className="inline-flex rounded-xl bg-white p-1.5">
            <img
              src={logo}
              alt="Kemah Film MPJ 2026"
              className="h-12 w-auto object-contain sm:h-14"
            />
          </div>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-primary-foreground/80">
            Ruang belajar, produksi, dan kolaborasi film bagi pegiat media pondok Jawa Timur.
          </p>
        </div>
        <div>
          <p className="mb-3 text-sm font-semibold text-white">Kontak Panitia</p>
          <p className="text-sm text-primary-foreground/80">Butuh bantuan pendaftaran?</p>
          <a
            href={`https://wa.me/${PAYMENT_CONFIG.adminWhatsapp}`}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex items-center rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground transition hover:opacity-90"
          >
            Chat Admin
          </a>
        </div>
        <div>
          <p className="mb-3 text-sm font-semibold text-white">Tautan</p>
          <ul className="space-y-2 text-sm text-primary-foreground/85">
            <li>
              <Link to="/" className="transition hover:text-accent">
                Beranda
              </Link>
            </li>
            <li>
              <Link to="/daftar" className="transition hover:text-accent">
                Daftar
              </Link>
            </li>
            <li>
              <a
                href={JUKNIS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="transition hover:text-accent"
              >
                Juknis
              </a>
            </li>
            <li>
              <a
                href="https://linktr.ee/mediapondokjawatimur"
                target="_blank"
                rel="noreferrer"
                className="transition hover:text-accent"
              >
                Media Sosial MPJ
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-5 text-center text-xs text-primary-foreground/65 sm:px-6 md:flex-row md:justify-between md:text-left">
          <p>© 2026 Kemah Film MPJ. Media Pondok Jawa Timur.</p>
          <p>Seluruh informasi pendaftaran mengikuti JUKNIS resmi.</p>
        </div>
      </div>
    </footer>
  );
}
