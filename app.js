let tumUrunler = [];
const urunlerKapsayici = document.getElementById('urunler'); // Ürünlerin listelendiği div'in id'si
const aramaKutusu = document.getElementById('searchInput');
const aramaButonu = document.getElementById('searchButton');
const kategoriButonlari = document.querySelectorAll('.kategori-btn'); // Kategori butonlarının class'ı

let aktifKategori = 'Tümü';

// 1. Ürünleri JSON'dan Çek
async function urunleriGetir() {
    try {
        const response = await fetch('urunler.json');
        tumUrunler = await response.json();
        ekraniGuncelle();
    } catch (error) {
        console.error("Ürünler yüklenirken hata oluştu:", error);
        urunlerKapsayici.innerHTML = '<p style="text-align:center; color:red;">Ürünler şu an yüklenemiyor. Lütfen sayfayı yenileyin.</p>';
    }
}

// 2. Ekranı Çizme ve Filtreleme İşlemi
function ekraniGuncelle() {
    // Arama kutusundaki metni al, boşlukları sil ve küçük harfe çevir
    const aramaMetni = aramaKutusu.value.trim().toLowerCase();

    // Ürünleri hem kategoriye hem de aramaya göre filtrele
    const filtrelenmisUrunler = tumUrunler.filter(urun => {
        // Kategori kontrolü
        const kategoriUygun = (aktifKategori === 'Tümü') || (urun.kategori === aktifKategori);
        
        // Arama kontrolü (isim, marka veya model içinde geçiyor mu?)
        const aramaUygun = urun.isim.toLowerCase().includes(aramaMetni) || 
                           urun.marka.toLowerCase().includes(aramaMetni) || 
                           urun.model.toLowerCase().includes(aramaMetni);

        return kategoriUygun && aramaUygun;
    });

    // Eğer arama veya filtreleme sonucu ürün bulunamadıysa uyarı göster
    if (filtrelenmisUrunler.length === 0) {
        urunlerKapsayici.innerHTML = `
            <div style="text-align: center; width: 100%; padding: 40px 20px; grid-column: 1 / -1;">
                <h3 style="color: var(--text-color); margin-bottom: 10px;">Sonuç Bulunamadı 😔</h3>
                <p style="color: var(--text-light);">Aramanıza veya seçtiğiniz kategoriye ait ürün bulamadık.</p>
            </div>`;
        return;
    }

    // Ürünler bulunduysa HTML'e dök
    urunlerKapsayici.innerHTML = filtrelenmisUrunler.map(urun => {
        
        // Etiket renklerini json'daki veriye göre ayarla
        let etiketClass = "badge-yeni"; // Varsayılan class
        if(urun.etiket === "indirimde") etiketClass = "badge-indirim";
        if(urun.etiket === "yakında" || urun.etiket === "avantajlı") etiketClass = "badge-dikkat";

        // Fiyat "Stokta yok" ise kırmızı ve bold yap
        let fiyatAlani = urun.fiyat.toLowerCase() === "stokta yok" 
            ? `<span style="color: #ff3b30; font-weight: bold; font-size: 0.9rem;">Stokta Yok</span>` 
            : `${urun.fiyat}`;

        // Dolap linki boşsa butonu pasif yap
        let butonAlani = urun.dolapLink !== "" 
            ? `<a href="${urun.dolapLink}" target="_blank" class="buy-btn">Satın Al</a>`
            : `<button class="buy-btn" style="background: #ccc; cursor: not-allowed; color: #666;" disabled>Tükendi</button>`;

        return `
        <div class="product-card">
            ${urun.etiket ? `<span class="badge ${etiketClass}">${urun.etiket}</span>` : ''}
            <div class="product-image">
                <img src="${urun.gorseller[0]}" alt="${urun.isim}" loading="lazy">
            </div>
            <div class="product-info">
                <span class="category" style="font-size: 0.75rem; color: #888;">${urun.kategori} | ${urun.marka}</span>
                <h3 class="product-title">${urun.isim}</h3>
                <p class="product-desc" style="font-size: 0.85rem; color: #666; margin-bottom: 15px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                    ${urun.aciklama}
                </p>
                <div class="product-bottom" style="display: flex; justify-content: space-between; align-items: center;">
                    <span class="price" style="font-weight: 600;">${fiyatAlani}</span>
                    ${butonAlani}
                </div>
            </div>
        </div>
        `;
    }).join('');
}

// 3. Olay Dinleyicileri (Event Listeners)

// Arama kutusuna klavyeden yazıldıkça anında çalışır (Canlı Arama)
aramaKutusu.addEventListener('input', ekraniGuncelle);

// "Ara" butonuna tıklanırsa çalışır
aramaButonu.addEventListener('click', ekraniGuncelle);

// Kategori butonlarına tıklanma olayları
kategoriButonlari.forEach(buton => {
    buton.addEventListener('click', (e) => {
        // Tüm butonlardan active class'ını kaldır, tıklanana ekle
        kategoriButonlari.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');

        // Butonun içindeki metni (Örn: "Kılıf", "Tümü") aktif kategori yap
        aktifKategori = e.target.textContent.trim();
        
        // Ekranı yeni kategoriye göre güncelle
        ekraniGuncelle();
    });
});

// Sayfa ilk açıldığında ürünleri getir
urunleriGetir();
