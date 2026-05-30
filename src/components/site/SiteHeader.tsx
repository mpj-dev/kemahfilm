import { Link } from "@tanstack/react-router";
import logo from "@/assets/logo-mpj.png";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-background/80 border-b border-border/60">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <img src={logo} alt="Media Pondok Jawa Timur" className="h-9 w-9 object-contain" />
          <div className="leading-tight">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Kemah Film</p>
            <p className="text-sm font-bold text-primary-dark">MPJ 2026</p>
          </div>
        </Link>
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-foreground/80">
          <Link to="/" hash="tentang" className="hover:text-primary">Tentang</Link>
          <Link to="/" hash="kelas" className="hover:text-primary">Kelas</Link>
          <Link to="/" hash="biaya" className="hover:text-primary">Biaya</Link>
          <Link to="/" hash="timeline" className="hover:text-primary">Timeline</Link>
          <Link to="/ketentuan" className="hover:text-primary">Ketentuan</Link>
        </nav>
        <Link
          to="/daftar"
          className="inline-flex items-center rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-soft hover:bg-primary-dark transition-colors"
        >
          Daftar
        </Link>
      </div>
    </header>
  );
}
