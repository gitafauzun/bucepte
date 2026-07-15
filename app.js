let tumUrunler = [];
let aktifKategori = "Tümü";
let aramaMetni = "";
let siralamaTipi = "varsayilan";

document.addEventListener('DOMContentLoaded', () => {
    urunleriYukle();
    setupStoryEvents();
});

async function urunleriYukle() {
    try {
        const response = await fetch('urunler.json');
        if (!response.ok) throw new Error("urunler.json yüklenemedi!");
        tumUrunler = await response.json();
        kategoriMenuOlustur(tumUrunler);
        urunleriGuncelle(); 
    } catch (error) {
        console.error("Hata:", error);
    }
}

// --- FİLTRELEME VE GÜNCELLEME ---
function urunleriGuncelle() {
    let filtrelenmis = [...tumUrunler];
    
    if (aktifKategori !== "Tümü") {
        filtrelenmis = filtrelenmis.filter(u => u.kategori === aktifKategori);
    }
    if (aramaMetni !== "") {
        filtrelenmis = filtrelenmis.filter(u => u.isim && u.isim.toLowerCase().includes(aramaMetni));
    }
    
    // Fiyat sıralama mantığı
    const fiyatNum = (fiyatStr) => {
        if (!fiyatStr) return 0;
        return parseFloat(fiyatStr.toString().replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
    };

    if (siralamaTipi === "artan") filtrelenmis.sort((a, b) => fiyatNum(a.fiyat) - fiyatNum(b.fiyat));
    else if (siralamaTipi === "azalan") filtrelenmis.sort((a, b) => fiyatNum(b.fiyat) - fiyatNum(a.fiyat));

    urunleriEkranaBas(filtrelenmis);
}

// --- EKRANA BASMA (RENDER) ---
function urunleriEkranaBas(urunler) {
    const vitrin = document.getElementById('urun-vitrini');
    if (!vitrin) return;
    vitrin.innerHTML = '';
    
    if (urunler.length === 0) {
        vitrin.innerHTML = `<p style="text-align:center; grid-column:1/-1;">Ürün bulunamadı.</p>`;
        return;
    }
    
    const favoriler = JSON.parse(localStorage.getItem('favoriler') || '[]');
    
    urunler.forEach(urun => {
        const isFavori = favoriler.includes(urun.id);
        const etiketHTML = urun.etiket ? `<span class="urun-etiket">${urun.etiket}</span>` : '';
        const kalpIkonu = isFavori ? '❤️' : '🤍';
        
        const gorsel = (urun.gorseller && urun.gorseller.length > 0) ? urun.gorseller[0] : 'images/placeholder.png';

        const kart = document.createElement('div');
        kart.className = 'urun-karti';
        kart.innerHTML = `
            ${etiketHTML}
            <button class="favori-btn" onclick="event.stopPropagation(); favoriDegistir(${urun.id})">${kalpIkonu}</button>
            <div class="urun-resim-wrapper" onclick="detayModalAc(${urun.id})">
                <img src="${gorsel}" alt="${urun.isim}" class="urun-resim">
            </div>
            <p style="color:var(--gri-metin); font-size:12px;">${urun.kategori}</p>
            <h3 style="font-size:14px; margin:5px 0;">${urun.isim}</h3>
            <h2 style="color:var(--ana-renk); margin:10px 0;">${urun.fiyat}</h2>
            <a href="${urun.dolapLink}" target="_blank" class="satin-al-btn">Dolap'tan Satın Al</a>
        `;
        vitrin.appendChild(kart);
    });
}

// --- MODAL VE DETAY ---
function detayModalAc(id) {
    const urun = tumUrunler.find(u => u.id === id);
    if (!urun) return;
    
    const modal = document.getElementById('urun-detay-modal');
    const alani = document.getElementById('modal-detay-alani');
    
    let resimlerHTML = urun.gorseller.map(g => `<img src="${g}" class="urun-resim">`).join('');
    
    alani.innerHTML = `
        <div class="modal-detay-tasarim">
            <div class="urun-resim-carousel">${resimlerHTML}</div>
            <h2>${urun.isim}</h2>
            <p>${urun.aciklama || 'Açıklama girilmemiş.'}</p>
            <h3 style="color:var(--ana-renk)">${urun.fiyat}</h3>
            <a href="${urun.dolapLink}" class="satin-al-btn">Satın Al</a>
        </div>
    `;
    modal.style.display = "block";
    document.body.style.overflow = "hidden";
}

function detayModalKapat() {
    document.getElementById('urun-detay-modal').style.display = "none";
    document.body.style.overflow = "auto";
}

// --- HİKAYE (STORY) TIKLAMA OLAYLARI ---
function setupStoryEvents() {
    document.querySelectorAll('.story-item').forEach(item => {
        item.addEventListener('click', function() {
            const secilenEtiket = this.getAttribute('data-etiket');
            if (secilenEtiket === "tümü") {
                aktifKategori = "Tümü";
                urunleriGuncelle();
            } else {
                const filtrelenmis = tumUrunler.filter(u => u.etiket === secilenEtiket);
                urunleriEkranaBas(filtrelenmis);
            }
        });
    });
}

// --- YARDIMCI FONKSİYONLAR ---
function favoriDegistir(id) {
    let favoriler = JSON.parse(localStorage.getItem('favoriler') || '[]');
    if (favoriler.includes(id)) favoriler = favoriler.filter(f => f !== id);
    else favoriler.push(id);
    localStorage.setItem('favoriler', JSON.stringify(favoriler));
    urunleriGuncelle();
}

function kategoriMenuOlustur(urunler) {
    const menu = document.getElementById('kategori-menusu');
    if (!menu) return;
    const kategoriler = ["Tümü", ...new Set(urunler.map(u => u.kategori))];
    kategoriler.forEach(kat => {
        const btn = document.createElement('button');
        btn.textContent = kat;
        btn.className = 'kategori-btn';
        btn.onclick = () => {
            aktifKategori = kat;
            urunleriGuncelle();
        };
        menu.appendChild(btn);
    });
}
