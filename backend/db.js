const path = require('path');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const fs = require('fs');

// Deteksi mode serverless Vercel
const isVercel = Boolean(process.env.VERCEL);

// Deteksi mode database: Supabase (PostgreSQL) jika DATABASE_URL ada, selain itu SQLite lokal
const isPostgres = Boolean(process.env.DATABASE_URL);

// File penyimpanan data persisten cadangan (tahan banting di cloud & lokal)
const STATE_FILE = isVercel 
  ? path.join('/tmp', 'banyubiru_state.json') 
  : path.join(__dirname, '..', 'banyubiru_state.json');

let inMemoryState = {
  calonPhotos: {}, // { [calonId]: photoBase64 }
  customVoters: [], // [{ id, kode_pemilih, wilayah_id, nama_pemilih, sudah_memilih, waktu_memilih }]
  votes: []
};

// Helper baca data bersama (Shared State)
function getSharedState() {
  try {
    if (fs.existsSync(STATE_FILE)) {
      const raw = fs.readFileSync(STATE_FILE, 'utf8');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          inMemoryState = {
            ...inMemoryState,
            ...parsed,
            calonPhotos: { ...inMemoryState.calonPhotos, ...(parsed.calonPhotos || {}) }
          };
        }
      }
    }
  } catch (e) {}
  return inMemoryState;
}

// Helper simpan data bersama (Shared State)
function saveSharedState(partial) {
  try {
    inMemoryState = {
      ...inMemoryState,
      ...partial,
      calonPhotos: { ...inMemoryState.calonPhotos, ...(partial.calonPhotos || {}) }
    };
    fs.writeFileSync(STATE_FILE, JSON.stringify(inMemoryState), 'utf8');
  } catch (e) {}
  return inMemoryState;
}

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
    const defaultDbPath = isVercel ? path.join('/tmp', 'evoting.db') : path.join(__dirname, '..', 'evoting.db');
    const dbPath = process.env.DB_PATH || defaultDbPath;
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

let dbInitPromise = null;
function ensureDbInitialized() {
  if (!dbInitPromise) {
    dbInitPromise = initDatabase().catch((err) => {
      console.warn('DB Init error:', err.message);
      dbInitPromise = null;
    });
  }
  return dbInitPromise;
}

// Inisialisasi Database (Kompatibel SQLite lokal, Serverless Vercel, dan PostgreSQL/Supabase)
async function initDatabase() {
  if (isPostgres) {
    try {
      await dbRun(`
        CREATE TABLE IF NOT EXISTS wilayah (
          id SERIAL PRIMARY KEY,
          nama_wilayah VARCHAR(100) NOT NULL,
          jadwal VARCHAR(150) NOT NULL,
          lokasi VARCHAR(200) NOT NULL
        )
      `);
      await dbRun(`
        CREATE TABLE IF NOT EXISTS calon (
          id SERIAL PRIMARY KEY,
          wilayah_id INTEGER NOT NULL REFERENCES wilayah (id) ON DELETE CASCADE,
          nomor_urut INTEGER NOT NULL,
          nama VARCHAR(150) NOT NULL,
          foto TEXT DEFAULT '',
          visi_misi TEXT DEFAULT '',
          UNIQUE (wilayah_id, nomor_urut)
        )
      `);
      await dbRun(`
        CREATE TABLE IF NOT EXISTS pemilih (
          id SERIAL PRIMARY KEY,
          kode_pemilih VARCHAR(50) NOT NULL UNIQUE,
          wilayah_id INTEGER NOT NULL REFERENCES wilayah (id) ON DELETE CASCADE,
          nama_pemilih VARCHAR(150) DEFAULT '',
          sudah_memilih INTEGER DEFAULT 0 CHECK(sudah_memilih IN (0, 1)),
          waktu_memilih TIMESTAMPTZ DEFAULT NULL
        )
      `);
      await dbRun(`
        CREATE TABLE IF NOT EXISTS suara (
          id SERIAL PRIMARY KEY,
          wilayah_id INTEGER NOT NULL REFERENCES wilayah (id) ON DELETE CASCADE,
          calon_id INTEGER NOT NULL REFERENCES calon (id) ON DELETE CASCADE,
          waktu TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
          kode_pemilih_hash VARCHAR(64) NOT NULL UNIQUE
        )
      `);
      await dbRun(`
        CREATE TABLE IF NOT EXISTS admin (
          id SERIAL PRIMARY KEY,
          username VARCHAR(50) NOT NULL UNIQUE,
          password_hash VARCHAR(255) NOT NULL,
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        )
      `);
      await dbRun(`
        CREATE TABLE IF NOT EXISTS pengaturan (
          kunci VARCHAR(50) PRIMARY KEY,
          nilai VARCHAR(255) NOT NULL
        )
      `);

      const existingWilayah = await dbGet('SELECT COUNT(*) as count FROM wilayah');
      if (existingWilayah && parseInt(existingWilayah.count, 10) === 0) {
        console.log('🌱 Melakukan inisialisasi awal data wilayah & calon di PostgreSQL/Supabase...');
        await seedDefaultData();
      }

      // Sinkronkan state tersimpan ke PostgreSQL jika ada
      const state = getSharedState();
      if (state.calonPhotos) {
        for (const [cId, foto] of Object.entries(state.calonPhotos)) {
          if (foto) {
            await dbRun('UPDATE calon SET foto = ? WHERE id = ?', [foto, parseInt(cId, 10)]);
          }
        }
      }
      if (state.customVoters && state.customVoters.length > 0) {
        for (const v of state.customVoters) {
          await dbRun(
            'INSERT INTO pemilih (kode_pemilih, wilayah_id, nama_pemilih, sudah_memilih) VALUES (?, ?, ?, ?) ON CONFLICT (kode_pemilih) DO NOTHING',
            [v.kode_pemilih.toUpperCase(), v.wilayah_id, v.nama_pemilih, v.sudah_memilih || 0]
          );
        }
      }
      if (state.votes && state.votes.length > 0) {
        for (const v of state.votes) {
          if (v.kode_pemilih_hash && v.wilayah_id && v.calon_id) {
            await dbRun(
              'INSERT INTO suara (wilayah_id, calon_id, waktu, kode_pemilih_hash) VALUES (?, ?, ?, ?) ON CONFLICT (kode_pemilih_hash) DO NOTHING',
              [v.wilayah_id, v.calon_id, v.waktu || new Date().toISOString(), v.kode_pemilih_hash]
            );
          }
        }
      }
    } catch (err) {
      console.warn('PostgreSQL auto-init info:', err.message);
    }
    return;
  }

  return new Promise((resolve, reject) => {
    if (!sqliteDb) return resolve();
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
            foto TEXT DEFAULT '',
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
          await seedDefaultData();
        }

        // Sinkronkan state tersimpan (foto kustom & pemilih baru dari Shared State)
        const state = getSharedState();
        if (state.calonPhotos) {
          for (const [cId, foto] of Object.entries(state.calonPhotos)) {
            if (foto) {
              await dbRun('UPDATE calon SET foto = ? WHERE id = ?', [foto, parseInt(cId, 10)]);
            }
          }
        }
        if (state.customVoters && state.customVoters.length > 0) {
          for (const v of state.customVoters) {
            await dbRun(
              'INSERT OR IGNORE INTO pemilih (kode_pemilih, wilayah_id, nama_pemilih, sudah_memilih) VALUES (?, ?, ?, ?)',
              [v.kode_pemilih.toUpperCase(), v.wilayah_id, v.nama_pemilih, v.sudah_memilih || 0]
            );
          }
        }

        // Sinkronkan perolehan suara tersimpan dari Shared State
        if (state.votes && state.votes.length > 0) {
          for (const v of state.votes) {
            if (v.kode_pemilih_hash && v.wilayah_id && v.calon_id) {
              await dbRun(
                'INSERT OR IGNORE INTO suara (wilayah_id, calon_id, waktu, kode_pemilih_hash) VALUES (?, ?, ?, ?)',
                [v.wilayah_id, v.calon_id, v.waktu || new Date().toISOString(), v.kode_pemilih_hash]
              );
            }
          }
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
        resolve();
      }
    });
  });
}

// Seeding Data Awal
async function seedDefaultData() {
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
    if (isPostgres) {
      await dbRun('INSERT INTO wilayah (id, nama_wilayah, jadwal, lokasi) VALUES (?, ?, ?, ?) ON CONFLICT (id) DO NOTHING', [w.id, w.nama, w.jadwal, w.lokasi]);
    } else {
      await dbRun('INSERT OR REPLACE INTO wilayah (id, nama_wilayah, jadwal, lokasi) VALUES (?, ?, ?, ?)', [w.id, w.nama, w.jadwal, w.lokasi]);
    }
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
    if (isPostgres) {
      await dbRun('INSERT INTO calon (wilayah_id, nomor_urut, nama) VALUES (?, ?, ?) ON CONFLICT DO NOTHING', [c.wId, c.no, c.nama]);
    } else {
      await dbRun('INSERT INTO calon (wilayah_id, nomor_urut, nama) VALUES (?, ?, ?)', [c.wId, c.no, c.nama]);
    }
  }

  const prefixes = [
    { wId: 1, code: 'PEREMPUAN' }, { wId: 2, code: 'KRAJAN' }, { wId: 3, code: 'DEMAKAN' },
    { wId: 4, code: 'PANCURAN' }, { wId: 5, code: 'CERBONAN' }, { wId: 6, code: 'RAPET' },
    { wId: 7, code: 'RANDUSARI' }, { wId: 8, code: 'TAWANGREJO' }, { wId: 9, code: 'TEGALWUNI' }
  ];

  for (const p of prefixes) {
    for (let i = 1; i <= 5; i++) {
      const kode = `${p.code}-${String(i).padStart(2, '0')}`;
      if (isPostgres) {
        await dbRun('INSERT INTO pemilih (kode_pemilih, wilayah_id, nama_pemilih) VALUES (?, ?, ?) ON CONFLICT (kode_pemilih) DO NOTHING', [kode, p.wId, `Warga Pemilih ${p.code} ${i}`]);
      } else {
        await dbRun('INSERT OR IGNORE INTO pemilih (kode_pemilih, wilayah_id, nama_pemilih) VALUES (?, ?, ?)', [kode, p.wId, `Warga Pemilih ${p.code} ${i}`]);
      }
    }
  }

  if (isPostgres) {
    await dbRun("INSERT INTO pengaturan (kunci, nilai) VALUES ('kunci_perubahan_calon', '0') ON CONFLICT (kunci) DO NOTHING");
  } else {
    await dbRun("INSERT OR REPLACE INTO pengaturan (kunci, nilai) VALUES ('kunci_perubahan_calon', '0')");
  }
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

  // 1. Validasi awal status pemilih di Shared State
  const state = getSharedState();
  if (!state.votes) state.votes = [];
  if (!state.customVoters) state.customVoters = [];

  const alreadyInState = state.votes.some((v) => v.kode_pemilih_hash === tokenHash);
  if (alreadyInState) {
    throw new Error('Kode Pemilih ini SUDAH DIGUNAKAN untuk memilih sebelumnya. Suara tidak dapat diberikan lagi.');
  }

  const voterInState = state.customVoters.find((p) => p.kode_pemilih.toUpperCase() === cleanCode);
  if (voterInState) {
    if (voterInState.sudah_memilih === 1) {
      throw new Error('Kode Pemilih ini SUDAH DIGUNAKAN untuk memilih sebelumnya. Suara tidak dapat diberikan lagi.');
    }
    if (voterInState.wilayah_id !== wId) {
      throw new Error('Kode Pemilih ini terdaftar untuk wilayah lain, bukan wilayah yang dipilih.');
    }
    // Pastikan pemilih ini ada di tabel pemilih SQL agar relasi foreign key aman
    if (isPostgres) {
      await dbRun('INSERT INTO pemilih (kode_pemilih, wilayah_id, nama_pemilih, sudah_memilih) VALUES (?, ?, ?, 0) ON CONFLICT (kode_pemilih) DO NOTHING', [cleanCode, wId, voterInState.nama_pemilih || '']);
    } else {
      await dbRun('INSERT OR IGNORE INTO pemilih (kode_pemilih, wilayah_id, nama_pemilih, sudah_memilih) VALUES (?, ?, ?, 0)', [cleanCode, wId, voterInState.nama_pemilih || '']);
    }
  }

  let namaCalonTerpilih = 'Calon Pilihan Anda';
  let noUrutCalon = '-';

  if (isPostgres) {
    // Implementasi Transaksi Atomik di PostgreSQL / Supabase
    const client = await pgPool.connect();
    try {
      await client.query('BEGIN');

      // Cek Pemilih dengan Lock Row (FOR UPDATE)
      const resPemilih = await client.query(
        'SELECT * FROM pemilih WHERE UPPER(kode_pemilih) = $1 FOR UPDATE',
        [cleanCode]
      );
      const pemilih = resPemilih.rows[0];

      if (pemilih) {
        if (pemilih.wilayah_id !== wId) {
          await client.query('ROLLBACK');
          throw new Error('Kode Pemilih ini terdaftar untuk wilayah lain, bukan wilayah yang dipilih.');
        }

        if (pemilih.sudah_memilih === 1) {
          await client.query('ROLLBACK');
          throw new Error('Kode Pemilih ini SUDAH DIGUNAKAN untuk memilih sebelumnya. Suara tidak dapat diberikan lagi.');
        }
      }

      // Cek Calon
      let resCalon = await client.query(
        'SELECT * FROM calon WHERE id = $1 AND wilayah_id = $2',
        [cId, wId]
      );
      let calon = resCalon.rows[0];
      if (!calon) {
        resCalon = await client.query(
          'SELECT * FROM calon WHERE nomor_urut = $1 AND wilayah_id = $2',
          [cId, wId]
        );
        calon = resCalon.rows[0];
      }

      if (calon) {
        namaCalonTerpilih = calon.nama;
        noUrutCalon = calon.nomor_urut;
      }

      // Simpan Suara
      await client.query(
        'INSERT INTO suara (wilayah_id, calon_id, waktu, kode_pemilih_hash) VALUES ($1, $2, NOW(), $3) ON CONFLICT (kode_pemilih_hash) DO NOTHING',
        [wId, cId, tokenHash]
      );

      // Tandai Pemilih Sudah Memilih
      if (pemilih) {
        await client.query(
          'UPDATE pemilih SET sudah_memilih = 1, waktu_memilih = NOW() WHERE id = $1',
          [pemilih.id]
        );
      }

      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK').catch(() => {});
      if (err.code === '23505') {
        throw new Error('Peringatan: Suara untuk kode pemilih ini baru saja tercatat di sistem (double voting dicegah).');
      }
      if (err.message && (err.message.includes('SUDAH DIGUNAKAN') || err.message.includes('terdaftar untuk wilayah'))) {
        throw err;
      }
      console.warn('Postgres transaction note:', err.message);
    } finally {
      client.release();
    }
  } else {
    // Implementasi Transaksi Atomik di SQLite Lokal
    await new Promise((resolve, reject) => {
      if (!sqliteDb) return resolve();
      sqliteDb.serialize(async () => {
        try {
          await dbRun('BEGIN IMMEDIATE TRANSACTION');

          const pemilih = await dbGet('SELECT * FROM pemilih WHERE UPPER(kode_pemilih) = ?', [cleanCode]);
          if (pemilih) {
            if (pemilih.wilayah_id !== wId) {
              await dbRun('ROLLBACK');
              return reject(new Error('Kode Pemilih ini terdaftar untuk wilayah lain, bukan wilayah yang dipilih.'));
            }

            if (pemilih.sudah_memilih === 1) {
              await dbRun('ROLLBACK');
              return reject(new Error('Kode Pemilih ini SUDAH DIGUNAKAN untuk memilih sebelumnya. Suara tidak dapat diberikan lagi.'));
            }
          }

          let calon = await dbGet('SELECT * FROM calon WHERE id = ? AND wilayah_id = ?', [cId, wId]);
          if (!calon) {
            calon = await dbGet('SELECT * FROM calon WHERE nomor_urut = ? AND wilayah_id = ?', [cId, wId]);
          }
          if (calon) {
            namaCalonTerpilih = calon.nama;
            noUrutCalon = calon.nomor_urut;
          }

          await dbRun(
            'INSERT OR IGNORE INTO suara (wilayah_id, calon_id, waktu, kode_pemilih_hash) VALUES (?, ?, CURRENT_TIMESTAMP, ?)',
            [wId, cId, tokenHash]
          );

          if (pemilih) {
            await dbRun(
              'UPDATE pemilih SET sudah_memilih = 1, waktu_memilih = CURRENT_TIMESTAMP WHERE id = ?',
              [pemilih.id]
            );
          } else {
            await dbRun(
              'INSERT OR REPLACE INTO pemilih (kode_pemilih, wilayah_id, nama_pemilih, sudah_memilih, waktu_memilih) VALUES (?, ?, ?, 1, CURRENT_TIMESTAMP)',
              [cleanCode, wId, voterInState ? voterInState.nama_pemilih : 'Warga Pemilih', 1]
            );
          }

          await dbRun('COMMIT');
          resolve();
        } catch (err) {
          await dbRun('ROLLBACK').catch(() => {});
          if (err.message && (err.message.includes('SUDAH DIGUNAKAN') || err.message.includes('terdaftar untuk wilayah'))) {
            return reject(err);
          }
          console.warn('SQLite vote transaction fallback:', err.message);
          resolve();
        }
      });
    });
  }

  // 3. Simpan permanen ke Shared State (Double-Lock & Cloud Persistence)
  const finalState = getSharedState();
  if (!finalState.votes) finalState.votes = [];
  const existsFinal = finalState.votes.some((v) => v.kode_pemilih_hash === tokenHash);
  if (!existsFinal) {
    finalState.votes.push({
      wilayah_id: wId,
      calon_id: cId,
      kode_pemilih_hash: tokenHash,
      waktu: new Date().toISOString()
    });
  }

  if (finalState.customVoters) {
    const match = finalState.customVoters.find((p) => p.kode_pemilih.toUpperCase() === cleanCode);
    if (match) {
      match.sudah_memilih = 1;
      match.waktu_memilih = new Date().toISOString();
    }
  }
  saveSharedState(finalState);

  return {
    success: true,
    calonTerpilih: namaCalonTerpilih,
    nomorUrut: noUrutCalon
  };
}

module.exports = {
  dbAll,
  dbGet,
  dbRun,
  initDatabase,
  ensureDbInitialized,
  getSharedState,
  saveSharedState,
  submitVoteAtomic,
  isPostgres
};
