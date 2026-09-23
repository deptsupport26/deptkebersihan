const API_URL = "https://script.google.com/macros/s/AKfycbxY3vUvlyDXYrYwFT9x9J7d8_PcTgrXGNAJiat2XH3l1tqLWHq8Imn_SjiP6Ey1NAH3GQ/exec";

let currentTab = 'inventaris';
let currentViewMode = 'grid';
let currentCategory = 'Semua';
let allData = { inventaris: [], jadwal: [], relawan: [] };

document.addEventListener('DOMContentLoaded', loadAllData);

async function loadAllData() {
  document.getElementById('loading').style.display = 'flex';
  document.getElementById('content').innerHTML = '';
  
  try {
    const [invRes, jadRes, relRes] = await Promise.all([
      fetch(API_URL + "?type=inventaris"),
      fetch(API_URL + "?type=jadwal"),
      fetch(API_URL + "?type=relawan")
    ]);

    const invJson = await invRes.json();
    const jadJson = await jadRes.json();
    const relJson = await relRes.json();

    allData.inventaris = invJson.data || [];
    allData.jadwal = jadJson.data || [];
    allData.relawan = relJson.data || [];

    populateRelawanDropdown(); // Isi dropdown peminjam dengan data relawan

    document.getElementById('loading').style.display = 'none';
    renderData();
  } catch (err) {
    document.getElementById('loading').innerHTML = `
      <div class="text-center py-8">
        <i class="fa-solid fa-triangle-exclamation text-2xl text-red-400 mb-2"></i>
        <p class="text-slate-600 text-xs mb-3">Gagal memuat data.</p>
        <button onclick="loadAllData()" class="bg-slate-200 text-slate-800 px-3 py-1.5 rounded-lg text-xs font-semibold">Coba Lagi</button>
      </div>`;
  }
}

function switchTab(tabName) {
  currentTab = tabName;
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('tab-active');
    btn.classList.add('tab-inactive');
  });
  const activeBtn = document.getElementById(`tab-${tabName}`);
  activeBtn.classList.remove('tab-inactive');
  activeBtn.classList.add('tab-active');

  const viewToggle = document.getElementById('viewToggleGroup');
  const catFilter = document.getElementById('categoryFilterContainer');
  if(tabName === 'inventaris') {
    viewToggle.style.display = 'flex';
    catFilter.style.display = 'flex';
  } else {
    viewToggle.style.display = 'none';
    catFilter.style.display = 'none';
  }

  document.getElementById('search').value = '';
  document.getElementById('search').placeholder = tabName === 'inventaris' ? 'Cari barang, peminjam...' : 'Cari...';
  renderData();
}

function setViewMode(mode) {
  currentViewMode = mode;
  const gridBtn = document.getElementById('btnGridView');
  const listBtn = document.getElementById('btnListView');
  
  if(mode === 'grid') {
    gridBtn.className = "px-3 py-1 rounded-lg text-xs font-bold bg-white text-sky-700 shadow-sm transition-all";
    listBtn.className = "px-3 py-1 rounded-lg text-xs font-bold text-slate-500 transition-all";
  } else {
    listBtn.className = "px-3 py-1 rounded-lg text-xs font-bold bg-white text-sky-700 shadow-sm transition-all";
    gridBtn.className = "px-3 py-1 rounded-lg text-xs font-bold text-slate-500 transition-all";
  }
  renderData();
}

function setCategory(category, el) {
  currentCategory = category;
  document.querySelectorAll('.cat-chip').forEach(chip => {
    chip.className = "cat-chip px-3 py-1 rounded-full text-[11px] font-bold whitespace-nowrap bg-white text-slate-600 border border-slate-200";
  });
  el.className = "cat-chip cat-active px-3 py-1 rounded-full text-[11px] font-bold whitespace-nowrap bg-sky-600 text-white shadow-sm";
  renderData();
}

function showToast(msg) {
  const toast = document.getElementById('toast');
  document.getElementById('toastMsg').innerText = msg;
  toast.style.transform = 'translateY(0)';
  setTimeout(() => {
    toast.style.transform = 'translateY(-150%)';
  }, 2500);
}

function populateRelawanDropdown() {
   const select = document.getElementById('pinjamNamaSelect');
   select.innerHTML = '<option value="">-- Pilih dari Daftar Tim --</option>';
   allData.relawan.forEach(r => {
      if(r.Nama_Lengkap) {
          select.innerHTML += `<option value="${r.Nama_Lengkap}">${r.Nama_Lengkap}</option>`;
      }
   });
}

function renderData() {
  const keyword = document.getElementById('search').value.toLowerCase();
  const content = document.getElementById('content');
  content.innerHTML = '';
  
  let dataToRender = allData[currentTab];

  if(dataToRender.length === 0) {
    content.innerHTML = `<div class="text-center py-8 bg-white rounded-xl border border-slate-100 text-slate-400 text-xs">Data kosong</div>`;
    return;
  }

  if(currentTab === 'inventaris' && currentViewMode === 'grid') {
    content.className = "grid grid-cols-2 gap-2.5";
  } else {
    content.className = "space-y-2.5";
  }

  dataToRender.forEach(item => {
    const values = Object.values(item).join(' ').toLowerCase();
    if(!values.includes(keyword)) return;

    if(currentTab === 'inventaris' && currentCategory !== 'Semua') {
      if(item.Kategori !== currentCategory) return;
    }

    if (currentTab === 'inventaris') {
      const sisa = Number(item.Sisa_Stok) || 0;
      const total = Number(item.Total_Stok) || 0;
      const dipakai = Number(item.Sedang_Dipakai) || 0;
      
      // Kolom I sekarang adalah Dipinjam_Oleh
      const dipinjamOleh = item.Dipinjam_Oleh || ''; 
      let infoPeminjam = '';
      if(dipinjamOleh) {
          infoPeminjam = `<div class="mt-2 text-[10px] text-orange-600 bg-orange-50 p-1.5 rounded border border-orange-100">
             <i class="fa-solid fa-hand-holding-hand mr-1"></i> Dibawa: <span class="font-bold">${dipinjamOleh}</span>
          </div>`;
      }

      if(currentViewMode === 'grid') {
        content.innerHTML += `
          <div class="bg-white rounded-xl border border-slate-200 p-3 shadow-sm flex flex-col justify-between relative overflow-hidden">
            <div class="absolute top-0 right-0 w-1.5 h-full ${sisa > 0 ? 'bg-green-400' : 'bg-red-400'}"></div>
            <div>
              <div class="flex justify-between items-center text-[10px] text-slate-400 mb-1">
                <span class="truncate max-w-[60%]">📍 ${item.Lokasi_Simpan || 'Gudang'}</span>
                <span class="font-bold text-slate-500 bg-slate-100 px-1 rounded">${item.Kategori}</span>
              </div>
              <h4 class="font-bold text-slate-800 text-xs mb-1 line-clamp-2" title="${item.Nama_Barang}">${item.Nama_Barang}</h4>
              <div class="text-[11px] font-black text-green-600 mb-1">Tersedia: ${sisa} ${item.Satuan || ''}</div>
              ${infoPeminjam}
            </div>

            <div class="flex gap-1 pt-2 mt-2 border-t border-slate-100">
              <button onclick="openPinjamModal('${item.ID_Barang}', '${item.Nama_Barang}', 1)" class="flex-1 bg-red-50 text-red-600 py-1.5 rounded font-bold text-[10px]">- Pakai</button>
              <button onclick="openPinjamModal('${item.ID_Barang}', '${item.Nama_Barang}', -1)" class="flex-1 bg-green-50 text-green-600 py-1.5 rounded font-bold text-[10px]">+ Kembali</button>
            </div>
          </div>`;
      } else {
        content.innerHTML += `
          <div class="bg-white rounded-xl border border-slate-200 p-3 shadow-sm flex items-center gap-3">
            <div class="flex-1 min-w-0">
              <div class="flex justify-between items-center mb-0.5">
                <span class="text-[10px] font-bold text-slate-400 uppercase">${item.Lokasi_Simpan || 'Gudang'}</span>
                <span class="text-xs font-black text-green-600">Sisa: ${sisa} ${item.Satuan || ''}</span>
              </div>
              <h4 class="font-bold text-slate-800 text-sm truncate mb-1">${item.Nama_Barang}</h4>
              ${infoPeminjam}
              <div class="flex gap-2 mt-2 items-center">
                <button onclick="openPinjamModal('${item.ID_Barang}', '${item.Nama_Barang}', 1)" class="bg-red-50 text-red-600 px-3 py-1 rounded font-bold text-[10px]">- Pakai</button>
                <button onclick="openPinjamModal('${item.ID_Barang}', '${item.Nama_Barang}', -1)" class="bg-green-50 text-green-600 px-3 py-1 rounded font-bold text-[10px]">+ Kembali</button>
              </div>
            </div>
          </div>`;
      }
    } 
    else if (currentTab === 'jadwal') {
      const isDone = item.Status_Pekerjaan === 'Selesai';
      content.innerHTML += `
        <div class="bg-white rounded-xl border border-slate-200 p-3 shadow-sm text-xs">
          <div class="flex justify-between items-center mb-2">
            <span class="font-bold px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded">${item.Fase_Acara}</span>
            <span class="font-bold px-2 py-0.5 rounded ${isDone ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}">${item.Status_Pekerjaan || 'Belum'}</span>
          </div>
          <h4 class="font-bold text-slate-800 mb-1">${item.Area}</h4>
          <p class="text-slate-600 mb-2 bg-slate-50 p-2 rounded">${item.Deskripsi_Tugas}</p>
          <div class="flex justify-between text-[10px] text-slate-400 mb-2">
             <span>⏰ ${item.Shift_Waktu || '-'}</span>
             <span>👤 ${item.Relawan_Ditugaskan || '-'}</span>
          </div>
          ${!isDone ? `<button onclick="actionAPI('update_task', '${item.ID_Tugas}', 'Selesai')" class="w-full bg-sky-600 text-white py-1.5 rounded font-bold">✓ Tandai Selesai</button>` : ''}
        </div>`;
    }
    else if (currentTab === 'relawan') {
      content.innerHTML += `
        <div class="bg-white rounded-xl border border-slate-200 p-3 shadow-sm flex items-center gap-3 text-xs">
          <div class="h-10 w-10 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 font-bold shrink-0">
            ${item.Nama_Lengkap ? item.Nama_Lengkap.charAt(0) : '?'}
          </div>
          <div class="flex-1 min-w-0">
            <h4 class="font-bold text-slate-800 truncate">${item.Nama_Lengkap}</h4>
            <p class="text-[10px] text-slate-400">WA: ${item.No_WhatsApp || '-'} • ${item.Kesediaan_Waktu || '-'}</p>
          </div>
        </div>`;
    }
  });
}

function openAddModal() { document.getElementById('addModal').classList.remove('hidden'); }
function closeAddModal() { document.getElementById('addModal').classList.add('hidden'); }

// Modal Peminjaman
function openPinjamModal(id, namaBarang, aksi) {
    document.getElementById('pinjamItemId').value = id;
    document.getElementById('pinjamAksi').value = aksi;
    const desc = document.getElementById('pinjamDesc');
    
    if (aksi === 1) {
        desc.innerHTML = `Siapa yang memakai/membawa <b>${namaBarang}</b>?`;
    } else {
        desc.innerHTML = `Siapa yang mengembalikan <b>${namaBarang}</b>? (Pilih nama yang meminjam agar dihapus dari catatan)`;
    }

    document.getElementById('pinjamNamaSelect').value = '';
    document.getElementById('pinjamNamaInput').value = '';
    document.getElementById('pinjamModal').classList.remove('hidden');
}

function closePinjamModal() { document.getElementById('pinjamModal').classList.add('hidden'); }

async function submitPinjam(event) {
    event.preventDefault();
    const id = document.getElementById('pinjamItemId').value;
    const aksi = Number(document.getElementById('pinjamAksi').value);
    
    let namaPeminjam = document.getElementById('pinjamNamaSelect').value;
    if (!namaPeminjam) {
        namaPeminjam = document.getElementById('pinjamNamaInput').value;
    }

    if (!namaPeminjam) {
        alert("Nama wajib diisi!");
        return;
    }

    const btn = document.getElementById('pinjamSubmitBtn');
    btn.innerText = "Menyimpan...";
    btn.disabled = true;

    // Optimistic Update Sementara
    let item = allData.inventaris.find(i => i.ID_Barang === id);
    if (item) {
       let dp = (Number(item.Sedang_Dipakai)||0) + aksi;
       if (dp < 0) dp = 0;
       if (dp > Number(item.Total_Stok)) {
           alert("Melebihi stok yang ada!");
           btn.innerText = "Simpan"; btn.disabled = false;
           return;
       }
       item.Sedang_Dipakai = dp;
       item.Sisa_Stok = Number(item.Total_Stok) - dp;
       
       // Logika tampil di web sementara (agar terasa instan)
       let listStr = item.Dipinjam_Oleh || '';
       if (aksi === 1) {
           item.Dipinjam_Oleh = listStr ? `${listStr}, ${namaPeminjam}` : namaPeminjam;
       } else {
           // Menghapus nama dari string jika dikembalikan (hanya ilustrasi sementara di UI)
           item.Dipinjam_Oleh = listStr.replace(new RegExp(`\\b${namaPeminjam}\\b.*?(,|$)`), '').trim().replace(/,$/, '');
       }
       renderData();
    }

    try {
      await fetch(API_URL, {
        method: 'POST',
        body: JSON.stringify({ action: 'adjust_stock', id: id, change: aksi, nama: namaPeminjam })
      });
      closePinjamModal();
      showToast("Tersimpan ke server!");
      loadAllData(); // Refresh data asli dari server
    } catch(e) { 
      showToast("Gagal menyimpan!");
    } finally {
      btn.innerText = "Simpan";
      btn.disabled = false;
    }
}

async function submitNewItem(event) {
  event.preventDefault();
  const btn = document.getElementById('submitBtn');
  btn.innerText = "Memproses...";
  btn.disabled = true;

  const newItem = {
    Nama_Barang: document.getElementById('newName').value,
    Kategori: document.getElementById('newCategory').value,
    Lokasi_Simpan: document.getElementById('newLocation').value,
    Total_Stok: document.getElementById('newTotal').value,
    Satuan: document.getElementById('newUnit').value,
    Keterangan: document.getElementById('newDesc').value
  };

  try {
    await fetch(API_URL, {
      method: 'POST',
      body: JSON.stringify({ action: 'create_item', item: newItem })
    });
    closeAddModal();
    document.getElementById('addItemForm').reset();
    showToast("Barang baru disimpan!");
    loadAllData();
  } catch (err) {
    alert("Gagal menyimpan.");
  } finally {
    btn.innerText = "Simpan";
    btn.disabled = false;
  }
}

async function actionAPI(action, id, value) {
  if (action === 'update_task' && !confirm("Selesai?")) return;
  
  if (action === 'update_task') {
    let item = allData.jadwal.find(i => i.ID_Tugas === id);
    if(item) { item.Status_Pekerjaan = value; renderData(); }
    
    try {
      await fetch(API_URL, {
        method: 'POST',
        body: JSON.stringify({ action: action, id: id, status: value })
      });
      showToast("Disimpan ke server!");
    } catch(e) { 
      showToast("Gagal simpan!");
    }
  }
}
