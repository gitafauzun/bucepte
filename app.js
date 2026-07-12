// Global değişkenlerimiz (Filtrelerin durumunu hafızada tutmak için)
let tumUrunler = [];
let aktifKategori = "Tümü";
let aramaMetni = "";
let siralamaTipi = "varsayilan";

// 1. Verileri çekip sayfaya basan ana fonksiyon
async function urunleriYukle() {
    try {
        const response = await fetch('urunler.json');
        tumUrunler = await response.json();
        
        kategoriMenuOlustur(tumUrunler);
        urunleriGuncelle(); // Ürünleri ekrana basan merkezi fonksiyon
    } catch (error) {
        console.error("Ürünler yüklenirken hata oluştu:", error);
    }
}

// 2. Kategorileri buton olarak oluşturan fonksiyon
function kategoriMenuOlustur(urunler) {
    const menu = document.getElementById('kategori-menusu');
    const kategoriler = ["Tümü", ...new Set(urunler.map(u => u.kategori))];
    
    kategoriler.forEach(kat => {
        const btn = document.createElement('button');
        btn.textContent = kat;
        btn.className = 'kategori-btn';
        
        // İlk açılışta "Tümü" butonunu aktif yap
        if(kat === "Tümü") btn.classList.add('aktif');

        btn.onclick = (e) => {
            document.querySelectorAll('.kategori-btn').forEach(b => b.classList.remove('aktif'));
            e.target.classList.add('aktif');
            
            aktifKategori = kat; // Seçilen kategoriyi güncelle
            urunleriGuncelle();  // Ekranı yenile
        };
        menu.appendChild(btn);
    });
}

// --- YENİ: ARAMA VE SIRALAMA DİNLEYİCİLERİ ---
document.getElementById('arama-kutusu').addEventListener('input', (e) => {
    aramaMetni = e.target.value.toLowerCase();
    urunleriGuncelle();
});

document.getElementById('siralama-kutusu').addEventListener('change', (e) => {
    siralamaTipi = e.target.value;
    urunleriGuncelle();
});

// 3. Merkezi Filtreleme ve Sıralama Fonksiyonu (Tüm filtreleri aynı anda uygular)
function urunleriGuncelle() {
    let filtrelenmis = tumUrunler;

    // A) Kategoriye göre filtrele
    if (aktifKategori !== "Tümü") {
        filtrelenmis = filtrelenmis.filter(u => u.kategori === aktifKategori);
    }

    // B) Arama metnine göre filtrele
    if (aramaMetni !== "") {
        filtrelenmis = filtrelenmis.filter(u => u.isim.toLowerCase().includes(aramaMetni));
    }

    // C) Fiyata göre sırala
    // Not: "320 TL" gibi metinlerin içindeki sayıyı parseFloat ile ayrıştırıyoruz.
    if (siralamaTipi === "artan") {
        filtrelenmis.sort((a, b) => parseFloat(a.fiyat) - parseFloat(b.fiyat));
    } else if (siralamaTipi === "azalan") {
        filtrelenmis.sort((a, b) => parseFloat(b.fiyat) - parseFloat(a.fiyat));
    }

    urunleriEkranaBas(filtrelenmis);
}

// 4. Kartları HTML'e basan fonksiyon
function urunleriEkranaBas(urunler) {
    const vitrin = document.getElementById('urun-vitrini');
    vitrin.innerHTML = '';
    
    // Favorileri yerel hafızadan al
    const favoriler = JSON.parse(localStorage.getItem('favoriler') || '[]');
    
    urunler.forEach(urun => {
        const isFavori = favoriler.includes(urun.id);
        const kart = document.createElement('div');
        kart.className = 'urun-karti';
        
        // GÜNCELLEME: Eğer urun.etiket tanımlıysa (undefined değilse) etiketHTML'i oluştur
        const etiketHTML = (urun.etiket && urun.etiket.trim() !== "") 
            ? `<span class="urun-etiket">${urun.etiket}</span>` 
            : '';
        
        kart.innerHTML = `
            ${etiketHTML}
            <button class="favori-btn ${isFavori ? 'aktif' : ''}" onclick="favoriDegistir(${urun.id})">
                ❤️
            </button>
            <img src="${urun.gorsel}" alt="${urun.isim}">
            <p style="color:var(--gri-metin); font-size:14px;">${urun.kategori}</p>
            <h3 style="margin: 10px 0; font-size:16px;">${urun.isim}</h3>
            <h2 style="color:var(--ana-renk); margin-bottom:15px;">${urun.fiyat}</h2>
            <a href="${urun.dolapLink}" target="_blank" class="satin-al-btn">Dolap'tan Satın Al</a>
        `;
        vitrin.appendChild(kart);
    });
}

// Favori ekleme/çıkarma fonksiyonu
function favoriDegistir(id) {
    let favoriler = JSON.parse(localStorage.getItem('favoriler') || '[]');
    if (favoriler.includes(id)) {
        favoriler = favoriler.filter(fId => fId !== id);
    } else {
        favoriler.push(id);
    }
    localStorage.setItem('favoriler', JSON.stringify(favoriler));
    urunleriGuncelle(); // Ekranı tazele
}

// Sayfa yüklendiğinde başlat
urunleriYukle();
