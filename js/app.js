const API_URL = "https://script.google.com/macros/s/AKfycbxY3vUvlyDXYrYwFT9x9J7d8_PcTgrXGNAJiat2XH3l1tqLWHq8Imn_SjiP6Ey1NAH3GQ/exec";

let currentViewMode = 'grid';
let currentCategory = 'Semua';
let inventoryData = [];
let relawanData = [];

// Fungsi Tema Gelap/Terang (Dark Mode)
function toggleDarkMode() {
  const html = document.documentElement;
  const icon = document.getElementById('themeIcon');
  if (html.classList.contains('dark')) {
    html.classList.remove('dark');
    icon.className = 'fa-solid fa-moon';
  } else {
    html.classList.add('dark');
    icon.className = 'fa-solid fa-sun';
  }
}

// Fungsi Pemberian Ikon Barang Otomatis
function getItemIcon(itemName) {
  const name = itemName.toLowerCase();
  if (name.includes('sapu')) return '<i class="fa-solid fa-broom text-amber-600 text-xl"></i>';
  if (name.includes('wiper') || name.includes('kanebo') || name.includes('lap') || name.includes('pel')) return '<i class="fa-solid fa-mitten text-sky-500 text-xl"></i>';
  if (name.includes('sabun') || name.includes('hand soap') || name.includes('sunlight') || name.includes('sos') || name.includes('wipol')) return '<i class="fa-solid fa-pump-soap text-pink-500 text-xl"></i>';
  if (name.includes('plastik') || name.includes('kresek') || name.includes('sampah')) return '<i class="fa-solid fa-trash-can text-slate-500 text-xl"></i>';
  if (name.includes('tissu') || name.includes('tisu')) return '<i class="fa-solid fa-scroll text-slate-400 text-xl"></i>';
  if (name.includes('semprot') || name.includes('cling') || name.includes('stella') || name.includes('hit')) return '<i class="fa-solid fa-spray-can text-indigo-500 text-xl"></i>';
  if (name.includes('sarung tangan')) return '<i class="fa-solid fa-hand text-yellow-500 text-xl"></i>';
  if (name.includes('ember') || name.includes('gayung')) return '<i class="fa-solid fa-bucket text-blue-500 text-xl"></i>';
  return '<i class="fa-solid fa-box-open text-slate-400 text-xl"></i>'; // Default
}

document.addEventListener('DOMContentLoaded', loadData);

async function loadData() {
  document.getElementById('loading').style.display = 'flex';
  document.getElementById('content').innerHTML = '';
  
  try {
    const [invRes, relRes] = await Promise.all([
      fetch(API_URL + "?type=inventaris"),
      fetch(API_URL + "?type=relawan")
    ]);

    const invJson = await invRes.json();
    const relJson = await relRes.json();

    inventoryData = invJson.data || [];
    relawanData = relJson.data || [];

    populateRelawanDropdown(); 
    document.getElementById('loading').style.display = 'none';
    renderData();
  } catch (err) {
    document.getElementById('loading').innerHTML = `
      <div class="text-center py-10 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
        <div class="w-16 h-16 bg-red-50 dark:bg-red-900/30 text-red-500 rounded-full flex items-center justify-center mx-auto mb-3">
           <i class="fa-solid fa-triangle-exclamation text-2xl"></i>
        </div>
        <p class="text-slate-800 dark:text-white font-bold mb-1">Gagal Terhubung</p>
        <p class="text-slate-500 text-xs mb-4 px-4">Pastikan koneksi internet stabil.</p>
        <button onclick="loadData()" class="bg-slate-800 text-white px-5 py-2.5 rounded-xl text-xs font-bold">Coba Muat Ulang</button>
      </div>`;
  }
}

function setViewMode(mode) {
  currentViewMode = mode;
  const gridBtn = document.getElementById('btnGridView');
  const listBtn = document.getElementById('btnListView');
  
  if(mode === 'grid') {
    gridBtn.className = "w-10 h-10 flex items-center justify-center rounded-lg text-sm font-bold bg-white text-sky-600 shadow-sm transition-all";
    listBtn.className = "w-10 h-10 flex items-center justify-center rounded-lg text-sm font-bold text-slate-400 hover:text-slate-600 transition-all dark:bg-slate-800";
  } else {
    listBtn.className = "w-10 h-10 flex items-center justify-center rounded-lg text-sm font-bold bg-white text-sky-600 shadow-sm transition-all";
    gridBtn.className = "w-10 h-10 flex items-center justify-center rounded-lg text-sm font-bold text-slate-400 hover:text-slate-600 transition-all dark:bg-slate-800";
  }
  renderData();
}

function setCategory(category, el) {
  currentCategory = category;
  document.querySelectorAll('.cat-chip').forEach(chip => {
    chip.className = "cat-chip px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap bg-white text-slate-500 border border-slate-200 hover:bg-slate-50 transition-all dark:bg-slate-800 dark:border-slate-700";
  });
  el.className = "cat-chip cat-active px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap bg-sky-600 text-white shadow-sm shadow-sky-200 transition-all";
  renderData();
}

function showToast(msg) {
  const toast = document.getElementById('toast');
  document.getElementById('toastMsg').innerText = msg;
  toast.style.transform = 'translateY(0)';
  setTimeout(() => { toast.style.transform = 'translateY(-150%)'; }, 3000);
}

function populateRelawanDropdown() {
   const select = document.getElementById('pinjamNamaSelect');
   select.innerHTML = '<option value="">-- Pilih Nama --</option>';
   relawanData.forEach(r => {
      if(r.Nama_Lengkap) { select.innerHTML += `<option value="${r.Nama_Lengkap}">${r.Nama_Lengkap}</option>`; }
   });
}

function renderData() {
  const keyword = document.getElementById('search').value.toLowerCase();
  const content = document.getElementById('content');
  content.innerHTML = '';
  
  if(inventoryData.length === 0) {
    content.innerHTML = `<div class="text-center py-12 text-slate-400 text-sm font-medium">Belum ada data barang.</div>`;
    return;
  }

  content.className = currentViewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 gap-4" : "space-y-3";

  inventoryData.forEach(item => {
    const values = Object.values(item).join(' ').toLowerCase();
    if(!values.includes(keyword)) return;
    if(currentCategory !== 'Semua' && item.Kategori !== currentCategory) return;

    const sisa = Number(item.Sisa_Stok) || 0;
    const total = Number(item.Total_Stok) || 0;
    
    const dipinjamOleh = item.Dipinjam_Oleh || ''; 
    let infoPeminjam = '';
    if(dipinjamOleh) {
        infoPeminjam = `
        <div class="mt-2.5 bg-orange-50/80 dark:bg-orange-900/30 border border-orange-100 dark:border-orange-900/50 rounded-lg p-2 flex items-start gap-2">
           <i class="fa-solid fa-hand-holding-hand text-orange-500 text-xs mt-0.5"></i>
           <div class="text-[11px] text-orange-800 dark:text-orange-200 font-medium leading-snug">
              <span class="text-orange-500 font-bold uppercase tracking-wider text-[9px] block mb-0.5">Sedang Digunakan:</span>
              ${dipinjamOleh}
           </div>
        </div>`;
    }

    // Ambil Ikon Dinamis
    const itemIcon = getItemIcon(item.Nama_Barang);

    if(currentViewMode === 'grid') {
      content.innerHTML += `
        <div class="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm flex flex-col justify-between relative group transition-all dark:bg-[#1e293b]">
          <div class="absolute top-0 right-0 w-1.5 h-full ${sisa > 0 ? 'bg-emerald-400' : 'bg-rose-400'} rounded-r-2xl"></div>
          
          <div>
            <div class="flex justify-between items-center text-[10px] mb-3">
              <span class="text-slate-400 font-bold flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-md"><i class="fa-solid fa-location-dot"></i> ${item.Lokasi_Simpan || 'Gudang'}</span>
              <span class="font-black text-slate-300 uppercase tracking-wider">${item.Kategori}</span>
            </div>
            
            <div class="flex gap-3 items-start mb-2">
               <div class="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center shrink-0 border border-slate-100 dark:border-slate-700">
                  ${itemIcon}
               </div>
               <div>
                  <h4 class="font-extrabold text-slate-800 text-sm mb-1 leading-tight pr-2 line-clamp-2">${item.Nama_Barang}</h4>
                  <div class="flex items-baseline gap-1.5">
                      <span class="text-lg font-black ${sisa > 0 ? 'text-emerald-500' : 'text-rose-500'}">${sisa}</span>
                      <span class="text-xs font-bold text-slate-400">${item.Satuan || ''}</span>
                      <span class="text-[10px] text-slate-400 ml-1">(dari ${total})</span>
                  </div>
               </div>
            </div>
            ${infoPeminjam}
          </div>

          <div class="flex gap-2 pt-3 mt-3 border-t border-slate-50 dark:border-slate-700/50">
            <button onclick="openPinjamModal('${item.ID_Barang}', '${item.Nama_Barang}', 1, '${item.Satuan}')" class="flex-1 bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 text-rose-600 py-2 rounded-xl font-bold text-[11px] transition-colors"><i class="fa-solid fa-minus mr-1"></i> Pakai</button>
            <button onclick="openPinjamModal('${item.ID_Barang}', '${item.Nama_Barang}', -1, '${item.Satuan}')" class="flex-1 bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 text-emerald-600 py-2 rounded-xl font-bold text-[11px] transition-colors"><i class="fa-solid fa-plus mr-1"></i> Kembali</button>
          </div>
        </div>`;
    } else {
      content.innerHTML += `
        <div class="bg-white rounded-2xl border border-slate-100 p-3 shadow-sm flex items-center gap-3 hover:shadow-md transition-all relative overflow-hidden dark:bg-[#1e293b]">
          <div class="absolute top-0 left-0 h-full w-1.5 ${sisa > 0 ? 'bg-emerald-400' : 'bg-rose-400'}"></div>
          
          <div class="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center shrink-0 border border-slate-100 dark:border-slate-700 ml-1">
             ${itemIcon}
          </div>

          <div class="flex-1 min-w-0">
            <div class="flex justify-between items-center mb-0.5">
              <span class="text-[10px] font-bold text-slate-400 flex items-center gap-1.5"><i class="fa-solid fa-location-dot"></i> ${item.Lokasi_Simpan || 'Gudang'}</span>
            </div>
            <h4 class="font-bold text-slate-800 text-xs truncate mb-0.5">${item.Nama_Barang}</h4>
            <div class="flex items-center gap-3">
              <span class="text-sm font-black ${sisa > 0 ? 'text-emerald-500' : 'text-rose-500'}">${sisa} <span class="text-[10px] font-bold text-slate-400">${item.Satuan || ''}</span></span>
            </div>
            ${infoPeminjam}
          </div>
          
          <div class="flex flex-col gap-1.5 shrink-0 border-l border-slate-100 dark:border-slate-700 pl-3">
            <button onclick="openPinjamModal('${item.ID_Barang}', '${item.Nama_Barang}', 1, '${item.Satuan}')" class="w-20 bg-rose-50 hover:bg-rose-100 text-rose-600 py-1.5 rounded-lg font-bold text-[10px] transition-colors"><i class="fa-solid fa-minus"></i> Pakai</button>
            <button onclick="openPinjamModal('${item.ID_Barang}', '${item.Nama_Barang}', -1, '${item.Satuan}')" class="w-20 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 py-1.5 rounded-lg font-bold text-[10px] transition-colors"><i class="fa-solid fa-plus"></i> Kembali</button>
          </div>
        </div>`;
    }
  });
}

function openAddModal() { document.getElementById('addModal').classList.remove('hidden'); }
function closeAddModal() { document.getElementById('addModal').classList.add('hidden'); }

function openPinjamModal(id, namaBarang, aksi, satuan) {
    document.getElementById('pinjamItemId').value = id;
    document.getElementById('pinjamAksi').value = aksi; 
    document.getElementById('pinjamSatuan').innerText = satuan || 'pcs';
    document.getElementById('pinjamQty').value = 1; 
    
    const title = document.getElementById('pinjamTitle');
    const icon = document.getElementById('pinjamIcon');
    const desc = document.getElementById('pinjamDesc');
    const btn = document.getElementById('pinjamSubmitBtn');
    
    if (aksi === 1) {
        title.innerText = "Pakai Barang";
        icon.className = "w-12 h-12 rounded-2xl flex items-center justify-center mb-3 bg-rose-100 text-rose-500 text-xl";
        icon.innerHTML = "<i class=\"fa-solid fa-hand-holding-hand\"></i>";
        desc.innerHTML = `Barang: <strong class="text-slate-800 dark:text-white">${namaBarang}</strong>. Berapa jumlah yang ingin dipakai dan siapa yang bawa?`;
        btn.className = "w-full text-white font-bold py-3.5 rounded-xl text-sm shadow-lg transition-all active:scale-95 bg-rose-500 hover:bg-rose-600 shadow-rose-200 dark:shadow-none";
        btn.innerText = "Konfirmasi Pakai";
    } else {
        title.innerText = "Kembalikan Barang";
        icon.className = "w-12 h-12 rounded-2xl flex items-center justify-center mb-3 bg-emerald-100 text-emerald-500 text-xl";
        icon.innerHTML = "<i class=\"fa-solid fa-box-archive\"></i>";
        desc.innerHTML = `Barang: <strong class="text-slate-800 dark:text-white">${namaBarang}</strong>. Berapa jumlah yang dikembalikan dan siapa yang mengembalikan?`;
        btn.className = "w-full text-white font-bold py-3.5 rounded-xl text-sm shadow-lg transition-all active:scale-95 bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200 dark:shadow-none";
        btn.innerText = "Konfirmasi Kembali";
    }

    document.getElementById('pinjamNamaSelect').value = '';
    document.getElementById('pinjamNamaInput').value = '';
    document.getElementById('pinjamModal').classList.remove('hidden');
}

function closePinjamModal() { document.getElementById('pinjamModal').classList.add('hidden'); }

async function submitPinjam(event) {
    event.preventDefault();
    const id = document.getElementById('pinjamItemId').value;
    const baseAksi = Number(document.getElementById('pinjamAksi').value); 
    const qtyInput = Number(document.getElementById('pinjamQty').value); // Bisa desimal
    
    if (qtyInput < 0) {
        alert("Jumlah barang tidak valid!");
        return;
    }

    const finalChangeAmount = baseAksi * qtyInput; 
    let namaPeminjam = document.getElementById('pinjamNamaSelect').value || document.getElementById('pinjamNamaInput').value;

    if (!namaPeminjam) {
        alert("Nama wajib diisi!");
        return;
    }

    const btn = document.getElementById('pinjamSubmitBtn');
    btn.innerText = "Menyimpan...";
    btn.disabled = true;

    let item = inventoryData.find(i => i.ID_Barang === id);
    if (item) {
       let dp = (Number(item.Sedang_Dipakai)||0) + finalChangeAmount;
       if (dp < 0) dp = 0;
       if (dp > Number(item.Total_Stok)) {
           alert(`Gagal! Stok tersedia tidak cukup.`);
           closePinjamModal();
           btn.disabled = false;
           return;
       }
       item.Sedang_Dipakai = dp;
       item.Sisa_Stok = Number(item.Total_Stok) - dp;
       
       let listStr = item.Dipinjam_Oleh || '';
       if (baseAksi === 1) { 
           item.Dipinjam_Oleh = listStr ? `${listStr}, ${namaPeminjam} (${qtyInput})` : `${namaPeminjam} (${qtyInput})`;
       } else { 
           item.Dipinjam_Oleh = "Menyinkronkan..."; 
       }
       renderData();
    }

    try {
      await fetch(API_URL, {
        method: 'POST',
        body: JSON.stringify({ action: 'adjust_stock', id: id, change: finalChangeAmount, nama: namaPeminjam })
      });
      closePinjamModal();
      showToast("Data tersimpan di Master Database!");
      loadData(); 
    } catch(e) { 
      showToast("Gagal menyimpan.");
    } finally {
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
    showToast("Barang baru berhasil ditambahkan!");
    loadData();
  } catch (err) {
    alert("Gagal menyimpan.");
  } finally {
    btn.innerText = "Simpan ke Master Data";
    btn.disabled = false;
  }
}
