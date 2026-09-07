# PANDUAN LENGKAP SISTEM E-VOTING BPD DESA BANYUBIRU (2027–2034)

Sistem Informasi Pemilihan Anggota Badan Permusyawaratan Desa (BPD) Desa Banyubiru, Kecamatan Banyubiru, Kabupaten Semarang, Periode 2027–2034.

Sistem ini dirancang berbasis web terpusat (*client-server*), memungkinkan ribuan pemilih membuka website dari HP/laptop masing-masing melalui satu link yang sama, dengan penyimpanan suara yang aman dari pemilihan ganda (*double voting*) menggunakan transaksi atomik database server-side.

---

## 1. STRUKTUR FOLDER & ARSITEKTUR

```text
evoting-banyubiru/
├── frontend/
│   ├── index.html        # Antarmuka resmi pemilih (Mobile-friendly HP/Laptop)
│   ├── admin.html        # Dashboard pengawasan Panitia BPD (Terproteksi JWT)
│   ├── css/
│   │   ├── style.css     # Tampilan pemilih (Biru tua, putih, aksen emas/kuning)
│   │   └── admin.css     # Tampilan dashboard admin, tabel, dan grafik responsif
│   └── js/
│       ├── app.js        # Logika pemilih: pilih wilayah, cek kode, modal konfirmasi, voting
│       └── admin.js      # Logika admin: otentikasi, grafik, rekapitulasi, generator kode, ekspor CSV, reset
├── backend/
│   ├── server.js         # Server Express: routing API, hosting frontend, verifikasi suara
│   ├── db.js             # Engine SQLite: inisialisasi tabel otomatis & transaksi atomik suara
│   ├── auth.js           # Middleware keamanan otentikasi JWT & proteksi endpoint admin
│   └── seed.js           # Script inisialisasi mandiri data wilayah & 32 calon resmi
├── database/
│   ├── schema.sql        # Skema DDL tabel database (Kompatibel SQLite & PostgreSQL)
│   └── seed.sql          # Data DML SQL lengkap 9 wilayah & seluruh calon BPD
├── package.json          # Manajemen dependensi Node.js
├── .env.example          # Template konfigurasi variabel lingkungan
├── .env                  # Konfigurasi aktif (Port, Admin Password, JWT Secret)
└── README.md             # Dokumentasi operasional dan panduan deploy
```

---

## 2. DATA RESMI 9 WILAYAH & 32 CALON ANGGOTA BPD

Seluruh data wilayah, jadwal, lokasi, nomor urut, dan nama calon berikut **sudah diintegrasikan secara otomatis** ke dalam sistem:

1. **Keterwakilan Perempuan** (Rabu, 9 September 2026 - Pukul 10.00 WIB @ Balai Desa Banyubiru)
   - No. 1: Latifatul Khoeriyah
   - No. 2: Khonaah Khusnul Rohmah
   - No. 3: Tri Winarti
2. **Dusun Krajan** (Sabtu, 12 September 2026 - Pukul 19.30 WIB @ Balai Dusun Krajan)
   - No. 1: Aulia Rakan Edelwin
   - No. 2: Wisnu Jati Nugroho
   - No. 3: Antonius Marju
3. **Dusun Demakan** (Minggu, 13 September 2026 - Pukul 19.30 WIB @ Balai Dusun Demakan)
   - No. 1: Lazimatul Zasiroh
   - No. 2: Maulana Bukhori
   - No. 3: Sri Puji Susanto
   - No. 4: Muhammad Irchamul
   - No. 5: Slamet Riyadi
   - No. 6: Nuning Kristiyanti
4. **Dusun Pancuran** (Selasa, 15 September 2026 - Pukul 19.30 WIB @ Rumah Kadus Pancuran)
   - No. 1: Petrus Iswadi
   - No. 2: Suwarto
5. **Dusun Cerbonan** (Selasa, 15 September 2026 - Pukul 19.30 WIB @ Rumah Bp. Ahmad Arwani RT 3 RW 8)
   - No. 1: Guvron Noviandi
   - No. 2: Izzudin Chaidlir
   - No. 3: Jamil Yatul
   - No. 4: Muchamad Nasikin
6. **Kampung Rapet** (Rabu, 16 September 2026 - Pukul 19.30 WIB @ Balai Dusun Kampung Rapet)
   - No. 1: Edwin Adi Wicaksono
   - No. 2: Yulius Lintin Andoea
   - No. 3: Dian Ayu Novianty
7. **Dusun Randusari** (Kamis, 17 September 2026 - Pukul 19.30 WIB @ Gedung Posyandu)
   - No. 1: Rozie Eljana
   - No. 2: Ulin Niha
   - No. 3: Faridl Hasirul Aqwarm Hadi
   - No. 4: Danang Prasetyo
8. **Tawangrejo, Dangkel** (Jumat, 18 September 2026 - Pukul 19.30 WIB @ Aula RW 14)
   - No. 1: Anasya Aggilia Putri
   - No. 2: La Ode Abdul Aslan
   - No. 3: Tri Woro Pusphoheni
   - No. 4: Tri Suwarti
9. **Dusun Tegalwuni** (Jumat, 18 September 2026 - Pukul 19.30 WIB @ Rumah Kepala Dusun Tegalwuni)
   - No. 1: Sugeng
   - No. 2: Teguh Surono
   - No. 3: Margono Hadi

---

## 3. SKEMA DATABASE & PENCEGAHAN DOUBLE-VOTING

Skema database terdiri dari 6 tabel utama:
1. `wilayah` : ID, nama wilayah, jadwal, lokasi pelaksanaan.
2. `calon` : ID, relasi `wilayah_id`, nomor urut, nama calon, visi-misi, foto.
3. `pemilih` : ID, `kode_pemilih` (UNIQUE), `wilayah_id`, status `sudah_memilih` (0/1), dan `waktu_memilih`.
4. `suara` : ID, `wilayah_id`, `calon_id`, `waktu`, dan `kode_pemilih_hash` (UNIQUE).
5. `admin` : ID, username, password ter-hash bcrypt.
6. `pengaturan` : Kunci integritas data pemilihan (`kunci_perubahan_calon`).

### Mekanisme Keamanan Transaksi Atomik (Anti Double-Voting):
Setiap suara diproses dalam satu transaksi terisolasi (`BEGIN IMMEDIATE TRANSACTION`):
- Server memverifikasi kecocokan wilayah dan status `sudah_memilih == 0`.
- Menyimpan suara ke tabel `suara` dengan constraint hash token pemilih yang unik.
- Memperbarui status pemilih menjadi `sudah_memilih = 1` pada milidetik yang sama.
- Apabila dua perangkat memasukkan kode yang sama pada saat bersamaan, transaksi kedua otomatis digagalkan oleh constraint database dan di-*ROLLBACK*.

---

## 4. CARA MEMBUAT DATABASE & MEMASUKKAN DATA

Sistem ini dirancang sangat praktis (*zero-friction*):
- **Otomatis**: Saat aplikasi dijalankan pertama kali (`npm start`), file `evoting.db` akan langsung dibuat secara otomatis, tabel terkonfigurasi, dan seluruh data 9 wilayah beserta 32 calon resmi langsung terisi.
- **Manual (Jika Diperlukan)**: Anda juga dapat menjalankan script seeding kapan saja dengan perintah:
  ```bash
  npm run seed
  ```
- **PostgreSQL / Supabase**: Jika Anda menggunakan database cloud PostgreSQL, cukup jalankan script yang ada di file [database/schema.sql](file:///C:/Users/User/.gemini/antigravity/scratch/evoting-banyubiru/database/schema.sql) lalu [database/seed.sql](file:///C:/Users/User/.gemini/antigravity/scratch/evoting-banyubiru/database/seed.sql).

---

## 5. CARA MEMBUAT DAN MENGATUR AKUN ADMIN

Kredensial default admin tersimpan pada file `.env`:
- **Username Default**: `admin`
- **Password Default**: `PanitiaBanyubiru2027!`

Untuk mengganti password:
1. Buka file `.env`.
2. Ubah baris:
   ```env
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=PasswordBaruPanitia2027!
   ```
3. Restart server. Password baru akan otomatis di-hash menggunakan algoritma **Bcrypt** dan disimpan ke database.

---

## 6. CARA MENJALANKAN APLIKASI DI KOMPUTER LOKAL / LAPTOP PANITIA

### Persyaratan:
- Node.js (Versi 18 atau lebih baru) terinstal di komputer.

### Langkah Menjalankan:
1. Buka terminal (Command Prompt / PowerShell) di folder proyek:
   ```bash
   cd evoting-banyubiru
   ```
2. Pasang modul dependensi:
   ```bash
   npm install
   ```
3. Jalankan aplikasi:
   ```bash
   npm start
   ```
4. Aplikasi akan aktif di port 3000:
   - **Halaman Pemilih**: `http://localhost:3000`
   - **Dashboard Admin**: `http://localhost:3000/admin`

---

## 7. CARA DEPLOY KE INTERNET (GRATIS & BISA DIAKSES OLEH SELURUH WARGA)

Agar dapat diakses oleh ribuan pemilih dari HP masing-masing di mana saja, aplikasi dapat di-deploy ke layanan cloud gratis/murah seperti **Render.com** atau **Railway.app**.

### Pilihan A: Deploy ke Render.com (Sangat Mudah & Gratis)
1. Buat akun di [Render.com](https://render.com).
2. Upload folder `evoting-banyubiru` ke GitHub pribadi Anda.
3. Di Dashboard Render, klik **New +** -> pilih **Web Service**.
4. Hubungkan repository GitHub Anda.
5. Isi konfigurasi:
   - **Name**: `evoting-bpd-banyubiru`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
6. Masukkan Environment Variables (opsional, dapat menyalin dari `.env`).
7. Klik **Create Web Service**. Tunggu 1–2 menit hingga status berubah menjadi **Live**.

### Pilihan B: Deploy Menggunakan VPS Desa (Ubuntu / Linux)
1. Pasang Node.js & PM2 di server desa:
   ```bash
   sudo apt update && sudo apt install -y nodejs npm
   sudo npm install -g pm2
   ```
2. Salin folder proyek ke server:
   ```bash
   cd /var/www/evoting-banyubiru
   npm install --production
   pm2 start backend/server.js --name "evoting-banyubiru"
   pm2 startup
   pm2 save
   ```

---

## 8. CARA MENDAPATKAN DAN MEMBAGIKAN URL KEPADA PEMILIH

Setelah proses deploy di Render/Railway selesai, Anda akan mendapatkan URL resmi seperti:
```text
https://evoting-bpd-banyubiru.onrender.com
```

### Cara Membagikan ke Warga:
1. **Link Singkat / WhatsApp**: Bagikan link tersebut melalui grup WhatsApp RT/RW dan Dusun di Desa Banyubiru.
2. **Cetak QR Code**: Buat QR Code yang mengarah ke link tersebut (melalui situs pembuat QR gratis seperti `qr-code-generator.com`), lalu cetak pada selebaran pengumuman di pos ronda, balai dusun, atau posyandu.
3. Setiap warga cukup memindai QR Code menggunakan kamera HP masing-masing untuk langsung membuka halaman voting tanpa perlu menginstal aplikasi.

---

## 9. CARA MENGAKSES DASHBOARD ADMIN

1. Buka browser dan tambahkan `/admin` di belakang URL aplikasi:
   - Di lokal: `http://localhost:3000/admin`
   - Di internet: `https://evoting-bpd-banyubiru.onrender.com/admin`
2. Masukkan username dan password panitia.
3. Di dalam dashboard, Anda dapat:
   - Memantau perolehan suara per calon secara **real-time** dengan grafik batang.
   - Melihat tingkat partisipasi warga per dusun.
   - Mengunduh rekap suara dalam bentuk **file CSV** (bisa langsung dibuka di Microsoft Excel).
   - Men-generate token / kode pemilih baru untuk masing-masing dusun.
   - Mengunci data pemilihan agar daftar calon tidak bisa diubah saat pemungutan suara berlangsung.
   - Melakukan reset suara uji coba secara aman dengan sistem konfirmasi ganda dan verifikasi password.

---

## 10. CONTOH KODE PEMILIH UNTUK PENGUJIAN LANGSUNG

Sistem telah menyediakan kode pemilih contoh yang siap dicoba langsung pada masing-masing wilayah:

| Wilayah | Contoh Kode Pemilih Siap Pakai |
| :--- | :--- |
| **Keterwakilan Perempuan** | `PEREMPUAN-01`, `PEREMPUAN-02`, `PEREMPUAN-03` |
| **Dusun Krajan** | `KRAJAN-01`, `KRAJAN-02`, `KRAJAN-03` |
| **Dusun Demakan** | `DEMAKAN-01`, `DEMAKAN-02`, `DEMAKAN-03` |
| **Dusun Pancuran** | `PANCURAN-01`, `PANCURAN-02` |
| **Dusun Cerbonan** | `CERBONAN-01`, `CERBONAN-02` |
| **Kampung Rapet** | `RAPET-01`, `RAPET-02` |
| **Dusun Randusari** | `RANDUSARI-01`, `RANDUSARI-02` |
| **Tawangrejo, Dangkel** | `TAWANGREJO-01`, `TAWANGREJO-02` |
| **Dusun Tegalwuni** | `TEGALWUNI-01`, `TEGALWUNI-02` |

> *Catatan Panitia:* Kode-kode di atas dapat ditambah atau digenerate sebanyak mungkin melalui menu **Data Pemilih -> Generate Kode Pemilih Baru** pada Dashboard Admin.
