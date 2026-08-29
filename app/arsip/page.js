"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import Navbar from "@/components/Navbar";
import { format } from "date-fns";

export default function ArsipPage() {
  const [list, setList] = useState([]);
  const [kategoriList, setKategoriList] = useState([]);
  const [filterKategori, setFilterKategori] = useState("");
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("kategori")
      .select("*")
      .then(({ data }) => setKategoriList(data || []));
  }, []);

  useEffect(() => {
    async function fetchList() {
      setLoading(true);
      let query = supabase
        .from("kegiatan")
        .select("id, judul, tanggal, lokasi, kategori(id, nama)")
        .eq("status", "publish")
        .order("tanggal", { ascending: false });

      if (filterKategori) query = query.eq("kategori_id", filterKategori);
      if (keyword) query = query.ilike("judul", `%${keyword}%`);

      const { data } = await query;
      setList(data || []);
      setLoading(false);
    }
    fetchList();
  }, [filterKategori, keyword]);

  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-xl font-bold text-dprd-red mb-4">
          Arsip Kegiatan
        </h1>

        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <input
            type="text"
            placeholder="Cari judul kegiatan..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm flex-1"
          />
          <select
            value={filterKategori}
            onChange={(e) => setFilterKategori(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            <option value="">Semua Kategori</option>
            {kategoriList.map((k) => (
              <option key={k.id} value={k.id}>
                {k.nama}
              </option>
            ))}
          </select>
        </div>

        {loading && <p className="text-gray-400 text-sm">Memuat data...</p>}
        {!loading && list.length === 0 && (
          <p className="text-gray-400 text-sm">Tidak ada kegiatan ditemukan.</p>
        )}

        <div className="flex flex-col gap-3">
          {list.map((k) => (
            <Link
              key={k.id}
              href={`/kegiatan/${k.id}`}
              className="bg-white rounded-xl shadow-sm p-4 hover:shadow transition flex justify-between items-center"
            >
              <div>
                <p className="font-semibold text-gray-800">{k.judul}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {format(new Date(k.tanggal), "dd MMMM yyyy")}
                  {k.lokasi ? ` • ${k.lokasi}` : ""}
                </p>
              </div>
              {k.kategori?.nama && (
                <span className="text-[11px] bg-dprd-red/10 text-dprd-red px-2 py-1 rounded-full whitespace-nowrap">
                  {k.kategori.nama}
                </span>
              )}
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
