"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Navbar from "@/components/Navbar";
import { format } from "date-fns";

export default function DetailKegiatanPage() {
  const { id } = useParams();
  const [kegiatan, setKegiatan] = useState(null);
  const [foto, setFoto] = useState([]);
  const [pdf, setPdf] = useState([]);
  const [lightbox, setLightbox] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const { data: k } = await supabase
        .from("kegiatan")
        .select("*, kategori(nama), komisi(nama)")
        .eq("id", id)
        .single();
      setKegiatan(k);

      const { data: f } = await supabase
        .from("dokumentasi_foto")
        .select("*")
        .eq("kegiatan_id", id)
        .order("urutan", { ascending: true });
      setFoto(f || []);

      const { data: p } = await supabase
        .from("dokumentasi_pdf")
        .select("*")
        .eq("kegiatan_id", id);
      setPdf(p || []);

      setLoading(false);
    }
    if (id) fetchData();
  }, [id]);

  if (loading) {
    return (
      <main className="min-h-screen">
        <Navbar />
        <p className="text-center text-gray-400 py-16">Memuat data...</p>
      </main>
    );
  }

  if (!kegiatan) {
    return (
      <main className="min-h-screen">
        <Navbar />
        <p className="text-center text-gray-400 py-16">
          Kegiatan tidak ditemukan.
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex gap-2 flex-wrap mb-3">
          {kegiatan.kategori?.nama && (
            <span className="text-xs bg-dprd-red/10 text-dprd-red px-2 py-1 rounded-full">
              {kegiatan.kategori.nama}
            </span>
          )}
          {kegiatan.komisi?.nama && (
            <span className="text-xs bg-dprd-gold/20 text-dprd-dark px-2 py-1 rounded-full">
              {kegiatan.komisi.nama}
            </span>
          )}
        </div>

        <h1 className="text-2xl font-bold text-gray-800">{kegiatan.judul}</h1>
        <p className="text-sm text-gray-500 mt-1">
          {format(new Date(kegiatan.tanggal), "dd MMMM yyyy")}
          {kegiatan.jam_mulai ? ` • ${kegiatan.jam_mulai.slice(0, 5)}` : ""}
          {kegiatan.jam_selesai ? ` - ${kegiatan.jam_selesai.slice(0, 5)}` : ""}
          {kegiatan.lokasi ? ` • ${kegiatan.lokasi}` : ""}
        </p>

        {kegiatan.deskripsi && (
          <p className="mt-5 text-gray-700 leading-relaxed whitespace-pre-line">
            {kegiatan.deskripsi}
          </p>
        )}

        {/* VIDEO */}
        {kegiatan.video_url && (
          <div className="mt-8">
            <h2 className="font-semibold text-gray-800 mb-2">Video Kegiatan</h2>
            <a
              href={kegiatan.video_url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 border rounded-xl p-4 hover:border-dprd-gold hover:shadow transition"
            >
              <span className="w-10 h-10 rounded-full bg-dprd-red text-white flex items-center justify-center shrink-0">
                ▶
              </span>
              <div>
                <p className="text-sm font-medium text-gray-800">
                  Tonton video kegiatan ini
                </p>
                <p className="text-xs text-gray-500 break-all">
                  {kegiatan.video_url}
                </p>
              </div>
            </a>
          </div>
        )}

        {/* FOTO */}
        {foto.length > 0 && (
          <div className="mt-8">
            <h2 className="font-semibold text-gray-800 mb-2">
              Dokumentasi Foto
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {foto.map((f) => (
                <img
                  key={f.id}
                  src={f.url}
                  alt="Dokumentasi kegiatan"
                  onClick={() => setLightbox(f.url)}
                  className="w-full h-32 md:h-40 object-cover rounded-lg cursor-pointer hover:opacity-90 transition"
                />
              ))}
            </div>
          </div>
        )}

        {/* PDF */}
        {pdf.length > 0 && (
          <div className="mt-8">
            <h2 className="font-semibold text-gray-800 mb-2">
              Dokumen Pendukung
            </h2>
            <div className="flex flex-col gap-6">
              {pdf.map((p) => (
                <div key={p.id}>
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    {p.nama_file}
                  </p>
                  <iframe
                    src={p.url}
                    className="w-full h-[500px] rounded-lg border"
                    title={p.nama_file}
                  />
                  <a
                    href={p.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block mt-2 text-sm text-dprd-red underline"
                  >
                    Unduh PDF
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* LIGHTBOX SEDERHANA */}
      {lightbox && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setLightbox(null)}
        >
          <img
            src={lightbox}
            alt="Preview"
            className="max-h-[90vh] max-w-full rounded-lg"
          />
        </div>
      )}
    </main>
  );
}
