# Sistem Informasi Dokumentasi Kegiatan DPRD Kota Bandung

Aplikasi web untuk mendokumentasikan kegiatan DPRD Kota Bandung berbasis
kalender. Pengunjung dapat mengklik tanggal untuk melihat kegiatan berupa
teks, foto, PDF, dan video. Terdiri dari **website publik** dan
**panel admin** untuk mengelola data.

## Tech Stack
- **Next.js 14** (App Router) — frontend, di-hosting di **Vercel**
- **Supabase** — database (Postgres), storage (foto & PDF), dan autentikasi admin
- **Tailwind CSS** — styling
- Video didokumentasikan dalam bentuk **link YouTube** (embed), bukan file upload

---

## 1. Setup Supabase (database + storage + login admin)

1. Buat akun & project baru di https://supabase.com
2. Buka menu **SQL Editor** → **New query**
3. Copy seluruh isi file `supabase/schema.sql` dari folder ini, paste, lalu klik **Run**.
   Ini akan otomatis membuat:
   - Tabel `kegiatan`, `kategori`, `komisi`, `dokumentasi_foto`, `dokumentasi_pdf`
   - Bucket storage `foto-kegiatan` dan `dokumen-pdf` (public)
   - Aturan keamanan (RLS) — publik hanya bisa baca kegiatan berstatus "publish"
4. Buat akun admin: buka menu **Authentication → Users → Add user**,
   isi email & password (ini yang dipakai untuk login ke `/admin/login`)
5. Ambil kredensial API: buka menu **Project Settings → API**, salin:
   - `Project URL`
   - `anon public key`

## 2. Setup Project Lokal

```bash
npm install
cp .env.example .env.local
```

Isi `.env.local` dengan kredensial dari Supabase:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=isi-dengan-anon-key
```

Jalankan lokal untuk uji coba:
```bash
npm run dev
```
Buka `http://localhost:3000` untuk halaman publik, dan
`http://localhost:3000/admin/login` untuk login admin.

## 3. Upload ke GitHub

```bash
git init
git add .
git commit -m "Initial commit - sistem dokumentasi kegiatan DPRD"
git branch -M main
git remote add origin https://github.com/USERNAME/NAMA-REPO.git
git push -u origin main
```

## 4. Deploy ke Vercel

1. Buka https://vercel.com → **Add New Project** → pilih repo GitHub yang baru di-push
2. Pada bagian **Environment Variables**, tambahkan:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   (nilainya sama seperti di `.env.local`)
3. Klik **Deploy**, tunggu proses build selesai
4. Website langsung online. Setiap admin login dan menambah/mengubah data,
   perubahan langsung tampil di publik **tanpa perlu redeploy/ubah kode**,
   karena datanya diambil langsung dari Supabase.

## 5. Cara Pakai Sehari-hari

- **Admin**: login di `/admin/login` → menu "Kelola Kegiatan" → tambah/edit
  kegiatan, upload foto (bisa banyak sekaligus) dan PDF, isi link YouTube
  jika ada video, lalu pilih status **Publish** agar tampil ke publik
  (atau **Draft** kalau belum ingin ditampilkan)
- **Publik**: buka halaman utama → klik tanggal di kalender → lihat daftar
  kegiatan hari itu → klik salah satu untuk lihat detail lengkap
  (foto bisa di-zoom, PDF bisa dibaca langsung, video bisa diputar langsung)

## Struktur Folder Penting

```
app/
  page.js                     -> Halaman publik: kalender
  arsip/page.js                -> Halaman publik: daftar arsip + filter
  kegiatan/[id]/page.js        -> Halaman publik: detail kegiatan
  admin/login/page.js          -> Login admin
  admin/dashboard/page.js      -> Dashboard admin (statistik)
  admin/kegiatan/page.js       -> List & hapus kegiatan (admin)
  admin/kegiatan/tambah/       -> Form tambah kegiatan
  admin/kegiatan/edit/[id]/    -> Form edit kegiatan
components/
  KegiatanForm.js              -> Form + logic upload foto/PDF ke Supabase Storage
  AdminShell.js                -> Proteksi login + sidebar admin
  Navbar.js                    -> Navbar publik
supabase/schema.sql            -> Skema database lengkap (jalankan di Supabase)
```

## Catatan Branding

Warna tema yang dipakai (merah tua + emas) ada di `tailwind.config.js`
(`dprd.red`, `dprd.gold`, dst).

Logo sudah memakai gambar resmi:
- `public/logo-dprd.png` — lambang DPRD Kota Bandung, ditampilkan di **kiri** navbar
- `public/logo-humas.png` — logo Humas DPRD Kota Bandung, ditampilkan di **kanan** navbar (tersembunyi di layar kecil/mobile agar navbar tidak sesak)

Kalau suatu saat mau ganti salah satu logo, tinggal timpa (replace) file
dengan nama yang sama di folder `public/` — tidak perlu ubah kode, karena
`components/Navbar.js` sudah mengambil dari kedua path tersebut.

## Catatan Halaman Kalender

Tanggal yang tampil pertama kali saat halaman dibuka adalah **tanggal 10**
bulan berjalan (bukan tanggal hari ini). Ini diatur di `app/page.js` pada
fungsi `getTanggalDefault()` — ganti angka `10` di situ kalau suatu saat
mau diubah.

## Catatan Panel Admin

Link ke panel admin **sengaja tidak dipasang** di navbar/menu publik,
supaya tidak terlihat oleh pengunjung biasa. Untuk mengakses, buka
langsung `/admin/login` (misal `https://nama-domain.vercel.app/admin/login`).
Halaman ini tetap memerlukan login (email & password yang dibuat di
Supabase Authentication) — jadi meskipun linknya diketahui orang lain,
tetap tidak bisa masuk tanpa akun yang valid.

## Pengembangan Lanjutan (opsional, untuk nilai tambah laporan)

- Export data kegiatan ke PDF/Excel per periode
- Role admin bertingkat (super admin vs admin per komisi)
- Notifikasi kegiatan mendatang
