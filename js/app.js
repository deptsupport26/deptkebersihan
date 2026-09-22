const API_URL = "https://script.google.com/macros/s/AKfycbxY3vUvlyDXYrYwFT9x9J7d8_PcTgrXGNAJiat2XH3l1tqLWHq8Imn_SjiP6Ey1NAH3GQ/exec";

let currentTab = 'inventaris';
let currentViewMode = 'grid'; // 'grid' atau 'list'
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

  // Kontrol visibilitas Filter Kategori dan Toggle View (Hanya di tab inventaris)
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
  document.getElementById('search').placeholder = tabName === 'inventaris' ? 'Cari barang, box...' : 'Cari...';
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

function renderData() {
  const keyword = document.getElementById('search').value.toLowerCase();
  const content = document.getElementById('content');
  content.innerHTML = '';
  
  let dataToRender = allData[currentTab];

  if(dataToRender.length === 0) {
    content.innerHTML = `<div class="text-center py-8 bg-white rounded-xl border border-slate-100 text-slate-400 text-xs">Data kosong</div>`;
    return;
  }

  // Atur kelas kontainer berdasarkan mode tampilan
  if(currentTab === 'inventaris' && currentViewMode === 'grid') {
    content.className = "grid grid-cols-2 gap-2.5";
  } else {
    content.className = "space-y-2.5";
  }

  dataToRender.forEach(item => {
    const values = Object.values(item).join(' ').toLowerCase();
    if(!values.includes(keyword)) return;

    // Filter Kategori khusus tab inventaris
    if(currentTab === 'inventaris' && currentCategory !== 'Semua') {
      if(item.Kategori !== currentCategory) return;
    }

    if (currentTab === 'inventaris') {
      const sisa = Number(item.Sisa_Stok) || 0;
      const total = Number(item.Total_Stok) || 0;
      const dipakai = Number(item.Sedang_Dipakai) || 0;
      const fotoUrl = item.URL_Foto && item.URL_Foto.startsWith('http') ? item.URL_Foto : '';

      if(currentViewMode === 'grid') {
        // --- GRID / CARD VIEW ---
        content.innerHTML += `
          <div class="bg-white rounded-xl border border-slate-200 p-3 shadow-sm flex flex-col justify-between relative overflow-hidden">
            <div class="absolute top-0 right-0 w-1.5 h-full ${sisa > 0 ? 'bg-green-400' : 'bg-red-400'}"></div>
            <div>
              <div class="relative h-24 bg-slate-100 rounded-lg mb-2 overflow-hidden flex items-center justify-center border border-slate-100">
                ${fotoUrl ? `<img src="${fotoUrl}" class="w-full h-full object-cover">` : `<i class="fa-solid fa-image text-slate-300 text-xl"></i>`}
                <button onclick="openEditModal('${item.ID_Barang}', '${item.Nama_Barang}', '${fotoUrl}')" class="absolute bottom-1 right-1 bg-slate-900/80 hover:bg-slate-900 text-white px-2 py-1 rounded-md text-[10px] font-bold shadow">
                  <i class="fa-solid fa-camera mr-1"></i> Foto
                </button>
              </div>

              <div class="flex justify-between items-center text-[10px] text-slate-400 mb-0.5">
                <span class="truncate max-w-[70%]" title="${item.Lokasi_Simpan || 'Gudang'}">📍 ${item.Lokasi_Simpan || 'Gudang'}</span>
                <span class="font-bold text-sky-600">${sisa} ${item.Satuan || ''}</span>
              </div>
              <h4 class="font-bold text-slate-800 text-xs mb-2 line-clamp-1" title="${item.Nama_Barang}">${item.Nama_Barang}</h4>
            </div>

            <div class="flex gap-1 pt-1 border-t border-slate-100">
              <button onclick="actionAPI('adjust_stock', '${item.ID_Barang}', 1)" class="flex-1 bg-red-50 text-red-600 py-1 rounded font-bold text-[10px]">- Pakai</button>
              <button onclick="actionAPI('adjust_stock', '${item.ID_Barang}', -1)" class="flex-1 bg-green-50 text-green-600 py-1 rounded font-bold text-[10px]">+ Kembali</button>
            </div>
          </div>`;
      } else {
        // --- LIST VIEW ---
        content.innerHTML += `
          <div class="bg-white rounded-xl border border-slate-200 p-3 shadow-sm flex items-center gap-3">
            <div class="relative h-14 w-14 bg-slate-100 rounded-lg shrink-0 overflow-hidden flex items-center justify-center border border-slate-100">
              ${fotoUrl ? `<img src="${fotoUrl}" class="w-full h-full object-cover">` : `<i class="fa-solid fa-image text-slate-300 text-sm"></i>`}
              <button onclick="openEditModal('${item.ID_Barang}', '${item.Nama_Barang}', '${fotoUrl}')" class="absolute bottom-0 right-0 bg-slate-900/80 text-white px-1.5 py-0.5 rounded-tl text-[9px] font-bold">
                <i class="fa-solid fa-camera"></i>
              </button>
            </div>
            
            <div class="flex-1 min-w-0">
              <div class="flex justify-between items-center">
                <span class="text-[10px] font-bold text-slate-400 uppercase">${item.Lokasi_Simpan || 'Gudang'}</span>
                <span class="text-xs font-black text-green-600">Sisa: ${sisa} ${item.Satuan || ''}</span>
              </div>
              <h4 class="font-bold text-slate-800 text-xs truncate">${item.Nama_Barang}</h4>
              <div class="flex gap-2 mt-1.5">
                <button onclick="actionAPI('adjust_stock', '${item.ID_Barang}', 1)" class="bg-red-50 text-red-600 px-2.5 py-0.5 rounded font-bold text-[10px]">- Pakai 1</button>
                <button onclick="actionAPI('adjust_stock', '${item.ID_Barang}', -1)" class="bg-green-50 text-green-600 px-2.5 py-0.5 rounded font-bold text-[10px]">+ Kembali</button>
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

// Modal Tambah Barang
function openAddModal() { document.getElementById('addModal').classList.remove('hidden'); }
function closeAddModal() { document.getElementById('addModal').classList.add('hidden'); }

// Modal Edit / Tambah Foto Barang
function openEditModal(id, name, currentFoto) {
  document.getElementById('editItemId').value = id;
  document.getElementById('editModalTitle').innerText = `Foto: ${name}`;
  const preview = document.getElementById('currentPhotoPreview');
  
  if(currentFoto) {
    preview.innerHTML = `<img src="${currentFoto}" class="h-24 w-auto mx-auto rounded-lg border object-cover">`;
  } else {
    preview.innerHTML = `<span class="text-[10px] text-slate-400 italic">Belum ada foto</span>`;
  }
  document.getElementById('editModal').classList.remove('hidden');
}
function closeEditModal() { document.getElementById('editModal').classList.add('hidden'); }

// Upload Foto Barang Eksisting
async function submitEditPhoto(event) {
  event.preventDefault();
  const id = document.getElementById('editItemId').value;
  const fileInput = document.getElementById('editPhotoFile');
  const btn = document.getElementById('editSubmitBtn');

  btn.innerText = "Mengompres & Upload...";
  btn.disabled = true;

  let fotoBase64 = "";
  if (fileInput.files && fileInput.files[0]) {
    fotoBase64 = await compressImage(fileInput.files[0], 800, 0.7);
  }

  try {
    await fetch(API_URL, {
      method: 'POST',
      body: JSON.stringify({ action: 'update_photo', id: id, fotoBase64: fotoBase64 })
    });

    closeEditModal();
    document.getElementById('editPhotoFile').value = '';
    showToast("Foto berhasil diperbarui & disimpan!");
    loadAllData();
  } catch (err) {
    alert("Gagal mengunggah foto.");
  } finally {
    btn.innerText = "Upload Foto";
    btn.disabled = false;
  }
}

// Kompres Gambar via Canvas
function compressImage(file, maxWidth, quality) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
    };
  });
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
    Keterangan: document.getElementById('newDesc').value,
    fotoBase64: document.getElementById('newPhoto').files[0] ? await compressImage(document.getElementById('newPhoto').files[0], 800, 0.7) : ""
  };

  try {
    await fetch(API_URL, {
      method: 'POST',
      body: JSON.stringify({ action: 'create_item', item: newItem })
    });
    closeAddModal();
    document.getElementById('addItemForm').reset();
    showToast("Barang baru berhasil disimpan!");
    loadAllData();
  } catch (err) {
    alert("Gagal menyimpan.");
  } finally {
    btn.innerText = "Simpan";
    btn.disabled = false;
  }
}

async function actionAPI(action, id, value) {
  if(action === 'update_task' && !confirm("Selesai?")) return;
  
  if(action === 'adjust_stock') {
    let item = allData.inventaris.find(i => i.ID_Barang === id);
    if(item) {
       let dp = (Number(item.Sedang_Dipakai)||0) + value;
       if(dp < 0) dp = 0;
       if(dp > Number(item.Total_Stok)) { alert("Melebihi total stok!"); return; }
       item.Sedang_Dipakai = dp;
       item.Sisa_Stok = Number(item.Total_Stok) - dp;
       renderData();
    }
  } else if(action === 'update_task') {
    let item = allData.jadwal.find(i => i.ID_Tugas === id);
    if(item) { item.Status_Pekerjaan = value; renderData(); }
  }

  try {
    await fetch(API_URL, {
      method: 'POST',
      body: JSON.stringify({ action: action, id: id, change: value, status: value })
    });
    showToast("Perubahan stok disimpan ke server!");
  } catch(e) { 
    console.error(e); 
    showToast("Gagal menyimpan ke server!");
  }
}
