let tumUrunler = [];
let aktifKategori = 'Tümü';
let aktifMarka = 'Tümü';
let aktifModel = 'Tümü';
let aktifAramaMetni = ''; // Arama metnini tutacak değişken

document.addEventListener('DOMContentLoaded', () => {
    urunleriYukle();

    // Arama kutusuna her harf yazıldığında canlı arama yapılması
    const aramaKutusu = document.getElementById('searchInput');
    if (aramaKutusu) {
        aramaKutusu.addEventListener('input', (e) => {
            aktifAramaMetni = e.target.value.trim().toLowerCase();
            filtreliUrunleriGoster();
        });
    }

    // Arama butonuna tıklandığında filtrelemeyi tetikle
    const aramaButonu = document.getElementById('searchButton');
    if (aramaButonu) {
        aramaButonu.addEventListener('click', () => {
            if (aramaKutusu) {
                aktifAramaMetni = aramaKutusu.value.trim().toLowerCase();
                filtreliUrunleriGoster();
            }
        });
    }
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

    markalariOlustur(urunler);
}

function markalariOlustur(urunler) {
    const eskiMarkaMenu = document.getElementById('marka-kategori-menusu');
    if (eskiMarkaMenu) eskiMarkaMenu.remove();

    const eskiModelMenu = document.getElementById('model-kategori-menusu');
    if (eskiModelMenu) eskiModelMenu.remove();

    if (aktifKategori === 'Tümü') return;

    // Seçilen ana kategoriye ait ürünleri bul
    const anaKategoriUrunleri = urunler.filter(u => u.kategori === aktifKategori);
    const markalar = [...new Set(anaKategoriUrunleri.map(u => u.marka).filter(Boolean))];

    if (markalar.length === 0) return;

    const markaMenuContainer = document.createElement('div');
    markaMenuContainer.id = 'marka-kategori-menusu';
    markaMenuContainer.className = 'kategori-menusu alt-kategori-stili';

    const tumuBtn = document.createElement('button');
    tumuBtn.className = `kategori-btn ${aktifMarka === 'Tümü' ? 'aktif' : ''}`;
    tumuBtn.textContent = `Tüm ${aktifKategori}`;
    tumuBtn.onclick = () => markaDegistir('Tümü');
    markaMenuContainer.appendChild(tumuBtn);

    markalar.forEach(marka => {
        const btn = document.createElement('button');
        btn.className = `kategori-btn ${marka === aktifMarka ? 'aktif' : ''}`;
        btn.textContent = marka;
        btn.onclick = () => markaDegistir(marka);
        markaMenuContainer.appendChild(btn);
    });

    const kategoriMenu = document.getElementById('kategori-menusu');
    kategoriMenu.parentNode.insertBefore(markaMenuContainer, kategoriMenu.nextSibling);

    modelleriOlustur(urunler);
}

function modelleriOlustur(urunler) {
    const eskiModelMenu = document.getElementById('model-kategori-menusu');
    if (eskiModelMenu) eskiModelMenu.remove();

    if (aktifMarka === 'Tümü') return;

    // Seçilen ana kategori ve markaya ait ürünleri bul
    const markaUrunleri = urunler.filter(u => u.kategori === aktifKategori && u.marka === aktifMarka);
    const modeller = [...new Set(markaUrunleri.map(u => u.model).filter(Boolean))];

    if (modeller.length === 0) return;

    const modelMenuContainer = document.createElement('div');
    modelMenuContainer.id = 'model-kategori-menusu';
    modelMenuContainer.className = 'kategori-menusu alt-kategori-stili model-alt-kategori';

    const tumuBtn = document.createElement('button');
    tumuBtn.className = `kategori-btn ${aktifModel === 'Tümü' ? 'aktif' : ''}`;
    tumuBtn.textContent = `Tüm ${aktifMarka}`;
    tumuBtn.onclick = () => modelDegistir('Tümü');
    modelMenuContainer.appendChild(tumuBtn);

    modeller.forEach(model => {
        const btn = document.createElement('button');
        btn.className = `kategori-btn ${model === aktifModel ? 'aktif' : ''}`;
        btn.textContent = model;
        btn.onclick = () => modelDegistir(model);
        modelMenuContainer.appendChild(btn);
    });

    const markaMenu = document.getElementById('marka-kategori-menusu');
    markaMenu.parentNode.insertBefore(modelMenuContainer, markaMenu.nextSibling);
}

function kategoriDegistir(kategori) {
    aktifKategori = kategori;
    aktifMarka = 'Tümü';
    aktifModel = 'Tümü';

    kategorileriOlustur(tumUrunler);
    filtreliUrunleriGoster();
}

function markaDegistir(marka) {
    aktifMarka = marka;
    aktifModel = 'Tümü';

    document.querySelectorAll('#marka-kategori-menusu .kategori-btn').forEach(btn => {
        if (btn.textContent === marka || (marka === 'Tümü' && btn.textContent === `Tüm ${aktifKategori}`)) {
            btn.classList.add('aktif');
        } else {
            btn.classList.remove('aktif');
        }
    });

    modelleriOlustur(tumUrunler);
    filtreliUrunleriGoster();
}

function modelDegistir(model) {
    aktifModel = model;

    document.querySelectorAll('#model-kategori-menusu .kategori-btn').forEach(btn => {
        if (btn.textContent === model || (model === 'Tümü' && btn.textContent === `Tüm ${aktifMarka}`)) {
            btn.classList.add('aktif');
        } else {
            btn.classList.remove('aktif');
        }
    });

    filtreliUrunleriGoster();
}

function filtreliUrunleriGoster() {
    let sonuc = tumUrunler;

    // Kategori Filtresi
    if (aktifKategori !== 'Tümü') {
        sonuc = sonuc.filter(urun => urun.kategori === aktifKategori);
    }

    // Marka Filtresi
    if (aktifMarka !== 'Tümü') {
        sonuc = sonuc.filter(urun => urun.marka === aktifMarka);
    }

    // Model Filtresi
    if (aktifModel !== 'Tümü') {
        sonuc = sonuc.filter(urun => urun.model === aktifModel);
    }

    // Arama Filtresi (İsim, marka, model veya açıklama içinde arama yapar)
    if (aktifAramaMetni !== '') {
        sonuc = sonuc.filter(urun => {
            const isim = (urun.isim || '').toLowerCase();
            const marka = (urun.marka || '').toLowerCase();
            const model = (urun.model || '').toLowerCase();
            const aciklama = (urun.aciklama || '').toLowerCase();

            return isim.includes(aktifAramaMetni) || 
                   marka.includes(aktifAramaMetni) || 
                   model.includes(aktifAramaMetni) || 
                   aciklama.includes(aktifAramaMetni);
        });
    }

    urunleriEkranaBas(sonuc);
}

function urunleriEkranaBas(urunler) {
    const vitrin = document.getElementById('urun-vitrini');
    if (!vitrin) return;
    vitrin.innerHTML = '';
    
    // Eğer arama veya filtreleme sonucunda ürün bulunamazsa şık bir mesaj gösterelim
    if (urunler.length === 0) {
        vitrin.innerHTML = `
            <div style="text-align: center; width: 100%; padding: 40px 20px; grid-column: 1 / -1;">
                <h3 style="color: var(--text-color, #333); margin-bottom: 10px;">Sonuç Bulunamadı 😔</h3>
                <p style="color: var(--text-light, #666);">Aramanıza veya seçtiğiniz filtrelere ait ürün bulamadık.</p>
            </div>`;
        return;
    }

    urunler.forEach(urun => {
        let gorsel = (urun.gorseller && urun.gorseller.length > 0) ? urun.gorseller[0] : 'placeholder.jpg';
        
        let etiketMetin = urun.kategori || '';
        if (urun.marka) etiketMetin += ` / ${urun.marka}`;
        if (urun.model) etiketMetin += ` / ${urun.model}`;

        const kart = document.createElement('div');
        kart.className = 'urun-karti';
        kart.innerHTML = `
            <div class="urun-resim-wrapper" onclick="detayModalAc(${urun.id})">
                <img src="${gorsel}" alt="${urun.isim}" class="urun-resim-tek">
            </div>
            <div class="urun-bilgi-alani" onclick="detayModalAc(${urun.id})">
                <p class="kategori-etiket">${etiketMetin}</p>
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
