let tumUrunler = [];

// Sayfa yüklendiğinde çalışacak ana tetikleyici
document.addEventListener('DOMContentLoaded', () => {
    urunleriYukle();
});

async function urunleriYukle() {
    try {
        // GitHub Pages üzerinde dosyanın ana dizinde olduğunu varsayıyoruz
        const response = await fetch('./urunler.json');
        if (!response.ok) throw new Error("JSON dosyası sunucuda bulunamadı!");
        
        tumUrunler = await response.json();
        
        // Veri başarıyla gelince ekranı çiz
        urunleriEkranaBas(tumUrunler);
    } catch (error) {
        console.error("Yükleme Hatası:", error);
        document.getElementById('urun-vitrini').innerHTML = `<p style="text-align:center;">Ürünler yüklenemedi.</p>`;
    }
}

function urunleriEkranaBas(urunler) {
    const vitrin = document.getElementById('urun-vitrini');
    if (!vitrin) return;
    vitrin.innerHTML = '';
    
    urunler.forEach(urun => {
        let gorsel = (urun.gorseller && urun.gorseller.length > 0) ? urun.gorseller[0] : 'placeholder.jpg';
        const isStoktaYok = urun.fiyat === "Stokta yok";
        
        const kart = document.createElement('div');
        kart.className = 'urun-karti';
        
        kart.innerHTML = `
            ${urun.etiket ? `<span class="urun-etiket">${urun.etiket}</span>` : ''}
            <div class="urun-resim-wrapper" onclick="detayModalAc(${urun.id})">
                <img src="${gorsel}" alt="${urun.isim}" class="urun-resim-tek">
            </div>
            <div class="urun-bilgi-alani" onclick="detayModalAc(${urun.id})">
                <p class="kategori-etiket">${urun.kategori || ''}</p>
                <h3 class="urun-isim">${urun.isim || ''}</h3>
                <p class="urun-fiyat">${urun.fiyat || '0 TL'}</p>
            </div>
            <a href="${isStoktaYok ? '#' : urun.dolapLink}" 
               target="_blank" 
               class="satin-al-btn-kucuk ${isStoktaYok ? 'disabled' : ''}"
               onclick="${isStoktaYok ? 'return false;' : ''}">
               ${isStoktaYok ? 'Tükendi' : 'Satın Al'}
            </a>
        `;
        vitrin.appendChild(kart);
    });
}

function detayModalAc(id) {
    const urun = tumUrunler.find(u => u.id === id);
    if (!urun) return;
    
    const modal = document.getElementById('urun-detay-modal');
    const modalDetay = document.getElementById('modal-detay-alani');
    const isStoktaYok = urun.fiyat === "Stokta yok";
    
    modalDetay.innerHTML = `
        <button class="kapat-btn" onclick="detayModalKapat()">×</button>
        <img src="${urun.gorseller ? urun.gorseller[0] : 'placeholder.jpg'}" class="modal-gorsel">
        <div class="modal-metin">
            <p class="kategori-etiket">${urun.kategori}</p>
            <h2>${urun.isim}</h2>
            <p class="modal-aciklama">${urun.aciklama}</p>
            <div class="modal-fiyat-alani">
                <span class="fiyat-etiketi">Fiyat</span>
                <h3 class="fiyat-degeri">${urun.fiyat}</h3>
            </div>
            <a href="${isStoktaYok ? '#' : urun.dolapLink}" target="_blank" 
               class="satin-al-btn ${isStoktaYok ? 'disabled' : ''}">
               ${isStoktaYok ? 'Stokta Yok' : 'Dolap\'tan Satın Al'}
            </a>
        </div>
    `;
    modal.style.display = "block";
}

function detayModalKapat() {
    document.getElementById('urun-detay-modal').style.display = "none";
}

// Dışarı tıklayınca kapatma
window.onclick = function(event) {
    const modal = document.getElementById('urun-detay-modal');
    if (event.target == modal) {
        detayModalKapat();
    }
}
