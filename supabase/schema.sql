-- =========================================================
-- SKEMA DATABASE: Sistem Dokumentasi Kegiatan DPRD Kota Bandung
-- Jalankan file ini di Supabase -> SQL Editor -> New Query -> Run
-- =========================================================

-- 1. Tabel kategori kegiatan (Rapat Paripurna, Kunjungan Kerja, RDP, dll)
create table if not exists kategori (
  id bigint generated always as identity primary key,
  nama text not null unique,
  created_at timestamptz default now()
);

-- 2. Tabel komisi / alat kelengkapan dewan
create table if not exists komisi (
  id bigint generated always as identity primary key,
  nama text not null unique,
  created_at timestamptz default now()
);

-- 3. Tabel utama kegiatan
create table if not exists kegiatan (
  id bigint generated always as identity primary key,
  judul text not null,
  tanggal date not null,
  jam_mulai time,
  jam_selesai time,
  lokasi text,
  deskripsi text,
  kategori_id bigint references kategori(id) on delete set null,
  komisi_id bigint references komisi(id) on delete set null,
  video_url text,              -- link YouTube/Google Drive (opsional)
  status text default 'draft', -- 'draft' atau 'publish'
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 4. Tabel dokumentasi foto (relasi banyak foto per satu kegiatan)
create table if not exists dokumentasi_foto (
  id bigint generated always as identity primary key,
  kegiatan_id bigint references kegiatan(id) on delete cascade,
  url text not null,
  urutan int default 0,
  created_at timestamptz default now()
);

-- 5. Tabel dokumentasi PDF (relasi banyak file per satu kegiatan)
create table if not exists dokumentasi_pdf (
  id bigint generated always as identity primary key,
  kegiatan_id bigint references kegiatan(id) on delete cascade,
  nama_file text not null,
  url text not null,
  created_at timestamptz default now()
);

-- =========================================================
-- ROW LEVEL SECURITY (RLS)
-- Publik hanya boleh BACA data yang statusnya "publish".
-- Tulis/ubah/hapus hanya boleh oleh user yang sudah login (admin).
-- =========================================================

alter table kegiatan enable row level security;
alter table dokumentasi_foto enable row level security;
alter table dokumentasi_pdf enable row level security;
alter table kategori enable row level security;
alter table komisi enable row level security;

-- Publik boleh baca kegiatan yang sudah publish
create policy "Publik baca kegiatan publish"
on kegiatan for select
to anon
using (status = 'publish');

-- Admin (sudah login) boleh baca semua kegiatan (termasuk draft)
create policy "Admin baca semua kegiatan"
on kegiatan for select
to authenticated
using (true);

-- Admin boleh insert/update/delete kegiatan
create policy "Admin kelola kegiatan"
on kegiatan for all
to authenticated
using (true)
with check (true);

-- Kategori & komisi: publik boleh baca, admin boleh kelola
create policy "Publik baca kategori" on kategori for select to anon using (true);
create policy "Admin kelola kategori" on kategori for all to authenticated using (true) with check (true);

create policy "Publik baca komisi" on komisi for select to anon using (true);
create policy "Admin kelola komisi" on komisi for all to authenticated using (true) with check (true);

-- Dokumentasi foto: publik boleh baca yang induk kegiatannya publish
create policy "Publik baca foto"
on dokumentasi_foto for select
to anon
using (
  exists (select 1 from kegiatan k where k.id = kegiatan_id and k.status = 'publish')
);
create policy "Admin kelola foto" on dokumentasi_foto for all to authenticated using (true) with check (true);

-- Dokumentasi PDF: sama seperti foto
create policy "Publik baca pdf"
on dokumentasi_pdf for select
to anon
using (
  exists (select 1 from kegiatan k where k.id = kegiatan_id and k.status = 'publish')
);
create policy "Admin kelola pdf" on dokumentasi_pdf for all to authenticated using (true) with check (true);

-- =========================================================
-- DATA AWAL (opsional, biar ada contoh)
-- =========================================================
insert into kategori (nama) values
  ('Rapat Paripurna'),
  ('Rapat Dengar Pendapat (RDP)'),
  ('Kunjungan Kerja'),
  ('Rapat Komisi'),
  ('Kegiatan Lainnya')
on conflict (nama) do nothing;

insert into komisi (nama) values
  ('Komisi I'),
  ('Komisi II'),
  ('Komisi III'),
  ('Komisi IV'),
  ('Badan Anggaran'),
  ('Badan Pembentukan Peraturan Daerah')
on conflict (nama) do nothing;

-- =========================================================
-- STORAGE BUCKETS
-- Jalankan bagian ini juga, atau buat manual lewat menu Storage:
-- 1. Buat bucket "foto-kegiatan"  -> set Public
-- 2. Buat bucket "dokumen-pdf"    -> set Public
-- =========================================================
insert into storage.buckets (id, name, public)
values ('foto-kegiatan', 'foto-kegiatan', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('dokumen-pdf', 'dokumen-pdf', true)
on conflict (id) do nothing;

-- Izinkan publik membaca file di bucket (karena bucket public = true, ini pelengkap)
create policy "Publik baca file foto"
on storage.objects for select
to anon
using (bucket_id = 'foto-kegiatan');

create policy "Publik baca file pdf"
on storage.objects for select
to anon
using (bucket_id = 'dokumen-pdf');

-- Admin (authenticated) boleh upload & hapus file
create policy "Admin upload foto"
on storage.objects for insert
to authenticated
with check (bucket_id = 'foto-kegiatan');

create policy "Admin hapus foto"
on storage.objects for delete
to authenticated
using (bucket_id = 'foto-kegiatan');

create policy "Admin upload pdf"
on storage.objects for insert
to authenticated
with check (bucket_id = 'dokumen-pdf');

create policy "Admin hapus pdf"
on storage.objects for delete
to authenticated
using (bucket_id = 'dokumen-pdf');
