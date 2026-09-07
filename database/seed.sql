-- ==========================================================
-- SEED DATA E-VOTING BPD DESA BANYUBIRU (2027-2034)
-- ==========================================================

-- Inisialisasi Pengaturan Kunci Pemilihan (0 = Terbuka, 1 = Terkunci)
INSERT OR REPLACE INTO pengaturan (kunci, nilai) VALUES ('kunci_perubahan_calon', '0');
INSERT OR REPLACE INTO pengaturan (kunci, nilai) VALUES ('status_pemilihan', 'aktif');

-- 1. DATA 9 WILAYAH PEMILIHAN
INSERT OR REPLACE INTO wilayah (id, nama_wilayah, jadwal, lokasi) VALUES
(1, 'KETERWAKILAN PEREMPUAN', 'Rabu, 9 September 2026 - Pukul 10.00 WIB', 'Balai Desa Banyubiru'),
(2, 'DUSUN KRAJAN', 'Sabtu, 12 September 2026 - Pukul 19.30 WIB', 'Balai Dusun Krajan'),
(3, 'DUSUN DEMAKAN', 'Minggu, 13 September 2026 - Pukul 19.30 WIB', 'Balai Dusun Demakan'),
(4, 'DUSUN PANCURAN', 'Selasa, 15 September 2026 - Pukul 19.30 WIB', 'Rumah Kadus Pancuran'),
(5, 'DUSUN CERBONAN', 'Selasa, 15 September 2026 - Pukul 19.30 WIB', 'Rumah Bp. Ahmad Arwani (RT 3 RW 8)'),
(6, 'KAMPUNG RAPET', 'Rabu, 16 September 2026 - Pukul 19.30 WIB', 'Balai Dusun Kampung Rapet'),
(7, 'DUSUN RANDUSARI', 'Kamis, 17 September 2026 - Pukul 19.30 WIB', 'Gedung Posyandu'),
(8, 'TAWANGREJO, DANGKEL', 'Jumat, 18 September 2026 - Pukul 19.30 WIB', 'Aula RW 14'),
(9, 'DUSUN TEGALWUNI', 'Jumat, 18 September 2026 - Pukul 19.30 WIB', 'Rumah Kepala Dusun Tegalwuni');

-- 2. DATA CALON ANGGOTA BPD LENGKAP
-- Wilayah 1: Keterwakilan Perempuan
INSERT OR REPLACE INTO calon (id, wilayah_id, nomor_urut, nama, foto, visi_misi) VALUES
(1, 1, 1, 'Latifatul Khoeriyah', '', 'Mewujudkan aspirasi perempuan Desa Banyubiru yang mandiri dan berdaya saing.'),
(2, 1, 2, 'Khonaah Khusnul Rohmah', '', 'Mendorong partisipasi aktif kaum perempuan dalam pembangunan dan kesejahteraan keluarga.'),
(3, 1, 3, 'Tri Winarti', '', 'Mengawal transparansi program pemberdayaan perempuan dan anak di desa.');

-- Wilayah 2: Dusun Krajan
INSERT OR REPLACE INTO calon (id, wilayah_id, nomor_urut, nama, foto, visi_misi) VALUES
(4, 2, 1, 'Aulia Rakan Edelwin', '', 'Mewujudkan kemajuan Dusun Krajan melalui inovasi pemuda dan tata kelola transparan.'),
(5, 2, 2, 'Wisnu Jati Nugroho', '', 'Pelayanan prima dan penyaluran aspirasi warga Dusun Krajan secara amanah.'),
(6, 2, 3, 'Antonius Marju', '', 'Menjaga kerukunan, gotong royong, dan pemerataan pembangunan di Dusun Krajan.');

-- Wilayah 3: Dusun Demakan
INSERT OR REPLACE INTO calon (id, wilayah_id, nomor_urut, nama, foto, visi_misi) VALUES
(7, 3, 1, 'Lazimatul Zasiroh', '', 'Peningkatan kualitas pelayanan sosial dan kemasyarakatan di Demakan.'),
(8, 3, 2, 'Maulana Bukhori', '', 'Sinergi antarwarga untuk pembangunan infrastruktur dusun yang berkelanjutan.'),
(9, 3, 3, 'Sri Puji Susanto', '', 'Mengawal anggaran desa untuk kepentingan masyarakat lapisan bawah.'),
(10, 3, 4, 'Muhammad Irchamul', '', 'Menggerakkan ekonomi kreatif dan kepemudaan Dusun Demakan.'),
(11, 3, 5, 'Slamet Riyadi', '', 'Membangun komunikasi terbuka antara warga dan pemerintah desa.'),
(12, 3, 6, 'Nuning Kristiyanti', '', 'Pemberdayaan kaum ibu dan pelestarian lingkungan dusun yang sehat.');

-- Wilayah 4: Dusun Pancuran
INSERT OR REPLACE INTO calon (id, wilayah_id, nomor_urut, nama, foto, visi_misi) VALUES
(13, 4, 1, 'Petrus Iswadi', '', 'Meningkatkan sarana prasarana dusun dan keharmonisan antarwarga.'),
(14, 4, 2, 'Suwarto', '', 'Amanah memperjuangkan hak dan fasilitas umum warga Dusun Pancuran.');

-- Wilayah 5: Dusun Cerbonan
INSERT OR REPLACE INTO calon (id, wilayah_id, nomor_urut, nama, foto, visi_misi) VALUES
(15, 5, 1, 'Guvron Noviandi', '', 'Mendorong keterbukaan informasi dan digitalisasi kegiatan dusun.'),
(16, 5, 2, 'Izzudin Chaidlir', '', 'Penguatan peran pemuda dan ketertiban lingkungan dusun.'),
(17, 5, 3, 'Jamil Yatul', '', 'Kesejahteraan sosial, keagamaan, dan pemberdayaan keluarga.'),
(18, 5, 4, 'Muchamad Nasikin', '', 'Optimalisasi potensi pertanian dan kerukunan warga Cerbonan.');

-- Wilayah 6: Kampung Rapet
INSERT OR REPLACE INTO calon (id, wilayah_id, nomor_urut, nama, foto, visi_misi) VALUES
(19, 6, 1, 'Edwin Adi Wicaksono', '', 'Mewujudkan Kampung Rapet yang bersih, aman, dan berdaya saing.'),
(20, 6, 2, 'Yulius Lintin Andoea', '', 'Penguatan toleransi dan percepatan pembangunan sarana umum.'),
(21, 6, 3, 'Dian Ayu Novianty', '', 'Pengembangan potensi perempuan dan pendidikan anak usia dini.');

-- Wilayah 7: Dusun Randusari
INSERT OR REPLACE INTO calon (id, wilayah_id, nomor_urut, nama, foto, visi_misi) VALUES
(22, 7, 1, 'Rozie Eljana', '', 'Modernisasi tata kelola dusun dan pengawalan kebijakan desa.'),
(23, 7, 2, 'Ulin Niha', '', 'Peningkatan kualitas posyandu, kesehatan warga, dan kebersihan dusun.'),
(24, 7, 3, 'Faridl Hasirul Aqwarm Hadi', '', 'Menjadi jembatan aspirasi yang jujur dan adil bagi seluruh warga Randusari.'),
(25, 7, 4, 'Danang Prasetyo', '', 'Pengembangan fasilitas olahraga dan pemberdayaan pemuda.');

-- Wilayah 8: Tawangrejo, Dangkel
INSERT OR REPLACE INTO calon (id, wilayah_id, nomor_urut, nama, foto, visi_misi) VALUES
(26, 8, 1, 'Anasya Aggilia Putri', '', 'Inspirasi generasi muda dalam membangun dusun yang berwawasan maju.'),
(27, 8, 2, 'La Ode Abdul Aslan', '', 'Dedikasi penuh untuk pemerataan pembangunan wilayah Tawangrejo & Dangkel.'),
(28, 8, 3, 'Tri Woro Pusphoheni', '', 'Kemandirian ekonomi keluarga dan pelestarian seni budaya lokal.'),
(29, 8, 4, 'Tri Suwarti', '', 'Peningkatan kesejahteraan lansia, perempuan, dan anak di lingkungan dusun.');

-- Wilayah 9: Dusun Tegalwuni
INSERT OR REPLACE INTO calon (id, wilayah_id, nomor_urut, nama, foto, visi_misi) VALUES
(30, 9, 1, 'Sugeng', '', 'Pengalaman dan komitmen tulus untuk kemajuan warga Dusun Tegalwuni.'),
(31, 9, 2, 'Teguh Surono', '', 'Pemberdayaan kelompok tani dan perbaikan saluran air dusun.'),
(32, 9, 3, 'Margono Hadi', '', 'Menampung serta merealisasikan aspirasi warga dengan penuh tanggung jawab.');

-- 3. KODE PEMILIH AWAL UNTUK UJI COBA (5 TOKEN PER WILAYAH)
INSERT OR REPLACE INTO pemilih (kode_pemilih, wilayah_id, nama_pemilih) VALUES
-- Wilayah 1 (Keterwakilan Perempuan)
('PEREMPUAN-01', 1, 'Pemilih Uji Coba 1'),
('PEREMPUAN-02', 1, 'Pemilih Uji Coba 2'),
('PEREMPUAN-03', 1, 'Pemilih Uji Coba 3'),
('PEREMPUAN-04', 1, 'Pemilih Uji Coba 4'),
('PEREMPUAN-05', 1, 'Pemilih Uji Coba 5'),
-- Wilayah 2 (Dusun Krajan)
('KRAJAN-01', 2, 'Warga Krajan 1'),
('KRAJAN-02', 2, 'Warga Krajan 2'),
('KRAJAN-03', 2, 'Warga Krajan 3'),
-- Wilayah 3 (Dusun Demakan)
('DEMAKAN-01', 3, 'Warga Demakan 1'),
('DEMAKAN-02', 3, 'Warga Demakan 2'),
('DEMAKAN-03', 3, 'Warga Demakan 3'),
-- Wilayah 4 (Dusun Pancuran)
('PANCURAN-01', 4, 'Warga Pancuran 1'),
('PANCURAN-02', 4, 'Warga Pancuran 2'),
-- Wilayah 5 (Dusun Cerbonan)
('CERBONAN-01', 5, 'Warga Cerbonan 1'),
('CERBONAN-02', 5, 'Warga Cerbonan 2'),
-- Wilayah 6 (Kampung Rapet)
('RAPET-01', 6, 'Warga Rapet 1'),
('RAPET-02', 6, 'Warga Rapet 2'),
-- Wilayah 7 (Dusun Randusari)
('RANDUSARI-01', 7, 'Warga Randusari 1'),
('RANDUSARI-02', 7, 'Warga Randusari 2'),
-- Wilayah 8 (Tawangrejo, Dangkel)
('TAWANGREJO-01', 8, 'Warga Tawangrejo 1'),
('TAWANGREJO-02', 8, 'Warga Tawangrejo 2'),
-- Wilayah 9 (Dusun Tegalwuni)
('TEGALWUNI-01', 9, 'Warga Tegalwuni 1'),
('TEGALWUNI-02', 9, 'Warga Tegalwuni 2');
