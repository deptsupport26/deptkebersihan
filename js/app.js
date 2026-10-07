const API_URL = "https://script.google.com/macros/s/AKfycbxY3vUvlyDXYrYwFT9x9J7d8_PcTgrXGNAJiat2XH3l1tqLWHq8Imn_SjiP6Ey1NAH3GQ/exec";
const APP_PIN = "KEBERSIHANOKT26";

let currentViewMode = 'list'; 
let currentCategory = 'Semua';
let currentTabStatus = 'BAWAAN'; 
let inventoryData = [];
let savedPin = localStorage.getItem('appPin') || '';

document.addEventListener('DOMContentLoaded', () => {
    const icon = document.getElementById('themeIcon');
    if (document.documentElement.classList.contains('dark')) { if(icon) icon.className = 'fa-solid fa-sun text-yellow-400'; } 
    else { if(icon) icon.className = 'fa-solid fa-moon'; }
    if (savedPin === APP_PIN) { loadData(); } else { document.getElementById('pinModal').classList.remove('hidden'); }
});

function unlockApp() {
    const val = document.getElementById('inputPin').value.toUpperCase();
    if (val === APP_PIN) { savedPin = val; localStorage.setItem('appPin', savedPin); document.getElementById('pinModal').classList.add('hidden'); loadData(); } 
    else { alert("Kata Sandi Salah! Silakan coba lagi."); document.getElementById('inputPin').value = ''; }
}

async function apiRequest(payload) {
    payload.pin = savedPin;
    const res = await fetch(API_URL, { method: 'POST', body: JSON.stringify(payload) });
    const json = await res.json();
    if (json.status === 'error') throw new Error(json.message);
    return json;
}

if ('serviceWorker' in navigator) { navigator.serviceWorker.register('sw.js').then(() => console.log("PWA Ready")); }

function toggleDarkMode() {
    const html = document.documentElement; const icon = document.getElementById('themeIcon');
    if (html.classList.contains('dark')) { html.classList.remove('dark'); if(icon) icon.className = 'fa-solid fa-moon'; localStorage.setItem('theme', 'light'); } 
    else { html.classList.add('dark'); if(icon) icon.className = 'fa-solid fa-sun text-yellow-400'; localStorage.setItem('theme', 'dark'); }
}

function getItemIcon(itemName) {
    const name = itemName.toLowerCase();
    if (name.includes('sapu')) return '<i class="fa-solid fa-broom text-amber-600 text-xl"></i>';
    if (name.includes('wiper') || name.includes('kanebo') || name.includes('pel')) return '<i class="fa-solid fa-mitten text-emerald-500 text-xl"></i>';
    if (name.includes('sabun') || name.includes('wipol') || name.includes('soklin')) return '<i class="fa-solid fa-pump-soap text-pink-500 text-xl"></i>';
    if (name.includes('plastik') || name.includes('sampah')) return '<i class="fa-solid fa-trash-can text-slate-500 text-xl"></i>';
    if (name.includes('tissu') || name.includes('tisu')) return '<i class="fa-solid fa-scroll text-slate-400 text-xl"></i>';
    if (name.includes('semprot') || name.includes('stella')) return '<i class="fa-solid fa-spray-can text-indigo-500 text-xl"></i>';
    if (name.includes('sarung tangan')) return '<i class="fa-solid fa-hand text-yellow-500 text-xl"></i>';
    if (name.includes('ember') || name.includes('gayung')) return '<i class="fa-solid fa-bucket text-blue-500 text-xl"></i>';
    if (name.includes('kabel') || name.includes('amplas')) return '<i class="fa-solid fa-screwdriver-wrench text-slate-600 text-xl"></i>';
    return '<i class="fa-solid fa-box-open text-slate-400 text-xl"></i>';
}

function setTabStatus(status) { currentTabStatus = status; renderData(); }
function reportBug() { window.location.href = "mailto:developer@my.id?subject=Laporan Bug Web Kebersihan"; }

async function loadData(isSilent = false) {
    if (!isSilent) { document.getElementById('loading').style.display = 'flex'; document.getElementById('content').innerHTML = ''; }
    try {
        const invRes = await fetch(API_URL + "?type=inventaris");
        const invJson = await invRes.json();
        inventoryData = invJson.data || [];
        document.getElementById('loading').style.display = 'none';
        renderData();
    } catch (err) {
        if (!isSilent) document.getElementById('loading').innerHTML = `<div class="text-center py-10 bg-white rounded-2xl"><p class="text-red-500 font-bold">Gagal Terhubung</p><button onclick="loadData()" class="mt-2 bg-slate-800 text-white px-4 py-2 rounded">Muat Ulang</button></div>`;
    }
}

function setViewMode(mode) {
    currentViewMode = mode; const gridBtn = document.getElementById('btnGridView'); const listBtn = document.getElementById('btnListView');
    if (mode === 'grid') { gridBtn.classList.add('bg-white', 'text-emerald-600'); listBtn.classList.remove('bg-white', 'text-emerald-600'); } 
    else { listBtn.classList.add('bg-white', 'text-emerald-600'); gridBtn.classList.remove('bg-white', 'text-emerald-600'); }
    renderData();
}

function setCategory(category, el) {
    currentCategory = category;
    document.querySelectorAll('.cat-chip').forEach(chip => { chip.className = "cat-chip px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap bg-white text-slate-500 border border-slate-200 dark:bg-slate-800"; });
    el.className = "cat-chip cat-active px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap bg-emerald-600 text-white shadow-sm";
    renderData();
}

function showToast(msg) { const t = document.getElementById('toast'); document.getElementById('toastMsg').innerText = msg; t.style.transform = 'translateY(0)'; setTimeout(() => { t.style.transform = 'translateY(-150%)'; }, 3000); }

function renderData() {
    const keyword = document.getElementById('search').value.toLowerCase();
    const content = document.getElementById('content'); content.innerHTML = '';
    if (inventoryData.length === 0) return;

    const tabMenu = `
    <div class="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1 mb-4 shadow-inner text-sm font-bold">
        <button onclick="setTabStatus('BAWAAN')" class="flex-1 py-2 rounded-lg transition-all ${currentTabStatus === 'BAWAAN' ? 'bg-white dark:bg-slate-700 text-emerald-600 shadow' : 'text-slate-400'}"><i class="fa-solid fa-truck-fast mr-1"></i> Akan Dibawa</button>
        <button onclick="setTabStatus('SEMUA')" class="flex-1 py-2 rounded-lg transition-all ${currentTabStatus === 'SEMUA' ? 'bg-white dark:bg-slate-700 text-emerald-600 shadow' : 'text-slate-400'}"><i class="fa-solid fa-warehouse mr-1"></i> Inven Master</button>
    </div>`;

    content.innerHTML = tabMenu;
    const wrapper = document.createElement('div');
    wrapper.className = currentViewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 gap-4" : "space-y-3";
    content.appendChild(wrapper);

    inventoryData.forEach(item => {
        const values = Object.values(item).join(' ').toLowerCase();
        if (!values.includes(keyword)) return;
        if (currentCategory !== 'Semua' && item.Kategori !== currentCategory) return;

        let isBawaan = item.Dibawa_Ke_Gedung === 'YA' || item.Dibawa_Ke_Gedung === true || String(item.Dibawa_Ke_Gedung).toUpperCase() === 'YA';
        if (currentTabStatus === 'BAWAAN' && !isBawaan) return;

        const sisa = Number(item.Sisa_Stok) || 0; const total = Number(item.Total_Stok) || 0; const dipakai = Number(item.Sedang_Dipakai) || 0; 
        const dipinjamOlehRaw = item.Dipinjam_Oleh || ''; let infoPeminjam = '';
        
        if (dipinjamOlehRaw) {
            let logHTML = '';
            const logs = dipinjamOlehRaw.split(';').map(l => l.trim()).filter(l => l);
            logs.forEach(log => {
               let isKembali = log.includes("Kembali");
               let iconStatus = isKembali ? '<i class="fa-solid fa-box-archive text-emerald-500"></i>' : '<i class="fa-solid fa-hand-holding-hand text-orange-500"></i>';
               let colorStatus = isKembali ? 'text-emerald-700' : 'text-orange-700';
               logHTML += `<div class="text-[10px] ${colorStatus} font-medium flex items-start gap-1.5 mb-1.5 border-b border-slate-200/50 pb-1"><div class="mt-0.5">${iconStatus}</div><div>${log}</div></div>`;
            });
            infoPeminjam = `<div class="mt-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 rounded-lg p-2.5"><div class="flex justify-between items-center mb-2"><span class="text-[9px] font-bold text-slate-400">LOG HISTORI</span><button onclick="clearHistory('${item.ID_Barang}', '${item.Nama_Barang}')" class="text-[9px] font-bold text-rose-500 bg-rose-50 px-2 py-1 rounded"><i class="fa-solid fa-eraser"></i> Bersihkan</button></div>${logHTML}</div>`;
        }

        const itemIcon = getItemIcon(item.Nama_Barang);
        const badgeDipakai = dipakai > 0 ? `<span class="text-[10px] font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded-md ml-2">Dipinjam: ${dipakai}</span>` : '';
        const locBox = item.Lokasi_Box ? `<span class="ml-2 text-indigo-500"><i class="fa-solid fa-box-open"></i> ${item.Lokasi_Box}</span>` : '';
        const locHTML = `<span class="text-[10px] text-slate-500 font-bold flex items-center bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md"><i class="fa-solid fa-location-dot text-emerald-500 mr-1.5"></i> ${item.Lokasi_Simpan || 'Gudang'} ${locBox}</span>`;

        if (currentViewMode === 'grid') {
            wrapper.innerHTML += `
            <div class="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm relative group dark:bg-[#1e293b]">
              <div class="absolute top-0 right-0 w-1.5 h-full ${sisa > 0 ? 'bg-emerald-400' : 'bg-rose-400'} rounded-r-2xl"></div>
              <div>
                <div class="flex justify-between items-center mb-3">
                  ${locHTML}
                  <div class="flex items-center gap-2"><span class="text-[10px] font-black text-slate-300 uppercase">${item.Kategori}</span><button onclick="openEditItemModal('${item.ID_Barang}')" class="w-6 h-6 flex items-center justify-center bg-amber-50 text-amber-500 rounded"><i class="fa-solid fa-pen"></i></button></div>
                </div>
                <div class="flex gap-3 items-start mb-2">
                   <div class="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center shrink-0 border border-slate-100">${itemIcon}</div>
                   <div>
                      <h4 class="font-extrabold text-slate-800 text-sm mb-1">${item.Nama_Barang}</h4>
                      <div class="flex items-center flex-wrap mt-1">
                        <span class="text-xl font-black ${sisa > 0 ? 'text-emerald-500' : 'text-rose-500'}">${sisa}</span><span class="text-sm font-bold text-slate-400 mx-1.5">/</span><span class="text-sm font-bold text-slate-500">${total}</span><span class="text-[11px] font-bold text-slate-400 ml-1.5">${item.Satuan || ''}</span>
                        ${badgeDipakai}
                      </div>
                   </div>
                </div>
                ${infoPeminjam}
              </div>
              <div class="flex gap-2 pt-3 mt-3 border-t border-slate-50">
                <button onclick="openPinjamModal('${item.ID_Barang}', '${item.Nama_Barang}', 1, '${item.Satuan}')" class="flex-1 bg-rose-50 text-rose-600 py-2 rounded-xl font-bold text-[11px]"><i class="fa-solid fa-minus mr-1"></i> Pakai</button>
                <button onclick="openPinjamModal('${item.ID_Barang}', '${item.Nama_Barang}', -1, '${item.Satuan}')" class="flex-1 bg-emerald-50 text-emerald-600 py-2 rounded-xl font-bold text-[11px]"><i class="fa-solid fa-plus mr-1"></i> Kembali</button>
              </div>
            </div>`;
        } else {
            wrapper.innerHTML += `
            <div class="relative w-full rounded-2xl mb-1 overflow-hidden bg-slate-100 dark:bg-slate-800">
               <div class="swipe-card relative z-10 w-full bg-white dark:bg-[#1e293b] p-3 shadow-sm flex flex-col gap-2 rounded-2xl border border-slate-100" data-id="${item.ID_Barang}" data-name="${item.Nama_Barang}" data-unit="${item.Satuan}">
                  <div class="absolute top-0 left-0 h-full w-1.5 ${sisa > 0 ? 'bg-emerald-400' : 'bg-rose-400'} rounded-l-2xl"></div>
                  <div class="flex items-center gap-3">
                     <div class="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center shrink-0 ml-1">${itemIcon}</div>
                     <div class="flex-1 min-w-0">
                       <div class="flex justify-between items-center mb-0.5">
                         ${locHTML}
                         <button onclick="openEditItemModal('${item.ID_Barang}')" class="text-amber-500 text-xs px-2 py-0.5 bg-amber-50 rounded"><i class="fa-solid fa-pen"></i></button>
                       </div>
                       <h4 class="font-bold text-slate-800 text-sm truncate mb-0.5">${item.Nama_Barang}</h4>
                       <div class="flex items-center flex-wrap mt-1">
                         <span class="text-base font-black ${sisa > 0 ? 'text-emerald-500' : 'text-rose-500'}">${sisa}</span><span class="text-xs font-bold text-slate-400 mx-1">/</span><span class="text-xs font-bold text-slate-500">${total}</span><span class="text-[10px] font-bold text-slate-400 ml-1.5">${item.Satuan || ''}</span>
                         ${badgeDipakai}
                       </div>
                     </div>
                  </div>
                  ${infoPeminjam ? `<div class="ml-16 mr-2 border-t border-slate-50 pt-2">${infoPeminjam}</div>` : ''}
               </div>
            </div>`;
        }
    });
}

function openAddModal() { document.getElementById('addModal').classList.remove('hidden'); }
function closeAddModal() { document.getElementById('addModal').classList.add('hidden'); }

function openPinjamModal(id, namaBarang, aksi, satuan) {
    document.getElementById('pinjamItemId').value = id; document.getElementById('pinjamAksi').value = aksi; 
    document.getElementById('pinjamSatuan').innerText = satuan || 'pcs'; document.getElementById('pinjamQty').value = ''; document.getElementById('pinjamNamaInput').value = '';
    const title = document.getElementById('pinjamTitle'); const icon = document.getElementById('pinjamIcon'); const desc = document.getElementById('pinjamDesc'); const btn = document.getElementById('pinjamSubmitBtn');
    if (aksi === 1) {
        title.innerText = "Pakai Barang"; icon.className = "w-12 h-12 rounded-2xl flex items-center justify-center mb-3 bg-rose-100 text-rose-500 text-xl"; icon.innerHTML = "<i class=\"fa-solid fa-hand-holding-hand\"></i>";
        desc.innerHTML = `Barang: <strong class="text-slate-800">${namaBarang}</strong>. Berapa jumlah dipakai?`;
        btn.className = "w-full text-white font-bold py-3.5 rounded-xl text-sm shadow-lg active:scale-95 bg-rose-500 hover:bg-rose-600"; btn.innerText = "Konfirmasi Pakai";
    } else {
        title.innerText = "Kembalikan Barang"; icon.className = "w-12 h-12 rounded-2xl flex items-center justify-center mb-3 bg-emerald-100 text-emerald-500 text-xl"; icon.innerHTML = "<i class=\"fa-solid fa-box-archive\"></i>";
        desc.innerHTML = `Barang: <strong class="text-slate-800">${namaBarang}</strong>. Berapa jumlah dikembalikan?`;
        btn.className = "w-full text-white font-bold py-3.5 rounded-xl text-sm shadow-lg active:scale-95 bg-emerald-500 hover:bg-emerald-600"; btn.innerText = "Konfirmasi Kembali";
    }
    document.getElementById('pinjamModal').classList.remove('hidden');
}
function closePinjamModal() { document.getElementById('pinjamModal').classList.add('hidden'); }

async function submitPinjam(event) {
    if (event) event.preventDefault();
    const id = document.getElementById('pinjamItemId').value; const aksi = Number(document.getElementById('pinjamAksi').value); const qtyInput = parseFloat(document.getElementById('pinjamQty').value); const namaKru = document.getElementById('pinjamNamaInput').value;
    if (isNaN(qtyInput) || qtyInput <= 0 || !namaKru || !namaKru.trim()) { showToast("Data tidak valid!"); return; }
    closePinjamModal();
    const itemIndex = inventoryData.findIndex(i => i.ID_Barang === id);
    if(itemIndex > -1) {
        inventoryData[itemIndex].Sedang_Dipakai = Number(inventoryData[itemIndex].Sedang_Dipakai) + (aksi * qtyInput);
        inventoryData[itemIndex].Sisa_Stok = Number(inventoryData[itemIndex].Total_Stok) - inventoryData[itemIndex].Sedang_Dipakai;
        renderData(); showToast("✓ Memproses di background...");
    }
    try {
        await apiRequest({ action: 'adjust_stock', id: id, change: aksi * qtyInput, nama: namaKru.trim() });
        loadData(true); 
    } catch(e) { 
        if (e && e.message === 'PIN_SALAH') { localStorage.removeItem('appPin'); location.reload(); } else { showToast("❌ Gagal mengirim."); loadData(true); }
    }
}

async function clearHistory(id, namaBarang) {
    if (!confirm(`Hapus histori peminjaman untuk ${namaBarang}?`)) return;
    try { await apiRequest({ action: 'clear_history', id: id }); showToast("Histori dibersihkan!"); loadData(true); } 
    catch(e) { showToast("Gagal membersihkan histori."); }
}

async function submitNewItem(event) {
    event.preventDefault(); const btn = document.getElementById('submitBtn'); btn.innerText = "Memproses..."; btn.disabled = true;
    const newItem = {
        Nama_Barang: document.getElementById('newName').value, Kategori: document.getElementById('newCategory').value,
        Lokasi_Simpan: document.getElementById('newLocation').value, Lokasi_Box: document.getElementById('newLokasiBox').value, 
        Total_Stok: document.getElementById('newTotal').value, Satuan: document.getElementById('newUnit').value, 
        Keterangan: document.getElementById('newDesc').value, Dibawa_Ke_Gedung: document.getElementById('newBawaKeGedung').value
    };
    try {
        await apiRequest({ action: 'create_item', item: newItem });
        closeAddModal(); document.getElementById('addItemForm').reset(); showToast("Barang ditambah!"); loadData(true); 
    } catch (e) { showToast("Gagal menyimpan."); btn.disabled = false; btn.innerText = "Simpan Data"; }
}

function openEditItemModal(id) {
    const item = inventoryData.find(i => i.ID_Barang === id); if (!item) return;
    document.getElementById('editId').value = item.ID_Barang; document.getElementById('editName').value = item.Nama_Barang;
    document.getElementById('editCategory').value = item.Kategori; document.getElementById('editLocation').value = item.Lokasi_Simpan || '';
    document.getElementById('editLokasiBox').value = item.Lokasi_Box || ''; document.getElementById('editBawaKeGedung').value = item.Dibawa_Ke_Gedung || 'YA';
    document.getElementById('editTotal').value = item.Total_Stok; document.getElementById('editUnit').value = item.Satuan; document.getElementById('editDesc').value = item.Keterangan || ''; 
    let extraBtns = document.getElementById('extraEditButtons');
    if(!extraBtns) {
        extraBtns = document.createElement('div'); extraBtns.id = 'extraEditButtons'; extraBtns.className = "flex gap-2 mt-4 pt-4 border-t border-slate-100";
        document.getElementById('editItemForm').appendChild(extraBtns);
    }
    extraBtns.innerHTML = `<button type="button" onclick="pindahLokasi('${id}')" class="flex-1 bg-blue-50 text-blue-600 font-bold py-2.5 rounded-xl text-xs"><i class="fa-solid fa-truck"></i> Pindah Box</button><button type="button" onclick="hapusBarang('${id}')" class="flex-1 bg-red-50 text-red-600 font-bold py-2.5 rounded-xl text-xs"><i class="fa-solid fa-trash"></i> Hapus</button>`;
    document.getElementById('editItemModal').classList.remove('hidden');
}

function closeEditItemModal() { document.getElementById('editItemModal').classList.add('hidden'); }

async function submitEditItem(event) {
    event.preventDefault(); const btn = document.getElementById('submitEditBtn'); btn.innerText = "Menyimpan..."; btn.disabled = true;
    const editedItem = {
        Nama_Barang: document.getElementById('editName').value, Kategori: document.getElementById('editCategory').value,
        Lokasi_Simpan: document.getElementById('editLocation').value, Lokasi_Box: document.getElementById('editLokasiBox').value, 
        Total_Stok: document.getElementById('editTotal').value, Satuan: document.getElementById('editUnit').value, 
        Keterangan: document.getElementById('editDesc').value, Dibawa_Ke_Gedung: document.getElementById('editBawaKeGedung').value
    };
    try { await apiRequest({ action: 'edit_item', id: document.getElementById('editId').value, item: editedItem }); closeEditItemModal(); showToast("Perubahan disimpan!"); loadData(true); } 
    catch (e) { showToast("Gagal mengedit barang."); btn.disabled = false; btn.innerText = "Update Data"; }
}

async function pindahLokasi(id) {
    const newLoc = prompt("Ketik Pindah Ke Box Mana? (Misal: Box 1):");
    if(!newLoc) return; closeEditItemModal(); showToast("🚚 Memindahkan...");
    await apiRequest({ action: 'move_item', id: id, newLocation: newLoc }); loadData(true);
}

async function hapusBarang(id) {
    if(!confirm("⚠️ YAKIN HAPUS BARANG INI DARI DATABASE?")) return;
    closeEditItemModal(); showToast("🗑️ Menghapus..."); await apiRequest({ action: 'delete_item', id: id }); loadData(true);
}

function openReportModal() { document.getElementById('reportModal').classList.remove('hidden'); }
function closeReportModal() { document.getElementById('reportModal').classList.add('hidden'); }

function generatePDF(type) {
    const isBawaanOnly = confirm("Cetak HANYA Barang 'Akan Dibawa' (OK) atau SELURUH Master Inventaris (Cancel)?");
    const { jsPDF } = window.jspdf; const doc = new jsPDF();
    const dateStr = new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    doc.setFont("helvetica", "bold"); doc.setFontSize(16); doc.text("DEPARTEMEN KEBERSIHAN", 105, 20, { align: "center" });
    doc.setFontSize(10); doc.setFont("helvetica", "normal"); doc.text(`Pertemuan Wilayah - Oktober 2026 (${isBawaanOnly ? 'Akan Dibawa' : 'Master'})`, 105, 26, { align: "center" }); doc.line(14, 30, 196, 30);
    let fileName = ""; let dataToPrint = inventoryData;
    if (isBawaanOnly) { dataToPrint = inventoryData.filter(i => i.Dibawa_Ke_Gedung === 'YA' || i.Dibawa_Ke_Gedung === true || String(i.Dibawa_Ke_Gedung).toUpperCase() === 'YA'); }
    if (type === 'stok') {
        doc.setFont("helvetica", "bold"); doc.setFontSize(12); doc.text("LAPORAN SISA STOK AKHIR", 14, 40); doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.text(`Tanggal Unduh: ${dateStr}`, 14, 45);
        const tableHeaders = [["Nama Barang", "Keterangan", "Lokasi", "Total", "Dipakai", "SISA"]];
        let alatData = []; let habisPakaiData = [];
        dataToPrint.forEach(item => {
            const locFinal = item.Lokasi_Box ? `${item.Lokasi_Simpan} (${item.Lokasi_Box})` : (item.Lokasi_Simpan || 'Gudang');
            const rowData = [ item.Nama_Barang, item.Keterangan || '-', locFinal, `${item.Total_Stok} ${item.Satuan}`, `${item.Sedang_Dipakai} ${item.Satuan}`, `${item.Sisa_Stok} ${item.Satuan}` ];
            if (item.Kategori === "Alat / Sabun") { alatData.push(rowData); } else { habisPakaiData.push(rowData); }
        });
        let currentY = 50;
        if (alatData.length > 0) {
            doc.setFont("helvetica", "bold"); doc.setFontSize(10); doc.setTextColor(16, 185, 129); doc.text("KATEGORI: ALAT / SABUN", 14, currentY);
            doc.autoTable({ startY: currentY + 3, head: tableHeaders, body: alatData, theme: 'grid', headStyles: { fillColor: [16, 185, 129] }, styles: { fontSize: 8, font: "helvetica", valign: 'middle', cellPadding: 2 }, columnStyles: { 5: { fontStyle: 'bold', textColor: [225, 29, 72] } }, margin: { top: 10 } });
            currentY = doc.lastAutoTable.finalY + 10;
        }
        if (habisPakaiData.length > 0) {
            if (currentY > 250) { doc.addPage(); currentY = 20; }
            doc.setFont("helvetica", "bold"); doc.setFontSize(10); doc.setTextColor(59, 130, 246); doc.text("KATEGORI: HABIS PAKAI", 14, currentY);
            doc.autoTable({ startY: currentY + 3, head: tableHeaders, body: habisPakaiData, theme: 'grid', headStyles: { fillColor: [59, 130, 246] }, styles: { fontSize: 8, font: "helvetica", valign: 'middle', cellPadding: 2 }, columnStyles: { 5: { fontStyle: 'bold', textColor: [225, 29, 72] } }, margin: { top: 10 } });
        }
        fileName = `Laporan_Stok_Kebersihan.pdf`;
    } else if (type === 'penggunaan') {
        doc.setFont("helvetica", "bold"); doc.setFontSize(12); doc.text("LAPORAN RIWAYAT PENGGUNAAN BARANG", 14, 40); doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.text(`Tanggal Unduh: ${dateStr}`, 14, 45);
        const tableHeaders = [["Kategori", "Nama Barang", "Satuan", "Kru Peminjam & Detail Waktu"]]; let tableData = []; const sortedData = [...dataToPrint].sort((a, b) => a.Kategori.localeCompare(b.Kategori));
        sortedData.forEach(item => { const logs = item.Dipinjam_Oleh ? item.Dipinjam_Oleh.replace(/;/g, '\n') : '-'; if (logs !== '-') { tableData.push([ item.Kategori, item.Nama_Barang, item.Satuan, logs ]); } });
        doc.autoTable({ startY: 50, head: tableHeaders, body: tableData, theme: 'grid', headStyles: { fillColor: [16, 185, 129] }, styles: { fontSize: 8, font: "helvetica", valign: 'middle' } });
        fileName = `Laporan_Riwayat_Kebersihan.pdf`;
    }
    doc.save(fileName); closeReportModal(); showToast("PDF Berhasil Diunduh!");
}
