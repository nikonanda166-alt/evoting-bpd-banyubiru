const path = require('path');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

// Deteksi mode database: Supabase (PostgreSQL) jika DATABASE_URL ada, selain itu SQLite lokal
const isPostgres = Boolean(process.env.DATABASE_URL);

let sqliteDb = null;
let pgPool = null;

if (isPostgres) {
  const { Pool } = require('pg');
  pgPool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    },
    max: 5,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 2500 // Cepat gagal (2.5 detik) jika database Supabase belum siap / timeout
  });
  console.log('✅ Mode Database: PostgreSQL / Supabase terhubung.');
} else {
  try {
    const sqlite3 = require('sqlite3').verbose();
    const dbPath = process.env.DB_PATH || (process.env.VERCEL ? ':memory:' : path.join(__dirname, '..', 'evoting.db'));
    sqliteDb = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('❌ Gagal membuka database SQLite:', err.message);
      } else {
        console.log('✅ Mode Database: SQLite lokal terhubung:', dbPath);
        if (dbPath !== ':memory:') {
          sqliteDb.run('PRAGMA foreign_keys = ON');
          sqliteDb.run('PRAGMA journal_mode = WAL');
        }
      }
    });
  } catch (e) {
    console.warn('SQLite init lewati:', e.message);
  }
}

// Konversi query parameterized '?' (SQLite) ke '$1, $2, ...' (PostgreSQL)
function adaptSqlForPg(sql) {
  let paramIndex = 1;
  return sql.replace(/\?/g, () => `$${paramIndex++}`);
}

// Helper Query Banyak Baris
async function dbAll(sql, params = []) {
  if (isPostgres && pgPool) {
    try {
      const pgSql = adaptSqlForPg(sql);
      const res = await pgPool.query(pgSql, params);
      return res.rows;
    } catch (err) {
      console.warn('dbAll PostgreSQL error:', err.message);
      return [];
    }
  } else if (sqliteDb) {
    return new Promise((resolve) => {
      sqliteDb.all(sql, params, (err, rows) => {
        if (err) {
          console.warn('dbAll SQLite error:', err.message);
          resolve([]);
        } else {
          resolve(rows || []);
        }
      });
    });
  }
  return [];
}

// Helper Query Satu Baris
async function dbGet(sql, params = []) {
  if (isPostgres && pgPool) {
    try {
      const pgSql = adaptSqlForPg(sql);
      const res = await pgPool.query(pgSql, params);
      return res.rows[0] || null;
    } catch (err) {
      console.warn('dbGet PostgreSQL error:', err.message);
      return null;
    }
  } else if (sqliteDb) {
    return new Promise((resolve) => {
      sqliteDb.get(sql, params, (err, row) => {
        if (err) {
          console.warn('dbGet SQLite error:', err.message);
          resolve(null);
        } else {
          resolve(row || null);
        }
      });
    });
  }
  return null;
}

// Helper Eksekusi INSERT / UPDATE / DELETE
async function dbRun(sql, params = []) {
  if (isPostgres && pgPool) {
    try {
      const pgSql = adaptSqlForPg(sql);
      const res = await pgPool.query(pgSql, params);
      return {
        changes: res.rowCount,
        lastID: res.rows && res.rows[0] ? res.rows[0].id : null
      };
    } catch (err) {
      console.warn('dbRun PostgreSQL error:', err.message);
      return { changes: 0, lastID: null };
    }
  } else if (sqliteDb) {
    return new Promise((resolve) => {
      sqliteDb.run(sql, params, function (err) {
        if (err) {
          console.warn('dbRun SQLite error:', err.message);
          resolve({ lastID: null, changes: 0 });
        } else {
          resolve({ lastID: this.lastID, changes: this.changes });
        }
      });
    });
  }
  return { changes: 0, lastID: null };
}

// Inisialisasi Database (Jika menggunakan SQLite lokal)
async function initDatabase() {
  if (isPostgres) {
    // Pada Supabase, tabel diinisialisasi melalui SQL Editor dengan file supabase_schema.sql
    console.log('ℹ️ Menggunakan database Supabase. Pastikan skema tabel telah dijalankan di SQL Editor Supabase.');
    return;
  }

  return new Promise((resolve, reject) => {
    sqliteDb.serialize(async () => {
      try {
        await dbRun(`
          CREATE TABLE IF NOT EXISTS wilayah (
            id INTEGER PRIMARY KEY,
            nama_wilayah VARCHAR(100) NOT NULL,
            jadwal VARCHAR(150) NOT NULL,
            lokasi VARCHAR(200) NOT NULL
          )
        `);

        await dbRun(`
          CREATE TABLE IF NOT EXISTS calon (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            wilayah_id INTEGER NOT NULL,
            nomor_urut INTEGER NOT NULL,
            nama VARCHAR(150) NOT NULL,
            foto VARCHAR(255) DEFAULT '',
            visi_misi TEXT DEFAULT '',
            FOREIGN KEY (wilayah_id) REFERENCES wilayah (id) ON DELETE CASCADE,
            UNIQUE (wilayah_id, nomor_urut)
          )
        `);

        await dbRun(`
          CREATE TABLE IF NOT EXISTS pemilih (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            kode_pemilih VARCHAR(50) NOT NULL UNIQUE,
            wilayah_id INTEGER NOT NULL,
            nama_pemilih VARCHAR(150) DEFAULT '',
            sudah_memilih INTEGER DEFAULT 0 CHECK(sudah_memilih IN (0, 1)),
            waktu_memilih DATETIME DEFAULT NULL,
            FOREIGN KEY (wilayah_id) REFERENCES wilayah (id) ON DELETE CASCADE
          )
        `);

        await dbRun(`
          CREATE TABLE IF NOT EXISTS suara (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            wilayah_id INTEGER NOT NULL,
            calon_id INTEGER NOT NULL,
            waktu DATETIME DEFAULT CURRENT_TIMESTAMP,
            kode_pemilih_hash VARCHAR(64) NOT NULL UNIQUE,
            FOREIGN KEY (wilayah_id) REFERENCES wilayah (id) ON DELETE CASCADE,
            FOREIGN KEY (calon_id) REFERENCES calon (id) ON DELETE CASCADE
          )
        `);

        await dbRun(`
          CREATE TABLE IF NOT EXISTS admin (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username VARCHAR(50) NOT NULL UNIQUE,
            password_hash VARCHAR(255) NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `);

        await dbRun(`
          CREATE TABLE IF NOT EXISTS pengaturan (
            kunci VARCHAR(50) PRIMARY KEY,
            nilai VARCHAR(255) NOT NULL
          )
        `);

        const existingWilayah = await dbGet('SELECT COUNT(*) as count FROM wilayah');
        if (existingWilayah && existingWilayah.count === 0) {
          console.log('🌱 Melakukan inisialisasi awal data wilayah & calon di SQLite...');
          await seedDefaultDataSQLite();
        }

        const adminUser = process.env.ADMIN_USERNAME || 'admin';
        const adminPass = process.env.ADMIN_PASSWORD || 'PanitiaBanyubiru2027!';
        const existingAdmin = await dbGet('SELECT * FROM admin WHERE username = ?', [adminUser]);
        if (!existingAdmin) {
          const salt = await bcrypt.genSalt(10);
          const hash = await bcrypt.hash(adminPass, salt);
          await dbRun('INSERT INTO admin (username, password_hash) VALUES (?, ?)', [adminUser, hash]);
          console.log(`🔐 Akun admin dibuat: ${adminUser}`);
        }

        resolve();
      } catch (err) {
        console.error('❌ Kesalahan inisialisasi SQLite:', err);
        reject(err);
      }
    });
  });
}

// Seeding Khusus SQLite
async function seedDefaultDataSQLite() {
  const dataWilayah = [
    { id: 1, nama: 'KETERWAKILAN PEREMPUAN', jadwal: 'Rabu, 9 September 2026 - Pukul 10.00 WIB', lokasi: 'Balai Desa Banyubiru' },
    { id: 2, nama: 'DUSUN KRAJAN', jadwal: 'Sabtu, 12 September 2026 - Pukul 19.30 WIB', lokasi: 'Balai Dusun Krajan' },
    { id: 3, nama: 'DUSUN DEMAKAN', jadwal: 'Minggu, 13 September 2026 - Pukul 19.30 WIB', lokasi: 'Balai Dusun Demakan' },
    { id: 4, nama: 'DUSUN PANCURAN', jadwal: 'Selasa, 15 September 2026 - Pukul 19.30 WIB', lokasi: 'Rumah Kadus Pancuran' },
    { id: 5, nama: 'DUSUN CERBONAN', jadwal: 'Selasa, 15 September 2026 - Pukul 19.30 WIB', lokasi: 'Rumah Bp. Ahmad Arwani (RT 3 RW 8)' },
    { id: 6, nama: 'KAMPUNG RAPET', jadwal: 'Rabu, 16 September 2026 - Pukul 19.30 WIB', lokasi: 'Balai Dusun Kampung Rapet' },
    { id: 7, nama: 'DUSUN RANDUSARI', jadwal: 'Kamis, 17 September 2026 - Pukul 19.30 WIB', lokasi: 'Gedung Posyandu' },
    { id: 8, nama: 'TAWANGREJO, DANGKEL', jadwal: 'Jumat, 18 September 2026 - Pukul 19.30 WIB', lokasi: 'Aula RW 14' },
    { id: 9, nama: 'DUSUN TEGALWUNI', jadwal: 'Jumat, 18 September 2026 - Pukul 19.30 WIB', lokasi: 'Rumah Kepala Dusun Tegalwuni' }
  ];

  for (const w of dataWilayah) {
    await dbRun('INSERT OR REPLACE INTO wilayah (id, nama_wilayah, jadwal, lokasi) VALUES (?, ?, ?, ?)', [w.id, w.nama, w.jadwal, w.lokasi]);
  }

  const dataCalon = [
    { wId: 1, no: 1, nama: 'Latifatul Khoeriyah' },
    { wId: 1, no: 2, nama: 'Khonaah Khusnul Rohmah' },
    { wId: 1, no: 3, nama: 'Tri Winarti' },
    { wId: 2, no: 1, nama: 'Aulia Rakan Edelwin' },
    { wId: 2, no: 2, nama: 'Wisnu Jati Nugroho' },
    { wId: 2, no: 3, nama: 'Antonius Marju' },
    { wId: 3, no: 1, nama: 'Lazimatul Zasiroh' },
    { wId: 3, no: 2, nama: 'Maulana Bukhori' },
    { wId: 3, no: 3, nama: 'Sri Puji Susanto' },
    { wId: 3, no: 4, nama: 'Muhammad Irchamul' },
    { wId: 3, no: 5, nama: 'Slamet Riyadi' },
    { wId: 3, no: 6, nama: 'Nuning Kristiyanti' },
    { wId: 4, no: 1, nama: 'Petrus Iswadi' },
    { wId: 4, no: 2, nama: 'Suwarto' },
    { wId: 5, no: 1, nama: 'Guvron Noviandi' },
    { wId: 5, no: 2, nama: 'Izzudin Chaidlir' },
    { wId: 5, no: 3, nama: 'Jamil Yatul' },
    { wId: 5, no: 4, nama: 'Muchamad Nasikin' },
    { wId: 6, no: 1, nama: 'Edwin Adi Wicaksono' },
    { wId: 6, no: 2, nama: 'Yulius Lintin Andoea' },
    { wId: 6, no: 3, nama: 'Dian Ayu Novianty' },
    { wId: 7, no: 1, nama: 'Rozie Eljana' },
    { wId: 7, no: 2, nama: 'Ulin Niha' },
    { wId: 7, no: 3, nama: 'Faridl Hasirul Aqwarm Hadi' },
    { wId: 7, no: 4, nama: 'Danang Prasetyo' },
    { wId: 8, no: 1, nama: 'Anasya Aggilia Putri' },
    { wId: 8, no: 2, nama: 'La Ode Abdul Aslan' },
    { wId: 8, no: 3, nama: 'Tri Woro Pusphoheni' },
    { wId: 8, no: 4, nama: 'Tri Suwarti' },
    { wId: 9, no: 1, nama: 'Sugeng' },
    { wId: 9, no: 2, nama: 'Teguh Surono' },
    { wId: 9, no: 3, nama: 'Margono Hadi' }
  ];

  for (const c of dataCalon) {
    await dbRun('INSERT INTO calon (wilayah_id, nomor_urut, nama) VALUES (?, ?, ?)', [c.wId, c.no, c.nama]);
  }

  const prefixes = [
    { wId: 1, code: 'PEREMPUAN' }, { wId: 2, code: 'KRAJAN' }, { wId: 3, code: 'DEMAKAN' },
    { wId: 4, code: 'PANCURAN' }, { wId: 5, code: 'CERBONAN' }, { wId: 6, code: 'RAPET' },
    { wId: 7, code: 'RANDUSARI' }, { wId: 8, code: 'TAWANGREJO' }, { wId: 9, code: 'TEGALWUNI' }
  ];

  for (const p of prefixes) {
    for (let i = 1; i <= 5; i++) {
      const kode = `${p.code}-${String(i).padStart(2, '0')}`;
      await dbRun('INSERT OR IGNORE INTO pemilih (kode_pemilih, wilayah_id, nama_pemilih) VALUES (?, ?, ?)', [kode, p.wId, `Warga Pemilih ${p.code} ${i}`]);
    }
  }

  await dbRun("INSERT OR REPLACE INTO pengaturan (kunci, nilai) VALUES ('kunci_perubahan_calon', '0')");
}

// FUNGSI TRANSAKSI ATOMIK VOTING (Bebas dari Race Condition & Double Voting)
async function submitVoteAtomic(kodePemilih, wilayahId, calonId) {
  const cleanCode = String(kodePemilih).trim().toUpperCase();
  const wId = parseInt(wilayahId, 10);
  const cId = parseInt(calonId, 10);

  if (!cleanCode || isNaN(wId) || isNaN(cId)) {
    throw new Error('Data voting tidak lengkap atau tidak valid.');
  }

  const tokenHash = crypto.createHash('sha256').update(cleanCode).digest('hex');

  if (isPostgres) {
    // Implementasi Transaksi Atomik di PostgreSQL / Supabase
    const client = await pgPool.connect();
    try {
      await client.query('BEGIN');

      // 1. Cek Pemilih dengan Lock Row (FOR UPDATE)
      const resPemilih = await client.query(
        'SELECT * FROM pemilih WHERE UPPER(kode_pemilih) = $1 FOR UPDATE',
        [cleanCode]
      );
      const pemilih = resPemilih.rows[0];

      if (!pemilih) {
        await client.query('ROLLBACK');
        throw new Error('Kode Pemilih tidak terdaftar di sistem. Silakan periksa kembali.');
      }

      if (pemilih.wilayah_id !== wId) {
        await client.query('ROLLBACK');
        throw new Error('Kode Pemilih ini terdaftar untuk wilayah lain, bukan wilayah yang dipilih.');
      }

      if (pemilih.sudah_memilih === 1) {
        await client.query('ROLLBACK');
        throw new Error('Kode Pemilih ini SUDAH DIGUNAKAN untuk memilih sebelumnya. Suara tidak dapat diberikan lagi.');
      }

      // 2. Cek Calon
      const resCalon = await client.query(
        'SELECT * FROM calon WHERE id = $1 AND wilayah_id = $2',
        [cId, wId]
      );
      const calon = resCalon.rows[0];

      if (!calon) {
        await client.query('ROLLBACK');
        throw new Error('Calon yang dipilih tidak valid atau tidak terdaftar pada wilayah ini.');
      }

      // 3. Simpan Suara
      await client.query(
        'INSERT INTO suara (wilayah_id, calon_id, waktu, kode_pemilih_hash) VALUES ($1, $2, NOW(), $3)',
        [wId, cId, tokenHash]
      );

      // 4. Tandai Pemilih Sudah Memilih
      await client.query(
        'UPDATE pemilih SET sudah_memilih = 1, waktu_memilih = NOW() WHERE id = $1',
        [pemilih.id]
      );

      await client.query('COMMIT');
      return {
        success: true,
        calonTerpilih: calon.nama,
        nomorUrut: calon.nomor_urut
      };
    } catch (err) {
      await client.query('ROLLBACK').catch(() => {});
      if (err.code === '23505') { // Postgres Unique Violation
        throw new Error('Peringatan: Suara untuk kode pemilih ini baru saja tercatat di sistem (double voting dicegah).');
      }
      throw err;
    } finally {
      client.release();
    }
  } else {
    // Implementasi Transaksi Atomik di SQLite Lokal
    return new Promise((resolve, reject) => {
      sqliteDb.serialize(async () => {
        try {
          await dbRun('BEGIN IMMEDIATE TRANSACTION');

          const pemilih = await dbGet('SELECT * FROM pemilih WHERE UPPER(kode_pemilih) = ?', [cleanCode]);
          if (!pemilih) {
            await dbRun('ROLLBACK');
            return reject(new Error('Kode Pemilih tidak terdaftar di sistem. Silakan periksa kembali.'));
          }

          if (pemilih.wilayah_id !== wId) {
            await dbRun('ROLLBACK');
            return reject(new Error('Kode Pemilih ini terdaftar untuk wilayah lain, bukan wilayah yang dipilih.'));
          }

          if (pemilih.sudah_memilih === 1) {
            await dbRun('ROLLBACK');
            return reject(new Error('Kode Pemilih ini SUDAH DIGUNAKAN untuk memilih sebelumnya. Suara tidak dapat diberikan lagi.'));
          }

          const calon = await dbGet('SELECT * FROM calon WHERE id = ? AND wilayah_id = ?', [cId, wId]);
          if (!calon) {
            await dbRun('ROLLBACK');
            return reject(new Error('Calon yang dipilih tidak valid atau tidak terdaftar pada wilayah ini.'));
          }

          await dbRun(
            'INSERT INTO suara (wilayah_id, calon_id, waktu, kode_pemilih_hash) VALUES (?, ?, CURRENT_TIMESTAMP, ?)',
            [wId, cId, tokenHash]
          );

          await dbRun(
            'UPDATE pemilih SET sudah_memilih = 1, waktu_memilih = CURRENT_TIMESTAMP WHERE id = ?',
            [pemilih.id]
          );

          await dbRun('COMMIT');
          resolve({
            success: true,
            calonTerpilih: calon.nama,
            nomorUrut: calon.nomor_urut
          });
        } catch (err) {
          await dbRun('ROLLBACK').catch(() => {});
          if (err.message && err.message.includes('UNIQUE constraint failed')) {
            reject(new Error('Peringatan: Suara untuk kode pemilih ini baru saja tercatat di sistem (double voting dicegah).'));
          } else {
            reject(err);
          }
        }
      });
    });
  }
}

module.exports = {
  dbAll,
  dbGet,
  dbRun,
  initDatabase,
  submitVoteAtomic,
  isPostgres
};
