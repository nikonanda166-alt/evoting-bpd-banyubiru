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
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

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
app.get('/api/wilayah', async (req, res) => {
  try {
    const wilayahList = await dbAll(`
      SELECT w.id, w.nama_wilayah, w.jadwal, w.lokasi,
        (SELECT COUNT(*) FROM calon c WHERE c.wilayah_id = w.id) AS total_calon,
        (SELECT COUNT(*) FROM pemilih p WHERE p.wilayah_id = w.id) AS total_pemilih
      FROM wilayah w
      ORDER BY w.id ASC
    `);
    res.json({ success: true, data: wilayahList });
  } catch (err) {
    console.error('Error /api/wilayah:', err);
    res.status(500).json({ success: false, message: 'Gagal mengambil data wilayah.' });
  }
});

// Ambil daftar calon pada wilayah tertentu
app.get('/api/wilayah/:id/calon', async (req, res) => {
  try {
    const wilayahId = parseInt(req.params.id, 10);
    const wilayah = await dbGet('SELECT * FROM wilayah WHERE id = ?', [wilayahId]);
    if (!wilayah) {
      return res.status(404).json({ success: false, message: 'Wilayah tidak ditemukan.' });
    }

    const calonList = await dbAll(
      'SELECT id, wilayah_id, nomor_urut, nama, foto, visi_misi FROM calon WHERE wilayah_id = ? ORDER BY nomor_urut ASC',
      [wilayahId]
    );

    res.json({
      success: true,
      wilayah,
      calon: calonList
    });
  } catch (err) {
    console.error('Error /api/wilayah/:id/calon:', err);
    res.status(500).json({ success: false, message: 'Gagal mengambil daftar calon.' });
  }
});

// Validasi Kode Pemilih sebelum voting
app.post('/api/verify-voter', async (req, res) => {
  try {
    const { kode_pemilih, wilayah_id } = req.body;
    if (!kode_pemilih || !wilayah_id) {
      return res.status(400).json({ success: false, message: 'Kode Pemilih dan Wilayah harus diisi.' });
    }

    const cleanCode = String(kode_pemilih).trim().toUpperCase();
    const wId = parseInt(wilayah_id, 10);

    const pemilih = await dbGet(
      'SELECT p.*, w.nama_wilayah FROM pemilih p JOIN wilayah w ON p.wilayah_id = w.id WHERE UPPER(p.kode_pemilih) = ?',
      [cleanCode]
    );

    if (!pemilih) {
      return res.status(404).json({
        success: false,
        message: 'Kode Pemilih tidak terdaftar dalam sistem. Pastikan Anda memasukkan kode dengan benar.'
      });
    }

    if (pemilih.wilayah_id !== wId) {
      return res.status(400).json({
        success: false,
        message: `Kode Pemilih ini terdaftar untuk wilayah "${pemilih.nama_wilayah}", bukan wilayah yang Anda pilih saat ini.`
      });
    }

    if (pemilih.sudah_memilih === 1) {
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

    const result = await submitVoteAtomic(kode_pemilih, wilayah_id, calon_id);
    res.json({
      success: true,
      message: 'Terima kasih. Suara Anda berhasil dicatat secara resmi di database desa.',
      data: result
    });
  } catch (err) {
    console.warn('Voting ditolak/gagal:', err.message);
    res.status(400).json({
      success: false,
      message: err.message || 'Gagal menyimpan suara ke database.'
    });
  }
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

    const token = generateToken({ id: admin.id, username: admin.username });
    res.json({
      success: true,
      message: 'Login berhasil.',
      token,
      admin: { username: admin.username }
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

    await dbRun(
      'UPDATE calon SET nomor_urut = ?, nama = ?, visi_misi = ?, foto = ? WHERE id = ?',
      [parseInt(nomor_urut, 10), nama.trim(), visi_misi || '', foto || '', calonId]
    );

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

    const pemilihList = await dbAll(sql, params);
    res.json({ success: true, data: pemilihList });
  } catch (err) {
    console.error('Error /api/admin/pemilih:', err);
    res.status(500).json({ success: false, message: 'Gagal mengambil data pemilih.' });
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

    const wilayah = await dbGet('SELECT * FROM wilayah WHERE id = ?', [wId]);
    if (!wilayah) {
      return res.status(404).json({ success: false, message: 'Wilayah tidak ditemukan.' });
    }

    const pre = (prefix && prefix.trim() !== '') ? prefix.trim().toUpperCase() : `W${wId}`;
    const generated = [];

    for (let i = 0; i < qty; i++) {
      const randomSuffix = crypto.randomBytes(3).toString('hex').toUpperCase();
      const code = `${pre}-${randomSuffix}`;
      try {
        await dbRun(
          'INSERT INTO pemilih (kode_pemilih, wilayah_id, nama_pemilih) VALUES (?, ?, ?)',
          [code, wId, `Pemilih ${wilayah.nama_wilayah}`]
        );
        generated.push(code);
      } catch (e) {
        // Abaikan bentrok
      }
    }

    res.json({
      success: true,
      message: `Berhasil menambahkan ${generated.length} kode pemilih baru untuk wilayah ${wilayah.nama_wilayah}.`,
      count: generated.length,
      sample_codes: generated.slice(0, 10)
    });
  } catch (err) {
    console.error('Error generate pemilih:', err);
    res.status(500).json({ success: false, message: 'Gagal men-generate kode pemilih.' });
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
