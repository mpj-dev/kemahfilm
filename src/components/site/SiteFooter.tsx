import { Link } from "@tanstack/react-router";
import logo from "@/assets/logo-mpj-landscape-putih.png";
import { PAYMENT_CONFIG } from "@/lib/payment";

export function SiteFooter() {
  return (
    <footer className="mt-24 bg-primary-dark text-primary-foreground">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12 grid gap-10 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-3">
            <img src={logo} alt="Media Pondok Jawa Timur" className="h-10 w-auto object-contain" />
            <div>
              <p className="font-bold">Media Pondok Jawa Timur</p>
            </div>
          </div>
          <p className="mt-4 text-sm text-primary-foreground/80 leading-relaxed">
            Ekosistem kreator santri berbasis film dan media di Jawa Timur.
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold mb-3">Kontak Panitia</p>
          <p className="text-sm text-primary-foreground/80">Admin Kemah Film MPJ</p>
          <p className="text-sm text-primary-foreground/80">WhatsApp: 0851-2473-9344</p>
          <a
            href={`https://wa.me/${PAYMENT_CONFIG.adminWhatsapp}`}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground hover:opacity-90 transition"
          >
            Chat WhatsApp Admin
          </a>
        </div>
        <div>
          <p className="text-sm font-semibold mb-3">Tautan</p>
          <ul className="space-y-2 text-sm text-primary-foreground/80">
            <li>
              <Link to="/" className="hover:text-accent">
                Beranda
              </Link>
            </li>
            <li>
              <Link to="/daftar" className="hover:text-accent">
                Daftar Peserta
              </Link>
            </li>
            <li>
              <Link to="/ketentuan" className="hover:text-accent">
                Ketentuan
              </Link>
            </li>
            <li>
              <a
                href="https://linktr.ee/mediapondokjawatimur"
                target="_blank"
                rel="noreferrer"
                className="hover:text-accent"
              >
                Media Sosial MPJ
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-5 text-xs text-primary-foreground/60 flex flex-col sm:flex-row justify-between gap-2">
          <p>© 2026 Media Pondok Jawa Timur. Semua hak dilindungi.</p>
          <p>kemahfilm.mediapondokjatim.id</p>
        </div>
      </div>
    </footer>
  );
}
