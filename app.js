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

// 1. Anasayfa vitrini için güncelleme
function urunleriEkranaBas(urunler) {
    const vitrin = document.getElementById('urun-vitrini');
    if (!vitrin) return;
    vitrin.innerHTML = '';
    
    urunler.forEach(urun => {
        // İlk görseli vitrin için seç
        let gorsel = (urun.gorseller && urun.gorseller.length > 0) ? urun.gorseller[0] : 'placeholder.jpg';
        
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
            <a href="${urun.dolapLink || '#'}" target="_blank" class="satin-al-btn-kucuk">Dolap'tan Satın Al</a>
        `;
        vitrin.appendChild(kart);
    });
}

// 2. Detay Modal için güncelleme (Çoklu Görsel Desteği)
function detayModalAc(id) {
    const urun = tumUrunler.find(u => u.id === id);
    if (!urun) return;
    
    const modal = document.getElementById('urun-detay-modal');
    const modalDetay = document.getElementById('modal-detay-alani');
    
    // Görselleri yan yana dizmek için HTML oluştur
    let gorsellerHTML = urun.gorseller ? urun.gorseller.map(img => `<img src="${img}" class="modal-gorsel-kucuk">`).join('') : '';
    
    modalDetay.innerHTML = `
        <button class="kapat-btn" onclick="detayModalKapat()">×</button>
        <div class="gorsel-galerisi">${gorsellerHTML}</div>
        <div class="modal-metin">
            <p class="kategori-etiket">${urun.kategori}</p>
            <h2>${urun.isim}</h2>
            <p class="modal-aciklama">${urun.aciklama}</p>
            <div class="modal-fiyat-alani">
                <span class="fiyat-etiketi">Fiyat</span>
                <h3 class="fiyat-degeri">${urun.fiyat}</h3>
            </div>
            <a href="${urun.dolapLink}" target="_blank" class="satin-al-btn">Dolap'tan Satın Al</a>
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
