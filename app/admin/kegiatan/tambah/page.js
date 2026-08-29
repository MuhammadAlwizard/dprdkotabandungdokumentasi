"use client";
import AdminShell from "@/components/AdminShell";
import KegiatanForm from "@/components/KegiatanForm";

export default function TambahKegiatanPage() {
  return (
    <AdminShell>
      <h1 className="text-xl font-bold text-gray-800 mb-6">Tambah Kegiatan</h1>
      <KegiatanForm />
    </AdminShell>
  );
}
