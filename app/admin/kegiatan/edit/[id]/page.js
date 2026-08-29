"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import AdminShell from "@/components/AdminShell";
import KegiatanForm from "@/components/KegiatanForm";

export default function EditKegiatanPage() {
  const { id } = useParams();
  const [dataAwal, setDataAwal] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const { data } = await supabase
        .from("kegiatan")
        .select("*")
        .eq("id", id)
        .single();
      setDataAwal(data);
      setLoading(false);
    }
    if (id) fetchData();
  }, [id]);

  return (
    <AdminShell>
      <h1 className="text-xl font-bold text-gray-800 mb-6">Edit Kegiatan</h1>
      {loading && <p className="text-sm text-gray-400">Memuat data...</p>}
      {!loading && dataAwal && <KegiatanForm dataAwal={dataAwal} />}
      {!loading && !dataAwal && (
        <p className="text-sm text-gray-400">Kegiatan tidak ditemukan.</p>
      )}
    </AdminShell>
  );
}
