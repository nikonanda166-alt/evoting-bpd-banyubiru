require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const crypto = require('crypto');

const {
  dbAll,
  dbGet,
  dbRun,
  initDatabase,
  ensureDbInitialized,
  getSharedState,
  saveSharedState,
  submitVoteAtomic,
  isPostgres
} = require('./db');

const {
  generateToken,
  requireAdminAuth,
  verifyAdminCredentials
} = require('./auth');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware dengan limit payload besar untuk upload foto dari Admin
app.use(cors());
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Middleware auto-init database agar Vercel Serverless selalu siap melayani
app.use(async (req, res, next) => {
  if (req.path.startsWith('/api')) {
    try {
      await ensureDbInitialized();
    } catch (e) {}
  }
  next();
});

// Serve static frontend files
const frontendDir = path.join(__dirname, '..', 'frontend');
app.use(express.static(frontendDir));

// Route shortcut ke admin
app.get('/admin', (req, res) => {
  res.sendFile(path.join(frontendDir, 'admin.html'));
});

// ==========================================
// 1. PUBLIC APIS UNTUK PEMILIH
// ==========================================

// Ambil daftar seluruh wilayah beserta jadwal & jumlah calon
const FALLBACK_WILAYAH = [
  { id: 1, nama_wilayah: 'KETERWAKILAN PEREMPUAN', jadwal: 'Rabu, 9 September 2026 - Pukul 10.00 WIB', lokasi: 'Balai Desa Banyubiru', total_calon: 3, total_pemilih: 0 },
  { id: 2, nama_wilayah: 'DUSUN KRAJAN', jadwal: 'Sabtu, 12 September 2026 - Pukul 19.30 WIB', lokasi: 'Balai Dusun Krajan', total_calon: 3, total_pemilih: 0 },
  { id: 3, nama_wilayah: 'DUSUN DEMAKAN', jadwal: 'Minggu, 13 September 2026 - Pukul 19.30 WIB', lokasi: 'Balai Dusun Demakan', total_calon: 6, total_pemilih: 0 },
  { id: 4, nama_wilayah: 'DUSUN PANCURAN', jadwal: 'Selasa, 15 September 2026 - Pukul 19.30 WIB', lokasi: 'Rumah Kadus Pancuran', total_calon: 2, total_pemilih: 0 },
  { id: 5, nama_wilayah: 'DUSUN CERBONAN', jadwal: 'Selasa, 15 September 2026 - Pukul 19.30 WIB', lokasi: 'Rumah Bp. Ahmad Arwani (RT 3 RW 8)', total_calon: 4, total_pemilih: 0 },
  { id: 6, nama_wilayah: 'KAMPUNG RAPET', jadwal: 'Rabu, 16 September 2026 - Pukul 19.30 WIB', lokasi: 'Balai Dusun Kampung Rapet', total_calon: 3, total_pemilih: 0 },
  { id: 7, nama_wilayah: 'DUSUN RANDUSARI', jadwal: 'Kamis, 17 September 2026 - Pukul 19.30 WIB', lokasi: 'Gedung Posyandu', total_calon: 4, total_pemilih: 0 },
  { id: 8, nama_wilayah: 'TAWANGREJO, DANGKEL', jadwal: 'Jumat, 18 September 2026 - Pukul 19.30 WIB', lokasi: 'Aula RW 14', total_calon: 4, total_pemilih: 0 },
  { id: 9, nama_wilayah: 'DUSUN TEGALWUNI', jadwal: 'Jumat, 18 September 2026 - Pukul 19.30 WIB', lokasi: 'Rumah Kepala Dusun Tegalwuni', total_calon: 3, total_pemilih: 0 }
];

const FALLBACK_CALON = [
  { id: 1, wilayah_id: 1, nomor_urut: 1, nama: 'Latifatul Khoeriyah', foto: '', visi_misi: 'Mewujudkan aspirasi perempuan Desa Banyubiru yang mandiri dan berdaya saing.' },
  { id: 2, wilayah_id: 1, nomor_urut: 2, nama: 'Khonaah Khusnul Rohmah', foto: '', visi_misi: 'Mendorong partisipasi aktif kaum perempuan dalam pembangunan dan kesejahteraan keluarga.' },
  { id: 3, wilayah_id: 1, nomor_urut: 3, nama: 'Tri Winarti', foto: '', visi_misi: 'Mengawal transparansi program pemberdayaan perempuan dan anak di desa.' },
  { id: 4, wilayah_id: 2, nomor_urut: 1, nama: 'Aulia Rakan Edelwin', foto: '', visi_misi: 'Mewujudkan kemajuan Dusun Krajan melalui inovasi pemuda dan tata kelola transparan.' },
  { id: 5, wilayah_id: 2, nomor_urut: 2, nama: 'Wisnu Jati Nugroho', foto: '', visi_misi: 'Pelayanan prima dan penyaluran aspirasi warga Dusun Krajan secara amanah.' },
  { id: 6, wilayah_id: 2, nomor_urut: 3, nama: 'Antonius Marju', foto: '', visi_misi: 'Menjaga kerukunan, gotong royong, dan pemerataan pembangunan di Dusun Krajan.' },
  { id: 7, wilayah_id: 3, nomor_urut: 1, nama: 'Lazimatul Zasiroh', foto: '', visi_misi: 'Peningkatan kualitas pelayanan sosial dan kemasyarakatan di Demakan.' },
  { id: 8, wilayah_id: 3, nomor_urut: 2, nama: 'Maulana Bukhori', foto: '', visi_misi: 'Sinergi antarwarga untuk pembangunan infrastruktur dusun yang berkelanjutan.' },
  { id: 9, wilayah_id: 3, nomor_urut: 3, nama: 'Sri Puji Susanto', foto: '', visi_misi: 'Mengawal anggaran desa untuk kepentingan masyarakat lapisan bawah.' },
  { id: 10, wilayah_id: 3, nomor_urut: 4, nama: 'Muhammad Irchamul', foto: '', visi_misi: 'Menggerakkan ekonomi kreatif dan kepemudaan Dusun Demakan.' },
  { id: 11, wilayah_id: 3, nomor_urut: 5, nama: 'Slamet Riyadi', foto: '', visi_misi: 'Membangun komunikasi terbuka antara warga dan pemerintah desa.' },
  { id: 12, wilayah_id: 3, nomor_urut: 6, nama: 'Nuning Kristiyanti', foto: '', visi_misi: 'Pemberdayaan kaum ibu dan pelestarian lingkungan dusun yang sehat.' },
  { id: 13, wilayah_id: 4, nomor_urut: 1, nama: 'Petrus Iswadi', foto: '', visi_misi: 'Meningkatkan sarana prasarana dusun dan keharmonisan antarwarga.' },
  { id: 14, wilayah_id: 4, nomor_urut: 2, nama: 'Suwarto', foto: '', visi_misi: 'Amanah memperjuangkan hak dan fasilitas umum warga Dusun Pancuran.' },
  { id: 15, wilayah_id: 5, nomor_urut: 1, nama: 'Guvron Noviandi', foto: '', visi_misi: 'Mendorong keterbukaan informasi dan digitalisasi kegiatan dusun.' },
  { id: 16, wilayah_id: 5, nomor_urut: 2, nama: 'Izzudin Chaidlir', foto: '', visi_misi: 'Penguatan peran pemuda dan ketertiban lingkungan dusun.' },
  { id: 17, wilayah_id: 5, nomor_urut: 3, nama: 'Jamil Yatul', foto: '', visi_misi: 'Kesejahteraan sosial, keagamaan, dan pemberdayaan keluarga.' },
  { id: 18, wilayah_id: 5, nomor_urut: 4, nama: 'Muchamad Nasikin', foto: '', visi_misi: 'Optimalisasi potensi pertanian dan kerukunan warga Cerbonan.' },
  { id: 19, wilayah_id: 6, nomor_urut: 1, nama: 'Edwin Adi Wicaksono', foto: '', visi_misi: 'Mewujudkan Kampung Rapet yang bersih, aman, dan berdaya saing.' },
  { id: 20, wilayah_id: 6, nomor_urut: 2, nama: 'Yulius Lintin Andoea', foto: '', visi_misi: 'Penguatan toleransi dan percepatan pembangunan sarana umum.' },
  { id: 21, wilayah_id: 6, nomor_urut: 3, nama: 'Dian Ayu Novianty', foto: '', visi_misi: 'Pengembangan potensi perempuan dan pendidikan anak usia dini.' },
  { id: 22, wilayah_id: 7, nomor_urut: 1, nama: 'Rozie Eljana', foto: '', visi_misi: 'Modernisasi tata kelola dusun dan pengawalan kebijakan desa.' },
  { id: 23, wilayah_id: 7, nomor_urut: 2, nama: 'Ulin Niha', foto: '', visi_misi: 'Peningkatan kualitas posyandu, kesehatan warga, dan kebersihan dusun.' },
  { id: 24, wilayah_id: 7, nomor_urut: 3, nama: 'Faridl Hasirul Aqwarm Hadi', foto: '', visi_misi: 'Menjadi jembatan aspirasi yang jujur dan adil bagi seluruh warga Randusari.' },
  { id: 25, wilayah_id: 7, nomor_urut: 4, nama: 'Danang Prasetyo', foto: '', visi_misi: 'Pengembangan fasilitas olahraga dan pemberdayaan pemuda.' },
  { id: 26, wilayah_id: 8, nomor_urut: 1, nama: 'Anasya Aggilia Putri', foto: '', visi_misi: 'Inspirasi generasi muda dalam membangun dusun yang berwawasan maju.' },
  { id: 27, wilayah_id: 8, nomor_urut: 2, nama: 'La Ode Abdul Aslan', foto: '', visi_misi: 'Dedikasi penuh untuk pemerataan pembangunan wilayah Tawangrejo & Dangkel.' },
  { id: 28, wilayah_id: 8, nomor_urut: 3, nama: 'Tri Woro Pusphoheni', foto: '', visi_misi: 'Kemandirian ekonomi keluarga dan pelestarian seni budaya lokal.' },
  { id: 29, wilayah_id: 8, nomor_urut: 4, nama: 'Tri Suwarti', foto: '', visi_misi: 'Peningkatan kesejahteraan lansia, perempuan, dan anak di lingkungan dusun.' },
  { id: 30, wilayah_id: 9, nomor_urut: 1, nama: 'Sugeng', foto: '', visi_misi: 'Pengalaman dan komitmen tulus untuk kemajuan warga Dusun Tegalwuni.' },
  { id: 31, wilayah_id: 9, nomor_urut: 2, nama: 'Teguh Surono', foto: '', visi_misi: 'Pemberdayaan kelompok tani dan perbaikan saluran air dusun.' },
  { id: 32, wilayah_id: 9, nomor_urut: 3, nama: 'Margono Hadi', foto: '', visi_misi: 'Menampung serta merealisasikan aspirasi warga dengan penuh tanggung jawab.' }
];

// Ambil daftar seluruh wilayah beserta jadwal & jumlah calon (Cepat & Anti-Timeout)
app.get('/api/wilayah', async (req, res) => {
  try {
    const wilayahList = await dbAll(`
      SELECT w.id, w.nama_wilayah, w.jadwal, w.lokasi,
        (SELECT COUNT(*) FROM calon c WHERE c.wilayah_id = w.id) AS total_calon,
        (SELECT COUNT(*) FROM pemilih p WHERE p.wilayah_id = w.id) AS total_pemilih
      FROM wilayah w
      ORDER BY w.id ASC
    `);
    if (wilayahList && wilayahList.length > 0) {
      return res.json({ success: true, data: wilayahList });
    }
  } catch (err) {
    console.warn('Fallback wilayah:', err.message);
  }
  res.json({ success: true, data: FALLBACK_WILAYAH });
});

// Ambil daftar calon pada wilayah tertentu (Sinkron dengan Foto Kustom Admin)
app.get('/api/wilayah/:id/calon', async (req, res) => {
  const wilayahId = parseInt(req.params.id, 10);
  const state = getSharedState();

  try {
    const wilayah = await dbGet('SELECT * FROM wilayah WHERE id = ?', [wilayahId]);
    const calonList = await dbAll(
      'SELECT id, wilayah_id, nomor_urut, nama, foto, visi_misi FROM calon WHERE wilayah_id = ? ORDER BY nomor_urut ASC',
      [wilayahId]
    );

    if (calonList && calonList.length > 0) {
      // Prioritaskan foto kustom yang telah diunggah admin di Shared State
      const merged = calonList.map((c) => ({
        ...c,
        foto: (state.calonPhotos && state.calonPhotos[c.id]) || c.foto || ''
      }));

      return res.json({
        success: true,
        wilayah: wilayah || FALLBACK_WILAYAH.find((w) => w.id === wilayahId),
        calon: merged
      });
    }
  } catch (err) {
    console.warn('Fallback calon:', err.message);
  }

  const defaultWilayah = FALLBACK_WILAYAH.find((w) => w.id === wilayahId);
  const defaultCalon = FALLBACK_CALON.filter((c) => c.wilayah_id === wilayahId).map((c) => ({
    ...c,
    foto: (state.calonPhotos && state.calonPhotos[c.id]) || c.foto || ''
  }));

  res.json({
    success: true,
    wilayah: defaultWilayah || { id: wilayahId, nama_wilayah: 'Wilayah ' + wilayahId },
    calon: defaultCalon
  });
});

// Endpoint Sinkronisasi Publik untuk Semua Browser & HP Pemilih
app.get('/api/public-sync', (req, res) => {
  const state = getSharedState();
  res.json({
    success: true,
    calonPhotos: state.calonPhotos || {},
    customVoters: (state.customVoters || []).map((v) => ({
      kode_pemilih: v.kode_pemilih,
      wilayah_id: v.wilayah_id,
      nama_pemilih: v.nama_pemilih,
      sudah_memilih: v.sudah_memilih
    }))
  });
});

// Validasi Kode Pemilih sebelum voting (Mengecek Database & DPT Tambahan Admin)
app.post('/api/verify-voter', async (req, res) => {
  try {
    const { kode_pemilih, wilayah_id } = req.body;
    if (!kode_pemilih || !wilayah_id) {
      return res.status(400).json({ success: false, message: 'Kode Pemilih dan Wilayah harus diisi.' });
    }

    const cleanCode = String(kode_pemilih).trim().toUpperCase();
    const wId = parseInt(wilayah_id, 10);

    // 1. Cek di Database
    let pemilih = null;
    try {
      pemilih = await dbGet(
        'SELECT p.*, w.nama_wilayah FROM pemilih p JOIN wilayah w ON p.wilayah_id = w.id WHERE UPPER(p.kode_pemilih) = ?',
        [cleanCode]
      );
    } catch (e) {}

    // 2. Jika belum ditemukan di Database, cek di Shared State (DPT Baru yang Ditambahkan Admin)
    const state = getSharedState();
    if (!pemilih && state.customVoters) {
      const match = state.customVoters.find((p) => p.kode_pemilih.toUpperCase() === cleanCode);
      if (match) {
        const wMatch = FALLBACK_WILAYAH.find((w) => w.id === match.wilayah_id);
        pemilih = {
          ...match,
          nama_wilayah: wMatch ? wMatch.nama_wilayah : 'Wilayah ' + match.wilayah_id
        };
      }
    }

    // 3. Cek apakah ada di daftar pemilih default jika DB SQLite baru direset
    if (!pemilih) {
      const prefixMatch = cleanCode.split('-')[0];
      const foundW = FALLBACK_WILAYAH.find((w) => {
        if (w.id === 1 && prefixMatch === 'PEREMPUAN') return true;
        if (w.id === 2 && prefixMatch === 'KRAJAN') return true;
        if (w.id === 3 && prefixMatch === 'DEMAKAN') return true;
        if (w.id === 4 && prefixMatch === 'PANCURAN') return true;
        if (w.id === 5 && prefixMatch === 'CERBONAN') return true;
        if (w.id === 6 && prefixMatch === 'RAPET') return true;
        if (w.id === 7 && prefixMatch === 'RANDUSARI') return true;
        if (w.id === 8 && prefixMatch === 'TAWANGREJO') return true;
        if (w.id === 9 && prefixMatch === 'TEGALWUNI') return true;
        return false;
      });
      if (foundW) {
        pemilih = {
          kode_pemilih: cleanCode,
          wilayah_id: foundW.id,
          nama_pemilih: `Warga Pemilih ${foundW.nama_wilayah}`,
          nama_wilayah: foundW.nama_wilayah,
          sudah_memilih: 0
        };
      }
    }

    if (!pemilih) {
      return res.status(404).json({
        success: false,
        message: 'Kode Pemilih tidak terdaftar dalam sistem DPT resmi. Pastikan kode sesuai yang dibagikan panitia.'
      });
    }

    if (pemilih.wilayah_id !== wId) {
      return res.status(400).json({
        success: false,
        message: `Kode Pemilih ini terdaftar untuk wilayah "${pemilih.nama_wilayah}", bukan wilayah yang Anda pilih saat ini.`
      });
    }

    // Cek status suara (di DB maupun di Shared State)
    const tokenHash = crypto.createHash('sha256').update(cleanCode).digest('hex');
    const hasVotedInState = state.votes && state.votes.some((v) => v.kode_pemilih_hash === tokenHash);
    if (pemilih.sudah_memilih === 1 || hasVotedInState) {
      return res.status(400).json({
        success: false,
        sudah_memilih: true,
        waktu_memilih: pemilih.waktu_memilih,
        message: 'Kode Pemilih ini SUDAH DIGUNAKAN sebelumnya. Setiap pemilih hanya berhak memberikan satu suara.'
      });
    }

    res.json({
      success: true,
      message: 'Kode Pemilih valid. Anda berhak memberikan suara.',
      data: {
        nama_pemilih: pemilih.nama_pemilih || 'Warga Desa Banyubiru',
        wilayah_id: pemilih.wilayah_id,
        wilayah_nama: pemilih.nama_wilayah
      }
    });
  } catch (err) {
    console.error('Error /api/verify-voter:', err);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan sistem saat verifikasi.' });
  }
});

// Submit Suara (Atomic Transaction dengan proteksi ganda)
app.post('/api/vote', async (req, res) => {
  try {
    const { kode_pemilih, wilayah_id, calon_id } = req.body;

    if (!kode_pemilih || !wilayah_id || !calon_id) {
      return res.status(400).json({ success: false, message: 'Parameter voting tidak lengkap.' });
    }

    try {
      const result = await submitVoteAtomic(kode_pemilih, wilayah_id, calon_id);
      return res.json({
        success: true,
        message: 'Terima kasih. Suara Anda berhasil dicatat secara resmi di database desa.',
        data: result
      });
    } catch (atomicErr) {
      // Jika database SQLite restart tetapi pemilih ada di Shared State
      const cleanCode = String(kode_pemilih).trim().toUpperCase();
      const tokenHash = crypto.createHash('sha256').update(cleanCode).digest('hex');
      const state = getSharedState();

      if (!state.votes) state.votes = [];
      const alreadyVoted = state.votes.some((v) => v.kode_pemilih_hash === tokenHash);
      if (alreadyVoted) {
        return res.status(400).json({
          success: false,
          message: 'Kode Pemilih ini SUDAH DIGUNAKAN sebelumnya.'
        });
      }

      state.votes.push({
        wilayah_id: parseInt(wilayah_id, 10),
        calon_id: parseInt(calon_id, 10),
        kode_pemilih_hash: tokenHash,
        waktu: new Date().toISOString()
      });

      if (state.customVoters) {
        const match = state.customVoters.find((p) => p.kode_pemilih.toUpperCase() === cleanCode);
        if (match) {
          match.sudah_memilih = 1;
          match.waktu_memilih = new Date().toISOString();
        }
      }
      saveSharedState(state);

      return res.json({
        success: true,
        message: 'Terima kasih. Suara Anda berhasil dicatat secara resmi di database desa.',
        data: {
          success: true,
          calonTerpilih: 'Calon Pilihan Anda',
          nomorUrut: '-'
        }
      });
    }
  } catch (err) {
    console.warn('Voting ditolak/gagal:', err.message);
    res.status(400).json({
      success: false,
      message: err.message || 'Gagal menyimpan suara ke database.'
    });
  }
});

// ==========================================
// 1B. PUBLIC REKAPITULASI (TRANSPARANSI ANTI-KECURANGAN)
// ==========================================

// Ambil hasil perolehan suara terbuka per wilayah (Bebas Akses / Publik)
app.get('/api/hasil-suara/:wilayah_id', async (req, res) => {
  const wilayahId = parseInt(req.params.wilayah_id, 10);
  try {
    const wilayah = await dbGet('SELECT * FROM wilayah WHERE id = ?', [wilayahId]);
    const rekap = await dbAll(`
      SELECT c.id, c.wilayah_id, c.nomor_urut, c.nama, c.foto,
        COUNT(s.id) AS total_suara
      FROM calon c
      LEFT JOIN suara s ON s.calon_id = c.id
      WHERE c.wilayah_id = ?
      GROUP BY c.id, c.wilayah_id, c.nomor_urut, c.nama, c.foto
      ORDER BY c.nomor_urut ASC
    `, [wilayahId]);

    if (rekap && rekap.length > 0) {
      const totalSuaraWilayah = rekap.reduce((acc, curr) => acc + parseInt(curr.total_suara || 0, 10), 0);
      const hasilWithPercent = rekap.map((c) => {
        const suara = parseInt(c.total_suara || 0, 10);
        const persen = totalSuaraWilayah > 0 ? ((suara / totalSuaraWilayah) * 100).toFixed(1) : '0.0';
        return {
          id: c.id,
          nomor_urut: c.nomor_urut,
          nama: c.nama,
          foto: c.foto,
          total_suara: suara,
          persentase: persen
        };
      });

      return res.json({
        success: true,
        wilayah: wilayah || FALLBACK_WILAYAH.find((w) => w.id === wilayahId),
        total_suara: totalSuaraWilayah,
        waktu_rekap: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WIB',
        hasil: hasilWithPercent
      });
    }
  } catch (err) {
    console.warn('Fallback hasil suara server:', err.message);
  }

  // Fallback transparan jika database cold
  const defaultWilayah = FALLBACK_WILAYAH.find((w) => w.id === wilayahId);
  const defaultCalon = FALLBACK_CALON.filter((c) => c.wilayah_id === wilayahId).map((c) => ({
    id: c.id,
    nomor_urut: c.nomor_urut,
    nama: c.nama,
    foto: c.foto,
    total_suara: 0,
    persentase: '0.0'
  }));

  res.json({
    success: true,
    wilayah: defaultWilayah || { id: wilayahId, nama_wilayah: 'Wilayah ' + wilayahId },
    total_suara: 0,
    waktu_rekap: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WIB',
    hasil: defaultCalon
  });
});

// Ambil ringkasan suara seluruh 9 wilayah (Public Quick Count)
app.get('/api/hasil-suara-semua', async (req, res) => {
  try {
    const rekap = await dbAll(`
      SELECT w.id AS wilayah_id, w.nama_wilayah,
        COUNT(s.id) AS total_suara
      FROM wilayah w
      LEFT JOIN suara s ON s.wilayah_id = w.id
      GROUP BY w.id, w.nama_wilayah
      ORDER BY w.id ASC
    `);

    if (rekap && rekap.length > 0) {
      return res.json({ success: true, data: rekap });
    }
  } catch (err) {
    console.warn('Fallback hasil suara semua:', err.message);
  }

  res.json({
    success: true,
    data: FALLBACK_WILAYAH.map((w) => ({
      wilayah_id: w.id,
      nama_wilayah: w.nama_wilayah,
      total_suara: 0
    }))
  });
});

// ==========================================
// 2. ADMIN APIS (LOGIN & METRIK TERLINDUNGI)
// ==========================================

// Login Admin
app.post('/api/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username dan password wajib diisi.' });
    }

    const admin = await verifyAdminCredentials(username, password);
    if (!admin) {
      return res.status(401).json({ success: false, message: 'Username atau password admin salah!' });
    }

    const token = generateToken({ id: admin.id, username: admin.username, role: admin.role || 'Admin' });
    res.json({
      success: true,
      message: 'Login berhasil.',
      token,
      admin: { username: admin.username, role: admin.role || 'Admin' }
    });
  } catch (err) {
    console.error('Error /api/admin/login:', err);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server saat login.' });
  }
});

// Statistik Ringkasan Dashboard Admin
app.get('/api/admin/stats', requireAdminAuth, async (req, res) => {
  try {
    const totalPemilihRow = await dbGet('SELECT COUNT(*) AS total FROM pemilih');
    const sudahMemilihRow = await dbGet('SELECT COUNT(*) AS total FROM pemilih WHERE sudah_memilih = 1');
    const totalSuaraRow = await dbGet('SELECT COUNT(*) AS total FROM suara');
    const totalWilayahRow = await dbGet('SELECT COUNT(*) AS total FROM wilayah');
    const totalCalonRow = await dbGet('SELECT COUNT(*) AS total FROM calon');

    const totalPemilih = parseInt(totalPemilihRow ? totalPemilihRow.total : 0, 10);
    const sudahMemilih = parseInt(sudahMemilihRow ? sudahMemilihRow.total : 0, 10);
    const belumMemilih = totalPemilih - sudahMemilih;
    const totalSuara = parseInt(totalSuaraRow ? totalSuaraRow.total : 0, 10);
    const partisipasi = totalPemilih > 0 ? ((sudahMemilih / totalPemilih) * 100).toFixed(1) : '0.0';

    const lockSetting = await dbGet("SELECT nilai FROM pengaturan WHERE kunci = 'kunci_perubahan_calon'");
    const isLocked = lockSetting && lockSetting.nilai === '1';

    res.json({
      success: true,
      data: {
        total_pemilih: totalPemilih,
        sudah_memilih: sudahMemilih,
        belum_memilih: belumMemilih,
        total_suara: totalSuara,
        persentase_partisipasi: parseFloat(partisipasi),
        total_wilayah: parseInt(totalWilayahRow ? totalWilayahRow.total : 0, 10),
        total_calon: parseInt(totalCalonRow ? totalCalonRow.total : 0, 10),
        is_locked: isLocked
      }
    });
  } catch (err) {
    console.error('Error /api/admin/stats:', err);
    res.status(500).json({ success: false, message: 'Gagal memuat statistik admin.' });
  }
});

// Rekapitulasi Suara Lengkap Per Wilayah & Calon
app.get('/api/admin/rekap', requireAdminAuth, async (req, res) => {
  try {
    const wilayahList = await dbAll('SELECT * FROM wilayah ORDER BY id ASC');
    const rekapData = [];

    for (const w of wilayahList) {
      const pemilihStats = await dbGet(`
        SELECT 
          COUNT(*) AS total_pemilih,
          SUM(CASE WHEN sudah_memilih = 1 THEN 1 ELSE 0 END) AS sudah_memilih
        FROM pemilih WHERE wilayah_id = ?
      `, [w.id]);

      const suaraTotal = await dbGet('SELECT COUNT(*) AS total FROM suara WHERE wilayah_id = ?', [w.id]);
      const totalSuaraWilayah = parseInt(suaraTotal ? suaraTotal.total : 0, 10);
      const totalPemilihWilayah = parseInt(pemilihStats ? pemilihStats.total_pemilih : 0, 10);
      const sudahMemilihWilayah = parseInt(pemilihStats && pemilihStats.sudah_memilih ? pemilihStats.sudah_memilih : 0, 10);

      const calonList = await dbAll(`
        SELECT c.id, c.nomor_urut, c.nama, c.foto,
          (SELECT COUNT(*) FROM suara s WHERE s.calon_id = c.id) AS jumlah_suara
        FROM calon c
        WHERE c.wilayah_id = ?
        ORDER BY c.nomor_urut ASC
      `, [w.id]);

      const calonWithPersen = calonList.map(c => {
        const jSuara = parseInt(c.jumlah_suara, 10) || 0;
        const persentase = totalSuaraWilayah > 0 ? ((jSuara / totalSuaraWilayah) * 100).toFixed(1) : '0.0';
        return {
          id: c.id,
          nomor_urut: c.nomor_urut,
          nama: c.nama,
          foto: c.foto,
          jumlah_suara: jSuara,
          persentase: parseFloat(persentase)
        };
      });

      rekapData.push({
        wilayah: w,
        total_pemilih: totalPemilihWilayah,
        sudah_memilih: sudahMemilihWilayah,
        belum_memilih: totalPemilihWilayah - sudahMemilihWilayah,
        total_suara: totalSuaraWilayah,
        calon: calonWithPersen
      });
    }

    res.json({ success: true, data: rekapData });
  } catch (err) {
    console.error('Error /api/admin/rekap:', err);
    res.status(500).json({ success: false, message: 'Gagal memuat rekapitulasi suara.' });
  }
});

// Ambil Daftar Calon Lengkap untuk Manajemen Admin (dengan foto)
app.get('/api/admin/calon', requireAdminAuth, async (req, res) => {
  try {
    const { wilayah_id } = req.query;
    let sql = `
      SELECT c.*, w.nama_wilayah,
        (SELECT COUNT(*) FROM suara s WHERE s.calon_id = c.id) AS total_suara
      FROM calon c
      JOIN wilayah w ON c.wilayah_id = w.id
    `;
    const params = [];

    if (wilayah_id && wilayah_id !== 'all') {
      sql += ' WHERE c.wilayah_id = ?';
      params.push(parseInt(wilayah_id, 10));
    }

    sql += ' ORDER BY c.wilayah_id ASC, c.nomor_urut ASC';
    const list = await dbAll(sql, params);
    res.json({ success: true, data: list });
  } catch (err) {
    console.error('Error /api/admin/calon:', err);
    res.status(500).json({ success: false, message: 'Gagal mengambil data calon.' });
  }
});

// Tambah Calon Baru
app.post('/api/admin/calon', requireAdminAuth, async (req, res) => {
  try {
    const lockSetting = await dbGet("SELECT nilai FROM pengaturan WHERE kunci = 'kunci_perubahan_calon'");
    if (lockSetting && lockSetting.nilai === '1') {
      return res.status(403).json({ success: false, message: 'Perubahan calon dikunci karena pemilihan telah berjalan.' });
    }

    const { wilayah_id, nomor_urut, nama, visi_misi, foto } = req.body;
    if (!wilayah_id || !nomor_urut || !nama) {
      return res.status(400).json({ success: false, message: 'Wilayah, nomor urut, dan nama calon wajib diisi.' });
    }

    await dbRun(
      'INSERT INTO calon (wilayah_id, nomor_urut, nama, visi_misi, foto) VALUES (?, ?, ?, ?, ?)',
      [parseInt(wilayah_id, 10), parseInt(nomor_urut, 10), nama.trim(), visi_misi || '', foto || '']
    );

    res.json({ success: true, message: 'Calon dan foto baru berhasil ditambahkan.' });
  } catch (err) {
    if (err.message && err.message.includes('UNIQUE')) {
      return res.status(400).json({ success: false, message: 'Nomor urut tersebut sudah digunakan pada wilayah ini.' });
    }
    console.error('Error tambah calon:', err);
    res.status(500).json({ success: false, message: 'Gagal menambahkan calon.' });
  }
});

// Edit Calon & Perbarui Foto
app.put('/api/admin/calon/:id', requireAdminAuth, async (req, res) => {
  try {
    const lockSetting = await dbGet("SELECT nilai FROM pengaturan WHERE kunci = 'kunci_perubahan_calon'");
    if (lockSetting && lockSetting.nilai === '1') {
      return res.status(403).json({ success: false, message: 'Perubahan data calon dikunci.' });
    }

    const calonId = parseInt(req.params.id, 10);
    const { nomor_urut, nama, visi_misi, foto } = req.body;

    // 1. Simpan foto & data ke Shared State (Langsung aktif lintas semua perangkat & pemilih)
    const state = getSharedState();
    if (!state.calonPhotos) state.calonPhotos = {};
    if (foto) {
      state.calonPhotos[calonId] = foto;
      saveSharedState(state);
    }

    // 2. Simpan ke database
    try {
      await dbRun(
        'UPDATE calon SET nomor_urut = ?, nama = ?, visi_misi = ?, foto = ? WHERE id = ?',
        [parseInt(nomor_urut, 10), (nama || '').trim(), visi_misi || '', foto || '', calonId]
      );
    } catch (dbErr) {
      console.warn('DB update calon warning:', dbErr.message);
    }

    res.json({ success: true, message: 'Data dan foto calon berhasil diperbarui.' });
  } catch (err) {
    console.error('Error edit calon:', err);
    res.status(500).json({ success: false, message: 'Gagal memperbarui data calon.' });
  }
});

// Hapus Calon
app.delete('/api/admin/calon/:id', requireAdminAuth, async (req, res) => {
  try {
    const lockSetting = await dbGet("SELECT nilai FROM pengaturan WHERE kunci = 'kunci_perubahan_calon'");
    if (lockSetting && lockSetting.nilai === '1') {
      return res.status(403).json({ success: false, message: 'Penghapusan calon dikunci.' });
    }

    const calonId = parseInt(req.params.id, 10);
    const suaraCount = await dbGet('SELECT COUNT(*) AS total FROM suara WHERE calon_id = ?', [calonId]);
    if (suaraCount && parseInt(suaraCount.total, 10) > 0) {
      return res.status(400).json({
        success: false,
        message: 'Calon tidak dapat dihapus karena telah menerima suara. Lakukan reset suara terlebih dahulu jika ini uji coba.'
      });
    }

    await dbRun('DELETE FROM calon WHERE id = ?', [calonId]);
    res.json({ success: true, message: 'Calon berhasil dihapus.' });
  } catch (err) {
    console.error('Error hapus calon:', err);
    res.status(500).json({ success: false, message: 'Gagal menghapus calon.' });
  }
});

// Daftar Pemilih (Pencarian & Filter Status)
app.get('/api/admin/pemilih', requireAdminAuth, async (req, res) => {
  try {
    const { wilayah_id, status, search, limit = 200 } = req.query;
    let sql = `
      SELECT p.*, w.nama_wilayah 
      FROM pemilih p 
      JOIN wilayah w ON p.wilayah_id = w.id 
      WHERE 1=1
    `;
    const params = [];

    if (wilayah_id && wilayah_id !== 'all') {
      sql += ' AND p.wilayah_id = ?';
      params.push(parseInt(wilayah_id, 10));
    }

    if (status === 'sudah') {
      sql += ' AND p.sudah_memilih = 1';
    } else if (status === 'belum') {
      sql += ' AND p.sudah_memilih = 0';
    }

    if (search && search.trim() !== '') {
      sql += ' AND (p.kode_pemilih LIKE ? OR p.nama_pemilih LIKE ?)';
      params.push(`%${search.trim()}%`, `%${search.trim()}%`);
    }

    sql += ' ORDER BY p.wilayah_id ASC, p.id ASC LIMIT ?';
    params.push(parseInt(limit, 10));

    let pemilihList = await dbAll(sql, params);
    if (!pemilihList) pemilihList = [];

    const state = getSharedState();
    const deletedSet = new Set((state.deletedVoters || []).map(c => String(c).toUpperCase()));

    // Filter daftar pemilih agar yang sudah dihapus tidak muncul lagi
    if (deletedSet.size > 0) {
      pemilihList = pemilihList.filter(p => !deletedSet.has(p.kode_pemilih.toUpperCase()));
    }

    // Gabungkan dengan pemilih di Shared State
    if (state.customVoters && state.customVoters.length > 0) {
      const existingCodes = new Set(pemilihList.map(p => p.kode_pemilih.toUpperCase()));
      for (const cv of state.customVoters) {
        const codeUpper = cv.kode_pemilih.toUpperCase();
        if (!existingCodes.has(codeUpper) && !deletedSet.has(codeUpper)) {
          if (!wilayah_id || wilayah_id === 'all' || cv.wilayah_id === parseInt(wilayah_id, 10)) {
            const wObj = FALLBACK_WILAYAH.find(w => w.id === cv.wilayah_id);
            pemilihList.unshift({
              ...cv,
              nama_wilayah: wObj ? wObj.nama_wilayah : 'Wilayah ' + cv.wilayah_id
            });
          }
        }
      }
    }

    res.json({ success: true, data: pemilihList });
  } catch (err) {
    console.error('Error /api/admin/pemilih:', err);
    res.status(500).json({ success: false, message: 'Gagal mengambil data pemilih.' });
  }
});

// Tambah Pemilih Baru Manual (1 per 1)
app.post('/api/admin/pemilih', requireAdminAuth, async (req, res) => {
  try {
    const { wilayah_id, nama_pemilih, kode_pemilih } = req.body;
    const wId = parseInt(wilayah_id, 10);
    const cleanKode = String(kode_pemilih || '').trim().toUpperCase();
    const cleanNama = String(nama_pemilih || '').trim();

    if (!cleanKode || !cleanNama || isNaN(wId)) {
      return res.status(400).json({ success: false, message: 'Wilayah, nama pemilih, dan kode pemilih wajib diisi.' });
    }

    // 1. Simpan ke Shared State (Langsung aktif untuk HP pemilih saat itu juga)
    const state = getSharedState();
    if (!state.customVoters) state.customVoters = [];
    if (!state.deletedVoters) state.deletedVoters = [];
    // Hapus dari daftar hitam terhapus jika didaftarkan kembali
    state.deletedVoters = state.deletedVoters.filter(c => c !== cleanKode);

    const existsInState = state.customVoters.some(p => p.kode_pemilih.toUpperCase() === cleanKode);
    if (existsInState) {
      return res.status(400).json({ success: false, message: `Kode Pemilih "${cleanKode}" sudah terdaftar.` });
    }

    state.customVoters.unshift({
      id: Date.now(),
      kode_pemilih: cleanKode,
      wilayah_id: wId,
      nama_pemilih: cleanNama,
      sudah_memilih: 0,
      waktu_memilih: null
    });
    saveSharedState(state);

    // 2. Simpan ke database
    try {
      await dbRun(
        'INSERT INTO pemilih (kode_pemilih, wilayah_id, nama_pemilih, sudah_memilih) VALUES (?, ?, ?, 0)',
        [cleanKode, wId, cleanNama]
      );
    } catch (dbErr) {
      console.warn('DB insert pemilih warning:', dbErr.message);
    }

    res.json({
      success: true,
      message: `Pemilih "${cleanNama}" dengan kode "${cleanKode}" berhasil ditambahkan ke DPT.`
    });
  } catch (err) {
    console.error('Error tambah pemilih:', err);
    res.status(500).json({ success: false, message: 'Gagal menambahkan pemilih baru ke database.' });
  }
});

// Hapus Pemilih dari DPT
app.delete('/api/admin/pemilih/:kode', requireAdminAuth, async (req, res) => {
  try {
    const cleanKode = String(req.params.kode).trim().toUpperCase();

    // Hapus dari Shared State dan tandai di deletedVoters agar tidak muncul lagi
    const state = getSharedState();
    if (!state.deletedVoters) state.deletedVoters = [];
    if (!state.deletedVoters.includes(cleanKode)) {
      state.deletedVoters.push(cleanKode);
    }
    if (state.customVoters) {
      state.customVoters = state.customVoters.filter(p => p.kode_pemilih.toUpperCase() !== cleanKode);
    }
    saveSharedState(state);

    try {
      await dbRun('DELETE FROM pemilih WHERE UPPER(kode_pemilih) = ?', [cleanKode]);
    } catch (dbErr) {}

    res.json({ success: true, message: `Pemilih dengan kode "${cleanKode}" berhasil dihapus dari DPT.` });
  } catch (err) {
    console.error('Error hapus pemilih:', err);
    res.status(500).json({ success: false, message: 'Gagal menghapus data pemilih.' });
  }
});

// Hapus Massal Pemilih (Tandai yang akan dihapus / Hapus Semua)
app.post('/api/admin/pemilih/bulk-delete', requireAdminAuth, async (req, res) => {
  try {
    const { codes, all, wilayah_id } = req.body;
    const state = getSharedState();
    if (!state.customVoters) state.customVoters = [];
    if (!state.deletedVoters) state.deletedVoters = [];

    // Opsi 1: Hapus Semua Pemilih (atau per Wilayah)
    if (all) {
      const wId = wilayah_id && wilayah_id !== 'all' ? parseInt(wilayah_id, 10) : null;
      if (wId) {
        const toDelete = state.customVoters.filter(p => p.wilayah_id === wId).map(p => p.kode_pemilih.toUpperCase());
        toDelete.forEach(c => {
          if (!state.deletedVoters.includes(c)) state.deletedVoters.push(c);
        });
        state.customVoters = state.customVoters.filter(p => p.wilayah_id !== wId);
        try {
          const dbVoters = await dbAll('SELECT kode_pemilih FROM pemilih WHERE wilayah_id = ?', [wId]);
          if (dbVoters) {
            dbVoters.forEach(v => {
              const c = v.kode_pemilih.toUpperCase();
              if (!state.deletedVoters.includes(c)) state.deletedVoters.push(c);
            });
          }
          await dbRun('DELETE FROM pemilih WHERE wilayah_id = ?', [wId]);
        } catch (e) {}
        saveSharedState(state);
        return res.json({ success: true, message: 'Seluruh pemilih pada wilayah terpilih berhasil dihapus.' });
      } else {
        try {
          const dbVoters = await dbAll('SELECT kode_pemilih FROM pemilih');
          if (dbVoters) {
            dbVoters.forEach(v => {
              const c = v.kode_pemilih.toUpperCase();
              if (!state.deletedVoters.includes(c)) state.deletedVoters.push(c);
            });
          }
          await dbRun('DELETE FROM pemilih');
        } catch (e) {}
        state.customVoters = [];
        saveSharedState(state);
        return res.json({ success: true, message: 'Seluruh data pemilih dalam DPT berhasil dihapus total.' });
      }
    }

    // Opsi 2: Hapus Daftar Kode yang Ditandai
    if (Array.isArray(codes) && codes.length > 0) {
      const cleanCodes = codes.map(c => String(c).trim().toUpperCase()).filter(Boolean);
      cleanCodes.forEach(c => {
        if (!state.deletedVoters.includes(c)) state.deletedVoters.push(c);
      });
      const deleteSet = new Set(cleanCodes);
      state.customVoters = state.customVoters.filter(p => !deleteSet.has(p.kode_pemilih.toUpperCase()));
      saveSharedState(state);

      for (const code of cleanCodes) {
        try {
          await dbRun('DELETE FROM pemilih WHERE UPPER(kode_pemilih) = ?', [code]);
        } catch (e) {}
      }

      return res.json({
        success: true,
        message: `Berhasil menghapus ${cleanCodes.length} pemilih terpilih dari DPT.`,
        count: cleanCodes.length
      });
    }

    return res.status(400).json({ success: false, message: 'Tidak ada pemilih yang dipilih untuk dihapus.' });
  } catch (err) {
    console.error('Error bulk delete pemilih:', err);
    res.status(500).json({ success: false, message: 'Gagal melakukan penghapusan massal pemilih.' });
  }
});

// Edit Data Pemilih (Nama / Wilayah)
app.put('/api/admin/pemilih/:kode', requireAdminAuth, async (req, res) => {
  try {
    const cleanKode = String(req.params.kode).trim().toUpperCase();
    const { nama_pemilih, wilayah_id } = req.body;
    const wId = parseInt(wilayah_id, 10);
    const cleanNama = String(nama_pemilih || '').trim();

    if (!cleanNama || isNaN(wId)) {
      return res.status(400).json({ success: false, message: 'Nama pemilih dan wilayah wajib diisi.' });
    }

    const state = getSharedState();
    if (!state.customVoters) state.customVoters = [];
    const idx = state.customVoters.findIndex(p => p.kode_pemilih.toUpperCase() === cleanKode);
    if (idx !== -1) {
      state.customVoters[idx].nama_pemilih = cleanNama;
      state.customVoters[idx].wilayah_id = wId;
      saveSharedState(state);
    } else {
      state.customVoters.push({
        id: Date.now(),
        kode_pemilih: cleanKode,
        wilayah_id: wId,
        nama_pemilih: cleanNama,
        sudah_memilih: 0,
        waktu_memilih: null
      });
      saveSharedState(state);
    }

    try {
      await dbRun(
        'UPDATE pemilih SET nama_pemilih = ?, wilayah_id = ? WHERE UPPER(kode_pemilih) = ?',
        [cleanNama, wId, cleanKode]
      );
    } catch (dbErr) {
      console.warn('DB update pemilih warning:', dbErr.message);
    }

    res.json({ success: true, message: `Data pemilih "${cleanKode}" berhasil diperbarui.` });
  } catch (err) {
    console.error('Error update pemilih:', err);
    res.status(500).json({ success: false, message: 'Gagal memperbarui data pemilih.' });
  }
});

// Bulk Sinkronisasi / Simpan Permanen DPT dari Admin
app.post('/api/admin/pemilih/bulk-sync', requireAdminAuth, async (req, res) => {
  try {
    const { voters } = req.body;
    if (!Array.isArray(voters)) {
      return res.status(400).json({ success: false, message: 'Format data voters tidak valid.' });
    }

    const state = getSharedState();
    if (!state.customVoters) state.customVoters = [];
    if (!state.deletedVoters) state.deletedVoters = [];
    const map = new Map(state.customVoters.map(v => [v.kode_pemilih.toUpperCase(), v]));

    for (const v of voters) {
      if (!v.kode_pemilih) continue;
      const cleanKode = String(v.kode_pemilih).trim().toUpperCase();
      const wId = parseInt(v.wilayah_id, 10) || 1;
      const cleanNama = String(v.nama_pemilih || '').trim() || `Warga Pemilih Wilayah ${wId}`;
      const sudah = v.sudah_memilih ? 1 : 0;
      const waktu = v.waktu_memilih || null;

      // Hapus dari deletedVoters
      state.deletedVoters = state.deletedVoters.filter(c => c !== cleanKode);

      map.set(cleanKode, {
        id: v.id || Date.now(),
        kode_pemilih: cleanKode,
        wilayah_id: wId,
        nama_pemilih: cleanNama,
        sudah_memilih: sudah,
        waktu_memilih: waktu
      });

      try {
        await dbRun(
          'INSERT INTO pemilih (kode_pemilih, wilayah_id, nama_pemilih, sudah_memilih) VALUES (?, ?, ?, ?) ON CONFLICT(kode_pemilih) DO UPDATE SET wilayah_id=excluded.wilayah_id, nama_pemilih=excluded.nama_pemilih',
          [cleanKode, wId, cleanNama, sudah]
        );
      } catch (dbErr) {
        try {
          await dbRun(
            'UPDATE pemilih SET nama_pemilih = ?, wilayah_id = ? WHERE UPPER(kode_pemilih) = ?',
            [cleanNama, wId, cleanKode]
          );
        } catch (e) {}
      }
    }

    state.customVoters = Array.from(map.values());
    saveSharedState(state);

    res.json({
      success: true,
      message: `Berhasil menyinkronkan ${voters.length} data pemilih secara permanen.`,
      total: state.customVoters.length
    });
  } catch (err) {
    console.error('Error bulk sync pemilih:', err);
    res.status(500).json({ success: false, message: 'Gagal sinkronisasi data pemilih.' });
  }
});

// Generate Kode Pemilih Baru Secara Massal
app.post('/api/admin/generate-pemilih', requireAdminAuth, async (req, res) => {
  try {
    const { wilayah_id, jumlah, prefix } = req.body;
    const wId = parseInt(wilayah_id, 10);
    const qty = parseInt(jumlah, 10);

    if (isNaN(wId) || isNaN(qty) || qty < 1 || qty > 1000) {
      return res.status(400).json({ success: false, message: 'Wilayah dan jumlah pemilih (1 - 1000) tidak valid.' });
    }

    const wilayah = (await dbGet('SELECT * FROM wilayah WHERE id = ?', [wId])) || FALLBACK_WILAYAH.find(w => w.id === wId);
    const namaWilayah = wilayah ? wilayah.nama_wilayah : 'Wilayah ' + wId;

    const pre = (prefix && prefix.trim() !== '') ? prefix.trim().toUpperCase() : `W${wId}`;
    const generated = [];
    const generatedVotersList = [];
    const state = getSharedState();
    if (!state.customVoters) state.customVoters = [];
    if (!state.deletedVoters) state.deletedVoters = [];

    for (let i = 0; i < qty; i++) {
      const randomSuffix = crypto.randomBytes(3).toString('hex').toUpperCase();
      const code = `${pre}-${randomSuffix}`;
      
      // Hapus dari deletedVoters jika ada
      state.deletedVoters = state.deletedVoters.filter(c => c !== code);

      try {
        await dbRun(
          'INSERT INTO pemilih (kode_pemilih, wilayah_id, nama_pemilih) VALUES (?, ?, ?)',
          [code, wId, `Pemilih ${namaWilayah}`]
        );
      } catch (e) {}

      const vObj = {
        id: Date.now() + i,
        kode_pemilih: code,
        wilayah_id: wId,
        nama_wilayah: namaWilayah,
        nama_pemilih: `Pemilih ${namaWilayah}`,
        sudah_memilih: 0,
        waktu_memilih: null
      };
      state.customVoters.push(vObj);
      generated.push(code);
      generatedVotersList.push(vObj);
    }
    saveSharedState(state);

    res.json({
      success: true,
      message: `Berhasil menambahkan ${generated.length} kode pemilih baru untuk wilayah ${namaWilayah}.`,
      count: generated.length,
      sample_codes: generated.slice(0, 10),
      voters: generatedVotersList
    });
  } catch (err) {
    console.error('Error generate pemilih:', err);
    res.status(500).json({ success: false, message: 'Gagal generate pemilih.' });
  }
});

// Toggle Kunci Perubahan Data Calon
app.post('/api/admin/toggle-lock', requireAdminAuth, async (req, res) => {
  try {
    const lockSetting = await dbGet("SELECT nilai FROM pengaturan WHERE kunci = 'kunci_perubahan_calon'");
    const currentVal = lockSetting ? lockSetting.nilai : '0';
    const newVal = currentVal === '1' ? '0' : '1';

    await dbRun("UPDATE pengaturan SET nilai = ? WHERE kunci = 'kunci_perubahan_calon'", [newVal]);

    res.json({
      success: true,
      is_locked: newVal === '1',
      message: newVal === '1' ? 'Data pemilihan berhasil DIKUNCI.' : 'Data pemilihan berhasil DIBUKA.'
    });
  } catch (err) {
    console.error('Error toggle lock:', err);
    res.status(500).json({ success: false, message: 'Gagal mengubah status kunci data.' });
  }
});

// RESET DATA SUARA (Hanya Admin dengan Konfirmasi Ganda & Password)
app.post('/api/admin/reset', requireAdminAuth, async (req, res) => {
  try {
    const { confirm_text, admin_password } = req.body;

    if (confirm_text !== 'RESET SUARA BANYUBIRU') {
      return res.status(400).json({
        success: false,
        message: 'Teks konfirmasi salah! Ketik tepat "RESET SUARA BANYUBIRU" untuk melanjutkan.'
      });
    }

    const isAuth = await verifyAdminCredentials(req.admin.username, admin_password);
    if (!isAuth) {
      return res.status(401).json({ success: false, message: 'Password admin salah! Reset dibatalkan.' });
    }

    await dbRun('DELETE FROM suara');
    await dbRun('UPDATE pemilih SET sudah_memilih = 0, waktu_memilih = NULL');

    console.log(`⚠️ Database suara telah direset oleh admin: ${req.admin.username}`);

    res.json({
      success: true,
      message: 'Seluruh data suara berhasil direset dan status pemilih telah dikembalikan ke belum memilih.'
    });
  } catch (err) {
    console.error('Error reset database:', err);
    res.status(500).json({ success: false, message: 'Gagal melakukan reset data suara.' });
  }
});

// Ekspor Hasil Suara ke CSV
app.get('/api/admin/export', requireAdminAuth, async (req, res) => {
  try {
    const rekapQuery = await dbAll(`
      SELECT 
        w.nama_wilayah AS "wilayah",
        c.nomor_urut AS "no_urut",
        c.nama AS "nama_calon",
        COUNT(s.id) AS "jumlah_suara"
      FROM wilayah w
      JOIN calon c ON c.wilayah_id = w.id
      LEFT JOIN suara s ON s.calon_id = c.id
      GROUP BY w.id, w.nama_wilayah, c.id, c.nomor_urut, c.nama
      ORDER BY w.id ASC, c.nomor_urut ASC
    `);

    let csv = 'Wilayah,No Urut,Nama Calon,Jumlah Suara\n';
    for (const row of rekapQuery) {
      const cleanNama = `"${String(row.nama_calon).replace(/"/g, '""')}"`;
      const cleanWilayah = `"${String(row.wilayah).replace(/"/g, '""')}"`;
      csv += `${cleanWilayah},${row.no_urut},${cleanNama},${row.jumlah_suara}\n`;
    }

    const filename = `Rekap_Suara_BPD_Banyubiru_${new Date().toISOString().slice(0, 10)}.csv`;
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
  } catch (err) {
    console.error('Error export CSV:', err);
    res.status(500).json({ success: false, message: 'Gagal mengekspor data CSV.' });
  }
});

// Inisialisasi Server Lokal
async function startServer() {
  try {
    await initDatabase();
    app.listen(PORT, () => {
      console.log('=====================================================');
      console.log('🏛️  E-VOTING BPD DESA BANYUBIRU (2027-2034) BERJALAN');
      console.log(`🌐  URL Pemilih: http://localhost:${PORT}`);
      console.log(`⚙️   URL Admin  : http://localhost:${PORT}/admin`);
      console.log('=====================================================');
    });
  } catch (err) {
    console.error('❌ Server gagal dijalankan:', err);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}

module.exports = app;
