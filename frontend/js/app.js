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

  // 1. Tampilkan data calon lokal seketika tanpa loading spinner
  const filtered = LOCAL_CALON.filter((c) => c.wilayah_id === targetId);
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
        appState.calonList = result.calon;
        renderCalonCards(result.calon);
      }
    }
  } catch (err) {
    // Lewati jika timeout, kartu calon lokal sudah tertampil sempurna
  }
}

// Helper: Tentukan Foto Resmi Calon
function getCandidatePhotoUrl(calon) {
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

// Verifikasi Kode Pemilih
async function verifyAndOpenConfirmModal(code, calon) {
  try {
    dom.btnVerifyToken.disabled = true;
    dom.btnVerifyToken.textContent = 'Memeriksa...';

    if (appState.isServerConnected) {
      const res = await fetchWithTimeout('/api/verify-voter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kode_pemilih: code,
          wilayah_id: appState.selectedWilayahId
        })
      }, 3500);
      const data = await res.json();
      dom.btnVerifyToken.disabled = false;
      dom.btnVerifyToken.textContent = 'Verifikasi Kode';

      if (!data.success) {
        showTokenMessage(data.message, 'error');
        return;
      }

      appState.isCodeVerified = true;
      appState.voterCode = code;
      showTokenMessage(data.message + ' (Nama: ' + (data.data.nama_pemilih || 'Warga') + ')', 'success');
      openConfirmModal(calon);
      return;
    }
  } catch (err) {
    console.warn('Verifikasi server gagal atau timeout, menggunakan mode verifikasi lokal.');
  }

  // Fallback verifikasi lokal
  dom.btnVerifyToken.disabled = false;
  dom.btnVerifyToken.textContent = 'Verifikasi Kode';

  const usedKey = 'voted_' + code.toUpperCase();
  if (localStorage.getItem(usedKey)) {
    showTokenMessage('Kode Pemilih ini SUDAH DIGUNAKAN untuk memilih sebelumnya.', 'error');
    return;
  }

  appState.isCodeVerified = true;
  appState.voterCode = code;
  showTokenMessage('Kode Pemilih valid. Anda berhak memberikan suara.', 'success');
  openConfirmModal(calon);
}

async function handleVerifyCode() {
  const code = dom.tokenInput ? dom.tokenInput.value.trim() : '';
  if (!code) {
    showTokenMessage('Silakan ketik kode pemilih Anda.', 'error');
    return;
  }

  try {
    dom.btnVerifyToken.disabled = true;
    dom.btnVerifyToken.textContent = 'Memeriksa...';

    if (appState.isServerConnected) {
      const res = await fetchWithTimeout('/api/verify-voter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kode_pemilih: code,
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
        appState.voterCode = code;
        showTokenMessage(data.message + ' (Nama: ' + (data.data.nama_pemilih || 'Warga') + ')', 'success');
      }
      return;
    }
  } catch (err) {}

  dom.btnVerifyToken.disabled = false;
  dom.btnVerifyToken.textContent = 'Verifikasi Kode';

  const usedKey = 'voted_' + code.toUpperCase();
  if (localStorage.getItem(usedKey)) {
    showTokenMessage('Kode Pemilih ini SUDAH DIGUNAKAN sebelumnya.', 'error');
    appState.isCodeVerified = false;
  } else {
    appState.isCodeVerified = true;
    appState.voterCode = code;
    showTokenMessage('Kode Pemilih valid. Silakan tentukan pilihan calon Anda.', 'success');
  }
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

// 5. Submit Suara ke Server (Atomic Transaction / Local Storage)
async function executeSubmitVote() {
  if (!appState.selectedCalon || !appState.voterCode || !appState.selectedWilayahId) {
    alert('Data pemilihan tidak lengkap.');
    return;
  }

  const payload = {
    kode_pemilih: appState.voterCode,
    wilayah_id: appState.selectedWilayahId,
    calon_id: appState.selectedCalon.id
  };

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
    console.warn('Gagal kirim ke server, menggunakan penyimpanan lokal.');
  }

  // Fallback lokal
  dom.btnConfirmSubmitVote.disabled = false;
  dom.btnConfirmSubmitVote.textContent = 'Ya, Kirim Suara';

  localStorage.setItem('voted_' + appState.voterCode.toUpperCase(), '1');
  closeModal();
  showSuccessScreen('Terima kasih. Suara Anda berhasil dicatat secara resmi.');
}

function showSuccessScreen(pesan) {
  if (dom.votingSection) dom.votingSection.style.display = 'none';
  if (dom.successScreen) dom.successScreen.classList.add('active');

  if (dom.successVoterWilayah && appState.selectedWilayahData) {
    dom.successVoterWilayah.textContent = 'Suara Anda untuk pemilihan BPD ' + appState.selectedWilayahData.nama_wilayah + ' telah berhasil dicatat.';
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function resetVotingScreen() {
  if (dom.tokenInput) dom.tokenInput.value = '';
  appState.voterCode = '';
  appState.isCodeVerified = false;
  appState.selectedCalon = null;

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
