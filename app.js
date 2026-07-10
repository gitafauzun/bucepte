// Tüm ürünleri hafızada tutacağımız global değişken
let tumUrunler = []; 

// 1. UYGULAMAYI BAŞLATAN ANA FONKSİYON
async function uygulamayiBaslat() {
    try {
        const yanit = await fetch('urunler.json');
        
        if (!yanit.ok) throw new Error("Veri çekilemedi!");

        tumUrunler = await yanit.json();
        
        kategorileriOlustur(tumUrunler);
        urunleriEkranaBas(tumUrunler); // Sayfa ilk açıldığında tüm ürünleri göster

    } catch (hata) {
        console.error("Hata:", hata);
        document.getElementById('urun-vitrini').innerHTML = "<p>Ürünler yüklenemedi.</p>";
    }
}

// 2. ÜRÜNLERİ VİTRİNE ÇİZEN FONKSİYON
function urunleriEkranaBas(urunListesi) {
    const vitrin = document.getElementById('urun-vitrini');
    vitrin.innerHTML = ''; // Yeni ürünleri basmadan önce vitrini temizle
    
    // Eğer o kategoride ürün yoksa
    if(urunListesi.length === 0) {
        vitrin.innerHTML = "<p>Bu kategoride henüz ürün bulunmuyor.</p>";
        return;
    }

    urunListesi.forEach(urun => {
        const urunKartiHTML = `
            <div class="urun-karti">
                <img src="${urun.gorsel}" alt="${urun.isim}" style="max-width: 100%; height: auto;">
                <p style="color: gray; font-size: 12px; margin-bottom: 5px;">${urun.kategori}</p>
                <h3>${urun.isim}</h3>
                <h2 style="color: #333;">${urun.fiyat}</h2>
                <a href="${urun.dolapLink}" target="_blank" class="satin-al-btn">
                    Dolap'tan Güvenle Al
                </a>
            </div>
        `;
        vitrin.innerHTML += urunKartiHTML;
    });
}

// 3. DİNAMİK KATEGORİ MENÜSÜNÜ OLUŞTURAN FONKSİYON
function kategorileriOlustur(urunListesi) {
    const menu = document.getElementById('kategori-menusu');
    
    // Set() nesnesi ile tekrar eden kategorileri tekilleştiririz (Örn: 5 tane "Kılıf" varsa 1 tane alır)
    const benzersizKategoriler = ["Tümü", ...new Set(urunListesi.map(urun => urun.kategori))];
    
    benzersizKategoriler.forEach(kategori => {
        const buton = document.createElement('button');
        buton.classList.add('kategori-btn');
        buton.textContent = kategori;
        
        // Sayfa ilk açıldığında "Tümü" butonu aktif görünsün
        if(kategori === "Tümü") {
            buton.classList.add('aktif');
        }
        
        // Butona tıklama olayı ekle
        buton.addEventListener('click', () => {
            // Önce tüm butonlardaki "aktif" sınıfını kaldır, sonra sadece tıklanana ekle
            document.querySelectorAll('.kategori-btn').forEach(btn => btn.classList.remove('aktif'));
            buton.classList.add('aktif');
            
            // Listeyi filtrele ve ekrana bas
            if (kategori === "Tümü") {
                urunleriEkranaBas(tumUrunler); // Orijinal tam listeyi ver
            } else {
                const filtrelenmis = tumUrunler.filter(urun => urun.kategori === kategori);
                urunleriEkranaBas(filtrelenmis); // Sadece eşleşenleri ver
            }
        });
        
        menu.appendChild(buton);
    });
}

// İşlemleri başlat
uygulamayiBaslat();
