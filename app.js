// Sayfa yüklendiğinde çalışacak ana fonksiyon
async function urunleriGetir() {
    try {
        // 1. JSON dosyasını çek (fetch)
        const yanit = await fetch('urunler.json');
        
        // Eğer dosya bulunamazsa hata fırlat
        if (!yanit.ok) {
            throw new Error(`HTTP hatası! Durum: ${yanit.status}`);
        }

        // 2. Gelen yanıtı JSON formatına çevir
        const urunler = await yanit.json();
        
        // 3. HTML'de ürünleri koyacağımız ana div'i seç
        const vitrin = document.getElementById('urun-vitrini');

        // 4. Her bir ürün için döngü oluştur ve HTML şablonu (template literal) hazırla
        urunler.forEach(urun => {
            const urunKartiHTML = `
                <div class="urun-karti">
                    <img src="${urun.gorsel}" alt="${urun.isim}" style="max-width: 100%; height: auto;">
                    <p style="color: gray; font-size: 12px;">${urun.kategori}</p>
                    <h3>${urun.isim}</h3>
                    <h2 style="color: #333;">${urun.fiyat}</h2>
                    <a href="${urun.dolapLink}" target="_blank" class="satin-al-btn">
                        Dolap'tan Güvenle Al
                    </a>
                </div>
            `;
            
            // 5. Hazırlanan şablonu vitrin div'inin içine ekle
            vitrin.innerHTML += urunKartiHTML;
        });

    } catch (hata) {
        console.error("Ürünler yüklenirken bir hata oluştu:", hata);
        document.getElementById('urun-vitrini').innerHTML = "<p>Ürünler şu an yüklenemiyor. Lütfen daha sonra tekrar deneyin.</p>";
    }
}

// Fonksiyonu tetikle
urunleriGetir();
