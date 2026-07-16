let tumUrunler = [];

// Sayfa yüklendiğinde çalışacak ana tetikleyici
document.addEventListener('DOMContentLoaded', () => {
    urunleriYukle();
});

async function urunleriYukle() {
    try {
        // GitHub'da dosya yolları önemlidir, './' ile aynı dizine bakıyoruz
        const response = await fetch('./urunler.json');
        if (!response.ok) throw new Error("JSON dosyası sunucuda bulunamadı!");
        
        tumUrunler = await response.json();
        
        // Veri başarıyla gelince ekranı çiz
        urunleriEkranaBas(tumUrunler);
    } catch (error) {
        console.error("Yükleme Hatası:", error);
        document.getElementById('urun-vitrini').innerHTML = `<p>Ürünler yüklenemedi. Lütfen konsolu kontrol edin.</p>`;
    }
}

function urunleriEkranaBas(urunler) {
    const vitrin = document.getElementById('urun-vitrini');
    if (!vitrin) return;
    vitrin.innerHTML = '';
    
    urunler.forEach(urun => {
        // Görsel yoksa placeholder göster
        let gorsel = (urun.gorseller && urun.gorseller.length > 0) ? urun.gorseller[0] : 'placeholder.jpg';
        
        const kart = document.createElement('div');
        kart.className = 'urun-karti';
        kart.onclick = () => detayModalAc(urun.id); // Tıklanınca detay aç
        
        kart.innerHTML = `
            ${urun.etiket ? `<span class="urun-etiket">${urun.etiket}</span>` : ''}
            <div class="urun-resim-wrapper">
                <img src="${gorsel}" alt="${urun.isim}" class="urun-resim-tek">
            </div>
            <div class="urun-bilgi-alani">
                <p class="kategori-etiket">${urun.kategori || ''}</p>
                <h3 class="urun-isim">${urun.isim || ''}</h3>
                <p class="urun-fiyat">${urun.fiyat || '0 TL'}</p>
            </div>
        `;
        vitrin.appendChild(kart);
    });
}

function detayModalAc(id) {
    const urun = tumUrunler.find(u => u.id === id);
    if (!urun) return;
    
    const modal = document.getElementById('urun-detay-modal');
    const modalDetay = document.getElementById('modal-detay-alani');
    
    modalDetay.innerHTML = `
        <div class="modal-icerik">
            <button class="kapat-btn" onclick="detayModalKapat()">×</button>
            <img src="${urun.gorseller ? urun.gorseller[0] : 'placeholder.jpg'}" style="width:100%; border-radius:15px;">
            <h2>${urun.isim}</h2>
            <p>${urun.aciklama}</p>
            <h3 style="color:#0066cc;">${urun.fiyat}</h3>
            ${urun.dolapLink ? `<a href="${urun.dolapLink}" target="_blank" class="satin-al-btn">Dolap'tan Satın Al</a>` : ''}
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
