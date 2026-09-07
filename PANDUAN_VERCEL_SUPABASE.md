# TUTORIAL DEPLOY E-VOTING BANYUBIRU DARI NOL
## Hosting: Vercel &bull; Database: Supabase (PostgreSQL)

Tutorial ini disusun langkah demi langkah dari nol agar sistem E-Voting BPD Desa Banyubiru dapat online di internet secara gratis, memiliki database cloud terpusat, dan dapat diakses bersamaan oleh ratusan/ribuan warga desa melalui HP masing-masing.

---

## DAFTAR ISI
1. [Langkah 1: Membuat Database di Supabase](#langkah-1-membuat-database-di-supabase)
2. [Langkah 2: Menjalankan Skema SQL di Supabase](#langkah-2-menjalankan-skema-sql-di-supabase)
3. [Langkah 3: Mengambil Connection String Database](#langkah-3-mengambil-connection-string-database)
4. [Langkah 4: Mengunggah Kode ke GitHub](#langkah-4-mengunggah-kode-ke-github)
5. [Langkah 5: Menghubungkan & Deploy ke Vercel](#langkah-5-menghubungkan--deploy-ke-vercel)
6. [Langkah 6: Membuka Website & Dashboard Admin](#langkah-6-membuka-website--dashboard-admin)
7. [Langkah 7: Cara Membagikan Link ke Warga Pemilih](#langkah-7-cara-membagikan-link-ke-warga-pemilih)

---

## LANGKAH 1: MEMBUAT DATABASE DI SUPABASE

Supabase adalah layanan database PostgreSQL cloud modern dan gratis yang akan menjadi pusat penyimpanan suara seluruh pemilih.

1. Buka browser dan kunjungi situs resmi: **[https://supabase.com](https://supabase.com)**
2. Klik tombol hijau **Start your project** (atau **Sign In** jika sudah punya akun).
3. Anda bisa login menggunakan akun **GitHub** atau mendaftar dengan **Email**.
4. Setelah masuk ke Dashboard Supabase, klik tombol **New Project**.
5. Isi formulir pembuatan project:
   - **Name**: `evoting-banyubiru`
   - **Database Password**: Buat password yang kuat (misalnya: `Banyubiru2027!Secure`). **PENTING: Catat password ini baik-baik!**
   - **Region**: Pilih **Singapore (ap-southeast-1)** (lokasi server terdekat dengan Indonesia agar akses pemilih sangat cepat).
   - **Pricing Plan**: Pilih **Free Plan** ($0 / Gratis).
6. Klik tombol **Create new project**.
7. Tunggu sekitar 1–2 menit sampai proses penyiapan server database Supabase selesai.

---

## LANGKAH 2: MENJALANKAN SKEMA SQL DI SUPABASE

Langkah ini akan membuat seluruh tabel (`wilayah`, `calon`, `pemilih`, `suara`, `admin`, `pengaturan`) dan langsung mengisi seluruh **9 Wilayah** serta **32 Calon Anggota BPD Resmi**.

1. Di dashboard Supabase project Anda, lihat menu bilah sisi sebelah kiri.
2. Klik menu **SQL Editor** (ikon terminal/dokumen SQL `>_`).
3. Klik tombol **New query** (atau tanda `+`).
4. Buka file skema yang sudah kami siapkan di komputer Anda:
   `database/supabase_schema.sql`
5. Salin (**Copy**) seluruh isi kode dari file tersebut.
6. Tempel (**Paste**) kode tersebut ke dalam kolom editor SQL di Supabase.
7. Klik tombol hijau **Run** di pojok kanan bawah editor (atau tekan `Ctrl + Enter`).
8. Di bagian bawah akan muncul pesan: **`Success. No rows returned`**.
9. Selesai! Seluruh 9 dusun, 32 calon, dan akun panitia sudah tersimpan di database cloud Supabase Anda. Anda dapat mengeceknya di menu **Table Editor**.

---

## LANGKAH 3: MENGAMBIL CONNECTION STRING DATABASE

Kita memerlukan string koneksi agar Vercel dapat berkomunikasi dengan database Supabase.

1. Di bilah menu kiri bawah Supabase, klik ikon **Project Settings** (ikon gerigi ⚙️).
2. Pilih submenu **Database**.
3. Gulir ke bawah ke bagian **Connection string**.
4. Klik tab **URI**.
5. Di bagian Mode, Anda bisa memilih **Session** (Port 5432) atau **Transaction** (Port 6543).
6. Salin teks URI yang tampil, formatnya seperti ini:
   ```text
   postgresql://postgres.abcdefghijklmnop:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
   ```
7. Ganti teks `[YOUR-PASSWORD]` dengan password database yang Anda buat pada **Langkah 1**.
   *Contoh hasil akhir yang benar:*
   ```text
   postgresql://postgres.abcdefghijklmnop:Banyubiru2027!Secure@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
   ```
8. Simpan string ini di Notepad sementara, kita akan memasukkannya ke Vercel pada Langkah 5.

---

## LANGKAH 4: MENGUNGGAH KODE KE GITHUB

Vercel membaca kode program secara otomatis dari repository GitHub Anda.

1. Buka **[https://github.com](https://github.com)** dan login ke akun Anda.
2. Klik tombol **New** di samping tulisan "Repositories" untuk membuat repository baru.
3. Beri nama repository: `evoting-bpd-banyubiru`.
4. Pilih opsi **Private** (atau Public), lalu klik **Create repository**.
5. Buka Terminal / PowerShell di komputer Anda, lalu arahkan ke folder proyek ini:
   ```bash
   cd C:\Users\User\.gemini\antigravity\scratch\evoting-banyubiru
   ```
6. Jalankan perintah git berikut satu per satu:
   ```bash
   git init
   git add .
   git commit -m "Deploy sistem E-Voting BPD Banyubiru"
   git branch -M main
   git remote add origin https://github.com/USERNAME_ANDA/evoting-bpd-banyubiru.git
   git push -u origin main
   ```
   *(Ganti `USERNAME_ANDA` dengan username akun GitHub Anda).*

---

## LANGKAH 5: MENGHUBUNGKAN & DEPLOY KE VERCEL

1. Buka situs resmi Vercel: **[https://vercel.com](https://vercel.com)**
2. Login atau daftar menggunakan akun **GitHub** Anda.
3. Di Dashboard Vercel, klik tombol **Add New...** -> pilih **Project**.
4. Anda akan melihat daftar repository GitHub Anda. Cari repository **`evoting-bpd-banyubiru`**, lalu klik tombol **Import**.
5. Di halaman konfigurasi project:
   - **Project Name**: biarkan `evoting-bpd-banyubiru`
   - **Framework Preset**: biarkan `Other`
   - **Root Directory**: biarkan `./`
6. Buka bagian accordion **Environment Variables**, lalu tambahkan 4 variabel berikut:

   | Key (Nama Variabel) | Value (Nilai) |
   | :--- | :--- |
   | `DATABASE_URL` | *Paste string koneksi Supabase dari Langkah 3* |
   | `JWT_SECRET` | `banyubiru_bpd_secret_key_2027_2034_secure!` |
   | `ADMIN_USERNAME` | `admin` |
   | `ADMIN_PASSWORD` | `PanitiaBanyubiru2027!` |

7. Setelah keempat variabel dimasukkan, klik tombol biru **Deploy**.
8. Tunggu proses build sekitar 30–60 detik hingga muncul animasi kembang api 🎉 bertuliskan **Congratulations!**.

---

## LANGKAH 6: MEMBUKA WEBSITE & DASHBOARD ADMIN

Setelah deploy selesai, Vercel akan memberikan domain publik resmi gratis berekstensi `.vercel.app`, misalnya:
👉 **`https://evoting-bpd-banyubiru.vercel.app`**

### 1. Halaman Pemilih (Untuk Warga):
- Buka URL utama: `https://evoting-bpd-banyubiru.vercel.app`
- Warga dapat memilih wilayah dusun, memasukkan kode pemilih yang diberikan panitia, melihat foto & nama calon, lalu klik tombol **PILIH CALON INI**.
- Muncul konfirmasi ganda sebelum suara terkirim ke Supabase.
- Layar sukses akan langsung muncul dan kode pemilih langsung dikunci agar tidak dapat memilih dua kali.

### 2. Dashboard Admin (Untuk Panitia):
- Buka URL: `https://evoting-bpd-banyubiru.vercel.app/admin`
- Masukkan login panitia:
  - **Username**: `admin`
  - **Password**: `PanitiaBanyubiru2027!`
- Di dashboard, panitia dapat:
  - Melihat grafik batang perolehan suara yang bergerak naik secara real-time.
  - Memantau persentase partisipasi warga per dusun.
  - Men-generate ratusan kode pemilih baru secara otomatis untuk masing-masing dusun.
  - Mengunduh rekap suara dalam format file **CSV / Excel**.
  - Mengunci perubahan data calon selama masa pemungutan suara.

---

## LANGKAH 7: CARA MEMBAGIKAN LINK KE WARGA PEMILIH

1. **Bagikan via WhatsApp**:
   Kirim pesan pengumuman ke grup RT/RW atau dusun:
   > *"Yth. Warga Dusun Krajan Desa Banyubiru, Pemilihan Anggota BPD Periode 2027–2034 dilaksanakan secara E-Voting. Silakan gunakan hak suara Anda melalui link berikut: https://evoting-bpd-banyubiru.vercel.app dengan memasukkan Kode Pemilih yang telah dibagikan panitia."*

2. **Cetak QR Code di Lokasi Pemilihan**:
   - Buka situs pembuat QR Code gratis seperti [qr-code-generator.com](https://www.qr-code-generator.com).
   - Masukkan link Vercel Anda: `https://evoting-bpd-banyubiru.vercel.app`
   - Download gambar QR Code, lalu cetak di kertas pengumuman balai dusun / posyandu.
   - Warga cukup membuka kamera smartphone mereka dan memindai QR Code untuk langsung mencoblos secara digital.

3. **Domain Kustom Desa (Opsional)**:
   Jika Pemerintah Desa Banyubiru memiliki domain resmi (misal `banyubiru.desa.id`), Anda bisa memasangnya dengan gratis di menu **Settings -> Domains** pada dashboard Vercel (misal: `evoting.banyubiru.desa.id`).
