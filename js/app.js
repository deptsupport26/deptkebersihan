// Ganti dengan URL Web App Apps Script Anda
const API_URL = "https://script.google.com/macros/s/AKfycbxY3vUvlyDXYrYwFT9x9J7d8_PcTgrXGNAJiat2XH3l1tqLWHq8Imn_SjiP6Ey1NAH3GQ/exec";

let currentTab = 'inventaris';
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
        <i class="fa-solid fa-triangle-exclamation text-3xl text-red-400 mb-3"></i>
        <p class="text-slate-600 mb-4">Gagal memuat data dari server.</p>
        <button onclick="loadAllData()" class="bg-slate-200 hover:bg-slate-300 text-slate-800 px-4 py-2 rounded-lg font-semibold text-sm">Coba Lagi</button>
      </div>
    `;
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

  document.getElementById('search').value = '';
  let placeholderTxt = 'Cari...';
  if(tabName === 'inventaris') placeholderTxt = 'Cari barang, lokasi...';
  if(tabName === 'jadwal') placeholderTxt = 'Cari area, tugas...';
  if(tabName === 'relawan') placeholderTxt = 'Cari nama kru...';
  document.getElementById('search').placeholder = placeholderTxt;
  
  renderData();
}

function renderData() {
  const keyword = document.getElementById('search').value.toLowerCase();
  const content = document.getElementById('content');
  content.innerHTML = '';
  
  let dataToRender = allData[currentTab];

  if(dataToRender.length === 0) {
    content.innerHTML = `
      <div class="text-center py-10 bg-white rounded-xl border border-slate-100 shadow-sm">
        <i class="fa-regular fa-folder-open text-4xl text-slate-300 mb-3"></i>
        <p class="text-slate-500">Data belum tersedia.</p>
      </div>`;
    return;
  }

  dataToRender.forEach(item => {
    const values = Object.values(item).join(' ').toLowerCase();
    if(!values.includes(keyword)) return;

    if (currentTab === 'inventaris') {
      const sisa = Number(item.Sisa_Stok) || 0;
      const total = Number(item.Total_Stok) || 0;
      const dipakai = Number(item.Sedang_Dipakai) || 0;
      const foto = item.URL_Foto ? `<a href="${item.URL_Foto}" target="_blank" class="text-xs text-sky-600 underline mt-2 block"><i class="fa-solid fa-image mr-1"></i> Lihat Foto</a>` : '';
      
      content.innerHTML += `
        <div class="bg-white rounded-xl border border-slate-200 p-4 shadow-sm relative overflow-hidden">
          <div class="absolute top-0 right-0 w-2 h-full ${sisa > 0 ? 'bg-green-400' : 'bg-red-400'}"></div>
          
          <div class="flex justify-between items-start mb-2">
            <span class="text-xs font-bold px-2 py-1 bg-slate-100 text-slate-500 rounded-md uppercase tracking-wider">${item.Kategori || '-'}</span>
            <span class="text-xs font-medium text-slate-500"><i class="fa-solid fa-location-dot text-red-400 mr-1"></i> ${item.Lokasi_Simpan || 'Gudang'}</span>
          </div>
          
          <h3 class="text-lg font-bold text-slate-800 mb-1">${item.Nama_Barang}</h3>
          ${item.Keterangan ? `<p class="text-xs text-slate-400 mb-3">${item.Keterangan}</p>` : ''}
          ${foto}
          
          <div class="grid grid-cols-3 gap-2 bg-slate-50 rounded-lg p-3 border border-slate-100 my-4">
             <div class="text-center">
                <div class="text-[10px] text-slate-400 uppercase font-bold">Total</div>
                <div class="font-semibold text-slate-700">${total}</div>
             </div>
             <div class="text-center border-l border-r border-slate-200">
                <div class="text-[10px] text-orange-400 uppercase font-bold">Dipakai</div>
                <div class="font-bold text-orange-500">${dipakai}</div>
             </div>
             <div class="text-center">
                <div class="text-[10px] text-green-500 uppercase font-bold">Tersedia</div>
                <div class="font-black text-green-600 text-lg leading-tight">${sisa} <span class="text-xs font-normal">${item.Satuan || ''}</span></div>
             </div>
          </div>
          
          <div class="flex gap-2">
            <button onclick="actionAPI('adjust_stock', '${item.ID_Barang}', 1)" class="flex-1 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 py-2 rounded-lg font-bold text-sm flex items-center justify-center">
              <i class="fa-solid fa-minus mr-2"></i> Pakai 1
            </button>
            <button onclick="actionAPI('adjust_stock', '${item.ID_Barang}', -1)" class="flex-1 bg-green-50 hover:bg-green-100 text-green-600 border border-green-200 py-2 rounded-lg font-bold text-sm flex items-center justify-center">
              <i class="fa-solid fa-plus mr-2"></i> Kembali
            </button>
          </div>
        </div>`;
    } 
    
    else if (currentTab === 'jadwal') {
      const isDone = item.Status_Pekerjaan === 'Selesai';
      content.innerHTML += `
        <div class="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div class="flex justify-between items-start mb-3">
            <span class="text-xs font-bold px-2 py-1 bg-indigo-50 text-indigo-600 rounded-md">${item.Fase_Acara}</span>
            <span class="text-xs font-bold px-2 py-1 rounded-md ${isDone ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}">
              ${item.Status_Pekerjaan || 'Belum Mulai'}
            </span>
          </div>
          <h3 class="text-lg font-bold text-slate-800 mb-2">${item.Area}</h3>
          <p class="text-sm text-slate-600 mb-4 bg-slate-50 p-3 rounded-lg border border-slate-100"><i class="fa-solid fa-thumbtack text-slate-400 mr-2"></i>${item.Deskripsi_Tugas}</p>
          
          <div class="flex justify-between items-center text-xs font-medium text-slate-500 mb-4">
             <span><i class="fa-regular fa-clock mr-1 text-sky-500"></i> ${item.Shift_Waktu || '-'}</span>
             <span><i class="fa-regular fa-user mr-1 text-sky-500"></i> ${item.Relawan_Ditugaskan || '-'}</span>
          </div>
          
          ${!isDone ? `<button onclick="actionAPI('update_task', '${item.ID_Tugas}', 'Selesai')" class="w-full bg-sky-600 hover:bg-sky-700 text-white py-2.5 rounded-lg font-bold text-sm shadow-sm flex items-center justify-center">
            <i class="fa-solid fa-check mr-2"></i> Tandai Selesai
          </button>` : ''}
        </div>`;
    }

    else if (currentTab === 'relawan') {
      const isActive = item.Status_Aktif === 'Aktif';
      content.innerHTML += `
        <div class="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-start gap-4">
          <div class="h-12 w-12 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 shrink-0 text-xl font-bold">
            ${item.Nama_Lengkap ? item.Nama_Lengkap.charAt(0) : '?'}
          </div>
          <div class="flex-1">
            <div class="flex justify-between items-start">
              <h3 class="font-bold text-slate-800">${item.Nama_Lengkap}</h3>
              <span class="text-[10px] font-bold px-2 py-1 rounded-md ${isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}">${item.Status_Aktif || '-'}</span>
            </div>
            <p class="text-xs text-slate-500 mb-2">${item.Jenis_Kelamin || '-'} • <i class="fa-brands fa-whatsapp text-green-500 mx-1"></i>${item.No_WhatsApp || '-'}</p>
            <div class="text-xs font-medium bg-slate-50 inline-block px-2 py-1 rounded border border-slate-100">
              <i class="fa-regular fa-calendar-check mr-1 text-slate-400"></i> ${item.Kesediaan_Waktu || '-'}
            </div>
          </div>
        </div>`;
    }
  });
}

// Fungsi Modal Tambah Barang
function openAddModal() { document.getElementById('addModal').classList.remove('hidden'); }
function closeAddModal() { document.getElementById('addModal').classList.add('hidden'); }

// Fungsi Kompres Foto via Canvas & Kirim ke API
async function submitNewItem(event) {
  event.preventDefault();
  const btn = document.getElementById('submitBtn');
  btn.innerText = "Memproses...";
  btn.disabled = true;

  const name = document.getElementById('newName').value;
  const category = document.getElementById('newCategory').value;
  const location = document.getElementById('newLocation').value;
  const total = document.getElementById('newTotal').value;
  const unit = document.getElementById('newUnit').value;
  const desc = document.getElementById('newDesc').value;
  const photoInput = document.getElementById('newPhoto');

  let fotoBase64 = "";

  if (photoInput.files && photoInput.files[0]) {
    const file = photoInput.files[0];
    fotoBase64 = await compressImage(file, 800, 0.7); // Kompres lebar maks 800px, kualitas 70%
  }

  const newItem = {
    Nama_Barang: name,
    Kategori: category,
    Lokasi_Simpan: location,
    Total_Stok: total,
    Satuan: unit,
    Keterangan: desc,
    fotoBase64: fotoBase64
  };

  try {
    await fetch(API_URL, {
      method: 'POST',
      body: JSON.stringify({ action: 'create_item', item: newItem })
    });

    closeAddModal();
    document.getElementById('addItemForm').reset();
    alert("Barang berhasil ditambahkan!");
    loadAllData();
  } catch (err) {
    alert("Gagal menyimpan data.");
  } finally {
    btn.innerText = "Simpan";
    btn.disabled = false;
  }
}

// Algoritma Kompres Gambar menggunakan HTML5 Canvas
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

        // Ubah ke format base64 terkompres
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
    };
  });
}

// Fungsi Aksi Stok & Tugas
async function actionAPI(action, id, value) {
  if(action === 'update_task' && !confirm("Yakin tugas ini sudah selesai?")) return;
  
  if(action === 'adjust_stock') {
    let item = allData.inventaris.find(i => i.ID_Barang === id);
    if(item) {
       let dp = (Number(item.Sedang_Dipakai)||0) + value;
       if(dp < 0) dp = 0;
       let total = Number(item.Total_Stok)||0;
       if(dp > total) { alert("Jumlah dipakai melebihi stok!"); return; }
       item.Sedang_Dipakai = dp;
       item.Sisa_Stok = total - dp;
       renderData();
    }
  } else if(action === 'update_task') {
    let item = allData.jadwal.find(i => i.ID_Tugas === id);
    if(item) { item.Status_Pekerjaan = value; renderData(); }
  }

  try {
    let payload = { action: action, id: id };
    if(action === 'adjust_stock') payload.change = value;
    if(action === 'update_task') payload.status = value;

    await fetch(API_URL, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  } catch(e) {
    console.error("Gagal sinkronisasi", e);
  }
}
