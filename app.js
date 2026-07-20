let tumUrunler = [];
let aktifKategori = 'Tümü';
let aktifMarka = 'Tümü';
let aktifModel = 'Tümü';

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

    const kategoriler = ['Tümü', ...new Set(urunler.map(urun => urun.kategori).filter(Boolean))];
    kategoriMenu.innerHTML = '';

    kategoriler.forEach(kategori => {
        const wrapper = document.createElement('div');
        wrapper.className = 'dropdown-wrapper';

        const btn = document.createElement('button');
        btn.className = `kategori-btn ${kategori === aktifKategori ? 'aktif' : ''}`;
        btn.textContent = kategori;
        
        // "Tümü" seçeneği için açılır menü gerekmez
        if (kategori === 'Tümü') {
            btn.onclick = () => {
                kategoriDegistir('Tümü', 'Tümü', 'Tümü');
                dropdownlariKapat();
            };
            wrapper.appendChild(btn);
        } else {
            // Tıklandığında veya üzerine gelindiğinde açılması için
            btn.onclick = (e) => {
                e.stopPropagation();
                dropdownToggle(wrapper);
                kategoriDegistir(kategori, 'Tümü', 'Tümü');
            };
            wrapper.appendChild(btn);

            // Marka ve Modelleri içeren Açılır Pencere (Dropdown Content)
            const dropdownContent = document.createElement('div');
            dropdownContent.className = 'dropdown-content';

            const anaKategoriUrunleri = urunler.filter(u => u.kategori === kategori);
            const markalar = [...new Set(anaKategoriUrunleri.map(u => u.marka).filter(Boolean))];

            markalar.forEach(marka => {
                const markaGrup = document.createElement('div');
                markaGrup.className = 'dropdown-grup';

                const markaBaslik = document.createElement('div');
                markaBaslik.className = 'dropdown-marka-baslik';
                markaBaslik.textContent = marka;
                markaBaslik.onclick = () => {
                    kategoriDegistir(kategori, marka, 'Tümü');
                    dropdownlariKapat();
                };
                markaGrup.appendChild(markaBaslik);

                // Modele göre ayır (Örn: iPhone 13, iPhone 14)
                const markaUrunleri = anaKategoriUrunleri.filter(u => u.marka === marka);
                const modeller = [...new Set(markaUrunleri.map(u => u.model).filter(Boolean))];

                if (modeller.length > 0) {
                    const modelListesi = document.createElement('div');
                    modelListesi.className = 'dropdown-model-listesi';

                    modeller.forEach(model => {
                        const modelItem = document.createElement('span');
                        modelItem.className = 'dropdown-model-item';
                        modelItem.textContent = model;
                        modelItem.onclick = (e) => {
                            e.stopPropagation();
                            kategoriDegistir(kategori, marka, model);
                            dropdownlariKapat();
                        };
                        modelListesi.appendChild(modelItem);
                    });
                    markaGrup.appendChild(modelListesi);
                }

                dropdownContent.appendChild(markaGrup);
            });

            wrapper.appendChild(dropdownContent);
        }

        kategoriMenu.appendChild(wrapper);
    });
}

function dropdownToggle(aktifWrapper) {
    const tumWrapperlar = document.querySelectorAll('.dropdown-wrapper');
    tumWrapperlar.forEach(w => {
        if (w !== aktifWrapper) {
            w.classList.remove('acik');
        }
    });
    aktifWrapper.classList.toggle('acik');
}

function dropdownlariKapat() {
    document.querySelectorAll('.dropdown-wrapper').forEach(w => {
        w.classList.remove('acik');
    });
}

// Sayfa içinde başka bir yere tıklandığında açık menüleri kapat
window.addEventListener('click', (e) => {
    if (!e.target.closest('.dropdown-wrapper')) {
        dropdownlariKapat();
    }
});

function kategoriDegistir(kategori, marka, model) {
    aktifKategori = kategori;
    aktifMarka = marka;
    aktifModel = model;

    filtreliUrunleriGoster();
    
    // Buton aktiflik sınıflarını güncelle
    document.querySelectorAll('.kategori-btn').forEach(btn => {
        if (btn.textContent === kategori) {
            btn.classList.add('aktif');
        } else {
            btn.classList.remove('aktif');
        }
    });
}

function filtreliUrunleriGoster() {
    let sonuc = tumUrunler;

    if (aktifKategori !== 'Tümü') {
        sonuc = sonuc.filter(urun => urun.kategori === aktifKategori);
    }
    if (aktifMarka !== 'Tümü') {
        sonuc = sonuc.filter(urun => urun.marka === aktifMarka);
    }
    if (aktifModel !== 'Tümü') {
        sonuc = sonuc.filter(urun => urun.model === aktifModel);
    }

    urunleriEkranaBas(sonuc);
}

function urunleriEkranaBas(urunler) {
    const vitrin = document.getElementById('urun-vitrini');
    if (!vitrin) return;
    vitrin.innerHTML = '';
    
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
                    <img src="${img}" class="thumbnail-img ${index === 0 ? 'aktif-thumbnail' : ''}" onclick="thumbnailTiklandi(${index})" alt="Görsel ${index + 1}">
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
