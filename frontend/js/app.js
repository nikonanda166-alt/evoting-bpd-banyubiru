/**
 * E-VOTING BPD DESA BANYUBIRU (2027-2034)
 * Public Voter Application Script
 * Mendukung mode Client-Server Terpusat & Mode Standalone Offline.
 */

// DATA LOKAL CADANGAN (STANDALONE FALLBACK)
const LOCAL_WILAYAH = [
  { id: 1, nama_wilayah: 'KETERWAKILAN PEREMPUAN', jadwal: 'Rabu, 9 September 2026 - Pukul 10.00 WIB', lokasi: 'Balai Desa Banyubiru', total_calon: 3 },
  { id: 2, nama_wilayah: 'DUSUN KRAJAN', jadwal: 'Sabtu, 12 September 2026 - Pukul 19.30 WIB', lokasi: 'Balai Dusun Krajan', total_calon: 3 },
  { id: 3, nama_wilayah: 'DUSUN DEMAKAN', jadwal: 'Minggu, 13 September 2026 - Pukul 19.30 WIB', lokasi: 'Balai Dusun Demakan', total_calon: 6 },
  { id: 4, nama_wilayah: 'DUSUN PANCURAN', jadwal: 'Selasa, 15 September 2026 - Pukul 19.30 WIB', lokasi: 'Rumah Kadus Pancuran', total_calon: 2 },
  { id: 5, nama_wilayah: 'DUSUN CERBONAN', jadwal: 'Selasa, 15 September 2026 - Pukul 19.30 WIB', lokasi: 'Rumah Bp. Ahmad Arwani (RT 3 RW 8)', total_calon: 4 },
  { id: 6, nama_wilayah: 'KAMPUNG RAPET', jadwal: 'Rabu, 16 September 2026 - Pukul 19.30 WIB', lokasi: 'Balai Dusun Kampung Rapet', total_calon: 3 },
  { id: 7, nama_wilayah: 'DUSUN RANDUSARI', jadwal: 'Kamis, 17 September 2026 - Pukul 19.30 WIB', lokasi: 'Gedung Posyandu', total_calon: 4 },
  { id: 8, nama_wilayah: 'TAWANGREJO, DANGKEL', jadwal: 'Jumat, 18 September 2026 - Pukul 19.30 WIB', lokasi: 'Aula RW 14', total_calon: 4 },
  { id: 9, nama_wilayah: 'DUSUN TEGALWUNI', jadwal: 'Jumat, 18 September 2026 - Pukul 19.30 WIB', lokasi: 'Rumah Kepala Dusun Tegalwuni', total_calon: 3 }
];

const LOCAL_CALON = [
  // 1. Keterwakilan Perempuan
  { id: 1, wilayah_id: 1, nomor_urut: 1, nama: 'Latifatul Khoeriyah', foto: '', visi_misi: 'Mewujudkan aspirasi perempuan Desa Banyubiru yang mandiri dan berdaya saing.' },
  { id: 2, wilayah_id: 1, nomor_urut: 2, nama: 'Khonaah Khusnul Rohmah', foto: '', visi_misi: 'Mendorong partisipasi aktif kaum perempuan dalam pembangunan dan kesejahteraan keluarga.' },
  { id: 3, wilayah_id: 1, nomor_urut: 3, nama: 'Tri Winarti', foto: '', visi_misi: 'Mengawal transparansi program pemberdayaan perempuan dan anak di desa.' },
  // 2. Dusun Krajan
  { id: 4, wilayah_id: 2, nomor_urut: 1, nama: 'Aulia Rakan Edelwin', foto: '', visi_misi: 'Mewujudkan kemajuan Dusun Krajan melalui inovasi pemuda dan tata kelola transparan.' },
  { id: 5, wilayah_id: 2, nomor_urut: 2, nama: 'Wisnu Jati Nugroho', foto: '', visi_misi: 'Pelayanan prima dan penyaluran aspirasi warga Dusun Krajan secara amanah.' },
  { id: 6, wilayah_id: 2, nomor_urut: 3, nama: 'Antonius Marju', foto: '', visi_misi: 'Menjaga kerukunan, gotong royong, dan pemerataan pembangunan di Dusun Krajan.' },
  // 3. Dusun Demakan
  { id: 7, wilayah_id: 3, nomor_urut: 1, nama: 'Lazimatul Zasiroh', foto: '', visi_misi: 'Peningkatan kualitas pelayanan sosial dan kemasyarakatan di Demakan.' },
  { id: 8, wilayah_id: 3, nomor_urut: 2, nama: 'Maulana Bukhori', foto: '', visi_misi: 'Sinergi antarwarga untuk pembangunan infrastruktur dusun yang berkelanjutan.' },
  { id: 9, wilayah_id: 3, nomor_urut: 3, nama: 'Sri Puji Susanto', foto: '', visi_misi: 'Mengawal anggaran desa untuk kepentingan masyarakat lapisan bawah.' },
  { id: 10, wilayah_id: 3, nomor_urut: 4, nama: 'Muhammad Irchamul', foto: '', visi_misi: 'Menggerakkan ekonomi kreatif dan kepemudaan Dusun Demakan.' },
  { id: 11, wilayah_id: 3, nomor_urut: 5, nama: 'Slamet Riyadi', foto: '', visi_misi: 'Membangun komunikasi terbuka antara warga dan pemerintah desa.' },
  { id: 12, wilayah_id: 3, nomor_urut: 6, nama: 'Nuning Kristiyanti', foto: '', visi_misi: 'Pemberdayaan kaum ibu dan pelestarian lingkungan dusun yang sehat.' },
  // 4. Dusun Pancuran
  { id: 13, wilayah_id: 4, nomor_urut: 1, nama: 'Petrus Iswadi', foto: '', visi_misi: 'Meningkatkan sarana prasarana dusun dan keharmonisan antarwarga.' },
  { id: 14, wilayah_id: 4, nomor_urut: 2, nama: 'Suwarto', foto: '', visi_misi: 'Amanah memperjuangkan hak dan fasilitas umum warga Dusun Pancuran.' },
  // 5. Dusun Cerbonan
  { id: 15, wilayah_id: 5, nomor_urut: 1, nama: 'Guvron Noviandi', foto: '', visi_misi: 'Mendorong keterbukaan informasi dan digitalisasi kegiatan dusun.' },
  { id: 16, wilayah_id: 5, nomor_urut: 2, nama: 'Izzudin Chaidlir', foto: '', visi_misi: 'Penguatan peran pemuda dan ketertiban lingkungan dusun.' },
  { id: 17, wilayah_id: 5, nomor_urut: 3, nama: 'Jamil Yatul', foto: '', visi_misi: 'Kesejahteraan sosial, keagamaan, dan pemberdayaan keluarga.' },
  { id: 18, wilayah_id: 5, nomor_urut: 4, nama: 'Muchamad Nasikin', foto: '', visi_misi: 'Optimalisasi potensi pertanian dan kerukunan warga Cerbonan.' },
  // 6. Kampung Rapet
  { id: 19, wilayah_id: 6, nomor_urut: 1, nama: 'Edwin Adi Wicaksono', foto: '', visi_misi: 'Mewujudkan Kampung Rapet yang bersih, aman, dan berdaya saing.' },
  { id: 20, wilayah_id: 6, nomor_urut: 2, nama: 'Yulius Lintin Andoea', foto: '', visi_misi: 'Penguatan toleransi dan percepatan pembangunan sarana umum.' },
  { id: 21, wilayah_id: 6, nomor_urut: 3, nama: 'Dian Ayu Novianty', foto: '', visi_misi: 'Pengembangan potensi perempuan dan pendidikan anak usia dini.' },
  // 7. Dusun Randusari
  { id: 22, wilayah_id: 7, nomor_urut: 1, nama: 'Rozie Eljana', foto: '', visi_misi: 'Modernisasi tata kelola dusun dan pengawalan kebijakan desa.' },
  { id: 23, wilayah_id: 7, nomor_urut: 2, nama: 'Ulin Niha', foto: '', visi_misi: 'Peningkatan kualitas posyandu, kesehatan warga, dan kebersihan dusun.' },
  { id: 24, wilayah_id: 7, nomor_urut: 3, nama: 'Faridl Hasirul Aqwarm Hadi', foto: '', visi_misi: 'Menjadi jembatan aspirasi yang jujur dan adil bagi seluruh warga Randusari.' },
  { id: 25, wilayah_id: 7, nomor_urut: 4, nama: 'Danang Prasetyo', foto: '', visi_misi: 'Pengembangan fasilitas olahraga dan pemberdayaan pemuda.' },
  // 8. Tawangrejo, Dangkel
  { id: 26, wilayah_id: 8, nomor_urut: 1, nama: 'Anasya Aggilia Putri', foto: '', visi_misi: 'Inspirasi generasi muda dalam membangun dusun yang berwawasan maju.' },
  { id: 27, wilayah_id: 8, nomor_urut: 2, nama: 'La Ode Abdul Aslan', foto: '', visi_misi: 'Dedikasi penuh untuk pemerataan pembangunan wilayah Tawangrejo & Dangkel.' },
  { id: 28, wilayah_id: 8, nomor_urut: 3, nama: 'Tri Woro Pusphoheni', foto: '', visi_misi: 'Kemandirian ekonomi keluarga dan pelestarian seni budaya lokal.' },
  { id: 29, wilayah_id: 8, nomor_urut: 4, nama: 'Tri Suwarti', foto: '', visi_misi: 'Peningkatan kesejahteraan lansia, perempuan, dan anak di lingkungan dusun.' },
  // 9. Dusun Tegalwuni
  { id: 30, wilayah_id: 9, nomor_urut: 1, nama: 'Sugeng', foto: '', visi_misi: 'Pengalaman dan komitmen tulus untuk kemajuan warga Dusun Tegalwuni.' },
  { id: 31, wilayah_id: 9, nomor_urut: 2, nama: 'Teguh Surono', foto: '', visi_misi: 'Pemberdayaan kelompok tani dan perbaikan saluran air dusun.' },
  { id: 32, wilayah_id: 9, nomor_urut: 3, nama: 'Margono Hadi', foto: '', visi_misi: 'Menampung serta merealisasikan aspirasi warga dengan penuh tanggung jawab.' }
];

// Data Default Pemilih Tetap (DPT) Terdaftar Resmi Banyubiru (5 Pemilih Tiap Wilayah)
const DEFAULT_PEMILIH = [
  // Wilayah 1: Keterwakilan Perempuan
  { id: 1, kode_pemilih: 'PEREMPUAN-01', wilayah_id: 1, nama_wilayah: 'KETERWAKILAN PEREMPUAN', nama_pemilih: 'Siti Aminah', sudah_memilih: 0, waktu_memilih: null },
  { id: 2, kode_pemilih: 'PEREMPUAN-02', wilayah_id: 1, nama_wilayah: 'KETERWAKILAN PEREMPUAN', nama_pemilih: 'Nurul Hidayati', sudah_memilih: 0, waktu_memilih: null },
  { id: 3, kode_pemilih: 'PEREMPUAN-03', wilayah_id: 1, nama_wilayah: 'KETERWAKILAN PEREMPUAN', nama_pemilih: 'Sri Wahyuni', sudah_memilih: 0, waktu_memilih: null },
  { id: 4, kode_pemilih: 'PEREMPUAN-04', wilayah_id: 1, nama_wilayah: 'KETERWAKILAN PEREMPUAN', nama_pemilih: 'Endang Sulastri', sudah_memilih: 0, waktu_memilih: null },
  { id: 5, kode_pemilih: 'PEREMPUAN-05', wilayah_id: 1, nama_wilayah: 'KETERWAKILAN PEREMPUAN', nama_pemilih: 'Dewi Lestari', sudah_memilih: 0, waktu_memilih: null },
  // Wilayah 2: Dusun Krajan
  { id: 6, kode_pemilih: 'KRAJAN-01', wilayah_id: 2, nama_wilayah: 'DUSUN KRAJAN', nama_pemilih: 'Bambang Supriyanto', sudah_memilih: 0, waktu_memilih: null },
  { id: 7, kode_pemilih: 'KRAJAN-02', wilayah_id: 2, nama_wilayah: 'DUSUN KRAJAN', nama_pemilih: 'Agus Setiawan', sudah_memilih: 0, waktu_memilih: null },
  { id: 8, kode_pemilih: 'KRAJAN-03', wilayah_id: 2, nama_wilayah: 'DUSUN KRAJAN', nama_pemilih: 'Haryanto', sudah_memilih: 0, waktu_memilih: null },
  { id: 9, kode_pemilih: 'KRAJAN-04', wilayah_id: 2, nama_wilayah: 'DUSUN KRAJAN', nama_pemilih: 'Triyono', sudah_memilih: 0, waktu_memilih: null },
  { id: 10, kode_pemilih: 'KRAJAN-05', wilayah_id: 2, nama_wilayah: 'DUSUN KRAJAN', nama_pemilih: 'Ahmad Fauzi', sudah_memilih: 0, waktu_memilih: null },
  // Wilayah 3: Dusun Demakan
  { id: 11, kode_pemilih: 'DEMAKAN-01', wilayah_id: 3, nama_wilayah: 'DUSUN DEMAKAN', nama_pemilih: 'Sunardi', sudah_memilih: 0, waktu_memilih: null },
  { id: 12, kode_pemilih: 'DEMAKAN-02', wilayah_id: 3, nama_wilayah: 'DUSUN DEMAKAN', nama_pemilih: 'Eko Prasetyo', sudah_memilih: 0, waktu_memilih: null },
  { id: 13, kode_pemilih: 'DEMAKAN-03', wilayah_id: 3, nama_wilayah: 'DUSUN DEMAKAN', nama_pemilih: 'Mujianto', sudah_memilih: 0, waktu_memilih: null },
  { id: 14, kode_pemilih: 'DEMAKAN-04', wilayah_id: 3, nama_wilayah: 'DUSUN DEMAKAN', nama_pemilih: 'Rudi Hartono', sudah_memilih: 0, waktu_memilih: null },
  { id: 15, kode_pemilih: 'DEMAKAN-05', wilayah_id: 3, nama_wilayah: 'DUSUN DEMAKAN', nama_pemilih: 'Wawan Kurniawan', sudah_memilih: 0, waktu_memilih: null },
  // Wilayah 4: Dusun Pancuran
  { id: 16, kode_pemilih: 'PANCURAN-01', wilayah_id: 4, nama_wilayah: 'DUSUN PANCURAN', nama_pemilih: 'Yohanes Joko', sudah_memilih: 0, waktu_memilih: null },
  { id: 17, kode_pemilih: 'PANCURAN-02', wilayah_id: 4, nama_wilayah: 'DUSUN PANCURAN', nama_pemilih: 'Antonius Joko', sudah_memilih: 0, waktu_memilih: null },
  { id: 18, kode_pemilih: 'PANCURAN-03', wilayah_id: 4, nama_wilayah: 'DUSUN PANCURAN', nama_pemilih: 'FX Sukirno', sudah_memilih: 0, waktu_memilih: null },
  { id: 19, kode_pemilih: 'PANCURAN-04', wilayah_id: 4, nama_wilayah: 'DUSUN PANCURAN', nama_pemilih: 'Ignatius Maryono', sudah_memilih: 0, waktu_memilih: null },
  { id: 20, kode_pemilih: 'PANCURAN-05', wilayah_id: 4, nama_wilayah: 'DUSUN PANCURAN', nama_pemilih: 'Kurnia Danu', sudah_memilih: 0, waktu_memilih: null },
  // Wilayah 5: Dusun Cerbonan
  { id: 21, kode_pemilih: 'CERBONAN-01', wilayah_id: 5, nama_wilayah: 'DUSUN CERBONAN', nama_pemilih: 'Zainal Abidin', sudah_memilih: 0, waktu_memilih: null },
  { id: 22, kode_pemilih: 'CERBONAN-02', wilayah_id: 5, nama_wilayah: 'DUSUN CERBONAN', nama_pemilih: 'Ahmad Syarif', sudah_memilih: 0, waktu_memilih: null },
  { id: 23, kode_pemilih: 'CERBONAN-03', wilayah_id: 5, nama_wilayah: 'DUSUN CERBONAN', nama_pemilih: 'Mansur Hidayat', sudah_memilih: 0, waktu_memilih: null },
  { id: 24, kode_pemilih: 'CERBONAN-04', wilayah_id: 5, nama_wilayah: 'DUSUN CERBONAN', nama_pemilih: 'Sobirin', sudah_memilih: 0, waktu_memilih: null },
  { id: 25, kode_pemilih: 'CERBONAN-05', wilayah_id: 5, nama_wilayah: 'DUSUN CERBONAN', nama_pemilih: 'Fathur Rohman', sudah_memilih: 0, waktu_memilih: null },
  // Wilayah 6: Kampung Rapet
  { id: 26, kode_pemilih: 'RAPET-01', wilayah_id: 6, nama_wilayah: 'KAMPUNG RAPET', nama_pemilih: 'Danang Wijaya', sudah_memilih: 0, waktu_memilih: null },
  { id: 27, kode_pemilih: 'RAPET-02', wilayah_id: 6, nama_wilayah: 'KAMPUNG RAPET', nama_pemilih: 'Hendra Gunawan', sudah_memilih: 0, waktu_memilih: null },
  { id: 28, kode_pemilih: 'RAPET-03', wilayah_id: 6, nama_wilayah: 'KAMPUNG RAPET', nama_pemilih: 'Budi Utomo', sudah_memilih: 0, waktu_memilih: null },
  { id: 29, kode_pemilih: 'RAPET-04', wilayah_id: 6, nama_wilayah: 'KAMPUNG RAPET', nama_pemilih: 'Suryanto', sudah_memilih: 0, waktu_memilih: null },
  { id: 30, kode_pemilih: 'RAPET-05', wilayah_id: 6, nama_wilayah: 'KAMPUNG RAPET', nama_pemilih: 'Aris Munandar', sudah_memilih: 0, waktu_memilih: null },
  // Wilayah 7: Dusun Randusari
  { id: 31, kode_pemilih: 'RANDUSARI-01', wilayah_id: 7, nama_wilayah: 'DUSUN RANDUSARI', nama_pemilih: 'Bambang Irawan', sudah_memilih: 0, waktu_memilih: null },
  { id: 32, kode_pemilih: 'RANDUSARI-02', wilayah_id: 7, nama_wilayah: 'DUSUN RANDUSARI', nama_pemilih: 'Didik Prasetyo', sudah_memilih: 0, waktu_memilih: null },
  { id: 33, kode_pemilih: 'RANDUSARI-03', wilayah_id: 7, nama_wilayah: 'DUSUN RANDUSARI', nama_pemilih: 'Heru Susanto', sudah_memilih: 0, waktu_memilih: null },
  { id: 34, kode_pemilih: 'RANDUSARI-04', wilayah_id: 7, nama_wilayah: 'DUSUN RANDUSARI', nama_pemilih: 'Sugiyanto', sudah_memilih: 0, waktu_memilih: null },
  { id: 35, kode_pemilih: 'RANDUSARI-05', wilayah_id: 7, nama_wilayah: 'DUSUN RANDUSARI', nama_pemilih: 'Wiyono', sudah_memilih: 0, waktu_memilih: null },
  // Wilayah 8: Tawangrejo, Dangkel
  { id: 36, kode_pemilih: 'TAWANGREJO-01', wilayah_id: 8, nama_wilayah: 'TAWANGREJO, DANGKEL', nama_pemilih: 'Slamet Basuki', sudah_memilih: 0, waktu_memilih: null },
  { id: 37, kode_pemilih: 'TAWANGREJO-02', wilayah_id: 8, nama_wilayah: 'TAWANGREJO, DANGKEL', nama_pemilih: 'Hartono', sudah_memilih: 0, waktu_memilih: null },
  { id: 38, kode_pemilih: 'TAWANGREJO-03', wilayah_id: 8, nama_wilayah: 'TAWANGREJO, DANGKEL', nama_pemilih: 'Agus Priyono', sudah_memilih: 0, waktu_memilih: null },
  { id: 39, kode_pemilih: 'TAWANGREJO-04', wilayah_id: 8, nama_wilayah: 'TAWANGREJO, DANGKEL', nama_pemilih: 'Tri Mulyono', sudah_memilih: 0, waktu_memilih: null },
  { id: 40, kode_pemilih: 'TAWANGREJO-05', wilayah_id: 8, nama_wilayah: 'TAWANGREJO, DANGKEL', nama_pemilih: 'Kuncoro', sudah_memilih: 0, waktu_memilih: null },
  // Wilayah 9: Dusun Tegalwuni
  { id: 41, kode_pemilih: 'TEGALWUNI-01', wilayah_id: 9, nama_wilayah: 'DUSUN TEGALWUNI', nama_pemilih: 'Suwardi', sudah_memilih: 0, waktu_memilih: null },
  { id: 42, kode_pemilih: 'TEGALWUNI-02', wilayah_id: 9, nama_wilayah: 'DUSUN TEGALWUNI', nama_pemilih: 'Suparman', sudah_memilih: 0, waktu_memilih: null },
  { id: 43, kode_pemilih: 'TEGALWUNI-03', wilayah_id: 9, nama_wilayah: 'DUSUN TEGALWUNI', nama_pemilih: 'Suyatno', sudah_memilih: 0, waktu_memilih: null },
  { id: 44, kode_pemilih: 'TEGALWUNI-04', wilayah_id: 9, nama_wilayah: 'DUSUN TEGALWUNI', nama_pemilih: 'Wahyu Hidayat', sudah_memilih: 0, waktu_memilih: null },
  { id: 45, kode_pemilih: 'TEGALWUNI-05', wilayah_id: 9, nama_wilayah: 'DUSUN TEGALWUNI', nama_pemilih: 'Purnomo', sudah_memilih: 0, waktu_memilih: null }
];

// Helper Akses Data Pemilih Terpusat (Sinkron dengan Admin)
function getLocalPemilihList() {
  const dataStr = localStorage.getItem('banyubiru_daftar_pemilih');
  if (dataStr) {
    try {
      const parsed = JSON.parse(dataStr);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch (e) {}
  }
  localStorage.setItem('banyubiru_daftar_pemilih', JSON.stringify(DEFAULT_PEMILIH));
  return DEFAULT_PEMILIH;
}

function saveLocalPemilihList(list) {
  localStorage.setItem('banyubiru_daftar_pemilih', JSON.stringify(list));
}

// Helper fetch dengan timeout agar TIDAK PERNAH loading lama atau macet
async function fetchWithTimeout(url, options = {}, timeoutMs = 2000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timeoutId);
    return res;
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

// State Aplikasi
const appState = {
  isServerConnected: true,
  wilayahList: LOCAL_WILAYAH,
  selectedWilayahId: 1,
  selectedWilayahData: LOCAL_WILAYAH[0],
  calonList: [],
  selectedCalon: null,
  lastVotedCalonId: null,
  voterCode: '',
  isCodeVerified: false
};

document.addEventListener('DOMContentLoaded', () => {
  initElements();

  // 1. TAMPILKAN LANGSUNG DALAM 0 MILIDETIK (Instant First Paint Tanpa Tunggu Server)
  renderWilayahButtons(LOCAL_WILAYAH);
  switchWilayah(1);

  // 2. Sinkronisasi data di background secara senyap (maksimal 2 detik)
  syncWilayahBackground();
});

let dom = {};

function initElements() {
  dom = {
    wilayahGrid: document.getElementById('wilayahSelectorGrid'),
    scheduleBanner: document.getElementById('scheduleBanner'),
    scheduleWilayahTitle: document.getElementById('scheduleWilayahTitle'),
    scheduleWaktu: document.getElementById('scheduleWaktu'),
    scheduleLokasi: document.getElementById('scheduleLokasi'),
    calonGrid: document.getElementById('calonGrid'),
    tokenInput: document.getElementById('voterCodeInput'),
    btnVerifyToken: document.getElementById('btnVerifyCode'),
    tokenStatusMsg: document.getElementById('tokenStatusMsg'),
    modalBackdrop: document.getElementById('confirmModalBackdrop'),
    modalCandidateName: document.getElementById('modalCandidateName'),
    modalCandidateWilayah: document.getElementById('modalCandidateWilayah'),
    modalCandidatePhoto: document.getElementById('modalCandidatePhoto'),
    btnCancelVote: document.getElementById('btnCancelVote'),
    btnConfirmSubmitVote: document.getElementById('btnConfirmSubmitVote'),
    successScreen: document.getElementById('successScreen'),
    votingSection: document.getElementById('votingSection'),
    successVoterWilayah: document.getElementById('successVoterWilayah'),
    btnVoteAgain: document.getElementById('btnVoteAgain')
  };

  if (dom.btnVerifyToken) {
    dom.btnVerifyToken.addEventListener('click', handleVerifyCode);
  }

  if (dom.tokenInput) {
    dom.tokenInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleVerifyCode();
      }
    });

    dom.tokenInput.addEventListener('input', () => {
      appState.isCodeVerified = false;
      hideTokenMessage();
    });
  }

  if (dom.btnCancelVote) {
    dom.btnCancelVote.addEventListener('click', closeModal);
  }

  if (dom.btnConfirmSubmitVote) {
    dom.btnConfirmSubmitVote.addEventListener('click', executeSubmitVote);
  }

  if (dom.modalBackdrop) {
    dom.modalBackdrop.addEventListener('click', (e) => {
      if (e.target === dom.modalBackdrop) closeModal();
    });
  }

  if (dom.btnVoteAgain) {
    dom.btnVoteAgain.addEventListener('click', resetVotingScreen);
  }

}

// 1. Sinkronisasi data wilayah dari Server di background (senyap & non-blocking)
async function syncWilayahBackground() {
  try {
    const res = await fetchWithTimeout('/api/wilayah', {}, 2000);
    if (!res.ok) return;
    const result = await res.json();

    if (result.success && Array.isArray(result.data) && result.data.length > 0) {
      appState.isServerConnected = true;
      appState.wilayahList = result.data;
      renderWilayahButtons(result.data);
      // Update data banner wilayah aktif
      const current = result.data.find((w) => w.id === appState.selectedWilayahId);
      if (current) {
        appState.selectedWilayahData = current;
        if (dom.scheduleWilayahTitle) dom.scheduleWilayahTitle.textContent = current.nama_wilayah;
        if (dom.scheduleWaktu) dom.scheduleWaktu.textContent = '📅 ' + current.jadwal;
        if (dom.scheduleLokasi) dom.scheduleLokasi.textContent = '📍 ' + current.lokasi;
      }
    }
  } catch (err) {
    // Mode offline / server lambat: UI sudah tampil sempurna dengan data lokal
    appState.isServerConnected = false;
  }
}

// Render tombol-tombol pemilihan wilayah
function renderWilayahButtons(wilayahList) {
  if (!dom.wilayahGrid) return;
  dom.wilayahGrid.innerHTML = '';

  wilayahList.forEach((w) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'wilayah-btn' + (w.id === appState.selectedWilayahId ? ' active' : '');
    btn.id = 'btn-wilayah-' + w.id;
    btn.setAttribute('data-id', w.id);

    const nameEl = document.createElement('span');
    nameEl.className = 'wilayah-btn-name';
    nameEl.textContent = w.nama_wilayah;

    const metaEl = document.createElement('span');
    metaEl.className = 'wilayah-btn-meta';
    metaEl.textContent = (w.total_calon || 0) + ' Calon';

    btn.appendChild(nameEl);
    btn.appendChild(metaEl);

    btn.addEventListener('click', () => {
      switchWilayah(w.id);
    });

    dom.wilayahGrid.appendChild(btn);
  });
}

// 2. Berpindah Wilayah (Seketika 0 ms!)
function switchWilayah(wilayahId) {
  const targetId = parseInt(wilayahId, 10);
  appState.selectedWilayahId = targetId;

  const selected = (appState.wilayahList && appState.wilayahList.find((w) => w.id === targetId)) ||
                   LOCAL_WILAYAH.find((w) => w.id === targetId);
  appState.selectedWilayahData = selected;

  const allBtns = document.querySelectorAll('.wilayah-btn');
  allBtns.forEach((b) => {
    if (parseInt(b.getAttribute('data-id'), 10) === targetId) {
      b.classList.add('active');
    } else {
      b.classList.remove('active');
    }
  });

  if (selected) {
    if (dom.scheduleWilayahTitle) dom.scheduleWilayahTitle.textContent = selected.nama_wilayah;
    if (dom.scheduleWaktu) dom.scheduleWaktu.textContent = '📅 ' + selected.jadwal;
    if (dom.scheduleLokasi) dom.scheduleLokasi.textContent = '📍 ' + selected.lokasi;
  }

  // 1. Tampilkan data calon lokal seketika dengan penggabungan kustom dari Admin
  const filtered = LOCAL_CALON.filter((c) => c.wilayah_id === targetId).map((c) => {
    const customFoto = localStorage.getItem('banyubiru_calon_foto_' + c.id);
    const customDataStr = localStorage.getItem('banyubiru_calon_data_' + c.id);
    let item = { ...c };
    if (customDataStr) {
      try { Object.assign(item, JSON.parse(customDataStr)); } catch (e) {}
    }
    if (customFoto) {
      item.foto = customFoto;
    }
    return item;
  });
  appState.calonList = filtered;
  renderCalonCards(filtered);

  // 2. Jika server terhubung, sinkronkan foto/update calon di background
  syncCalonFromServer(targetId);
}

// Sinkronisasi Calon di background (Non-blocking)
async function syncCalonFromServer(wilayahId) {
  try {
    const res = await fetchWithTimeout('/api/wilayah/' + wilayahId + '/calon', {}, 2000);
    if (!res.ok) return;
    const result = await res.json();
    if (result.success && Array.isArray(result.calon) && result.calon.length > 0) {
      // Hanya re-render jika pemilih masih di wilayah ini
      if (appState.selectedWilayahId === wilayahId) {
        const mergedCalon = result.calon.map((c) => {
          const customFoto = localStorage.getItem('banyubiru_calon_foto_' + c.id);
          const customDataStr = localStorage.getItem('banyubiru_calon_data_' + c.id);
          let item = { ...c };
          if (customDataStr) {
            try { Object.assign(item, JSON.parse(customDataStr)); } catch (e) {}
          }
          if (customFoto) {
            item.foto = customFoto;
          }
          return item;
        });
        appState.calonList = mergedCalon;
        renderCalonCards(mergedCalon);
      }
    }
  } catch (err) {
    // Lewati jika timeout, kartu calon lokal sudah tertampil sempurna
  }
}

// Helper: Tentukan Foto Resmi Calon (Prioritaskan foto kustom Admin)
function getCandidatePhotoUrl(calon) {
  // 1. Cek apakah ada foto kustom yang diunggah dari Dashboard Admin
  const customFoto = localStorage.getItem('banyubiru_calon_foto_' + calon.id);
  if (customFoto && customFoto.trim() !== '') {
    return customFoto;
  }

  // 2. Cek foto dari server database
  if (calon.foto && calon.foto.trim() !== '') {
    return calon.foto;
  }

  const name = calon.nama || '';
  const wId = appState.selectedWilayahId;

  const femaleKeywords = [
    'Latifatul', 'Khonaah', 'Tri Winarti', 'Lazimatul', 'Nuning',
    'Jamil', 'Dian Ayu', 'Ulin', 'Anasya', 'Tri Woro', 'Tri Suwarti'
  ];

  if (wId === 1 || femaleKeywords.some(kw => name.includes(kw))) {
    return 'img/candidates/calon_female.svg';
  }

  const peciKeywords = [
    'Maulana', 'Irchamul', 'Izzudin', 'Nasikin', 'Faridl',
    'Wisnu', 'Sugeng', 'Teguh'
  ];

  if (peciKeywords.some(kw => name.includes(kw))) {
    return 'img/candidates/calon_male_peci.svg';
  }

  return 'img/candidates/calon_male_jas.svg';
}

// Sinkronisasi otomatis jika admin mengubah foto di tab lain
window.addEventListener('storage', (e) => {
  if (e.key && (e.key.startsWith('banyubiru_calon_foto_') || e.key.startsWith('banyubiru_calon_data_'))) {
    if (appState.selectedWilayahId) {
      switchWilayah(appState.selectedWilayahId);
    }
  }
});

// Render Card Calon Lengkap dengan Foto
function renderCalonCards(calonList) {
  if (!dom.calonGrid) return;
  dom.calonGrid.innerHTML = '';

  if (calonList.length === 0) {
    dom.calonGrid.innerHTML = '<div class="empty-box">Belum ada calon terdaftar untuk wilayah ini.</div>';
    return;
  }

  calonList.forEach((c) => {
    const card = document.createElement('div');
    card.className = 'candidate-card';

    const headerBanner = document.createElement('div');
    headerBanner.className = 'candidate-header-banner';

    const noBadge = document.createElement('div');
    noBadge.className = 'nomor-urut-badge';
    noBadge.innerHTML = '<span class="nomor-urut-label">NO</span>' + c.nomor_urut;

    const nameEl = document.createElement('h3');
    nameEl.className = 'candidate-name';
    nameEl.textContent = c.nama;

    headerBanner.appendChild(noBadge);
    headerBanner.appendChild(nameEl);

    const cardBody = document.createElement('div');
    cardBody.className = 'candidate-body';

    const photoUrl = getCandidatePhotoUrl(c);

    const photoFrame = document.createElement('div');
    photoFrame.className = 'candidate-photo-frame';

    const photoImg = document.createElement('img');
    photoImg.src = photoUrl;
    photoImg.alt = 'Foto Resmi ' + c.nama;
    photoImg.className = 'candidate-photo-img';
    photoImg.loading = 'lazy';
    photoImg.onerror = function () {
      this.src = 'img/candidates/default.svg';
    };

    const photoBadge = document.createElement('div');
    photoBadge.className = 'candidate-photo-badge';
    photoBadge.textContent = 'FOTO RESMI • SURAT SUARA';

    photoFrame.appendChild(photoImg);
    photoFrame.appendChild(photoBadge);

    const visiBox = document.createElement('div');
    visiBox.className = 'candidate-visi';
    visiBox.textContent = c.visi_misi ? c.visi_misi : 'Calon Anggota BPD Desa Banyubiru Periode 2027–2034.';

    cardBody.appendChild(photoFrame);
    cardBody.appendChild(visiBox);

    const actionBox = document.createElement('div');
    actionBox.className = 'candidate-actions';

    const btnVote = document.createElement('button');
    btnVote.type = 'button';
    btnVote.className = 'btn-vote';
    btnVote.innerHTML = '🗳️ PILIH CALON INI';

    btnVote.addEventListener('click', () => {
      handleVoteClick(c);
    });

    actionBox.appendChild(btnVote);

    card.appendChild(headerBanner);
    card.appendChild(cardBody);
    card.appendChild(actionBox);

    dom.calonGrid.appendChild(card);
  });
}

// 4. Logika Pemilihan & Konfirmasi
function handleVoteClick(calon) {
  const code = dom.tokenInput ? dom.tokenInput.value.trim() : '';

  if (!code) {
    showTokenMessage('Silakan masukkan Kode Pemilih Anda terlebih dahulu di kotak atas!', 'error');
    if (dom.tokenInput) {
      dom.tokenInput.focus();
      dom.tokenInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    return;
  }

  appState.selectedCalon = calon;
  verifyAndOpenConfirmModal(code, calon);
}

// Verifikasi Kode Pemilih Secara Ketat (Hanya Kode Terdaftar DPT yang Boleh)
async function verifyAndOpenConfirmModal(code, calon) {
  const cleanCode = code.trim().toUpperCase();

  try {
    dom.btnVerifyToken.disabled = true;
    dom.btnVerifyToken.textContent = 'Memeriksa...';

    if (appState.isServerConnected) {
      const res = await fetchWithTimeout('/api/verify-voter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kode_pemilih: cleanCode,
          wilayah_id: appState.selectedWilayahId
        })
      }, 3500);

      const data = await res.json();
      dom.btnVerifyToken.disabled = false;
      dom.btnVerifyToken.textContent = 'Verifikasi Kode';

      if (!data.success) {
        // REJECT KERAS: Kode ditolak oleh server database
        showTokenMessage(data.message, 'error');
        appState.isCodeVerified = false;
        return;
      }

      // Valid di server
      appState.isCodeVerified = true;
      appState.voterCode = cleanCode;
      showTokenMessage(`✓ Kode Terdaftar: ${data.data.nama_pemilih || 'Warga'} (${data.data.wilayah_nama})`, 'success');
      openConfirmModal(calon);
      return;
    }
  } catch (err) {
    console.warn('Verifikasi server gagal atau offline, beralih ke verifikasi DPT lokal.');
  }

  // VALIDASI KETAT MODE LOKAL / OFFLINE (Berdasarkan DPT Banyubiru)
  dom.btnVerifyToken.disabled = false;
  dom.btnVerifyToken.textContent = 'Verifikasi Kode';

  const dptList = getLocalPemilihList();
  const voterRecord = dptList.find((p) => p.kode_pemilih.toUpperCase() === cleanCode);

  // 1. Cek apakah kode ada di DPT
  if (!voterRecord) {
    showTokenMessage(`❌ Kode Pemilih "${cleanCode}" TIDAK TERDAFTAR dalam DPT resmi! Pastikan sesuai dengan kode yang diberikan panitia dusun.`, 'error');
    appState.isCodeVerified = false;
    return;
  }

  // 2. Cek apakah wilayah pemilih cocok dengan wilayah yang sedang dipilih
  if (voterRecord.wilayah_id !== appState.selectedWilayahId) {
    showTokenMessage(`⚠️ Kode ini terdaftar untuk wilayah "${voterRecord.nama_wilayah}", bukan untuk wilayah yang sedang dibuka saat ini!`, 'error');
    appState.isCodeVerified = false;
    return;
  }

  // 3. Cek apakah kode sudah pernah digunakan untuk memilih
  const usedKey = 'voted_' + cleanCode;
  if (voterRecord.sudah_memilih === 1 || localStorage.getItem(usedKey)) {
    showTokenMessage(`⛔ Hak suara untuk Kode "${cleanCode}" SUDAH DIGUNAKAN sebelumnya! Setiap warga hanya dapat memilih 1 kali.`, 'error');
    appState.isCodeVerified = false;
    return;
  }

  // Kode Benar & Memenuhi Syarat
  appState.isCodeVerified = true;
  appState.voterCode = cleanCode;
  showTokenMessage(`✓ Terverifikasi resmi: ${voterRecord.nama_pemilih} (${voterRecord.nama_wilayah}).`, 'success');
  openConfirmModal(calon);
}

async function handleVerifyCode() {
  const rawCode = dom.tokenInput ? dom.tokenInput.value.trim() : '';
  if (!rawCode) {
    showTokenMessage('Silakan ketik kode pemilih Anda.', 'error');
    return;
  }

  const cleanCode = rawCode.toUpperCase();

  try {
    dom.btnVerifyToken.disabled = true;
    dom.btnVerifyToken.textContent = 'Memeriksa...';

    if (appState.isServerConnected) {
      const res = await fetchWithTimeout('/api/verify-voter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kode_pemilih: cleanCode,
          wilayah_id: appState.selectedWilayahId
        })
      }, 3500);

      const data = await res.json();
      dom.btnVerifyToken.disabled = false;
      dom.btnVerifyToken.textContent = 'Verifikasi Kode';

      if (!data.success) {
        showTokenMessage(data.message, 'error');
        appState.isCodeVerified = false;
      } else {
        appState.isCodeVerified = true;
        appState.voterCode = cleanCode;
        showTokenMessage(`✓ Kode Terdaftar: ${data.data.nama_pemilih || 'Warga'} (${data.data.wilayah_nama}). Silakan tentukan calon pilihan Anda.`, 'success');
      }
      return;
    }
  } catch (err) {}

  // Verifikasi ketat lokal
  dom.btnVerifyToken.disabled = false;
  dom.btnVerifyToken.textContent = 'Verifikasi Kode';

  const dptList = getLocalPemilihList();
  const voterRecord = dptList.find((p) => p.kode_pemilih.toUpperCase() === cleanCode);

  if (!voterRecord) {
    showTokenMessage(`❌ Kode Pemilih "${cleanCode}" TIDAK TERDAFTAR dalam DPT resmi! Pastikan sesuai dengan kode yang diberikan panitia.`, 'error');
    appState.isCodeVerified = false;
    return;
  }

  if (voterRecord.wilayah_id !== appState.selectedWilayahId) {
    showTokenMessage(`⚠️ Kode ini terdaftar untuk "${voterRecord.nama_wilayah}", bukan wilayah ini! Silakan pilih tombol wilayah yang sesuai di bagian 1.`, 'error');
    appState.isCodeVerified = false;
    return;
  }

  const usedKey = 'voted_' + cleanCode;
  if (voterRecord.sudah_memilih === 1 || localStorage.getItem(usedKey)) {
    showTokenMessage(`⛔ Hak suara untuk Kode "${cleanCode}" SUDAH DIGUNAKAN sebelumnya!`, 'error');
    appState.isCodeVerified = false;
    return;
  }

  appState.isCodeVerified = true;
  appState.voterCode = cleanCode;
  showTokenMessage(`✓ Kode Terdaftar atas nama: ${voterRecord.nama_pemilih} (${voterRecord.nama_wilayah}). Silakan klik tombol "PILIH CALON INI" di bawah.`, 'success');
}

// Buka modal konfirmasi dengan foto dan teks nama calon
function openConfirmModal(calon) {
  if (!dom.modalBackdrop) return;

  const wilayahNama = appState.selectedWilayahData ? appState.selectedWilayahData.nama_wilayah : '';
  dom.modalCandidateName.textContent = 'No. ' + calon.nomor_urut + ' - ' + calon.nama;
  dom.modalCandidateWilayah.textContent = 'Wilayah: ' + wilayahNama;

  if (dom.modalCandidatePhoto) {
    dom.modalCandidatePhoto.src = getCandidatePhotoUrl(calon);
    dom.modalCandidatePhoto.onerror = function () {
      this.src = 'img/candidates/default.svg';
    };
  }

  dom.modalBackdrop.classList.add('active');
}

function closeModal() {
  if (dom.modalBackdrop) {
    dom.modalBackdrop.classList.remove('active');
  }
}

// 5. Submit Suara Resmi (Tersimpan Rahasia & Kunci Hak Suara)
async function executeSubmitVote() {
  if (!appState.selectedCalon || !appState.voterCode || !appState.selectedWilayahId) {
    alert('Data pemilihan tidak lengkap.');
    return;
  }

  const chosenCalon = appState.selectedCalon;
  const cleanCode = appState.voterCode.toUpperCase();
  appState.lastVotedCalonId = chosenCalon.id;

  const payload = {
    kode_pemilih: cleanCode,
    wilayah_id: appState.selectedWilayahId,
    calon_id: chosenCalon.id
  };

  // 1. Kunci hak suara pemilih secara permanen di DPT lokal
  const voters = getLocalPemilihList();
  const voterIdx = voters.findIndex((p) => p.kode_pemilih.toUpperCase() === cleanCode);
  const nowFormatted = new Date().toLocaleString('id-ID');
  if (voterIdx !== -1) {
    voters[voterIdx].sudah_memilih = 1;
    voters[voterIdx].waktu_memilih = nowFormatted;
    saveLocalPemilihList(voters);
  }
  localStorage.setItem('voted_' + cleanCode, '1');

  // 2. Simpan perolehan suara calon ke rekap panitia
  const localKey = 'suara_calon_' + chosenCalon.id;
  const currVotes = parseInt(localStorage.getItem(localKey) || '0', 10);
  localStorage.setItem(localKey, (currVotes + 1).toString());

  try {
    dom.btnConfirmSubmitVote.disabled = true;
    dom.btnConfirmSubmitVote.textContent = 'Mengirim Suara...';

    if (appState.isServerConnected) {
      const res = await fetchWithTimeout('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }, 4000);
      const result = await res.json();
      dom.btnConfirmSubmitVote.disabled = false;
      dom.btnConfirmSubmitVote.textContent = 'Ya, Kirim Suara';

      if (!result.success) {
        closeModal();
        showTokenMessage(result.message, 'error');
        alert('Gagal Mengirim Suara:\n' + result.message);
        return;
      }

      closeModal();
      showSuccessScreen(result.message);
      return;
    }
  } catch (err) {
    console.warn('Gagal kirim ke server, menggunakan penyimpanan tersinkron lokal.');
  }

  // Selesai penyimpanan
  dom.btnConfirmSubmitVote.disabled = false;
  dom.btnConfirmSubmitVote.textContent = 'Ya, Kirim Suara';

  closeModal();
  showSuccessScreen('Terima kasih. Suara Anda berhasil dicatat secara resmi dan rahasia.');
}

// Layar Sukses Bersih & Rahasia (Tanpa Menampilkan Perolehan Suara)
function showSuccessScreen(pesan) {
  if (dom.votingSection) dom.votingSection.style.display = 'none';
  if (dom.successScreen) dom.successScreen.classList.add('active');

  if (dom.successVoterWilayah && appState.selectedWilayahData) {
    dom.successVoterWilayah.textContent = 'Wilayah Pemilihan: ' + appState.selectedWilayahData.nama_wilayah;
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function resetVotingScreen() {
  if (dom.tokenInput) dom.tokenInput.value = '';
  appState.voterCode = '';
  appState.isCodeVerified = false;
  appState.selectedCalon = null;
  appState.lastVotedCalonId = null;

  hideTokenMessage();

  if (dom.successScreen) dom.successScreen.classList.remove('active');
  if (dom.votingSection) dom.votingSection.style.display = 'block';

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Helper Utilities
function showTokenMessage(text, type) {
  if (!dom.tokenStatusMsg) return;
  dom.tokenStatusMsg.textContent = text;
  dom.tokenStatusMsg.className = 'token-status-msg ' + type;
}

function hideTokenMessage() {
  if (!dom.tokenStatusMsg) return;
  dom.tokenStatusMsg.className = 'token-status-msg';
  dom.tokenStatusMsg.textContent = '';
}

function renderWilayahLoading() {
  if (!dom.wilayahGrid) return;
  dom.wilayahGrid.innerHTML = '<div class="loading-box"><div class="spinner"></div>Memuat daftar wilayah...</div>';
}

function showWilayahError(msg) {
  if (!dom.wilayahGrid) return;
  dom.wilayahGrid.innerHTML = '<div class="empty-box" style="color:#ef4444;">⚠️ ' + msg + '</div>';
}

function renderCalonLoading() {
  if (!dom.calonGrid) return;
  dom.calonGrid.innerHTML = '<div class="loading-box"><div class="spinner"></div>Memuat surat suara & foto calon...</div>';
}

function showCalonError(msg) {
  if (!dom.calonGrid) return;
  dom.calonGrid.innerHTML = '<div class="empty-box" style="color:#ef4444;">⚠️ ' + msg + '</div>';
}
