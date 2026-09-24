const API_URL = "https://script.google.com/macros/s/AKfycbxY3vUvlyDXYrYwFT9x9J7d8_PcTgrXGNAJiat2XH3l1tqLWHq8Imn_SjiP6Ey1NAH3GQ/exec";
const APP_PIN = "KEBERSIHANOKT26";

let currentViewMode = 'grid';
let currentCategory = 'Semua';
let inventoryData = [];
let savedPin = localStorage.getItem('appPin') || '';

// --- 1. LOGIN SCREEN LOGIC ---
document.addEventListener('DOMContentLoaded', () => {
    if (savedPin === APP_PIN) {
        loadData();
    } else {
        document.getElementById('pinModal').classList.remove('hidden');
    }
});

function unlockApp() {
    const val = document.getElementById('inputPin').value.toUpperCase();
    if (val === APP_PIN) {
        savedPin = val;
        localStorage.setItem('appPin', savedPin);
        document.getElementById('pinModal').classList.add('hidden');
        loadData();
    } else {
        alert("Kata Sandi Salah! Silakan coba lagi.");
        document.getElementById('inputPin').value = '';
    }
}

async function apiRequest(payload) {
    payload.pin = savedPin;
    const res = await fetch(API_URL, {
        method: 'POST',
        body: JSON.stringify(payload)
    });
    const json = await res.json();
    if (json.status === 'error') throw new Error(json.message);
    return json;
}

// --- 2. PWA & PULL TO REFRESH ---
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').then(() => console.log("PWA Ready"));
}

let pullStartY = 0;
document.addEventListener('touchstart', e => {
    if (window.scrollY === 0) pullStartY = e.touches[0].clientY;
}, { passive: true });

document.addEventListener('touchmove', e => {
    if (window.scrollY === 0 && pullStartY > 0) {
        if (e.touches[0].clientY - pullStartY > 70) {
            document.getElementById('ptr-indicator').classList.remove('-translate-y-full');
        }
    }
}, { passive: true });

document.addEventListener('touchend', e => {
    if (window.scrollY === 0 && pullStartY > 0) {
        if (e.changedTouches[0].clientY - pullStartY > 80) {
            loadData();
        }
        document.getElementById('ptr-indicator').classList.add('-translate-y-full');
        pullStartY = 0;
    }
});

// --- 3. UI STANDAR & RENDER DATA ---
function toggleDarkMode() {
    const html = document.documentElement;
    const icon = document.getElementById('themeIcon');
    if (html.classList.contains('dark')) {
        html.classList.remove('dark');
        icon.className = 'fa-solid fa-moon';
    } else {
        html.classList.add('dark');
        icon.className = 'fa-solid fa-sun text-yellow-400';
    }
}

function getItemIcon(itemName) {
    const name = itemName.toLowerCase();
    if (name.includes('sapu')) return '<i class="fa-solid fa-broom text-amber-600 text-xl"></i>';
    if (name.includes('wiper') || name.includes('kanebo') || name.includes('lap') || name.includes('pel') || name.includes('spons')) return '<i class="fa-solid fa-mitten text-emerald-500 text-xl"></i>';
    if (name.includes('sabun') || name.includes('hand soap') || name.includes('sunlight') || name.includes('sos') || name.includes('wipol') || name.includes('karbol') || name.includes('porstex') || name.includes('soklin')) return '<i class="fa-solid fa-pump-soap text-pink-500 text-xl"></i>';
    if (name.includes('plastik') || name.includes('kresek') || name.includes('sampah') || name.includes('engkrak') || name.includes('pengki')) return '<i class="fa-solid fa-trash-can text-slate-500 text-xl"></i>';
    if (name.includes('tissu') || name.includes('tisu')) return '<i class="fa-solid fa-scroll text-slate-400 text-xl"></i>';
    if (name.includes('semprot') || name.includes('cling') || name.includes('stella') || name.includes('hit') || name.includes('spray')) return '<i class="fa-solid fa-spray-can text-indigo-500 text-xl"></i>';
    if (name.includes('sarung tangan')) return '<i class="fa-solid fa-hand text-yellow-500 text-xl"></i>';
    if (name.includes('ember') || name.includes('gayung')) return '<i class="fa-solid fa-bucket text-blue-500 text-xl"></i>';
    if (name.includes('rompi') || name.includes('safetybelt')) return '<i class="fa-solid fa-shirt text-orange-500 text-xl"></i>';
    if (name.includes('masker')) return '<i class="fa-solid fa-mask text-teal-500 text-xl"></i>';
    if (name.includes('sikat')) return '<i class="fa-solid fa-brush text-rose-400 text-xl"></i>';
    if (name.includes('kabel') || name.includes('amplas')) return '<i class="fa-solid fa-screwdriver-wrench text-slate-600 text-xl"></i>';
    return '<i class="fa-solid fa-box-open text-slate-400 text-xl"></i>';
}

async function loadData() {
    document.getElementById('loading').style.display = 'flex';
    document.getElementById('content').innerHTML = '';
    
    try {
        const invRes = await fetch(API_URL + "?type=inventaris");
        const invJson = await invRes.json();
        inventoryData = invJson.data || [];
        document.getElementById('loading').style.display = 'none';
        renderData();
    } catch (err) {
        document.getElementById('loading').innerHTML = `
            <div class="text-center py-10 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                <div class="w-16 h-16 bg-red-50 dark:bg-red-900/30 text-red-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <i class="fa-solid fa-triangle-exclamation text-2xl"></i>
                </div>
                <p class="text-slate-800 dark:text-white font-bold mb-1">Gagal Terhubung</p>
                <button onclick="loadData()" class="bg-slate-800 text-white px-5 py-2.5 rounded-xl text-xs font-bold mt-2">Coba Muat Ulang</button>
            </div>`;
    }
}

function setViewMode(mode) {
    currentViewMode = mode;
    const gridBtn = document.getElementById('btnGridView');
    const listBtn = document.getElementById('btnListView');
    
    if (mode === 'grid') {
        gridBtn.className = "w-10 h-10 flex items-center justify-center rounded-lg text-sm font-bold bg-white text-emerald-600 shadow-sm transition-all";
        listBtn.className = "w-10 h-10 flex items-center justify-center rounded-lg text-sm font-bold text-slate-400 hover:text-slate-600 transition-all dark:bg-slate-800";
    } else {
        listBtn.className = "w-10 h-10 flex items-center justify-center rounded-lg text-sm font-bold bg-white text-emerald-600 shadow-sm transition-all";
        gridBtn.className = "w-10 h-10 flex items-center justify-center rounded-lg text-sm font-bold text-slate-400 hover:text-slate-600 transition-all dark:bg-slate-800";
    }
    renderData();
}

function setCategory(category, el) {
    currentCategory = category;
    document.querySelectorAll('.cat-chip').forEach(chip => {
        chip.className = "cat-chip px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap bg-white text-slate-500 border border-slate-200 hover:bg-slate-50 transition-all dark:bg-slate-800 dark:border-slate-700";
    });
    el.className = "cat-chip cat-active px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap bg-emerald-600 text-white shadow-sm shadow-emerald-200 transition-all";
    renderData();
}

function showToast(msg) {
    const toast = document.getElementById('toast');
    document.getElementById('toastMsg').innerText = msg;
    toast.style.transform = 'translateY(0)';
    setTimeout(() => { toast.style.transform = 'translateY(-150%)'; }, 3000);
}

function renderData() {
    const keyword = document.getElementById('search').value.toLowerCase();
    const content = document.getElementById('content');
    content.innerHTML = '';
    
    if (inventoryData.length === 0) return;
    
    content.className = currentViewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 gap-4" : "space-y-3";

    inventoryData.forEach(item => {
        const values = Object.values(item).join(' ').toLowerCase();
        if (!values.includes(keyword)) return;
        if (currentCategory !== 'Semua' && item.Kategori !== currentCategory) return;

        const sisa = Number(item.Sisa_Stok) || 0;
        const total = Number(item.Total_Stok) || 0;
        const dipinjamOlehRaw = item.Dipinjam_Oleh || ''; 
        let infoPeminjam = '';
        
        if (dipinjamOlehRaw) {
            let logHTML = '';
            const logs = dipinjamOlehRaw.split(';').map(l => l.trim()).filter(l => l);
            logs.forEach(log => {
               let isKembali = log.includes("Kembali");
               let iconStatus = isKembali ? '<i class="fa-solid fa-box-archive text-emerald-500"></i>' : '<i class="fa-solid fa-hand-holding-hand text-orange-500"></i>';
               let colorStatus = isKembali ? 'text-emerald-700 dark:text-emerald-400' : 'text-orange-700 dark:text-orange-400';
               
               logHTML += `
                 <div class="text-[10px] ${colorStatus} font-medium flex items-start gap-1.5 mb-1.5 last:mb-0 leading-tight border-b border-slate-200/50 dark:border-slate-700/50 pb-1 last:border-0 last:pb-0">
                    <div class="mt-0.5">${iconStatus}</div>
                    <div>${log}</div>
                 </div>`;
            });
            
            infoPeminjam = `
            <div class="mt-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-lg p-2.5">
               <div class="flex justify-between items-center mb-2 border-b border-slate-100 dark:border-slate-700 pb-1">
                   <span class="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Log Histori</span>
                   <button onclick="clearHistory('${item.ID_Barang}', '${item.Nama_Barang}')" class="text-[9px] font-bold text-rose-500 hover:text-rose-600 bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 px-2 py-1 rounded transition-colors"><i class="fa-solid fa-eraser"></i> Bersihkan</button>
               </div>
               ${logHTML}
            </div>`;
        }

        const itemIcon = getItemIcon(item.Nama_Barang);

        if (currentViewMode === 'grid') {
            content.innerHTML += `
            <div class="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm relative group dark:bg-[#1e293b]">
              <div class="absolute top-0 right-0 w-1.5 h-full ${sisa > 0 ? 'bg-emerald-400' : 'bg-rose-400'} rounded-r-2xl"></div>
              <div>
                <div class="flex justify-between items-center text-[10px] mb-3">
                  <span class="text-slate-500 font-bold flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                    <i class="fa-solid fa-location-dot text-emerald-500"></i> ${item.Lokasi_Simpan || 'Gudang'}
                  </span>
                  <div class="flex items-center gap-2">
                    <span class="font-black text-slate-300 dark:text-slate-600 uppercase tracking-wider">${item.Kategori}</span>
                    <button onclick="openEditItemModal('${item.ID_Barang}')" class="w-6 h-6 flex items-center justify-center bg-amber-50 text-amber-500 dark:bg-amber-500/10 rounded">
                      <i class="fa-solid fa-pen"></i>
                    </button>
                  </div>
                </div>
                
                <div class="flex gap-3 items-start mb-2">
                   <div class="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center shrink-0 border border-slate-100 dark:border-slate-700">${itemIcon}</div>
                   <div>
                      <h4 class="font-extrabold text-slate-800 text-sm mb-1 pr-2 line-clamp-2">${item.Nama_Barang}</h4>
                      <div class="flex items-baseline gap-1.5">
                        <span class="text-lg font-black ${sisa > 0 ? 'text-emerald-500' : 'text-rose-500'}">${sisa}</span>
                        <span class="text-[11px] font-bold text-slate-400">${item.Satuan || ''}</span>
                      </div>
                   </div>
                </div>
                ${infoPeminjam}
              </div>
              <div class="flex gap-2 pt-3 mt-3 border-t border-slate-50 dark:border-slate-700/50">
                <button onclick="openPinjamModal('${item.ID_Barang}', '${item.Nama_Barang}', 1, '${item.Satuan}')" class="flex-1 bg-rose-50 dark:bg-rose-500/10 text-rose-600 py-2 rounded-xl font-bold text-[11px]">
                  <i class="fa-solid fa-minus mr-1"></i> Pakai
                </button>
                <button onclick="openPinjamModal('${item.ID_Barang}', '${item.Nama_Barang}', -1, '${item.Satuan}')" class="flex-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 py-2 rounded-xl font-bold text-[11px]">
                  <i class="fa-solid fa-plus mr-1"></i> Kembali
                </button>
              </div>
            </div>`;
        } else {
            content.innerHTML += `
            <div class="relative w-full rounded-2xl mb-1 overflow-hidden bg-slate-100 dark:bg-slate-800">
               <div class="absolute inset-y-0 left-0 w-1/2 flex items-center pl-5 text-emerald-600 font-black"><i class="fa-solid fa-plus mr-2"></i> KEMBALI</div>
               <div class="absolute inset-y-0 right-0 w-1/2 flex justify-end items-center pr-5 text-rose-600 font-black">PAKAI <i class="fa-solid fa-minus ml-2"></i></div>
               
               <div class="swipe-card relative z-10 w-full bg-white dark:bg-[#1e293b] p-3 shadow-sm flex flex-col gap-2 rounded-2xl border border-slate-100 dark:border-slate-700 transition-transform duration-300" data-id="${item.ID_Barang}" data-name="${item.Nama_Barang}" data-unit="${item.Satuan}">
                  <div class="absolute top-0 left-0 h-full w-1.5 ${sisa > 0 ? 'bg-emerald-400' : 'bg-rose-400'} rounded-l-2xl"></div>
                  <div class="flex items-center gap-3">
                     <div class="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center shrink-0 ml-1">${itemIcon}</div>
                     <div class="flex-1 min-w-0">
                       <div class="flex justify-between items-center mb-0.5">
                         <span class="text-[10px] font-bold text-slate-500">
                            <i class="fa-solid fa-location-dot text-emerald-500"></i> ${item.Lokasi_Simpan || 'Gudang'}
                         </span>
                         <button onclick="openEditItemModal('${item.ID_Barang}')" class="text-amber-500 text-xs px-2 py-0.5 bg-amber-50 dark:bg-amber-500/10 rounded">
                            <i class="fa-solid fa-pen"></i>
                         </button>
                       </div>
                       <h4 class="font-bold text-slate-800 text-sm truncate mb-0.5">${item.Nama_Barang}</h4>
                       <div class="text-sm font-black ${sisa > 0 ? 'text-emerald-500' : 'text-rose-500'}">
                         ${sisa} <span class="text-[10px] font-bold text-slate-400">${item.Satuan || ''}</span>
                       </div>
                     </div>
                  </div>
                  ${infoPeminjam ? `<div class="ml-16 mr-2 border-t border-slate-50 dark:border-slate-700 pt-2">${infoPeminjam}</div>` : ''}
               </div>
            </div>`;
        }
    });

    if (currentViewMode === 'list') initSwipeCards();
}

function initSwipeCards() {
    document.querySelectorAll('.swipe-card').forEach(card => {
        let startX = 0;
        let isSwiping = false;
        
        card.addEventListener('touchstart', (e) => { 
            startX = e.touches[0].clientX; 
            isSwiping = true; 
            card.style.transition = 'none'; 
        }, { passive: true });
        
        card.addEventListener('touchmove', (e) => {
            if (!isSwiping) return; 
            let diffX = e.touches[0].clientX - startX;
            if (Math.abs(diffX) > 15) card.style.transform = `translateX(${diffX}px)`;
        }, { passive: true });
        
        card.addEventListener('touchend', (e) => {
            isSwiping = false; 
            card.style.transition = 'transform 0.3s ease-out';
            let diffX = e.changedTouches[0].clientX - startX;
            
            if (diffX > 90) { 
                card.style.transform = `translateX(120px)`;
                setTimeout(() => { 
                    card.style.transform = `translateX(0)`; 
                    openPinjamModal(card.dataset.id, card.dataset.name, -1, card.dataset.unit); 
                }, 200);
            } else if (diffX < -90) { 
                card.style.transform = `translateX(-120px)`;
                setTimeout(() => { 
                    card.style.transform = `translateX(0)`; 
                    openPinjamModal(card.dataset.id, card.dataset.name, 1, card.dataset.unit); 
                }, 200);
            } else { 
                card.style.transform = `translateX(0)`; 
            }
        });
    });
}

function openAddModal() { document.getElementById('addModal').classList.remove('hidden'); }
function closeAddModal() { document.getElementById('addModal').classList.add('hidden'); }

function openPinjamModal(id, namaBarang, aksi, satuan) {
    document.getElementById('pinjamItemId').value = id;
    document.getElementById('pinjamAksi').value = aksi; 
    document.getElementById('pinjamSatuan').innerText = satuan || 'pcs';
    document.getElementById('pinjamQty').value = ''; 
    document.getElementById('pinjamNamaInput').value = '';
    
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
    
    document.getElementById('pinjamModal').classList.remove('hidden');
}

function closePinjamModal() { document.getElementById('pinjamModal').classList.add('hidden'); }

async function submitPinjam(event) {
    event.preventDefault();
    const btn = document.getElementById('pinjamSubmitBtn'); 
    const id = document.getElementById('pinjamItemId').value;
    const baseAksi = Number(document.getElementById('pinjamAksi').value); 
    const qtyInput = parseFloat(document.getElementById('pinjamQty').value); 
    
    if (isNaN(qtyInput) || qtyInput <= 0) { 
        alert("Jumlah barang tidak valid!"); return; 
    }
    
    let namaPeminjam = document.getElementById('pinjamNamaInput').value;
    
    if (!namaPeminjam) { 
        alert("Nama wajib diisi!"); return; 
    }

    btn.innerText = "Menyimpan..."; 
    btn.disabled = true;
    
    try {
        await apiRequest({ 
            action: 'adjust_stock', 
            id: id, 
            change: baseAksi * qtyInput, 
            nama: namaPeminjam 
        });
        
        closePinjamModal(); 
        showToast("Tercatat ke Master Database!"); 
        loadData(); 
    } catch(e) { 
        if (e.message === 'PIN_SALAH') { 
            localStorage.removeItem('appPin'); 
            location.reload(); 
        } else { 
            showToast("Gagal menyimpan."); 
            btn.disabled = false; 
        }
    }
}

async function clearHistory(id, namaBarang) {
    if (!confirm(`Yakin ingin menghapus seluruh histori peminjaman untuk ${namaBarang}?`)) return;
    
    try {
        await apiRequest({ action: 'clear_history', id: id }); 
        showToast("Histori berhasil dibersihkan!"); 
        loadData();
    } catch(e) { 
        if (e.message === 'PIN_SALAH') { 
            localStorage.removeItem('appPin'); 
            location.reload(); 
        } else { 
            showToast("Gagal membersihkan histori."); 
        }
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
        await apiRequest({ action: 'create_item', item: newItem });
        closeAddModal(); 
        document.getElementById('addItemForm').reset(); 
        showToast("Barang berhasil ditambah!"); 
        loadData();
    } catch (e) { 
        if (e.message === 'PIN_SALAH') { 
            localStorage.removeItem('appPin'); 
            location.reload(); 
        } else { 
            showToast("Gagal menyimpan."); 
            btn.disabled = false; 
            btn.innerText = "Simpan ke Master Data"; 
        }
    }
}

function openEditItemModal(id) {
    const item = inventoryData.find(i => i.ID_Barang === id); 
    if (!item) return;
    
    document.getElementById('editId').value = item.ID_Barang; 
    document.getElementById('editName').value = item.Nama_Barang;
    document.getElementById('editCategory').value = item.Kategori; 
    document.getElementById('editLocation').value = item.Lokasi_Simpan;
    document.getElementById('editTotal').value = item.Total_Stok; 
    document.getElementById('editUnit').value = item.Satuan;
    document.getElementById('editDesc').value = item.Keterangan || ''; 
    document.getElementById('editItemModal').classList.remove('hidden');
}

function closeEditItemModal() { document.getElementById('editItemModal').classList.add('hidden'); }

async function submitEditItem(event) {
    event.preventDefault();
    const btn = document.getElementById('submitEditBtn'); 
    btn.innerText = "Menyimpan..."; 
    btn.disabled = true;
    
    const editedItem = {
        Nama_Barang: document.getElementById('editName').value, 
        Kategori: document.getElementById('editCategory').value,
        Lokasi_Simpan: document.getElementById('editLocation').value, 
        Total_Stok: document.getElementById('editTotal').value,
        Satuan: document.getElementById('editUnit').value, 
        Keterangan: document.getElementById('editDesc').value
    };
    
    try {
        await apiRequest({ 
            action: 'edit_item', 
            id: document.getElementById('editId').value, 
            item: editedItem 
        });
        closeEditItemModal(); 
        showToast("Perubahan barang disimpan!"); 
        loadData();
    } catch (e) { 
        if (e.message === 'PIN_SALAH') { 
            localStorage.removeItem('appPin'); 
            location.reload(); 
        } else { 
            showToast("Gagal mengedit barang."); 
            btn.disabled = false; 
            btn.innerText = "Update Data"; 
        }
    }
}
