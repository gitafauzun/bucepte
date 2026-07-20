let tumUrunler = [];

document.addEventListener('DOMContentLoaded', () => {
    urunleriYukle();
});

async function urunleriYukle() {
    try {
        const response = await fetch('./urunler.json');
        if (!response.ok) throw new Error("JSON yüklenemedi");
        tumUrunler = await response.json();
        urunleriEkranaBas(tumUrunler);
    } catch (error) {
        console.error("Hata:", error);
    }
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
                <p class="kategori-etiket">${urun.kategori || ''}</p>
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

    // Slider ve Thumbnail Senkronizasyonu
    const slider = document.getElementById('gorsel-slider');
    const thumbnails = document.querySelectorAll('.thumbnail-img');

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

function thumbnailTiklandi(index) {
    const slider = document.getElementById('gorsel-slider');
    slider.scrollTo({
        left: slider.offsetWidth * index,
        behavior: 'smooth'
    });
}

function detayModalKapat() {
    document.getElementById('urun-detay-modal').style.display = "none";
}

window.onclick = function(event) {
    const modal = document.getElementById('urun-detay-modal');
    if (event.target == modal) {
        detayModalKapat();
    }
}
