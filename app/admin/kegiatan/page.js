"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import AdminShell from "@/components/AdminShell";
import { format } from "date-fns";

export default function KelolaKegiatanPage() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  async function fetchList() {
    setLoading(true);
    const { data } = await supabase
      .from("kegiatan")
      .select("id, judul, tanggal, status, kategori(nama)")
      .order("tanggal", { ascending: false });
    setList(data || []);
    setLoading(false);
  }

  useEffect(() => {
    fetchList();
  }, []);

  async function handleDelete(id) {
    if (!confirm("Yakin ingin menghapus kegiatan ini beserta dokumentasinya?"))
      return;
    await supabase.from("kegiatan").delete().eq("id", id);
    fetchList();
  }

  return (
    <AdminShell>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-800">Kelola Kegiatan</h1>
        <Link
          href="/admin/kegiatan/tambah"
          className="bg-dprd-red text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-dprd-dark transition"
        >
          + Tambah Kegiatan
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-left">
            <tr>
              <th className="px-4 py-3">Judul</th>
              <th className="px-4 py-3">Tanggal</th>
              <th className="px-4 py-3">Kategori</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-gray-400">
                  Memuat data...
                </td>
              </tr>
            )}
            {!loading && list.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-gray-400">
                  Belum ada kegiatan.
                </td>
              </tr>
            )}
            {list.map((k) => (
              <tr key={k.id} className="border-t">
                <td className="px-4 py-3 font-medium text-gray-800">
                  {k.judul}
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {format(new Date(k.tanggal), "dd MMM yyyy")}
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {k.kategori?.nama || "-"}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      k.status === "publish"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {k.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right space-x-3">
                  <Link
                    href={`/admin/kegiatan/edit/${k.id}`}
                    className="text-dprd-red hover:underline"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(k.id)}
                    className="text-red-500 hover:underline"
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
