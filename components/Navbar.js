"use client";
import Link from "next/link";

export default function Navbar() {
  return (
    <header className="bg-dprd-red text-white shadow-md">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Logo kiri: lambang resmi DPRD Kota Bandung */}
        <Link href="/" className="flex items-center gap-3 shrink-0">
          <img
            src="/logo-dprd.png"
            alt="Logo DPRD Kota Bandung"
            className="h-12 w-12 object-contain"
          />
          <div className="hidden sm:block">
            <p className="font-bold leading-tight text-sm md:text-base">
              DPRD KOTA BANDUNG
            </p>
            <p className="text-xs text-dprd-cream/80 leading-tight">
              Dokumentasi Kegiatan
            </p>
          </div>
        </Link>

        <nav className="flex gap-4 text-sm font-medium shrink-0">
          <Link href="/" className="hover:text-dprd-gold transition">
            Kalender
          </Link>
          <Link href="/arsip" className="hover:text-dprd-gold transition">
            Arsip Kegiatan
          </Link>
        </nav>

        {/* Logo kanan: Humas DPRD Kota Bandung */}
        <img
          src="/logo-humas.png"
          alt="Humas DPRD Kota Bandung"
          className="h-9 object-contain hidden md:block bg-white rounded-md px-2 py-1 shrink-0"
        />
      </div>
    </header>
  );
}
