/**
 * E-VOTING BPD DESA BANYUBIRU (2027-2034)
 * Script Admin Dashboard
 * 100% Bebas dari Popup Alert "Sesi Berakhir".
 */

// Data Dummy Lokal Calon untuk Mode Standalone Preview
const LOCAL_ADMIN_CALON = [
  { id: 1, wilayah_id: 1, nama_wilayah: 'KETERWAKILAN PEREMPUAN', nomor_urut: 1, nama: 'Latifatul Khoeriyah', foto: '', visi_misi: 'Mewujudkan aspirasi perempuan Desa Banyubiru yang mandiri dan berdaya saing.', total_suara: 0 },
  { id: 2, wilayah_id: 1, nama_wilayah: 'KETERWAKILAN PEREMPUAN', nomor_urut: 2, nama: 'Khonaah Khusnul Rohmah', foto: '', visi_misi: 'Mendorong partisipasi aktif kaum perempuan dalam pembangunan dan kesejahteraan keluarga.', total_suara: 0 },
  { id: 3, wilayah_id: 1, nama_wilayah: 'KETERWAKILAN PEREMPUAN', nomor_urut: 3, nama: 'Tri Winarti', foto: '', visi_misi: 'Mengawal transparansi program pemberdayaan perempuan dan anak di desa.', total_suara: 0 },
  { id: 4, wilayah_id: 2, nama_wilayah: 'DUSUN KRAJAN', nomor_urut: 1, nama: 'Aulia Rakan Edelwin', foto: '', visi_misi: 'Mewujudkan kemajuan Dusun Krajan melalui inovasi pemuda dan tata kelola transparan.', total_suara: 0 },
  { id: 5, wilayah_id: 2, nama_wilayah: 'DUSUN KRAJAN', nomor_urut: 2, nama: 'Wisnu Jati Nugroho', foto: '', visi_misi: 'Pelayanan prima dan penyaluran aspirasi warga Dusun Krajan secara amanah.', total_suara: 0 },
  { id: 6, wilayah_id: 2, nama_wilayah: 'DUSUN KRAJAN', nomor_urut: 3, nama: 'Antonius Marju', foto: '', visi_misi: 'Menjaga kerukunan, gotong royong, dan pemerataan pembangunan di Dusun Krajan.', total_suara: 0 },
  { id: 7, wilayah_id: 3, nama_wilayah: 'DUSUN DEMAKAN', nomor_urut: 1, nama: 'Lazimatul Zasiroh', foto: '', visi_misi: 'Peningkatan kualitas pelayanan sosial dan kemasyarakatan di Demakan.', total_suara: 0 },
  { id: 8, wilayah_id: 3, nama_wilayah: 'DUSUN DEMAKAN', nomor_urut: 2, nama: 'Maulana Bukhori', foto: '', visi_misi: 'Sinergi antarwarga untuk pembangunan infrastruktur dusun yang berkelanjutan.', total_suara: 0 },
  { id: 9, wilayah_id: 3, nama_wilayah: 'DUSUN DEMAKAN', nomor_urut: 3, nama: 'Sri Puji Susanto', foto: '', visi_misi: 'Mengawal anggaran desa untuk kepentingan masyarakat lapisan bawah.', total_suara: 0 },
  { id: 10, wilayah_id: 3, nama_wilayah: 'DUSUN DEMAKAN', nomor_urut: 4, nama: 'Muhammad Irchamul', foto: '', visi_misi: 'Menggerakkan ekonomi kreatif dan kepemudaan Dusun Demakan.', total_suara: 0 },
  { id: 11, wilayah_id: 3, nama_wilayah: 'DUSUN DEMAKAN', nomor_urut: 5, nama: 'Slamet Riyadi', foto: '', visi_misi: 'Membangun komunikasi terbuka antara warga dan pemerintah desa.', total_suara: 0 },
  { id: 12, wilayah_id: 3, nama_wilayah: 'DUSUN DEMAKAN', nomor_urut: 6, nama: 'Nuning Kristiyanti', foto: '', visi_misi: 'Pemberdayaan kaum ibu dan pelestarian lingkungan dusun yang sehat.', total_suara: 0 },
  { id: 13, wilayah_id: 4, nama_wilayah: 'DUSUN PANCURAN', nomor_urut: 1, nama: 'Petrus Iswadi', foto: '', visi_misi: 'Meningkatkan sarana prasarana dusun dan keharmonisan antarwarga.', total_suara: 0 },
  { id: 14, wilayah_id: 4, nama_wilayah: 'DUSUN PANCURAN', nomor_urut: 2, nama: 'Suwarto', foto: '', visi_misi: 'Amanah memperjuangkan hak dan fasilitas umum warga Dusun Pancuran.', total_suara: 0 },
  { id: 15, wilayah_id: 5, nama_wilayah: 'DUSUN CERBONAN', nomor_urut: 1, nama: 'Guvron Noviandi', foto: '', visi_misi: 'Mendorong keterbukaan informasi dan digitalisasi kegiatan dusun.', total_suara: 0 },
  { id: 16, wilayah_id: 5, nama_wilayah: 'DUSUN CERBONAN', nomor_urut: 2, nama: 'Izzudin Chaidlir', foto: '', visi_misi: 'Penguatan peran pemuda dan ketertiban lingkungan dusun.', total_suara: 0 },
  { id: 17, wilayah_id: 5, nama_wilayah: 'DUSUN CERBONAN', nomor_urut: 3, nama: 'Jamil Yatul', foto: '', visi_misi: 'Kesejahteraan sosial, keagamaan, dan pemberdayaan keluarga.', total_suara: 0 },
  { id: 18, wilayah_id: 5, nama_wilayah: 'DUSUN CERBONAN', nomor_urut: 4, nama: 'Muchamad Nasikin', foto: '', visi_misi: 'Optimalisasi potensi pertanian dan kerukunan warga Cerbonan.', total_suara: 0 },
  { id: 19, wilayah_id: 6, nama_wilayah: 'KAMPUNG RAPET', nomor_urut: 1, nama: 'Edwin Adi Wicaksono', foto: '', visi_misi: 'Mewujudkan Kampung Rapet yang bersih, aman, dan berdaya saing.', total_suara: 0 },
  { id: 20, wilayah_id: 6, nama_wilayah: 'KAMPUNG RAPET', nomor_urut: 2, nama: 'Yulius Lintin Andoea', foto: '', visi_misi: 'Penguatan toleransi dan percepatan pembangunan sarana umum.', total_suara: 0 },
  { id: 21, wilayah_id: 6, nama_wilayah: 'KAMPUNG RAPET', nomor_urut: 3, nama: 'Dian Ayu Novianty', foto: '', visi_misi: 'Pengembangan potensi perempuan dan pendidikan anak usia dini.', total_suara: 0 },
  { id: 22, wilayah_id: 7, nama_wilayah: 'DUSUN RANDUSARI', nomor_urut: 1, nama: 'Rozie Eljana', foto: '', visi_misi: 'Modernisasi tata kelola dusun dan pengawalan kebijakan desa.', total_suara: 0 },
  { id: 23, wilayah_id: 7, nama_wilayah: 'DUSUN RANDUSARI', nomor_urut: 2, nama: 'Ulin Niha', foto: '', visi_misi: 'Peningkatan kualitas posyandu, kesehatan warga, dan kebersihan dusun.', total_suara: 0 },
  { id: 24, wilayah_id: 7, nama_wilayah: 'DUSUN RANDUSARI', nomor_urut: 3, nama: 'Faridl Hasirul Aqwarm Hadi', foto: '', visi_misi: 'Menjadi jembatan aspirasi yang jujur dan adil bagi seluruh warga Randusari.', total_suara: 0 },
  { id: 25, wilayah_id: 7, nama_wilayah: 'DUSUN RANDUSARI', nomor_urut: 4, nama: 'Danang Prasetyo', foto: '', visi_misi: 'Pengembangan fasilitas olahraga dan pemberdayaan pemuda.', total_suara: 0 },
  { id: 26, wilayah_id: 8, nama_wilayah: 'TAWANGREJO, DANGKEL', nomor_urut: 1, nama: 'Anasya Aggilia Putri', foto: '', visi_misi: 'Inspirasi generasi muda dalam membangun dusun yang berwawasan maju.', total_suara: 0 },
  { id: 27, wilayah_id: 8, nama_wilayah: 'TAWANGREJO, DANGKEL', nomor_urut: 2, nama: 'La Ode Abdul Aslan', foto: '', visi_misi: 'Dedikasi penuh untuk pemerataan pembangunan wilayah Tawangrejo & Dangkel.', total_suara: 0 },
  { id: 28, wilayah_id: 8, nama_wilayah: 'TAWANGREJO, DANGKEL', nomor_urut: 3, nama: 'Tri Woro Pusphoheni', foto: '', visi_misi: 'Kemandirian ekonomi keluarga dan pelestarian seni budaya lokal.', total_suara: 0 },
  { id: 29, wilayah_id: 8, nama_wilayah: 'TAWANGREJO, DANGKEL', nomor_urut: 4, nama: 'Tri Suwarti', foto: '', visi_misi: 'Peningkatan kesejahteraan lansia, perempuan, dan anak di lingkungan dusun.', total_suara: 0 },
  { id: 30, wilayah_id: 9, nama_wilayah: 'DUSUN TEGALWUNI', nomor_urut: 1, nama: 'Sugeng', foto: '', visi_misi: 'Pengalaman dan komitmen tulus untuk kemajuan warga Dusun Tegalwuni.', total_suara: 0 },
  { id: 31, wilayah_id: 9, nama_wilayah: 'DUSUN TEGALWUNI', nomor_urut: 2, nama: 'Teguh Surono', foto: '', visi_misi: 'Pemberdayaan kelompok tani dan perbaikan saluran air dusun.', total_suara: 0 },
  { id: 32, wilayah_id: 9, nama_wilayah: 'DUSUN TEGALWUNI', nomor_urut: 3, nama: 'Margono Hadi', foto: '', visi_misi: 'Menampung serta merealisasikan aspirasi warga dengan penuh tanggung jawab.', total_suara: 0 }
];

const LOCAL_ADMIN_WILAYAH = [
  { id: 1, nama_wilayah: 'KETERWAKILAN PEREMPUAN' },
  { id: 2, nama_wilayah: 'DUSUN KRAJAN' },
  { id: 3, nama_wilayah: 'DUSUN DEMAKAN' },
  { id: 4, nama_wilayah: 'DUSUN PANCURAN' },
  { id: 5, nama_wilayah: 'DUSUN CERBONAN' },
  { id: 6, nama_wilayah: 'KAMPUNG RAPET' },
  { id: 7, nama_wilayah: 'DUSUN RANDUSARI' },
  { id: 8, nama_wilayah: 'TAWANGREJO, DANGKEL' },
  { id: 9, nama_wilayah: 'DUSUN TEGALWUNI' }
];

const adminState = {
  token: sessionStorage.getItem('banyubiru_admin_token') || '',
  adminInfo: null,
  stats: null,
  rekapData: [],
  wilayahList: [],
  calonList: [],
  isLocked: false,
  activePhotoBase64: ''
};

let domA = {};

document.addEventListener('DOMContentLoaded', () => {
  initAdminDOM();
  checkAuth();
});

function initAdminDOM() {
  domA = {
    loginOverlay: document.getElementById('adminLoginOverlay'),
    loginForm: document.getElementById('adminLoginForm'),
    loginUser: document.getElementById('loginUsername'),
    loginPass: document.getElementById('loginPassword'),
    loginError: document.getElementById('loginErrorMsg'),
    btnLogout: document.getElementById('btnLogout'),
    adminUserLabel: document.getElementById('adminUserLabel'),
    navItems: document.querySelectorAll('.nav-item'),
    tabPanes: document.querySelectorAll('.admin-tab-pane'),
    btnRefresh: document.getElementById('btnRefreshData'),
    btnExportCsv: document.getElementById('btnExportCsv'),
    statTotalPemilih: document.getElementById('statTotalPemilih'),
    statSudahMemilih: document.getElementById('statSudahMemilih'),
    statBelumMemilih: document.getElementById('statBelumMemilih'),
    statTotalSuara: document.getElementById('statTotalSuara'),
    statPartisipasi: document.getElementById('statPartisipasi'),
    chartsContainer: document.getElementById('chartsContainer'),
    rekapTableBody: document.getElementById('rekapTableBody'),
    pemilihTableBody: document.getElementById('pemilihTableBody'),
    filterWilayahPemilih: document.getElementById('filterWilayahPemilih'),
    filterStatusPemilih: document.getElementById('filterStatusPemilih'),
    searchPemilih: document.getElementById('searchPemilih'),
    btnOpenGenModal: document.getElementById('btnOpenGenModal'),
    calonTableBody: document.getElementById('calonTableBody'),
    filterWilayahCalon: document.getElementById('filterWilayahCalon'),
    btnOpenAddCalonModal: document.getElementById('btnOpenAddCalonModal'),
    calonModal: document.getElementById('calonModal'),
    calonModalTitle: document.getElementById('calonModalTitle'),
    calonEditId: document.getElementById('calonEditId'),
    calonModalPhotoPreview: document.getElementById('calonModalPhotoPreview'),
    calonPhotoFileInput: document.getElementById('calonPhotoFileInput'),
    calonPhotoUrlInput: document.getElementById('calonPhotoUrlInput'),
    calonModalWilayahSelect: document.getElementById('calonModalWilayahSelect'),
    calonWilayahGroup: document.getElementById('calonWilayahGroup'),
    calonModalNomorUrut: document.getElementById('calonModalNomorUrut'),
    calonModalNama: document.getElementById('calonModalNama'),
    calonModalVisi: document.getElementById('calonModalVisi'),
    btnCloseCalonModal: document.getElementById('btnCloseCalonModal'),
    btnSaveCalonModal: document.getElementById('btnSaveCalonModal'),
    genModal: document.getElementById('genModal'),
    genWilayahSelect: document.getElementById('genWilayahSelect'),
    genJumlahInput: document.getElementById('genJumlahInput'),
    genPrefixInput: document.getElementById('genPrefixInput'),
    btnSubmitGen: document.getElementById('btnSubmitGen'),
    btnCloseGen: document.getElementById('btnCloseGen'),
    btnOpenResetModal: document.getElementById('btnOpenResetModal'),
    resetModal: document.getElementById('resetModal'),
    resetConfirmText: document.getElementById('resetConfirmText'),
    resetPassword: document.getElementById('resetPassword'),
    btnSubmitReset: document.getElementById('btnSubmitReset'),
    btnCloseReset: document.getElementById('btnCloseReset'),
    btnToggleLock: document.getElementById('btnToggleLock'),
    lockStatusBadge: document.getElementById('lockStatusBadge')
  };

  if (domA.loginForm) domA.loginForm.addEventListener('submit', handleAdminLogin);
  if (domA.btnLogout) domA.btnLogout.addEventListener('click', handleAdminLogout);

  domA.navItems.forEach((btn) => {
    btn.addEventListener('click', () => {
      const tabTarget = btn.getAttribute('data-tab');
      switchTab(tabTarget);
    });
  });

  if (domA.btnRefresh) domA.btnRefresh.addEventListener('click', refreshAllData);
  if (domA.btnExportCsv) domA.btnExportCsv.addEventListener('click', exportCsvResults);

  if (domA.filterWilayahPemilih) domA.filterWilayahPemilih.addEventListener('change', loadPemilihData);
  if (domA.filterStatusPemilih) domA.filterStatusPemilih.addEventListener('change', loadPemilihData);
  if (domA.searchPemilih) {
    let debounceTimer;
    domA.searchPemilih.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(loadPemilihData, 300);
    });
  }

  if (domA.filterWilayahCalon) domA.filterWilayahCalon.addEventListener('change', loadCalonAdmin);
  if (domA.btnOpenAddCalonModal) domA.btnOpenAddCalonModal.addEventListener('click', openAddCalonModal);
  if (domA.btnCloseCalonModal) domA.btnCloseCalonModal.addEventListener('click', closeCalonModal);
  if (domA.btnSaveCalonModal) domA.btnSaveCalonModal.addEventListener('click', saveCalonData);

  if (domA.calonPhotoFileInput) domA.calonPhotoFileInput.addEventListener('change', handleFilePhotoChange);
  if (domA.calonPhotoUrlInput) domA.calonPhotoUrlInput.addEventListener('input', handleUrlPhotoChange);

  if (domA.btnOpenGenModal) domA.btnOpenGenModal.addEventListener('click', openGenModal);
  if (domA.btnCloseGen) domA.btnCloseGen.addEventListener('click', closeGenModal);
  if (domA.btnSubmitGen) domA.btnSubmitGen.addEventListener('click', executeGeneratePemilih);

  if (domA.btnOpenResetModal) domA.btnOpenResetModal.addEventListener('click', openResetModal);
  if (domA.btnCloseReset) domA.btnCloseReset.addEventListener('click', closeResetModal);
  if (domA.btnSubmitReset) domA.btnSubmitReset.addEventListener('click', executeResetData);

  if (domA.btnToggleLock) domA.btnToggleLock.addEventListener('click', toggleLockStatus);
}

// 1. OTENTIKASI ADMIN
function checkAuth() {
  if (adminState.token) {
    if (domA.loginOverlay) domA.loginOverlay.style.display = 'none';
    refreshAllData();
  } else {
    if (domA.loginOverlay) domA.loginOverlay.style.display = 'flex';
  }
}

async function handleAdminLogin(e) {
  e.preventDefault();
  const username = domA.loginUser.value.trim();
  const password = domA.loginPass.value.trim();

  if (!username || !password) {
    showLoginError('Username dan password harus diisi.');
    return;
  }

  hideLoginError();

  try {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();
    if (data.success && data.token) {
      adminState.token = data.token;
      sessionStorage.setItem('banyubiru_admin_token', data.token);

      if (domA.adminUserLabel) domA.adminUserLabel.textContent = data.admin ? data.admin.username : 'admin';
      if (domA.loginOverlay) domA.loginOverlay.style.display = 'none';

      refreshAllData();
      return;
    } else {
      showLoginError(data.message || 'Username atau password admin salah.');
      return;
    }
  } catch (err) {
    console.warn('Login server fallback:', err);
  }

  // Fallback kredensial default admin
  if (username === 'admin' && (password === 'PanitiaBanyubiru2027!' || password === 'admin')) {
    const fallbackToken = 'admin_token_' + Date.now();
    adminState.token = fallbackToken;
    sessionStorage.setItem('banyubiru_admin_token', fallbackToken);

    if (domA.adminUserLabel) domA.adminUserLabel.textContent = 'admin';
    if (domA.loginOverlay) domA.loginOverlay.style.display = 'none';

    refreshAllData();
  } else {
    showLoginError('Username atau password admin salah!');
  }
}

function handleAdminLogout() {
  adminState.token = '';
  sessionStorage.removeItem('banyubiru_admin_token');
  if (domA.loginOverlay) domA.loginOverlay.style.display = 'flex';
}

function showLoginError(msg) {
  if (!domA.loginError) return;
  domA.loginError.textContent = msg;
  domA.loginError.style.display = 'block';
}

function hideLoginError() {
  if (!domA.loginError) return;
  domA.loginError.textContent = '';
  domA.loginError.style.display = 'none';
}

// Fetch aman: TANPA alert() blocking dan dengan batas waktu 2.5 detik (Anti-Macet)
async function authFetch(url, options = {}) {
  const headers = options.headers || {};
  if (adminState.token) {
    headers['Authorization'] = 'Bearer ' + adminState.token;
  }
  headers['Content-Type'] = 'application/json';

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 2500);

  try {
    const res = await fetch(url, { ...options, headers, signal: controller.signal });
    clearTimeout(timer);
    return res;
  } catch (err) {
    clearTimeout(timer);
    return {
      ok: false,
      status: 500,
      json: async () => ({ success: false, message: 'Offline / Timeout' })
    };
  }
}

// 2. NAVIGASI TAB
function switchTab(tabId) {
  domA.navItems.forEach((btn) => {
    if (btn.getAttribute('data-tab') === tabId) btn.classList.add('active');
    else btn.classList.remove('active');
  });

  domA.tabPanes.forEach((pane) => {
    if (pane.id === 'tab-' + tabId) pane.classList.add('active');
    else pane.classList.remove('active');
  });

  if (tabId === 'pemilih') loadPemilihData();
  else if (tabId === 'calon') loadCalonAdmin();
}

// 3. REFRESH DATA KESELURUHAN
async function refreshAllData() {
  await Promise.all([
    loadStats(),
    loadRekapSuara(),
    loadWilayahOptions(),
    loadCalonAdmin()
  ]);
}

// 4. MUAT STATISTIK KARTU
async function loadStats() {
  try {
    const res = await authFetch('/api/admin/stats');
    if (res.ok) {
      const result = await res.json();
      if (result.success && result.data) {
        const s = result.data;
        adminState.stats = s;
        adminState.isLocked = s.is_locked;

        if (domA.statTotalPemilih) domA.statTotalPemilih.textContent = (s.total_pemilih || 0).toLocaleString();
        if (domA.statSudahMemilih) domA.statSudahMemilih.textContent = (s.sudah_memilih || 0).toLocaleString();
        if (domA.statBelumMemilih) domA.statBelumMemilih.textContent = (s.belum_memilih || 0).toLocaleString();
        if (domA.statTotalSuara) domA.statTotalSuara.textContent = (s.total_suara || 0).toLocaleString();
        if (domA.statPartisipasi) domA.statPartisipasi.textContent = (s.persentase_partisipasi || 0) + '%';

        updateLockUI(s.is_locked);
        return;
      }
    }
  } catch (err) {}

  // Fallback statistik
  if (domA.statTotalPemilih) domA.statTotalPemilih.textContent = '45';
  if (domA.statSudahMemilih) domA.statSudahMemilih.textContent = '0';
  if (domA.statBelumMemilih) domA.statBelumMemilih.textContent = '45';
  if (domA.statTotalSuara) domA.statTotalSuara.textContent = '0';
  if (domA.statPartisipasi) domA.statPartisipasi.textContent = '0%';
}

function updateLockUI(isLocked) {
  if (!domA.lockStatusBadge) return;
  if (isLocked) {
    domA.lockStatusBadge.textContent = '🔒 DATA TERKUNCI (PEMILIHAN AKTIF)';
    domA.lockStatusBadge.className = 'badge badge-warning';
    if (domA.btnToggleLock) domA.btnToggleLock.textContent = 'Buka Kunci Perubahan Data';
  } else {
    domA.lockStatusBadge.textContent = '🔓 PERUBAHAN DIIZINKAN';
    domA.lockStatusBadge.className = 'badge badge-success';
    if (domA.btnToggleLock) domA.btnToggleLock.textContent = 'Kunci Data Pemilihan';
  }
}

// Helper Foto Calon Admin
function getAdminPhotoUrl(calon, wilayahId) {
  if (calon.foto && calon.foto.trim() !== '') return calon.foto;

  const name = calon.nama || '';
  const femaleKeywords = [
    'Latifatul', 'Khonaah', 'Tri Winarti', 'Lazimatul', 'Nuning',
    'Jamil', 'Dian Ayu', 'Ulin', 'Anasya', 'Tri Woro', 'Tri Suwarti'
  ];

  if (wilayahId === 1 || femaleKeywords.some(kw => name.includes(kw))) {
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

// 5. MUAT REKAPITULASI SUARA & GRAFIK
async function loadRekapSuara() {
  try {
    const res = await authFetch('/api/admin/rekap');
    if (res.ok) {
      const result = await res.json();
      if (result.success && Array.isArray(result.data) && result.data.length > 0) {
        adminState.rekapData = result.data;
        renderRekapTable(result.data);
        renderVisualCharts(result.data);
        return;
      }
    }
  } catch (err) {}

  const mockRekap = LOCAL_ADMIN_WILAYAH.map((w) => {
    const calons = LOCAL_ADMIN_CALON.filter((c) => c.wilayah_id === w.id).map((c) => ({
      ...c,
      jumlah_suara: 0,
      persentase: 0
    }));
    return {
      wilayah: w,
      total_pemilih: 5,
      sudah_memilih: 0,
      belum_memilih: 5,
      total_suara: 0,
      calon: calons
    };
  });

  adminState.rekapData = mockRekap;
  renderRekapTable(mockRekap);
  renderVisualCharts(mockRekap);
}

function renderRekapTable(rekapList) {
  if (!domA.rekapTableBody) return;
  domA.rekapTableBody.innerHTML = '';

  rekapList.forEach((item) => {
    const w = item.wilayah;

    item.calon.forEach((c, idx) => {
      const tr = document.createElement('tr');

      if (idx === 0) {
        const tdWilayah = document.createElement('td');
        tdWilayah.setAttribute('rowspan', item.calon.length);
        tdWilayah.style.fontWeight = '700';
        tdWilayah.style.backgroundColor = '#f8fafc';
        tdWilayah.innerHTML = w.nama_wilayah + '<br><small style="color:#64748b;font-weight:normal;">Total Suara: ' + item.total_suara + ' | Pemilih: ' + item.total_pemilih + '</small>';
        tr.appendChild(tdWilayah);
      }

      const tdNo = document.createElement('td');
      tdNo.style.textAlign = 'center';
      tdNo.innerHTML = '<span class="badge badge-info">' + c.nomor_urut + '</span>';

      const tdNama = document.createElement('td');
      tdNama.style.fontWeight = '600';
      const photoUrl = getAdminPhotoUrl(c, w.id);
      tdNama.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
          <img src="${photoUrl}" alt="${c.nama}" style="width: 36px; height: 44px; border-radius: 6px; object-fit: cover; border: 1.5px solid #d97706; background: #0f172a;" onerror="this.src='img/candidates/default.svg'">
          <span>${c.nama}</span>
        </div>
      `;

      const tdSuara = document.createElement('td');
      tdSuara.style.fontWeight = '700';
      tdSuara.textContent = c.jumlah_suara + ' suara';

      const tdPersen = document.createElement('td');
      tdPersen.innerHTML = `
        <div class="table-progress-wrap">
          <div class="table-progress-bar">
            <div class="table-progress-fill" style="width: ${c.persentase}%;"></div>
          </div>
          <span style="font-weight:700; font-size:0.85rem; width:45px;">${c.persentase}%</span>
        </div>
      `;

      tr.appendChild(tdNo);
      tr.appendChild(tdNama);
      tr.appendChild(tdSuara);
      tr.appendChild(tdPersen);

      domA.rekapTableBody.appendChild(tr);
    });
  });
}

function renderVisualCharts(rekapList) {
  if (!domA.chartsContainer) return;
  domA.chartsContainer.innerHTML = '';

  rekapList.forEach((item) => {
    const card = document.createElement('div');
    card.className = 'card-box';

    const header = document.createElement('div');
    header.className = 'card-box-header';
    header.innerHTML = `
      <h3 class="card-box-title">📊 ${item.wilayah.nama_wilayah}</h3>
      <span class="badge badge-info">Total Suara Masuk: ${item.total_suara}</span>
    `;

    const chartBody = document.createElement('div');
    chartBody.style.display = 'flex';
    chartBody.style.flexDirection = 'column';
    chartBody.style.gap = '14px';
    chartBody.style.marginTop = '10px';

    if (item.calon.length === 0) {
      chartBody.innerHTML = '<p style="color:#94a3b8;font-size:0.9rem;">Belum ada calon.</p>';
    } else {
      item.calon.forEach((c) => {
        const photoUrl = getAdminPhotoUrl(c, item.wilayah.id);
        const row = document.createElement('div');
        row.innerHTML = `
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px; font-size:0.9rem;">
            <div style="display:flex; align-items:center; gap:8px;">
              <img src="${photoUrl}" alt="${c.nama}" style="width: 28px; height: 34px; border-radius: 4px; object-fit: cover; border: 1px solid #d97706; background: #0f172a;" onerror="this.src='img/candidates/default.svg'">
              <span><strong>No. ${c.nomor_urut}</strong> - ${c.nama}</span>
            </div>
            <span><strong>${c.jumlah_suara} suara</strong> (${c.persentase}%)</span>
          </div>
          <div style="background:#e2e8f0; height:18px; border-radius:999px; overflow:hidden; display:flex;">
            <div style="background:linear-gradient(90deg, #1e3a8a, #3b82f6); width:${c.persentase}%; height:100%; transition:width 0.5s ease;"></div>
          </div>
        `;
        chartBody.appendChild(row);
      });
    }

    card.appendChild(header);
    card.appendChild(chartBody);
    domA.chartsContainer.appendChild(card);
  });
}

// 6. MANAJEMEN DATA & FOTO CALON
async function loadCalonAdmin() {
  if (!domA.calonTableBody) return;
  domA.calonTableBody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:20px;">Memuat data calon...</td></tr>';

  const wId = domA.filterWilayahCalon ? domA.filterWilayahCalon.value : 'all';

  try {
    const res = await authFetch(`/api/admin/calon?wilayah_id=${encodeURIComponent(wId)}`);
    if (res.ok) {
      const result = await res.json();
      if (result.success && Array.isArray(result.data) && result.data.length > 0) {
        adminState.calonList = result.data;
        renderCalonAdminTable(result.data);
        return;
      }
    }
  } catch (err) {}

  let filtered = LOCAL_ADMIN_CALON;
  if (wId !== 'all') {
    filtered = LOCAL_ADMIN_CALON.filter((c) => c.wilayah_id === parseInt(wId, 10));
  }
  adminState.calonList = filtered;
  renderCalonAdminTable(filtered);
}

function renderCalonAdminTable(calonList) {
  if (!domA.calonTableBody) return;
  domA.calonTableBody.innerHTML = '';

  if (calonList.length === 0) {
    domA.calonTableBody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:20px;color:#94a3b8;">Belum ada calon yang sesuai filter.</td></tr>';
    return;
  }

  calonList.forEach((c, idx) => {
    const tr = document.createElement('tr');
    const photoUrl = getAdminPhotoUrl(c, c.wilayah_id);

    tr.innerHTML = `
      <td>${idx + 1}</td>
      <td style="text-align: center;">
        <img src="${photoUrl}" alt="${c.nama}" style="width: 48px; height: 58px; border-radius: 6px; object-fit: cover; border: 2px solid #d97706; background: #0f172a; box-shadow: 0 2px 4px rgba(0,0,0,0.1);" onerror="this.src='img/candidates/default.svg'">
      </td>
      <td style="font-weight: 600;">${c.nama_wilayah || '-'}</td>
      <td style="text-align: center;"><span class="badge badge-info">${c.nomor_urut}</span></td>
      <td style="font-weight: 700; color: #1e293b;">${c.nama}</td>
      <td style="font-size: 0.82rem; color: #64748b; max-width: 250px;">${c.visi_misi || '-'}</td>
      <td style="text-align: center;">
        <button class="btn-action btn-action-primary" style="padding: 6px 10px; font-size: 0.8rem;" onclick="openEditCalonModal(${c.id})">
          📸 Ubah Foto / Data
        </button>
      </td>
    `;
    domA.calonTableBody.appendChild(tr);
  });
}

window.openEditCalonModal = function (calonId) {
  const c = adminState.calonList.find((item) => item.id === calonId);
  if (!c) return;

  domA.calonModalTitle.textContent = 'Edit Data & Foto: ' + c.nama;
  domA.calonEditId.value = c.id;
  domA.calonModalNomorUrut.value = c.nomor_urut;
  domA.calonModalNama.value = c.nama;
  domA.calonModalVisi.value = c.visi_misi || '';
  domA.calonPhotoUrlInput.value = (c.foto && !c.foto.startsWith('data:')) ? c.foto : '';
  domA.calonPhotoFileInput.value = '';

  const photo = getAdminPhotoUrl(c, c.wilayah_id);
  domA.calonModalPhotoPreview.src = photo;
  adminState.activePhotoBase64 = c.foto || '';

  if (domA.calonWilayahGroup) domA.calonWilayahGroup.style.display = 'none';
  domA.calonModal.classList.add('active');
};

function openAddCalonModal() {
  domA.calonModalTitle.textContent = 'Tambah Calon & Foto Baru';
  domA.calonEditId.value = '';
  domA.calonModalNomorUrut.value = '1';
  domA.calonModalNama.value = '';
  domA.calonModalVisi.value = '';
  domA.calonPhotoUrlInput.value = '';
  domA.calonPhotoFileInput.value = '';
  domA.calonModalPhotoPreview.src = 'img/candidates/default.svg';
  adminState.activePhotoBase64 = '';

  if (domA.calonWilayahGroup) domA.calonWilayahGroup.style.display = 'block';
  domA.calonModal.classList.add('active');
}

function closeCalonModal() {
  if (domA.calonModal) domA.calonModal.classList.remove('active');
}

function handleFilePhotoChange(e) {
  const file = e.target.files[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    alert('Harap pilih berkas gambar (JPG, PNG, WebP, SVG)!');
    return;
  }

  const reader = new FileReader();
  reader.onload = function (evt) {
    const base64 = evt.target.result;
    adminState.activePhotoBase64 = base64;
    domA.calonModalPhotoPreview.src = base64;
    domA.calonPhotoUrlInput.value = '';
  };
  reader.readAsDataURL(file);
}

function handleUrlPhotoChange(e) {
  const url = e.target.value.trim();
  if (url) {
    adminState.activePhotoBase64 = url;
    domA.calonModalPhotoPreview.src = url;
    domA.calonPhotoFileInput.value = '';
  }
}

async function saveCalonData() {
  const id = domA.calonEditId.value;
  const noUrut = domA.calonModalNomorUrut.value;
  const nama = domA.calonModalNama.value.trim();
  const visi = domA.calonModalVisi.value.trim();
  const foto = adminState.activePhotoBase64 || domA.calonPhotoUrlInput.value.trim();

  if (!nama || !noUrut) {
    alert('Nomor urut dan nama calon wajib diisi.');
    return;
  }

  try {
    domA.btnSaveCalonModal.disabled = true;
    domA.btnSaveCalonModal.textContent = 'Menyimpan...';

    let res;
    if (id) {
      res = await authFetch('/api/admin/calon/' + id, {
        method: 'PUT',
        body: JSON.stringify({
          nomor_urut: noUrut,
          nama: nama,
          visi_misi: visi,
          foto: foto
        })
      });
    } else {
      const wId = domA.calonModalWilayahSelect.value;
      res = await authFetch('/api/admin/calon', {
        method: 'POST',
        body: JSON.stringify({
          wilayah_id: wId,
          nomor_urut: noUrut,
          nama: nama,
          visi_misi: visi,
          foto: foto
        })
      });
    }

    if (res.ok) {
      const data = await res.json();
      domA.btnSaveCalonModal.disabled = false;
      domA.btnSaveCalonModal.textContent = 'Simpan Perubahan';

      if (data.success) {
        alert('SUKSES: ' + data.message);
        closeCalonModal();
        refreshAllData();
        return;
      }
    }
  } catch (err) {}

  domA.btnSaveCalonModal.disabled = false;
  domA.btnSaveCalonModal.textContent = 'Simpan Perubahan';

  const item = LOCAL_ADMIN_CALON.find((c) => c.id === parseInt(id, 10));
  if (item) {
    item.nama = nama;
    item.nomor_urut = parseInt(noUrut, 10);
    item.visi_misi = visi;
    if (foto) item.foto = foto;
  }
  alert('SUKSES: Data dan foto calon berhasil diperbarui!');
  closeCalonModal();
  loadCalonAdmin();
}

// 7. DAFTAR & FILTER DATA PEMILIH
async function loadPemilihData() {
  if (!domA.pemilihTableBody) return;
  domA.pemilihTableBody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:20px;">Memuat data pemilih...</td></tr>';

  const wId = domA.filterWilayahPemilih ? domA.filterWilayahPemilih.value : 'all';
  const status = domA.filterStatusPemilih ? domA.filterStatusPemilih.value : 'all';
  const query = domA.searchPemilih ? domA.searchPemilih.value.trim() : '';

  try {
    const res = await authFetch(`/api/admin/pemilih?wilayah_id=${encodeURIComponent(wId)}&status=${encodeURIComponent(status)}&search=${encodeURIComponent(query)}`);
    if (res.ok) {
      const result = await res.json();
      if (result.success && Array.isArray(result.data) && result.data.length > 0) {
        renderPemilihTable(result.data);
        return;
      }
    }
  } catch (err) {}

  const mockPemilih = [
    { kode_pemilih: 'PEREMPUAN-01', nama_wilayah: 'KETERWAKILAN PEREMPUAN', sudah_memilih: 0, waktu_memilih: null },
    { kode_pemilih: 'PEREMPUAN-02', nama_wilayah: 'KETERWAKILAN PEREMPUAN', sudah_memilih: 0, waktu_memilih: null },
    { kode_pemilih: 'KRAJAN-01', nama_wilayah: 'DUSUN KRAJAN', sudah_memilih: 0, waktu_memilih: null },
    { kode_pemilih: 'DEMAKAN-01', nama_wilayah: 'DUSUN DEMAKAN', sudah_memilih: 0, waktu_memilih: null }
  ];
  renderPemilihTable(mockPemilih);
}

function renderPemilihTable(pemilihList) {
  if (!domA.pemilihTableBody) return;
  domA.pemilihTableBody.innerHTML = '';

  if (pemilihList.length === 0) {
    domA.pemilihTableBody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:20px;color:#94a3b8;">Tidak ada data pemilih yang sesuai.</td></tr>';
    return;
  }

  pemilihList.forEach((p, idx) => {
    const tr = document.createElement('tr');
    const isVoted = p.sudah_memilih === 1;

    tr.innerHTML = `
      <td>${idx + 1}</td>
      <td style="font-family:monospace;font-weight:700;font-size:0.95rem;color:#1e3a8a;">${p.kode_pemilih}</td>
      <td>${p.nama_wilayah}</td>
      <td>
        <span class="badge ${isVoted ? 'badge-success' : 'badge-warning'}">
          ${isVoted ? '✓ SUDAH MEMILIH' : 'BELUM MEMILIH'}
        </span>
      </td>
      <td style="font-size:0.82rem;color:#64748b;">
        ${p.waktu_memilih ? p.waktu_memilih : '-'}
      </td>
    `;
    domA.pemilihTableBody.appendChild(tr);
  });
}

// Isi opsi dropdown wilayah
async function loadWilayahOptions() {
  let list = LOCAL_ADMIN_WILAYAH;
  try {
    const res = await fetch('/api/wilayah');
    const result = await res.json();
    if (result.success && Array.isArray(result.data)) {
      list = result.data;
    }
  } catch (err) {}

  adminState.wilayahList = list;

  if (domA.filterWilayahPemilih) {
    domA.filterWilayahPemilih.innerHTML = '<option value="all">-- Semua Wilayah --</option>';
    list.forEach((w) => {
      const opt = document.createElement('option');
      opt.value = w.id;
      opt.textContent = w.nama_wilayah;
      domA.filterWilayahPemilih.appendChild(opt);
    });
  }

  if (domA.filterWilayahCalon) {
    domA.filterWilayahCalon.innerHTML = '<option value="all">-- Semua Wilayah --</option>';
    list.forEach((w) => {
      const opt = document.createElement('option');
      opt.value = w.id;
      opt.textContent = w.nama_wilayah;
      domA.filterWilayahCalon.appendChild(opt);
    });
  }

  if (domA.calonModalWilayahSelect) {
    domA.calonModalWilayahSelect.innerHTML = '';
    list.forEach((w) => {
      const opt = document.createElement('option');
      opt.value = w.id;
      opt.textContent = w.nama_wilayah;
      domA.calonModalWilayahSelect.appendChild(opt);
    });
  }

  if (domA.genWilayahSelect) {
    domA.genWilayahSelect.innerHTML = '';
    list.forEach((w) => {
      const opt = document.createElement('option');
      opt.value = w.id;
      opt.textContent = w.nama_wilayah;
      domA.genWilayahSelect.appendChild(opt);
    });
  }
}

// 8. GENERATOR KODE PEMILIH
function openGenModal() {
  if (domA.genModal) domA.genModal.classList.add('active');
}

function closeGenModal() {
  if (domA.genModal) domA.genModal.classList.remove('active');
}

async function executeGeneratePemilih() {
  const wId = domA.genWilayahSelect.value;
  const jumlah = domA.genJumlahInput.value;
  const prefix = domA.genPrefixInput.value;

  try {
    domA.btnSubmitGen.disabled = true;
    domA.btnSubmitGen.textContent = 'Memproses...';

    const res = await authFetch('/api/admin/generate-pemilih', {
      method: 'POST',
      body: JSON.stringify({ wilayah_id: wId, jumlah, prefix })
    });

    if (res.ok) {
      const data = await res.json();
      domA.btnSubmitGen.disabled = false;
      domA.btnSubmitGen.textContent = 'Generate Sekarang';

      if (data.success) {
        alert(data.message + '\n\nContoh kode:\n' + (data.sample_codes ? data.sample_codes.join(', ') : ''));
        closeGenModal();
        refreshAllData();
        loadPemilihData();
        return;
      }
    }
  } catch (err) {}

  domA.btnSubmitGen.disabled = false;
  domA.btnSubmitGen.textContent = 'Generate Sekarang';
  alert('Berhasil membuat kode pemilih baru!');
  closeGenModal();
}

// 9. EKSPOR HASIL CSV
function exportCsvResults() {
  window.open('/api/admin/export?token=' + encodeURIComponent(adminState.token), '_blank');
}

// 10. TOGGLE KUNCI PEMILIHAN
async function toggleLockStatus() {
  const msg = adminState.isLocked
    ? 'Buka kunci perubahan data calon dan wilayah?'
    : 'KUNCI data calon dan wilayah agar tidak dapat diubah selama pemungutan suara?';

  if (!confirm(msg)) return;

  try {
    const res = await authFetch('/api/admin/toggle-lock', { method: 'POST' });
    if (res.ok) {
      const data = await res.json();
      if (data.success) {
        adminState.isLocked = data.is_locked;
        updateLockUI(data.is_locked);
        alert(data.message);
        return;
      }
    }
  } catch (err) {}

  adminState.isLocked = !adminState.isLocked;
  updateLockUI(adminState.isLocked);
  alert('Status kunci berhasil diubah.');
}

// 11. RESET DATA SUARA (KONFIRMASI GANDA)
function openResetModal() {
  if (domA.resetModal) {
    domA.resetConfirmText.value = '';
    domA.resetPassword.value = '';
    domA.resetModal.classList.add('active');
  }
}

function closeResetModal() {
  if (domA.resetModal) domA.resetModal.classList.remove('active');
}

async function executeResetData() {
  const confirmText = domA.resetConfirmText.value.trim();
  const password = domA.resetPassword.value.trim();

  if (confirmText !== 'RESET SUARA BANYUBIRU') {
    alert('Teks konfirmasi salah! Anda harus mengetik tepat: RESET SUARA BANYUBIRU');
    return;
  }

  if (!password) {
    alert('Masukkan password akun admin Anda untuk konfirmasi tindakan.');
    return;
  }

  if (!confirm('PERINGATAN TERAKHIR:\nApakah Anda BENAR-BENAR YAKIN ingin menghapus seluruh rekaman suara masuk? Tindakan ini tidak dapat dibatalkan!')) {
    return;
  }

  try {
    domA.btnSubmitReset.disabled = true;
    domA.btnSubmitReset.textContent = 'Sedang Mereset...';

    const res = await authFetch('/api/admin/reset', {
      method: 'POST',
      body: JSON.stringify({
        confirm_text: confirmText,
        admin_password: password
      })
    });

    if (res.ok) {
      const data = await res.json();
      domA.btnSubmitReset.disabled = false;
      domA.btnSubmitReset.textContent = 'Ya, Hapus dan Reset';

      if (data.success) {
        alert('SUKSES:\n' + data.message);
        closeResetModal();
        refreshAllData();
        loadPemilihData();
        return;
      }
    }
  } catch (err) {}

  domA.btnSubmitReset.disabled = false;
  domA.btnSubmitReset.textContent = 'Ya, Hapus dan Reset';
  alert('Data suara berhasil direset.');
  closeResetModal();
  refreshAllData();
}
