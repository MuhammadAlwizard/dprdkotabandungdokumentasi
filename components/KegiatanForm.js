"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

// data awal null = mode "tambah". Jika diisi objek kegiatan = mode "edit".
export default function KegiatanForm({ dataAwal = null }) {
  const router = useRouter();
  const isEdit = !!dataAwal;

  const [kategoriList, setKategoriList] = useState([]);
  const [komisiList, setKomisiList] = useState([]);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [form, setForm] = useState({
    judul: dataAwal?.judul || "",
    tanggal: dataAwal?.tanggal || "",
    jam_mulai: dataAwal?.jam_mulai || "",
    jam_selesai: dataAwal?.jam_selesai || "",
    lokasi: dataAwal?.lokasi || "",
    deskripsi: dataAwal?.deskripsi || "",
    kategori_id: dataAwal?.kategori_id || "",
    komisi_id: dataAwal?.komisi_id || "",
    video_url: dataAwal?.video_url || "",
    status: dataAwal?.status || "draft",
  });

  const [fotoBaru, setFotoBaru] = useState([]); // File[] yang mau diupload
  const [pdfBaru, setPdfBaru] = useState([]); // File[] yang mau diupload
  const [fotoLama, setFotoLama] = useState([]); // dari DB (mode edit)
  const [pdfLama, setPdfLama] = useState([]); // dari DB (mode edit)

  useEffect(() => {
    supabase.from("kategori").select("*").then(({ data }) => setKategoriList(data || []));
    supabase.from("komisi").select("*").then(({ data }) => setKomisiList(data || []));

    if (isEdit) {
      supabase
        .from("dokumentasi_foto")
        .select("*")
        .eq("kegiatan_id", dataAwal.id)
        .then(({ data }) => setFotoLama(data || []));
      supabase
        .from("dokumentasi_pdf")
        .select("*")
        .eq("kegiatan_id", dataAwal.id)
        .then(({ data }) => setPdfLama(data || []));
    }
  }, [isEdit, dataAwal]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function hapusFotoLama(id) {
    if (!confirm("Hapus foto ini?")) return;
    await supabase.from("dokumentasi_foto").delete().eq("id", id);
    setFotoLama(fotoLama.filter((f) => f.id !== id));
  }

  async function hapusPdfLama(id) {
    if (!confirm("Hapus dokumen ini?")) return;
    await supabase.from("dokumentasi_pdf").delete().eq("id", id);
    setPdfLama(pdfLama.filter((p) => p.id !== id));
  }

  async function uploadFile(bucket, file) {
    const namaUnik = `${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}-${file.name.replace(/\s+/g, "_")}`;
    const { error } = await supabase.storage.from(bucket).upload(namaUnik, file);
    if (error) throw error;
    const { data } = supabase.storage.from(bucket).getPublicUrl(namaUnik);
    return data.publicUrl;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setErrorMsg("");

    try {
      const payload = {
        ...form,
        kategori_id: form.kategori_id || null,
        komisi_id: form.komisi_id || null,
        jam_mulai: form.jam_mulai || null,
        jam_selesai: form.jam_selesai || null,
      };

      let kegiatanId = dataAwal?.id;

      if (isEdit) {
        const { error } = await supabase
          .from("kegiatan")
          .update(payload)
          .eq("id", kegiatanId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("kegiatan")
          .insert(payload)
          .select()
          .single();
        if (error) throw error;
        kegiatanId = data.id;
      }

      // Upload foto baru (jika ada) ke bucket "foto-kegiatan"
      for (const file of fotoBaru) {
        const url = await uploadFile("foto-kegiatan", file);
        await supabase
          .from("dokumentasi_foto")
          .insert({ kegiatan_id: kegiatanId, url });
      }

      // Upload PDF baru (jika ada) ke bucket "dokumen-pdf"
      for (const file of pdfBaru) {
        const url = await uploadFile("dokumen-pdf", file);
        await supabase
          .from("dokumentasi_pdf")
          .insert({ kegiatan_id: kegiatanId, nama_file: file.name, url });
      }

      router.push("/admin/kegiatan");
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || "Terjadi kesalahan saat menyimpan.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow p-6 max-w-2xl">
      {errorMsg && (
        <p className="text-xs text-red-600 bg-red-50 rounded-lg p-3 mb-4">
          {errorMsg}
        </p>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="text-sm font-medium text-gray-700">Judul Kegiatan</label>
          <input
            name="judul"
            required
            value={form.judul}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 text-sm mt-1"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">Tanggal</label>
          <input
            type="date"
            name="tanggal"
            required
            value={form.tanggal}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 text-sm mt-1"
          />
        </div>

        <div className="flex gap-2">
          <div className="flex-1">
            <label className="text-sm font-medium text-gray-700">Jam Mulai</label>
            <input
              type="time"
              name="jam_mulai"
              value={form.jam_mulai}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 text-sm mt-1"
            />
          </div>
          <div className="flex-1">
            <label className="text-sm font-medium text-gray-700">Jam Selesai</label>
            <input
              type="time"
              name="jam_selesai"
              value={form.jam_selesai}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 text-sm mt-1"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">Lokasi</label>
          <input
            name="lokasi"
            value={form.lokasi}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 text-sm mt-1"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">Kategori</label>
          <select
            name="kategori_id"
            value={form.kategori_id}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 text-sm mt-1"
          >
            <option value="">- Pilih Kategori -</option>
            {kategoriList.map((k) => (
              <option key={k.id} value={k.id}>{k.nama}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">Komisi</label>
          <select
            name="komisi_id"
            value={form.komisi_id}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 text-sm mt-1"
          >
            <option value="">- Pilih Komisi -</option>
            {komisiList.map((k) => (
              <option key={k.id} value={k.id}>{k.nama}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">Status</label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 text-sm mt-1"
          >
            <option value="draft">Draft</option>
            <option value="publish">Publish</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="text-sm font-medium text-gray-700">Deskripsi</label>
          <textarea
            name="deskripsi"
            rows={4}
            value={form.deskripsi}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 text-sm mt-1"
          />
        </div>

        <div className="md:col-span-2">
          <label className="text-sm font-medium text-gray-700">
            Link Video (YouTube, Instagram, TikTok, Google Drive, dll — opsional)
          </label>
          <input
            name="video_url"
            placeholder="https://youtube.com/watch?v=... atau https://instagram.com/reel/..."
            value={form.video_url}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 text-sm mt-1"
          />
        </div>

        {/* FOTO */}
        <div className="md:col-span-2 border-t pt-4">
          <label className="text-sm font-medium text-gray-700">
            Upload Foto (bisa lebih dari satu)
          </label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => setFotoBaru(Array.from(e.target.files))}
            className="w-full text-sm mt-1"
          />

          {fotoLama.length > 0 && (
            <div className="grid grid-cols-4 gap-2 mt-3">
              {fotoLama.map((f) => (
                <div key={f.id} className="relative">
                  <img src={f.url} className="w-full h-20 object-cover rounded-lg" />
                  <button
                    type="button"
                    onClick={() => hapusFotoLama(f.id)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs leading-none"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* PDF */}
        <div className="md:col-span-2 border-t pt-4">
          <label className="text-sm font-medium text-gray-700">
            Upload Dokumen PDF (bisa lebih dari satu)
          </label>
          <input
            type="file"
            accept="application/pdf"
            multiple
            onChange={(e) => setPdfBaru(Array.from(e.target.files))}
            className="w-full text-sm mt-1"
          />

          {pdfLama.length > 0 && (
            <ul className="mt-3 text-sm space-y-1">
              {pdfLama.map((p) => (
                <li key={p.id} className="flex items-center justify-between border rounded-lg px-3 py-2">
                  <span className="truncate">{p.nama_file}</span>
                  <button
                    type="button"
                    onClick={() => hapusPdfLama(p.id)}
                    className="text-red-500 text-xs"
                  >
                    Hapus
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={saving}
        className="mt-6 bg-dprd-red text-white font-medium px-5 py-2 rounded-lg hover:bg-dprd-dark transition disabled:opacity-50"
      >
        {saving ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Simpan Kegiatan"}
      </button>
    </form>
  );
}
