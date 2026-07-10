// 1. Verileri çekip sayfaya basan ana fonksiyon
async function urunleriYukle() {
    const response = await fetch('urunler.json');
    const urunler = await response.json();
    
    // Kategori menüsünü ve ürünleri ilk açılışta yükle
    kategoriMenuOlustur(urunler);
    urunleriEkranaBas(urunler);
}

// 2. Kategorileri buton olarak oluşturan fonksiyon
function kategoriMenuOlustur(urunler) {
    const menu = document.getElementById('kategori-menusu');
    // JSON'daki benzersiz kategorileri al
    const kategoriler = ["Tümü", ...new Set(urunler.map(u => u.kategori))];
    
    kategoriler.forEach(kat => {
        const btn = document.createElement('button');
        btn.textContent = kat;
        btn.className = 'kategori-btn';
        btn.onclick = (e) => {
            // Aktif buton görseli
            document.querySelectorAll('.kategori-btn').forEach(b => b.classList.remove('aktif'));
            e.target.classList.add('aktif');
            // Filtreleme
            urunleriFiltrele(kat, urunler);
        };
        menu.appendChild(btn);
    });
}

// 3. Filtreleme fonksiyonu
function urunleriFiltrele(kategori, urunler) {
    const filtrelenmis = kategori === "Tümü" ? urunler : urunler.filter(u => u.kategori === kategori);
    urunleriEkranaBas(filtrelenmis);
}

// 4. Kartları HTML'e basan fonksiyon
function urunleriEkranaBas(urunler) {
    const vitrin = document.getElementById('urun-vitrini');
    vitrin.innerHTML = '';
    
    urunler.forEach(urun => {
        const kart = document.createElement('div');
        kart.className = 'urun-karti';
        kart.innerHTML = `
            <img src="${urun.gorsel}" alt="${urun.isim}">
            <p>${urun.kategori}</p>
            <h3>${urun.isim}</h3>
            <h2>${urun.fiyat}</h2>
            <a href="${urun.dolapLink}" target="_blank" class="satin-al-btn">Dolap'tan Satın Al</a>
        `;
        vitrin.appendChild(kart);
    });
}

// Sayfa yüklendiğinde başlat
urunleriYukle();
