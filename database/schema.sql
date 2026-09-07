-- ==========================================================
-- SKEMA DATABASE E-VOTING BPD DESA BANYUBIRU
-- Periode 2027-2034
-- Kompatibel: SQLite & PostgreSQL
-- ==========================================================

-- 1. TABEL WILAYAH / DUSUN
CREATE TABLE IF NOT EXISTS wilayah (
    id INTEGER PRIMARY KEY,
    nama_wilayah VARCHAR(100) NOT NULL,
    jadwal VARCHAR(150) NOT NULL,
    lokasi VARCHAR(200) NOT NULL
);

-- 2. TABEL CALON ANGGOTA BPD
CREATE TABLE IF NOT EXISTS calon (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    wilayah_id INTEGER NOT NULL,
    nomor_urut INTEGER NOT NULL,
    nama VARCHAR(150) NOT NULL,
    foto VARCHAR(255) DEFAULT '',
    visi_misi TEXT DEFAULT '',
    FOREIGN KEY (wilayah_id) REFERENCES wilayah (id) ON DELETE CASCADE,
    UNIQUE (wilayah_id, nomor_urut)
);

-- 3. TABEL PEMILIH & TOKEN VALIDASI
CREATE TABLE IF NOT EXISTS pemilih (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    kode_pemilih VARCHAR(50) NOT NULL UNIQUE,
    wilayah_id INTEGER NOT NULL,
    nama_pemilih VARCHAR(150) DEFAULT '',
    sudah_memilih INTEGER DEFAULT 0 CHECK(sudah_memilih IN (0, 1)),
    waktu_memilih DATETIME DEFAULT NULL,
    FOREIGN KEY (wilayah_id) REFERENCES wilayah (id) ON DELETE CASCADE
);

-- 4. TABEL SUARA MASUK (ATOMIC & ANONYMIZED VIA UNIQUE TOKEN HASH)
CREATE TABLE IF NOT EXISTS suara (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    wilayah_id INTEGER NOT NULL,
    calon_id INTEGER NOT NULL,
    waktu DATETIME DEFAULT CURRENT_TIMESTAMP,
    kode_pemilih_hash VARCHAR(64) NOT NULL UNIQUE,
    FOREIGN KEY (wilayah_id) REFERENCES wilayah (id) ON DELETE CASCADE,
    FOREIGN KEY (calon_id) REFERENCES calon (id) ON DELETE CASCADE
);

-- 5. TABEL ADMINISTRATOR PANITIA
CREATE TABLE IF NOT EXISTS admin (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 6. TABEL PENGATURAN STATUS PEMILIHAN (LOCK DATA)
CREATE TABLE IF NOT EXISTS pengaturan (
    kunci VARCHAR(50) PRIMARY KEY,
    nilai VARCHAR(255) NOT NULL
);

-- Indeks untuk kecepatan query dan integritas
CREATE INDEX IF NOT EXISTS idx_calon_wilayah ON calon(wilayah_id);
CREATE INDEX IF NOT EXISTS idx_pemilih_kode ON pemilih(kode_pemilih);
CREATE INDEX IF NOT EXISTS idx_pemilih_wilayah ON pemilih(wilayah_id);
CREATE INDEX IF NOT EXISTS idx_suara_wilayah ON suara(wilayah_id);
CREATE INDEX IF NOT EXISTS idx_suara_calon ON suara(calon_id);
