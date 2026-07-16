let tumUrunler = [];
let sliderInterval; // Global değişken burada tanımlı

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
    let gorsellerHTML = gorseller.map(img => `<img src="${img}" class="modal-gorsel-kucuk">`).join('');
    
    modalDetay.innerHTML = `
        <button class="kapat-btn" onclick="detayModalKapat()">×</button>
        <div class="gorsel-galerisi" id="gorsel-slider">
            ${gorsellerHTML}
        </div>
        <div class="modal-metin">
            <h2>${urun.isim}</h2>
            <p>${urun.aciklama}</p>
            <h3>${urun.fiyat}</h3>
            <a href="${urun.dolapLink}" target="_blank" class="satin-al-btn">Dolap'tan Satın Al</a>
        </div>
    `;
    modal.style.display = "block";

    // Otomatik Geçiş
    const slider = document.getElementById('gorsel-slider');
    clearInterval(sliderInterval);
    sliderInterval = setInterval(() => {
        if (slider) {
            if (slider.scrollLeft + slider.offsetWidth >= slider.scrollWidth - 10) {
                slider.scrollTo({ left: 0, behavior: 'smooth' });
            } else {
                slider.scrollBy({ left: slider.offsetWidth, behavior: 'smooth' });
            }
        }
    }, 3000);
}

function detayModalKapat() {
    clearInterval(sliderInterval);
    document.getElementById('urun-detay-modal').style.display = "none";
}
