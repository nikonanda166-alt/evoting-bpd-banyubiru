-- ==========================================================
-- SKEMA DATABASE LENGKAP UNTUK SUPABASE (POSTGRESQL)
-- E-VOTING BPD DESA BANYUBIRU PERIODE 2027-2034
-- ==========================================================
-- CARA PENGGUNAAN DI SUPABASE:
-- 1. Buka dashboard Supabase (https://supabase.com)
-- 2. Pilih Project Anda -> Klik menu "SQL Editor" di bilah kiri
-- 3. Klik "New query", paste seluruh isi file ini, lalu klik "Run"
-- ==========================================================

-- 1. BERSIHKAN TABEL LAMA JIKA ADA (OPSIONAL UNTUK RESET LENGKAP)
DROP TABLE IF EXISTS suara CASCADE;
DROP TABLE IF EXISTS pemilih CASCADE;
DROP TABLE IF EXISTS calon CASCADE;
DROP TABLE IF EXISTS wilayah CASCADE;
DROP TABLE IF EXISTS admin CASCADE;
DROP TABLE IF EXISTS pengaturan CASCADE;

-- 2. TABEL WILAYAH / DUSUN
CREATE TABLE wilayah (
    id SERIAL PRIMARY KEY,
    nama_wilayah VARCHAR(100) NOT NULL,
    jadwal VARCHAR(150) NOT NULL,
    lokasi VARCHAR(200) NOT NULL
);

-- 3. TABEL CALON ANGGOTA BPD
CREATE TABLE calon (
    id SERIAL PRIMARY KEY,
    wilayah_id INTEGER NOT NULL REFERENCES wilayah(id) ON DELETE CASCADE,
    nomor_urut INTEGER NOT NULL,
    nama VARCHAR(150) NOT NULL,
    foto VARCHAR(255) DEFAULT '',
    visi_misi TEXT DEFAULT '',
    CONSTRAINT unique_wilayah_nomor UNIQUE (wilayah_id, nomor_urut)
);

-- 4. TABEL PEMILIH & KODE TOKEN
CREATE TABLE pemilih (
    id SERIAL PRIMARY KEY,
    kode_pemilih VARCHAR(50) NOT NULL UNIQUE,
    wilayah_id INTEGER NOT NULL REFERENCES wilayah(id) ON DELETE CASCADE,
    nama_pemilih VARCHAR(150) DEFAULT '',
    sudah_memilih INTEGER DEFAULT 0 CHECK (sudah_memilih IN (0, 1)),
    waktu_memilih TIMESTAMPTZ DEFAULT NULL
);

-- 5. TABEL SUARA (ATOMIC & ANONYMIZED DENGAN CONSTRAINT UNIQUE TOKEN HASH)
CREATE TABLE suara (
    id SERIAL PRIMARY KEY,
    wilayah_id INTEGER NOT NULL REFERENCES wilayah(id) ON DELETE CASCADE,
    calon_id INTEGER NOT NULL REFERENCES calon(id) ON DELETE CASCADE,
    waktu TIMESTAMPTZ DEFAULT NOW(),
    kode_pemilih_hash VARCHAR(64) NOT NULL UNIQUE
);

-- 6. TABEL ADMINISTRATOR PANITIA
CREATE TABLE admin (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. TABEL PENGATURAN STATUS PEMILIHAN
CREATE TABLE pengaturan (
    kunci VARCHAR(50) PRIMARY KEY,
    nilai VARCHAR(255) NOT NULL
);

-- INDEKS OPTIMASI PENCARIAN CEPAT
CREATE INDEX idx_calon_wilayah ON calon(wilayah_id);
CREATE INDEX idx_pemilih_kode ON pemilih(kode_pemilih);
CREATE INDEX idx_pemilih_wilayah ON pemilih(wilayah_id);
CREATE INDEX idx_suara_wilayah ON suara(wilayah_id);
CREATE INDEX idx_suara_calon ON suara(calon_id);

-- ==========================================================
-- DATA AWAL (SEEDING) 9 WILAYAH & 32 CALON RESMI
-- ==========================================================

-- Pengaturan Kunci Data Calon (0 = Terbuka, 1 = Terkunci)
INSERT INTO pengaturan (kunci, nilai) VALUES ('kunci_perubahan_calon', '0');

-- 1. DATA 9 WILAYAH LENGKAP
INSERT INTO wilayah (id, nama_wilayah, jadwal, lokasi) VALUES
(1, 'KETERWAKILAN PEREMPUAN', 'Rabu, 9 September 2026 - Pukul 10.00 WIB', 'Balai Desa Banyubiru'),
(2, 'DUSUN KRAJAN', 'Sabtu, 12 September 2026 - Pukul 19.30 WIB', 'Balai Dusun Krajan'),
(3, 'DUSUN DEMAKAN', 'Minggu, 13 September 2026 - Pukul 19.30 WIB', 'Balai Dusun Demakan'),
(4, 'DUSUN PANCURAN', 'Selasa, 15 September 2026 - Pukul 19.30 WIB', 'Rumah Kadus Pancuran'),
(5, 'DUSUN CERBONAN', 'Selasa, 15 September 2026 - Pukul 19.30 WIB', 'Rumah Bp. Ahmad Arwani (RT 3 RW 8)'),
(6, 'KAMPUNG RAPET', 'Rabu, 16 September 2026 - Pukul 19.30 WIB', 'Balai Dusun Kampung Rapet'),
(7, 'DUSUN RANDUSARI', 'Kamis, 17 September 2026 - Pukul 19.30 WIB', 'Gedung Posyandu'),
(8, 'TAWANGREJO, DANGKEL', 'Jumat, 18 September 2026 - Pukul 19.30 WIB', 'Aula RW 14'),
(9, 'DUSUN TEGALWUNI', 'Jumat, 18 September 2026 - Pukul 19.30 WIB', 'Rumah Kepala Dusun Tegalwuni');

-- 2. DATA 32 CALON ANGGOTA BPD
-- Wilayah 1: Keterwakilan Perempuan
INSERT INTO calon (wilayah_id, nomor_urut, nama, visi_misi) VALUES
(1, 1, 'Latifatul Khoeriyah', 'Mewujudkan aspirasi perempuan Desa Banyubiru yang mandiri dan berdaya saing.'),
(1, 2, 'Khonaah Khusnul Rohmah', 'Mendorong partisipasi aktif kaum perempuan dalam pembangunan dan kesejahteraan keluarga.'),
(1, 3, 'Tri Winarti', 'Mengawal transparansi program pemberdayaan perempuan dan anak di desa.');

-- Wilayah 2: Dusun Krajan
INSERT INTO calon (wilayah_id, nomor_urut, nama, visi_misi) VALUES
(2, 1, 'Aulia Rakan Edelwin', 'Mewujudkan kemajuan Dusun Krajan melalui inovasi pemuda dan tata kelola transparan.'),
(2, 2, 'Wisnu Jati Nugroho', 'Pelayanan prima dan penyaluran aspirasi warga Dusun Krajan secara amanah.'),
(2, 3, 'Antonius Marju', 'Menjaga kerukunan, gotong royong, dan pemerataan pembangunan di Dusun Krajan.');

-- Wilayah 3: Dusun Demakan
INSERT INTO calon (wilayah_id, nomor_urut, nama, visi_misi) VALUES
(3, 1, 'Lazimatul Zasiroh', 'Peningkatan kualitas pelayanan sosial dan kemasyarakatan di Demakan.'),
(3, 2, 'Maulana Bukhori', 'Sinergi antarwarga untuk pembangunan infrastruktur dusun yang berkelanjutan.'),
(3, 3, 'Sri Puji Susanto', 'Mengawal anggaran desa untuk kepentingan masyarakat lapisan bawah.'),
(3, 4, 'Muhammad Irchamul', 'Menggerakkan ekonomi kreatif dan kepemudaan Dusun Demakan.'),
(3, 5, 'Slamet Riyadi', 'Membangun komunikasi terbuka antara warga dan pemerintah desa.'),
(3, 6, 'Nuning Kristiyanti', 'Pemberdayaan kaum ibu dan pelestarian lingkungan dusun yang sehat.');

-- Wilayah 4: Dusun Pancuran
INSERT INTO calon (wilayah_id, nomor_urut, nama, visi_misi) VALUES
(4, 1, 'Petrus Iswadi', 'Meningkatkan sarana prasarana dusun dan keharmonisan antarwarga.'),
(4, 2, 'Suwarto', 'Amanah memperjuangkan hak dan fasilitas umum warga Dusun Pancuran.');

-- Wilayah 5: Dusun Cerbonan
INSERT INTO calon (wilayah_id, nomor_urut, nama, visi_misi) VALUES
(5, 1, 'Guvron Noviandi', 'Mendorong keterbukaan informasi dan digitalisasi kegiatan dusun.'),
(5, 2, 'Izzudin Chaidlir', 'Penguatan peran pemuda dan ketertiban lingkungan dusun.'),
(5, 3, 'Jamil Yatul', 'Kesejahteraan sosial, keagamaan, dan pemberdayaan keluarga.'),
(5, 4, 'Muchamad Nasikin', 'Optimalisasi potensi pertanian dan kerukunan warga Cerbonan.');

-- Wilayah 6: Kampung Rapet
INSERT INTO calon (wilayah_id, nomor_urut, nama, visi_misi) VALUES
(6, 1, 'Edwin Adi Wicaksono', 'Mewujudkan Kampung Rapet yang bersih, aman, dan berdaya saing.'),
(6, 2, 'Yulius Lintin Andoea', 'Penguatan toleransi dan percepatan pembangunan sarana umum.'),
(6, 3, 'Dian Ayu Novianty', 'Pengembangan potensi perempuan dan pendidikan anak usia dini.');

-- Wilayah 7: Dusun Randusari
INSERT INTO calon (wilayah_id, nomor_urut, nama, visi_misi) VALUES
(7, 1, 'Rozie Eljana', 'Modernisasi tata kelola dusun dan pengawalan kebijakan desa.'),
(7, 2, 'Ulin Niha', 'Peningkatan kualitas posyandu, kesehatan warga, dan kebersihan dusun.'),
(7, 3, 'Faridl Hasirul Aqwarm Hadi', 'Menjadi jembatan aspirasi yang jujur dan adil bagi seluruh warga Randusari.'),
(7, 4, 'Danang Prasetyo', 'Pengembangan fasilitas olahraga dan pemberdayaan pemuda.');

-- Wilayah 8: Tawangrejo, Dangkel
INSERT INTO calon (wilayah_id, nomor_urut, nama, visi_misi) VALUES
(8, 1, 'Anasya Aggilia Putri', 'Inspirasi generasi muda dalam membangun dusun yang berwawasan maju.'),
(8, 2, 'La Ode Abdul Aslan', 'Dedikasi penuh untuk pemerataan pembangunan wilayah Tawangrejo & Dangkel.'),
(8, 3, 'Tri Woro Pusphoheni', 'Kemandirian ekonomi keluarga dan pelestarian seni budaya lokal.'),
(8, 4, 'Tri Suwarti', 'Peningkatan kesejahteraan lansia, perempuan, dan anak di lingkungan dusun.');

-- Wilayah 9: Dusun Tegalwuni
INSERT INTO calon (wilayah_id, nomor_urut, nama, visi_misi) VALUES
(9, 1, 'Sugeng', 'Pengalaman dan komitmen tulus untuk kemajuan warga Dusun Tegalwuni.'),
(9, 2, 'Teguh Surono', 'Pemberdayaan kelompok tani dan perbaikan saluran air dusun.'),
(9, 3, 'Margono Hadi', 'Menampung serta merealisasikan aspirasi warga dengan penuh tanggung jawab.');

-- 3. AKUN ADMIN PANITIA DEFAULT (Username: admin, Password: PanitiaBanyubiru2027!)
-- Hash bcrypt dari 'PanitiaBanyubiru2027!'
INSERT INTO admin (username, password_hash) VALUES 
('admin', '$2a$10$f66r8mIqV9z0jWwI2RkeE.7q/O1X6sL17Nq4ZgXGSmh8D55oT5k72');

-- 4. KODE PEMILIH UJI COBA LANGSUNG
INSERT INTO pemilih (kode_pemilih, wilayah_id, nama_pemilih) VALUES
-- Wilayah 1
('PEREMPUAN-01', 1, 'Warga Uji Coba 1'),
('PEREMPUAN-02', 1, 'Warga Uji Coba 2'),
('PEREMPUAN-03', 1, 'Warga Uji Coba 3'),
-- Wilayah 2
('KRAJAN-01', 2, 'Warga Krajan 1'),
('KRAJAN-02', 2, 'Warga Krajan 2'),
-- Wilayah 3
('DEMAKAN-01', 3, 'Warga Demakan 1'),
('DEMAKAN-02', 3, 'Warga Demakan 2'),
-- Wilayah 4
('PANCURAN-01', 4, 'Warga Pancuran 1'),
('PANCURAN-02', 4, 'Warga Pancuran 2'),
-- Wilayah 5
('CERBONAN-01', 5, 'Warga Cerbonan 1'),
('CERBONAN-02', 5, 'Warga Cerbonan 2'),
-- Wilayah 6
('RAPET-01', 6, 'Warga Rapet 1'),
('RAPET-02', 6, 'Warga Rapet 2'),
-- Wilayah 7
('RANDUSARI-01', 7, 'Warga Randusari 1'),
('RANDUSARI-02', 7, 'Warga Randusari 2'),
-- Wilayah 8
('TAWANGREJO-01', 8, 'Warga Tawangrejo 1'),
('TAWANGREJO-02', 8, 'Warga Tawangrejo 2'),
-- Wilayah 9
('TEGALWUNI-01', 9, 'Warga Tegalwuni 1'),
('TEGALWUNI-02', 9, 'Warga Tegalwuni 2');

-- SINKRONISASI SEQUENCE ID POSTGRESQL
SELECT setval('wilayah_id_seq', (SELECT MAX(id) FROM wilayah));
SELECT setval('calon_id_seq', (SELECT MAX(id) FROM calon));
SELECT setval('pemilih_id_seq', (SELECT MAX(id) FROM pemilih));
