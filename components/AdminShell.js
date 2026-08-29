"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export default function AdminShell({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function checkSession() {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.push("/admin/login");
      } else {
        setChecking(false);
      }
    }
    checkSession();
  }, [router]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/admin/login");
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400 text-sm">
        Memuat...
      </div>
    );
  }

  const menu = [
    { href: "/admin/dashboard", label: "Dashboard" },
    { href: "/admin/kegiatan", label: "Kelola Kegiatan" },
  ];

  return (
    <div className="min-h-screen flex bg-gray-50">
      <aside className="w-56 bg-dprd-red text-white flex flex-col shrink-0">
        <div className="px-5 py-5 border-b border-white/10">
          <p className="font-bold text-sm">DPRD Kota Bandung</p>
          <p className="text-xs text-white/70">Panel Admin</p>
        </div>
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
          {menu.map((m) => (
            <Link
              key={m.href}
              href={m.href}
              className={`px-3 py-2 rounded-lg text-sm ${
                pathname === m.href
                  ? "bg-white/15 font-medium"
                  : "hover:bg-white/10"
              }`}
            >
              {m.label}
            </Link>
          ))}
        </nav>
        <button
          onClick={handleLogout}
          className="mx-3 mb-4 px-3 py-2 rounded-lg text-sm text-left hover:bg-white/10"
        >
          Keluar
        </button>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
