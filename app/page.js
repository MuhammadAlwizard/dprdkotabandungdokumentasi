"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Calendar from "react-calendar";
import { supabase } from "@/lib/supabaseClient";
import Navbar from "@/components/Navbar";
import { format } from "date-fns";

function toDateKey(date) {
  return format(date, "yyyy-MM-dd");
}

// Tanggal default yang tampil pertama kali saat halaman dibuka: tanggal 10
// bulan berjalan (bukan hari ini). Ganti angka "10" di bawah kalau mau ubah.
function getTanggalDefault() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 10);
}

export default function HomePage() {
  const [tanggalDipilih, setTanggalDipilih] = useState(getTanggalDefault());
  const [semuaTanggalKegiatan, setSemuaTanggalKegiatan] = useState(new Set());
  const [kegiatanHariItu, setKegiatanHariItu] = useState([]);
  const [loading, setLoading] = useState(true);

  // Ambil semua tanggal yang punya kegiatan (untuk kasih tanda titik di kalender)
  useEffect(() => {
    async function fetchTanggalKegiatan() {
      const { data, error } = await supabase
        .from("kegiatan")
        .select("tanggal")
        .eq("status", "publish");
      if (!error && data) {
        setSemuaTanggalKegiatan(new Set(data.map((k) => k.tanggal)));
      }
    }
    fetchTanggalKegiatan();
  }, []);

  // Ambil kegiatan pada tanggal yang dipilih
  useEffect(() => {
    async function fetchKegiatanTanggal() {
      setLoading(true);
      const key = toDateKey(tanggalDipilih);
      const { data, error } = await supabase
        .from("kegiatan")
        .select("id, judul, jam_mulai, jam_selesai, lokasi, kategori(nama), komisi(nama)")
        .eq("status", "publish")
        .eq("tanggal", key)
        .order("jam_mulai", { ascending: true });

      if (!error) setKegiatanHariItu(data || []);
      setLoading(false);
    }
    fetchKegiatanTanggal();
  }, [tanggalDipilih]);

  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8 grid md:grid-cols-2 gap-8">
        <section className="bg-white rounded-2xl shadow p-5">
          <h1 className="text-xl font-bold text-dprd-red mb-1">
            Kalender Kegiatan
          </h1>
          <p className="text-sm text-gray-500 mb-4">
            Klik tanggal untuk melihat kegiatan DPRD Kota Bandung pada hari
            tersebut.
          </p>
          <Calendar
            onChange={setTanggalDipilih}
            value={tanggalDipilih}
            locale="id-ID"
            tileClassName={({ date }) =>
              semuaTanggalKegiatan.has(toDateKey(date)) ? "has-kegiatan" : null
            }
          />
        </section>

        <section className="bg-white rounded-2xl shadow p-5">
          <h2 className="text-lg font-bold text-dprd-red mb-4">
            Kegiatan Tanggal {format(tanggalDipilih, "dd MMMM yyyy")}
          </h2>

          {loading && <p className="text-sm text-gray-400">Memuat data...</p>}

          {!loading && kegiatanHariItu.length === 0 && (
            <p className="text-sm text-gray-400">
              Tidak ada kegiatan pada tanggal ini.
            </p>
          )}

          <div className="flex flex-col gap-3">
            {kegiatanHariItu.map((k) => (
              <Link
                key={k.id}
                href={`/kegiatan/${k.id}`}
                className="block border border-gray-100 rounded-xl p-4 hover:border-dprd-gold hover:shadow transition"
              >
                <p className="font-semibold text-gray-800">{k.judul}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {k.jam_mulai?.slice(0, 5)}
                  {k.jam_selesai ? ` - ${k.jam_selesai.slice(0, 5)}` : ""}
                  {k.lokasi ? ` • ${k.lokasi}` : ""}
                </p>
                <div className="flex gap-2 mt-2 flex-wrap">
                  {k.kategori?.nama && (
                    <span className="text-[11px] bg-dprd-red/10 text-dprd-red px-2 py-0.5 rounded-full">
                      {k.kategori.nama}
                    </span>
                  )}
                  {k.komisi?.nama && (
                    <span className="text-[11px] bg-dprd-gold/20 text-dprd-dark px-2 py-0.5 rounded-full">
                      {k.komisi.nama}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
