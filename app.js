let tumUrunler = [];
let aktifKategori = 'Tümü';
let aktifAltKategori = 'Tümü';

document.addEventListener('DOMContentLoaded', () => {
    urunleriYukle();
});

async function urunleriYukle() {
    try {
        const response = await fetch('./urunler.json');
        if (!response.ok) throw new Error("JSON yüklenemedi");
        tumUrunler = await response.json();
        
        kategorileriOlustur(tumUrunler);
        urunleriEkranaBas(tumUrunler);
    } catch (error) {
        console.error("Hata:", error);
    }
}

function kategorileriOlustur(urunler) {
    const kategoriMenu = document.getElementById('kategori-menusu');
    if (!kategoriMenu) return;

    // Ana kategorileri topla
    const kategoriler = ['Tümü', ...new Set(urunler.map(urun => urun.kategori).filter(Boolean))];

    kategoriMenu.innerHTML = '';

    kategoriler.forEach(kategori => {
        const btn = document.createElement('button');
        btn.className = `kategori-btn ${kategori === aktifKategori ? 'aktif' : ''}`;
        btn.textContent = kategori;
        btn.onclick = () => kategoriDegistir(kategori);
        kategoriMenu.appendChild(btn);
    });

    // Eğer seçilen ana kategorinin alt kategorileri varsa onları da göster
    altKategorileriOlustur(urunler);
}

function altKategorileriOlustur(urunler) {
    // Eski alt kategori menüsü varsa kaldır
    const eskiAltMenu = document.getElementById('alt-kategori-menusu');
    if (eskiAltMenu) eskiAltMenu.remove();

    if (aktifKategori === 'Tümü') return;

    // Seçilen ana kategoriye ait ürünleri bul
    const anaKategoriUrunleri = urunler.filter(u => u.kategori === aktifKategori);
    const altKategoriler = [...new Set(anaKategoriUrunleri.map(u => u.altKategori).filter(Boolean))];

    // Eğer alt kategori yoksa menü açma
    if (altKategoriler.length === 0) return;

    // Alt kategori kapsayıcısını oluştur
    const altMenuContainer = document.createElement('div');
    altMenuContainer.id = 'alt-kategori-menusu';
    altMenuContainer.className = 'kategori-menusu alt-kategori-stili';

    const tumuBtn = document.createElement('button');
    tumuBtn.className = `kategori-btn ${aktifAltKategori === 'Tümü' ? 'aktif' : ''}`;
    tumuBtn.textContent = `Tüm ${aktifKategori}`;
    tumuBtn.onclick = () => altKategoriDegistir('Tümü');
    altMenuContainer.appendChild(tumuBtn);

    altKategoriler.forEach(altKat => {
        const btn = document.createElement('button');
        btn.className = `kategori-btn ${altKat === aktifAltKategori ? 'aktif' : ''}`;
        btn.textContent = altKat;
        btn.onclick = () => altKategoriDegistir(altKat);
        altMenuContainer.appendChild(btn);
    });

    // Ana kategori menüsünün hemen altına ekle
    const kategoriMenu = document.getElementById('kategori-menusu');
    kategoriMenu.parentNode.insertBefore(altMenuContainer, kategoriMenu.nextSibling);
}

function kategoriDegistir(kategori) {
    aktifKategori = kategori;
    aktifAltKategori = 'Tümü'; // Ana kategori değişince alt kategoriyi sıfırla

    kategorileriOlustur(tumUrunler);
    filtreliUrunleriGoster();
}

function altKategoriDegistir(altKategori) {
    aktifAltKategori = altKategori;

    // Alt kategori butonlarının aktiflik durumunu güncelle
    document.querySelectorAll('#alt-kategori-menusu .kategori-btn').forEach(btn => {
        if (btn.textContent === altKategori || (altKategori === 'Tümü' && btn.textContent === `Tüm ${aktifKategori}`)) {
            btn.classList.add('aktif');
        } else {
            btn.classList.remove('aktif');
        }
    });

    filtreliUrunleriGoster();
}

function filtreliUrunleriGoster() {
    let sonuc = tumUrunler;

    if (aktifKategori !== 'Tümü') {
        sonuc = sonuc.filter(urun => urun.kategori === aktifKategori);
    }

    if (aktifAltKategori !== 'Tümü') {
        sonuc = sonuc.filter(urun => urun.altKategori === aktifAltKategori);
    }

    urunleriEkranaBas(sonuc);
}

function urunleriEkranaBas(urunler) {
    const vitrin = document.getElementById('urun-vitrini');
    if (!vitrin) return;
    vitrin.innerHTML = '';
    
    urunler.forEach(urun => {
        let gorsel = (urun.gorseller && urun.gorseller.length > 0) ? urun.gorseller[0] : 'placeholder.jpg';
        
        const kart = document.createElement('div');
        kart.className = 'urun-karti';
        kart.innerHTML = `
            <div class="urun-resim-wrapper" onclick="detayModalAc(${urun.id})">
                <img src="${gorsel}" alt="${urun.isim}" class="urun-resim-tek">
            </div>
            <div class="urun-bilgi-alani" onclick="detayModalAc(${urun.id})">
                <p class="kategori-etiket">${urun.altKategori ? `${urun.kategori} / ${urun.altKategori}` : (urun.kategori || '')}</p>
                <h3 class="urun-isim">${urun.isim || ''}</h3>
                <p class="urun-fiyat">${urun.fiyat || '0 TL'}</p>
            </div>
            <a href="${urun.dolapLink || '#'}" target="_blank" class="satin-al-btn-kucuk">Dolap'tan Satın Al</a>
        `;
        vitrin.appendChild(kart);
    });
}

function detayModalAc(id) {
    const urun = tumUrunler.find(u => u.id === id);
    if (!urun) return;
    
    const modal = document.getElementById('urun-detay-modal');
    const modalDetay = document.getElementById('modal-detay-alani');
    
    const gorseller = (urun.gorseller && urun.gorseller.length > 0) ? urun.gorseller : ['placeholder.jpg'];
    let gorsellerHTML = gorseller.map(img => `<img src="${img}" alt="${urun.isim}" class="modal-gorsel-kucuk">`).join('');
    
    modalDetay.innerHTML = `
        <button class="kapat-btn" onclick="detayModalKapat()">×</button>
        
        <div class="gorsel-galerisi" id="gorsel-slider">
            ${gorsellerHTML}
        </div>
        
        ${gorseller.length > 1 ? `
            <div class="thumbnail-container" id="thumbnail-listesi">
                ${gorseller.map((img, index) => `
                    <img src="${img}" 
                         class="thumbnail-img ${index === 0 ? 'aktif-thumbnail' : ''}" 
                         onclick="thumbnailTiklandi(${index})"
                         alt="Görsel ${index + 1}">
                `).join('')}
            </div>
        ` : ''}

        <div class="modal-metin">
            <h2>${urun.isim}</h2>
            <p class="modal-aciklama">${urun.aciklama || ''}</p>
            <div class="modal-fiyat-alani">
                <p class="fiyat-etiketi">Fiyatı</p>
                <p class="fiyat-degeri">${urun.fiyat}</p>
            </div>
            <a href="${urun.dolapLink}" target="_blank" class="satin-al-btn">Dolap'tan Satın Al</a>
        </div>
    `;

    modal.style.display = "block";

    const slider = document.getElementById('gorsel-slider');
    const thumbnails = document.querySelectorAll('.thumbnail-img');

    if (slider) {
        slider.addEventListener('scroll', () => {
            const index = Math.round(slider.scrollLeft / slider.offsetWidth);
            thumbnails.forEach((thumb, i) => {
                if (i === index) {
                    thumb.classList.add('aktif-thumbnail');
                    thumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
                } else {
                    thumb.classList.remove('aktif-thumbnail');
                }
            });
        });
    }
}

function thumbnailTiklandi(index) {
    const slider = document.getElementById('gorsel-slider');
    if (slider) {
        slider.scrollTo({
            left: slider.offsetWidth * index,
            behavior: 'smooth'
        });
    }
}

function detayModalKapat() {
    const modal = document.getElementById('urun-detay-modal');
    if (modal) {
        modal.style.display = "none";
    }
}

window.onclick = function(event) {
    const modal = document.getElementById('urun-detay-modal');
    if (event.target === modal) {
        detayModalKapat();
    }
}
